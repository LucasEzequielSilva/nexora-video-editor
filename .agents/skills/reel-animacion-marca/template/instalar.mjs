#!/usr/bin/env node
// Copia el kit reel-marca/ a <proyecto>/src/reel-marca/ y dice cómo registrarlo.
// Uso: node instalar.mjs [ruta-al-proyecto-remotion]   (default: directorio actual)
import { cpSync, existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const aca = dirname(fileURLToPath(import.meta.url));
const proyecto = resolve(process.argv[2] ?? process.cwd());
const destino = join(proyecto, "src", "reel-marca");
const pkg = join(proyecto, "package.json");

if (!existsSync(pkg) || !/"remotion"/.test(readFileSync(pkg, "utf8"))) {
  console.error(`✖ ${proyecto} no parece un proyecto Remotion (falta "remotion" en package.json).`);
  process.exit(1);
}
if (existsSync(destino)) {
  console.error(`✖ ${destino} ya existe. No piso nada: borralo o actualizá a mano.`);
  process.exit(1);
}
cpSync(join(aca, "reel-marca"), destino, { recursive: true });
console.log(`✔ Kit copiado a ${destino}`);
console.log(`
Falta registrarlo en tu Root de Remotion:

  import ReelMarcaCompositions from "./reel-marca/reel-marca-root";
  ...
  <ReelMarcaCompositions />

Composiciones nuevas: ejemplo-turnix-16x9 (pantalla) y ejemplo-turnix-reel (reel 1080x1920).
Para una marca nueva: copiá briefs/ejemplo-turnix.ts a briefs/<slug>.ts y sumala a BRIEFS en reel-marca-root.tsx.
Las fuentes del brief apuntan a public/: ajustá 'fuentes' o borralo para usar la del sistema.
`);
