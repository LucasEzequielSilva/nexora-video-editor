#!/usr/bin/env node
// Detecta posibles trabas del que habla (repeticiones, arranques en falso, habla sin texto, pausas dentro de
// una palabra, muletillas) cruzando las palabras de whisper con la energía real del audio de video-jc.mp4.
// Whisper limpia los tropiezos: acá se buscan las huellas que deja (palabras estiradas o aplastadas, audio
// sin texto encima). Solo marca: la decisión de recortar es de Lucas en el recortador.
// Uso: node scripts/trabas.mjs public/piezas/<slug> [--todas]  ->  public/piezas/<slug>/trabas.json
// (--todas incluye las señales débiles sueltas, que por defecto se descartan para no llenar de ruido)
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SR = 16000;
const VENTANA = 0.02;
const PRIORIDAD = ["arranque", "repeticion", "muletilla", "habla-sin-texto", "estirada", "aplastada", "baja-confianza"];
const NIVEL = { baja: 1, media: 2, alta: 3 };
const FUNCIONALES = new Set(
  "a al con de del el en es la las lo los me mi no o para pero por que se si su te tu un una uno y ya ni".split(" "),
);
const MULETILLAS = new Set(["eh", "ehh", "em", "emm", "mm", "mmm", "este", "ah"]);

const r3 = (n) => Math.round(n * 1000) / 1000;
const norm = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ñ]+/g, " ").trim();

export const archivoPalabras = (dir) => {
  const jc = path.join(dir, "words.jc.json");
  return existsSync(jc) ? jc : path.join(dir, "words.json");
};

function energia(video) {
  const r = spawnSync(
    "ffmpeg",
    ["-hide_banner", "-loglevel", "error", "-i", video, "-vn", "-af", "aresample=async=1", "-ac", "1", "-ar", String(SR), "-f", "s16le", "-"],
    { maxBuffer: 1 << 30 },
  );
  if (r.status !== 0) throw new Error(`ffmpeg falló leyendo ${video}: ${r.stderr}`);
  const n = Math.floor(r.stdout.length / 2);
  const W = SR * VENTANA;
  const db = [];
  for (let i = 0; i + W <= n; i += W) {
    let s = 0;
    for (let j = 0; j < W; j++) {
      const x = r.stdout.readInt16LE((i + j) * 2) / 32768;
      s += x * x;
    }
    db.push(20 * Math.log10(Math.sqrt(s / W) + 1e-9));
  }
  return db;
}

const percentil = (arr, p) => {
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(s.length * p))];
};

function leerGuion(slug) {
  const f = path.join(ROOT, "cortes", `${slug}.json`);
  if (!existsSync(f)) return "";
  try {
    return ` ${JSON.parse(readFileSync(f, "utf8")).cortes.map((c) => norm(c.nota ?? "")).join(" ")} `;
  } catch {
    return "";
  }
}

