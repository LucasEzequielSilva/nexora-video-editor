#!/usr/bin/env node
// Master de loudness post-render: limitador de picos si hace falta + loudnorm lineal de dos pasadas (I -14 LUFS, TP -1.5 dBTP, LRA 11) e informe ebur128.
// El video se copia tal cual; solo se recodifica el audio (AAC 256k: a 192k los picos rebotan más).
// Uso: node scripts/master.mjs <entrada.mp4> <salida.mp4>
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const OBJETIVO = { I: -14, TP: -1.5, LRA: 11 };

const [, , entrada, salida] = process.argv;
if (!entrada || !salida) {
  console.error("Uso: node scripts/master.mjs <entrada.mp4> <salida.mp4>");
  process.exit(1);
}
if (!existsSync(entrada)) fallar(`No existe la entrada: ${entrada}`);
if (path.resolve(entrada) === path.resolve(salida)) fallar("La salida tiene que ser un archivo distinto de la entrada");

function fallar(mensaje, detalle) {
  console.error(`ERROR: ${mensaje}`);
  if (detalle) console.error(detalle.trim().split("\n").slice(-15).join("\n"));
  process.exit(1);
}

function ffmpeg(args) {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", ...args], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (r.error) fallar(`No se pudo ejecutar ffmpeg (${r.error.message})`);
  return r;
}

function jsonLoudnorm(stderr) {
  const bloques = stderr.slice(stderr.lastIndexOf("Parsed_loudnorm")).match(/\{[^{}]*\}/g);
  if (!bloques) return null;
  try {
    return JSON.parse(bloques[bloques.length - 1]);
  } catch {
    return null;
  }
}

const sampleRate = spawnSync(
  "ffprobe",
  ["-v", "error", "-select_streams", "a:0", "-show_entries", "stream=sample_rate", "-of", "default=nw=1:nk=1", entrada],
  { encoding: "utf8" },
).stdout?.trim();
if (!sampleRate) fallar(`La entrada no tiene pista de audio: ${entrada}`);

// aresample=async=1 antes de medir y de aplicar: rellena huecos de timestamps (CLAUDE.md §7, "Audio sin huecos").
const base = `loudnorm=I=${OBJETIVO.I}:TP=${OBJETIVO.TP}:LRA=${OBJETIVO.LRA}`;

console.log(`Pasada 1: midiendo ${entrada}`);
const medicion = ffmpeg(["-i", entrada, "-map", "0:a:0", "-af", `aresample=async=1,${base}:print_format=json`, "-f", "null", "-"]);
if (medicion.status !== 0) fallar("Falló la medición (pasada 1)", medicion.stderr);
const m = jsonLoudnorm(medicion.stderr);
if (!m) fallar("No se encontró el JSON de loudnorm en la pasada 1", medicion.stderr);
if (!Number.isFinite(parseFloat(m.input_i))) fallar(`Loudness integrado no medible (${m.input_i}): ¿el audio es silencio?`);
console.log(`  entrada: I ${m.input_i} LUFS | LRA ${m.input_lra} LU | TP ${m.input_tp} dBTP | umbral ${m.input_thresh} LUFS`);

const ganancia = OBJETIVO.I - parseFloat(m.input_i);
const picoProyectado = parseFloat(m.input_tp) + ganancia;
console.log(`  ganancia lineal necesaria: ${ganancia >= 0 ? "+" : ""}${ganancia.toFixed(2)} dB -> pico proyectado ${picoProyectado.toFixed(2)} dBTP`);

