import React, { createContext, useContext, useEffect, useState } from "react";
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
import type { Brief, FondoBeat, Marca } from "./tema";

/** Cuadro global de la animación: las partículas y manchas son continuas entre beats. */
export const RelojContext = createContext(0);
export const useFrameGlobal = (): number => useCurrentFrame() + useContext(RelojContext);

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

const hex = (c: string): [number, number, number] => {
  const h = c.replace("#", "");
  const n = h.length === 3 ? h.split("").map((x) => x + x).join("") : h;
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
};

export const mezclar = (a: string, b: string, t: number): string => {
  const [r1, g1, b1] = hex(a);
  const [r2, g2, b2] = hex(b);
  const m = (x: number, y: number) => Math.round(x + (y - x) * t);
  return `rgb(${m(r1, r2)},${m(g1, g2)},${m(b1, b2)})`;
};

export const conAlfa = (c: string, alfa: number): string => {
  const [r, g, b] = hex(c);
  return `rgba(${r},${g},${b},${alfa})`;
};

export const coloresBeat = (marca: Marca, fondo: FondoBeat = "base") => {
  const a2 = marca.acento2 ?? marca.acento;
  if (fondo === "acento")
    return { bg: marca.acento, tinta: "#FFFFFF", suave: "rgba(255,255,255,0.80)", acento: "#FFFFFF", acento2: "#FFFFFF", oscuro: false };
  if (fondo === "oscuro")
    return {
      bg: "#0B0B10",
      tinta: "#F5F5F7",
      suave: "rgba(245,245,247,0.66)",
      acento: mezclar(marca.acento, "#FFFFFF", 0.2),
      acento2: mezclar(a2, "#FFFFFF", 0.2),
      oscuro: true,
    };
  return { bg: marca.fondo, tinta: marca.tinta, suave: marca.tintaSuave, acento: marca.acento, acento2: a2, oscuro: false };
};

const rnd = (i: number, k: number): number => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const Brillos: React.FC<{ color: string; n?: number }> = ({ color, n = 34 }) => {
  const f = useFrameGlobal();
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const x = rnd(i, 1) * 1920;
        const v = 5 + rnd(i, 3) * 12;
        const y = ((((rnd(i, 2) * 1180 - (f / 30) * v) % 1180) + 1180) % 1180) - 50;
        const r = 1.5 + rnd(i, 4) * 3.5;
        const tw = 0.2 + 0.8 * Math.abs(Math.sin(f / (16 + rnd(i, 6) * 14) + rnd(i, 5) * 6.28));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: r * 2,
              height: r * 2,
              borderRadius: "50%",
              background: color,
              opacity: tw * 0.6,
              boxShadow: `0 0 ${r * 3}px ${color}`,
            }}
          />
        );
      })}
    </>
  );
};

export const Fondo: React.FC<{ marca: Marca; fondo?: FondoBeat }> = ({ marca, fondo = "base" }) => {
  const f = useFrameGlobal();
  const dx = Math.sin(f / 60) * 80;
  const dy = Math.cos(f / 75) * 50;
  const css =
    fondo === "oscuro"
      ? `linear-gradient(135deg, #0B0B10 0%, ${mezclar("#0B0B10", marca.acento, 0.22)} 100%)`
      : fondo === "acento"
        ? `linear-gradient(135deg, ${marca.acento} 0%, ${marca.acento2 ? mezclar(marca.acento, marca.acento2, 0.7) : mezclar(marca.acento, "#000000", 0.32)} 100%)`
        : `linear-gradient(135deg, ${marca.fondo} 0%, ${mezclar(marca.fondo, marca.acento, 0.12)} 100%)`;
  const blob =
    fondo === "acento" ? "rgba(255,255,255,0.20)" : conAlfa(marca.acento, fondo === "oscuro" ? 0.3 : 0.2);
  const polvo = fondo === "base" ? marca.acento : "#FFFFFF";
  return (
    <AbsoluteFill style={{ background: css, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: 1100,
          height: 1100,
          left: 260 + dx,
          top: -260 + dy,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${blob} 0%, transparent 65%)`,
          filter: "blur(30px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          left: 900 - dx,
          top: 380 - dy,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${blob} 0%, transparent 65%)`,
          filter: "blur(30px)",
        }}
      />
      <Brillos color={polvo} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,${fondo === "oscuro" ? 0.38 : 0.07}) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

