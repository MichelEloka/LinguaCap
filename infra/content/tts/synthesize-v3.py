"""Produit les MP3 V3/V4 et des niveaux B à partir des scripts compilés et des extraits natifs.

Les enregistrements natifs sont tirés des MP3 de la V2 de référence (content/base/de/media/audio), ralentis sans
changer la hauteur (atempo) selon le profil du niveau ; ceux des niveaux B (« native.file » commençant par « libre/ »)
sont lus sous resource-langue/libre (fichiers téléchargés sous licence libre, registre content/b/libre/registre.json),
découpés (« clip »), normalisés (loudnorm) et convertis par ffmpeg, sans réseau. Les sons marqués « segments: true »
(lexique d'un module) reçoivent dans le manifeste un segment { start, end } par réplique prononcée. Sortie mono.

Voix : les quatre voix de base (Kerstin, Thorsten) et celles de infra/content/tts/voices.json (modèle Piper et, pour un
modèle à plusieurs locuteurs comme « mls », numéro de locuteur). Sans ce fichier, frau2/frau3 sont lues par Kerstin et
mann2/mann3 par Thorsten (repli signalé). L'empreinte d'un son qui n'emploie que les voix de base est celle de la V4 :
les sons A1/A2 déjà produits ne sont pas refaits.

Usage dans le conteneur linguacap-tts-v3 :
  python -B infra/content/tts/synthesize-v3.py --content /repo/content/de [--level a1 b1] [--only clé …] [--force] [--dry-run]
  --dry-run : liste les sons à produire (empreinte changée ou fichier absent) sans rien écrire.
"""
import argparse
from concurrent.futures import ProcessPoolExecutor
from dataclasses import dataclass
from functools import lru_cache
import hashlib
import json
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import wave

import numpy as np
import onnxruntime
from piper import PiperVoice
from piper.config import PiperConfig, SynthesisConfig


REPOSITORY = Path(__file__).resolve().parents[3]
ORIGINAL_AUDIO = REPOSITORY / "content" / "base" / "de" / "media" / "audio"
# Fichiers téléchargés sous licence libre : « libre/<source>/<fichier> » → resource-langue/libre/<source>/<fichier>.
RESOURCES = REPOSITORY / "resource-langue"
VOICES_FILE = Path(__file__).resolve().parent / "voices.json"
VOICES_DIR = Path("/voices")
LEVEL_ID = re.compile(r"^[abc][12]$")
RATE = 22050
# Débits MP3 mono : voix de synthèse (22,05 kHz) et enregistrements natifs ralentis (44,1 kHz).
SPEECH_BITRATE = "48k"
NATIVE_BITRATE = "64k"
# Marges autour d'un segment du lexique : délai de l'encodeur MP3 et fin de souffle.
SEGMENT_LEAD = 0.05
SEGMENT_TAIL = 0.12


@dataclass(frozen=True)
class Profile:
    length_scale: float
    line_gap: float
    native_tempo: float


