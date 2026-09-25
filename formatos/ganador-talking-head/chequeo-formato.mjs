#!/usr/bin/env node
// Chequeo de gramática del formato ganador-talking-head: lo que `npm run verificar` NO mira.
// Uso: node formatos/ganador-talking-head/chequeo-formato.mjs public/piezas/<slug>
// - anclas: `n` sin completar, palabras repetidas sin `n` explícito (lista cada aparición), rangos invertidos
//   (zooms, escenas, b-rolls y strikes), cues fuera de su escena;
// - cortes de cara.json: falsos positivos, tapados (negro, escena, b-roll) y sobre la cara, con el zoom que arranca ahí;
// - cadena de zooms: saltos de escala que quedan a la vista;
// - acentos que no se ven (todas sus apariciones caen bajo escenas);
// - `pausas` como las resuelve recortar.mjs (words.jc.json) y como las resuelve verificar.mjs (words.json).
// Sale con 1 si hay algún ✖. Lee: props.json, words.json, words.jc.json, cara.json y mapa-tiempos.json (si existen).
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const dir = process.argv[2];
if (!dir || !existsSync(path.join(dir, "props.json"))) {
  console.error("Uso: node formatos/ganador-talking-head/chequeo-formato.mjs public/piezas/<slug>");
  process.exit(2);
}
const FPS = 30;
const leer = (f) => (existsSync(path.join(dir, f)) ? JSON.parse(readFileSync(path.join(dir, f), "utf8")) : null);
const props = leer("props.json");
const palabrasDe = (j) => (j ? j.segments.flatMap((s) => s.words) : null);
const final = palabrasDe(leer("words.json"));
const fuente = palabrasDe(leer("words.jc.json"));
const cara = leer("cara.json");
const mapa = leer("mapa-tiempos.json");
const total = Math.round(props.durationSeconds * FPS);
const norm = (t) => String(t).toLowerCase().replace(/[.,;:¿?¡!"]/g, "").trim();
const cuadro = (ms) => Math.round((ms / 1000) * FPS);
const seg = (f) => `${(f / FPS).toFixed(2)} s`;

let errores = 0;
let avisos = 0;
const error = (t) => (errores++, console.log(`  ✖ ${t}`));
const aviso = (t) => (avisos++, console.log(`  ⚠ ${t}`));

const apariciones = (palabra, words) => words.filter((w) => norm(w.word) === norm(palabra));
const resolver = (a, words = final) => {
  if (!a || typeof a !== "object") return null;
  if (a.palabra === undefined) return a.atMs === undefined ? null : cuadro(a.atMs + (a.offsetMs ?? 0));
  if (a.n !== undefined && !(Number.isInteger(a.n) && a.n > 0)) return null;
  const w = apariciones(a.palabra, words)[(a.n ?? 1) - 1];
  return w ? cuadro(Math.round((a.fin ? w.end : w.start) * 1000) + (a.offsetMs ?? 0)) : null;
};
const describir = (a) =>
  a.palabra === undefined
    ? `atMs ${a.atMs}`
    : `"${a.palabra}"${a.n !== undefined ? ` n=${a.n}` : ""}${a.fin ? " fin" : ""}${a.offsetMs ? ` ${a.offsetMs > 0 ? "+" : ""}${a.offsetMs}` : ""}`;

// ---------- 1. Anclas ----------
console.log("1. Anclas (words.json; pausas contra words.jc.json)");
const anclas = [];
const add = (donde, a, words = final) => a && typeof a === "object" && anclas.push({ donde, a, words });
(props.zooms ?? []).forEach((z, i) => (add(`zooms[${i}].inicio`, z.inicio), add(`zooms[${i}].fin`, z.fin)));
(props.sfx ?? []).forEach((s, i) => (add(`sfx[${i}] ${s.nombre ?? path.basename(s.archivo ?? "")}`, s), add(`sfx[${i}].corte`, s.corte)));
(props.overlays ?? []).forEach((o, i) => {
  const et = `overlays[${i}] ${o.escena ?? o.tipo}`;
  for (const k of ["desde", "hasta", "en"]) add(`${et}.${k}`, o[k]);
  (o.palabras ?? []).forEach((p, j) => add(`${et}.palabras[${j}].en`, p.en));
  Object.entries(o.cues ?? {}).forEach(([k, a]) => add(`${et}.cues.${k}`, a));
});
add("musica.desde", props.musica?.desde);
(props.pausas ?? []).forEach((p, i) => add(`pausas[${i}].tras`, p.tras, fuente ?? final));
let ambiguas = 0;
for (const { donde, a, words } of anclas) {
  if (a.palabra === undefined) continue;
  if (/[<>]/.test(a.palabra) || (a.n !== undefined && !(Number.isInteger(a.n) && a.n > 0))) {
    error(`${donde}: ${describir(a)} tiene un placeholder sin completar`);
    continue;
  }
  const lista = apariciones(a.palabra, words);
  if (resolver(a, words) === null) error(`${donde}: ${describir(a)} no resuelve (aparece ${lista.length} veces)`);
  else if (lista.length > 1 && a.n === undefined) {
    ambiguas++;
    aviso(`${donde}: "${a.palabra}" aparece ${lista.length} veces y el ancla no trae n (toma la 1ª): ${lista.map((w, k) => `n${k + 1} ${w.start.toFixed(2)}`).join(" · ")}`);
  }
}
const rangos = [
  ...(props.zooms ?? []).map((z, i) => [`zooms[${i}]`, resolver(z.inicio), z.fin === "fin" ? total : resolver(z.fin)]),
  ...(props.overlays ?? [])
    .map((o, i) => [o, i])
    .filter(([o]) => o.desde)
    .map(([o, i]) => [`overlays[${i}] ${o.escena ?? o.tipo}`, resolver(o.desde), o.hasta === "fin" ? total : resolver(o.hasta)]),
];
for (const [nombre, a, b] of rangos) if (a !== null && b !== null && b <= a) error(`${nombre}: termina (${seg(b)}) antes de empezar (${seg(a)})`);
(props.overlays ?? []).forEach((o, i) => {
  if (o.tipo === "strike") {
    const hasta = resolver(o.hasta);
    for (const [j, p] of (o.palabras ?? []).entries()) {
      const en = resolver(p.en);
      if (en === null || hasta === null) continue;
      const trazo = en + (p.strikeDelay ?? 14) + 8;
      if (hasta <= en) error(`overlays[${i}] strike: hasta (${seg(hasta)}) cae antes del ícono ${j} (${seg(en)})`);
      else if (hasta < trazo) aviso(`overlays[${i}] strike: hasta (${seg(hasta)}) corta el trazo del ícono ${j} (termina en ${seg(trazo)})`);
    }
  }
  if (o.tipo === "escena") {
    const a = resolver(o.desde);
    const b = o.hasta === "fin" ? total : resolver(o.hasta);
    for (const [k, c] of Object.entries(o.cues ?? {})) {
      const f = resolver(c);
      if (f !== null && a !== null && b !== null && (f < a || f > b)) error(`overlays[${i}] ${o.escena}: cue ${k} (${seg(f)}) cae fuera de la escena (${seg(a)}–${seg(b)})`);
    }
  }
});
if (!errores && !ambiguas) console.log(`  ✓ ${anclas.length} anclas: resuelven, sin placeholders, sin repetidas sin n, sin rangos invertidos`);

// ---------- 2. Cortes ----------
const tapas = [];
const negros = [];
if (mapa) for (const t of mapa.tramos) if (t.negro) negros.push([cuadro(t.salida * 1000), cuadro((t.salida + t.negro) * 1000)]);
(props.overlays ?? []).forEach((o) => {
  if (o.tipo !== "escena" && o.tipo !== "broll") return;
  const a = resolver(o.desde);
  const b = o.hasta === "fin" ? total : resolver(o.hasta);
  if (a !== null && b !== null) tapas.push({ nombre: o.escena ?? path.basename(o.archivo), a, b, escena: o.tipo === "escena" });
});
const zooms = (props.zooms ?? [])
  .map((z, i) => ({ i, z, a: resolver(z.inicio), b: z.fin === "fin" ? total : resolver(z.fin) }))
  .filter((z) => z.a !== null && z.b !== null);
const tapadoPor = (f) => {
  const n = negros.find(([a, b]) => f >= a - 1 && f <= b + 1);
  if (n) return "negro";
  const t = tapas.find((t) => f >= t.a && f <= t.b);
  return t ? `${t.escena ? "escena" : "b-roll"} ${t.nombre}` : null;
};
const cortes = [];
if (cara?.cortes) {
  console.log("\n2. Cortes de cara.json (cuadro, segundo) y qué pasa en cada uno");
  const cerca = (p, q) => p && q && Math.hypot(p[0] - q[0], p[1] - q[1]) <= 40 && Math.abs(p[2] / q[2] - 1) <= 0.12;
  for (const k of cara.cortes) {
    const [antes, este, despues] = [cara.cuadros[k - 1], cara.cuadros[k], cara.cuadros[k + 1]];
    if (!cerca(este, antes) && !cerca(este, despues) && cerca(antes, despues)) {
      console.log(`  · ${String(k).padStart(5)} ${seg(k)}  falso positivo de YuNet (cara de un solo cuadro): no es corte`);
      continue;
    }
    cortes.push(k);
    const tapado = tapadoPor(k);
    const zoom = zooms.find((z) => Math.abs(z.a - k) <= 2);
    if (tapado) console.log(`  · ${String(k).padStart(5)} ${seg(k)}  tapado (${tapado})`);
    else if (zoom) console.log(`  ✓ ${String(k).padStart(5)} ${seg(k)}  sobre la cara: arranca zooms[${zoom.i}] (${zoom.z.escalaInicial ?? 1} → ${zoom.z.escala})`);
    else aviso(`${k} ${seg(k)}  jump cut sobre la cara sin arranque de zoom (invariante 2)`);
  }
} else console.log("\n2. Cortes: falta cara.json (correr scripts/cara.py)");

// ---------- 3. Cadena de zooms ----------
console.log("\n3. Zooms: corte más cercano al inicio y saltos de escala");
const masCercano = (f) => cortes.reduce((m, k) => (m === null || Math.abs(k - f) < Math.abs(m - f) ? k : m), null);
for (const { i, z, a, b } of zooms) {
  const k = masCercano(a);
  console.log(`  · zooms[${i}] ${seg(a)}–${seg(b)}  ${z.escalaInicial ?? 1} → ${z.escala}${z.curva ? ` (${z.curva})` : ""}${k === null ? "" : `  corte más cercano: ${seg(k)} (${k - a >= 0 ? "+" : ""}${k - a} cuadros)`}`);
}
const factor = (w, f) => (w.z.escalaInicial ?? 1) + (w.z.escala - (w.z.escalaInicial ?? 1)) * ((f - w.a) / Math.max(1, w.b - w.a));
const escalaIzq = (f) => zooms.filter((z) => z.z.tipo === "suave" && z.a < f && f <= z.b).reduce((s, z) => s * factor(z, f), 1);
const escalaDer = (f) => zooms.filter((z) => z.z.tipo === "suave" && z.a <= f && f < z.b).reduce((s, z) => s * factor(z, f), 1);
let saltos = 0;
for (const f of [...new Set(zooms.flatMap((z) => [z.a, z.b]))].sort((x, y) => x - y)) {
  if (f <= 0 || f >= total) continue;
  const [izq, der] = [escalaIzq(f), escalaDer(f)];
  if (Math.abs(izq - der) < 0.02) continue;
  const enCorte = cortes.some((k) => Math.abs(k - f) <= 1);
  const t = tapas.find((t) => f >= t.a && f <= t.b);
  const opaco = t && (t.escena ? f >= t.a + 14 && f <= t.b - 10 : f >= t.a + 6 && f <= t.b - 6);
  const negro = negros.some(([a, b]) => f >= a - 1 && f <= b + 1);
  if (enCorte || opaco || negro) console.log(`  · salto ${izq.toFixed(2)} → ${der.toFixed(2)} en ${seg(f)}: tapado (${enCorte ? "corte" : negro ? "negro" : t.nombre})`);
  else if (t) (saltos++, aviso(`salto ${izq.toFixed(2)} → ${der.toFixed(2)} en ${seg(f)}, en la entrada/salida de ${t.nombre}: mirar un still`));
  else (saltos++, aviso(`salto ${izq.toFixed(2)} → ${der.toFixed(2)} en ${seg(f)} a la vista: encadenar (escalaInicial = escala anterior) o moverlo a un corte`));
}
if (!saltos) console.log("  ✓ ningún salto de escala a la vista");

// ---------- 4. Acentos ----------
console.log("\n4. Acentos del subtítulo");
for (const ac of props.subtitulos?.acentos ?? []) {
  const p = typeof ac === "string" ? ac : ac.palabra;
  const fs = apariciones(p, final).map((w) => cuadro(w.start * 1000));
  const visibles = fs.filter((f) => !tapas.some((t) => t.escena && f >= t.a && f <= t.b));
  if (!fs.length) aviso(`"${p}" no aparece en words.json`);
  else if (!visibles.length) aviso(`"${p}" no se ve: sus ${fs.length} apariciones caen bajo escenas (${fs.map(seg).join(", ")})`);
  else console.log(`  ✓ "${p}": ${visibles.length} de ${fs.length} apariciones sobre cara o b-roll`);
}

// ---------- 5. Pausas ----------
if ((props.pausas ?? []).length) {
  console.log("\n5. Pausas (negro): recortar.mjs resuelve contra words.jc.json, verificar.mjs contra words.json");
  (props.pausas ?? []).forEach((p, i) => {
    const jc = fuente ? resolver(p.tras, fuente) : null;
    const fin = resolver(p.tras, final);
    const real = negros[i];
    console.log(`  · pausas[${i}] ${describir(p.tras)}: words.jc.json ${jc === null ? "sin resolver" : `${seg(jc)} (tiempo de video-jc.mp4)`} · words.json ${fin === null ? "sin resolver" : seg(fin)}${real ? ` · negro real ${seg(real[0])}–${seg(real[1])}` : ""}`);
    if (real && fin !== null && Math.abs(fin - real[0]) > 1)
      aviso(`pausas[${i}]: en words.json el ancla cae en ${seg(fin)} y el negro está en ${seg(real[0])}: verificar.mjs va a medir el negro en el lugar equivocado`);
  });
}

console.log(`\n${errores} ✖ · ${avisos} ⚠`);
process.exit(errores ? 1 : 0);
