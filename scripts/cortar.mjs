#!/usr/bin/env node
// Puente entre el pipeline y el editor de Lucas (Cut AI, D:\Dev\intelligent-cut-studio): le sirve el video, la onda, la
// transcripción, la mirada y los tramos de la pieza, y guarda lo que él recorta en los archivos de cortes.
// Lucas (2026-09-27): "va a ser mejor esa herramienta... tiene mejor UX/UI... lo embebés con este editor... para recortar
// bien el crudo, que es lo que fallás".
// Uso: node scripts/cortar.mjs <slug> [--paso tomas|trabas] [--puerto 3102] [--editor <carpeta>] [--sin-abrir]
//   tomas  (default): el clip crudo (proxy) con las tomas de cortes/<slug>.json como tramos -> guarda cortes/<slug>.json
//   trabas: public/piezas/<slug>/video-jc.mp4 sin los recortes ya hechos       -> guarda cortes/<slug>-recortes.json
// Levanta el editor (npm run dev, :8080) si no está corriendo; el editor llega al puente por su proxy /pieza-api.
import { spawn, spawnSync } from "node:child_process";
import { createReadStream, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rutaProxy } from "./proxy.mjs";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const argv = process.argv.slice(2);
const opcion = (nombre, def) => {
  const i = argv.indexOf(nombre);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : def;
};
const slug = argv[0];
const paso = opcion("--paso", "tomas");
const PORT = parseInt(opcion("--puerto", "3102"), 10);
const EDITOR = path.resolve(opcion("--editor", path.join(ROOT, "..", "..", "intelligent-cut-studio")));
const EDITOR_URL = "http://localhost:8080";
if (!slug || !/^[a-z0-9-]+$/.test(slug) || !["tomas", "trabas"].includes(paso)) {
  console.error("Uso: node scripts/cortar.mjs <slug> [--paso tomas|trabas] [--puerto 3102] [--editor <carpeta>] [--sin-abrir]");
  process.exit(1);
}
const salir = (msg) => {
  console.error(msg);
  process.exit(1);
};

