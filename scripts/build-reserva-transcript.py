"""Genera src/reserva/transcript.ts desde el JSON de faster-whisper, aplicando correcciones manuales."""
import json, sys, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
src, out = sys.argv[1], sys.argv[2]
data = json.load(open(src, encoding="utf-8"))
words = [w for s in data["segments"] for w in s["words"]]

TEXT_FIX = {
    30: "nuestro,", 45: "cuentes", 68: "cuentes", 159: "decidís", 187: "weeklys,", 241: "nos", 248: "agendar",
    189: "el",  # 2do intento decía "la", el 3ro (el que se conserva) dice "el"
}
TIME_FIX = {
    70: (27.24, 27.47),   # "poco": whisper estira el final dentro del silencio
    71: (29.21, 29.40),   # "sobre": arranca al final del silencio real
    # 82-85: Lucas dice "cuál es el re..." (intento incompleto, se corta) y se corrige con
    # "y cuál es el recorrido...". Estos tiempos son del SEGUNDO intento (el que se conserva);
    # el primero cae dentro del corte [32.68, 45.48] en timeline.ts y nunca se usa.
    82: (45.54, 45.72),   # "y"
    83: (45.72, 45.82),   # "cuál"
    84: (45.82, 46.00),   # "es"
    85: (46.00, 46.08),   # "el"
    # 188-197: Lucas dice "portal de cliente, en la cual también vamos a tener weeklys," (1er intento),
    # "en la cual..." (2do intento, se corta), "en el cual también vamos a estar teniendo reuniones
    # semanales..." (3er intento, el que se conserva). Estos tiempos son del 3er intento; el whisper
    # original había fusionado "también" del 3er intento con el "en la cual" del 2do. El corte
    # [99.28, 106.60] en timeline.ts elimina los intentos 1 y 2 completos.
    188: (106.64, 106.80),  # "en"
    189: (106.80, 107.04),  # "el" (antes "la")
    190: (107.04, 107.18),  # "cual"
    191: (107.18, 107.54),  # "también"
    192: (107.54, 107.82),  # "vamos"
    193: (107.82, 108.02),  # "a"
    194: (108.02, 108.22),  # "estar"
    195: (108.22, 108.60),  # "teniendo"
    196: (108.60, 108.98),  # "reuniones"
    197: (108.98, 110.12),  # "semanales"
}

rows = []
for i, w in enumerate(words):
    text = TEXT_FIX.get(i, w["word"].strip())
    start, end = TIME_FIX.get(i, (w["start"], w["end"]))
    rows.append((round(start, 2), round(end, 2), text))

with open(out, "w", encoding="utf-8") as f:
    f.write("// Generado por scripts/build-reserva-transcript.py. Tiempos en segundos del video original.\n")
    f.write("export type Word = { start: number; end: number; text: string };\n\n")
    f.write("export const WORDS: Word[] = [\n")
    for s, e, t in rows:
        f.write(f"  {{ start: {s}, end: {e}, text: {json.dumps(t, ensure_ascii=False)} }},\n")
    f.write("];\n")
print("words:", len(rows))
