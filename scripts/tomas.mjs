#!/usr/bin/env node
// Herramienta de tomas: Lucas elige y ajusta a mano qué tomas de los clips crudos van en la pieza (cortes/<slug>.json).
// Lucas (2026-09-26): "tengo que recortarlo manual, por eso te digo que tenemos que armar la tool para recorte, ajuste manual".
// Muestra el clip (proxy liviano), la onda, la transcripción por frases, hacia dónde mira (a cámara o leyendo) y las
// tomas propuestas como bloques que se ajustan, reordenan, agregan o sacan. Guarda con control de versión.
// Uso: node scripts/tomas.mjs <slug> [--clips <archivo o carpeta> ...] [--puerto 3101]   ->  http://localhost:3101
// Sin cortes/<slug>.json, --clips es obligatorio (arranca con la lista de tomas vacía).
import { spawnSync } from "node:child_process";
import { createReadStream, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rutaProxy } from "./proxy.mjs";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const argv = process.argv.slice(2);
const opcion = (nombre) => {
  const i = argv.indexOf(nombre);
  if (i < 0) return [];
  const vals = [];
  for (let k = i + 1; k < argv.length && !argv[k].startsWith("--"); k++) vals.push(argv[k]);
  return vals;
};
const PORT = parseInt(opcion("--puerto")[0] ?? "3101", 10);
const slug = argv[0];
if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
  console.error("Uso: node scripts/tomas.mjs <slug> [--clips <archivo o carpeta> ...] [--puerto 3101]");
  process.exit(1);
}

const CORTES = path.join(ROOT, "cortes", `${slug}.json`);
const HTML = path.join(ROOT, "scripts", "tomas.html");
const TRANS = path.join(ROOT, "out", "transcripciones");

const esVideo = (f) => /\.(mov|mp4|m4v)$/i.test(f);
const clipsArg = opcion("--clips").flatMap((p) => (statSync(p).isDirectory() ? readdirSync(p).filter(esVideo).map((f) => path.join(p, f)) : [p]));
const leerCortes = () => (existsSync(CORTES) ? JSON.parse(readFileSync(CORTES, "utf8")) : null);
const inicial = leerCortes();
if (!inicial && !clipsArg.length) {
  console.error(`No existe ${path.relative(ROOT, CORTES)}: pasá los clips con --clips <archivo o carpeta>`);
  process.exit(1);
}
const base = inicial?.base ?? path.dirname(path.resolve(clipsArg[0]));
const nombres = [...new Set([...(inicial?.cortes ?? []).map((c) => c.archivo), ...clipsArg.map((c) => path.relative(base, path.resolve(c)).replaceAll("\\", "/"))])];
const clips = nombres.map((archivo) => ({ archivo, ruta: path.join(base, archivo) }));
for (const c of clips) if (!existsSync(c.ruta)) {
  console.error(`No encuentro el clip ${c.ruta}`);
  process.exit(1);
}

// Preparación (pesada, de a uno con turno.mjs): proxy, transcripción exploratoria y mirada de cada clip.
const turno = (...cmd) => {
  const r = spawnSync("node", [path.join(ROOT, "scripts", "turno.mjs"), ...cmd], { cwd: ROOT, stdio: "inherit" });
  if (r.status !== 0) throw new Error(`falló: ${cmd.join(" ")}`);
};
mkdirSync(TRANS, { recursive: true });
for (const c of clips) {
  const nombre = path.parse(c.archivo).name;
  c.proxy = rutaProxy(c.ruta);
  c.frases = path.join(TRANS, `${nombre}-explorar.json`);
  c.mirada = path.join(TRANS, `${nombre}-mirada.json`);
  if (!existsSync(c.proxy)) turno("node", "scripts/proxy.mjs", c.ruta);
  if (!existsSync(c.frases)) turno("python", "scripts/explorar-tomas.py", c.ruta, c.frases);
  if (!existsSync(c.mirada)) turno("python", "scripts/mirada.py", c.ruta, c.mirada);
}

const send = (res, status, type, body) => {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(body);
};
const json = (res, data, status = 200) => send(res, status, "application/json; charset=utf-8", JSON.stringify(data));

