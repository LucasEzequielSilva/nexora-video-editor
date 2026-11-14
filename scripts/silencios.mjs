#!/usr/bin/env node
// Silencios finos: suma a cortes/<slug>-recortes.json los silencios que el jumpcut dejó (Lucas, 2026-09-28: "me gustaría
// ajustar los recortes del crudo pa eliminar mejor los silencios"). Cada silencio de más de `min` se recorta dejando
// `deja` segundos de cada lado: el ritmo de Lucas es 0.02-0.12 s entre frases (§8, "Criterio de corte").
// No toca los recortes que ya están (son trabajo de Lucas o del editor). Las pausas de props.json que caigan adentro de un
// recorte nuevo pasan a la unión (así lo resuelve recortar.mjs): después hay que recalcular los desfases del hook.
// Uso: node scripts/silencios.mjs public/piezas/<slug> [--dry] [--min 0.18] [--deja 0.05] [--bajo 22]
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);
const dir = args.find((a) => !a.startsWith("--") && !/^\d/.test(a));
const opcion = (n, def) => {
  const i = args.indexOf(n);
  return i >= 0 ? parseFloat(args[i + 1]) : def;
};
const MIN = opcion("--min", 0.18);
const DEJA = opcion("--deja", 0.05);
const DRY = args.includes("--dry");
/** Cuántos dB debajo de la voz fuerte (p90) cuenta como silencio. */
const BAJO = opcion("--bajo", 22);
if (!dir || !existsSync(path.join(dir, "video-jc.mp4"))) {
  console.error("Uso: node scripts/silencios.mjs public/piezas/<slug> [--dry] [--min 0.18] [--deja 0.05]");
  process.exit(1);
}
const slug = path.basename(dir);
const RECORTES = path.join(ROOT, "cortes", `${slug}-recortes.json`);
const r3 = (n) => Math.round(n * 1000) / 1000;

const SR = 16000;
const VENTANA = 0.02;
const pcm = spawnSync("ffmpeg", ["-v", "error", "-i", path.join(dir, "video-jc.mp4"), "-vn", "-ac", "1", "-ar", String(SR), "-af", "aresample=async=1", "-f", "s16le", "-"], {
  maxBuffer: 1024 * 1024 * 1024,
}).stdout;
const muestras = new Int16Array(pcm.buffer, pcm.byteOffset, Math.floor(pcm.length / 2));
const paso = SR * VENTANA;
const db = [];
for (let i = 0; i + paso <= muestras.length; i += paso) {
  let s = 0;
  for (let j = i; j < i + paso; j++) s += (muestras[j] / 32768) ** 2;
  db.push(10 * Math.log10(s / paso + 1e-12));
}
const ordenados = [...db].sort((a, b) => a - b);
const vozP90 = ordenados[Math.floor(ordenados.length * 0.9)];
// Silencio = BAJO dB debajo de la voz fuerte (con tope en -35): sigue al nivel de cada grabación. Las respiraciones
// y el aire entre frases quedan ~25-30 dB abajo: con 22 dB entran como silencio.
const UMBRAL = Math.min(-35, vozP90 - BAJO);

const previo = existsSync(RECORTES) ? JSON.parse(readFileSync(RECORTES, "utf8")) : { fuente: "video-jc.mp4", recortes: [] };
const ocupado = previo.recortes.map((r) => [r.desde, r.hasta]);
const libre = (a, b) => {
  // Resta los recortes que ya están del tramo [a, b].
  let tramos = [[a, b]];
  for (const [x, y] of ocupado) {
    tramos = tramos.flatMap(([p, q]) => (y <= p || x >= q ? [[p, q]] : [[p, Math.max(p, x)], [Math.min(q, y), q]].filter(([u, v]) => v - u > 0.001)));
  }
  return tramos;
};

const words = existsSync(path.join(dir, "words.jc.json"))
  ? JSON.parse(readFileSync(path.join(dir, "words.jc.json"), "utf8")).segments.flatMap((s) => s.words)
  : [];
const antes = (t) => [...words].reverse().find((w) => w.end <= t + 0.05)?.word.trim() ?? "";
const despues = (t) => words.find((w) => w.start >= t - 0.05)?.word.trim() ?? "";

const nuevos = [];
let ini = null;
for (let i = 0; i <= db.length; i++) {
  const silencio = i < db.length && db[i] < UMBRAL;
  if (silencio && ini === null) ini = i;
  if (!silencio && ini !== null) {
    const a = ini * VENTANA;
    const b = i * VENTANA;
    ini = null;
    if (b - a < MIN) continue;
    for (const [p, q] of libre(a + DEJA, b - DEJA)) {
      if (q - p < 0.06) continue;
      nuevos.push({
        desde: r3(p),
        hasta: r3(q),
        motivo: "silencio",
        nota: `silencio fino (scripts/silencios.mjs): pausa de ${(b - a).toFixed(2)} s, quedan ${(DEJA * 2).toFixed(2)} s`,
        contexto: { texto: "", antes: antes(a), despues: despues(b), duracion: r3(q - p), esSilencio: true },
      });
    }
  }
}

const total = nuevos.reduce((s, r) => s + r.hasta - r.desde, 0);
console.log(`${slug}: voz p90 ${vozP90.toFixed(1)} dB · umbral ${UMBRAL.toFixed(1)} dB · ${nuevos.length} silencios de más de ${MIN} s · saca ${total.toFixed(2)} s`);
for (const r of nuevos) console.log(`  - ${r.desde.toFixed(2)}–${r.hasta.toFixed(2)} (${r.contexto.duracion.toFixed(2)} s) ${r.contexto.antes} | ${r.contexto.despues}`);
if (DRY || !nuevos.length) process.exit(0);
const recortes = [...previo.recortes, ...nuevos].sort((x, y) => x.desde - y.desde);
writeFileSync(RECORTES, `${JSON.stringify({ ...previo, recortes }, null, 2)}\n`, "utf8");
console.log(`OK -> ${path.relative(ROOT, RECORTES)} (${recortes.length} recortes; siguiente: node scripts/recortar.mjs ${dir})`);
