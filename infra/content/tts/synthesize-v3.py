"""Produit les MP3 V3/V4 à partir des scripts compilés et des extraits natifs V2.

Les enregistrements natifs sont tirés des MP3 de la V2 de référence (content/base/de/media/audio), ralentis sans
changer la hauteur (atempo) selon le profil du niveau. Les sons marqués « segments: true » (lexique d'un module)
reçoivent dans le manifeste un segment { start, end } par réplique prononcée. Sortie mono, débit sobre.

Usage dans le conteneur linguacap-tts-v3 :
  python -B infra/content/tts/synthesize-v3.py --content /repo/content/de [--level a1] [--only clé …] [--force]
"""
import argparse
from concurrent.futures import ProcessPoolExecutor
from dataclasses import dataclass
from functools import lru_cache
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import wave

import numpy as np
import onnxruntime
from piper import PiperVoice
from piper.config import PiperConfig, SynthesisConfig


ORIGINAL_AUDIO = Path(__file__).resolve().parents[3] / "content" / "base" / "de" / "media" / "audio"
VOICES_DIR = Path("/voices")
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
    "b1-debut": Profile(1.02, 0.31, 1.0),
    "b1-suite": Profile(0.99, 0.28, 1.0),
}
VOICES = {
    "frau": "de_DE-kerstin-medium",
    "sprecherin": "de_DE-kerstin-medium",
    "mann": "de_DE-thorsten-medium",
    "sprecher": "de_DE-thorsten-medium",
}


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def audio_items(document, default_profile):
    for item in document.get("media", []):
        if item.get("kind") != "audio":
            continue
        profile_name = item.get("audioProfile", default_profile)
        if profile_name.startswith("a1-") and any(
                marker in item["key"] for marker in ("-alphabet-", "-abc-", "-buchstabe")):
            profile_name = "a1-alphabet"
        yield item, profile_name


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


def sha256_file(path):
    with path.open("rb") as handle:
        return hashlib.file_digest(handle, "sha256").hexdigest()


@lru_cache(maxsize=None)
def voice_digest(model):
    return tuple(sha256_file(VOICES_DIR / (model + extension)) for extension in (".onnx", ".onnx.json"))


def fingerprint(item, profile, source):
    if source:
        data = ("v3-native-2", NATIVE_BITRATE, profile.native_tempo, sha256_file(source))
    else:
        models = {VOICES[line["voice"]] for line in item["script"] if "voice" in line}
        data = ("v3-piper-2", SPEECH_BITRATE, bool(item.get("segments")), profile.length_scale, profile.line_gap,
                item["script"], VOICES, {model: voice_digest(model) for model in sorted(models)})
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
        voice = load_voice(VOICES[line["voice"]])
        config = SynthesisConfig(length_scale=profile.length_scale)
        start = samples
        for chunk in voice.synthesize(line.get("say") or line["text"], syn_config=config):
            pieces.append(chunk.audio_int16_array)
            samples += len(chunk.audio_int16_array)
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
        if source:
            render_native(source, profile.native_tempo, candidate)
            pacing = {"nativeTempo": profile.native_tempo, "sourceKey": source.stem}
        else:
            bounds = render_speech(item, profile, scratch, candidate)
            pacing = {"lengthScale": profile.length_scale, "lineGapSeconds": profile.line_gap,
                      "voices": sorted({VOICES[line["voice"]] for line in item["script"] if "voice" in line})}
        seconds = duration(candidate)
        if not source and item.get("segments"):
            pacing["segments"] = segments_of(bounds, seconds)
        result = {"audioProfile": profile_name, **pacing, "seconds": seconds,
                  "sha256": sha256_file(candidate), "fingerprint": digest}
        candidate.replace(target)
    return item["key"], result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--content", type=Path, required=True, help="dossier content/de construit (V4 officielle ou kit)")
    levels = ("a1", "a2", "b1")
    parser.add_argument("--level", nargs="+", choices=levels)
    parser.add_argument("--only", nargs="+", help="clés audio à régénérer")
    parser.add_argument("--jobs", type=int, choices=range(1, 9), default=4)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    output = (args.content / "media" / "audio").resolve()
    if output.is_relative_to(ORIGINAL_AUDIO.resolve().parents[1]):
        parser.error("--content ne doit pas désigner la V2 de référence (content/base/de), source des enregistrements natifs")

    selected = {}
    selected_levels = args.level or [level for level in levels if (args.content / level / "level.json").is_file()]
    for item, profile_name in content_audio(args.content, selected_levels):
        key = item["key"]
        if args.only and key not in args.only:
            continue
        if key in selected:
            parser.error(f"clé audio en double : {key}")
        if profile_name not in PROFILES:
            parser.error(f"{key} : profil audio inconnu {profile_name!r}")
        selected[key] = item, profile_name
    missing = set(args.only or []) - selected.keys()
    if missing or not selected:
        parser.error(f"aucun audio sélectionné ou clés introuvables : {', '.join(sorted(missing))}")

    output.mkdir(parents=True, exist_ok=True)
    manifest_path = output / "manifest-v3.json"
    manifest = read_json(manifest_path) if manifest_path.exists() else {"items": {}}
    manifest["renderer"] = "Piper V3 · Thorsten et Kerstin"
    entries = manifest["items"]
    jobs = []
    for key, (item, profile_name) in selected.items():
        target = output / filename(key)
        source = ORIGINAL_AUDIO / filename(item.get("v3SourceKey") or key) if item.get("native") else None
        digest = fingerprint(item, PROFILES[profile_name], source)
        previous = entries.get(key, {})
        if (not args.force and previous.get("fingerprint") == digest and target.is_file()
                and previous.get("sha256") == sha256_file(target)):
            continue
        jobs.append((item, profile_name, source, target, digest))

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
