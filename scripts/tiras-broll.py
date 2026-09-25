"""Tira de cuadros por b-roll (con el segundo de cada cuadro) + cortes internos detectados, para describirlos
mirándolos en vez de adivinar. Sin cortes: 4 cuadros repartidos. Con cortes: un cuadro en el medio de cada plano
(hasta 8). Uso: python scripts/tiras-broll.py  ->  out/verif/broll-tiras/<id>.jpg + indice.json
"""
import json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "out", "verif", "broll-tiras")
os.makedirs(OUT, exist_ok=True)
FONT = "C\\:/Windows/Fonts/arial.ttf"

lib = json.load(open(os.path.join(ROOT, "assets", "biblioteca.json"), encoding="utf-8"))
brolls = [e for e in lib if e["categoria"] == "broll-cinematico"]
ruta_indice = os.path.join(OUT, "indice.json")
# Los que ya tienen tira no se vuelven a procesar (el pack crece: solo se suman los nuevos).
previos = {x["id"]: x for x in json.load(open(ruta_indice, encoding="utf-8"))} if os.path.exists(ruta_indice) else {}
indice = []
for n, e in enumerate(brolls, 1):
    if e["id"] in previos and os.path.exists(previos[e["id"]]["tira"]):
        indice.append(previos[e["id"]])
        continue
    ruta = os.path.join(ROOT, e["ruta"])
    dur = e["duracion_seg"] or 1.0
    probe = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,r_frame_rate",
                            "-of", "csv=p=0", ruta], capture_output=True, text=True).stdout.strip().split(",")
    det = subprocess.run(["ffmpeg", "-hide_banner", "-i", ruta, "-an", "-vf", "scale=160:-2,select='gt(scene,0.33)',showinfo",
                          "-f", "null", "-"], capture_output=True, text=True, errors="ignore").stderr
    cortes = [round(float(t), 2) for t in re.findall(r"pts_time:([\d.]+)", det)]
    bordes = [0.0, *cortes, dur]
    planos = [(a, b) for a, b in zip(bordes, bordes[1:]) if b - a >= 0.3]
    if len(planos) <= 1:
        tiempos = [round(dur * f, 2) for f in (0.08, 0.33, 0.58, 0.83)]
    else:
        if len(planos) > 8:
            planos = [planos[round(i * (len(planos) - 1) / 7)] for i in range(8)]
        tiempos = [round((a + b) / 2, 2) for a, b in planos]
    salida = os.path.join(OUT, f"{e['id']}.jpg")
    entradas, filtros = [], []
    for i, t in enumerate(tiempos):
        entradas += ["-ss", str(t), "-i", ruta]
        filtros.append(f"[{i}:v]scale=240:426:force_original_aspect_ratio=increase,crop=240:426,setsar=1,"
                       f"drawtext=fontfile='{FONT}':text='{t}s':x=6:y=6:fontsize=22:fontcolor=yellow:box=1:boxcolor=black@0.6[f{i}]")
    subprocess.run(["ffmpeg", "-v", "error", "-y", *entradas, "-filter_complex",
                    ";".join(filtros) + ";" + "".join(f"[f{i}]" for i in range(len(tiempos))) + f"hstack=inputs={len(tiempos)}",
                    "-frames:v", "1", salida])
    indice.append({"id": e["id"], "archivo": os.path.basename(e["ruta"]), "duracion_s": dur,
                   "resolucion": f"{probe[0]}x{probe[1]}" if len(probe) >= 2 else "?", "fps": probe[2] if len(probe) >= 3 else "?",
                   "cortes_internos_s": cortes, "tira": salida.replace("\\", "/"), "cuadros_s": tiempos})
    if n % 25 == 0:
        print(f"{n}/{len(brolls)}", flush=True)

json.dump(indice, open(ruta_indice, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"OK: {len(indice)} tiras en {OUT}")
