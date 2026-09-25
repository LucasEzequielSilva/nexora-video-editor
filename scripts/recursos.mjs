#!/usr/bin/env node
// Biblioteca de recursos: cataloga PACKS/ en assets/biblioteca.json.
// Catálogo perezoso: `escanear` solo agrega entradas nuevas (ruta, duración, categoría).
// La descripción se completa con `describir` cuando un recurso se usa por primera vez.
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const PACKS_DIR = path.join(ROOT, "PACKS");
const BIBLIOTECA_PATH = path.join(ROOT, "assets", "biblioteca.json");

const VIDEO_EXT = new Set([".mp4", ".mov"]);
const AUDIO_EXT = new Set([".mp3", ".wav", ".aac", ".m4a"]);
const FONT_EXT = new Set([".ttf", ".otf"]);
const IMAGE_EXT = new Set([".png", ".webp", ".jpg"]);
const MODELO_3D_EXT = new Set([".glb"]);
const LUT_EXT = new Set([".cube"]);

// Prefijo de ruta (relativo a PACKS/) -> { categoria, prefix }
const CATEGORIES = [
  { match: "BROLL CINEMÁTICO", categoria: "broll-cinematico", prefix: "broll" },
  { match: "SOUND EFFECTS/SFX PACK 2/Cine SFX", categoria: "sfx-cine", prefix: "sfx-cine" },
  { match: "SOUND EFFECTS/SFX PACK 2/SFX General", categoria: "sfx-general", prefix: "sfx-general" },
  { match: "SOUND EFFECTS/SFX PACK 2/SFX2", categoria: "sfx2", prefix: "sfx2" },
  { match: "SOUND EFFECTS/SFX PACK 2/Teclas-Clicks", categoria: "sfx-teclas-clicks", prefix: "sfx-teclas" },
  { match: "SOUND EFFECTS/SFX PACK 2/Whooshes", categoria: "sfx-whooshes", prefix: "sfx-whoosh" },
  // Raíz de SFX PACK 2 (después de sus subcarpetas, que ganan por ir antes).
  { match: "SOUND EFFECTS/SFX PACK 2/", categoria: "sfx-pack2", prefix: "sfx-pack2", extsOnly: AUDIO_EXT },
  { match: "SOUND EFFECTS/SFX PACK 1", categoria: "sfx-pack1", prefix: "sfx-pack1", extsOnly: AUDIO_EXT },
  { match: "PRESETS DAVINCI RESOLVE (Clase 6)", categoria: "fuente", prefix: "fuente", extsOnly: FONT_EXT },
  { match: "FUENTES PRO ELEGANTES", categoria: "fuente", prefix: "fuente", extsOnly: FONT_EXT },
  { match: "PRESETS TEXTO PREMIERE [V4]/Fuentes V4", categoria: "fuente", prefix: "fuente", extsOnly: FONT_EXT },
  { match: "PRESETS SUBTÍTULOS CAPCUT/FUENTES UTILIZADAS", categoria: "fuente", prefix: "fuente", extsOnly: FONT_EXT },
  // Íconos premium de Lucas, ya recortados con fondo transparente. Los "_*.png" son las láminas originales.
  { match: "ICONOS", categoria: "icono", prefix: "icono", extsOnly: IMAGE_EXT },
  // Pack completo descargado el 2026-09-24.
  { match: "MÚSICA DE FONDO", categoria: "musica", prefix: "musica", extsOnly: AUDIO_EXT },
  { match: "ANAMORPHIC FLARES", categoria: "flare", prefix: "flare" },
  { match: "CINEMATIC OVERLAYS", categoria: "overlay", prefix: "overlay" },
  { match: "FILM BURNS", categoria: "film-burn", prefix: "film-burn" },
  { match: "ART TRANSITIONS", categoria: "transicion", prefix: "transicion" },
  { match: "GLITCH TRANSITIONS", categoria: "transicion", prefix: "transicion" },
  { match: "FLECHAS _IMAN GADZHI_", categoria: "flecha", prefix: "flecha" },
  { match: "FONDOS ABSTRACTOS", categoria: "fondo", prefix: "fondo" },
  { match: "LETRAS ANIMADAS", categoria: "letra-animada", prefix: "letra" },
  { match: "TEXTURAS PAPEL", categoria: "textura", prefix: "textura" },
  { match: "RECTÁNGULOS SUPER 8MM", categoria: "marco-8mm", prefix: "marco-8mm" },
  { match: "DEGRADADOS NEGROS", categoria: "degradado", prefix: "degradado" },
  { match: "OBJETOS 3D", categoria: "objeto-3d", prefix: "objeto-3d", extsOnly: MODELO_3D_EXT },
  { match: "LUTS", categoria: "lut", prefix: "lut", extsOnly: LUT_EXT },
  { match: "BRUTOS PARA PRACTICAR", categoria: "bruto", prefix: "bruto", extsOnly: VIDEO_EXT },
];