const r2 = (n) => Math.round(n * 100) / 100;
const r3 = (n) => Math.round(n * 1000) / 1000;
const leerJson = (f) => JSON.parse(readFileSync(f, "utf8"));
const duracionDe = (f) =>
  parseFloat(spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", f], { encoding: "utf8" }).stdout);
const pcmDe = (f, sr) => {
  const r = spawnSync("ffmpeg", ["-v", "error", "-i", f, "-vn", "-ac", "1", "-ar", String(sr), "-af", "aresample=async=1", "-f", "s16le", "-"], {
    maxBuffer: 1024 * 1024 * 1024,
  });
  if (r.status !== 0) throw new Error(`ffmpeg no pudo leer el audio de ${f}`);
  return new Int16Array(r.stdout.buffer, r.stdout.byteOffset, Math.floor(r.stdout.length / 2));
};
const turno = (...cmd) => {
  const r = spawnSync("node", [path.join(ROOT, "scripts", "turno.mjs"), ...cmd], { cwd: ROOT, stdio: "inherit" });
  if (r.status !== 0) throw new Error(`falló: ${cmd.join(" ")}`);
};
const palabrasDe = (data) => data.segments.flatMap((s) => s.words ?? []).map((w) => ({ start: r3(w.start), end: r3(w.end), word: w.word.trim() }));
const textoEntre = (palabras, a, b) =>
  palabras
    .filter((w) => (w.start + w.end) / 2 >= a && (w.start + w.end) / 2 <= b)
    .map((w) => w.word)
    .join(" ");

// Misma regla que la herramienta de tomas (scripts/tomas.html): giro de la cabeza (YuNet) + iris (MediaPipe).
const MIRADA = { irisCentro: 0.505, pesoGiro: 0.25, umbral: 0.045, girado: 0.5, giroCentro: -0.03, giroSinIris: 0.1 };
const estadoMirada = (m) => {
  if (m[1] === null) return -1;
  if (Math.abs(m[1]) > MIRADA.girado) return 0;
  if (m[4] != null) return Math.abs(m[4] - MIRADA.irisCentro - MIRADA.pesoGiro * m[1]) < MIRADA.umbral ? 1 : 0;
  return Math.abs(m[1] - MIRADA.giroCentro) < MIRADA.giroSinIris ? 1 : 0;
};

// Cada paso define: el video que se ve, las palabras (tiempo de ese video), la mirada, los tramos que quedan y cómo se guardan.
let VIDEO, ARCHIVO_GUARDADO, palabras, mirada, tramosIniciales, guardar, titulo, archivoCrudo;

if (paso === "tomas") {
  ARCHIVO_GUARDADO = path.join(ROOT, "cortes", `${slug}.json`);
  if (!existsSync(ARCHIVO_GUARDADO)) salir(`No existe cortes/${slug}.json: primero la propuesta de tomas (npm run tomas -- ${slug} --clips <clips>)`);
  const inicial = leerJson(ARCHIVO_GUARDADO);
  const archivos = [...new Set(inicial.cortes.map((c) => c.archivo))];
  if (archivos.length !== 1) salir(`Cut AI trabaja con un clip por vez y ${slug} usa ${archivos.length} (${archivos.join(", ")}): usá npm run tomas -- ${slug}`);
  archivoCrudo = archivos[0];
  const crudo = path.join(inicial.base, archivoCrudo);
  if (!existsSync(crudo)) salir(`No encuentro el crudo ${crudo}`);
  const nombre = path.parse(archivoCrudo).name;
  const TRANS = path.join(ROOT, "out", "transcripciones");
  const frases = path.join(TRANS, `${nombre}-explorar.json`);
  const miradaJson = path.join(TRANS, `${nombre}-mirada.json`);
  mkdirSync(TRANS, { recursive: true });
  VIDEO = rutaProxy(crudo);
  if (!existsSync(VIDEO)) turno("node", "scripts/proxy.mjs", crudo);
  if (!existsSync(frases)) turno("python", "scripts/explorar-tomas.py", crudo, frases);
  if (!existsSync(miradaJson)) turno("python", "scripts/mirada.py", crudo, miradaJson);
  palabras = palabrasDe(leerJson(frases));
  mirada = leerJson(miradaJson).muestras.map((m) => [m[0], estadoMirada(m)]);
  tramosIniciales = () => [...leerJson(ARCHIVO_GUARDADO).cortes].sort((a, b) => a.desde - b.desde).map((c) => ({ origStart: c.desde, origEnd: c.hasta }));
  titulo = `${slug} · tomas de ${archivoCrudo}`;
  guardar = (tramos) => {
    const previo = leerJson(ARCHIVO_GUARDADO);
    const cortes = tramos.map((t) => {
      const desde = r2(t.origStart);
      const hasta = r2(t.origEnd);
      const igual = previo.cortes.find((c) => c.archivo === archivoCrudo && Math.abs(c.desde - desde) < 0.02 && Math.abs(c.hasta - hasta) < 0.02);
      return { archivo: archivoCrudo, desde, hasta, nota: igual ? igual.nota : `"${textoEntre(palabras, desde, hasta)}" (ajustada por Lucas en Cut AI)` };
    });
    return { ...previo, cortes, editadoPor: "Lucas (Cut AI)" };
  };
} else {
  const DIR = path.join(ROOT, "public", "piezas", slug);
  VIDEO = path.join(DIR, "video-jc.mp4");
  ARCHIVO_GUARDADO = path.join(ROOT, "cortes", `${slug}-recortes.json`);
  if (!existsSync(VIDEO)) salir(`No existe ${path.relative(ROOT, VIDEO)}: primero montar.mjs + jumpcut.mjs`);
  const wordsJc = path.join(DIR, "words.jc.json");
  if (!existsSync(wordsJc)) salir(`No existe ${path.relative(ROOT, wordsJc)}: primero transcribir.py + corregir.mjs`);
  palabras = palabrasDe(leerJson(wordsJc));
  mirada = null;
  const dur = duracionDe(VIDEO);
  const SR = 16000;
  const pcm = pcmDe(VIDEO, SR);
  const rms = (a, b) => {
    const s = Math.max(0, Math.floor(a * SR));
    const e = Math.min(pcm.length, Math.floor(b * SR));
    if (e - s < 1) return -100;
    let sum = 0;
    for (let i = s; i < e; i++) sum += (pcm[i] / 32768) ** 2;
    return Math.max(-100, 20 * Math.log10(Math.sqrt(sum / (e - s)) + 1e-9));
  };
  // Mismo contexto que guarda el recortador (scripts/recortador.html): de ahí se aprende el criterio de Lucas.
  const contexto = (desde, hasta) => {
    const antes = [...palabras].reverse().find((w) => w.end <= desde + 0.02);
    const despues = palabras.find((w) => w.start >= hasta - 0.02);
    const db = rms(desde, hasta);
    return {
      texto: textoEntre(palabras, desde, hasta),
      antes: antes ? antes.word : "",
      despues: despues ? despues.word : "",
      duracion: r3(hasta - desde),
      rmsDb: r3(db),
      bordeAntesDb: r3(rms(Math.max(0, desde - 0.15), desde)),
      bordeDespuesDb: r3(rms(hasta, Math.min(dur, hasta + 0.15))),
      esSilencio: db < -40,
    };
  };
  const leerRecortes = () => (existsSync(ARCHIVO_GUARDADO) ? leerJson(ARCHIVO_GUARDADO) : { fuente: "video-jc.mp4", recortes: [] });
  // Los tramos que quedan son el complemento de los recortes (y al revés al guardar).
  const complemento = (tramos, a, b) => {
    const out = [];
    let cursor = a;
    for (const [x, y] of tramos) {
      if (x - cursor > 0.005) out.push([cursor, x]);
      cursor = Math.max(cursor, y);
    }
    if (b - cursor > 0.005) out.push([cursor, b]);
    return out;
  };
  tramosIniciales = () =>
    complemento(
      [...leerRecortes().recortes].sort((x, y) => x.desde - y.desde).map((r) => [r.desde, r.hasta]),
      0,
      dur,
    ).map(([origStart, origEnd]) => ({ origStart: r3(origStart), origEnd: r3(origEnd) }));
  titulo = `${slug} · trabas (video-jc)`;
  guardar = (tramos) => {
    const previo = leerRecortes();
    const recortes = complemento(
      tramos.map((t) => [t.origStart, t.origEnd]),
      0,
      dur,
    ).map(([a, b]) => {
      const desde = r3(a);
      const hasta = r3(b);
      const igual = previo.recortes.find((r) => Math.abs(r.desde - desde) < 0.02 && Math.abs(r.hasta - hasta) < 0.02);
      if (igual) return igual;
      const ctx = contexto(desde, hasta);
      return { desde, hasta, motivo: ctx.esSilencio ? "silencio" : "otro", nota: "", contexto: ctx };
    });
    return { ...previo, fuente: "video-jc.mp4", recortes, editadoPor: "Lucas (Cut AI)" };
  };
}

const DURACION = duracionDe(VIDEO);
const version = () => (existsSync(ARCHIVO_GUARDADO) ? String(statSync(ARCHIVO_GUARDADO).mtimeMs) : "0");
const sugerencias = () => {
  const f = path.join(ROOT, "public", "piezas", slug, "trabas.json");
  if (paso !== "trabas" || !existsSync(f)) return [];
  return leerJson(f).trabas.map((t) => ({ desde: t.desde, hasta: t.hasta, detalle: `${t.tipo}: ${t.detalle}` }));
};

// Onda: pico absoluto cada 10 ms (0-255), para no bajar ni decodificar el video entero en el navegador.
const PICOS_POR_S = 100;
let cachePicos = null;
const picos = () => {
  if (!cachePicos) {
    const sr = 8000;
    const pcm = pcmDe(VIDEO, sr);
    const paso = sr / PICOS_POR_S;
    cachePicos = Buffer.alloc(Math.ceil(pcm.length / paso));
    for (let k = 0; k < cachePicos.length; k++) {
      let mx = 0;
      for (let j = k * paso; j < Math.min(pcm.length, (k + 1) * paso); j++) mx = Math.max(mx, Math.abs(pcm[j]));
      cachePicos[k] = Math.min(255, Math.round(Math.sqrt(mx / 32768) * 255));
    }
  }
  return cachePicos;
};

const send = (res, status, type, body) => {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(body);
};
const json = (res, data, status = 200) => send(res, status, "application/json; charset=utf-8", JSON.stringify(data));
const sendVideo = (req, res) => {
  const { size } = statSync(VIDEO);
  const m = req.headers.range ? /bytes=(\d*)-(\d*)/.exec(req.headers.range) : null;
  if (!m) {
    res.writeHead(200, { "Content-Type": "video/mp4", "Content-Length": size, "Accept-Ranges": "bytes" });
    return createReadStream(VIDEO).pipe(res);
  }
  const start = m[1] ? parseInt(m[1], 10) : 0;
  const end = m[2] ? Math.min(parseInt(m[2], 10), size - 1) : size - 1;
  if (start >= size || start > end) {
    res.writeHead(416, { "Content-Range": `bytes */${size}` });
    return res.end();
  }
  res.writeHead(206, { "Content-Type": "video/mp4", "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": end - start + 1, "Accept-Ranges": "bytes" });
  createReadStream(VIDEO, { start, end }).pipe(res);
};
const tramosValidos = (t) =>
  Array.isArray(t) &&
  t.length > 0 &&
  t.every((s) => s && Number.isFinite(s.origStart) && Number.isFinite(s.origEnd) && s.origStart >= 0 && s.origEnd > s.origStart && s.origEnd <= DURACION + 0.05);

const server = http.createServer((req, res) => {
  const url = req.url.split("?")[0];
  if (req.method === "GET" && url === "/api/pieza") {
    return json(res, {
      slug,
      paso,
      titulo,
      duracion: DURACION,
      picosPorS: PICOS_POR_S,
      segmentos: tramosIniciales(),
      palabras,
      mirada,
      sugerencias: sugerencias(),
      version: version(),
    });
  }
  if (req.method === "GET" && url === "/api/video") return sendVideo(req, res);
  if (req.method === "GET" && url === "/api/picos") return send(res, 200, "application/octet-stream", picos());
  if (req.method === "POST" && url === "/api/segmentos") {
    let raw = "";
    req.on("data", (ch) => (raw += ch));
    req.on("end", () => {
      try {
        const body = JSON.parse(raw);
        if (!tramosValidos(body.segmentos)) return json(res, { error: "Tramos inválidos" }, 400);
        if (body.version !== version()) return json(res, { error: "Hay cambios más nuevos en el archivo: recargá la página" }, 409);
        const tramos = [...body.segmentos].sort((a, b) => a.origStart - b.origStart);
        const data = guardar(tramos);
        mkdirSync(path.dirname(ARCHIVO_GUARDADO), { recursive: true });
        writeFileSync(ARCHIVO_GUARDADO, `${JSON.stringify(data, null, 2)}\n`, "utf8");
        console.log(`${new Date().toISOString()} guardado ${path.relative(ROOT, ARCHIVO_GUARDADO)}: ${tramos.length} tramos`);
        json(res, { ok: true, version: version() });
      } catch (e) {
        json(res, { error: `No se pudo guardar: ${e.message}` }, 400);
      }
    });
    return;
  }
  send(res, 404, "text/plain; charset=utf-8", "No encontrado");
});

const responde = async (url) => {
  try {
    await fetch(url, { signal: AbortSignal.timeout(1500) });
    return true;
  } catch {
    return false;
  }
};
const abrir = (url) => {
  if (argv.includes("--sin-abrir")) return;
  if (process.platform === "win32") spawn("cmd", ["/c", "start", "", url], { detached: true, stdio: "ignore" }).unref();
  else spawn(process.platform === "darwin" ? "open" : "xdg-open", [url], { detached: true, stdio: "ignore" }).unref();
};

server.listen(PORT, "127.0.0.1", async () => {
  console.log(`Puente de "${slug}" (${paso}) en http://127.0.0.1:${PORT} · guarda en ${path.relative(ROOT, ARCHIVO_GUARDADO)}`);
  if (!(await responde(EDITOR_URL))) {
    if (!existsSync(path.join(EDITOR, "package.json"))) salir(`No encuentro el editor en ${EDITOR} (pasalo con --editor <carpeta>)`);
    console.log(`Levantando Cut AI (${EDITOR})...`);
    spawn("npm run dev", { cwd: EDITOR, shell: true, stdio: "inherit", env: { ...process.env, PIEZA_API: `http://127.0.0.1:${PORT}` } });
    for (let i = 0; i < 60 && !(await responde(EDITOR_URL)); i++) await new Promise((r) => setTimeout(r, 1000));
  }
  const url = `${EDITOR_URL}/editor/demo?pieza=${slug}`;
  console.log(`Abrí ${url}`);
  abrir(url);
});