PROFILES = {
    "a1-alphabet": Profile(1.38, 0.50, 0.84),
    "a1-debut": Profile(1.32, 0.45, 0.88),
    # EVO-040 : toutes les voix A1 sont ralenties, y compris en fin de niveau (synthèse et enregistrements natifs).
    "a1-suite": Profile(1.30, 0.45, 0.88),
    "a2-debut": Profile(1.10, 0.37, 0.95),
    "a2-suite": Profile(1.04, 0.35, 1.0),
    # Niveaux B : débit naturel (plan « Cours B1 et B2 complets », §3.5) ; lexique un peu plus posé.
    "b1-debut": Profile(1.03, 0.30, 1.0),
    "b1-suite": Profile(1.00, 0.27, 1.0),
    "b1-lexique": Profile(1.10, 0.30, 1.0),
    "b2-debut": Profile(1.00, 0.25, 1.0),
    "b2-suite": Profile(0.97, 0.23, 1.0),
    "b2-lexique": Profile(1.05, 0.28, 1.0),
}
# Voix de base de la V3/V4. Ce dictionnaire entre tel quel dans l'empreinte des sons qui n'emploient que ces voix : il ne
# change pas, pour que les sons A1/A2 déjà produits ne soient pas refaits.
BASE_VOICES = {
    "frau": "de_DE-kerstin-medium",
    "sprecherin": "de_DE-kerstin-medium",
    "mann": "de_DE-thorsten-medium",
    "sprecher": "de_DE-thorsten-medium",
}
FALLBACK_VOICES = {"frau2": "frau", "frau3": "frau", "mann2": "mann", "mann3": "mann"}


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def load_voices():
    """Voix connues : nom → { model, speaker? } ; voices.json complète (ou redéfinit) les voix de base."""
    voices = {name: {"model": model} for name, model in BASE_VOICES.items()}
    if not VOICES_FILE.is_file():
        for name, base in FALLBACK_VOICES.items():
            voices[name] = dict(voices[base])
        return voices, False
    for name, value in read_json(VOICES_FILE).items():
        if name.startswith("_") or not isinstance(value, dict) or not isinstance(value.get("model"), str):
            continue
        voice = {"model": value["model"]}
        speaker = value.get("speaker")
        if isinstance(speaker, int) and not isinstance(speaker, bool):
            voice["speaker"] = speaker
        # Décalage de hauteur à débit constant (0,85 à 1,15) : un second personnage tiré d'une voix fiable.
        pitch = value.get("pitch")
        if isinstance(pitch, (int, float)) and not isinstance(pitch, bool) and pitch != 1:
            if not 0.85 <= pitch <= 1.15:
                raise ValueError(f"{name} : hauteur {pitch} hors de 0,85 à 1,15 (voices.json)")
            voice["pitch"] = float(pitch)
        voices[name] = voice
    return voices, True


VOICES, VOICES_CONFIGURED = load_voices()


def voice_label(name):
    voice = VOICES[name]
    label = voice["model"] if "speaker" not in voice else f"{voice['model']}#{voice['speaker']}"
    return label if "pitch" not in voice else f"{label}^{voice['pitch']:g}"


def legacy_voices(item):
    """Vrai si le son n'emploie que les voix de base avec leur modèle d'origine (empreinte V4 inchangée)."""
    names = {line["voice"] for line in item["script"] if "voice" in line}
    return all(name in BASE_VOICES and VOICES.get(name) == {"model": BASE_VOICES[name]} for name in names)


def audio_items(document, default_profile):
    for item in document.get("media", []):
        if item.get("kind") != "audio":
            continue
        profile_name = item.get("audioProfile", default_profile)
        if profile_name.startswith("a1-") and any(
                marker in item["key"] for marker in ("-alphabet-", "-abc-", "-buchstabe")):
            profile_name = "a1-alphabet"
        yield item, profile_name


def available_levels(content):
    """Niveaux construits : dossiers a1 … c2 qui ont un level.json."""
    if not content.is_dir():
        return []
    return [directory.name for directory in sorted(content.iterdir())
            if directory.is_dir() and LEVEL_ID.match(directory.name) and (directory / "level.json").is_file()]


def content_audio(content, levels):
    for level in levels:
        directory = content / level
        document = read_json(directory / "level.json")
        for entry in document["modules"]:
            module = read_json(directory / entry["file"])
            yield from audio_items(module, module["audioProfile"])
        yield from audio_items(document, f"{level}-suite")


def filename(key):
    if not key or not key.isascii() or not all(char.isalnum() or char in "-_" for char in key):
        raise ValueError(f"Clé média non valide : {key!r}")
    return f"{key}.mp3"


def is_libre(item):
    return ((item.get("native") or {}).get("file") or "").startswith("libre/")


def native_source(item):
    """Fichier source d'un enregistrement natif : téléchargement « libre/… » ou MP3 de la V2 de référence."""
    if is_libre(item):
        file = item["native"]["file"]
        if ".." in Path(file).parts:
            raise ValueError(f"{item['key']} : chemin source non valide {file!r}")
        return RESOURCES / file
    return ORIGINAL_AUDIO / filename(item.get("v3SourceKey") or item["key"])


