import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Easing,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CUADROS, CURVA, RESORTE } from "./movimiento";
import type { Brief, FondoBeat, Marca } from "./tema";
import { NUMERO_ATERRIZA_F } from "./tiempos";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const useFuentes = (fuentes: Brief["fuentes"]): void => {
  const [handle] = useState(() => delayRender("fuentes"));
  useEffect(() => {
    if (!fuentes || fuentes.length === 0) {
      continueRender(handle);
      return;
    }
    Promise.all(
      fuentes.map(async (f) => {
        try {
          const face = new FontFace(f.familia, `url(${staticFile(f.archivo)})`, {
            weight: String(f.peso ?? 400),
            style: f.estilo ?? "normal",
          });
          await face.load();
          document.fonts.add(face);
        } catch (e) {
          console.warn(`No se pudo cargar la fuente ${f.familia} (${f.archivo}): se usa la del sistema.`, e);
        }
      }),
    ).then(() => continueRender(handle));
  }, [fuentes, handle]);
};

/** Acepta "#rgb", "#rrggbb" y "rgb(r,g,b)". */
const rgb = (c: string): [number, number, number] => {
  const m = c.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (m) return [Number(m[1]), Number(m[2]), Number(m[3])];
  const h = c.replace("#", "");
  const n = h.length === 3 ? h.split("").map((x) => x + x).join("") : h;
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
};

export const mezclar = (a: string, b: string, t: number): string => {
  const [r1, g1, b1] = rgb(a);
  const [r2, g2, b2] = rgb(b);
  const m = (x: number, y: number) => Math.round(x + (y - x) * t);
  return `rgb(${m(r1, r2)},${m(g1, g2)},${m(b1, b2)})`;
};

export const conAlfa = (c: string, alfa: number): string => {
  const [r, g, b] = rgb(c);
  return `rgba(${r},${g},${b},${alfa})`;
};

const luminancia = (c: string): number => {
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = rgb(c);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};

