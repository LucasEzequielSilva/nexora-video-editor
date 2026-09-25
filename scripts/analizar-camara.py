"""Mide cómo se mueve la "cámara" de un video de referencia y dónde queda la cara, cuadro a cuadro.

Uso: node scripts/turno.mjs python scripts/analizar-camara.py <video.mp4> <salida.json>

Por cuadro guarda (coordenadas normalizadas 0..1 del cuadro de salida):
  cara     [ojos_x, ojos_y, ancho_cara, inclinacion_grados, confianza] de YuNet (models/yunet/): el punto medio
           entre los ojos, el ancho de la cara (mide el zoom: a más ancho, más cerca) y la inclinación de la línea
           de los ojos (+ = el ojo derecho de la imagen más abajo)
  cabeza   [x, y_arriba, ancho] desde la silueta de Robust Video Matting (respaldo si no hay cara)
  mov      [escala, rot_grados, dx, dy, inliers] de la cámara respecto del cuadro anterior, medido SOLO sobre
           el fondo (la persona se enmascara): escala > 1 = zoom in, dx > 0 = el fondo se corre a la derecha
  dif      diferencia media con el cuadro anterior (0..255): un salto grande es un corte
"""
import json
import os
import subprocess
import sys
import time

import cv2
import numpy as np
import torch
from skimage.feature import ORB, match_descriptors
from skimage.measure import ransac
from skimage.transform import SimilarityTransform, resize

entrada, salida = sys.argv[1], sys.argv[2]
prob = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
                       "-of", "default=nw=1:nk=1", entrada], capture_output=True, text=True).stdout.split()
W0, H0 = int(prob[0]), int(prob[1])
W = 720
H = round(H0 * W / W0 / 2) * 2
FPS = 30
# Resolución de análisis (mitad): cara y fondo.
w, h = W // 2, H // 2

torch.set_num_threads(max(1, (os.cpu_count() or 4) - 4))
rvm = torch.hub.load("PeterL1n/RobustVideoMatting", "mobilenetv3", trust_repo=True).eval()
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
detector = cv2.FaceDetectorYN.create(os.path.join(RAIZ, "models", "yunet", "face_detection_yunet_2023mar.onnx"), "", (w, h), 0.7, 0.3, 5000)
orb = ORB(n_keypoints=500, fast_threshold=0.04)

lector = subprocess.Popen(
    ["ffmpeg", "-v", "error", "-i", entrada, "-vf", f"scale={W}:{H},fps={FPS}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
    stdout=subprocess.PIPE,
)


def cara_en(bgr):
    _, caras = detector.detect(bgr)
    if caras is None or len(caras) == 0:
        return None
    c = max(caras, key=lambda r: r[2])
    ojo_a, ojo_b = c[4:6], c[6:8]
    incl = float(np.degrees(np.arctan2(ojo_b[1] - ojo_a[1], ojo_b[0] - ojo_a[0])))
    return [round(float((ojo_a[0] + ojo_b[0]) / 2 / w), 4), round(float((ojo_a[1] + ojo_b[1]) / 2 / h), 4),
            round(float(c[2] / w), 4), round(incl, 2), round(float(c[-1]), 3)]


def cabeza_en(alfa):
    fg = alfa > 0.5
    if fg.sum() < 0.01 * fg.size:
        return None
    filas = fg.sum(1)
    y0 = int(np.argmax(filas > 0.02 * fg.shape[1]))
    fila = fg[min(fg.shape[0] - 1, y0 + int(0.06 * fg.shape[0]))]
    xs = np.nonzero(fila)[0]
    if len(xs) == 0:
        return None
    return [float(xs.mean()) / fg.shape[1], y0 / fg.shape[0], float(xs.max() - xs.min()) / fg.shape[1]]


def mov_fondo(prev, cur):
    """Similitud cámara prev->cur con puntos del fondo. None si no hay textura o es un corte."""
    try:
        orb.detect_and_extract(prev[0])
        k1, d1 = orb.keypoints, orb.descriptors
        orb.detect_and_extract(cur[0])
        k2, d2 = orb.keypoints, orb.descriptors
    except RuntimeError:
        return None

    def solo_fondo(k, d, fondo):
        ok = fondo[k[:, 0].astype(int).clip(0, h - 1), k[:, 1].astype(int).clip(0, w - 1)]
        return k[ok], d[ok]

    k1, d1 = solo_fondo(k1, d1, prev[1])
    k2, d2 = solo_fondo(k2, d2, cur[1])
    if len(k1) < 12 or len(k2) < 12:
        return None
    m = match_descriptors(d1, d2, cross_check=True, max_ratio=0.85)
    if len(m) < 12:
        return None
    src = k1[m[:, 0]][:, ::-1]
    dst = k2[m[:, 1]][:, ::-1]
    modelo, inl = ransac((src, dst), SimilarityTransform, min_samples=3, residual_threshold=1.5, max_trials=300)
    if modelo is None or inl.sum() < 10:
        return None
    return [float(modelo.scale), float(np.degrees(modelo.rotation)), float(modelo.translation[0] / w),
            float(modelo.translation[1] / h), int(inl.sum())]


cuadros = []
rec = [None] * 4
prev = None
prev_rgb = None
t0 = time.time()
with torch.no_grad():
    while True:
        buf = lector.stdout.read(W * H * 3)
        if len(buf) < W * H * 3:
            break
        rgb = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
        src = torch.from_numpy(rgb.copy()).permute(2, 0, 1)[None].float() / 255
        _, pha, *rec = rvm(src, *rec, downsample_ratio=0.4)
        alfa = pha[0, 0].numpy()
        chico = resize(rgb, (h, w), anti_aliasing=True)
        gris = chico @ np.array([0.299, 0.587, 0.114])
        fondo = resize(alfa, (h, w)) < 0.05
        # Margen: los bordes de la silueta y los bordes del cuadro dan puntos falsos.
        fondo[: h // 40], fondo[-h // 40 :], fondo[:, : w // 40], fondo[:, -w // 40 :] = False, False, False, False
        cur = (gris, fondo)
        dif = float(np.abs(chico - prev_rgb).mean() * 255) if prev_rgb is not None else 0.0
        bgr = np.ascontiguousarray((chico[:, :, ::-1] * 255).astype(np.uint8))
        cuadros.append({
            "t": round(len(cuadros) / FPS, 3),
            "cara": cara_en(bgr),
            "cabeza": cabeza_en(alfa),
            "mov": mov_fondo(prev, cur) if prev is not None else None,
            "dif": round(dif, 2),
        })
        prev, prev_rgb = cur, chico
        if len(cuadros) % 150 == 0:
            print(f"  {len(cuadros)} cuadros ({len(cuadros) / (time.time() - t0):.1f}/s)", flush=True)
lector.wait()

with open(salida, "w", encoding="utf-8") as fh:
    json.dump({"video": entrada, "fps": FPS, "ancho": W, "alto": H, "cuadros": cuadros}, fh)
con_cara = sum(c["cara"] is not None for c in cuadros)
con_mov = sum(c["mov"] is not None for c in cuadros)
print(f"OK: {len(cuadros)} cuadros en {time.time() - t0:.0f}s | cara en {con_cara} | movimiento de fondo en {con_mov}")
