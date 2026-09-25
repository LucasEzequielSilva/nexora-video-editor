"""Transcribe un video con faster-whisper (palabra por palabra) a un JSON con el mismo formato que usa build-reserva-transcript.py.

Uso: python scripts/transcribir.py public/piezas/<slug>/video.mp4 public/piezas/<slug>/words.json [--modelo large-v3] [--prompt "Nexora, WhatsApp"]

--modelo acepta un nombre (se busca primero en models/<nombre>, después en el caché de Hugging Face) o una ruta.
Transcripción literal: cada frase (tramo de voz entre pausas >= 0.3 s) se decodifica por separado, así Whisper no
junta las repeticiones ("llega un día... y llega un día") y los tropiezos quedan a la vista en el recortador.
"""
import argparse, json, os, subprocess, sys, tempfile, time

import numpy as np
from faster_whisper import WhisperModel, decode_audio

MODELS = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")
MULETILLAS = "Eh... este, o sea, bueno, eh, digamos."

parser = argparse.ArgumentParser()
parser.add_argument("entrada")
parser.add_argument("salida")
parser.add_argument("--modelo", default="large-v3")
parser.add_argument("--prompt", default=None, help="Vocabulario para sesgar nombres propios (marcas, términos)")
args = parser.parse_args()


def resolver(modelo):
    if os.path.isdir(modelo):
        return modelo
    local = os.path.join(MODELS, modelo)
    return local if os.path.isfile(os.path.join(local, "model.bin")) else modelo


def frases(audio, sr=16000, pausa=0.3, margen=0.1):
    hop = sr // 100
    x = audio[: len(audio) // hop * hop].reshape(-1, hop)
    db = 20 * np.log10(np.sqrt((x**2).mean(1)) + 1e-9)
    voz = np.flatnonzero(db > np.percentile(db, 10) + 12)
    if not len(voz):
        return "0"
    tramos, ini, fin = [], voz[0], voz[0]
    for i in voz[1:]:
        if (i - fin) / 100 >= pausa:
            tramos.append((ini, fin))
            ini = i
        fin = i
    tramos.append((ini, fin))
    dur = len(audio) / sr
    return [t for a, b in tramos for t in (max(0.0, a / 100 - margen), min(dur, (b + 1) / 100 + margen))]


wav = os.path.join(tempfile.mkdtemp(), "audio.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", args.entrada, "-vn", "-af", "aresample=async=1", "-ac", "1", "-ar", "16000", wav], check=True)
audio = decode_audio(wav)

t = time.time()
model = WhisperModel(resolver(args.modelo), device="cpu", compute_type="int8")
segs, info = model.transcribe(
    audio, language="es", word_timestamps=True, clip_timestamps=frases(audio),
    initial_prompt=" ".join(p for p in (MULETILLAS, args.prompt) if p),
    condition_on_previous_text=True, beam_size=5, temperature=0,
)
data = {
    "language": "es",
    "duration": info.duration,
    "segments": [
        {
            "start": s.start,
            "end": s.end,
            "text": s.text,
            "words": [
                {"start": w.start, "end": w.end, "word": w.word, "p": round(w.probability, 3)}
                for w in (s.words or [])
            ],
        }
        for s in segs
    ],
}
os.makedirs(os.path.dirname(os.path.abspath(args.salida)), exist_ok=True)
with open(args.salida, "w", encoding="utf-8") as fh:
    json.dump(data, fh, ensure_ascii=False, indent=1)
sys.stdout.reconfigure(encoding="utf-8")
print(f"{args.modelo}: {info.duration:.1f}s de audio en {time.time() - t:.1f}s -> {args.salida}")