// Si con la ganancia fija los picos (boom, golpes) pasan el techo, loudnorm se pasa al modo dinámico: comprime en vivo,
// bombea y le quita lo parejo a la música. Antes de subir la ganancia, un limitador recorta solo esos picos puntuales
// (1.5 dB de margen: el AAC hace rebotar los picos limitados hasta ~1.7 dB, medido) y se vuelve a medir, así la pasada 2 puede ser lineal.
const MARGEN_AAC = 1.5;
let limitador = "";
let medida = m;
if (picoProyectado > OBJETIVO.TP - MARGEN_AAC) {
  const techoDb = OBJETIVO.TP - MARGEN_AAC - ganancia;
  const techo = Math.min(1, Math.max(0.0625, 10 ** (techoDb / 20)));
  limitador = `alimiter=limit=${techo.toFixed(5)}:attack=5:release=60:level=disabled,`;
  console.log(`  limitador antes de la ganancia: techo ${techoDb.toFixed(2)} dBFS (recorta ${(parseFloat(m.input_tp) - techoDb).toFixed(2)} dB de picos)`);
  const remedicion = ffmpeg(["-i", entrada, "-map", "0:a:0", "-af", `aresample=async=1,${limitador}${base}:print_format=json`, "-f", "null", "-"]);
  if (remedicion.status !== 0) fallar("Falló la medición con limitador", remedicion.stderr);
  medida = jsonLoudnorm(remedicion.stderr) ?? fallar("No se encontró el JSON de loudnorm con limitador", remedicion.stderr);
  console.log(`  con limitador: I ${medida.input_i} LUFS | TP ${medida.input_tp} dBTP`);
}

const aplicar = [
  base,
  `measured_I=${medida.input_i}`,
  `measured_TP=${medida.input_tp}`,
  `measured_LRA=${medida.input_lra}`,
  `measured_thresh=${medida.input_thresh}`,
  `offset=${medida.target_offset}`,
  "linear=true",
  "print_format=json",
].join(":");

mkdirSync(path.dirname(path.resolve(salida)), { recursive: true });
console.log(`Pasada 2: aplicando loudnorm lineal -> ${salida}`);
const master = ffmpeg([
  "-y", "-i", entrada,
  "-map", "0:v?", "-map", "0:a:0",
  "-c:v", "copy",
  // loudnorm trabaja a 192 kHz: se vuelve a la frecuencia original.
  "-af", `aresample=async=1,${limitador}${aplicar},aresample=${sampleRate}`,
  "-c:a", "aac", "-b:a", "256k",
  "-movflags", "+faststart",
  salida,
]);
if (master.status !== 0) fallar("Falló el master (pasada 2)", master.stderr);
const tipo = jsonLoudnorm(master.stderr)?.normalization_type;
if (tipo === "linear") console.log("  modo: lineal (ganancia fija, sin compresión)");
else console.log(`  AVISO: loudnorm usó el modo ${tipo ?? "desconocido"}, no el lineal: el pico o el LRA medidos no daban para una ganancia fija, y va a comprimir la dinámica`);

console.log("Verificación ebur128 de la salida");
const informe = ffmpeg(["-i", salida, "-map", "0:a:0", "-af", "ebur128=peak=true:framelog=verbose", "-f", "null", "-"]);
if (informe.status !== 0) fallar("Falló la medición ebur128", informe.stderr);
const resumen = informe.stderr.slice(informe.stderr.lastIndexOf("Summary:"));
const I = /I:\s+(-?[\d.]+|-inf) LUFS/.exec(resumen)?.[1];
const LRA = /LRA:\s+([\d.]+) LU/.exec(resumen)?.[1];
const TP = /Peak:\s+(-?[\d.]+|-inf) dBFS/.exec(resumen)?.[1];
if (I === undefined || LRA === undefined || TP === undefined) fallar("No se pudo leer el resumen de ebur128", informe.stderr);
console.log(`  salida: I ${I} LUFS | LRA ${LRA} LU | true peak ${TP} dBTP  (objetivo: I ${OBJETIVO.I}, TP <= ${OBJETIVO.TP})`);

const avisos = [];
if (Math.abs(parseFloat(I) - OBJETIVO.I) > 0.5) avisos.push(`el integrado quedó a más de 0.5 LU del objetivo`);
if (parseFloat(TP) > OBJETIVO.TP) avisos.push(`el true peak pasa el techo de ${OBJETIVO.TP} dBTP (el AAC puede sumar algunas décimas)`);
for (const a of avisos) console.log(`  AVISO: ${a}`);
console.log(`OK -> ${salida}`);