const loadBiblioteca = () => {
  if (!existsSync(BIBLIOTECA_PATH)) return [];
  return JSON.parse(readFileSync(BIBLIOTECA_PATH, "utf8"));
};

const saveBiblioteca = (entries) => {
  mkdirSync(path.dirname(BIBLIOTECA_PATH), { recursive: true });
  writeFileSync(BIBLIOTECA_PATH, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
};

const walk = async (dir) => {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
};

const categoryFor = (relToPacks) => {
  for (const cat of CATEGORIES) {
    if (relToPacks.startsWith(cat.match)) return cat;
  }
  return null;
};

const ffprobeDuration = (absPath) => {
  try {
    const out = execFileSync(
      "ffprobe",
      ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", absPath],
      { encoding: "utf8" },
    ).trim();
    const seconds = parseFloat(out);
    return Number.isFinite(seconds) ? Math.round(seconds * 100) / 100 : null;
  } catch {
    return null;
  }
};

const nextIndex = (entries, prefix) => {
  const re = new RegExp(`^${prefix}-(\\d+)$`);
  let max = 0;
  for (const e of entries) {
    const m = re.exec(e.id);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return max + 1;
};

const escanear = async () => {
  const entries = loadBiblioteca();
  const known = new Set(entries.map((e) => e.ruta));
  const files = await walk(PACKS_DIR);
  const counters = {};
  let added = 0;
  // Lucas marca favoritos renombrando (ej. "METAMORPHOSIS ganador.mp3"): una entrada cuyo archivo ya no existe y un
  // archivo nuevo de la misma categoría, extensión y duración son el mismo recurso. Se actualiza la ruta y se
  // conservan id, descripción y usos, en vez de darlo de alta como nuevo.
  const huerfanas = entries.filter((e) => !existsSync(path.join(ROOT, e.ruta)));
  let renombrados = 0;

  for (const abs of files) {
    const relToPacks = path.relative(PACKS_DIR, abs).split(path.sep).join("/");
    const ruta = path.relative(ROOT, abs).split(path.sep).join("/");
    if (known.has(ruta)) continue;

    const cat = categoryFor(relToPacks);
    if (!cat) continue;

    const ext = path.extname(abs).toLowerCase();
    let tipo;
    if (VIDEO_EXT.has(ext)) tipo = "video";
    else if (AUDIO_EXT.has(ext)) tipo = "audio";
    else if (FONT_EXT.has(ext)) tipo = "fuente";
    else if (IMAGE_EXT.has(ext)) tipo = "imagen";
    else if (MODELO_3D_EXT.has(ext)) tipo = "3d";
    else if (LUT_EXT.has(ext)) tipo = "lut";
    else continue; // presets de DaVinci u otros archivos no usables en Remotion

    if (cat.extsOnly && !cat.extsOnly.has(ext)) continue;
    if (path.basename(abs).startsWith("_")) continue;

    const duracion = tipo === "video" || tipo === "audio" ? ffprobeDuration(abs) : null;
    const anterior = huerfanas.find(
      (e) =>
        e.categoria === cat.categoria &&
        path.extname(e.ruta).toLowerCase() === ext &&
        (duracion === null ? path.basename(ruta).includes(path.basename(e.ruta, ext)) : Math.abs((e.duracion_seg ?? -1) - duracion) < 0.05),
    );
    if (anterior) {
      console.log(`Renombrado: ${anterior.id} ${anterior.ruta} -> ${ruta}`);
      anterior.ruta = ruta;
      huerfanas.splice(huerfanas.indexOf(anterior), 1);
      known.add(ruta);
      renombrados += 1;
      continue;
    }

    counters[cat.prefix] ??= nextIndex(entries, cat.prefix);
    const id = `${cat.prefix}-${String(counters[cat.prefix]).padStart(3, "0")}`;
    counters[cat.prefix] += 1;

    entries.push({
      id,
      ruta,
      categoria: cat.categoria,
      tipo,
      duracion_seg: duracion,
      descripcion: null,
      procedencia: "pack",
      usado_en: [],
    });
    known.add(ruta);
    added += 1;
  }

  saveBiblioteca(entries);
  console.log(`Escaneado: ${added} recursos nuevos, ${renombrados} renombrados, ${entries.length} en total.`);
  if (huerfanas.length) console.log(`Sin archivo (borrados o movidos): ${huerfanas.map((e) => `${e.id} ${e.ruta}`).join(" | ")}`);
};

const listar = (categoria) => {
  const entries = loadBiblioteca();
  const filtered = categoria ? entries.filter((e) => e.categoria === categoria) : entries;

  if (!categoria) {
    const porCategoria = {};
    for (const e of entries) porCategoria[e.categoria] = (porCategoria[e.categoria] ?? 0) + 1;
    for (const [cat, n] of Object.entries(porCategoria)) console.log(`${cat}: ${n}`);
    const sinDescribir = entries.filter((e) => !e.descripcion).length;
    console.log(`\nTotal: ${entries.length} | sin describir: ${sinDescribir}`);
    return;
  }

  for (const e of filtered) {
    const dur = e.duracion_seg != null ? `${e.duracion_seg}s` : "-";
    console.log(`${e.id}  ${dur.padEnd(8)}  ${e.descripcion ?? "(sin descripción)"}  [${e.ruta}]`);
  }
  console.log(`\n${filtered.length} recursos en "${categoria}"`);
};

const buscar = (palabra) => {
  const q = palabra.toLowerCase();
  const entries = loadBiblioteca().filter(
    (e) =>
      e.id.toLowerCase().includes(q) ||
      e.categoria.toLowerCase().includes(q) ||
      (e.descripcion ?? "").toLowerCase().includes(q),
  );
  if (entries.length === 0) {
    console.log(`Sin resultados para "${palabra}".`);
    return;
  }
  for (const e of entries) {
    console.log(`${e.id}  [${e.categoria}]  ${e.descripcion ?? "(sin descripción)"}  usado_en: ${e.usado_en.join(", ") || "-"}`);
    console.log(`  ${e.ruta}`);
  }
};

const describir = (id, texto) => {
  const entries = loadBiblioteca();
  const entry = entries.find((e) => e.id === id);
  if (!entry) {
    console.error(`No existe el recurso "${id}". Corré "listar" o "buscar" para ver ids.`);
    process.exitCode = 1;
    return;
  }
  entry.descripcion = texto;
  saveBiblioteca(entries);
  console.log(`${id} -> "${texto}"`);
};

const usar = (id, slug) => {
  const entries = loadBiblioteca();
  const entry = entries.find((e) => e.id === id);
  if (!entry) {
    console.error(`No existe el recurso "${id}".`);
    process.exitCode = 1;
    return;
  }
  if (!entry.usado_en.includes(slug)) entry.usado_en.push(slug);
  saveBiblioteca(entries);

  const destDir = path.join(ROOT, "public", "recursos");
  const dest = path.join(destDir, `${id}${path.extname(entry.ruta).toLowerCase()}`);
  mkdirSync(destDir, { recursive: true });
  if (!existsSync(dest)) copyFileSync(path.join(ROOT, entry.ruta), dest);

  console.log(`${id} marcado como usado en "${slug}". usado_en: ${entry.usado_en.join(", ")}`);
  console.log(`Para Remotion: staticFile("recursos/${path.basename(dest)}")`);
};

const usage = () => {
  console.log(`Uso: node scripts/recursos.mjs <comando> [args]

  escanear                    agrega a la biblioteca los archivos nuevos de PACKS/
  listar [categoria]          cuenta por categoría, o lista una categoría puntual
  buscar <palabra>            busca en id/categoria/descripcion
  describir <id> "<texto>"    completa la descripción de un recurso
  usar <id> <slug-video>      marca el recurso como usado en una pieza y lo copia a public/recursos/ para Remotion`);
};

const [, , cmd, ...args] = process.argv;

switch (cmd) {
  case "escanear":
    await escanear();
    break;
  case "listar":
    listar(args[0]);
    break;
  case "buscar":
    if (!args[0]) usage();
    else buscar(args[0]);
    break;
  case "describir":
    if (args.length < 2) usage();
    else describir(args[0], args.slice(1).join(" "));
    break;
  case "usar":
    if (args.length < 2) usage();
    else usar(args[0], args[1]);
    break;
  default:
    usage();
}
