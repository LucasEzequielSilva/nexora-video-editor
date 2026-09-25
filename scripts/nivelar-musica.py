"""Nivela un tema para que funcione como cama pareja: mismo volumen percibido todo el tiempo.

Uso: python scripts/nivelar-musica.py <tema> <inicio_s> <largo_s> <salida.m4a> <referencia_s>
- Toma el tema desde inicio_s (ej. el drop) por largo_s segundos.
- Mide el volumen en la banda que se oye en un celular (200 Hz - 4 kHz) cada 100 ms, con ventanas de 400 ms.
- Aplica una ganancia suave (promedio de 1.5 s, sin bombeo) para llevar todo al volumen que tiene el tema en
  referencia_s (segundos desde inicio_s: el momento que Lucas marcó como "así se tiene que escuchar").
- Topes: sube hasta +12 dB (un break casi en silencio no se convierte en ruido) y baja hasta -24 dB.
- Pico final a -1 dBFS. La salida arranca en inicio_s: en props.json va con inicioS 0.
"""
import subprocess
import sys

import numpy as np
from scipy.ndimage import uniform_filter1d
from scipy.signal import butter, sosfilt

tema, inicio, largo, salida, referencia = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4], float(sys.argv[5])
SR = 48000
pcm = subprocess.run(
    ["ffmpeg", "-v", "error", "-ss", str(inicio), "-t", str(largo), "-i", tema, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"],
    capture_output=True, check=True,
).stdout
audio = np.frombuffer(pcm, np.float32).reshape(-1, 2).copy()

banda = sosfilt(butter(4, [200, 4000], btype="band", fs=SR, output="sos"), audio.mean(1))
paso, ventana = int(0.1 * SR), int(0.4 * SR)
centros = np.arange(0, len(banda), paso)
nivel = np.array([10 * np.log10(np.mean(banda[max(0, c - ventana // 2) : c + ventana // 2] ** 2) + 1e-12) for c in centros])
i_ref = int(referencia / 0.1)
objetivo = float(np.median(nivel[max(0, i_ref - 10) : i_ref + 10]))
ganancia_db = np.clip(objetivo - nivel, -24, 12)
ganancia_db = uniform_filter1d(ganancia_db, size=15)
ganancia = np.interp(np.arange(len(audio)), centros, 10 ** (ganancia_db / 20)).astype(np.float32)
nivelado = audio * ganancia[:, None]
nivelado *= 10 ** (-1 / 20) / max(1e-9, float(np.abs(nivelado).max()))

subprocess.run(
    ["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", "aac", "-b:a", "256k", salida],
    input=nivelado.tobytes(), check=True,
)
despues = nivel + ganancia_db
print(f"OK -> {salida} | objetivo {objetivo:.1f} dB (a los {referencia} s) | antes: {np.percentile(nivel, 10):.1f} a "
      f"{np.percentile(nivel, 90):.1f} dB | después: {np.percentile(despues, 10):.1f} a {np.percentile(despues, 90):.1f} dB")
