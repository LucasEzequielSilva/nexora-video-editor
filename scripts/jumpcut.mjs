#!/usr/bin/env node
// Saca los silencios de un video con jump cuts calibrados, en una sola pasada de ffmpeg.
// Defaults = ritmo de Lucas (pausas de ~0.1 s entre frases, ver CLAUDE.md §8).
// Uso: node scripts/jumpcut.mjs <entrada.mp4> <salida.mp4> [--dry] [--umbral -40] [--minimo 0.3] [--margen 0.06] [--fusion 0.35] [--fade 0.03] [--uniones cortes/<slug>-uniones.json]
// Siempre correr primero con --dry para mirar cuánto recorta.
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const argv = process.argv.slice(2);
const positional = [];
const opts = {};
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--dry") opts.dry = true;
  else if (argv[i].startsWith("--")) opts[argv[i].slice(2)] = argv[++i];
  else positional.push(argv[i]);
}
const [entrada, salida] = positional;
if (!entrada || (!salida && !opts.dry)) {
  console.error("Uso: node scripts/jumpcut.mjs <entrada.mp4> <salida.mp4> [--dry] [opciones]");
  process.exit(1);
}

const UMBRAL = parseFloat(opts.umbral ?? "-40");
const MINIMO = parseFloat(opts.minimo ?? "0.3");
const MARGEN = parseFloat(opts.margen ?? "0.06");
const FUSION = parseFloat(opts.fusion ?? "0.35");
const FADE = parseFloat(opts.fade ?? "0.03");

const probe = spawnSync(
  "ffprobe",
  ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", entrada],
  { encoding: "utf8" },
);
const total = parseFloat(probe.stdout);

const detect = spawnSync(
  "ffmpeg",
  ["-hide_banner", "-i", entrada, "-vn", "-af", `silencedetect=noise=${UMBRAL}dB:d=${MINIMO}`, "-f", "null", "-"],
  { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
);

let silencios = [];
let inicio = null;
for (const linea of detect.stderr.split("\n")) {
  const s = /silence_start: (-?[\d.]+)/.exec(linea);
  const e = /silence_end: ([\d.]+)/.exec(linea);
  if (s) inicio = Math.max(0, parseFloat(s[1]));
  if (e && inicio !== null) {
    silencios.push([inicio, parseFloat(e[1])]);
    inicio = null;
  }
}
if (inicio !== null) silencios.push([inicio, total]);

const fusionados = [];
for (const s of silencios) {
  const prev = fusionados[fusionados.length - 1];
  if (prev && s[0] - prev[1] < FUSION) prev[1] = s[1];
  else fusionados.push([...s]);
}

const quitar = fusionados
  .map(([a, b]) => [a + MARGEN, b - MARGEN])
  .filter(([a, b]) => b - a > 0.05);

const conservar = [];
let cursor = 0;
for (const [a, b] of quitar) {
  if (a - cursor > 0.05) conservar.push([cursor, a]);
  cursor = b;
}
if (total - cursor > 0.05) conservar.push([cursor, total]);

const conservado = conservar.reduce((acc, [a, b]) => acc + (b - a), 0);
const pct = ((1 - conservado / total) * 100).toFixed(1);

console.log(`Entrada: ${total.toFixed(2)}s | silencios detectados: ${silencios.length} (${fusionados.length} tras fusionar)`);
console.log(`Tramos que se conservan: ${conservar.length} | salida: ${conservado.toFixed(2)}s | recorte: ${pct}%`);
for (const [a, b] of quitar) console.log(`  - saca ${a.toFixed(2)}–${b.toFixed(2)} (${(b - a).toFixed(2)}s)`);

if (opts.dry) process.exit(0);

const filters = [];
conservar.forEach(([a, b], i) => {
  const dur = b - a;
  const fade = Math.min(FADE, dur / 2);
  filters.push(`[0:v]trim=start=${a.toFixed(3)}:end=${b.toFixed(3)},setpts=PTS-STARTPTS[v${i}]`);
  filters.push(
    `[0:a]atrim=start=${a.toFixed(3)}:end=${b.toFixed(3)},asetpts=PTS-STARTPTS,afade=t=in:d=${fade},afade=t=out:st=${(dur - fade).toFixed(3)}:d=${fade}[a${i}]`,
  );
});
filters.push(`${conservar.map((_, i) => `[v${i}][a${i}]`).join("")}concat=n=${conservar.length}:v=1:a=1[vc][ac];[vc]fps=30[v];[ac]aresample=async=1:first_pts=0[a]`);

const scriptFile = path.join(mkdtempSync(path.join(tmpdir(), "jumpcut-")), "filter.txt");
writeFileSync(scriptFile, filters.join(";\n"), "utf8");

const result = spawnSync(
  "ffmpeg",
  [
    "-hide_banner", "-y", "-i", entrada,
    "-/filter_complex", scriptFile,
    "-map", "[v]", "-map", "[a]",
    "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-g", "30", "-bf", "0", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "192k",
    "-movflags", "+faststart",
    salida,
  ],
  { stdio: "inherit" },
);
if (result.status !== 0) process.exit(result.status ?? 1);

if (opts.uniones) {
  let salidaT = 0;
  const uniones = conservar.slice(0, -1).map(([a, b], i) => {
    salidaT += b - a;
    return {
      salida_s: +salidaT.toFixed(3),
      origen_antes_s: +b.toFixed(3),
      origen_despues_s: +conservar[i + 1][0].toFixed(3),
      silencio_quitado_s: +(conservar[i + 1][0] - b).toFixed(3),
    };
  });
  writeFileSync(opts.uniones, `${JSON.stringify({ duracion_s: +conservado.toFixed(3), uniones }, null, 2)}\n`, "utf8");
  console.log(`Uniones guardadas en ${opts.uniones}`);
}
