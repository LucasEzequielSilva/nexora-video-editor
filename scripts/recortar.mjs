#!/usr/bin/env node
// Aplica los recortes manuales (cortes/<slug>-recortes.json, marcados con el recortador) a video-jc.mp4.
// Genera video.mp4 en una sola pasada, remapea words.jc.json -> words.json para que los subtítulos sigan
// cuadrando sin re-transcribir, y ajusta la duración en props.json. Nunca toca video-jc.mp4.
// Uso: node scripts/recortar.mjs public/piezas/<slug> [--dry]
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const dry = args.includes("--dry");
// --palabras: no vuelve a codificar el video (solo remapea words.json y la duración)
const soloPalabras = args.includes("--palabras");
const dir = args.find((a) => !a.startsWith("--"));
if (!dir) {
  console.error("Uso: node scripts/recortar.mjs public/piezas/<slug> [--dry]");
  process.exit(1);
}

const FADE = 0.03;
const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const slug = path.basename(path.resolve(dir));
const fuente = path.join(dir, "video-jc.mp4");
const destino = path.join(dir, "video.mp4");
const recortesPath = path.join(ROOT, "cortes", `${slug}-recortes.json`);

const duracion = (file) =>
  parseFloat(
    spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", file], {
      encoding: "utf8",
    }).stdout,
  );

const total = duracion(fuente);
const recortes = existsSync(recortesPath) ? JSON.parse(readFileSync(recortesPath, "utf8")).recortes : [];

const quitar = [];
for (const [a, b] of recortes
  .map((r) => [Math.max(0, r.desde), Math.min(total, r.hasta)])
  .filter(([a, b]) => b - a > 0.01)
  .sort((x, y) => x[0] - y[0])) {
  const last = quitar[quitar.length - 1];
  if (last && a <= last[1]) last[1] = Math.max(last[1], b);
  else quitar.push([a, b]);
}

const conservar = [];
let cursor = 0;
for (const [a, b] of quitar) {
  if (a - cursor > 0.05) conservar.push([cursor, a]);
  cursor = b;
}
if (total - cursor > 0.05) conservar.push([cursor, total]);

// Pausas (props.json → "pausas": [{ tras: <ancla>, segundos, modo? }]): un tramo en silencio que se inserta
// después de una palabra de la fuente. Si el ancla cae adentro de un recorte, va en la unión de ese recorte.
// modo "negro" (default): pantalla negra (el negro del hook). modo "congelar": sostiene el último cuadro; es el
// respiro para que una escena se aprecie antes de que vuelva la voz (Lucas, 2026-09-25: "un toque menos rápido").
const propsPath = path.join(dir, "props.json");
const pausasCfg = existsSync(propsPath) ? (JSON.parse(readFileSync(propsPath, "utf8")).pausas ?? []) : [];
const wordsFuente = existsSync(path.join(dir, "words.jc.json"))
  ? JSON.parse(readFileSync(path.join(dir, "words.jc.json"), "utf8")).segments.flatMap((s) => s.words)
  : [];
