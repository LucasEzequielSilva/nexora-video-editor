#!/usr/bin/env node
// Proxy liviano de un clip crudo para verlo en el navegador (la herramienta de tomas): 540 px de ancho, H.264, SDR
// (tone map si el clip es HDR de iPhone, como montar.mjs), keyframe cada 30 cuadros para que el salto sea instantáneo.
// Uso: node scripts/proxy.mjs <clip> [salida.mp4]   (default: out/proxies/<nombre del clip>.mp4)
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

export const rutaProxy = (clip) => path.join(ROOT, "out", "proxies", `${path.parse(clip).name}.mp4`);

export function crearProxy(clip, salida = rutaProxy(clip)) {
  if (existsSync(salida) && statSync(salida).mtimeMs > statSync(clip).mtimeMs) return salida;
  const transfer = spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=color_transfer", "-of", "default=nw=1:nk=1", clip], { encoding: "utf8" }).stdout.trim();
  const hdr = transfer === "arib-std-b67" || transfer === "smpte2084";
  const vf = hdr
    ? `scale=540:-2,zscale=tin=${transfer}:t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p,fps=30`
    : "scale=540:-2,format=yuv420p,fps=30";
  console.log(`proxy de ${path.basename(clip)}${hdr ? " (HDR -> SDR)" : ""} -> ${path.relative(ROOT, salida)}`);
  mkdirSync(path.dirname(salida), { recursive: true });
  const r = spawnSync(
    "ffmpeg",
    ["-hide_banner", "-loglevel", "error", "-y", "-i", clip, "-vf", vf, "-c:v", "libx264", "-preset", "veryfast", "-crf", "27", "-g", "30", "-bf", "0",
      "-c:a", "aac", "-b:a", "128k", "-af", "aresample=async=1", "-movflags", "+faststart", salida],
    { stdio: "inherit" },
  );
  if (r.status !== 0) throw new Error(`ffmpeg falló con ${clip}`);
  return salida;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [, , clip, salida] = process.argv;
  if (!clip || !existsSync(clip)) {
    console.error("Uso: node scripts/proxy.mjs <clip> [salida.mp4]");
    process.exit(1);
  }
  console.log(`OK -> ${crearProxy(clip, salida)}`);
}
