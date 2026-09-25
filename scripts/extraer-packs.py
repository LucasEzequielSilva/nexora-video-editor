"""Extrae zips de packs (las descargas partidas de Google Drive) dentro del proyecto, sin pisar nada.

Uso: python scripts/extraer-packs.py <zip> [<zip> ...]
- Los nombres vienen en Unicode descompuesto (NFD, "A" + tilde aparte, típico de Mac): se normalizan a NFC. Sin esto
  Windows crea una segunda "BROLL CINEMÁTICO" que se ve igual pero es otra carpeta, y el catálogo se rompe.
- Si el archivo ya existe con el mismo tamaño, se saltea. Si existe con otro tamaño, NO se pisa: queda en el log.
- Log: out/verif/extraccion-packs.json (extraídos, salteados, conflictos).
"""
import json
import os
import shutil
import sys
import time
import unicodedata
import zipfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
log = {"extraidos": [], "salteados": 0, "conflictos": []}
t0 = time.time()
for ruta_zip in sys.argv[1:]:
    with zipfile.ZipFile(ruta_zip) as z:
        for info in z.infolist():
            if info.is_dir():
                continue
            nombre = unicodedata.normalize("NFC", info.filename)
            if not nombre.startswith("PACKS/") or ".." in nombre.split("/"):
                log["conflictos"].append({"archivo": nombre, "motivo": "fuera de PACKS/"})
                continue
            destino = os.path.join(RAIZ, *nombre.split("/"))
            if os.path.exists(destino):
                if os.path.getsize(destino) == info.file_size:
                    log["salteados"] += 1
                else:
                    log["conflictos"].append({"archivo": nombre, "motivo": f"existe con otro tamaño ({os.path.getsize(destino)} vs {info.file_size})"})
                continue
            os.makedirs(os.path.dirname(destino), exist_ok=True)
            with z.open(info) as origen, open(destino + ".parcial", "wb") as salida:
                shutil.copyfileobj(origen, salida, 1024 * 1024)
            os.replace(destino + ".parcial", destino)
            log["extraidos"].append(nombre)
    print(f"  {os.path.basename(ruta_zip)}: {len(log['extraidos'])} extraídos, {log['salteados']} salteados, "
          f"{len(log['conflictos'])} conflictos ({time.time() - t0:.0f}s)", flush=True)

os.makedirs(os.path.join(RAIZ, "out", "verif"), exist_ok=True)
with open(os.path.join(RAIZ, "out", "verif", "extraccion-packs.json"), "w", encoding="utf-8") as fh:
    json.dump(log, fh, ensure_ascii=False, indent=1)
print(f"OK: {len(log['extraidos'])} extraídos, {log['salteados']} ya estaban, {len(log['conflictos'])} conflictos")