export const Entra: React.FC<{
  retrasoF?: number;
  desde?: "abajo" | "izq" | "der" | "escala";
  dist?: number;
  blur?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ retrasoF = 0, desde = "abajo", dist = 60, blur = 12, style, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - retrasoF, fps, config: { damping: 20, stiffness: 110, mass: 0.9 } });
  const q = Math.min(1, Math.max(0, p));
  const tx = desde === "izq" ? -(1 - p) * dist : desde === "der" ? (1 - p) * dist : 0;
  const ty = desde === "abajo" ? (1 - p) * dist : 0;
  const sc = desde === "escala" ? 0.88 + 0.12 * p : 1;
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

type Item = { w: string; a: boolean } | { g: string[] };

const parsear = (texto: string): Item[] => {
  const crudo: Item[] = [];
  for (const seg of texto.split(/(\[[^\]]+\]|\{[^}]+\})/).filter(Boolean)) {
    if (seg.startsWith("[")) {
      seg.slice(1, -1).split(" ").filter(Boolean).forEach((w) => crudo.push({ w, a: true }));
    } else if (seg.startsWith("{")) {
      crudo.push({ g: seg.slice(1, -1).split(" ").filter(Boolean) });
    } else {
      seg.split(" ").filter(Boolean).forEach((w) => crudo.push({ w, a: false }));
    }
  }
  const res: Item[] = [];
  for (const it of crudo) {
    const prev = res[res.length - 1];
    if ("w" in it && /^[.,;:!?…)»"]+$/.test(it.w) && prev) {
      if ("w" in prev) prev.w += it.w;
      else prev.g[prev.g.length - 1] += it.w;
      continue;
    }
    res.push(it);
  }
  return res;
};

/**
 * Texto que entra palabra por palabra.
 * [palabra] = acento (serif itálica con degradé). {frase} = subrayado dibujado a mano.
 */
