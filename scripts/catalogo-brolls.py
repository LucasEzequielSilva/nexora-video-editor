"""Genera assets/catalogo/brolls.md desde las descripciones verificadas (out/verif/broll-catalogo/lote-*.json) y
completa la descripción corta en assets/biblioteca.json de los b-rolls que no la tenían.

Uso: python scripts/catalogo-brolls.py
Las descripciones salen de mirar un cuadro por plano de cada clip (scripts/tiras-broll.py) y fueron verificadas contra
las imágenes por un segundo agente (workflow catalogo-brolls, 2026-09-24).
"""
import collections
import glob
import json
import os
import re

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
clips = {}
for f in sorted(glob.glob(os.path.join(RAIZ, "out", "verif", "broll-catalogo", "lote-*.json"))):
    for c in json.load(open(f, encoding="utf-8")):
        clips[c["id"]] = c
indice = {x["id"]: x for x in json.load(open(os.path.join(RAIZ, "out", "verif", "broll-tiras", "indice.json"), encoding="utf-8"))}
ruta_lib = os.path.join(RAIZ, "assets", "biblioteca.json")
lib = json.load(open(ruta_lib, encoding="utf-8"))
por_id = {e["id"]: e for e in lib}

conceptos = collections.defaultdict(list)
for cid, c in clips.items():
    for k in c.get("conceptos", []):
        conceptos[re.sub(r"\s+", " ", k.strip().lower())].append(cid)

lineas = [
    "# Catálogo de b-rolls",
    "",
    f"{len(clips)} clips de `PACKS/BROLL CINEMÁTICO/`. Cada descripción sale de mirar un cuadro por plano del clip y fue",
    "verificada contra las imágenes por un segundo agente (se corrigieron 308 de 393). Solo describe lo visible.",
    "Generado con `python scripts/catalogo-brolls.py`.",
    "",
    "**Cómo usarlo**: buscá el concepto de la frase en el índice, leé la ficha (sobre todo *Evitar* y los planos: muchos",
    "clips son compilados con cortes internos), usá `inicioS` = *Mejor inicio* o el segundo del plano que sirve, y",
    "`npm run recursos -- usar <id> <slug>`. Una tira con un cuadro por plano está en `out/verif/broll-tiras/<id>.jpg`.",
    "",
    "## Índice por concepto",
    "",
]
for k in sorted(conceptos, key=lambda k: (-len(conceptos[k]), k)):
    if len(conceptos[k]) >= 2:
        lineas.append(f"- **{k}**: {', '.join(sorted(conceptos[k]))}")
sueltos = sorted(k for k in conceptos if len(conceptos[k]) == 1)
lineas += ["", "Conceptos de un solo clip: " + "; ".join(f"{k} ({conceptos[k][0]})" for k in sueltos), "", "## Fichas", ""]

for cid in sorted(clips, key=lambda x: int(x.split("-")[1])):
    c, i = clips[cid], indice.get(cid, {})
    e = por_id.get(cid, {})
    cortes = i.get("cortes_internos_s", [])
    lineas += [
        f"### {cid} — {c['resumen']}",
        f"`{e.get('ruta', i.get('archivo', ''))}` · {i.get('duracion_s', '?')} s · {i.get('resolucion', '?')} · "
        f"{'cortes internos en ' + ', '.join(str(x) for x in cortes) + ' s' if cortes else 'un solo plano'} · "
        f"mejor inicio {c.get('mejor_inicio_s', 0)} s" + (f" · usado en {', '.join(e['usado_en'])}" if e.get("usado_en") else ""),
        "",
        "- Planos: " + " | ".join(f"{q['t']} s: {q['muestra']}" for q in c.get("cuadros", [])),
        f"- Estética: {c.get('estetica', '')} · Movimiento: {c.get('movimiento', '')}",
        f"- Sirve para: {', '.join(c.get('conceptos', []))}",
    ]
    if c.get("evitar"):
        lineas.append(f"- **Evitar**: {c['evitar']}")
    if c.get("texto_visible"):
        lineas.append(f"- Texto visible: {c['texto_visible']}")
    lineas.append("")
    if e and not e.get("descripcion"):
        e["descripcion"] = f"{c['resumen']} Sirve para: {', '.join(c.get('conceptos', [])[:5])}."

salida = os.path.join(RAIZ, "assets", "catalogo", "brolls.md")
open(salida, "w", encoding="utf-8").write("\n".join(lineas) + "\n")
open(ruta_lib, "w", encoding="utf-8").write(json.dumps(lib, ensure_ascii=False, indent=2) + "\n")
print(f"OK: {len(clips)} fichas, {len(conceptos)} conceptos -> {salida}")
