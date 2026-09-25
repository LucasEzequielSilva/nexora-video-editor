"""Genera assets/catalogo/musica.md desde out/verif/musica-perfiles.json (scripts/perfil-musica.py) + biblioteca.json.

Uso: python scripts/catalogo-musica.py
"""
import json
import os
import re

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
perfiles = json.load(open(os.path.join(RAIZ, "out", "verif", "musica-perfiles.json"), encoding="utf-8"))
lib = {e["id"]: e for e in json.load(open(os.path.join(RAIZ, "assets", "biblioteca.json"), encoding="utf-8"))}

COMERCIAL = re.compile(
    r"drake|weeknd|after hours|kendrick|kanye|metro.?boomin|future|irrepressibles|put your head on my shoulder|bloody mary|dana and alden|yeat|lil uzi|ken car|central cee|ice spice|j\.i\.d|m\.i\.a|"
    r"hans zimmer|zimmer|interstellar|oppenheimer|tom odell|rag.?n.?bone|adele|set fire|frank ocean|steve lacy|"
    r"tyler|phoenix|empire of the sun|billy idol|tv.?girl|cinematic orchestra|yann tiersen|ryuichi|sakamoto|"
    r"mf doom|the game|feid|tommy richman|bakar|jon bellion|imagine dragons|mr\.? ?kitty|alexander rybak|"
    r"social network|project x|aloe blacc|young folks|golden hour|another love|in this shirt|caravan|"
    r"connor price|d savage|21 savage|tings|cochise",
    re.I,
)


def tipo(p):
    if p["libre_por_nombre"]:
        return "libre/biblioteca"
    if COMERCIAL.search(p["archivo"]):
        return "COMERCIAL"
    return "sin confirmar"


def caracter(p):
    partes = []
    partes.append("pareja" if p["dinamica_db"] < 8 else "con subidas" if p["dinamica_db"] < 16 else "muy dinámica")
    partes.append("oscura" if p["brillo_hz"] < 900 else "brillante" if p["brillo_hz"] > 2000 else "media")
    if p["arranca_s"] > 30:
        partes.append(f"intro larga ({p['arranca_s']} s)")
    return ", ".join(partes)


# El nombre sale de la biblioteca (fuente de verdad): Lucas renombra para marcar favoritos ("... ganador.mp3").
for p in perfiles:
    if p["id"] in lib:
        p["archivo"] = os.path.basename(lib[p["id"]]["ruta"])
filas = sorted((p for p in perfiles if "error" not in p), key=lambda p: (tipo(p) != "libre/biblioteca", tipo(p) == "COMERCIAL", p["archivo"].lower()))
lineas = [
    "# Catálogo de música de fondo",
    "",
    "Generado con `python scripts/catalogo-musica.py` desde mediciones reales (`scripts/perfil-musica.py`, librosa): no se",
    "puede escuchar desde acá, así que todo lo de \"carácter\" sale de números, no de oído. **Lucas elige a oído.**",
    "",
    "- **Derechos**: `libre/biblioteca` = el nombre dice sin copyright, NCS o es de biblioteca (ANBR, Danny Shields, Ardie",
    "  Son, Yehezkel Raz, Soundride, DivKid). `COMERCIAL` = tema de artista conocido: en un video que sube Nexora, Instagram",
    "  o TikTok pueden silenciar el audio. `sin confirmar` = no se sabe por el nombre.",
    "- **Dinámica** (dB entre las partes suaves y las fuertes): < 8 dB es una cama pareja que no compite con la voz;",
    "  > 16 dB tiene crescendos que tapan la voz en los picos.",
    "- **Arranca**: segundo donde la energía llega cerca del máximo (antes es intro).",
    "- ⭐ = Lucas lo marcó como ganador (le agrega \"ganador\" al nombre del archivo).",
    "- Para usarlo: copia liviana a `public/recursos/` y bloque `musica` en `props.json` (ver `MusicaConfig` en",
    "  `src/pieza/types.ts`), con `inicioS` en un tiempo fuerte.",
    "",
    "| id | Tema | Derechos | BPM | Dinámica | Brillo | Arranca | Duración | Carácter (por datos) | Usado en |",
    "|---|---|---|---|---|---|---|---|---|---|",
]
vistos = set()
for p in filas:
    clave = re.sub(r"\(1\)|\s+", "", p["archivo"].lower())
    duplicado = " (duplicado)" if clave in vistos else ""
    vistos.add(clave)
    usado = ", ".join(lib.get(p["id"], {}).get("usado_en", [])) or "-"
    if "ganador" in p["archivo"].lower():
        usado = "⭐ elegido por Lucas; " + usado
    lineas.append(
        f"| {p['id']} | {p['archivo'].replace('|', '/')}{duplicado} | {tipo(p)} | {p['bpm']} | {p['dinamica_db']} dB | "
        f"{p['brillo_hz']} Hz | {p['arranca_s']} s | {p['duracion_s']} s | {caracter(p)} | {usado} |"
    )
salida = os.path.join(RAIZ, "assets", "catalogo", "musica.md")
open(salida, "w", encoding="utf-8").write("\n".join(lineas) + "\n")
print(f"OK: {len(filas)} temas -> {salida}")
