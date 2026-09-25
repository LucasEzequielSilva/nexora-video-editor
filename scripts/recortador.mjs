#!/usr/bin/env node
// Servidor local del recortador manual. Lucas marca qué sacar de video-jc.mp4 y por qué; queda en
// cortes/<slug>-recortes.json (con el contexto de cada recorte, para aprender su criterio).
// También marca las posibles trabas (scripts/trabas.mjs); las que Lucas descarta quedan en "descartadas".
// Uso: node scripts/recortador.mjs <slug> [--puerto 3100]   ->  http://localhost:3100
import { createReadStream, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { archivoPalabras, detectarTrabas } from "./trabas.mjs";

const argv = process.argv.slice(2);
const iPuerto = argv.indexOf("--puerto");
const PORT = iPuerto >= 0 ? parseInt(argv[iPuerto + 1], 10) : 3100;
const slug = argv.find((a, i) => !a.startsWith("--") && (iPuerto < 0 || i !== iPuerto + 1));
if (!slug || !/^[a-z0-9-]+$/.test(slug) || !Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  console.error("Uso: node scripts/recortador.mjs <slug> [--puerto 3100]");
  process.exit(1);
}

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const PIEZA = path.join(ROOT, "public", "piezas", slug);
const RECORTES = path.join(ROOT, "cortes", `${slug}-recortes.json`);
const HTML = path.join(ROOT, "scripts", "recortador.html");
const VACIO = { fuente: "video-jc.mp4", recortes: [] };

if (!existsSync(path.join(PIEZA, "video-jc.mp4"))) {
  console.error(`No existe ${path.join(PIEZA, "video-jc.mp4")}`);
  process.exit(1);
}

const send = (res, status, type, body) => {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(body);
};
const json = (res, data, status = 200) => send(res, status, "application/json; charset=utf-8", JSON.stringify(data));

const sendVideo = (req, res) => {
  const file = path.join(PIEZA, "video-jc.mp4");
  const { size } = statSync(file);
  const m = req.headers.range ? /bytes=(\d*)-(\d*)/.exec(req.headers.range) : null;
  if (!m) {
    res.writeHead(200, { "Content-Type": "video/mp4", "Content-Length": size, "Accept-Ranges": "bytes" });
    createReadStream(file).pipe(res);
    return;
  }
  const start = m[1] ? parseInt(m[1], 10) : 0;
  const end = m[2] ? Math.min(parseInt(m[2], 10), size - 1) : size - 1;
  if (start >= size || start > end) {
    res.writeHead(416, { "Content-Range": `bytes */${size}` });
    res.end();
    return;
  }
  res.writeHead(206, {
    "Content-Type": "video/mp4",
    "Content-Range": `bytes ${start}-${end}/${size}`,
    "Content-Length": end - start + 1,
    "Accept-Ranges": "bytes",
  });
  createReadStream(file, { start, end }).pipe(res);
};

const tramoOk = (r) => r && Number.isFinite(r.desde) && Number.isFinite(r.hasta) && r.hasta > r.desde;
const valido = (body) =>
  body &&
  Array.isArray(body.recortes) &&
  body.recortes.every(tramoOk) &&
  (body.descartadas === undefined ||
    (Array.isArray(body.descartadas) && body.descartadas.every((d) => tramoOk(d) && typeof d.id === "string" && d.id)));

const version = () => (existsSync(RECORTES) ? String(statSync(RECORTES).mtimeMs) : "0");
const leerRecortes = () => ({ ...(existsSync(RECORTES) ? JSON.parse(readFileSync(RECORTES, "utf8")) : VACIO), version: version() });

let cacheTrabas = null;
const trabas = () => {
  const clave = [archivoPalabras(PIEZA), path.join(PIEZA, "video-jc.mp4")]
    .map((f) => (existsSync(f) ? `${f}:${statSync(f).mtimeMs}` : f))
    .join("|");
  if (cacheTrabas?.clave !== clave) cacheTrabas = { clave, data: detectarTrabas(PIEZA) };
  return cacheTrabas.data;
};

const server = http.createServer((req, res) => {
  const url = req.url.split("?")[0];

  if (req.method === "GET" && url === "/") return send(res, 200, "text/html; charset=utf-8", readFileSync(HTML));
  if (req.method === "GET" && url === "/video") return sendVideo(req, res);
  if (url === "/favicon.ico") return send(res, 204, "image/x-icon", "");

  if (req.method === "GET" && url === "/words") {
    const jc = path.join(PIEZA, "words.jc.json");
    const file = existsSync(jc) ? jc : path.join(PIEZA, "words.json");
    if (!existsSync(file)) return json(res, { segments: [] });
    return send(res, 200, "application/json; charset=utf-8", readFileSync(file));
  }

  if (req.method === "GET" && url === "/recortes") return json(res, leerRecortes());

  if (req.method === "GET" && url === "/trabas") {
    try {
      return json(res, trabas());
    } catch (e) {
      return json(res, { error: String(e.message ?? e) }, 500);
    }
  }

  if (req.method === "POST" && url === "/recortes") {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      try {
        const body = JSON.parse(raw);
        if (!valido(body)) return json(res, { error: "Formato de recortes inválido" }, 400);
        // Una página abierta con datos viejos no puede pisar cambios más nuevos del archivo.
        if (body.version !== version()) {
          console.log(`${new Date().toISOString()} rechazado: la página tiene una versión vieja del archivo`);
          return json(res, { error: "Hay cambios más nuevos en el archivo: recargá la página" }, 409);
        }
        const actual = leerRecortes();
        const descartadas = body.descartadas ?? actual.descartadas ?? [];
        console.log(`${new Date().toISOString()} guardado: ${body.recortes.length} recortes, ${descartadas.length} descartadas (${(req.headers["user-agent"] ?? "?").slice(0, 60)})`);
        const { version: _v, recortes: _r, descartadas: _d, ...extras } = actual;
        const data = { ...extras, fuente: "video-jc.mp4", recortes: body.recortes };
        if (descartadas.length) data.descartadas = descartadas;
        mkdirSync(path.dirname(RECORTES), { recursive: true });
        writeFileSync(RECORTES, `${JSON.stringify(data, null, 2)}\n`, "utf8");
        json(res, { ok: true, recortes: body.recortes.length, descartadas: descartadas.length, version: version() });
      } catch {
        json(res, { error: "JSON inválido" }, 400);
      }
    });
    return;
  }

  send(res, 404, "text/plain; charset=utf-8", "No encontrado");
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Recortador de "${slug}" en http://localhost:${PORT}`);
});
