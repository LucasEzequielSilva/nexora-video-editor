#!/usr/bin/env node
// Revisa una pieza ANTES de mostrársela a Lucas: lo que hoy él tenía que encontrar a ojo (Studio que se cae, eco que no
// se oye, música muda o despareja, risers en los zooms) lo encuentra la máquina.
// Uso: npm run verificar -- <slug> [--sin-audio] [--sin-studio] [--sin-stills] [--camara]
// Salida: out/verif/<slug>/informe.md + informe.json (+ mezcla.wav, hoja.jpg, capturas de Studio). Sale con 1 si hay ❌.
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const FPS = 30;
const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith("--"));
const flags = new Set(args.filter((a) => a.startsWith("--")));
if (!slug) {
  console.error("Uso: npm run verificar -- <slug> [--sin-audio] [--sin-studio] [--sin-stills] [--camara]");
  process.exit(2);
}
const PIEZA = path.join(RAIZ, "public", "piezas", slug);
const SALIDA = path.join(RAIZ, "out", "verif", slug);
if (!existsSync(path.join(PIEZA, "props.json"))) {
  console.error(`No existe public/piezas/${slug}/props.json`);
  process.exit(2);
}
mkdirSync(SALIDA, { recursive: true });

const rel = (p) => path.relative(RAIZ, p).replaceAll("\\", "/");
const leerJson = (p) => JSON.parse(readFileSync(p, "utf8"));
const props = leerJson(path.join(PIEZA, "props.json"));
const words = leerJson(path.join(PIEZA, "words.json")).segments.flatMap((s) => s.words);
const totalFrames = Math.round(props.durationSeconds * FPS);
const totalS = totalFrames / FPS;

// ---------- informe ----------
const ICONO = { ok: "✅", aviso: "⚠️", error: "❌", info: "ℹ️", omitido: "⏭️" };
const PESO = { omitido: 0, info: 0, ok: 1, aviso: 2, error: 3 };
const checks = [];
const nuevo = (id, titulo) => {
  const c = { id, titulo, items: [], datos: {} };
  checks.push(c);
  return c;
};
const agregar = (c, estado, texto, t) => c.items.push(t === undefined ? { estado, texto } : { estado, texto, t: +t.toFixed(2) });
const estadoDe = (c) => {
  if (c.items.length === 0) return "ok";
  if (c.items.every((i) => i.estado === "omitido")) return "omitido";
  const peor = c.items.reduce((a, i) => (PESO[i.estado] > PESO[a] ? i.estado : a), "info");
  return peor === "info" ? "ok" : peor;
};

