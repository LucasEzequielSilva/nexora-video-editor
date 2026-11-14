#!/usr/bin/env node
// Copia el kit carrusel/ a <proyecto>/src/carrusel/ y dice cómo registrarlo.
// Uso: node instalar.mjs [ruta-al-proyecto-remotion]   (default: directorio actual)
import { cpSync, existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const aca = dirname(fileURLToPath(import.meta.url));
const proyecto = resolve(process.argv[2] ?? process.cwd());
const destino = join(proyecto, "src", "carrusel");
const pkg = join(proyecto, "package.json");

if (!existsSync(pkg) || !/"remotion"/.test(readFileSync(pkg, "utf8"))) {
  console.error(`✖ ${proyecto} no parece un proyecto Remotion (falta "remotion" en package.json).`);
  process.exit(1);
}
if (existsSync(destino)) {
  console.error(`✖ ${destino} ya existe. No piso nada: borralo o actualizá a mano.`);
  process.exit(1);
}
cpSync(join(aca, "carrusel"), destino, { recursive: true });
console.log(`✔ Kit copiado a ${destino}`);
console.log(`
Falta registrarlo en tu Root de Remotion:

  import CarruselCompositions from "./carrusel/carrusel-root";
  ...
  <CarruselCompositions />

Composiciones nuevas: ejemplo-bruma-1 … ejemplo-bruma-7 (láminas 1080x1350) y ejemplo-bruma-animado (video en bucle).
Para un carrusel nuevo: copiá briefs/ejemplo-bruma.ts a briefs/<slug>.ts y sumalo a BRIEFS en carrusel-root.tsx.
Láminas:  npx remotion still src/index.ts <slug>-3 out/<slug>-3.png
Video:    npx remotion render src/index.ts <slug>-animado out/<slug>.mp4
`);
