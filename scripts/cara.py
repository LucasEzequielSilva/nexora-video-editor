"""Cara del que habla cuadro a cuadro (YuNet, OpenCV) y cortes, para la cámara que sigue la cara.

Uso: python scripts/cara.py public/piezas/<slug>
Lee   video.mp4
Crea  cara.json  { fps, ancho: 1080, alto: 1920, cuadros: [[ojos_x, ojos_y, ancho_cara] | null] (px de 1080x1920),
                   cortes: [cuadro donde empieza cada plano nuevo] }
Liviano (~5 ms por cuadro): no hace falta turno.mjs. Si cambia video.mp4, volver a correrlo.
"""
import json
import os
import subprocess
import sys
import time

import cv2
import numpy as np

dir_pieza = sys.argv[1]
entrada = os.path.join(dir_pieza, "video.mp4")
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H = 540, 960
ESCALA = 1080 / W
FPS = 30

detector = cv2.FaceDetectorYN.create(os.path.join(RAIZ, "models", "yunet", "face_detection_yunet_2023mar.onnx"), "", (W, H), 0.7, 0.3, 5000)
lector = subprocess.Popen(
    ["ffmpeg", "-v", "error", "-i", entrada, "-vf", f"scale={W}:{H},fps={FPS}", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"],
    stdout=subprocess.PIPE,
)

cuadros, difs = [], []
previo = None
t0 = time.time()
while True:
    buf = lector.stdout.read(W * H * 3)
    if len(buf) < W * H * 3:
        break
    img = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
    chico = img[::8, ::8].astype(np.float32)
    difs.append(float(np.abs(chico - previo).mean()) if previo is not None else 0.0)
    previo = chico
    _, caras = detector.detect(img)
    if caras is None or len(caras) == 0:
        cuadros.append(None)
        continue
    c = max(caras, key=lambda r: r[2])
    cuadros.append([round(float((c[4] + c[6]) / 2 * ESCALA), 1), round(float((c[5] + c[7]) / 2 * ESCALA), 1), round(float(c[2] * ESCALA), 1)])
lector.wait()

# Corte de imagen = pico de UN cuadro en la diferencia entre cuadros: muy por encima de lo normal y de sus vecinos.
# Un paneo rápido de cámara en mano también pasa el umbral, pero sostenido (cuenta-juntos: 26.5 contra ~10 alrededor);
# los cortes reales dan 3.6 (jump cut dentro de una toma quieta, estructura-nexora cuadro 339) a 20 veces sus vecinos.
d = np.array(difs)
umbral = np.median(d) + 8 * np.median(np.abs(d - np.median(d))) + 4
n = len(cuadros)
cortes_imagen = [
    i for i in range(1, n)
    if d[i] > umbral and d[i] > 3 * max(1.0, float(np.median(np.delete(d[max(1, i - 3):i + 4], i - max(1, i - 3)))))
]
limites = [0] + cortes_imagen + [n]

# Detecciones sueltas lejos de sus vecinas del mismo plano (YuNet a veces marca el pecho o una mano en un cuadro): afuera.
# Sin esto, un falso positivo en y=1728 (cuenta-juntos, cuadro 64) arrastraba el promedio y la cámara mostraba el pecho.
for a, b in zip(limites[:-1], limites[1:]):
    originales = cuadros[a:b]
    for j, c in enumerate(originales):
        if c is None:
            continue
        vecinas = [v for k, v in enumerate(originales[max(0, j - 4):j + 5], start=max(0, j - 4)) if k != j and v is not None]
        if len(vecinas) < 3:
            continue
        mx, my, mw = (float(np.median([v[e] for v in vecinas])) for e in range(3))
        if np.hypot(c[0] - mx, c[1] - my) > 0.8 * mw or not 0.67 < c[2] / mw < 1.5:
            cuadros[a + j] = None

# Corte de cara = salto brusco de la cara comparado con cómo se venía moviendo (tomas con el mismo encuadre, que la
# diferencia de imagen no ve). Contra el movimiento local y no un umbral fijo: el que habla puede moverse rápido (en
# cuenta-juntos un umbral fijo de 40 px daba 29 "cortes" para 6 reales). Que la cara aparezca o desaparezca no es corte.
pasos = [None] * n
for i in range(1, n):
    p, q = cuadros[i - 1], cuadros[i]
    if p is not None and q is not None:
        pasos[i] = (float(np.hypot(p[0] - q[0], p[1] - q[1])), abs(p[2] / q[2] - 1))
cortes_cara = []
for i in range(1, n):
    if pasos[i] is None:
        continue
    cerca = [pasos[k] for k in range(max(1, i - 6), min(n, i + 7)) if k != i and pasos[k] is not None]
    mov = max(5.0, float(np.median([c[0] for c in cerca]))) if cerca else 5.0
    esc = max(0.02, float(np.median([c[1] for c in cerca]))) if cerca else 0.02
    # El ancho de YuNet salta 15-25 % cuando gira la cabeza: por ancho solo cuenta un salto muy grande.
    if (pasos[i][0] > 40 and pasos[i][0] > 4 * mov) or (pasos[i][1] > 0.3 and pasos[i][1] > 4 * esc):
        cortes_cara.append(i)
cortes = []
for i in sorted(set(cortes_imagen) | set(cortes_cara)):
    if not cortes or i - cortes[-1] > 3:
        cortes.append(i)

with open(os.path.join(dir_pieza, "cara.json"), "w", encoding="utf-8") as fh:
    json.dump({"fps": FPS, "ancho": 1080, "alto": 1920, "cuadros": cuadros, "cortes": cortes}, fh)
con = [c for c in cuadros if c]
anchos = np.array([c[2] for c in con]) / 1080
ys = np.array([c[1] for c in con]) / 1920
print(f"OK: {len(cuadros)} cuadros en {time.time() - t0:.0f}s | cara en {len(con)} | {len(cortes)} cortes")
print(f"ancho de cara / ancho de cuadro: p5 {np.percentile(anchos, 5):.3f} p50 {np.median(anchos):.3f} p95 {np.percentile(anchos, 95):.3f}")
print(f"ojos y / alto: p5 {np.percentile(ys, 5):.3f} p50 {np.median(ys):.3f} p95 {np.percentile(ys, 95):.3f}")
