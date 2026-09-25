"""Genera assets/catalogo/sonidos.md: la paleta en uso (SFX_FILES de src/reserva/components/sfx.tsx) y los perfiles
medidos de todos los SFX únicos del pack (out/verif/sfx-perfiles.json).

Uso: python scripts/catalogo-sfx.py
"""
import json
import os
import re

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
perfiles = json.load(open(os.path.join(RAIZ, "out", "verif", "sfx-perfiles.json"), encoding="utf-8"))
sfx_tsx = open(os.path.join(RAIZ, "src", "reserva", "components", "sfx.tsx"), encoding="utf-8").read()
bloque = sfx_tsx.split("export const SFX_FILES = {")[1].split("} as const;")[0]
golpes = dict(re.findall(r'^\s+"?([\w-]+)"?: ([\d.]+),$', sfx_tsx.split("SFX_HIT_SECONDS")[1], re.M))

paleta, comentario = [], ""
for linea in bloque.splitlines():
    linea = linea.strip()
    m = re.match(r"/\*\*(.*)\*/", linea) or re.match(r"//(.*)", linea)
    if m:
        comentario = m.group(1).strip()
        continue
    m = re.match(r'"?([\w-]+)"?: "([^"]+)"', linea)
    if m:
        paleta.append((m.group(1), m.group(2), golpes.get(m.group(1), "?"), comentario))

lineas = [
    "# Catálogo de sonidos",
    "",
    "Generado con `python scripts/catalogo-sfx.py`. Nadie escuchó nada desde acá: todo sale de mediciones (golpe, largo,",
    "envolvente, brillo, % de graves y de agudos). **Audible en celular** = energía arriba de 200 Hz; lo casi puro sub",
    "desaparece en el parlante de un teléfono. Reglas de uso en CLAUDE.md §8 (el riser es solo del hook; nada tipo",
    "riser en los zooms; el golpe va donde cierra la idea; siempre por debajo de la voz).",
    "",
    "## Paleta en uso (`SFX_FILES`, `<Sfx name at volume />`)",
    "",
    "| nombre | archivo | golpe (s) | para qué |",
    "|---|---|---|---|",
]
for nombre, archivo, golpe, com in paleta:
    lineas.append(f"| `{nombre}` | `public/{archivo}` | {golpe} | {com.replace('|', '/')} |")

lineas += ["", f"## Todos los SFX del pack ({len(perfiles)} únicos, copias agrupadas)", "",
           "| id | familia | largo útil | golpe | envolvente | brillo | graves % | agudos % | descripción | copias |",
           "|---|---|---|---|---|---|---|---|---|---|"]
for p in sorted(perfiles, key=lambda p: (p.get("familia") or "", p["id"])):
    agudos = p.get("agudos_pct")
    lineas.append(
        f"| {p['id']} | {p.get('familia', '')} | {p.get('largo_util_s', '?')} s | {p.get('golpe_s', '?')} s | "
        f"{p.get('envolvente', '')} | {p.get('brillo', p.get('centroide_hz', ''))} | {p.get('graves_pct', '')} | "
        f"{agudos if agudos is not None else '-'} | {(p.get('descripcion') or '').replace('|', '/')[:180]} | "
        f"{', '.join(p.get('copias', []))} |"
    )
salida = os.path.join(RAIZ, "assets", "catalogo", "sonidos.md")
open(salida, "w", encoding="utf-8").write("\n".join(lineas) + "\n")
print(f"OK: paleta {len(paleta)} + {len(perfiles)} perfiles -> {salida}")
