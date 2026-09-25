#!/usr/bin/env node
// Fotogramas clave de una pieza con un solo bundle y un solo navegador (no un "npx remotion still" por cuadro).
// Lo llama scripts/verificar.mjs a través de turno.mjs. Uso: node scripts/verificar-stills.mjs <entrada.json>
// entrada.json: { slug, cuadros: [{ frame, archivo }], resultado } -> escribe resultado: { ok: [...], errores: [...] }
import { rmSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";

const RAIZ = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const entrada = JSON.parse(readFileSync(process.argv[2], "utf8"));
const CACHE_VIDEO = 300_000_000;
const TIMEOUT = 120_000;

const t0 = Date.now();
let ultimo = -10;
const serveUrl = await bundle({
  entryPoint: path.join(RAIZ, "src", "index.ts"),
  onProgress: (p) => {
    if (p >= ultimo + 25) {
      ultimo = p;
      console.log(`[stills] bundle ${p}%`);
    }
  },
});
console.log(`[stills] bundle listo en ${((Date.now() - t0) / 1000).toFixed(0)} s`);

const navegador = await openBrowser("chrome");
const resultado = { ok: [], errores: [] };
try {
  const composition = await selectComposition({
    serveUrl,
    id: entrada.slug,
    inputProps: {},
    puppeteerInstance: navegador,
    timeoutInMilliseconds: TIMEOUT,
    offthreadVideoCacheSizeInBytes: CACHE_VIDEO,
  });
  for (const { frame, archivo } of entrada.cuadros) {
    const f = Math.max(0, Math.min(composition.durationInFrames - 1, frame));
    try {
      await renderStill({
        composition,
        serveUrl,
        output: archivo,
        frame: f,
        imageFormat: "jpeg",
        jpegQuality: 85,
        scale: 0.5,
        overwrite: true,
        puppeteerInstance: navegador,
        timeoutInMilliseconds: TIMEOUT,
        offthreadVideoCacheSizeInBytes: CACHE_VIDEO,
      });
      resultado.ok.push({ frame: f, archivo });
      console.log(`[stills] cuadro ${f} -> ${path.basename(archivo)}`);
    } catch (e) {
      resultado.errores.push({ frame: f, error: String(e?.message ?? e).slice(0, 500) });
      console.error(`[stills] cuadro ${f}: ${String(e?.message ?? e).slice(0, 200)}`);
    }
  }
} finally {
  await navegador.close({ silent: true }).catch(() => {});
  writeFileSync(entrada.resultado, JSON.stringify(resultado, null, 1));
  // El bundle copia public/ entero (~500 MB): no dejarlo en el temporal.
  rmSync(serveUrl, { recursive: true, force: true });
}
console.log(`[stills] ${resultado.ok.length} cuadros, ${resultado.errores.length} errores, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
process.exit(resultado.errores.length ? 1 : 0);