const sendVideo = (req, res, file) => {
  const { size } = statSync(file);
  const m = req.headers.range ? /bytes=(\d*)-(\d*)/.exec(req.headers.range) : null;
  if (!m) {
    res.writeHead(200, { "Content-Type": "video/mp4", "Content-Length": size, "Accept-Ranges": "bytes" });
    return createReadStream(file).pipe(res);
  }
  const start = m[1] ? parseInt(m[1], 10) : 0;
  const end = m[2] ? Math.min(parseInt(m[2], 10), size - 1) : size - 1;
  if (start >= size || start > end) {
    res.writeHead(416, { "Content-Range": `bytes */${size}` });
    return res.end();
  }
  res.writeHead(206, { "Content-Type": "video/mp4", "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": end - start + 1, "Accept-Ranges": "bytes" });
  createReadStream(file, { start, end }).pipe(res);
};

// Onda: pico absoluto cada 10 ms (0-255), para dibujarla sin bajar el video entero al navegador.
const PICOS_POR_S = 100;
const cachePicos = new Map();
const picos = (i) => {
  if (!cachePicos.has(i)) {
    const r = spawnSync("ffmpeg", ["-v", "error", "-i", clips[i].proxy, "-vn", "-ac", "1", "-ar", "8000", "-af", "aresample=async=1", "-f", "s16le", "-"], { maxBuffer: 512 * 1024 * 1024 });
    const pcm = new Int16Array(r.stdout.buffer, r.stdout.byteOffset, Math.floor(r.stdout.length / 2));
    const paso = 8000 / PICOS_POR_S;
    const out = Buffer.alloc(Math.ceil(pcm.length / paso));
    for (let k = 0; k < out.length; k++) {
      let mx = 0;
      for (let j = k * paso; j < Math.min(pcm.length, (k + 1) * paso); j++) mx = Math.max(mx, Math.abs(pcm[j]));
      out[k] = Math.min(255, Math.round(Math.sqrt(mx / 32768) * 255));
    }
    cachePicos.set(i, out);
  }
  return cachePicos.get(i);
};

const version = () => (existsSync(CORTES) ? String(statSync(CORTES).mtimeMs) : "0");
const valido = (b) =>
  b && Array.isArray(b.cortes) && b.cortes.every((c) => c && nombres.includes(c.archivo) && Number.isFinite(c.desde) && Number.isFinite(c.hasta) && c.hasta > c.desde);

const server = http.createServer((req, res) => {
  const url = req.url.split("?")[0];
  if (req.method === "GET" && url === "/") return send(res, 200, "text/html; charset=utf-8", readFileSync(HTML));
  if (url === "/favicon.ico") return send(res, 204, "image/x-icon", "");
  const mv = /^\/video\/(\d+)$/.exec(url);
  if (req.method === "GET" && mv && clips[+mv[1]]) return sendVideo(req, res, clips[+mv[1]].proxy);
  const mp = /^\/picos\/(\d+)$/.exec(url);
  if (req.method === "GET" && mp && clips[+mp[1]]) return send(res, 200, "application/octet-stream", picos(+mp[1]));
  if (req.method === "GET" && url === "/datos") {
    const actual = leerCortes();
    return json(res, {
      slug,
      base,
      clips: clips.map((c, i) => ({
        archivo: c.archivo,
        video: `/video/${i}`,
        picos: `/picos/${i}`,
        picosPorS: PICOS_POR_S,
        frases: JSON.parse(readFileSync(c.frases, "utf8")).segments,
        mirada: JSON.parse(readFileSync(c.mirada, "utf8")),
      })),
      cortes: actual?.cortes ?? [],
      version: version(),
    });
  }
  if (req.method === "POST" && url === "/cortes") {
    let raw = "";
    req.on("data", (ch) => (raw += ch));
    req.on("end", () => {
      try {
        const body = JSON.parse(raw);
        if (!valido(body)) return json(res, { error: "Formato de tomas inválido" }, 400);
        if (body.version !== version()) return json(res, { error: "Hay cambios más nuevos en el archivo: recargá la página" }, 409);
        const previo = leerCortes() ?? {};
        const data = { ...previo, base, cortes: body.cortes.map(({ archivo, desde, hasta, nota }) => ({ archivo, desde, hasta, nota: nota ?? "" })), editadoPor: "Lucas (herramienta de tomas)" };
        mkdirSync(path.dirname(CORTES), { recursive: true });
        writeFileSync(CORTES, `${JSON.stringify(data, null, 2)}\n`, "utf8");
        console.log(`${new Date().toISOString()} guardado: ${body.cortes.length} tomas`);
        json(res, { ok: true, version: version() });
      } catch {
        json(res, { error: "JSON inválido" }, 400);
      }
    });
    return;
  }
  send(res, 404, "text/plain; charset=utf-8", "No encontrado");
});

server.listen(PORT, "127.0.0.1", () => console.log(`Tomas de "${slug}" en http://localhost:${PORT}`));
