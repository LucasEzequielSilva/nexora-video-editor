"""Genera con la API de Higgsfield (api.higgsfield.ai): sube los archivos locales, manda el pedido, espera y baja el resultado.

Uso: python scripts/higgsfield.py <modelo> <cuerpo.json> <salida> [--subir campo=archivo ...]
  modelo   ruta del modelo en la API (ej. kling-video/o3/video-edit); el catálogo está en GET /models
  cuerpo   JSON con los parámetros del modelo (ver su página en docs.higgsfield.ai/docs/models/...)
  salida   archivo donde se guarda el resultado (.mp4 o .png)
  --subir  sube un archivo local y pone su URL pública en `campo` del cuerpo; `campo[]` lo agrega a una lista
           (ej. --subir video_urls[]=out/ia/hook-real.mp4)
La credencial sale de la variable HF_KEY ("id:secreto") o del archivo que indique HF_KEY_FILE. Nunca se imprime.
"""
import json
import mimetypes
import os
import sys
import time
import urllib.request

API = "https://api.higgsfield.ai"
clave = os.environ.get("HF_KEY") or open(os.environ["HF_KEY_FILE"], encoding="utf-8").read().strip()
AUTH = {"Authorization": f"Key {clave}", "Content-Type": "application/json"}


def pedir(metodo, url, cuerpo=None, headers=AUTH):
    datos = json.dumps(cuerpo).encode() if cuerpo is not None else None
    req = urllib.request.Request(url, data=datos, method=metodo, headers=headers)
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read() or b"{}")


def subir(ruta):
    tipo = mimetypes.guess_type(ruta)[0] or "application/octet-stream"
    r = pedir("POST", f"{API}/files/generate-upload-url", {"content_type": tipo})
    req = urllib.request.Request(r["upload_url"], data=open(ruta, "rb").read(), method="PUT", headers=r.get("upload_headers") or {"Content-Type": tipo})
    urllib.request.urlopen(req, timeout=600).read()
    print(f"subido {ruta} ({os.path.getsize(ruta) / 1e6:.1f} MB)")
    return r["public_url"]


modelo, cuerpo_json, salida = sys.argv[1:4]
cuerpo = json.load(open(cuerpo_json, encoding="utf-8"))
args = sys.argv[4:]
for i, a in enumerate(args):
    if a == "--subir":
        campo, ruta = args[i + 1].split("=", 1)
        url = subir(ruta)
        if campo.endswith("[]"):
            cuerpo.setdefault(campo[:-2], []).append(url)
        else:
            cuerpo[campo] = url

r = pedir("POST", f"{API}/{modelo}", cuerpo)
rid = r["request_id"]
print(f"pedido {rid}: {r.get('status')}")
t0 = time.time()
while True:
    time.sleep(10)
    s = pedir("GET", f"{API}/requests/{rid}/status")
    estado = s.get("status")
    if estado in ("completed", "failed", "nsfw", "canceled", "cancelled"):
        break
    print(f"  {estado} ({time.time() - t0:.0f} s)", flush=True)
if estado != "completed":
    print("terminó en", estado, json.dumps(s, ensure_ascii=False)[:500])
    sys.exit(1)
medios = (s.get("video") and [s["video"]]) or s.get("videos") or s.get("images") or []
if not medios:
    print("sin resultado en la respuesta:", json.dumps(s, ensure_ascii=False)[:500])
    sys.exit(1)
os.makedirs(os.path.dirname(salida) or ".", exist_ok=True)
urllib.request.urlretrieve(medios[0]["url"], salida)
print(f"OK -> {salida} ({time.time() - t0:.0f} s)")
json.dump(s, open(salida + ".json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
