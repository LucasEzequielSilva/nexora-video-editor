"""Hacia dónde mira el que habla, 5 veces por segundo: para separar las tomas dichas a cámara de las leídas de la pantalla.

Uso: node scripts/turno.mjs python scripts/mirada.py <clip crudo> <salida.json>
Lucas (2026-09-26): "pusiste partes donde está mirando la pantalla y leyendo, pero no necesariamente mirando a la cámara".
Dos señales:
  - cabeza (YuNet, 5 puntos): giro = (x nariz - x medio de los ojos) / distancia entre ojos (~0 de frente, +-1 girado);
    cabeceo = (y nariz - y ojos) / (y boca - y ojos) (~0.5 de frente).
  - ojos (MediaPipe Face Landmarker sobre un recorte de la cara en 1080): iris_h = posición del iris entre las comisuras
    (0.5 = centro), promedio de los dos ojos; iris_v igual en vertical. Leyendo la pantalla con la cabeza casi de frente, la
    cabeza no alcanza: en IMG_3525 las lecturas daban iris_h 0.55-0.58 y la toma a cámara 0.51.
Salida: { fps, muestras: [[t, giro, cabeceo, ancho_cara_rel, iris_h, iris_v] | [t, null]] } (iris null si MediaPipe no la ve)
Modelos: models/yunet/face_detection_yunet_2023mar.onnx y models/mediapipe/face_landmarker.task.
"""
import json
import os
import subprocess
import sys
import time

import cv2
import mediapipe as mp
import numpy as np
from mediapipe.tasks import python as mpt
from mediapipe.tasks.python import vision

video, salida = sys.argv[1], sys.argv[2]
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS = 5
W = 1080
CHICO = (360, 640)

sonda = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:stream_side_data=rotation",
                        "-of", "json", video], capture_output=True, text=True)
info = json.loads(sonda.stdout)["streams"][0]
ancho, alto = info["width"], info["height"]
rot = abs(int(next((d.get("rotation", 0) for d in info.get("side_data_list", []) if "rotation" in d), 0)))
if rot in (90, 270):
    ancho, alto = alto, ancho
H = int(round(alto * W / ancho / 2) * 2)

yunet = cv2.FaceDetectorYN.create(os.path.join(RAIZ, "models", "yunet", "face_detection_yunet_2023mar.onnx"), "", CHICO, 0.6, 0.3, 5000)
malla = vision.FaceLandmarker.create_from_options(
    vision.FaceLandmarkerOptions(base_options=mpt.BaseOptions(model_asset_path=os.path.join(RAIZ, "models", "mediapipe", "face_landmarker.task")), num_faces=1)
)


def posicion(lm, iris, a, b, eje):
    pa, pb, pi = getattr(lm[a], eje), getattr(lm[b], eje), getattr(lm[iris], eje)
    return (pi - pa) / (pb - pa) if abs(pb - pa) > 1e-6 else None


lector = subprocess.Popen(["ffmpeg", "-v", "error", "-i", video, "-vf", f"fps={FPS},scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], stdout=subprocess.PIPE)
muestras = []
t0 = time.time()
i = 0
while True:
    buf = lector.stdout.read(W * H * 3)
    if len(buf) < W * H * 3:
        break
    img = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
    t = round(i / FPS, 2)
    i += 1
    esc = W / CHICO[0]
    _, caras = yunet.detect(cv2.resize(img, CHICO))
    if caras is None or len(caras) == 0:
        muestras.append([t, None])
        continue
    c = max(caras, key=lambda r: r[2])
    fy = H / CHICO[1]
    ojo_r, ojo_l, nariz = np.array(c[4:6]), np.array(c[6:8]), np.array(c[8:10])
    boca = (np.array(c[10:12]) + np.array(c[12:14])) / 2
    medio = (ojo_r + ojo_l) / 2
    giro = float((nariz[0] - medio[0]) / max(1e-3, float(np.linalg.norm(ojo_l - ojo_r))))
    cabeceo = float((nariz[1] - medio[1]) / max(1e-3, float(boca[1] - medio[1])))
    # Recorte de la cara en alta para MediaPipe (en el cuadro vertical entero la cara es chica y no la encuentra).
    cx, cy = (c[0] + c[2] / 2) * esc, (c[1] + c[3] / 2) * fy
    lado = max(c[2] * esc, c[3] * fy) * 2.2
    x0, y0 = int(max(0, cx - lado / 2)), int(max(0, cy - lado / 2))
    x1, y1 = int(min(W, cx + lado / 2)), int(min(H, cy + lado / 2))
    iris_h = iris_v = None
    if x1 - x0 > 40 and y1 - y0 > 40:
        recorte = cv2.cvtColor(cv2.resize(img[y0:y1, x0:x1], (480, 480)), cv2.COLOR_BGR2RGB)
        r = malla.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(recorte)))
        if r.face_landmarks:
            lm = r.face_landmarks[0]
            hs = [posicion(lm, 468, 33, 133, "x"), posicion(lm, 473, 362, 263, "x")]
            vs = [posicion(lm, 468, 159, 145, "y"), posicion(lm, 473, 386, 374, "y")]
            if None not in hs:
                iris_h = round(float(np.mean(hs)), 3)
            if None not in vs:
                iris_v = round(float(np.mean(vs)), 3)
    muestras.append([t, round(giro, 3), round(cabeceo, 3), round(float(c[2]) / CHICO[0], 3), iris_h, iris_v])
lector.wait()

with open(salida, "w", encoding="utf-8") as fh:
    json.dump({"fps": FPS, "muestras": muestras}, fh)
con = [m for m in muestras if m[1] is not None]
iris = [m[4] for m in con if m[4] is not None]
print(f"OK: {len(muestras)} muestras en {time.time() - t0:.0f}s | cara en {len(con)} | iris en {len(iris)} -> {salida}")
if iris:
    print(f"iris_h p5 {np.percentile(iris, 5):.2f} p50 {np.median(iris):.2f} p95 {np.percentile(iris, 95):.2f}")
