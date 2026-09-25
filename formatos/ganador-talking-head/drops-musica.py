"""Drops de un tema de música: dónde cambia fuerte la energía y a qué distancia quedan entre sí (README §4.9).

Uso: python formatos/ganador-talking-head/drops-musica.py "<tema>" [umbral_db=12]
Compara, cada 100 ms, la mediana de los 2 s siguientes contra la de los 2 s anteriores en dos bandas: graves
(< 150 Hz, el 808 de un phonk) y la que se oye en un celular (200 Hz a 4 kHz). Lista los saltos de más de
umbral_db y la distancia entre cada par. Mide números, no escucha: el drop lo confirma Lucas a oído.
Probado con "METAMORPHOSIS ganador.mp3": da 11.0 y 54.9 s (los de la ganadora son 11.053 y 54.94).
"""
import subprocess
import sys

import numpy as np
from scipy.signal import butter, sosfilt

tema, umbral = sys.argv[1], float(sys.argv[2]) if len(sys.argv) > 2 else 12.0
SR, V = 22050, 20
x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", tema, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                                 capture_output=True, check=True).stdout, np.float32)


def nivel(sos):
    y, p = sosfilt(sos, x), int(0.1 * SR)
    n = len(y) // p
    return 10 * np.log10(np.mean(y[: n * p].reshape(n, p).astype(np.float64) ** 2, axis=1) + 1e-12)


niv = {"graves": nivel(butter(4, 150, btype="low", fs=SR, output="sos")),
       "celular": nivel(butter(4, [200, 4000], btype="band", fs=SR, output="sos"))}
n = len(niv["graves"])
salto = {k: np.array([np.median(v[i:i + V]) - np.median(v[i - V:i]) if V <= i <= n - V else 0 for i in range(n)])
         for k, v in niv.items()}
fuerza = np.maximum(salto["graves"], salto["celular"])
elegidos = []
for i in np.argsort(-fuerza):
    if fuerza[i] < umbral:
        break
    if all(abs(i - j) > 40 for j in elegidos):
        elegidos.append(i)
drops = []
for i in sorted(elegidos):
    banda = "graves" if salto["graves"][i] >= salto["celular"][i] else "celular"
    a = max(1, i - 10)
    k = a + int(np.argmax(np.diff(niv[banda][a - 1:i + 10])))
    drops.append(k / 10)
    print(f"{k / 10:6.1f} s   graves {salto['graves'][i]:+5.1f} dB   celular {salto['celular'][i]:+5.1f} dB")
print(f"duración {len(x) / SR:.1f} s; distancias: "
      + (", ".join(f"{b - a:.1f} s ({a:.1f}->{b:.1f})" for j, a in enumerate(drops) for b in drops[j + 1:]) or "-"))
