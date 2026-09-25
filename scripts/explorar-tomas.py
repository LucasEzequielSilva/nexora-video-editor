"""Transcripción EXPLORATORIA de un clip crudo largo, para ubicar tomas (no para subtítulos).

Uso: node scripts/turno.mjs python scripts/explorar-tomas.py <clip> <salida.json> [--modelo small]
Distinto de transcribir.py a propósito: archivo entero, detección de voz (VAD) y SIN condicionar cada frase con la
anterior. Con transcribir.py (frase por frase, condition_on_previous_text=True) un clip de 8 min salió casi todo "..."
y "¡SUSCRÍBETE!": una frase degenerada contaminaba a las siguientes. Escribe además <salida>.txt legible.
"""
import argparse
import json
import os
import subprocess
import tempfile
import time

from faster_whisper import WhisperModel

p = argparse.ArgumentParser()
p.add_argument("clip")
p.add_argument("salida")
p.add_argument("--modelo", default="small")
a = p.parse_args()

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
local = os.path.join(RAIZ, "models", a.modelo)
modelo = WhisperModel(local if os.path.isdir(local) else a.modelo, device="cpu", compute_type="int8")

wav = os.path.join(tempfile.gettempdir(), "explorar-tomas.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a.clip, "-vn", "-ac", "1", "-ar", "16000", "-af", "aresample=async=1", wav], check=True)
t0 = time.time()
segmentos, _ = modelo.transcribe(
    wav, language="es", vad_filter=True, vad_parameters={"min_silence_duration_ms": 400},
    condition_on_previous_text=False, word_timestamps=True, beam_size=5,
)
salida = []
for s in segmentos:
    salida.append({"start": round(s.start, 2), "end": round(s.end, 2), "text": s.text.strip(),
                   "words": [{"start": round(w.start, 2), "end": round(w.end, 2), "word": w.word} for w in s.words or []]})
json.dump({"segments": salida}, open(a.salida, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
with open(os.path.splitext(a.salida)[0] + ".txt", "w", encoding="utf-8") as fh:
    for s in salida:
        fh.write(f"{s['start']:7.2f}-{s['end']:7.2f} {s['text']}\n")
print(f"{a.modelo}: {len(salida)} frases en {time.time() - t0:.0f}s -> {a.salida}")