def sha256_file(path):
    with path.open("rb") as handle:
        return hashlib.file_digest(handle, "sha256").hexdigest()


@lru_cache(maxsize=None)
def voice_digest(model):
    return tuple(sha256_file(VOICES_DIR / (model + extension)) for extension in (".onnx", ".onnx.json"))


def fingerprint(item, profile, source):
    if source and is_libre(item):
        data = ("v3-libre-1", NATIVE_BITRATE, profile.native_tempo, item["native"].get("clip"), sha256_file(source))
    elif source:
        data = ("v3-native-2", NATIVE_BITRATE, profile.native_tempo, sha256_file(source))
    elif legacy_voices(item):
        # Empreinte V4 inchangée (voix de base) : les sons déjà produits restent valables.
        models = {BASE_VOICES[line["voice"]] for line in item["script"] if "voice" in line}
        data = ("v3-piper-2", SPEECH_BITRATE, bool(item.get("segments")), profile.length_scale, profile.line_gap,
                item["script"], BASE_VOICES, {model: voice_digest(model) for model in sorted(models)})
    else:
        names = sorted({line["voice"] for line in item["script"] if "voice" in line})
        models = {VOICES[name]["model"] for name in names}
        data = ("v3-piper-3", SPEECH_BITRATE, bool(item.get("segments")), profile.length_scale, profile.line_gap,
                item["script"], {name: VOICES[name] for name in names},
                {model: voice_digest(model) for model in sorted(models)})
    return hashlib.sha256(json.dumps(data, sort_keys=True, ensure_ascii=False).encode("utf-8")).hexdigest()


@lru_cache(maxsize=None)
def load_voice(model):
    options = onnxruntime.SessionOptions()
    options.intra_op_num_threads = 2
    options.inter_op_num_threads = 1
    session = onnxruntime.InferenceSession(str(VOICES_DIR / f"{model}.onnx"), sess_options=options,
                                            providers=["CPUExecutionProvider"])
    config = PiperConfig.from_dict(read_json(VOICES_DIR / f"{model}.onnx.json"))
    if config.sample_rate != RATE:
        raise ValueError(f"{model} : fréquence attendue de {RATE} Hz")
    return PiperVoice(session=session, config=config)


def silence(seconds):
    return np.zeros(round(RATE * seconds), dtype=np.int16)


def shift_pitch(audio, pitch, scratch):
    """Hauteur multipliée par pitch, durée inchangée (asetrate puis atempo inverse) : timbre d'un autre personnage."""
    source, shifted = scratch / "line.wav", scratch / "line-pitch.wav"
    with wave.open(str(source), "wb") as handle:
        handle.setparams((1, 2, RATE, 0, "NONE", "not compressed"))
        handle.writeframes(audio.tobytes())
    subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-y", "-i", str(source),
         "-af", f"asetrate={RATE * pitch:.0f},aresample={RATE},atempo={1 / pitch:.6f}",
         "-ar", str(RATE), "-ac", "1", "-c:a", "pcm_s16le", str(shifted)],
        check=True,
    )
    with wave.open(str(shifted), "rb") as handle:
        return np.frombuffer(handle.readframes(handle.getnframes()), dtype=np.int16)