const normPal = (t) => t.toLowerCase().replace(/[.,;:¿?¡!"]/g, "").trim();
const resolverFuente = (ancla) => {
  const off = (ancla.offsetMs ?? 0) / 1000;
  if (ancla.palabra === undefined) return ancla.atMs === undefined ? null : ancla.atMs / 1000 + off;
  const w = wordsFuente.filter((x) => normPal(x.word) === normPal(ancla.palabra))[(ancla.n ?? 1) - 1];
  return w ? (ancla.fin ? w.end : w.start) + off : null;
};
const pausas = pausasCfg
  .map((p) => {
    let t = resolverFuente(p.tras);
    if (t === null) {
      console.log(`⚠ pausa sin resolver: ${JSON.stringify(p.tras)}`);
      return null;
    }
    const corte = quitar.find(([a, b]) => t >= a && t <= b);
    if (corte) t = corte[0];
    return { en: t, segundos: p.segundos, congelar: p.modo === "congelar" };
  })
  .filter(Boolean);

// Línea de tiempo de salida: tramos de la fuente y pausas negras, en orden.
const items = [];
for (const [a, b] of conservar) {
  let desde = a;
  for (const p of pausas.filter((p) => p.en >= a - 0.001 && p.en <= b + 0.001).sort((x, y) => x.en - y.en)) {
    if (p.en - desde > 0.02) items.push({ tipo: "fuente", a: desde, b: p.en });
    items.push({ tipo: "negro", dur: p.segundos, en: p.en, congelar: p.congelar });
    desde = p.en;
  }
  if (b - desde > 0.02) items.push({ tipo: "fuente", a: desde, b });
}

const salida = items.reduce((acc, it) => acc + (it.tipo === "negro" ? it.dur : it.b - it.a), 0);
console.log(`Entrada: ${total.toFixed(2)}s | recortes: ${quitar.length} | pausas: ${pausas.length} | salida: ${salida.toFixed(2)}s`);
for (const [a, b] of quitar) console.log(`  - saca ${a.toFixed(2)}–${b.toFixed(2)} (${(b - a).toFixed(2)}s)`);
for (const p of pausas) console.log(`  + ${p.congelar ? "congelar" : "negro"} ${p.segundos}s en ${p.en.toFixed(2)}`);
if (dry) process.exit(0);

if (soloPalabras) {
  if (!existsSync(destino)) {
    console.error(`--palabras necesita un ${destino} ya generado`);
    process.exit(1);
  }
} else if (quitar.length === 0 && pausas.length === 0) {
  copyFileSync(fuente, destino);
} else {
  const AFMT = "aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo";
  const filters = [];
  items.forEach((it, i) => {
    if (it.tipo === "negro") {
      if (it.congelar) {
        const t0 = Math.max(0, it.en - 1 / 30);
        filters.push(`[0:v]trim=start=${t0.toFixed(3)}:end=${it.en.toFixed(3)},setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=${it.dur},trim=duration=${it.dur},setsar=1[v${i}]`);
      } else filters.push(`color=c=black:s=1080x1920:r=30:d=${it.dur},format=yuv420p,setsar=1[v${i}]`);
      filters.push(`anullsrc=r=48000:cl=stereo,atrim=duration=${it.dur},asetpts=PTS-STARTPTS,${AFMT}[a${i}]`);
      return;
    }
    const dur = it.b - it.a;
    const fade = Math.min(FADE, dur / 2);
    filters.push(`[0:v]trim=start=${it.a.toFixed(3)}:end=${it.b.toFixed(3)},setpts=PTS-STARTPTS,setsar=1[v${i}]`);
    filters.push(
      `[0:a]atrim=start=${it.a.toFixed(3)}:end=${it.b.toFixed(3)},asetpts=PTS-STARTPTS,afade=t=in:d=${fade},afade=t=out:st=${(dur - fade).toFixed(3)}:d=${fade},${AFMT}[a${i}]`,
    );
  });
  filters.push(`${items.map((_, i) => `[v${i}][a${i}]`).join("")}concat=n=${items.length}:v=1:a=1[vc][ac];[vc]fps=30[v];[ac]aresample=async=1:first_pts=0[a]`);

  const work = mkdtempSync(path.join(tmpdir(), "recortar-"));
  const scriptFile = path.join(work, "filter.txt");
  writeFileSync(scriptFile, filters.join(";\n"), "utf8");
  const r = spawnSync(
    "ffmpeg",
    [
      "-hide_banner", "-loglevel", "error", "-y", "-i", fuente,
      "-/filter_complex", scriptFile,
      "-map", "[v]", "-map", "[a]",
      "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-g", "30", "-bf", "0", "-pix_fmt", "yuv420p",
      "-c:a", "aac", "-b:a", "192k",
      "-movflags", "+faststart",
      destino,
    ],
    { stdio: "inherit" },
  );
  rmSync(work, { recursive: true, force: true });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const tramos = [];
let acumulado = 0;
for (const it of items) {
  if (it.tipo === "negro") tramos.push({ negro: it.dur, salida: +acumulado.toFixed(3), ...(it.congelar ? { congelar: true } : {}) });
  else tramos.push({ origen: [+it.a.toFixed(3), +it.b.toFixed(3)], salida: +acumulado.toFixed(3) });
  acumulado += it.tipo === "negro" ? it.dur : it.b - it.a;
}

// Una pausa corre solo lo que cae en el tramo que viene después: un tiempo que queda en la unión (adentro de un
// recorte) se queda del lado de antes del negro.
const mapear = (t) => {
  let acc = 0;
  let pendiente = 0;
  for (const it of items) {
    if (it.tipo === "negro") {
      pendiente += it.dur;
      continue;
    }
    if (t < it.a) return acc;
    acc += pendiente;
    pendiente = 0;
    if (t <= it.b) return acc + (t - it.a);
    acc += it.b - it.a;
  }
  return acc + pendiente;
};
const dentroDeRecorte = (t) => quitar.some(([a, b]) => t >= a && t <= b);

// Energía del audio cada 20 ms: whisper estira el final de las palabras hasta la pausa siguiente, así que
// para saber si una palabra se sacó hay que mirar dónde suena de verdad, no su tramo de whisper.
const VENTANA = 0.02;
const pcm = spawnSync("ffmpeg", ["-v", "error", "-i", fuente, "-vn", "-af", "aresample=async=1", "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], {
  maxBuffer: 512 * 1024 * 1024,
}).stdout;
const muestras = new Float32Array(pcm.buffer, pcm.byteOffset, Math.floor(pcm.byteLength / 4));
const porVentana = 16000 * VENTANA;
const db = [];
for (let i = 0; i + porVentana <= muestras.length; i += porVentana) {
  let s = 0;
  for (let k = i; k < i + porVentana; k++) s += muestras[k] * muestras[k];
  db.push(20 * Math.log10(Math.sqrt(s / porVentana) + 1e-9));
}
const ordenados = [...db].sort((a, b) => a - b);
const VOZ = ordenados[Math.floor(ordenados.length * 0.1)] + 15;
const suena = (t) => (db[Math.floor(t / VENTANA)] ?? -100) > VOZ;
// La palabra es la isla de voz más grande dentro de su tramo de whisper (el tramo suele llegar hasta el
// arranque de lo que viene después, y eso no es parte de la palabra).
const nucleo = (w) => {
  const islas = [];
  for (let t = w.start; t < w.end; t += VENTANA) {
    if (!suena(t)) continue;
    const ult = islas[islas.length - 1];
    if (ult && t - ult.end <= 2 * VENTANA) ult.end = t + VENTANA;
    else islas.push({ start: t, end: t + VENTANA });
  }
  if (islas.length === 0) return { start: w.start, end: w.end };
  const mayor = islas.reduce((m, i) => (i.end - i.start > m.end - m.start ? i : m));
  return { start: mayor.start, end: Math.min(w.end, mayor.end) };
};

const promedio = (desde, hasta) => {
  const vals = [];
  for (let t = desde; t < hasta - 1e-6; t += VENTANA) vals.push(db[Math.floor(t / VENTANA)] ?? -100);
  return vals.reduce((s, v) => s + v, 0) / Math.max(1, vals.length);
};
const bordes = [];
for (const [a, b] of quitar) {
  for (const [t, esInicio] of [[a, true], [b, false]]) {
    if (t <= 0.05 || t >= total - 0.05) continue;
    const afuera = esInicio ? promedio(t - 0.06, t) : promedio(t, t + 0.06);
    const adentro = esInicio ? promedio(t, t + 0.06) : promedio(t - 0.06, t);
    if (afuera > VOZ && adentro > VOZ) bordes.push(t);
  }
}
if (bordes.length) {
  console.log(`⚠ ${bordes.length} bordes de recorte caen con voz sonando a los dos lados (pueden cortar una palabra al medio):`);
  for (const t of bordes) console.log(`   ${t.toFixed(2)} s`);
}

const wordsJc = path.join(dir, "words.jc.json");
if (existsSync(wordsJc)) {
  const data = JSON.parse(readFileSync(wordsJc, "utf8"));
  for (const segment of data.segments) {
    segment.words = segment.words
      .map((w) => ({ w, n: nucleo(w) }))
      .filter(({ n }) => !dentroDeRecorte((n.start + n.end) / 2))
      .map(({ w, n }) => {
        const fin = Math.max(n.end, n.start + 0.06);
        const end = mapear(fin);
        // si la palabra quedó cruzando un negro (arranca en la unión y termina del otro lado), arranca después
        const start = Math.max(mapear(n.start), end - (fin - n.start));
        return { ...w, start: +start.toFixed(3), end: +end.toFixed(3) };
      })
      .filter((w) => w.end - w.start > 0.02);
    if (segment.words.length > 0) {
      segment.start = segment.words[0].start;
      segment.end = segment.words[segment.words.length - 1].end;
    }
    segment.text = segment.words.map((w) => w.word).join("");
  }
  data.duration = +acumulado.toFixed(3);
  writeFileSync(path.join(dir, "words.json"), JSON.stringify(data, null, 1), "utf8");
}

const real = duracion(destino);
writeFileSync(
  path.join(dir, "mapa-tiempos.json"),
  `${JSON.stringify({ duracion_s: +real.toFixed(3), tramos }, null, 2)}\n`,
  "utf8",
);

if (existsSync(propsPath)) {
  const props = JSON.parse(readFileSync(propsPath, "utf8"));
  props.durationSeconds = +real.toFixed(3);
  writeFileSync(propsPath, `${JSON.stringify(props, null, 2)}\n`, "utf8");
}
console.log(`OK -> ${destino} (${real.toFixed(3)}s). Las anclas por palabra se reacomodan solas; las que usan atMs fijo NO: revisalas.`);
