#!/usr/bin/env node
// Aplica scripts/correcciones.json a la transcripción de una pieza.
// Lee words.raw.json (lo que salió de whisper sobre video-jc.mp4) y escribe words.jc.json (corregido, mismos
// tiempos), así el diccionario se puede ampliar y volver a aplicar sin perder el original.
// recortar.mjs toma words.jc.json y genera el words.json final con los recortes manuales aplicados.
// Uso: node scripts/corregir.mjs public/piezas/<slug>
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = process.argv[2];
if (!dir) {
  console.error("Uso: node scripts/corregir.mjs public/piezas/<slug>");
  process.exit(1);
}

const rawPath = path.join(dir, "words.raw.json");
if (!existsSync(rawPath)) {
  console.error(`No existe ${rawPath}. Renombrá el words.json que salió de transcribir.py a words.raw.json.`);
  process.exit(1);
}

const here = path.dirname(fileURLToPath(import.meta.url));
const localPath = path.join(dir, "correcciones.json");
const local = existsSync(localPath) ? JSON.parse(readFileSync(localPath, "utf8")) : {};
const reemplazos = [
  ...JSON.parse(readFileSync(path.join(here, "correcciones.json"), "utf8")).reemplazos,
  ...(local.reemplazos ?? []),
];
// Palabras que whisper se comió (típico en los cortes duros entre tomas), con tiempos verificados a mano.
const inserciones = local.inserciones ?? [];
// Tramos que whisper colapsó (ej. un tropiezo y su reinicio transcriptos como un solo intento): se reemplazan
// todas las palabras cuyo centro cae en [desde, hasta] por las dadas, con tiempos medidos sobre la energía del audio.
const tramos = local.tramos ?? [];
const data = JSON.parse(readFileSync(rawPath, "utf8"));

// Un solo flujo de palabras: whisper parte los segmentos en cualquier lado y las reglas no deben depender de eso.
const todas = data.segments.flatMap((s) => s.words);
data.segments = [{ start: todas[0].start, end: todas[todas.length - 1].end, text: "", words: todas }];

const norm = (t) => t.toLowerCase().replace(/[.,;:¿?¡!"]/g, "").trim();
const capitalize = (t) => t.charAt(0).toUpperCase() + t.slice(1);
let aplicadas = 0;

for (const segment of data.segments) {
  for (const [de, a] of reemplazos) {
    const from = de.split(" ");
    const to = a.split(" ");
    for (let i = 0; i + from.length <= segment.words.length; i++) {
      const slice = segment.words.slice(i, i + from.length);
      if (!slice.every((w, k) => norm(w.word) === from[k])) continue;

      const first = slice[0];
      const last = slice[slice.length - 1];
      const punct = /[.,;:?!]+$/.exec(last.word.trim())?.[0] ?? "";
      const startsUpper = /^[A-ZÁÉÍÓÚÑ]/.test(first.word.trim());
      const step = (last.end - first.start) / to.length;
      // misma cantidad de palabras: cada una conserva su tiempo; si cambia, se reparte el tramo
      const mismas = to.length === from.length;
      const nuevas = to.map((text, k) => {
        let word = k === to.length - 1 ? text + punct : text;
        if (k === 0 && startsUpper) word = capitalize(word);
        return {
          start: mismas ? slice[k].start : +(first.start + step * k).toFixed(3),
          end: mismas ? slice[k].end : +(first.start + step * (k + 1)).toFixed(3),
          word: ` ${word}`,
          p: mismas ? slice[k].p : Math.min(...slice.map((w) => w.p)),
        };
      });
      segment.words.splice(i, from.length, ...nuevas);
      i += nuevas.length - 1;
      aplicadas++;
    }
  }
  for (const ins of inserciones) {
    const from = ins.tras.split(" ");
    for (let i = 0; i + from.length <= segment.words.length; i++) {
      const slice = segment.words.slice(i, i + from.length);
      if (!slice.every((w, k) => norm(w.word) === from[k])) continue;
      if (Math.abs(slice[slice.length - 1].end - ins.start) > 0.6) continue;
      const after = i + from.length;
      segment.words.splice(after, 0, { start: ins.start, end: ins.end, word: ` ${ins.palabra}`, p: 1 });
      const next = segment.words[after + 1];
      if (next && next.start < ins.end) next.start = ins.end;
      aplicadas++;
      break;
    }
  }
  for (const tramo of tramos) {
    const centro = (w) => (w.start + w.end) / 2;
    const i = segment.words.findIndex((w) => centro(w) >= tramo.desde);
    if (i < 0) continue;
    let n = 0;
    while (i + n < segment.words.length && centro(segment.words[i + n]) <= tramo.hasta) n++;
    segment.words.splice(i, n, ...tramo.palabras.map((p) => ({ start: p.start, end: p.end, word: ` ${p.word}`, p: 1 })));
    aplicadas++;
  }
  segment.text = segment.words.map((w) => w.word).join("");
}

writeFileSync(path.join(dir, "words.jc.json"), JSON.stringify(data, null, 1), "utf8");
console.log(`${aplicadas} correcciones aplicadas -> ${path.join(dir, "words.jc.json")} (siguiente paso: node scripts/recortar.mjs ${dir})`);
