#!/usr/bin/env node
// Cue sheet + chequeo de un spec ad: node scripts/spec-cues.mjs <slug>
// Lee public/spec/<slug>/spec.json y escribe out/spec/<slug>/cue-sheet.md: escenas (S01…), guion de voz por carril,
// SFX con su timecode en el nombre ("SFX 004 - 3.300 burbuja.wav", como en la timeline de DaVinci de los spec ads de
// referencia), música por stems, plates a generar en Higgsfield y pendientes. Sale con 1 si el chequeo encuentra ✖.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const slug = process.argv[2];
if (!slug) {
  console.error("uso: node scripts/spec-cues.mjs <slug>");
  process.exit(2);
}
const ruta = join(raiz, "public/spec", slug, "spec.json");
const spec = JSON.parse(readFileSync(ruta, "utf8"));
const sfxNombres = new Set(
  [...readFileSync(join(raiz, "src/reserva/components/sfx.tsx"), "utf8").matchAll(/^\s+"?([a-z0-9-]+)"?: "reserva\/sfx\//gm)].map((m) => m[1]),
);

const errores = [];
const avisos = [];
const existe = (f) => existsSync(join(raiz, "public", f));
const s3 = (x) => x.toFixed(3);
const esc = [...spec.escenas].sort((a, b) => a.desdeS - b.desdeS);

// Chequeo
esc.forEach((e, i) => {
  if (e.hastaS <= e.desdeS) errores.push(`${e.id}: hastaS <= desdeS`);
  const sig = esc[i + 1];
  if (sig && Math.abs(sig.desdeS - e.hastaS) > 0.001) errores.push(`${e.id} → ${sig.id}: hueco o solape (${e.hastaS} vs ${sig.desdeS})`);
  if (e.hastaS - e.desdeS > 8) avisos.push(`${e.id}: ${(e.hastaS - e.desdeS).toFixed(1)} s (una idea por plano: los beats de referencia duran 2–5 s)`);
  if (e.tipo === "plate" && !e.datos.archivo) avisos.push(`${e.id}: plate sin generar (${e.origen})`);
  if (e.tipo === "plate" && e.datos.archivo && !existe(e.datos.archivo)) errores.push(`${e.id}: no existe public/${e.datos.archivo}`);
  if (e.tipo === "dispositivo" && e.datos.pantalla.tipo !== "chat" && !existe(e.datos.pantalla.archivo))
    errores.push(`${e.id}: no existe public/${e.datos.pantalla.archivo}`);
  for (const f of [e.datos.logo].filter(Boolean)) if (!existe(f)) errores.push(`${e.id}: no existe public/${f}`);
});
if (esc[0]?.desdeS !== 0) errores.push("la primera escena no arranca en 0");
if (Math.abs(esc.at(-1).hastaS - spec.duracionS) > 0.001) errores.push(`la última escena termina en ${esc.at(-1).hastaS} y duracionS es ${spec.duracionS}`);
for (const c of spec.sfx) {
  if (c.nombre && !sfxNombres.has(c.nombre)) errores.push(`SFX "${c.nombre}" no está en SFX_FILES`);
  if (c.archivo && !existe(c.archivo)) errores.push(`SFX: no existe public/${c.archivo}`);
  if (!c.nombre && !c.archivo) avisos.push(`SFX ${s3(c.atS)} "${c.nota}" sin sonido asignado`);
  if (c.atS > spec.duracionS) errores.push(`SFX ${s3(c.atS)} después del final`);
}
for (const v of spec.voz) if (v.archivo && !existe(v.archivo)) errores.push(`VO: no existe public/${v.archivo}`);
if (spec.voz.some((v) => !v.archivo)) avisos.push(`voz: ${spec.voz.filter((v) => !v.archivo).length} líneas sin grabar`);
if (!spec.musica.some((m) => m.archivo)) avisos.push("música sin elegir");

// Cue sheet
const L = [];
L.push(`# ${spec.titulo}`, "", `- **Tipo:** ${spec.tipoPieza === "spec" ? "spec (no oficial)" : "cliente"} · ${spec.duracionS} s · 16:9 + 9:16`);
L.push(`- **Concepto:** ${spec.concepto}`, `- **Motivo:** ${spec.motivo}`, "");
L.push("## Escenas", "", "| ID | Nombre | Tipo | In | Out | Origen |", "|---|---|---|---|---|---|");
for (const e of esc) L.push(`| ${e.id} | ${e.nombre} | ${e.tipo} | ${s3(e.desdeS)} | ${s3(e.hastaS)} | ${e.origen} |`);
L.push("", "## Voz en off", "");
for (const c of ["A", "B"]) {
  L.push(`**Carril ${c}**`, "");
  spec.voz.filter((v) => v.carril === c).forEach((v, i) => L.push(`- \`VO L${i + 1} (${c}) - ${s3(v.atS)}\` ${v.texto}${v.archivo ? "" : " _(sin grabar)_"}`));
  L.push("");
}
L.push("## SFX", "", "| Archivo | Categoría | Acompaña |", "|---|---|---|");
[...spec.sfx]
  .sort((a, b) => a.atS - b.atS)
  .forEach((c, i) => {
    const base = c.nombre ?? (c.archivo ? c.archivo.split("/").pop().replace(/\.[^.]+$/, "") : "SIN-ASIGNAR");
    L.push(`| SFX ${String(i + 1).padStart(3, "0")} - ${s3(c.atS)} ${base}.wav | ${c.categoria} | ${c.nota} |`);
  });
L.push("", "## Música (stems)", "");
for (const m of spec.musica) L.push(`- **${m.nombre}**${m.archivo ? ` — \`${m.archivo}\`` : " _(sin elegir)_"}${m.nota ? `: ${m.nota}` : ""}`);
const plates = esc.filter((e) => e.tipo === "plate");
if (plates.length) {
  L.push("", "## Plates a generar (Higgsfield)", "", "Cotizar con `get_cost` y pedir OK antes de cada generación. Sin personas salvo que el plano las pida.", "");
  for (const e of plates)
    L.push(`- **${e.id} · ${e.nombre}** (${(e.hastaS - e.desdeS).toFixed(1)} s, ${e.datos.modelo ?? "modelo a elegir"})${e.datos.archivo ? ` ✔ \`${e.datos.archivo}\`` : ""}`, `  > ${e.datos.prompt}`);
}
if (spec.pendientes?.length) L.push("", "## Pendientes", "", ...spec.pendientes.map((p) => `- [ ] ${p}`));
L.push("", "## Chequeo", "", ...(errores.length ? errores.map((e) => `- ✖ ${e}`) : ["- ✔ sin errores"]), ...avisos.map((a) => `- ⚠️ ${a}`));

const salida = join(raiz, "out/spec", slug, "cue-sheet.md");
mkdirSync(dirname(salida), { recursive: true });
writeFileSync(salida, `${L.join("\n")}\n`);
console.log(`cue sheet: ${salida}`);
for (const e of errores) console.log(`✖ ${e}`);
for (const a of avisos) console.log(`⚠️  ${a}`);
process.exit(errores.length ? 1 : 0);
