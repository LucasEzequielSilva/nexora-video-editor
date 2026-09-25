"""Cola de reverb de una palabra de la voz, para que se estire sobre una pausa (ej. el "no" del hook sobre el negro).

Uso: python scripts/cola-reverb.py <video.mp4> <desde_s> <hasta_s> <salida.wav> [rt60_s=1.2] [largo_s=1.2] [eco_ms=0] [ecos=3]
Toma la voz entre desde_s y hasta_s, la convoluciona con una respuesta de impulso sintética (reflexiones tempranas +
cola de ruido estéreo que decae, sin graves ni agudos extremos) y guarda SOLO la señal húmeda, desde desde_s, con
fundido de salida al final de largo_s. La voz seca no se toca: la cola va como un SFX más, anclado a la palabra.
Con eco_ms > 0 suma un delay: la palabra se repite `ecos` veces cada eco_ms (la primera a -3 dB, cada una x0.6) y más
opaca (sin agudos), con poca reverb encima: tienen que oírse como repeticiones, no como reverb.
"""
import subprocess
import sys

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, fftconvolve, sosfilt

video, desde, hasta, salida = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4]
RT60 = float(sys.argv[5]) if len(sys.argv) > 5 else 1.2
LARGO = float(sys.argv[6]) if len(sys.argv) > 6 else 1.2
ECO_MS = float(sys.argv[7]) if len(sys.argv) > 7 else 0
ECOS = int(sys.argv[8]) if len(sys.argv) > 8 else 3
REALIMENTACION = 0.6
SR = 48000

pcm = subprocess.run(
    ["ffmpeg", "-v", "error", "-ss", str(desde), "-t", str(hasta - desde), "-i", video, "-af", "aresample=async=1",
     "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
    capture_output=True, check=True,
).stdout
voz = np.frombuffer(pcm, np.float32).copy()
borde = int(0.008 * SR)
voz[:borde] *= np.linspace(0, 1, borde)
voz[-borde:] *= np.linspace(1, 0, borde)

rng = np.random.default_rng(7)
n_ir = int(RT60 * 1.3 * SR)
t = np.arange(n_ir) / SR
envolvente = np.exp(-6.91 * t / RT60)
pre = int(0.018 * SR)
ir = np.zeros((n_ir + pre, 2), np.float32)
for c in range(2):
    ir[pre:, c] = rng.standard_normal(n_ir) * envolvente
    for ms, g in ((7, 0.55), (13, 0.42), (23, 0.33), (37, 0.25), (53, 0.18)):
        ir[int((ms + 2 * c) * SR / 1000), c] += g * 6
banda = butter(2, [180, 5500], btype="band", fs=SR, output="sos")
ir = sosfilt(banda, ir, axis=0)
ir /= np.sqrt((ir**2).sum(axis=0, keepdims=True))

# Niveles relativos al pico de la voz seca. Primera versión: ecos metidos dentro de la reverb y todo normalizado
# junto -> los ecos quedaban 10 dB debajo de la voz, sin repeticiones distinguibles (Lucas: "no lo escucho con eco").
NIVEL_ECO = 0.7
NIVEL_REVERB = 0.3
pico_voz = float(np.abs(voz).max())
n = int(LARGO * SR)
ecos = np.zeros((max(n, len(voz)), 2), np.float32)
entrada = voz.copy()
if ECO_MS > 0:
    paso = int(ECO_MS * SR / 1000)
    entrada = np.zeros(len(voz) + paso * ECOS, np.float32)
    entrada[: len(voz)] = voz
    repeticion = sosfilt(butter(2, 250, btype="high", fs=SR, output="sos"), voz)
    for k in range(1, ECOS + 1):
        # Cada vuelta del delay pierde agudos, como una cinta: el eco se oscurece a medida que se apaga.
        repeticion = sosfilt(butter(2, max(1500, 7000 * 0.75 ** (k - 1)), btype="low", fs=SR, output="sos"), repeticion)
        eco = repeticion * (NIVEL_ECO * REALIMENTACION ** (k - 1)) * pico_voz / max(1e-9, float(np.abs(repeticion).max()))
        entrada[k * paso : k * paso + len(voz)] += eco
        # Ping-pong suave: cada eco se inclina hacia un lado.
        lado = (0.7, 1.0) if k % 2 else (1.0, 0.7)
        a, b = k * paso, min(len(ecos), k * paso + len(voz))
        for c in range(2):
            ecos[a:b, c] += eco[: b - a] * lado[c]
rev = np.stack([fftconvolve(entrada, ir[:, c]) for c in range(2)], axis=1)
rev *= NIVEL_REVERB * pico_voz / max(1e-9, float(np.abs(rev).max()))
humedo = np.zeros((n, 2), np.float32)
humedo += rev[:n] if len(rev) >= n else np.pad(rev, ((0, n - len(rev)), (0, 0)))
humedo += ecos[:n]
fundido = int(0.2 * SR)
humedo[-fundido:] *= np.linspace(1, 0, fundido)[:, None]
# PCM de 16 bits: el WAV de coma flotante no lo lee la línea de tiempo de Studio (se cae dibujando la onda).
wavfile.write(salida, SR, (np.clip(humedo, -1, 1) * 32767).astype(np.int16))
print(f"OK: cola de {LARGO:.2f}s (RT60 {RT60}s) de la voz {desde:.2f}-{hasta:.2f}s -> {salida}")
