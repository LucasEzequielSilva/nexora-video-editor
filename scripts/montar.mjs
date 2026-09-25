#!/usr/bin/env node
// Monta una lista de cortes en un solo MP4 vertical 1080x1920 a 30 fps.
// - Un corte por vez (un solo decodificador 4K abierto): 17 decodificadores HEVC juntos no entran en RAM.
// - Audio intermedio en PCM: se codifica AAC una sola vez al final, así no se acumula el "priming" de AAC por segmento
//   (que en el sistema de referencia desincronizaba los subtítulos).
// - Si el clip es HDR (HLG/PQ, típico de iPhone) se pasa a SDR BT.709 con tone mapping; sin eso los colores quedan lavados.
// Uso: node scripts/montar.mjs cortes/<slug>.json out/<slug>-bruto.mp4
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const [, , cortesPath, outPath] = process.argv;
if (!cortesPath || !outPath) {
  console.error("Uso: node scripts/montar.mjs cortes/<slug>.json out/<slug>-bruto.mp4");
  process.exit(1);
}

const W = 1080;
const H = 1920;
const FPS = 30;

const { base, cortes } = JSON.parse(readFileSync(cortesPath, "utf8"));
const work = mkdtempSync(path.join(tmpdir(), "montar-"));

const transferOf = (file) =>
  spawnSync(
    "ffprobe",
    ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=color_transfer", "-of", "default=nw=1:nk=1", file],
    { encoding: "utf8" },
  ).stdout.trim();

const toneMap = (transfer) =>
  `zscale=tin=${transfer}:t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p`;

const partes = [];
for (const [i, corte] of cortes.entries()) {
  const file = path.join(base, corte.archivo);
  const transfer = transferOf(file);
  const hdr = transfer === "arib-std-b67" || transfer === "smpte2084";
  const vf = [
    `scale=${W}:${H}:force_original_aspect_ratio=increase`,
    `crop=${W}:${H}`,
    hdr ? toneMap(transfer) : "format=yuv420p",
    `setsar=1`,
    `fps=${FPS}`,
    `setpts=PTS-STARTPTS`,
  ].join(",");
  const parte = path.join(work, `${String(i).padStart(2, "0")}.mkv`);

  console.log(`[${i + 1}/${cortes.length}] ${corte.archivo} ${corte.desde}-${corte.hasta}${hdr ? " (HDR -> SDR)" : ""}`);
  const r = spawnSync(
    "ffmpeg",
    [
      "-hide_banner", "-loglevel", "error", "-y",
      "-ss", String(corte.desde), "-t", (corte.hasta - corte.desde).toFixed(3), "-i", file,
      "-vf", vf,
      "-af", "aresample=48000,aformat=channel_layouts=stereo,asetpts=PTS-STARTPTS",
      "-c:v", "libx264", "-crf", "12", "-preset", "veryfast", "-pix_fmt", "yuv420p",
      "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
      "-c:a", "pcm_s16le",
      parte,
    ],
    { stdio: "inherit" },
  );
  if (r.status !== 0) {
    console.error(`Falló el corte ${i + 1} (${corte.archivo})`);
    process.exit(r.status ?? 1);
  }
  partes.push(parte);
}

const lista = path.join(work, "lista.txt");
writeFileSync(lista, partes.map((p) => `file '${p.replaceAll("\\", "/")}'`).join("\n"), "utf8");

const final = spawnSync(
  "ffmpeg",
  [
    "-hide_banner", "-loglevel", "error", "-y",
    "-f", "concat", "-safe", "0", "-i", lista,
    "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
    "-movflags", "+faststart",
    outPath,
  ],
  { stdio: "inherit" },
);
rmSync(work, { recursive: true, force: true });
if (final.status === 0) console.log(`OK -> ${outPath}`);
process.exit(final.status ?? 1);
