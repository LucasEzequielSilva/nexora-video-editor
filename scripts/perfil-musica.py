"""Perfil objetivo de cada tema de música de la biblioteca, para elegir sin adivinar (no se puede escuchar desde acá).

Uso: node scripts/turno.mjs python scripts/perfil-musica.py  ->  out/verif/musica-perfiles.json
Por tema: duración, tempo (BPM), nivel medio (dB RMS), brillo (centroide espectral, Hz), dinámica (rango de energía
en ventanas de 2 s, dB), segundo donde la energía llega al 80 % (cuánto tarda en "arrancar"), si el nombre dice
instrumental / sin copyright / de biblioteca, y la curva de energía cada 2 s (para ver drops y silencios).
"""
import json
import os
import re
import warnings

import librosa
import numpy as np

warnings.filterwarnings("ignore")
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
lib = json.load(open(os.path.join(RAIZ, "assets", "biblioteca.json"), encoding="utf-8"))
temas = [e for e in lib if e["categoria"] == "musica"]
SR = 22050
salida = []
for n, e in enumerate(temas, 1):
    ruta = os.path.join(RAIZ, e["ruta"])
    try:
        y, _ = librosa.load(ruta, sr=SR, mono=True, duration=240)
    except Exception as err:  # noqa: BLE001 - un archivo roto no frena el resto
        salida.append({"id": e["id"], "archivo": os.path.basename(ruta), "error": str(err)[:120]})
        continue
    tempo = float(np.atleast_1d(librosa.beat.beat_track(y=y, sr=SR)[0])[0])
    rms = librosa.feature.rms(y=y, frame_length=2048, hop_length=512)[0]
    db = 20 * np.log10(rms + 1e-9)
    centro = float(np.median(librosa.feature.spectral_centroid(y=y, sr=SR)[0]))
    ventana = int(2 * SR / 512)
    energia = [float(np.mean(db[i : i + ventana])) for i in range(0, len(db), ventana)]
    e_arr = np.array(energia)
    tope = np.percentile(e_arr, 90)
    arranca = next((i * 2 for i, v in enumerate(energia) if v >= tope - 3), 0)
    nombre = os.path.basename(ruta)
    bajo = nombre.lower()
    salida.append({
        "id": e["id"],
        "archivo": nombre,
        "duracion_s": round(len(y) / SR, 1),
        "bpm": round(tempo, 1),
        "nivel_db": round(float(np.median(db)), 1),
        "brillo_hz": round(centro),
        "dinamica_db": round(float(np.percentile(e_arr, 95) - np.percentile(e_arr, 10)), 1),
        "arranca_s": arranca,
        "instrumental_por_nombre": bool(re.search(r"instrumental|no backing vocals|lofi|beat|theme|music|soundtrack|piano", bajo)),
        "libre_por_nombre": bool(re.search(r"no ?copyright|sin copyright|ncs|anbr|danny shields|ardie son|yehezkel raz|soundridemusic|divkid", bajo)),
        "energia_cada_2s": [round(v, 1) for v in energia],
    })
    if n % 20 == 0:
        print(f"  {n}/{len(temas)}", flush=True)

json.dump(salida, open(os.path.join(RAIZ, "out", "verif", "musica-perfiles.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"OK: {len(salida)} temas -> out/verif/musica-perfiles.json")
