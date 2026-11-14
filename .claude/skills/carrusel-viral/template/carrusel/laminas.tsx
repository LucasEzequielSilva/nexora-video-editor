import React, { useEffect, useState } from "react";
import { AbsoluteFill, Easing, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import { ALTO, ANCHO, ANIMADO_DEFAULT, FPS, type Brief, type FondoLamina, type Lamina, type Marca } from "./tema";

const PAD = 96;

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
          const face = new FontFace(f.familia, `url(${staticFile(f.archivo)})`, { weight: String(f.peso ?? 400), style: f.estilo ?? "normal" });
          await face.load();
          document.fonts.add(face);
        } catch (e) {
          console.warn(`No se pudo cargar la fuente ${f.familia}: se usa la del sistema.`, e);
        }
      }),
    ).then(() => continueRender(handle));
  }, [fuentes, handle]);
};

const rgb = (c: string): [number, number, number] => {
  const h = c.replace("#", "");
  const n = h.length === 3 ? h.split("").map((x) => x + x).join("") : h;
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
};
const lum = (c: string): number => {
  const [r, g, b] = rgb(c).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
};
export const contraste = (a: string, b: string): number => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x! + 0.05) / (y! + 0.05);
};

type Paleta = { fondo: string; tinta: string; suave: string; acento: string; textoAcento: string };
const paletaDe = (m: Marca, f: FondoLamina): Paleta => {
  if (f === "acento") return { fondo: m.acento, tinta: m.textoAcento, suave: m.textoAcento, acento: m.textoAcento, textoAcento: m.acento };
  if (f === "oscuro") return { fondo: m.tinta, tinta: m.fondo, suave: "rgba(255,255,255,.62)", acento: m.acento, textoAcento: m.textoAcento };
  return { fondo: m.fondo, tinta: m.tinta, suave: m.tintaSuave, acento: m.acento, textoAcento: m.textoAcento };
};

/**
 * [clave] va en el color de marca; si el acento no se lee sobre el fondo (contraste < 3) va con marcador.
 * `barrido` 0..1 dibuja el marcador de a poco (en el video); en las láminas fijas es 1.
 */