export const Palabras: React.FC<{
  texto: string;
  marca: Marca;
  fondo?: FondoBeat;
  tamano?: number;
  align?: "center" | "left";
  retrasoF?: number;
  pasoF?: number;
}> = ({ texto, marca, fondo = "base", tamano = 96, align = "center", retrasoF = 4, pasoF = 4 }) => {
  const frame = useCurrentFrame();
  const c = coloresBeat(marca, fondo);
  const serif = marca.fuenteAcento;
  const items = parsear(texto);

  const estiloAcento: React.CSSProperties = {
    fontFamily: serif ?? marca.fuenteTitulo,
    fontStyle: "italic",
    fontWeight: serif ? 400 : 700,
    fontSize: serif ? tamano * 1.16 : tamano,
    backgroundImage: `linear-gradient(100deg, ${c.acento}, ${c.acento2})`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    WebkitTextFillColor: "transparent",
    paddingRight: "0.08em",
  };

  const palabra = (w: string, a: boolean, i: number) => {
    const p = interpolate(frame - retrasoF - i * pasoF, [0, 12], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    return (
      <span
        key={`${w}-${i}`}
        style={{
          display: "inline-block",
          opacity: p,
          transform: `translateY(${(1 - p) * 30}px)`,
          filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined,
          ...(a ? estiloAcento : {}),
        }}
      >
        {w}
      </span>
    );
  };

  let idx = 0;
  const nodos = items.map((it, k) => {
    if ("w" in it) {
      const n = palabra(it.w, it.a, idx);
      idx += 1;
      return n;
    }
    const i0 = idx;
    idx += it.g.length;
    const t0 = retrasoF + (i0 + it.g.length - 1) * pasoF + 10;
    const prog = interpolate(frame - t0, [0, 16], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    return (
      <span key={`g${k}`} style={{ position: "relative", display: "inline-flex", columnGap: tamano * 0.28, whiteSpace: "nowrap" }}>
        {it.g.map((w, j) => palabra(w, false, i0 + j))}
        <svg
          viewBox="0 0 100 14"
          preserveAspectRatio="none"
          style={{ position: "absolute", left: 0, bottom: -tamano * 0.14, width: "100%", height: tamano * 0.2, overflow: "visible", opacity: prog > 0.001 ? 1 : 0 }}
        >
          <path
            d="M2 9 C 22 3, 40 13, 60 7 S 90 4, 98 8"
            fill="none"
            stroke={c.acento}
            strokeWidth={4.5}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - prog}
          />
        </svg>
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
        columnGap: tamano * 0.28,
        rowGap: tamano * 0.16,
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
}> = ({ valor, decimales = 0, prefijo = "", sufijo = "", marca, fondo = "base", tamano = 300 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = coloresBeat(marca, fondo);
  const p = interpolate(frame, [6, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.exp),
  });
  const aterriza = spring({ frame: frame - 50, fps, config: { damping: 9, stiffness: 220 } });
  const pulso = frame >= 50 ? 0.07 * (1 - aterriza) : 0;
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
        backgroundImage: `linear-gradient(100deg, ${c.acento}, ${c.acento2})`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        WebkitTextFillColor: "transparent",
        opacity: interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" }),
        transform: `scale(${1 + pulso})`,
        paddingRight: "0.05em",
      }}
    >
      {prefijo}
      {n}
      {sufijo}
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
  const p = spring({ frame: frame - retrasoF, fps, config: { damping: 15, stiffness: 140 } });
  const q = Math.min(1, Math.max(0, p));
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: "22px 44px 22px 26px",
        borderRadius: 999,
        background: c.oscuro ? "rgba(255,255,255,0.08)" : "#FFFFFF",
        border: c.oscuro ? "1px solid rgba(255,255,255,0.14)" : "1px solid rgba(20,20,40,0.05)",
        boxShadow: c.oscuro ? "0 20px 60px rgba(0,0,0,0.4)" : "0 18px 50px rgba(20,20,40,0.12), 0 2px 6px rgba(20,20,40,0.06)",
        fontFamily: marca.fuenteTexto,
        fontWeight: 600,
        fontSize: 50,
        color: c.tinta,
        opacity: Math.min(1, q * 1.4),
        transform: `translateX(${(1 - p) * -70}px) scale(${0.94 + 0.06 * q})`,
        filter: q < 1 ? `blur(${(1 - q) * 8}px)` : undefined,
      }}
    >
      <span
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${c.acento}, ${c.acento2})`,
          display: "grid",
          placeItems: "center",
        }}
      >
        <svg width={28} height={28} viewBox="0 0 24 24">
          <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {texto}
    </div>
  );
};

export const Destello: React.FC<{ x: number; y: number; atF: number; color?: string; tam?: number }> = ({
  x,
  y,
  atF,
  color = "#FFFFFF",
  tam = 260,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - atF, [0, 8, 24], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <svg
      width={tam}
      height={tam}
      viewBox="-50 -50 100 100"
      style={{
        position: "absolute",
        left: x - tam / 2,
        top: y - tam / 2,
        opacity: p,
        transform: `rotate(${(frame - atF) * 4}deg) scale(${0.4 + p})`,
        filter: `drop-shadow(0 0 18px ${color})`,
      }}
    >
      <path d="M0,-48 C4,-12 12,-4 48,0 C12,4 4,12 0,48 C-4,12 -12,4 -48,0 C-12,-4 -4,-12 0,-48Z" fill={color} />
    </svg>
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
      filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.35))",
    }}
  >
    <path d="M4 2l16 8.5-7 2.2-2.4 7.3z" fill="#111" stroke="#fff" strokeWidth={1.4} strokeLinejoin="round" />
  </svg>
);

/** Dos ondas que se abren desde el centro del contenedor (el número aterrizó). */
export const Anillos: React.FC<{ atF: number; color: string; radio?: number }> = ({ atF, color, radio = 460 }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {[0, 7].map((demora, k) => {
        const p = interpolate(frame - atF - demora, [0, 30], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        });
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: radio * 2 * p,
              height: radio * 2 * p,
              marginLeft: -radio * p,
              marginTop: -radio * p,
              borderRadius: "50%",
              border: `${3 - k}px solid ${color}`,
              opacity: p > 0 ? 0.5 * (1 - p) : 0,
            }}
          />
        );
      })}
    </>
  );
};
