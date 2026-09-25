"""Separa una lámina de íconos (grilla sobre fondo liso) en PNGs con fondo transparente.

Uso: node scripts/turno.mjs python scripts/recortar-iconos.py <lamina.png> <carpeta_salida> <nombres por fila, separados por coma; filas con />
  ej: ... PACKS/ICONOS/_set.png PACKS/ICONOS "bot,videos,estructura,crecimiento/mensaje-noche,turno,presupuesto,sistema"

Cómo: detecta cada ícono como una mancha distinta del fondo y lo asigna a su celda de la grilla; saca el fondo con dos
modelos (u2net deja los interiores sólidos pero se come las formas blancas sobre gris claro; isnet conserva esas
formas pero deja interiores semitransparentes): silueta = unión de los dos con los huecos rellenos, borde = alfa suave
de los dos, y el color del borde se descontamina del gris del fondo (sin halo claro sobre fondos oscuros).
"""
import gc
import os
import sys

import numpy as np
from PIL import Image
from rembg import new_session, remove
from scipy import ndimage as ndi

lamina, carpeta, nombres_arg = sys.argv[1], sys.argv[2], sys.argv[3]
NOMBRES = [fila.split(",") for fila in nombres_arg.split("/")]
FILAS, COLS = len(NOMBRES), len(NOMBRES[0])
MARGEN = 18

src = Image.open(lamina).convert("RGB")
im = np.asarray(src).astype(np.float32)
H, W, _ = im.shape
borde = np.concatenate([im[:4].reshape(-1, 3), im[-4:].reshape(-1, 3), im[:, :4].reshape(-1, 3), im[:, -4:].reshape(-1, 3)])
FONDO = np.median(borde, axis=0)
mancha = np.abs(im - FONDO).max(axis=2) > 10
etiquetas, n = ndi.label(ndi.binary_dilation(mancha, iterations=3))
areas = ndi.sum(mancha, etiquetas, range(1, n + 1))
cajas = {}
for i, sl in enumerate(ndi.find_objects(etiquetas)):
    if areas[i] <= 150:
        continue
    cy, cx = (sl[0].start + sl[0].stop) / 2, (sl[1].start + sl[1].stop) / 2
    nombre = NOMBRES[min(FILAS - 1, int(cy // (H / FILAS)))][min(COLS - 1, int(cx // (W / COLS)))]
    x0, y0, x1, y1 = sl[1].start, sl[0].start, sl[1].stop, sl[0].stop
    if nombre in cajas:
        a = cajas[nombre]
        x0, y0, x1, y1 = min(a[0], x0), min(a[1], y0), max(a[2], x1), max(a[3], y1)
    cajas[nombre] = (x0, y0, x1, y1)
faltan = [nm for fila in NOMBRES for nm in fila if nm not in cajas]
if faltan:
    sys.exit(f"No encontré ícono para: {faltan}")

recortes = {
    nombre: src.crop((max(0, x0 - MARGEN), max(0, y0 - MARGEN), min(W, x1 + MARGEN), min(H, y1 + MARGEN)))
    for nombre, (x0, y0, x1, y1) in cajas.items()
}
# Un modelo por vez: los dos cargados juntos no entran en la RAM libre de esta PC.
alfas = {nombre: [] for nombre in recortes}
for modelo in ("u2net", "isnet-general-use"):
    sesion = new_session(modelo)
    for nombre, recorte in recortes.items():
        alfas[nombre].append(np.asarray(remove(recorte, session=sesion, only_mask=True)).astype(np.float32) / 255)
    del sesion
    gc.collect()

os.makedirs(carpeta, exist_ok=True)
for nombre, recorte in recortes.items():
    suave = np.maximum(*alfas[nombre])
    solido = ndi.binary_fill_holes(suave > 0.5)
    interior = ndi.binary_erosion(solido, iterations=2)
    alfa = np.where(interior, 1.0, np.where(solido, np.maximum(suave, 0.5), suave * (suave > 0.08)))
    rgb = np.asarray(recorte).astype(np.float32)
    a = np.clip(alfa, 1e-3, 1)[..., None]
    limpio = np.clip((rgb - (1 - a) * FONDO) / a, 0, 255)
    rgba = np.dstack([limpio, alfa * 255]).astype(np.uint8)
    ys, xs = np.nonzero(alfa > 0.02)
    rgba = rgba[max(0, ys.min() - 4) : ys.max() + 5, max(0, xs.min() - 4) : xs.max() + 5]
    Image.fromarray(rgba, "RGBA").save(os.path.join(carpeta, f"{nombre}.png"))
    print(f"  {nombre}.png {rgba.shape[1]}x{rgba.shape[0]}", flush=True)
print(f"OK: {len(cajas)} íconos en {carpeta}")
