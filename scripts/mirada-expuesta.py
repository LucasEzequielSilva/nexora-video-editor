"""Momentos en que se ve al que habla sin mirar a cámara (Lucas, 2026-09-30: "no llegás a taparme por completo, se llega a
ver cómo cambio la cara al mirar la cámara").

Uso: python scripts/mirada-expuesta.py <slug>
Necesita out/verif/<slug>/mirada.json (node scripts/turno.mjs python scripts/mirada.py public/piezas/<slug>/video-jc.mp4
out/verif/<slug>/mirada.json). Trabaja en el tiempo de video-jc: las anclas de props.json se resuelven sobre words.json y
se pasan a words.jc.json (words.json es una subsecuencia). Revisa:
  1. muestras fuera de cámara que no tapa ninguna escena ni b-roll ni saca un recorte;
  2. los bordes cara <-> escena: fuera de cámara durante el fundido (entra en 0.47 s, sale en 0.33 s) + 0.25 s de margen.
Los bordes entre dos escenas pegadas no se revisan: la de salida queda opaca debajo (`encadenada`).
"""
import json
import re
import sys

slug = sys.argv[1]
D = f"public/piezas/{slug}"
J = [w for s in json.load(open(f"{D}/words.jc.json", encoding="utf-8"))["segments"] for w in s["words"]]
O = [w for s in json.load(open(f"{D}/words.json", encoding="utf-8"))["segments"] for w in s["words"]]
P = json.load(open(f"{D}/props.json", encoding="utf-8"))
R = json.load(open(f"cortes/{slug}-recortes.json", encoding="utf-8"))["recortes"]
M = json.load(open(f"out/verif/{slug}/mirada.json"))["muestras"]
norm = lambda t: re.sub(r'[.,;:¿?¡!"]', "", t.lower()).strip()

mapa, j = [], 0
for w in O:
    while j < len(J) and norm(J[j]["word"]) != norm(w["word"]):
        j += 1
    mapa.append(J[j] if j < len(J) else None)
    j += 1


def ancla(a):
    if a == "fin":
        return J[-1]["end"] + 5
    if "palabra" not in a:
        return None
    hits = [i for i, w in enumerate(O) if norm(w["word"]) == norm(a["palabra"])]
    n = a.get("n", 1)
    if len(hits) < n or mapa[hits[n - 1]] is None:
        return None
    wj = mapa[hits[n - 1]]
    return (wj["end"] if a.get("fin") else wj["start"]) + a.get("offsetMs", 0) / 1000


tapa = sorted(
    (a, b, o.get("escena", o.get("archivo", "")))
    for o in P["overlays"]
    if o["tipo"] in ("escena", "broll")
    for a, b in [(ancla(o["desde"]), ancla(o["hasta"]))]
    if a is not None and b is not None
)
quita = [(r["desde"], r["hasta"]) for r in R]

# Misma regla que scripts/cortar.mjs y la herramienta de tomas.
MIR = dict(irisCentro=0.505, pesoGiro=0.25, umbral=0.045, girado=0.5, giroCentro=-0.03, giroSinIris=0.1)


def estado(m):
    if m[1] is None:
        return -1
    if abs(m[1]) > MIR["girado"]:
        return 0
    if m[4] is not None:
        return 1 if abs(m[4] - MIR["irisCentro"] - MIR["pesoGiro"] * m[1]) < MIR["umbral"] else 0
    return 1 if abs(m[1] - MIR["giroCentro"]) < MIR["giroSinIris"] else 0


dentro = lambda t, iv: any(a <= t <= b for a, b, *_ in iv)
fuera = lambda a, b: [round(m[0], 1) for m in M if a <= m[0] <= b and estado(m) == 0]

sueltas = [m[0] for m in M if estado(m) == 0 and not dentro(m[0], tapa) and not dentro(m[0], quita)]
print(f"1. fuera de cámara sin tapar: {len(sueltas)} muestras" + (f" (jc {sueltas})" if sueltas else ""))
malos = 0
for i, (a, b, n) in enumerate(tapa):
    antes = tapa[i - 1][1] if i else -9
    despues = tapa[i + 1][0] if i + 1 < len(tapa) else 999
    if a - antes > 0.2 and fuera(a - 0.25, a + 0.47 + 0.25):
        malos += 1
        print(f"   ENTRA {n} en jc {a:.2f}: fuera de cámara en {fuera(a - 0.25, a + 0.72)} -> adelantar la escena")
    if despues - b > 0.2 and fuera(b - 0.33 - 0.25, b + 0.25):
        malos += 1
        print(f"   SALE  {n} en jc {b:.2f}: fuera de cámara en {fuera(b - 0.58, b + 0.25)} -> estirar la escena")
print(f"2. bordes cara <-> escena con el giro a la vista: {malos}")
sys.exit(1 if sueltas or malos else 0)
