"""Hoja de control de íconos recortados: cada PNG con alfa sobre fondo oscuro, blanco de escena y color fuerte.
Uso: python scripts/hoja-iconos.py <glob de PNGs> <salida.png>
"""
import glob
import sys

from PIL import Image, ImageDraw, ImageFont

archivos = sorted(glob.glob(sys.argv[1]))
FONDOS = [(17, 17, 17), (246, 245, 242), (37, 211, 102)]
T = 220
lab = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 15)
hoja = Image.new("RGB", (T * len(FONDOS) + 150, T * len(archivos)), "white")
d = ImageDraw.Draw(hoja)
for i, f in enumerate(archivos):
    ic = Image.open(f).convert("RGBA")
    ic.thumbnail((T - 12, T - 12))
    d.text((6, i * T + T // 2 - 8), f.replace("\\", "/").split("/")[-1][:20], fill="black", font=lab)
    for j, c in enumerate(FONDOS):
        celda = Image.new("RGBA", (T, T), c + (255,))
        celda.alpha_composite(ic, ((T - ic.width) // 2, (T - ic.height) // 2))
        hoja.paste(celda.convert("RGB"), (150 + j * T, i * T))
hoja.save(sys.argv[2])
print(f"{len(archivos)} íconos -> {sys.argv[2]}")