/** Contraste WCAG entre dos colores (1–21). */
export const contraste = (a: string, b: string): number => {
  const x = luminancia(a);
  const y = luminancia(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

/** La tinta de la marca o blanco: lo que se lea mejor sobre `bg`. */
export const textoSobre = (bg: string, tinta: string): string =>
  contraste(tinta, bg) >= contraste("#FFFFFF", bg) ? tinta : "#FFFFFF";

export type ColoresBeat = {
  bg: string;
  tinta: string;
  suave: string;
  acento: string;
  oscuro: boolean;
  /** El acento no se lee como texto sobre este fondo: la palabra clave va con marcador detrás. */
  marcador: boolean;
};

export const coloresBeat = (marca: Marca, fondo: FondoBeat = "base"): ColoresBeat => {
  if (fondo === "acento") {
    const tinta = textoSobre(marca.acento, marca.tinta);
    return { bg: marca.acento, tinta, suave: conAlfa(tinta, 0.72), acento: tinta, oscuro: false, marcador: false };
  }
  if (fondo === "oscuro") {
    const bg = mezclar(marca.tinta, "#000000", 0.3);
    const acento = contraste(marca.acento, bg) >= 3 ? marca.acento : mezclar(marca.acento, "#FFFFFF", 0.45);
    return { bg, tinta: "#F3F4F6", suave: "rgba(243,244,246,0.62)", acento, oscuro: true, marcador: false };
  }
  return {
    bg: marca.fondo,
    tinta: marca.tinta,
    suave: marca.tintaSuave,
    acento: marca.acento,
    oscuro: false,
    marcador: contraste(marca.acento, marca.fondo) < 3,
  };
};

/** Fondo liso: sin manchas, partículas ni variaciones de luz (en colores saturados el degradé se bandea al codificar). */
export const Fondo: React.FC<{ marca: Marca; fondo?: FondoBeat }> = ({ marca, fondo = "base" }) => (
  <AbsoluteFill style={{ background: coloresBeat(marca, fondo).bg }} />
);

export const Entra: React.FC<{
  retrasoF?: number;
  desde?: "abajo" | "izq" | "der" | "escala";
  dist?: number;
  blur?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ retrasoF = 0, desde = "abajo", dist = 40, blur = 6, style, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - retrasoF, fps, config: RESORTE.acomoda });
  const q = Math.min(1, Math.max(0, p));
  const tx = desde === "izq" ? -(1 - p) * dist : desde === "der" ? (1 - p) * dist : 0;
  const ty = desde === "abajo" ? (1 - p) * dist : 0;
  const sc = desde === "escala" ? 0.9 + 0.1 * p : 1;
  return (
    <div
      style={{
        opacity: Math.min(1, q * 1.5),
        transform: `translate(${tx}px, ${ty}px) scale(${sc})`,
        filter: q < 1 ? `blur(${(1 - q) * blur}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

type Item = { w: string } | { g: string[]; tipo: "clave" | "subrayado"; cola?: string };

const parsear = (texto: string): Item[] => {
  const res: Item[] = [];
  for (const seg of texto.split(/(\[[^\]]+\]|\{[^}]+\})/).filter(Boolean)) {
    if (seg.startsWith("[") || seg.startsWith("{")) {
      res.push({ g: seg.slice(1, -1).split(" ").filter(Boolean), tipo: seg.startsWith("[") ? "clave" : "subrayado" });
      continue;
    }
    for (const w of seg.split(" ").filter(Boolean)) {
      const prev = res[res.length - 1];
      if (/^[.,;:!?…)»"]+$/.test(w) && prev) {
        if ("w" in prev) prev.w += w;
        else prev.cola = (prev.cola ?? "") + w;
        continue;
      }
      res.push({ w });
    }
  }
  return res;
};

const TRAZO = "M2 9 C 22 3, 40 13, 60 7 S 90 4, 98 8";
const BANDA = "M0 4 C 25 1, 70 3, 100 1 L 100 16 C 75 19, 30 17, 0 19 Z";

/**
 * Texto que entra palabra por palabra.
 * [palabra] = clave: color de la marca, plano (o marcador detrás si el color no se lee).
 * {frase} = subrayado a mano que se traza cuando termina de entrar.
 */
export const Palabras: React.FC<{
  texto: string;
  marca: Marca;
  fondo?: FondoBeat;
  tamano?: number;
  align?: "center" | "left";
  retrasoF?: number;
  pasoF?: number;
}> = ({ texto, marca, fondo = "base", tamano = 84, align = "center", retrasoF = 4, pasoF = 4 }) => {
  const frame = useCurrentFrame();
  const c = coloresBeat(marca, fondo);
  const items = parsear(texto);
  const total = items.reduce((s, it) => s + ("w" in it ? 1 : it.g.length), 0);

  // Cada palabra se desliza un poco en x (60 px la primera, 12 la última) y 14 en y: se lee como una cámara que asienta.
  const palabra = (w: string, i: number, color?: string) => {
    const p = interpolate(frame - retrasoF - i * pasoF, [0, CUADROS.palabra], [0, 1], { ...clamp, easing: CURVA.entra });
    const dx = total > 1 ? 60 - (48 * Math.min(i, total - 1)) / (total - 1) : 30;
    return (
      <span
        key={`${w}-${i}`}
        style={{
          position: "relative",
          zIndex: 1,
          display: "inline-block",
          opacity: p,
          transform: `translate(${(1 - p) * dx}px, ${(1 - p) * 14}px)`,
          filter: p < 1 ? `blur(${(1 - p) * 6}px)` : undefined,
          color,
        }}
      >
        {w}
      </span>
    );
  };

  const banda = (prog: number, top: number, alto: number) => (
    <svg
      viewBox="0 0 100 20"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        zIndex: 0,
        left: -tamano * 0.1,
        top,
        width: `calc(100% + ${tamano * 0.2}px)`,
        height: alto,
        clipPath: `inset(0 ${(1 - prog) * 100}% 0 0)`,
      }}
    >
      <path d={BANDA} fill={c.acento} />
    </svg>
  );

  let idx = 0;
  const nodos = items.map((it, k) => {
    if ("w" in it) {
      const n = palabra(it.w, idx);
      idx += 1;
      return n;
    }
    const i0 = idx;
    idx += it.g.length;
    const ultima = idx - 1;
    const prog = interpolate(frame - (retrasoF + ultima * pasoF + 10), [0, CUADROS.trazo], [0, 1], { ...clamp, easing: CURVA.entra });
    let deco: React.ReactNode = null;
    if (it.tipo === "clave" && c.marcador) deco = banda(prog, tamano * 0.2, tamano * 0.86);
    if (it.tipo === "subrayado" && c.marcador) deco = banda(prog, tamano * 0.74, tamano * 0.32);
    if (it.tipo === "subrayado" && !c.marcador)
      deco = (
        <svg
          viewBox="0 0 100 14"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            left: 0,
            bottom: -tamano * 0.14,
            width: "100%",
            height: tamano * 0.2,
            overflow: "visible",
            opacity: prog > 0.001 ? 1 : 0,
          }}
        >
          <path
            d={TRAZO}
            fill="none"
            stroke={c.acento}
            strokeWidth={4.5}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - prog}
          />
        </svg>
      );
    const color = it.tipo === "clave" && !c.marcador ? c.acento : undefined;
    return (
      <span key={`g${k}`} style={{ display: "inline-flex", alignItems: "baseline", whiteSpace: "nowrap" }}>
        <span style={{ position: "relative", display: "inline-flex", columnGap: tamano * 0.26 }}>
          {deco}
          {it.g.map((w, j) => palabra(w, i0 + j, color))}
        </span>
        {it.cola ? palabra(it.cola, ultima) : null}
      </span>
    );
  });

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : "flex-start",
        alignItems: "baseline",
        columnGap: tamano * 0.26,
        rowGap: tamano * 0.14,
        fontFamily: marca.fuenteTitulo,
        fontWeight: 700,
        fontSize: tamano,
        lineHeight: 1.12,
        letterSpacing: -tamano * 0.02,
        color: c.tinta,
      }}
    >
      {nodos}
    </div>
  );
};

export const Contador: React.FC<{
  valor: number;
  decimales?: number;
  prefijo?: string;
  sufijo?: string;
  marca: Marca;
  fondo?: FondoBeat;
  tamano?: number;
}> = ({ valor, decimales = 0, prefijo = "", sufijo: sufijoTexto = "", marca, fondo = "base", tamano = 260 }) => {
  const frame = useCurrentFrame();
  const c = coloresBeat(marca, fondo);
  // Valor y escala con la misma curva y sin rebote: el número crece mientras cuenta y aterriza quieto. El sufijo entra al final.
  const p = interpolate(frame, [6, NUMERO_ATERRIZA_F], [0, 1], { ...clamp, easing: Easing.out(Easing.exp) });
  const sufijo = interpolate(frame, [NUMERO_ATERRIZA_F - 6, NUMERO_ATERRIZA_F + 4], [0, 1], clamp);
  const n = (valor * p).toLocaleString("es-AR", { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
  return (
    <div
      style={{
        fontFamily: marca.fuenteTitulo,
        fontWeight: 900,
        fontVariantNumeric: "tabular-nums",
        fontSize: tamano,
        letterSpacing: -tamano * 0.035,
        lineHeight: 1,
        color: c.marcador ? c.tinta : c.acento,
        opacity: interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" }),
        transform: `scale(${0.6 + 0.4 * p})`,
      }}
    >
      {prefijo}
      {n}
      <span style={{ opacity: sufijo }}>{sufijo === 0 ? "" : sufijoTexto}</span>
    </div>
  );
};

export const Pildora: React.FC<{
  texto: string;
  marca: Marca;
  fondo?: FondoBeat;
  retrasoF?: number;
}> = ({ texto, marca, fondo = "base", retrasoF = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = coloresBeat(marca, fondo);
  const p = spring({ frame: frame - retrasoF, fps, config: RESORTE.cae });
  const q = Math.min(1, Math.max(0, p));
  const tilde = c.marcador ? c.tinta : c.acento;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 22,
        padding: "20px 40px 20px 22px",
        borderRadius: 999,
        background: c.oscuro ? mezclar(c.bg, "#FFFFFF", 0.08) : "#FFFFFF",
        boxShadow: c.oscuro ? "none" : "0 2px 4px rgba(0,0,0,0.06), 0 10px 15px rgba(0,0,0,0.04)",
        fontFamily: marca.fuenteTexto,
        fontWeight: 600,
        fontSize: 46,
        color: c.tinta,
        opacity: Math.min(1, q * 1.4),
        transform: `translateX(${(1 - p) * -50}px)`,
      }}
    >
      <span
        style={{
          width: 50,
          height: 50,
          borderRadius: "50%",
          background: c.marcador ? marca.acento : conAlfa(c.acento, 0.16),
          display: "grid",
          placeItems: "center",
        }}
      >
        <svg width={26} height={26} viewBox="0 0 24 24">
          <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={tilde} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {texto}
    </div>
  );
};

export const Cursor: React.FC<{ x: number; y: number; escala?: number }> = ({ x, y, escala = 1 }) => (
  <svg
    width={70}
    height={70}
    viewBox="0 0 24 24"
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `scale(${escala})`,
      transformOrigin: "4px 2px",
      filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.3))",
    }}
  >
    <path d="M4 2l16 8.5-7 2.2-2.4 7.3z" fill="#111" stroke="#fff" strokeWidth={1.4} strokeLinejoin="round" />
  </svg>
);