export function detectarTrabas(dirPieza, { incluirBajas = false } = {}) {
  const dir = path.resolve(dirPieza);
  const slug = path.basename(dir);
  const fWords = archivoPalabras(dir);
  const video = path.join(dir, "video-jc.mp4");
  if (!existsSync(fWords)) throw new Error(`No hay words.jc.json ni words.json en ${dir}`);
  if (!existsSync(video)) throw new Error(`No existe ${video}`);

  const words = JSON.parse(readFileSync(fWords, "utf8"))
    .segments.flatMap((s) => s.words)
    .map((w) => ({ start: w.start, end: w.end, word: w.word.trim(), n: norm(w.word), p: w.p ?? w.probability ?? null }));
  const db = energia(video);
  const dur = db.length * VENTANA;
  const piso = percentil(db, 0.1);
  const voz = percentil(db, 0.9);
  const umbral = piso + 0.4 * (voz - piso);
  const hablaFuerte = voz - 8;
  const guion = leerGuion(slug);

  const fr = (t) => Math.max(0, Math.min(db.length - 1, Math.floor(t / VENTANA)));
  const sonoro = db.map((d) => d > umbral);

  // islas de energía (se rellenan huecos de hasta 40 ms, se descartan chasquidos de menos de 60 ms)
  const islas = [];
  for (let k = 0; k < db.length; k++) {
    if (!sonoro[k]) continue;
    const last = islas[islas.length - 1];
    if (last && k - last.b <= 2) last.b = k + 1;
    else islas.push({ a: k, b: k + 1 });
  }
  const ISLAS = islas
    .filter((i) => i.b - i.a >= 3)
    .map((i) => {
      let max = -100;
      for (let k = i.a; k < i.b; k++) max = Math.max(max, db[k]);
      return { desde: i.a * VENTANA, hasta: i.b * VENTANA, max };
    });

  const silencioInterno = (a, b) => {
    let mejor = null;
    let run = null;
    for (let k = fr(a + 0.02); k <= fr(b - 0.02); k++) {
      if (!sonoro[k]) {
        run = run ? { a: run.a, b: k + 1 } : { a: k, b: k + 1 };
        if (!mejor || run.b - run.a > mejor.b - mejor.a) mejor = { ...run };
      } else run = null;
    }
    return mejor ? { desde: mejor.a * VENTANA, hasta: mejor.b * VENTANA } : null;
  };
  const vozEn = (a, b, piso) => {
    let n = 0;
    for (let k = fr(a); k < fr(b); k++) if (db[k] > piso) n++;
    return n * VENTANA;
  };

  // lleva un borde al fotograma más silencioso cercano, sin pasar los límites (palabras vecinas que quedan)
  const valle = (t, lo, hi) => {
    const a = fr(Math.max(lo, t - 0.06));
    const b = fr(Math.min(hi, t + 0.06));
    let best = fr(t);
    for (let k = a; k <= b; k++) if (db[k] < db[best]) best = k;
    return r3(Math.min(hi, Math.max(lo, best * VENTANA + VENTANA / 2)));
  };
  const cortar = (desde, hasta, antes, despues) => {
    const lo = antes ? antes.end - 0.02 : 0;
    const hi = despues ? despues.start + 0.02 : dur;
    const a = valle(desde, lo, hasta);
    const b = valle(hasta, a, hi);
    return { desde: a, hasta: Math.max(b, r3(a + 0.04)) };
  };
  const textoEntre = (a, b) =>
    words.filter((w) => (w.start + w.end) / 2 >= a && (w.start + w.end) / 2 <= b).map((w) => w.word).join(" ");
  const enGuion = (ws) => guion.includes(` ${ws.map((w) => w.n).join(" ")} `);
  const finDeFrase = (i) => /[.,;:!?]$/.test(words[i].word) || i === words.length - 1 || words[i + 1].start - words[i].end > 0.35;

  const senales = [];
  const add = (s) => senales.push({ ...s, desde: r3(s.desde), hasta: r3(s.hasta) });

  words.forEach((w, i) => {
    const d = w.end - w.start;
    const prev = words[i - 1];
    const next = words[i + 1];

    // repetición: misma palabra seguida, o mismo bigrama en menos de 1.5 s
    if (next && w.n && w.n === next.n && next.start - w.start < 1.5 && !enGuion([w, next])) {
      add({
        tipo: "repeticion", desde: w.start, hasta: next.end, confianza: FUNCIONALES.has(w.n) ? "media" : "alta",
        detalle: `"${w.n}" dos veces seguidas`, sugerencia: cortar(w.start, next.start, prev, next), reinicio: next.start,
      });
    }
    for (let j = i + 2; j < words.length - 1 && next; j++) {
      if (words[j].start - w.start >= 1.5) break;
      const b1 = [w, next];
      const b2 = [words[j], words[j + 1]];
      if (b1[0].n !== b2[0].n || b1[1].n !== b2[1].n || !w.n) continue;
      if (FUNCIONALES.has(w.n) && FUNCIONALES.has(next.n) && j > i + 2) continue;
      if (enGuion(words.slice(i, j + 2))) continue;
      add({
        tipo: "repeticion", desde: w.start, hasta: words[j + 1].end, confianza: "media",
        detalle: `"${w.n} ${next.n}" repetido a ${(words[j].start - w.start).toFixed(2)} s`,
        sugerencia: cortar(w.start, words[j].start, prev, words[j]), reinicio: words[j].start,
      });
    }

    // arranque en falso: fragmento corto e inseguro que es el principio de lo que viene
    if (next && d < 0.15 && w.p != null && w.p < 0.5 && w.n && w.n !== next.n && next.n.startsWith(w.n)) {
      add({
        tipo: "arranque", desde: w.start, hasta: next.end, confianza: "alta",
        detalle: `"${w.n}" y reinicia con "${next.n}" (p=${w.p})`, sugerencia: cortar(w.start, next.start, prev, next), reinicio: next.start,
      });
    }

    // palabra estirada con un silencio adentro: whisper tapó una pausa. Voz fuerte antes de la pausa (sumando
    // las palabras aplastadas de antes) y voz después, dentro de la misma palabra = intento cortado y reinicio.
    // Algo débil antes (respiración, un sonido suelto) = media. Pausa pegada al principio o al final = baja.
    const sil = d > 0.45 && !finDeFrase(i) ? silencioInterno(w.start, w.end) : null;
    const pausa = sil ? sil.hasta - sil.desde : 0;
    if ((d > 0.7 && pausa >= 0.2) || pausa >= 0.3) {
      let k = i;
      while (k > 0 && words[k - 1].end - words[k - 1].start < 0.16 && w.start - words[k - 1].start < 0.8) k--;
      const ini = words[k].start;
      const antesFuerte = vozEn(ini, sil.desde, hablaFuerte);
      const antes = vozEn(w.start, sil.desde, umbral);
      const despues = vozEn(sil.hasta, w.end, umbral);
      const tras = ISLAS.find((s) => s.desde >= sil.hasta - 0.04);
      const fin = tras ? tras.desde : sil.hasta;
      const txt = `"${w.word}" dura ${d.toFixed(2)} s con ${pausa.toFixed(2)} s de silencio adentro`;
      if (antesFuerte >= 0.12 && despues >= 0.15) {
        add({
          tipo: "arranque", desde: ini, hasta: w.end, confianza: "alta",
          detalle: `${txt}: voz cortada y reinicio`, sugerencia: cortar(ini, fin, words[k - 1], null),
        });
      } else {
        const algo = antes >= 0.06 && despues >= 0.06;
        const primera = ISLAS.find((s) => s.hasta > w.start && s.desde < sil.desde);
        const desde = algo && primera ? Math.max(w.start, primera.desde) : sil.desde;
        add({
          tipo: "estirada", desde: algo ? desde : w.start, hasta: w.end, confianza: algo ? "media" : "baja",
          detalle: `${txt}${algo ? " (sonido suelto o respiración antes de la pausa)" : " (pausa pegada)"}`,
          sugerencia: cortar(desde, fin, algo ? prev : null, null),
        });
      }
    } else if (d > 0.9 && !finDeFrase(i)) {
      add({
        tipo: "estirada", desde: w.start, hasta: w.end, confianza: "baja",
        detalle: `"${w.word}" dura ${d.toFixed(2)} s sin ser final de frase`, sugerencia: { desde: r3(w.start), hasta: r3(w.end) },
      });
    }

    if (d < 0.05) {
      add({
        tipo: "aplastada", desde: w.start, hasta: w.end, confianza: "baja",
        detalle: `"${w.word}" dura ${Math.round(d * 1000)} ms (whisper no la ubicó)`, sugerencia: { desde: r3(w.start), hasta: r3(w.end) },
      });
    }

    if (w.p != null && w.p < 0.35 && i > 0) {
      add({
        tipo: "baja-confianza", desde: w.start, hasta: w.end, confianza: "baja",
        detalle: `whisper dudó con "${w.word}" (p=${w.p})`, sugerencia: { desde: r3(w.start), hasta: r3(w.end) },
      });
    }

    const inicio = !prev || /[.,;:!?]$/.test(prev.word) || w.start - prev.end > 0.2;
    const osea = w.n === "o" && next?.n === "sea";
    if (inicio && (MULETILLAS.has(w.n) || osea) && !enGuion(osea ? [w, next] : [w])) {
      const ult = osea ? next : w;
      const sig = words[words.indexOf(ult) + 1];
      add({
        tipo: "muletilla", desde: w.start, hasta: ult.end, confianza: w.n === "este" || osea ? "media" : "alta",
        detalle: `"${osea ? "o sea" : w.n}" al arrancar`, sugerencia: cortar(w.start, sig ? sig.start : ult.end, prev, sig),
      });
    }
  });

  // habla sin texto: voz de verdad (no respiración) que ninguna palabra tapa
  for (const isla of ISLAS) {
    const largo = isla.hasta - isla.desde;
    if (largo < 0.18 || isla.max < hablaFuerte) continue;
    const tapado = words.reduce((acc, w) => acc + Math.max(0, Math.min(w.end, isla.hasta) - Math.max(w.start, isla.desde)), 0);
    if (tapado / largo > 0.3) continue;
    const antes = [...words].reverse().find((w) => w.end <= isla.desde + 0.05);
    const despues = words.find((w) => w.start >= isla.hasta - 0.05);
    add({
      tipo: "habla-sin-texto", desde: isla.desde, hasta: isla.hasta,
      confianza: largo >= 0.3 && isla.max >= voz - 4 ? "alta" : "media",
      detalle: `${largo.toFixed(2)} s de voz sin palabras (pico ${isla.max.toFixed(1)} dB)`,
      sugerencia: cortar(isla.desde, isla.hasta, antes, despues),
    });
  }

  // fusionar señales solapadas en una sola traba
  senales.sort((a, b) => a.desde - b.desde);
  const grupos = [];
  for (const s of senales) {
    const g = grupos[grupos.length - 1];
    if (g && s.desde < g.hasta - 0.01) {
      g.hasta = Math.max(g.hasta, s.hasta);
      g.senales.push(s);
    } else grupos.push({ desde: s.desde, hasta: s.hasta, senales: [s] });
  }

  const trabas = [];
  for (const g of grupos) {
    const tipos = [...new Set(g.senales.map((s) => s.tipo))];
    let conf = Math.max(...g.senales.map((s) => NIVEL[s.confianza]));
    if (conf === 1 && tipos.length >= 3) conf = 2;
    if (conf === 1 && !incluirBajas) continue;
    const principal = [...g.senales].sort(
      (a, b) => PRIORIDAD.indexOf(a.tipo) - PRIORIDAD.indexOf(b.tipo) || NIVEL[b.confianza] - NIVEL[a.confianza],
    )[0];
    const sug = { ...principal.sugerencia };
    for (const s of g.senales) {
      if (s === principal || NIVEL[s.confianza] < 2) continue;
      if (s.sugerencia.desde <= sug.hasta && s.sugerencia.hasta >= sug.desde) {
        sug.desde = Math.min(sug.desde, s.sugerencia.desde);
        sug.hasta = Math.max(sug.hasta, s.sugerencia.hasta);
      }
    }
    // el corte nunca se come el segundo intento: termina antes del reinicio más temprano del grupo
    const reinicios = g.senales.map((s) => s.reinicio).filter((t) => t !== undefined && t > sug.desde);
    if (reinicios.length) sug.hasta = Math.min(sug.hasta, Math.min(...reinicios) - 0.01);
    const desde = Math.min(g.desde, sug.desde);
    const hasta = Math.max(g.hasta, sug.hasta);
    trabas.push({
      id: `${principal.tipo}-${Math.round(desde * 100)}`,
      desde: r3(desde),
      hasta: r3(hasta),
      tipo: principal.tipo,
      texto: textoEntre(desde, hasta),
      detalle: g.senales.map((s) => s.detalle).filter((x, k, a) => a.indexOf(x) === k).join(" · "),
      confianza: Object.keys(NIVEL).find((k) => NIVEL[k] === conf),
      sugerencia: { desde: r3(sug.desde), hasta: r3(sug.hasta) },
      senales: tipos,
    });
  }

  return {
    pieza: slug,
    fuente: "video-jc.mp4",
    palabras: path.basename(fWords),
    audio: { pisoDb: r3(piso), vozDb: r3(voz), umbralDb: r3(umbral) },
    trabas,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dir = process.argv.slice(2).find((a) => !a.startsWith("--"));
  if (!dir) {
    console.error("Uso: node scripts/trabas.mjs public/piezas/<slug>");
    process.exit(1);
  }
  const res = detectarTrabas(dir, { incluirBajas: process.argv.includes("--todas") });
  const out = path.join(dir, "trabas.json");
  writeFileSync(out, `${JSON.stringify(res, null, 2)}\n`, "utf8");
  console.log(
    `${res.pieza}: ${res.trabas.length} posibles trabas (palabras de ${res.palabras}, umbral de voz ${res.audio.umbralDb} dB) -> ${out}`,
  );
  for (const t of res.trabas) {
    console.log(
      `  ${t.desde.toFixed(2)}–${t.hasta.toFixed(2)}  ${t.tipo.padEnd(15)} ${t.confianza.padEnd(5)} "${t.texto}"  sacar ${t.sugerencia.desde.toFixed(2)}–${t.sugerencia.hasta.toFixed(2)}\n      ${t.detalle}`,
    );
  }
}
