#!/usr/bin/env node
// Nivela la voz entre tomas: mide la mediana de la voz en cada tramo entre cortes (cara.json) y lleva al nivel general
// los tramos que se desvían más de 2 dB. Reescribe solo el audio de video.mp4 (la imagen se copia).
// Lucas (2026-09-25): "al principio no se pone bien el micro, entonces tenés que ajustarle los decibeles a la voz".
// Correr después de recortar.mjs + cara.py (si se vuelve a correr recortar.mjs, se pierde: repetir). Es idempotente.
// Uso: node scripts/nivelar-voz.mjs public/piezas/<slug> [--dry]
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";

const [, , dir, flag] = process.argv;
const dry = flag === "--dry";
if (!dir) {
  console.error("Uso: node scripts/nivelar-voz.mjs public/piezas/<slug> [--dry]");
  process.exit(1);
}
const video = path.join(dir, "video.mp4");
const caraPath = path.join(dir, "cara.json");
if (!existsSync(video) || !existsSync(caraPath)) {
  console.error("Faltan video.mp4 o cara.json (correr recortar.mjs y cara.py antes)");
  process.exit(1);
}

const FPS = 30;
const VENTANA = 0.02;
const UMBRAL_DB = 2;
const TOPES = [-8, 16];

const pcm = spawnSync("ffmpeg", ["-v", "error", "-i", video, "-vn", "-ac", "1", "-ar", "16000", "-af", "aresample=async=1", "-f", "s16le", "-"], {
  maxBuffer: 1024 * 1024 * 1024,
});
if (pcm.status !== 0) {
  console.error(pcm.stderr.toString());
  process.exit(1);
}
const muestras = new Int16Array(pcm.stdout.buffer, pcm.stdout.byteOffset, pcm.stdout.length / 2);
const porVentana = Math.round(16000 * VENTANA);
const db = [];
for (let i = 0; i + porVentana <= muestras.length; i += porVentana) {
  let suma = 0;
  for (let k = i; k < i + porVentana; k++) suma += (muestras[k] / 32768) ** 2;
  db.push(10 * Math.log10(suma / porVentana + 1e-12));
}
const total = db.length * VENTANA;

const mediana = (xs) => {
  const o = [...xs].sort((a, b) => a - b);
  return o.length ? o[Math.floor(o.length / 2)] : NaN;
};
const percentil = (xs, p) => {
  const o = [...xs].sort((a, b) => a - b);
  return o.length ? o[Math.min(o.length - 1, Math.floor((p / 100) * o.length))] : NaN;
};

const cortes = (JSON.parse(readFileSync(caraPath, "utf8")).cortes ?? []).map((f) => f / FPS);
const bordes = [0, ...cortes.filter((t) => t > 0 && t < total), total];
const tramos = [];
for (let i = 0; i + 1 < bordes.length; i++) {
  const [a, b] = [bordes[i], bordes[i + 1]];
  const vs = db.slice(Math.floor(a / VENTANA), Math.floor(b / VENTANA));
  // Voz = ventanas a menos de 25 dB del pico del tramo (y sobre -55): así un tramo con el micro lejos no queda afuera.
  const techo = percentil(vs, 95);
  const voz = vs.filter((x) => x > Math.max(-55, techo - 25));
  tramos.push({ a, b, voz: voz.length * VENTANA, nivel: voz.length * VENTANA >= 0.3 ? mediana(voz) : null });
}

// Nivel objetivo: mediana de los tramos con voz, pesada por cuánta voz tiene cada uno.
const pesados = tramos.filter((t) => t.nivel !== null).flatMap((t) => Array(Math.round(t.voz * 10)).fill(t.nivel));
const objetivo = mediana(pesados);
console.log(`Nivel de voz objetivo (mediana pesada): ${objetivo.toFixed(1)} dB`);
for (const t of tramos) {
  t.ganancia = 0;
  if (t.nivel !== null && Math.abs(objetivo - t.nivel) > UMBRAL_DB) t.ganancia = Math.min(TOPES[1], Math.max(TOPES[0], objetivo - t.nivel));
  console.log(
    `  ${t.a.toFixed(2).padStart(6)}–${t.b.toFixed(2).padStart(6)}  voz ${t.voz.toFixed(1).padStart(4)} s  ${t.nivel === null ? "   (sin voz)" : `${t.nivel.toFixed(1).padStart(6)} dB`}` +
      (t.ganancia ? `  -> ${t.ganancia > 0 ? "+" : ""}${t.ganancia.toFixed(1)} dB` : ""),
  );
}

const conGanancia = tramos.filter((t) => t.ganancia !== 0);
if (!conGanancia.length) {
  console.log("Nada que nivelar (todos los tramos a menos de 2 dB del objetivo).");
  process.exit(0);
}
if (dry) process.exit(0);

// Ganancia lineal por tramo como expresión de t; el cambio cae justo en el corte, donde el audio ya está en silencio.
const expr = conGanancia.reduceRight(
  (resto, t) => `if(between(t,${t.a.toFixed(3)},${t.b.toFixed(3)}),${(10 ** (t.ganancia / 20)).toFixed(4)},${resto})`,
  "1",
);
const tmp = path.join(dir, "video.nivelando.mp4");
const r = spawnSync(
  "ffmpeg",
  ["-hide_banner", "-loglevel", "error", "-y", "-i", video, "-map", "0:v", "-map", "0:a", "-c:v", "copy",
    "-af", `aresample=async=1,volume=eval=frame:volume='${expr}'`, "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", tmp],
  { stdio: "inherit" },
);
if (r.status !== 0) process.exit(r.status ?? 1);
// Copiar encima y no renombrar: en Windows, con Studio abierto, video.mp4 no se puede reemplazar (EPERM) pero sí sobrescribir.
copyFileSync(tmp, video);
rmSync(tmp, { force: true });
console.log(`OK -> ${video} (${conGanancia.length} tramos nivelados)`);
