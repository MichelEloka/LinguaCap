"""Synthèse des sons des contenus LinguaCap (voix Piper hors ligne).

Chaque média audio décrit par un « script » (répliques et pauses) devient un MP3 dans content/de/media/audio.
Un enregistrement natif (« native ») est repris de resource-langue/extraits, éventuellement découpé, au même volume.
Un son déjà généré pour le même script et les mêmes voix n'est pas refait (empreinte dans manifest.json).

Usage dans le conteneur linguacap-tts :
  python infra/content/tts/synthesize.py [--force] [--only clé ...]
"""
import argparse
import hashlib
import json
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

import numpy as np
from piper import PiperVoice
from piper.config import SynthesisConfig

ROOT = Path(__file__).resolve().parents[3]
CONTENT = ROOT / "content" / "de"
AUDIO = CONTENT / "media" / "audio"
VOICES_DIR = Path("/voices")
SOURCES = ROOT / "resource-langue" / "extraits"  # enregistrements natifs sous licence libre (non versionnés)
RATE = 22050

# Voix logiques des scripts → modèle Piper (Thorsten et Kerstin, jeux de données CC0), débit et hauteur.
# « frau » et « mann » reprennent ces deux voix avec une hauteur légèrement décalée (le débit ne change pas),
# pour distinguer les personnages d'un dialogue. Le modèle multi-locuteurs MLS a été écarté : la reconnaissance
# vocale y a relevé des passages incohérents.
VOICES = {
    "sprecher": {"model": "de_DE-thorsten-high", "scale": 1.0, "pitch": 1.0},
    "sprecherin": {"model": "de_DE-kerstin-low", "scale": 1.0, "pitch": 1.0},
    "frau": {"model": "de_DE-kerstin-low", "scale": 0.96, "pitch": 1.09},
    "mann": {"model": "de_DE-thorsten-high", "scale": 1.03, "pitch": 0.92},
}
GAP = 0.35  # silence par défaut entre deux répliques, en secondes


_loaded = {}


def voice(model):
    if model not in _loaded:
        _loaded[model] = PiperVoice.load(str(VOICES_DIR / f"{model}.onnx"))
    return _loaded[model]


def synthesize_line(text, spec, slow):
    piper_voice = voice(spec["model"])
    config = SynthesisConfig(length_scale=spec["scale"] * (1.12 if slow else 1.0))
    with tempfile.TemporaryDirectory() as tmp:
        raw = Path(tmp) / "line.wav"
        with wave.open(str(raw), "wb") as handle:
            piper_voice.synthesize_wav(text, handle, syn_config=config)
        with wave.open(str(raw), "rb") as handle:
            source_rate = handle.getframerate()
        resampled = Path(tmp) / "line22.wav"
        # Décalage de hauteur sans changer le débit : fréquence d'échantillonnage déclarée, puis tempo compensé.
        factor = spec["pitch"]
        shift = [] if factor == 1.0 else ["-af", f"asetrate={int(source_rate * factor)},aresample={source_rate},atempo={1 / factor:.4f}"]
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(raw), *shift, "-ar", str(RATE), "-ac", "1", str(resampled)],
                       check=True)
        with wave.open(str(resampled), "rb") as handle:
            return np.frombuffer(handle.readframes(handle.getnframes()), dtype=np.int16)


def fingerprint(item, slow):
    if item.get("native"):
        data = json.dumps({"native": item["native"]}, sort_keys=True, ensure_ascii=False)
        return hashlib.sha256(data.encode("utf-8")).hexdigest()
    data = json.dumps({"script": item["script"], "voices": VOICES, "slow": slow}, sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(data.encode("utf-8")).hexdigest()


def render(item, slow, target):
    pieces = [np.zeros(int(RATE * 0.3), dtype=np.int16)]
    previous_was_line = False
    for line in item["script"]:
        if "pause" in line:
            pieces.append(np.zeros(int(RATE * float(line["pause"])), dtype=np.int16))
            previous_was_line = False
            continue
        if previous_was_line:
            pieces.append(np.zeros(int(RATE * GAP), dtype=np.int16))
        pieces.append(synthesize_line(line["text"], VOICES[line["voice"]], slow))
        previous_was_line = True
    pieces.append(np.zeros(int(RATE * 0.4), dtype=np.int16))
    with tempfile.TemporaryDirectory() as tmp:
        joined = Path(tmp) / "joined.wav"
        with wave.open(str(joined), "wb") as handle:
            handle.setnchannels(1)
            handle.setsampwidth(2)
            handle.setframerate(RATE)
            handle.writeframes(np.concatenate(pieces).tobytes())
        # Volume homogène d'un son à l'autre, MP3 mono adapté à la voix.
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(joined), "-af", "loudnorm=I=-18:TP=-2:LRA=9",
                        "-ar", str(RATE), "-ac", "1", "-c:a", "libmp3lame", "-b:a", "64k", str(target)], check=True)


def prepare_native(item, target):
    """Extrait éventuel d'un enregistrement natif, volume homogène avec les sons de synthèse, MP3 mono."""
    source = SOURCES / item["native"]["file"]
    clip = item["native"].get("clip")
    window = ["-ss", str(clip[0]), "-to", str(clip[1])] if clip else []
    fade = []
    if clip:
        length = clip[1] - clip[0]
        fade = [f"afade=t=in:d=0.05,afade=t=out:st={max(length - 0.25, 0):.2f}:d=0.25"]
    filters = ",".join([*fade, "loudnorm=I=-18:TP=-2:LRA=9"])
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", *window, "-i", str(source), "-af", filters, "-ar", "44100", "-ac", "1",
                    "-c:a", "libmp3lame", "-b:a", "80k", str(target)], check=True)


def audio_media():
    for level in ("a1", "a2"):
        directory = CONTENT / level
        level_file = directory / "level.json"
        if not level_file.exists():
            continue
        level_data = json.loads(level_file.read_text(encoding="utf-8"))
        files = [directory / entry["file"] for entry in level_data.get("modules", [])]
        for path in files:
            if path.exists():
                for item in json.loads(path.read_text(encoding="utf-8")).get("media", []):
                    if item.get("kind") == "audio" and (item.get("script") or item.get("native")):
                        yield level, item
        for item in level_data.get("media", []):
            if item.get("kind") == "audio" and (item.get("script") or item.get("native")):
                yield level, item


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--only", nargs="*")
    args = parser.parse_args()
    AUDIO.mkdir(parents=True, exist_ok=True)
    manifest_file = AUDIO / "manifest.json"
    manifest = json.loads(manifest_file.read_text(encoding="utf-8")) if manifest_file.exists() else {}
    made = skipped = 0
    for level, item in audio_media():
        key = item["key"]
        if args.only and key not in args.only:
            continue
        slow = level == "a1"
        digest = fingerprint(item, slow)
        target = AUDIO / f"{key}.mp3"
        if not args.force and target.exists() and manifest.get(key) == digest:
            skipped += 1
            continue
        if item.get("native"):
            if not (SOURCES / item["native"]["file"]).exists():
                print(f"{key} : source {item['native']['file']} absente, son conservé tel quel", flush=True)
                continue
            prepare_native(item, target)
        else:
            render(item, slow, target)
        manifest[key] = digest
        manifest_file.write_text(json.dumps(manifest, indent=2, sort_keys=True), encoding="utf-8")
        made += 1
        print(f"{key}.mp3 · {target.stat().st_size // 1024} Ko", flush=True)
    print(f"{made} son(s) générés, {skipped} déjà à jour.")


if __name__ == "__main__":
    main()
