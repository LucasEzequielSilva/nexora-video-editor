"""Recorta al que habla (fondo transparente) con Robust Video Matting (CPU).

Uso: node scripts/turno.mjs python scripts/silueta.py public/piezas/<slug>
Lee   video.mp4 (la pieza final, ya recortada)
Crea  persona.webm  VP9 con alfa, 720x1280, el que habla sin fondo (para ponerlo encima de las escenas)
La cara por cuadro (cara.json) la saca scripts/cara.py con YuNet: la silueta solo daba la frente estimada.
"""
import os, subprocess, sys, time

import numpy as np
import torch

dir_pieza = sys.argv[1]
entrada = os.path.join(dir_pieza, "video.mp4")
W, H = 720, 1280
FPS = 30

torch.set_num_threads(max(1, (os.cpu_count() or 4) - 4))
modelo = torch.hub.load("PeterL1n/RobustVideoMatting", "mobilenetv3", trust_repo=True).eval()

lector = subprocess.Popen(
    ["ffmpeg", "-v", "error", "-i", entrada, "-vf", f"scale={W}:{H},fps={FPS}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
    stdout=subprocess.PIPE,
)
escritor = subprocess.Popen(
    ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
     "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "3M", "-deadline", "realtime", "-cpu-used", "8",
     "-row-mt", "1", "-auto-alt-ref", "0", os.path.join(dir_pieza, "persona.webm")],
    stdin=subprocess.PIPE,
)


rec = [None] * 4
t0 = time.time()
n = 0
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
        escritor.stdin.write(np.dstack([color, (alfa * 255).astype(np.uint8)]).tobytes())
        n += 1
        if n % 150 == 0:
            print(f"  {n} cuadros ({n / (time.time() - t0):.1f} cuadros/s)", flush=True)

escritor.stdin.close()
escritor.wait()
lector.wait()

print(f"OK: {n} cuadros en {time.time() - t0:.0f}s | persona.webm")
