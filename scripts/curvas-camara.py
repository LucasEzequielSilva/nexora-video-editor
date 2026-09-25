"""Curvas y estadísticas de un analisis.json de scripts/analizar-camara.py.

Uso: python scripts/curvas-camara.py <analisis.json> <salida.png> [resumen.json]
Grafica: dónde quedan los ojos en pantalla (x, y), el ancho de la cara (zoom), la cámara medida sobre el fondo
(zoom y paneo acumulados por tramo entre cortes) y los cortes. Imprime percentiles y velocidades.
"""
import json
import sys

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

d = json.load(open(sys.argv[1], encoding="utf-8"))
C = d["cuadros"]
fps = d["fps"]
t = np.array([c["t"] for c in C])
nan = float("nan")
ox = np.array([c["cara"][0] if c["cara"] else nan for c in C])
oy = np.array([c["cara"][1] if c["cara"] else nan for c in C])
ancho = np.array([c["cara"][2] if c["cara"] else nan for c in C])
incl = np.array([c["cara"][3] if c["cara"] else nan for c in C])
dif = np.array([c["dif"] for c in C])

# Cortes: salto de diferencia muy por encima de lo normal, o el fondo deja de poder seguirse con un salto de cara.
umbral = np.nanmedian(dif) + 6 * np.nanmedian(np.abs(dif - np.nanmedian(dif)))
cortes = [i for i in range(1, len(C)) if dif[i] > max(umbral, 12)]

# Cámara acumulada por tramo: se reinicia en cada corte.
esc = np.full(len(C), nan)
px = np.full(len(C), nan)
py = np.full(len(C), nan)
rot = np.full(len(C), nan)
s_acc, x_acc, y_acc, r_acc = 1.0, 0.0, 0.0, 0.0
for i, c in enumerate(C):
    if i in cortes or i == 0:
        s_acc, x_acc, y_acc, r_acc = 1.0, 0.0, 0.0, 0.0
    elif c["mov"]:
        s, r, dx, dy, _ = c["mov"]
        s_acc *= s
        x_acc += dx
        y_acc += dy
        r_acc += r
    esc[i], px[i], py[i], rot[i] = s_acc, x_acc, y_acc, r_acc

movs = [c["mov"] for c in C if c["mov"]]
vel_escala = np.array([abs(m[0] - 1) for m in movs]) * fps
vel_pan = np.array([np.hypot(m[2], m[3]) for m in movs]) * fps
vel_rot = np.array([abs(m[1]) for m in movs]) * fps


def pct(a, ps=(5, 25, 50, 75, 95)):
    a = a[~np.isnan(a)]
    return {f"p{p}": round(float(np.percentile(a, p)), 4) for p in ps} if len(a) else {}


resumen = {
    "cuadros": len(C),
    "con_cara": int((~np.isnan(ox)).sum()),
    "con_mov_fondo": len(movs),
    "cortes_s": [round(float(t[i]), 2) for i in cortes],
    "ojos_x": pct(ox),
    "ojos_y": pct(oy),
    "ancho_cara": pct(ancho),
    "inclinacion_ojos_grados": pct(incl),
    "vel_zoom_por_s": pct(vel_escala),
    "vel_paneo_por_s_frac_cuadro": pct(vel_pan),
    "vel_rotacion_grados_por_s": pct(vel_rot),
    "cuadros_con_zoom_moviendose_%": round(100 * float((vel_escala > 0.02).mean()), 1) if len(movs) else None,
    "cuadros_con_paneo_%": round(100 * float((vel_pan > 0.01).mean()), 1) if len(movs) else None,
}
print(json.dumps(resumen, ensure_ascii=False, indent=1))
if len(sys.argv) > 3:
    json.dump(resumen, open(sys.argv[3], "w", encoding="utf-8"), ensure_ascii=False, indent=1)

fig, ax = plt.subplots(6, 1, figsize=(18, 17), sharex=True)
ax[0].plot(t, ox, lw=0.8, label="ojos x (0..1)")
ax[0].plot(t, oy, lw=0.8, label="ojos y (0..1)")
ax[0].set_ylabel("ojos en pantalla")
ax[1].plot(t, ancho, lw=0.8, color="C2")
ax[1].set_ylabel("ancho de cara\n(zoom)")
ax[2].plot(t, esc, lw=0.8, color="C3")
ax[2].set_ylabel("zoom de cámara\nacumulado (fondo)")
ax[3].plot(t, px, lw=0.8, label="paneo x")
ax[3].plot(t, py, lw=0.8, label="paneo y")
ax[3].set_ylabel("paneo acumulado\n(fracción de cuadro)")
ax[4].plot(t, rot, lw=0.8, color="C4", label="rotación cámara")
ax[4].plot(t, incl, lw=0.5, color="C5", alpha=0.6, label="inclinación ojos")
ax[4].set_ylabel("grados")
ax[5].plot(t, dif, lw=0.6, color="gray")
ax[5].set_ylabel("dif. cuadro")
for a in ax:
    for i in cortes:
        a.axvline(t[i], color="red", lw=0.4, alpha=0.5)
    a.grid(alpha=0.3)
    if a.get_legend_handles_labels()[0]:
        a.legend(loc="upper right", fontsize=8)
ax[-1].set_xlabel("segundos")
ax[-1].set_xticks(np.arange(0, t[-1] + 1, 2))
plt.tight_layout()
plt.savefig(sys.argv[2], dpi=70)
print("->", sys.argv[2])