// ---------- procesos ----------
const citar = (a) => (/[\s"&|<>^()]/.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a);
const correr = (cmd, argumentos, { log, mostrar = false } = {}) =>
  new Promise((resolve) => {
    const hijo = spawn([cmd, ...argumentos].map(citar).join(" "), { shell: true, cwd: RAIZ });
    let out = "";
    const recibir = (d) => {
      const s = d.toString();
      out += s;
      if (mostrar) process.stdout.write(s.replace(/^(?=.)/gm, "    "));
    };
    hijo.stdout.on("data", recibir);
    hijo.stderr.on("data", recibir);
    hijo.on("close", (code) => {
      if (log) writeFileSync(log, out);
      resolve({ code: code ?? 1, out });
    });
  });
const python = async (modo, entrada, nombre) => {
  const fEntrada = path.join(SALIDA, `${nombre}-entrada.json`);
  const fSalida = path.join(SALIDA, `${nombre}-resultado.json`);
  writeFileSync(fEntrada, JSON.stringify(entrada));
  const r = await correr("python", [path.join(RAIZ, "scripts", "verificar.py"), modo, fEntrada, fSalida], { log: path.join(SALIDA, `${nombre}.log`) });
  if (r.code !== 0) return { error: r.out.trim().split("\n").slice(-4).join(" | ") };
  return leerJson(fSalida);
};

// ---------- anclas (misma lógica que src/pieza/anclas.ts) ----------
const normalizar = (t) => t.toLowerCase().replace(/[.,;:¿?¡!"]/g, "").trim();
const resolverMs = (ancla) => {
  const offset = ancla.offsetMs ?? 0;
  if (ancla.palabra === undefined) return ancla.atMs === undefined ? null : ancla.atMs + offset;
  const clave = normalizar(ancla.palabra);
  const hit = words.filter((w) => normalizar(w.word) === clave)[(ancla.n ?? 1) - 1];
  return hit ? Math.round((ancla.fin ? hit.end : hit.start) * 1000) + offset : null;
};
const msToFrame = (ms) => Math.round((ms / 1000) * FPS);
/** Cuadro del ancla (como lo usa la composición) o null. */
const cuadro = (ancla) => {
  const ms = resolverMs(ancla);
  return ms === null ? null : msToFrame(ms);
};
const describir = (a) =>
  a.palabra === undefined
    ? `atMs ${a.atMs}`
    : `"${a.palabra}"${a.n ? ` n=${a.n}` : ""}${a.fin ? " (fin)" : ""}${a.offsetMs ? ` ${a.offsetMs > 0 ? "+" : ""}${a.offsetMs} ms` : ""}`;

// ---------- SFX_FILES (de src/reserva/components/sfx.tsx) ----------
const fuenteSfx = readFileSync(path.join(RAIZ, "src", "reserva", "components", "sfx.tsx"), "utf8");
const bloqueSfx = fuenteSfx.slice(fuenteSfx.indexOf("export const SFX_FILES"), fuenteSfx.indexOf("} as const"));
const SFX_FILES = Object.fromEntries([...bloqueSfx.matchAll(/^\s*"?([\w-]+)"?\s*:\s*"([^"]+)"/gm)].map((m) => [m[1], m[2]]));
const RISER = new Set(["riser", "zoom-in", "zoom-in-corto", "zoom-out"]);
// Los recursos copiados a public/recursos/ se llaman por id del catálogo (sfx-cine-017.mp3 = "Copia de Riser"): el tipo
// sale de la biblioteca (nombre original + clase de la descripción), no del nombre del archivo.
const BIBLIOTECA = (() => {
  try {
    return new Map(leerJson(path.join(RAIZ, "assets", "biblioteca.json")).map((r) => [r.id, r]));
  } catch {
    return new Map();
  }
})();
const recursoDe = (archivo) => BIBLIOTECA.get(path.basename(archivo ?? "", path.extname(archivo ?? "")));
const esRiser = (cue) => {
  if ("nombre" in cue) return RISER.has(cue.nombre);
  const r = recursoDe(cue.archivo);
  const texto = r ? `${path.basename(r.ruta)} ${(r.descripcion ?? "").split(" · ")[0]}` : (cue.archivo ?? "");
  return /rise/i.test(texto);
};

const archivosSrc = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? archivosSrc(p) : /\.tsx?$/.test(d.name) ? [p] : [];
  });

// ---------- tiempos de la pieza ----------
const negro = (() => {
  const p = (props.pausas ?? [])[0];
  if (!p) return null;
  const ms = resolverMs(p.tras);
  return ms === null ? null : { inicio: ms / 1000, fin: ms / 1000 + p.segundos };
})();
const finHook = (() => {
  if (negro) return negro.fin;
  const w = words.find((x) => /[.?!]$/.test(x.word.trim()));
  return w ? w.end + 0.3 : 6;
})();

const rangoEscena = (o) => {
  const desde = resolverMs(o.desde);
  const hasta = o.hasta === "fin" ? totalS * 1000 : resolverMs(o.hasta);
  if (desde === null || hasta === null) return null;
  const from = msToFrame(desde);
  return { from, duration: Math.max(1, Math.min(totalFrames, msToFrame(hasta)) - from) };
};
const rangoOverlay = (o) => {
  if (o.tipo === "escena") return rangoEscena(o);
  if (o.tipo === "broll") {
    const a = cuadro(o.desde);
    const b = cuadro(o.hasta);
    return a === null || b === null ? null : { from: a, duration: Math.max(1, b - a) };
  }
  if (o.tipo === "strike") {
    const ats = o.palabras.map((p) => cuadro(p.en)).filter((x) => x !== null);
    const b = cuadro(o.hasta);
    if (!ats.length || b === null) return null;
    const from = Math.min(...ats) - 3;
    return { from, duration: Math.max(1, b - from) };
  }
  if (o.tipo === "icono") {
    const a = cuadro(o.en);
    return a === null ? null : { from: Math.max(0, a - 2), duration: msToFrame(o.duracionMs ?? 1400) };
  }
  return null;
};
const etiquetaOverlay = (o) =>
  o.tipo === "escena" ? `escena ${o.escena}` : o.tipo === "broll" ? `b-roll ${path.basename(o.archivo)}` : o.tipo;

// =====================================================================================================
// 1. Tipos
const chequearTipos = async () => {
  const c = nuevo("tipos", "1. Tipos (tsc --noEmit)");
  const r = await correr("npx", ["tsc", "--noEmit", "-p", "."], { log: path.join(SALIDA, "tsc.log") });
  const errores = r.out.split("\n").filter((l) => /error TS\d+/.test(l));
  if (r.code === 0) agregar(c, "ok", "sin errores de tipos");
  else {
    agregar(c, "error", `${errores.length || "?"} errores de TypeScript (ver ${rel(path.join(SALIDA, "tsc.log"))})`);
    for (const l of errores.slice(0, 10)) agregar(c, "error", l.trim());
  }
};

// 2. Anclas
const chequearAnclas = () => {
  const c = nuevo("anclas", "2. Anclas de props.json contra words.json");
  const lista = [];
  const malasCue = [];
  const add = (ruta, a) => a && typeof a === "object" && lista.push({ ruta, a });
  (props.sfx ?? []).forEach((s, i) => {
    add(`sfx[${i}] ${s.nombre ?? path.basename(s.archivo ?? "")}`, s);
    if (s.corte) add(`sfx[${i}].corte`, s.corte);
  });
  (props.zooms ?? []).forEach((z, i) => {
    add(`zooms[${i}].inicio`, z.inicio);
    if (z.fin !== "fin") add(`zooms[${i}].fin`, z.fin);
  });
  (props.overlays ?? []).forEach((o, i) => {
    const base = `overlays[${i}] ${etiquetaOverlay(o)}`;
    for (const k of ["desde", "en"]) if (o[k]) add(`${base}.${k}`, o[k]);
    if (o.hasta && o.hasta !== "fin") add(`${base}.hasta`, o.hasta);
    for (const [nombre, a] of Object.entries(o.cues ?? {})) add(`${base}.cues.${nombre}`, a);
    (o.palabras ?? []).forEach((p, j) => add(`${base}.palabras[${j}].en`, p.en));
    if (o.tipo === "escena") {
      // Nombres de cue dentro de datos (cue, cueConfirma, panelCue…): si no está en cues la escena cae callada a un
      // tiempo por defecto (cues[x] ?? fallback).
      const recorrer = (v, ruta) => {
        if (Array.isArray(v)) v.forEach((x, j) => recorrer(x, `${ruta}[${j}]`));
        else if (v && typeof v === "object") {
          for (const [k, x] of Object.entries(v)) {
            if (typeof x === "string" && /^cue($|[A-Z])|Cue$/.test(k) && !(x in (o.cues ?? {}))) {
              malasCue.push(`${base}.datos${ruta}.${k}: el cue "${x}" no está en cues (${Object.keys(o.cues ?? {}).join(", ") || "vacío"}): la escena lo pone en un tiempo por defecto`);
            } else recorrer(x, `${ruta}.${k}`);
          }
        }
      };
      recorrer(o.datos, "");
    }
  });
  if (props.musica) add("musica.desde", props.musica.desde);
  (props.pausas ?? []).forEach((p, i) => add(`pausas[${i}].tras`, p.tras));

  let malas = malasCue.length;
  for (const texto of malasCue) agregar(c, "error", texto);
  for (const { ruta, a } of lista) {
    const ms = resolverMs(a);
    if (ms === null) {
      malas++;
      const cuantas = a.palabra === undefined ? 0 : words.filter((w) => normalizar(w.word) === normalizar(a.palabra)).length;
      agregar(c, "error", `${ruta}: ${describir(a)} no resuelve (la palabra aparece ${cuantas} veces en words.json)`);
    } else if (ms < 0 || ms / 1000 > totalS + 0.05) {
      malas++;
      agregar(c, "error", `${ruta}: ${describir(a)} cae en ${(ms / 1000).toFixed(2)} s, fuera de la pieza (0–${totalS.toFixed(2)} s)`, ms / 1000);
    }
  }
  const rangos = [
    ...(props.zooms ?? []).map((z, i) => [`zooms[${i}]`, z.inicio, z.fin]),
    ...(props.overlays ?? []).filter((o) => o.desde && o.hasta).map((o) => [etiquetaOverlay(o), o.desde, o.hasta]),
  ];
  for (const [nombre, a, b] of rangos) {
    const ma = resolverMs(a);
    const mb = b === "fin" ? totalS * 1000 : resolverMs(b);
    if (ma !== null && mb !== null && mb <= ma) {
      malas++;
      agregar(c, "error", `${nombre}: termina (${(mb / 1000).toFixed(2)} s) antes de empezar (${(ma / 1000).toFixed(2)} s)`, ma / 1000);
    }
  }
  for (const acento of props.subtitulos?.acentos ?? []) {
    const palabra = typeof acento === "string" ? acento : acento.palabra;
    if (!words.some((w) => normalizar(w.word) === normalizar(palabra))) agregar(c, "aviso", `acento "${palabra}" no aparece en words.json`);
  }
  if (!malas) agregar(c, "ok", `las ${lista.length} anclas resuelven dentro de la pieza (${totalS.toFixed(2)} s)`);
};

// 3. Archivos
const chequearArchivos = async () => {
  const c = nuevo("archivos", "3. Archivos y nombres de SFX");
  const media = new Set();
  const recorrer = (v) => {
    if (typeof v === "string" && /\.(png|jpe?g|webp|svg|gif|mp4|webm|mov|wav|mp3|m4a|aac|ogg)$/i.test(v)) media.add(v);
    else if (Array.isArray(v)) v.forEach(recorrer);
    else if (v && typeof v === "object") Object.values(v).forEach(recorrer);
  };
  recorrer(props);
  let faltan = 0;
  for (const f of media) {
    if (!existsSync(path.join(RAIZ, "public", f))) {
      faltan++;
      agregar(c, "error", `falta public/${f} (referenciado en props.json)`);
    }
  }
  const usados = new Map();
  const usar = (nombre, donde) => usados.set(nombre, [...(usados.get(nombre) ?? []), donde]);
  (props.sfx ?? []).forEach((s, i) => s.nombre && usar(s.nombre, `props.sfx[${i}]`));
  (props.overlays ?? []).forEach((o, i) => o.sfx && usar(o.sfx, `props.overlays[${i}].sfx`));
  for (const f of archivosSrc(path.join(RAIZ, "src", "pieza"))) {
    const texto = readFileSync(f, "utf8");
    for (const m of texto.matchAll(/<Sfx\b[^>]*?\bname=(\{[^}]*\}|"[^"]*")/gs)) {
      for (const lit of m[1].matchAll(/"([^"]+)"/g)) usar(lit[1], rel(f));
    }
  }
  for (const [nombre, donde] of usados) {
    if (!(nombre in SFX_FILES)) {
      faltan++;
      agregar(c, "error", `SFX "${nombre}" no existe en SFX_FILES (usado en ${[...new Set(donde)].join(", ")})`);
    }
  }
  // Marcas de logo (ícono con `marca`, datos de escena con `marca`/`logo`): LogoApp revienta con una que no existe.
  const fuenteMarcas = readFileSync(path.join(RAIZ, "src", "pieza", "marcas-paths.ts"), "utf8");
  const MARCAS = new Set([...fuenteMarcas.slice(fuenteMarcas.indexOf("MARCA_PATHS")).matchAll(/^\s*"?([\w-]+)"?\s*:\s*"/gm)].map((m) => m[1]));
  const buscarMarcas = (v, ruta) => {
    if (Array.isArray(v)) v.forEach((x, j) => buscarMarcas(x, `${ruta}[${j}]`));
    else if (v && typeof v === "object") {
      for (const [k, x] of Object.entries(v)) {
        if ((k === "marca" || k === "logo") && typeof x === "string") {
          if (!MARCAS.has(x)) {
            faltan++;
            agregar(c, "error", `${ruta}.${k}: la marca "${x}" no existe en src/pieza/marcas-paths.ts (${[...MARCAS].join(", ")})`);
          }
        } else buscarMarcas(x, `${ruta}.${k}`);
      }
    }
  };
  (props.overlays ?? []).forEach((o, i) => buscarMarcas(o, `overlays[${i}]`));

  // B-rolls y música: el clip tiene que alcanzar desde inicioS hasta el final del tramo; si no, Remotion congela el
  // último cuadro (el b-roll queda como foto fija) o la música se corta antes del final.
  const duracion = async (f) => {
    const r = await correr("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", path.join(RAIZ, "public", f)]);
    const d = parseFloat(r.out.trim());
    return Number.isFinite(d) ? d : null;
  };
  for (const [i, o] of (props.overlays ?? []).entries()) {
    if (o.tipo !== "broll" || !existsSync(path.join(RAIZ, "public", o.archivo))) continue;
    const r = rangoOverlay(o);
    const dur = await duracion(o.archivo);
    if (!r || dur === null) continue;
    const inicio = o.inicioS ?? 0;
    const necesita = inicio + r.duration / FPS;
    if (necesita > dur + 0.05) {
      faltan++;
      const congela = r.from / FPS + Math.max(0, dur - inicio);
      agregar(c, "error", `overlays[${i}] ${etiquetaOverlay(o)}: inicioS ${inicio} + ${(r.duration / FPS).toFixed(2)} s de tramo = ${necesita.toFixed(2)} s, pero el clip dura ${dur.toFixed(2)} s: queda congelado desde ${congela.toFixed(2)} s`, congela);
    }
  }
  if (props.musica && existsSync(path.join(RAIZ, "public", props.musica.archivo))) {
    const desde = resolverMs(props.musica.desde);
    const dur = await duracion(props.musica.archivo);
    if (desde !== null && dur !== null) {
      const inicio = props.musica.inicioS ?? 0;
      const necesita = inicio + totalS - desde / 1000;
      if (necesita > dur + 0.05) {
        faltan++;
        agregar(c, "error", `musica: ${props.musica.archivo} dura ${dur.toFixed(2)} s y la pieza le pide hasta ${necesita.toFixed(2)} s (inicioS ${inicio}): se corta en ${(desde / 1000 + dur - inicio).toFixed(2)} s`, desde / 1000 + dur - inicio);
      }
    }
  }

  for (const [nombre, ruta] of Object.entries(SFX_FILES)) {
    if (!existsSync(path.join(RAIZ, "public", ruta))) {
      const usado = usados.has(nombre);
      if (usado) faltan++;
      agregar(c, usado ? "error" : "aviso", `SFX_FILES["${nombre}"] apunta a public/${ruta}, que no existe${usado ? "" : " (no se usa en esta pieza)"}`);
    }
  }
  for (const f of ["video.mp4", "words.json"]) {
    if (!existsSync(path.join(PIEZA, f))) {
      faltan++;
      agregar(c, "error", `falta public/piezas/${slug}/${f}`);
    }
  }
  const conPip = (props.overlays ?? []).some((o) => o.tipo === "escena" && o.pip !== "ninguno");
  const video = path.join(PIEZA, "video.mp4");
  for (const [f, necesario] of [["cara.json", false], ["persona.webm", conPip]]) {
    const p = path.join(PIEZA, f);
    if (!existsSync(p)) {
      if (necesario) faltan++;
      agregar(c, necesario ? "error" : "aviso", `falta public/piezas/${slug}/${f}${necesario ? " (las escenas lo usan de recorte)" : ""}`);
    } else if (existsSync(video) && statSync(p).mtimeMs < statSync(video).mtimeMs) {
      agregar(c, "aviso", `${f} es más viejo que video.mp4: si cambió el video hay que volver a generarlo (§3a)`);
    }
  }
  if (!faltan) agregar(c, "ok", `${media.size} archivos de props y ${usados.size} nombres de SFX existen (SFX_FILES en disco); marcas de logo válidas; b-rolls y música alcanzan hasta el final de su tramo`);
};

// 4. Reglas de código de §7
const elementos = (texto, etiqueta) => {
  const out = [];
  for (let i = texto.indexOf(`<${etiqueta}`); i !== -1; i = texto.indexOf(`<${etiqueta}`, i + 1)) {
    if (!/[\s>/]/.test(texto[i + etiqueta.length + 1] ?? "")) continue;
    // Hasta el cierre de la etiqueta de apertura, salteando las llaves (volume={(f) => ...}).
    let prof = 0;
    let j = i;
    for (; j < texto.length; j++) {
      if (texto[j] === "{") prof++;
      else if (texto[j] === "}") prof--;
      else if (texto[j] === ">" && prof === 0 && texto[j - 1] !== "=") break;
    }
    out.push({ texto: texto.slice(i, j + 1), linea: texto.slice(0, i).split("\n").length });
  }
  return out;
};
const expresion = (texto, prop) => {
  const i = texto.indexOf(`${prop}={`);
  if (i === -1) return null;
  let prof = 0;
  for (let j = i + prop.length + 1; j < texto.length; j++) {
    if (texto[j] === "{") prof++;
    else if (texto[j] === "}" && --prof === 0) return texto.slice(i + prop.length + 2, j);
  }
  return null;
};
const chequearCodigo = () => {
  const c = nuevo("codigo", "4. Reglas de código y de sonido (§7, §8)");
  let problemas = 0;
  const archivos = archivosSrc(path.join(RAIZ, "src")).filter((f) => f.endsWith(".tsx"));
  let audiosLargos = 0;
  for (const f of archivos) {
    const texto = readFileSync(f, "utf8");
    for (const et of ["Audio", "Html5Audio", "OffthreadVideo", "Video"]) {
      for (const el of elementos(texto, et)) {
        const donde = `${rel(f)}:${el.linea}`;
        // startFrom es el alias deprecado de trimBefore en Remotion 4: mismo efecto, mismo crash.
        const trim = et.includes("Audio") && el.texto.match(/\b(trimBefore|startFrom)\b/);
        if (trim) {
          if (/SFX_FILES|sfx/i.test(expresion(el.texto, "src") ?? "") || path.basename(f) === "sfx.tsx") {
            problemas++;
            agregar(c, "error", `${donde}: <${et}> de SFX con ${trim[1]} (Studio: "createImageData: source width is zero"); arrancar la Sequence en negativo`);
          } else audiosLargos++;
        }
        const vol = expresion(el.texto, "volume");
        const flecha = vol && vol.trim().match(/^\(?\s*(\w+)\s*\)?\s*=>/);
        if (!flecha) continue;
        const f0 = flecha[1];
        for (const idx of vol.matchAll(/\[([^[\]]*)\]/g)) {
          if (new RegExp(`\\b${f0}\\b`).test(idx[1]) && !/Math\.max\(\s*0|clamp/.test(idx[1])) {
            problemas++;
            agregar(c, "error", `${donde}: el volume usa ${f0} como índice sin acotar ([${idx[1].trim()}]): Studio pide cuadros negativos y sale NaN`);
          }
        }
        for (const m of vol.matchAll(/interpolate\(/g)) {
          let prof = 0;
          let fin = m.index;
          for (; fin < vol.length; fin++) {
            if (vol[fin] === "(") prof++;
            else if (vol[fin] === ")" && --prof === 0) break;
          }
          const llamada = vol.slice(m.index, fin + 1);
          const primero = llamada.slice("interpolate(".length).split(",")[0];
          if (new RegExp(`\\b${f0}\\b`).test(primero) && !/extrapolateLeft:\s*"clamp"/.test(llamada)) {
            problemas++;
            agregar(c, "aviso", `${donde}: interpolate del volume sin extrapolateLeft "clamp": con cuadros negativos da volumen negativo`);
          }
        }
      }
    }
  }
  if (audiosLargos) agregar(c, "info", `${audiosLargos} <Audio> largos (música) usan trimBefore: correcto según §7`);

  const sfxTsx = path.join(RAIZ, "src", "reserva", "components", "sfx.tsx");
  const seq = elementos(readFileSync(sfxTsx, "utf8"), "Sequence")[0];
  const aud = elementos(readFileSync(sfxTsx, "utf8"), "Audio")[0];
  if (!seq || !/showInTimeline=\{false\}/.test(seq.texto) || !aud || !/showInTimeline=\{false\}/.test(aud.texto)) {
    problemas++;
    agregar(c, "error", `${rel(sfxTsx)}: la Sequence y el <Audio> de Sfx tienen que llevar showInTimeline={false}`);
  }

  (props.sfx ?? []).forEach((s, i) => {
    const f = cuadro(s);
    if (f === null) return;
    const nombre = s.nombre ?? path.basename(s.archivo);
    if ("archivo" in s && f < 0) {
      problemas++;
      agregar(c, "error", `props.sfx[${i}] (${nombre}): audio propio que arranca en un cuadro negativo (${f})`, f / FPS);
    }
    if (esRiser(s)) {
      if (f / FPS > finHook + 0.05) {
        problemas++;
        agregar(c, "error", `props.sfx[${i}] ${nombre} en ${(f / FPS).toFixed(2)} s: sonido tipo riser fuera del hook (termina en ${finHook.toFixed(2)} s). "El riser es del hook y de nada más" (§8)`, f / FPS);
      } else if (s.nombre === "riser" && !s.corte) {
        agregar(c, "aviso", `props.sfx[${i}] riser del hook sin "corte": tiene que cortarse en seco al terminar la última palabra (§8)`, f / FPS);
      }
    } else if ("archivo" in s && !recursoDe(s.archivo) && f / FPS > finHook + 0.05) {
      agregar(c, "aviso", `props.sfx[${i}] ${nombre} en ${(f / FPS).toFixed(2)} s: audio propio que no está en assets/biblioteca.json, no se sabe si es un riser (fuera del hook no van)`, f / FPS);
    }
  });
  // Eco del hook (§8): con negro tiene que haber una cola (sfx con archivo que arranca en la última palabra). Sin ella el
  // negro queda solo con el boom y se apaga antes de que vuelva la imagen.
  if (negro) {
    const cola = (props.sfx ?? []).find((s) => {
      const f = cuadro(s);
      return "archivo" in s && f !== null && f / FPS <= negro.inicio && f / FPS >= negro.inicio - 1.5;
    });
    if (!cola) {
      problemas++;
      agregar(c, "error", `props.pausas pide un negro (${negro.inicio.toFixed(2)}–${negro.fin.toFixed(2)} s) pero no hay cola/eco: falta un props.sfx con "archivo" (p. ej. piezas/${slug}/cola-no.wav, scripts/cola-reverb.py) anclado en la última palabra del hook (§8)`, negro.inicio);
    }
  }
  for (const f of archivos.filter((x) => x.includes(`${path.sep}pieza${path.sep}`))) {
    const texto = readFileSync(f, "utf8");
    for (const el of elementos(texto, "Sfx")) {
      const nombres = [...(el.texto.match(/\bname=(\{[^}]*\}|"[^"]*")/)?.[1] ?? "").matchAll(/"([^"]+)"/g)].map((m) => m[1]);
      const risers = nombres.filter((n) => RISER.has(n));
      if (risers.length) {
        problemas++;
        agregar(c, "error", `${rel(f)}:${el.linea}: <Sfx> tipo riser (${risers.join(", ")}) en código de la pieza: el riser es solo del hook (§8)`);
      }
    }
  }
  if (!problemas) agregar(c, "ok", `SFX sin trimBefore/startFrom y fuera de la línea de tiempo, volúmenes que aguantan cuadros negativos, risers solo en el hook${negro ? ", el negro tiene su cola" : ""}`);
};

// 5. Studio
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const responde = async (url) => {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(3000) });
    return r.ok ? await r.text() : null;
  } catch {
    return null;
  }
};
const matarArbol = (pid) => correr("taskkill", ["/pid", String(pid), "/T", "/F"]);
const chequearStudio = async () => {
  const c = nuevo("studio", "5. Studio (Chrome headless)");
  if (flags.has("--sin-studio")) return agregar(c, "omitido", "omitido (--sin-studio)");
  const CHROME = path.join(RAIZ, "node_modules", ".remotion", "chrome-headless-shell", "win64", "chrome-headless-shell-win64", "chrome-headless-shell.exe");
  let puppeteer;
  try {
    puppeteer = (await import("puppeteer-core")).default;
  } catch {
    return agregar(c, "error", "falta puppeteer-core (npm i -D puppeteer-core)");
  }
  if (!existsSync(CHROME)) return agregar(c, "error", `no está el Chrome de Remotion en ${rel(CHROME)}`);

  let base = "http://localhost:3000";
  let propio = null;
  const proyecto = leerJson(path.join(RAIZ, "package.json")).name;
  const html = await responde(base);
  if (!html || !html.includes(`remotion_projectName = ${JSON.stringify(proyecto)}`)) {
    base = "http://localhost:3123";
    console.log("    levantando Studio temporal en :3123");
    propio = spawn("npx remotion studio src/index.ts --port 3123 --no-open", { shell: true, cwd: RAIZ, stdio: "ignore" });
    const t0 = Date.now();
    while (!(await responde(base)) && Date.now() - t0 < 180_000) await esperar(2000);
    if (!(await responde(base))) {
      await matarArbol(propio.pid);
      return agregar(c, "error", "el Studio temporal no respondió en 3 minutos");
    }
  }
  agregar(c, "info", propio ? "Studio temporal en :3123 (se cierra al terminar)" : "Studio abierto en :3000");
  const navegador = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox", "--mute-audio"] });
  try {
    for (const [ancho, alto] of [
      [1677, 930],
      [900, 1800],
    ]) {
      const pagina = await navegador.newPage();
      await pagina.setViewport({ width: ancho, height: alto });
      const errores = [];
      pagina.on("console", (m) => m.type() === "error" && errores.push(m.text().slice(0, 300)));
      pagina.on("pageerror", (e) => errores.push(`pageerror: ${String(e.message ?? e).slice(0, 300)}`));
      await pagina.goto(`${base}/${slug}`, { waitUntil: "domcontentloaded", timeout: 60_000 });
      const t0 = Date.now();
      let cargo = false;
      while (Date.now() - t0 < 60_000) {
        const texto = await pagina.evaluate(() => document.body.innerText).catch(() => "");
        if (texto.includes(slug) && /\d\d:\d\d\.\d\d/.test(texto) && /video\.mp4/.test(texto)) {
          cargo = true;
          break;
        }
        await esperar(1000);
      }
      // Tiempo para que dibuje las ondas de audio de la línea de tiempo (donde se caía).
      await esperar(6000);
      const texto = await pagina.evaluate(() => document.body.innerText).catch(() => "");
      const captura = path.join(SALIDA, `studio-${ancho}x${alto}.png`);
      await pagina.screenshot({ path: captura });
      const patron = /(IndexSizeError|TypeError|ReferenceError|RangeError|returned NaN|createImageData|source width is zero|Unhandled Runtime Error|Error:)/;
      const hallado = texto.match(patron);
      const tag = `${ancho}x${alto}`;
      if (!cargo) agregar(c, "error", `${tag}: la composición no terminó de cargar en 60 s (${rel(captura)})`);
      if (hallado) {
        const linea = texto.split("\n").find((l) => patron.test(l)) ?? hallado[0];
        agregar(c, "error", `${tag}: la página muestra un error: "${linea.trim().slice(0, 200)}" (${rel(captura)})`);
      }
      for (const e of [...new Set(errores)].slice(0, 8)) agregar(c, "error", `${tag}: error en consola: ${e}`);
      if (cargo && !hallado && !errores.length) agregar(c, "ok", `${tag}: carga sin errores (${rel(captura)})`);
      await pagina.close();
    }
  } finally {
    await navegador.close();
    if (propio) await matarArbol(propio.pid);
  }
};

// 6. Audio
const gananciaDucking = (bajoVoz) => {
  // Igual que src/pieza/musica.tsx.
  const habla = new Uint8Array(totalFrames);
  for (const w of words) {
    const a = Math.max(0, Math.floor((w.start - 0.08) * FPS));
    const b = Math.min(totalFrames - 1, Math.ceil((w.end + 0.15) * FPS));
    for (let f = a; f <= b; f++) habla[f] = 1;
  }
  const g = new Float64Array(totalFrames);
  let actual = 1;
  for (let f = 0; f < totalFrames; f++) {
    const objetivo = habla[f] ? bajoVoz : 1;
    const paso = (1 - bajoVoz) / (objetivo < actual ? 3 : 10);
    actual = objetivo < actual ? Math.max(objetivo, actual - paso) : Math.min(objetivo, actual + paso);
    g[f] = actual;
  }
  return g;
};
const mtimeMax = (dir) => {
  if (!existsSync(dir)) return 0;
  return readdirSync(dir, { withFileTypes: true }).reduce((m, d) => {
    const p = path.join(dir, d.name);
    return Math.max(m, d.isDirectory() ? mtimeMax(p) : statSync(p).mtimeMs);
  }, 0);
};
const eventosSonoros = () => {
  const ev = [];
  (props.sfx ?? []).forEach((s) => {
    const f = cuadro(s);
    if (f === null) return;
    const nombre = s.nombre ?? path.basename(s.archivo);
    const esCola = "archivo" in s && negro && f / FPS <= negro.inicio && f / FPS >= negro.inicio - 1.5;
    ev.push({ nombre, t: f / FPS, tipo: esRiser(s) ? "sube" : esCola ? "cola" : "golpe" });
  });
  for (const o of props.overlays ?? []) {
    const r = rangoOverlay(o);
    if (!r) continue;
    if (o.tipo === "broll") ev.push({ nombre: `${o.sfx ?? "corte-broll"} (${etiquetaOverlay(o)})`, t: (r.from + 4) / FPS, tipo: "golpe" });
    if (o.tipo === "escena") {
      ev.push({ nombre: `escena-entra (${o.escena})`, t: (r.from + 4) / FPS, tipo: "golpe" });
      if (r.from + r.duration < totalFrames - 1) ev.push({ nombre: `escena-sale (${o.escena})`, t: (r.from + r.duration - 4) / FPS, tipo: "golpe" });
    }
    if (o.tipo === "icono") ev.push({ nombre: `${o.sfx ?? "pop-b"} (ícono ${path.basename(o.imagen ?? o.marca ?? "")})`, t: (r.from + 2) / FPS, tipo: "golpe" });
    if (o.tipo === "strike") {
      for (const p of o.palabras) {
        const at = cuadro(p.en);
        if (at === null) continue;
        const etiqueta = path.basename(p.imagen ?? p.text ?? "");
        ev.push({ nombre: `pop (tachado ${etiqueta})`, t: at / FPS, tipo: "golpe" });
        if (p.imagen) ev.push({ nombre: `tachado (${etiqueta})`, t: (at + (p.strikeDelay ?? 14)) / FPS, tipo: "golpe" });
      }
    }
  }
  return ev.sort((a, b) => a.t - b.t);
};
const chequearAudio = async () => {
  const c = nuevo("audio", "6. Mezcla renderizada (banda de celular 200 Hz–4 kHz)");
  if (flags.has("--sin-audio")) return agregar(c, "omitido", "omitido (--sin-audio)");
  const mezcla = path.join(SALIDA, "mezcla.wav");
  const fuentes = Math.max(
    mtimeMax(path.join(RAIZ, "src")),
    mtimeMax(PIEZA),
    mtimeMax(path.join(RAIZ, "public", "reserva", "sfx")),
    mtimeMax(path.join(RAIZ, "public", "recursos")),
  );
  if (existsSync(mezcla) && statSync(mezcla).mtimeMs > fuentes) {
    agregar(c, "info", `mezcla reutilizada: ${rel(mezcla)} es más nueva que src/, la pieza y los audios`);
  } else {
    console.log("    render de audio (por turno.mjs; ~10 min)…");
    const t0 = Date.now();
    const r = await correr(
      "node",
      [
        "scripts/turno.mjs", "npx", "remotion", "render", "src/index.ts", slug, rel(mezcla), "--codec=wav", "--concurrency=1",
        "--timeout=120000", "--offthreadvideo-cache-size-in-bytes=300000000", "--log=error",
      ],
      { log: path.join(SALIDA, "render-audio.log"), mostrar: true },
    );
    if (r.code !== 0 || !existsSync(mezcla)) {
      return agregar(c, "error", `falló el render de audio (ver ${rel(path.join(SALIDA, "render-audio.log"))}): ${r.out.trim().split("\n").slice(-2).join(" | ")}`);
    }
    agregar(c, "info", `mezcla renderizada en ${((Date.now() - t0) / 60000).toFixed(1)} min: ${rel(mezcla)}`);
  }
  const m = props.musica;
  let musica = null;
  if (m) {
    const desdeMs = resolverMs(m.desde);
    if (desdeMs !== null) {
      const desde = msToFrame(desdeMs);
      const dur = totalFrames - desde;
      const fadeIn = msToFrame(m.fadeInMs ?? 150);
      const fadeOut = msToFrame(m.fadeOutMs ?? 1200);
      const duck = gananciaDucking(m.bajoVoz ?? 0.4);
      const ganancia = Array.from({ length: totalFrames }, (_, F) => {
        if (F < desde) return 0;
        const f = F - desde;
        const fade = f < Math.max(1, fadeIn) ? f / Math.max(1, fadeIn) : f > dur - fadeOut ? Math.max(0, (dur - f) / fadeOut) : 1;
        return +(duck[F] * fade).toFixed(4);
      });
      musica = {
        archivo: path.join(RAIZ, "public", m.archivo),
        inicioS: m.inicioS ?? 0,
        volumen: m.volumen ?? 0.35,
        desde: desde / FPS,
        fin: totalS,
        fadeIn: fadeIn / FPS,
        fadeOut: fadeOut / FPS,
        ganancia,
      };
    }
  }
  const colaCue = (props.sfx ?? []).find((s) => "archivo" in s && negro && (() => {
    const f = cuadro(s);
    return f !== null && f / FPS <= negro.inicio && f / FPS >= negro.inicio - 1.5;
  })());
  const r = await python(
    "audio",
    {
      mezcla,
      video: path.join(PIEZA, "video.mp4"),
      words: words.map((w) => [w.start, w.end]),
      musica,
      negro,
      cola: colaCue ? { archivo: path.join(RAIZ, "public", colaCue.archivo), nombre: path.basename(colaCue.archivo), t: cuadro(colaCue) / FPS, volumen: colaCue.volumen ?? 1 } : null,
      eventos: eventosSonoros(),
    },
    "audio",
  );
  if (r.error) return agregar(c, "error", `falló el análisis de audio: ${r.error}`);
  c.items.push(...r.items);
  c.datos = r.datos;
};

// 7. Fotogramas clave
const cuadrosClave = () => {
  const lista = [];
  const add = (frame, etiqueta, esperado) => lista.push({ frame: Math.max(0, Math.min(totalFrames - 1, Math.round(frame))), etiqueta, esperado });
  if (negro) {
    const a = Math.round(negro.inicio * FPS);
    const b = Math.round(negro.fin * FPS);
    add(a - 1, "fin del hook (última palabra)", "imagen");
    add((a + b) / 2, "mitad del negro", "negro");
    add(b + 1, "primer cuadro después del negro", "imagen");
  } else {
    const riser = (props.sfx ?? []).find((s) => s.nombre === "riser");
    const f = riser && cuadro(riser.corte ?? riser);
    if (f !== null && f !== undefined) add(f - 1, "fin del hook (corte del riser)");
  }
  for (const o of props.overlays ?? []) {
    const r = rangoOverlay(o);
    if (!r) continue;
    if (o.tipo === "escena") add(r.from + r.duration / 2, `mitad de escena ${o.escena}`, "imagen");
    if (o.tipo === "broll") add(r.from + r.duration / 2, `mitad de ${etiquetaOverlay(o)}`, "imagen");
    if (o.tipo === "icono") add(r.from + 12, `ícono ${path.basename(o.imagen ?? o.marca ?? "")}`, "imagen");
    if (o.tipo === "strike") {
      for (const p of o.palabras) {
        const at = cuadro(p.en);
        if (at !== null) add(at + (p.strikeDelay ?? 14) + 10, `tachado ${path.basename(p.imagen ?? p.text ?? "")}`, "imagen");
      }
    }
  }
  add(totalFrames - 1, "último cuadro");
  const vistos = new Set();
  return lista.filter((x) => !vistos.has(x.frame) && vistos.add(x.frame)).sort((a, b) => a.frame - b.frame);
};
const chequearStills = async () => {
  const c = nuevo("stills", "7. Fotogramas clave");
  if (flags.has("--sin-stills")) return agregar(c, "omitido", "omitido (--sin-stills)");
  const dir = path.join(SALIDA, "stills");
  mkdirSync(dir, { recursive: true });
  const cuadros = cuadrosClave().map((x, i) => ({ ...x, t: x.frame / FPS, archivo: path.join(dir, `${String(i).padStart(2, "0")}-f${x.frame}.jpg`) }));
  const entrada = path.join(SALIDA, "stills-entrada.json");
  const resultado = path.join(SALIDA, "stills-resultado.json");
  writeFileSync(entrada, JSON.stringify({ slug, cuadros, resultado }));
  console.log(`    ${cuadros.length} fotogramas (bundle + render por turno.mjs)…`);
  const r = await correr("node", ["scripts/turno.mjs", "node", "scripts/verificar-stills.mjs", rel(entrada)], {
    log: path.join(SALIDA, "stills.log"),
    mostrar: true,
  });
  if (!existsSync(resultado)) return agregar(c, "error", `falló el render de fotogramas (ver ${rel(path.join(SALIDA, "stills.log"))}): ${r.out.trim().split("\n").slice(-2).join(" | ")}`);
  for (const e of leerJson(resultado).errores) agregar(c, "error", `cuadro ${e.frame}: ${e.error}`, e.frame / FPS);
  const hoja = path.join(SALIDA, "hoja.jpg");
  const h = await python("hoja", { stills: cuadros, salida: hoja }, "hoja");
  if (h.error) return agregar(c, "error", `falló la hoja de contactos: ${h.error}`);
  c.items.push(...h.items);
  c.datos = { ...h.datos, hoja: rel(hoja) };
  if (existsSync(hoja)) agregar(c, "info", `hoja de contactos: ${rel(hoja)}`);
};

// 8. Cámara
const chequearCamara = async () => {
  const c = nuevo("camara", "8. Cámara que sigue la cara");
  if (!flags.has("--camara")) return agregar(c, "omitido", "omitido (solo con --camara)");
  const tapado = new Uint8Array(totalFrames);
  const tapar = (a, b) => {
    for (let f = Math.max(0, a); f < Math.min(totalFrames, b); f++) tapado[f] = 1;
  };
  if (negro) tapar(0, Math.round(negro.fin * FPS) + 15);
  for (const o of props.overlays ?? []) {
    const r = rangoOverlay(o);
    if (r) tapar(r.from - 5, r.from + r.duration + 5);
  }
  let mejor = null;
  for (let f = 0; f < totalFrames; ) {
    if (tapado[f]) {
      f++;
      continue;
    }
    let g = f;
    while (g < totalFrames && !tapado[g]) g++;
    if (!mejor || g - f > mejor[1] - mejor[0]) mejor = [f, g];
    f = g;
  }
  if (!mejor || mejor[1] - mejor[0] < 90) return agregar(c, "aviso", "no hay 3 s seguidos de cámara sola (sin escenas, b-rolls ni íconos)");
  const [a, b] = [mejor[0], Math.min(mejor[1], mejor[0] + 300) - 1];
  const video = path.join(SALIDA, "camara.mp4");
  console.log(`    render de cámara ${(a / FPS).toFixed(1)}–${(b / FPS).toFixed(1)} s (por turno.mjs)…`);
  const r = await correr(
    "node",
    [
      "scripts/turno.mjs", "npx", "remotion", "render", "src/index.ts", slug, rel(video), `--frames=${a}-${b}`, "--muted", "--concurrency=1",
      "--timeout=120000", "--offthreadvideo-cache-size-in-bytes=300000000", "--log=error",
    ],
    { log: path.join(SALIDA, "render-camara.log"), mostrar: true },
  );
  if (r.code !== 0) return agregar(c, "error", `falló el render del tramo de cámara (ver ${rel(path.join(SALIDA, "render-camara.log"))})`);
  const analisis = path.join(SALIDA, "camara-analisis.json");
  const r2 = await correr("node", ["scripts/turno.mjs", "python", "scripts/analizar-camara.py", rel(video), rel(analisis)], {
    log: path.join(SALIDA, "analizar-camara.log"),
    mostrar: true,
  });
  if (r2.code !== 0) return agregar(c, "error", `falló analizar-camara.py (ver ${rel(path.join(SALIDA, "analizar-camara.log"))})`);
  const ref = path.join(RAIZ, "out", "verif", "ref-camara", "analisis.json");
  const res = await python("camara", { analisis, referencia: existsSync(ref) ? ref : null, objetivo: { x: 0.5, y: 0.3 } }, "camara");
  if (res.error) return agregar(c, "error", `falló la medición de cámara: ${res.error}`);
  agregar(c, "info", `tramo ${(a / FPS).toFixed(1)}–${((b + 1) / FPS).toFixed(1)} s (${rel(video)})`);
  c.items.push(...res.items);
  c.datos = res.datos;
};

// =====================================================================================================
const t0 = Date.now();
console.log(`verificar ${slug} (${totalS.toFixed(2)} s, ${words.length} palabras)`);
for (const [nombre, fn] of [
  ["tipos", chequearTipos],
  ["anclas", chequearAnclas],
  ["archivos", chequearArchivos],
  ["código", chequearCodigo],
  ["Studio", chequearStudio],
  ["audio", chequearAudio],
  ["fotogramas", chequearStills],
  ["cámara", chequearCamara],
]) {
  console.log(`  · ${nombre}`);
  try {
    await fn();
  } catch (e) {
    const c = checks.at(-1) ?? nuevo(nombre, nombre);
    agregar(c, "error", `la verificación se cayó: ${String(e?.stack ?? e).split("\n").slice(0, 3).join(" | ")}`);
  }
}

const resumen = checks.map((c) => ({ ...c, estado: estadoDe(c) }));
const errores = resumen.filter((c) => c.estado === "error").length;
const avisos = resumen.filter((c) => c.estado === "aviso").length;
const fecha = new Date().toLocaleString("es-AR", { hour12: false });
const conT = (i) => (i.t !== undefined && !/\d s\b/.test(i.texto) ? ` (${i.t} s)` : "");
writeFileSync(
  path.join(SALIDA, "informe.json"),
  JSON.stringify({ slug, fecha, duracionS: totalS, resultado: errores ? "error" : avisos ? "aviso" : "ok", checks: resumen }, null, 1),
);
const md = [
  `# Verificación de ${slug}`,
  "",
  `${fecha} · ${totalS.toFixed(2)} s · resultado: **${errores ? `${ICONO.error} ${errores} con errores` : avisos ? `${ICONO.aviso} ${avisos} con avisos` : `${ICONO.ok} todo bien`}**`,
  "",
  ...resumen.flatMap((c) => [
    `## ${ICONO[c.estado]} ${c.titulo}`,
    "",
    ...c.items.map((i) => `- ${ICONO[i.estado]} ${i.texto}${conT(i)}`),
    "",
  ]),
  existsSync(path.join(SALIDA, "hoja.jpg")) ? "![hoja de contactos](hoja.jpg)\n" : "",
].join("\n");
writeFileSync(path.join(SALIDA, "informe.md"), md);

console.log(`\n${slug}: ${((Date.now() - t0) / 60000).toFixed(1)} min`);
for (const c of resumen) {
  console.log(`${ICONO[c.estado]} ${c.titulo}`);
  const importantes = c.items.filter((i) => i.estado === "error" || i.estado === "aviso");
  for (const i of importantes.slice(0, 6)) console.log(`     ${ICONO[i.estado]} ${i.texto}${conT(i)}`);
  if (importantes.length > 6) console.log(`     … y ${importantes.length - 6} más`);
}
console.log(`\nInforme: ${rel(path.join(SALIDA, "informe.md"))}`);
process.exit(errores ? 1 : 0);