export const Texto: React.FC<{ texto: string; p: Paleta; barrido?: number }> = ({ texto, p, barrido = 1 }) => {
  const partes = texto.split(/(\[[^\]]+\])/g).filter(Boolean);
  const marcador = contraste(p.acento, p.fondo) < 3;
  return (
    <>
      {partes.map((parte, i) => {
        const esClave = parte.startsWith("[") && parte.endsWith("]");
        if (!esClave) return <React.Fragment key={i}>{parte}</React.Fragment>;
        const t = parte.slice(1, -1);
        if (!marcador) return <span key={i} style={{ color: p.acento }}>{t}</span>;
        return (
          <span
            key={i}
            style={{
              color: p.textoAcento,
              backgroundImage: `linear-gradient(${p.acento}, ${p.acento})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: `${barrido * 100}% 100%`,
              padding: "0 .12em",
              margin: "0 -.12em",
              WebkitBoxDecorationBreak: "clone",
              boxDecorationBreak: "clone",
            }}
          >
            {t}
          </span>
        );
      })}
    </>
  );
};

const Flecha: React.FC<{ color: string }> = ({ color }) => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden>
    <path d="M10 32h40M34 14l18 18-18 18" stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const dos = (n: number): string => String(n).padStart(2, "0");

/** Contenido de una lámina dentro de su marco. `barrido` anima el marcador (video). */
export const LaminaVista: React.FC<{ brief: Brief; indice: number; barrido?: number }> = ({ brief, indice, barrido = 1 }) => {
  const { marca, laminas } = brief;
  const l: Lamina = laminas[indice]!;
  const fondo: FondoLamina = l.fondo ?? "base";
  const p = paletaDe(marca, fondo);
  const total = laminas.length;
  const ultima = indice === total - 1;
  const T = (t: string) => <Texto texto={t} p={p} barrido={barrido} />;

  const cuerpo = (() => {
    switch (l.tipo) {
      case "portada":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 44 }}>
            <div style={{ fontSize: 124, lineHeight: 1.0, fontWeight: 900, letterSpacing: -4 }}>{T(l.titulo)}</div>
            {l.bajada ? <div style={{ fontSize: 46, lineHeight: 1.3, color: p.suave, fontWeight: 500, maxWidth: 820 }}>{l.bajada}</div> : null}
          </div>
        );
      case "punto":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
            <div style={{ fontSize: 150, fontWeight: 900, letterSpacing: -6, lineHeight: 0.9, color: p.acento }}>{dos(indice)}</div>
            <div style={{ fontSize: 84, lineHeight: 1.05, fontWeight: 900, letterSpacing: -2.5 }}>{T(l.titulo)}</div>
            <div style={{ fontSize: 46, lineHeight: 1.32, color: p.suave, fontWeight: 500 }}>{l.texto}</div>
          </div>
        );
      case "lista":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 44 }}>
            <div style={{ fontSize: 80, lineHeight: 1.05, fontWeight: 900, letterSpacing: -2.5 }}>{T(l.titulo)}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
              {l.items.map((it, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 28, fontSize: 50, fontWeight: 600, lineHeight: 1.2 }}>
                  <span style={{ flex: "none", width: 24, height: 24, borderRadius: 12, background: p.acento }} />
                  <span>{it}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case "cifra":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div style={{ fontSize: l.valor.length > 5 ? 230 : 300, lineHeight: 0.9, fontWeight: 900, letterSpacing: -10, color: p.acento }}>{l.valor}</div>
            <div style={{ fontSize: 60, lineHeight: 1.2, fontWeight: 700, letterSpacing: -1, maxWidth: 860 }}>{T(l.leyenda)}</div>
          </div>
        );
      case "versus": {
        const caja = (et: string, tx: string, bueno: boolean) => (
          <div
            style={{
              padding: "40px 44px",
              borderRadius: 28,
              background: bueno ? p.acento : "transparent",
              color: bueno ? p.textoAcento : p.tinta,
              boxShadow: bueno ? "none" : `inset 0 0 0 3px ${p.suave}`,
            }}
          >
            <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", opacity: bueno ? 0.85 : 0.7, marginBottom: 14 }}>{et}</div>
            <div style={{ fontSize: 58, lineHeight: 1.15, fontWeight: 800, letterSpacing: -1 }}>{tx}</div>
          </div>
        );
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {caja(l.antes.etiqueta, l.antes.texto, false)}
            {caja(l.despues.etiqueta, l.despues.texto, true)}
          </div>
        );
      }
      case "cierre":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 44 }}>
            <div style={{ fontSize: 96, lineHeight: 1.02, fontWeight: 900, letterSpacing: -3 }}>{T(l.titulo)}</div>
            <div
              style={{
                alignSelf: "flex-start",
                padding: "30px 56px",
                borderRadius: 999,
                background: p.acento,
                color: p.textoAcento,
                fontSize: 64,
                fontWeight: 900,
                letterSpacing: -1.5,
              }}
            >
              {l.accion}
            </div>
            {l.pie ? <div style={{ fontSize: 40, color: p.suave, fontWeight: 500 }}>{l.pie}</div> : null}
          </div>
        );
    }
  })();

  return (
    <AbsoluteFill style={{ background: p.fondo, color: p.tinta, fontFamily: marca.fuente, width: ANCHO, height: ALTO }}>
      <div style={{ position: "absolute", left: PAD, right: PAD, top: 84, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontSize: 38, fontWeight: 900, letterSpacing: -1 }}>
          {marca.nombre}
          <span style={{ color: p.acento }}>.</span>
        </div>
        <div style={{ fontSize: 30, fontWeight: 600, color: p.suave }}>@{marca.usuario}</div>
      </div>
      <div style={{ position: "absolute", left: PAD, right: PAD, top: 220, bottom: 220, display: "flex", flexDirection: "column", justifyContent: "center" }}>{cuerpo}</div>
      <div style={{ position: "absolute", left: PAD, right: PAD, bottom: 84, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 32, fontWeight: 700, color: p.suave, fontVariantNumeric: "tabular-nums" }}>
          {dos(indice + 1)} / {dos(total)}
        </div>
        {ultima ? null : <Flecha color={p.suave} />}
      </div>
    </AbsoluteFill>
  );
};

export const Lamina1: React.FC<{ brief: Brief; indice: number }> = ({ brief, indice }) => {
  useFuentes(brief.fuentes);
  return <LaminaVista brief={brief} indice={indice} />;
};

/** Video en bucle: cada lámina se sostiene y la siguiente la empuja; la última empuja a la primera, así el bucle no tiene corte. */
export const CarruselAnimado: React.FC<{ brief: Brief }> = ({ brief }) => {
  const frame = useCurrentFrame();
  useFuentes(brief.fuentes);
  const cfg = brief.animado ?? ANIMADO_DEFAULT;
  const seg = Math.round(cfg.segPorLamina * FPS);
  const trans = Math.round(cfg.transicionS * FPS);
  const n = brief.laminas.length;
  const i = Math.min(n - 1, Math.floor(frame / seg));
  const local = frame - i * seg;
  const sostiene = seg - trans;
  const p = local < sostiene ? 0 : interpolate(local, [sostiene, seg], [0, 1], { easing: Easing.bezier(0.77, 0, 0.175, 1), extrapolateRight: "clamp" });
  const siguiente = (i + 1) % n;
  // El marcador de la clave se dibuja después de que la lámina aterriza, salvo la primera (ya está dibujada al empezar el bucle).
  const barrido = (idx: number, loc: number): number => (idx === 0 ? 1 : interpolate(loc, [10, 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <AbsoluteFill style={{ transform: `translateX(${-p * ANCHO}px)` }}>
        <LaminaVista brief={brief} indice={i} barrido={barrido(i, local)} />
      </AbsoluteFill>
      {p > 0 ? (
        <AbsoluteFill style={{ transform: `translateX(${(1 - p) * ANCHO}px)` }}>
          <LaminaVista brief={brief} indice={siguiente} barrido={barrido(siguiente, 0)} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
