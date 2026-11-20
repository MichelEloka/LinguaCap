"""Contrôle des sons par reconnaissance vocale (DEV-094).

Retranscrit chaque son et le compare au texte attendu (taux d'erreur sur les mots). Un son dont le taux dépasse le
seuil est signalé : prononciation fautive, mot avalé ou texte mal découpé.

Usage dans le conteneur linguacap-asr :
  python check_audio.py --expected expected.json --audio /audio --report /out/report.json [--threshold 0.25]
  python check_audio.py --transcribe /audio --report /out/transcripts.json [--glob "voc/voc_0[1-5]*.mp3"]
      (sans texte attendu : texte et segments horodatés, enregistrés au fil de l'eau ; un fichier déjà retranscrit est sauté)
expected.json : { "clé": "texte attendu", … } ; les sons sont /audio/<clé>.mp3 ou .wav.
"""
import argparse
import json
import re
import unicodedata
from pathlib import Path

from faster_whisper import WhisperModel

NUMBERS = {"eins": "1", "zwei": "2", "drei": "3", "vier": "4", "fünf": "5", "sechs": "6", "sieben": "7", "acht": "8",
           "neun": "9", "zehn": "10", "elf": "11", "zwölf": "12", "zwanzig": "20", "dreißig": "30", "hundert": "100"}


def words(text):
    text = unicodedata.normalize("NFC", text.lower()).replace("ß", "ss")
    text = re.sub(r"[^\w\s]", " ", text)
    return [NUMBERS.get(word, word) for word in text.split()]


def wer(expected, heard):
    """Distance d'édition entre suites de mots, rapportée au nombre de mots attendus."""
    a, b = words(expected), words(heard)
    if not a:
        return 0.0
    previous = list(range(len(b) + 1))
    for i, word in enumerate(a, 1):
        current = [i] + [0] * len(b)
        for j, other in enumerate(b, 1):
            current[j] = min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + (word != other))
        previous = current
    return previous[-1] / len(a)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--expected")
    parser.add_argument("--audio")
    parser.add_argument("--transcribe")
    parser.add_argument("--report", required=True)
    parser.add_argument("--threshold", type=float, default=0.25)
    parser.add_argument("--model", default="small")
    parser.add_argument("--glob", default="**/*.mp3")
    args = parser.parse_args()
    model = WhisperModel(args.model, device="cpu", compute_type="int8", download_root="/models")
    report = {}
    if args.transcribe:
        report_file = Path(args.report)
        if report_file.exists():
            report = json.loads(report_file.read_text(encoding="utf-8"))
        for path in sorted(Path(args.transcribe).glob(args.glob)):
            name = str(path.relative_to(args.transcribe)).replace("\\", "/")
            if name in report:
                continue
            segments, _ = model.transcribe(str(path), language="de", vad_filter=True)
            parts = [{"start": round(segment.start, 2), "end": round(segment.end, 2), "text": segment.text.strip()} for segment in segments]
            report[name] = {"text": " ".join(part["text"] for part in parts), "segments": parts}
            report_file.write_text(json.dumps(report, ensure_ascii=False, indent=1), encoding="utf-8")
            print(path.name, "→", report[name]["text"][:100], flush=True)
        return
    else:
        expected = json.loads(Path(args.expected).read_text(encoding="utf-8"))
        flagged = 0
        for key, text in sorted(expected.items()):
            path = next((p for p in (Path(args.audio) / f"{key}.mp3", Path(args.audio) / f"{key}.wav") if p.exists()), None)
            if path is None:
                report[key] = {"error": "son introuvable"}
                flagged += 1
                continue
            segments, _ = model.transcribe(str(path), language="de", vad_filter=False, beam_size=5)
            heard = " ".join(segment.text.strip() for segment in segments)
            rate = round(wer(text, heard), 3)
            report[key] = {"wer": rate, "heard": heard, "expected": text}
            if rate > args.threshold:
                flagged += 1
            print(f"{key} · {rate:.0%}", flush=True)
        print(f"{flagged} son(s) au-dessus du seuil de {args.threshold:.0%} sur {len(expected)}.")
    Path(args.report).write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