def render_speech(item, profile, scratch, target):
    """Synthèse réplique par réplique ; renvoie les bornes (secondes) de chaque réplique prononcée."""
    pieces = [silence(0.25)]
    samples = len(pieces[0])
    bounds = []
    previous_was_line = False
    for line in item["script"]:
        if "pause" in line:
            pieces.append(silence(line["pause"]))
            samples += len(pieces[-1])
            previous_was_line = False
            continue
        if previous_was_line:
            pieces.append(silence(profile.line_gap))
            samples += len(pieces[-1])
        voice_config = VOICES[line["voice"]]
        voice = load_voice(voice_config["model"])
        if "speaker" in voice_config:
            config = SynthesisConfig(length_scale=profile.length_scale, speaker_id=voice_config["speaker"])
        else:
            config = SynthesisConfig(length_scale=profile.length_scale)
        start = samples
        spoken = np.concatenate([chunk.audio_int16_array
                                 for chunk in voice.synthesize(line.get("say") or line["text"], syn_config=config)])
        if "pitch" in voice_config:
            spoken = shift_pitch(spoken, voice_config["pitch"], scratch)
        pieces.append(spoken)
        samples += len(spoken)
        bounds.append((start / RATE, samples / RATE))
        previous_was_line = True
    pieces.append(silence(0.35))
    wav = scratch / "joined.wav"
    with wave.open(str(wav), "wb") as handle:
        handle.setparams((1, 2, RATE, 0, "NONE", "not compressed"))
        handle.writeframes(np.concatenate(pieces).tobytes())
    subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-y", "-i", str(wav), "-af", "loudnorm=I=-18:TP=-2:LRA=9",
         "-ar", str(RATE), "-ac", "1", "-c:a", "libmp3lame", "-b:a", SPEECH_BITRATE, str(target)],
        check=True,
    )
    return bounds


def segments_of(bounds, seconds):
    """Segments du lexique : une réplique par segment, avec une marge qui ne déborde pas sur la suivante."""
    result = []
    for index, (start, end) in enumerate(bounds):
        following = bounds[index + 1][0] if index + 1 < len(bounds) else seconds
        result.append({"start": round(max(0.0, start - SEGMENT_LEAD), 3),
                       "end": round(min(seconds, end + SEGMENT_TAIL, max(end, following - SEGMENT_LEAD)), 3)})
    return result


def render_native(source, tempo, target):
    if tempo == 1.0:
        shutil.copyfile(source, target)
        return
    subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-y", "-i", str(source), "-map", "0:a:0",
         "-af", f"atempo={tempo}", "-ac", "1", "-c:a", "libmp3lame", "-b:a", NATIVE_BITRATE, str(target)],
        check=True,
    )


def render_libre(source, clip, tempo, target):
    """Extrait d'un enregistrement téléchargé : découpe, volume normalisé, tempo du profil, MP3 mono (ffmpeg seul)."""
    command = ["ffmpeg", "-loglevel", "error", "-y"]
    if clip:
        command += ["-ss", f"{float(clip[0]):.3f}", "-to", f"{float(clip[1]):.3f}"]
    filters = ["loudnorm=I=-18:TP=-2:LRA=9"] + ([f"atempo={tempo}"] if tempo != 1.0 else [])
    command += ["-i", str(source), "-map", "0:a:0", "-af", ",".join(filters), "-ac", "1", "-c:a", "libmp3lame",
                "-b:a", NATIVE_BITRATE, str(target)]
    subprocess.run(command, check=True)


def duration(path):
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
        check=True, capture_output=True, text=True,
    )
    return round(float(result.stdout.strip()), 3)


