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

UNITS = {"null": 0, "eins": 1, "ein": 1, "eine": 1, "zwei": 2, "drei": 3, "vier": 4, "fünf": 5, "sechs": 6, "sieben": 7,
         "acht": 8, "neun": 9}
TEENS = {"zehn": 10, "elf": 11, "zwölf": 12, "dreizehn": 13, "vierzehn": 14, "fünfzehn": 15, "sechzehn": 16,
         "siebzehn": 17, "achtzehn": 18, "neunzehn": 19}
TENS = {"zwanzig": 20, "dreißig": 30, "vierzig": 40, "fünfzig": 50, "sechzig": 60, "siebzig": 70, "achtzig": 80,
        "neunzig": 90}


def below_hundred(word):
    if word in TEENS:
        return TEENS[word]
    if word in TENS:
        return TENS[word]
    if "und" in word:
        unit, _, ten = word.partition("und")
        if unit in UNITS and ten in TENS:
            return UNITS[unit] + TENS[ten]
    return UNITS.get(word)


def number(word):
    """Nombre écrit en toutes lettres (jusqu'à 9 999) → valeur, sinon None. « eins » seul reste un nombre."""
    word = word.replace("ß", "ss").replace("ss", "ß") if "dreiss" in word else word
    total = 0
    rest = word
    if "tausend" in rest:
        head, _, rest = rest.partition("tausend")
        value = 1 if head in ("", "ein", "eins") else below_hundred(head)
        if value is None:
            return None
        total += value * 1000
    if "hundert" in rest:
        head, _, rest = rest.partition("hundert")
        value = 1 if head in ("", "ein", "eins") else UNITS.get(head)
        if value is None:
            return None
        total += value * 100
    if rest:
        value = below_hundred(rest)
        if value is None:
            return None
        total += value
    return total if word else None


def words(text):
    text = unicodedata.normalize("NFC", text.lower())
    text = re.sub(r"(?<=\d)[.,](?=\d{3})", "", text)  # 1.000 → 1000
    text = re.sub(r"[^\w\s]", " ", text)
    result = []
    for word in text.split():
        value = number(word) if not word.isdigit() and word not in ("ein", "eine") else None
        result.append(str(value) if value is not None else word.replace("ß", "ss"))
    # Les chiffres dictés un à un (« null eins sieben ») et les nombres lus d'un bloc (« 0176 ») se comparent chiffre à chiffre.
    return [digit for word in result for digit in (list(word) if word.isdigit() else [word])]


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
