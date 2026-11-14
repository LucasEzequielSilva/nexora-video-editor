"""Recorta al que habla (fondo transparente) con Robust Video Matting (CPU).

Uso: node scripts/turno.mjs python scripts/silueta.py public/piezas/<slug> [--desde S --salida persona-2.webm]
Lee   video.mp4 (la pieza final, ya recortada)
Crea  persona.webm  VP9 con alfa, 720x1280, el que habla sin fondo (para ponerlo encima de las escenas)
Si se corta por falta de memoria, --desde retoma en ese segundo (arranca 1 s antes para que el modelo se asiente y
descarta ese segundo) y las partes se unen con scripts/unir-silueta.py.
La cara por cuadro (cara.json) la saca scripts/cara.py con YuNet: la silueta solo daba la frente estimada.
"""
import os, subprocess, sys, time

import numpy as np
import torch

dir_pieza = sys.argv[1]
opciones = dict(zip(sys.argv[2::2], sys.argv[3::2]))
desde = float(opciones.get("--desde", 0))
salida = opciones.get("--salida", "persona.webm")
calentar = min(desde, 1.0)
entrada = os.path.join(dir_pieza, "video.mp4")
W, H = 720, 1280
FPS = 30

torch.set_num_threads(max(1, (os.cpu_count() or 4) - 4))
modelo = torch.hub.load("PeterL1n/RobustVideoMatting", "mobilenetv3", trust_repo=True).eval()

lector = subprocess.Popen(
    ["ffmpeg", "-v", "error", "-ss", f"{desde - calentar:.3f}", "-i", entrada, "-vf", f"scale={W}:{H},fps={FPS}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
    stdout=subprocess.PIPE,
)
escritor = subprocess.Popen(
    ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
     "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "3M", "-deadline", "realtime", "-cpu-used", "8",
     # Sin row-mt y con 2 hilos: con ~1 GB libre y el modelo cargado, los workers multihilo de libvpx no conseguían
     # memoria ("Failed to allocate cpi->vp9_bitstream_worker_data", 2026-09-28).
     "-threads", "2", "-auto-alt-ref", "0", os.path.join(dir_pieza, salida)],
    stdin=subprocess.PIPE,
)


rec = [None] * 4
t0 = time.time()
n = 0
descartar = round(calentar * FPS)
with torch.no_grad():
    while True:
        buf = lector.stdout.read(W * H * 3)
        if len(buf) < W * H * 3:
            break
        rgb = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
        src = torch.from_numpy(rgb.copy()).permute(2, 0, 1)[None].float() / 255
        fgr, pha, *rec = modelo(src, *rec, downsample_ratio=0.4)
        alfa = pha[0, 0].numpy()
        color = (fgr[0].permute(1, 2, 0).numpy().clip(0, 1) * 255).astype(np.uint8)
        n += 1
        if n <= descartar:
            continue
        escritor.stdin.write(np.dstack([color, (alfa * 255).astype(np.uint8)]).tobytes())
        if n % 150 == 0:
            print(f"  {n} cuadros ({n / (time.time() - t0):.1f} cuadros/s)", flush=True)

escritor.stdin.close()
escritor.wait()
lector.wait()

print(f"OK: {n - descartar} cuadros desde {desde:.2f}s en {time.time() - t0:.0f}s | {salida}")