def render(job):
    item, profile_name, source, target, digest = job
    profile = PROFILES[profile_name]
    with tempfile.TemporaryDirectory(dir=target.parent) as directory:
        scratch = Path(directory)
        candidate = scratch / target.name
        if source and is_libre(item):
            render_libre(source, item["native"].get("clip"), profile.native_tempo, candidate)
            pacing = {"nativeTempo": profile.native_tempo, "sourceFile": item["native"]["file"],
                      "sourceSha": sha256_file(source)}
        elif source:
            render_native(source, profile.native_tempo, candidate)
            pacing = {"nativeTempo": profile.native_tempo, "sourceKey": source.stem}
        else:
            bounds = render_speech(item, profile, scratch, candidate)
            pacing = {"lengthScale": profile.length_scale, "lineGapSeconds": profile.line_gap,
                      "voices": sorted({voice_label(line["voice"]) for line in item["script"] if "voice" in line})}
        seconds = duration(candidate)
        if not source and item.get("segments"):
            pacing["segments"] = segments_of(bounds, seconds)
        result = {"audioProfile": profile_name, **pacing, "seconds": seconds,
                  "sha256": sha256_file(candidate), "fingerprint": digest}
        candidate.replace(target)
    return item["key"], result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--content", type=Path, required=True,
                        help="dossier content/de construit (V4 officielle, niveaux B ou kit)")
    parser.add_argument("--level", nargs="+", help="niveaux à traiter (a1 … c2) ; par défaut tous ceux du dossier")
    parser.add_argument("--only", nargs="+", help="clés audio à régénérer")
    parser.add_argument("--jobs", type=int, choices=range(1, 9), default=4)
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--dry-run", action="store_true", help="liste les sons à produire sans rien écrire")
    args = parser.parse_args()
    for level in args.level or []:
        if not LEVEL_ID.match(level) or not (args.content / level / "level.json").is_file():
            parser.error(f"niveau {level!r} : a1 … c2 avec un level.json dans {args.content}")
    output = (args.content / "media" / "audio").resolve()
    if output.is_relative_to(ORIGINAL_AUDIO.resolve().parents[1]):
        parser.error("--content ne doit pas désigner la V2 de référence (content/base/de), source des enregistrements natifs")

    selected = {}
    selected_levels = args.level or available_levels(args.content)
    for item, profile_name in content_audio(args.content, selected_levels):
        key = item["key"]
        if args.only and key not in args.only:
            continue
        if key in selected:
            parser.error(f"clé audio en double : {key}")
        if profile_name not in PROFILES:
            parser.error(f"{key} : profil audio inconnu {profile_name!r}")
        unknown = sorted({line["voice"] for line in item.get("script", []) if "voice" in line} - VOICES.keys())
        if unknown:
            parser.error(f"{key} : voix inconnue(s) {', '.join(unknown)} (infra/content/tts/voices.json)")
        selected[key] = item, profile_name
    missing = set(args.only or []) - selected.keys()
    if missing or not selected:
        parser.error(f"aucun audio sélectionné ou clés introuvables : {', '.join(sorted(missing))}")
    if not VOICES_CONFIGURED and any(line.get("voice") in FALLBACK_VOICES
                                     for item, _ in selected.values() for line in item.get("script", [])):
        print("Avertissement : infra/content/tts/voices.json absent, frau2/frau3 lues par Kerstin et mann2/mann3 par Thorsten.",
              flush=True)

    manifest_path = output / "manifest-v3.json"
    manifest = read_json(manifest_path) if manifest_path.exists() else {"items": {}}
    entries = manifest.setdefault("items", {})
    jobs = []
    for key, (item, profile_name) in selected.items():
        target = output / filename(key)
        source = native_source(item) if item.get("native") else None
        if source is not None and not source.is_file():
            # Source non versionnée (téléchargement libre) absente sur ce poste : le son préparé et versionné fait foi.
            if is_libre(item) and target.is_file() and key in entries:
                continue
            parser.error(f"{key} : source {item['native'].get('file')} introuvable et son non préparé")
        digest = fingerprint(item, PROFILES[profile_name], source)
        previous = entries.get(key, {})
        if (not args.force and previous.get("fingerprint") == digest and target.is_file()
                and previous.get("sha256") == sha256_file(target)):
            continue
        jobs.append((item, profile_name, source, target, digest))

    if args.dry_run:
        for item, profile_name, _, _, _ in jobs:
            print(f"à produire · {item['key']} · {profile_name}", flush=True)
        print(f"{len(jobs)} son(s) à produire, {len(selected) - len(jobs)} déjà à jour (aucun fichier écrit).", flush=True)
        return
    output.mkdir(parents=True, exist_ok=True)
    manifest["renderer"] = "Piper V3 · Thorsten et Kerstin" + (" et voix de voices.json" if VOICES_CONFIGURED else "")
    if jobs:
        with ProcessPoolExecutor(max_workers=min(args.jobs, len(jobs))) as pool:
            for key, result in pool.map(render, jobs):
                entries[key] = result
                tmp = manifest_path.with_suffix(".json.tmp")
                tmp.write_text(json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
                tmp.replace(manifest_path)
                print(f"{key} · {result['audioProfile']} · {result['seconds']:.2f} s", flush=True)
    print(f"{len(jobs)} son(s) produit(s), {len(selected) - len(jobs)} déjà à jour.", flush=True)


if __name__ == "__main__":
    main()
