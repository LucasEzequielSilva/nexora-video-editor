import type React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Cursor, Fondo } from "../comun";
import { AMBAR, CELESTE, clamp, F_TEXTO, recorrido, suave, VERDE } from "../tema";

const COL_W = 440;
const COL_H = 660;
const COL_GAP = 28;
const X0 = 960 - (3 * COL_W + 2 * COL_GAP) / 2;
const Y0 = 210;
const CARD_W = COL_W - 36;
const CARD_H = 124;
const CARD_GAP = 16;
const colX = (c: number) => X0 + c * (COL_W + COL_GAP);
const slot = (c: number, s: number) => ({ x: colX(c) + 18, y: Y0 + 78 + s * (CARD_H + CARD_GAP) });

type Movida = { desde: { x: number; y: number }; hasta: { x: number; y: number }; toma: number; suelta: number };

const TARJETAS: { titulo: string; quien: "L" | "V"; movidas: Movida[]; entra: number }[] = [
  {
    titulo: "Registro, login y perfil",
    quien: "L",
    entra: 4,
    movidas: [{ desde: slot(0, 0), hasta: slot(2, 1), toma: 38, suelta: 54 }],
  },
  {
    titulo: "Pagos e integraciones",
    quien: "V",
    entra: 6,
    movidas: [
      { desde: slot(0, 1), hasta: slot(0, 0), toma: 52, suelta: 60 },
      { desde: slot(0, 0), hasta: slot(2, 2), toma: 62, suelta: 78 },
    ],
  },
  {
    titulo: "Notificaciones push",
    quien: "V",
    entra: 8,
    movidas: [{ desde: slot(1, 0), hasta: slot(2, 0), toma: 22, suelta: 36 }],
  },
];

const posTarjeta = (f: number, movidas: Movida[]) => {
  let p = movidas[0].desde;
  let alzada = 0;
  for (const m of movidas) {
    if (f >= m.toma) {
      const t = suave(Math.min(1, Math.max(0, (f - m.toma) / (m.suelta - m.toma))));
      p = { x: m.desde.x + (m.hasta.x - m.desde.x) * t, y: m.desde.y + (m.hasta.y - m.desde.y) * t };
      if (f < m.suelta && m.desde.x !== m.hasta.x) alzada = Math.sin(t * Math.PI);
    }
  }
  return { ...p, alzada };
};

const Columna: React.FC<{ c: number; titulo: string; listo?: boolean; brillo?: number }> = ({ c, titulo, listo, brillo = 0 }) => (
  <div
    style={{
      position: "absolute",
      left: colX(c),
      top: Y0,
      width: COL_W,
      height: COL_H,
      borderRadius: 26,
      background: listo
        ? `linear-gradient(180deg, rgba(74,222,128,${0.22 + brillo * 0.12}), rgba(74,222,128,0.06))`
        : "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.025))",
      boxShadow: listo
        ? `0 0 0 1px rgba(74,222,128,${0.35 + brillo * 0.3}), 0 0 ${60 * brillo}px rgba(74,222,128,0.25)`
        : "0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
    }}
  >
    <div
      style={{
        marginTop: 26,
        textAlign: "center",
        fontFamily: F_TEXTO,
        fontWeight: 650,
        fontSize: 24,
        letterSpacing: "0.12em",
        color: listo ? VERDE : "rgba(255,255,255,0.75)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
      }}
    >
      {titulo}
      {listo && brillo > 0 ? (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={VERDE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: brillo }}>
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      ) : null}
    </div>
  </div>
);

export const Tablero: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = spring({ frame, fps, config: { damping: 16, stiffness: 160, mass: 0.8 } });
  const brillo = interpolate(frame, [80, 84, 100], [0, 1, 0.6], clamp);
  const cam = interpolate(frame, [80, 101], [0, 1], { ...clamp, easing: suave });

  const cursorV = recorrido(frame, [
    { f: 8, x: 1900, y: 380 },
    { f: 21, x: slot(1, 0).x + 250, y: slot(1, 0).y + 70 },
    { f: 22, x: slot(1, 0).x + 250, y: slot(1, 0).y + 70 },
    { f: 36, x: slot(2, 0).x + 250, y: slot(2, 0).y + 70 },
    { f: 50, x: slot(0, 0).x + 260, y: slot(0, 0).y + 150 },
    { f: 62, x: slot(0, 0).x + 260, y: slot(0, 0).y + 74 },
    { f: 78, x: slot(2, 2).x + 260, y: slot(2, 2).y + 74 },
    { f: 101, x: slot(2, 2).x + 330, y: slot(2, 2).y + 240 },
  ]);
  const cursorL = recorrido(frame, [
    { f: 20, x: 120, y: 1120 },
    { f: 37, x: slot(0, 0).x + 200, y: slot(0, 0).y + 66 },
    { f: 38, x: slot(0, 0).x + 200, y: slot(0, 0).y + 66 },
    { f: 54, x: slot(2, 1).x + 200, y: slot(2, 1).y + 66 },
    { f: 101, x: slot(2, 1).x - 120, y: slot(2, 1).y + 360 },
  ]);

  return (
    <AbsoluteFill>
      <Fondo tipo="negro" />
      <AbsoluteFill
        style={{
          transformOrigin: `${colX(2) + COL_W / 2}px 470px`,
          transform: `scale(${(0.9 + 0.1 * entra) * (1 + cam * 0.16)}) translateX(${-cam * 120}px)`,
          opacity: interpolate(frame, [0, 6], [0, 1], clamp),
        }}
      >
        <Columna c={0} titulo="POR HACER" />
        <Columna c={1} titulo="EN CURSO" />
        <Columna c={2} titulo="LISTO" listo brillo={brillo} />
        {TARJETAS.map((t) => {
          const p = posTarjeta(frame, t.movidas);
          const s = spring({ frame: frame - t.entra, fps, config: { damping: 14, stiffness: 200, mass: 0.6 } });
          const enListo = frame >= t.movidas[t.movidas.length - 1].suelta;
          return (
            <div
              key={t.titulo}
              style={{
                position: "absolute",
                left: p.x,
                top: p.y,
                width: CARD_W,
                height: CARD_H,
                borderRadius: 18,
                padding: "20px 22px",
                background: enListo ? "rgba(30,48,36,0.92)" : "rgba(38,38,44,0.95)",
                boxShadow: `0 0 0 1px rgba(255,255,255,${0.1 + p.alzada * 0.1}), 0 ${8 + p.alzada * 24}px ${20 + p.alzada * 40}px rgba(0,0,0,${0.35 + p.alzada * 0.25})`,
                transform: `scale(${(0.6 + 0.4 * s) * (1 + p.alzada * 0.05)}) rotate(${p.alzada * 3}deg)`,
                opacity: s,
                zIndex: p.alzada > 0 ? 5 : 1,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div style={{ fontFamily: F_TEXTO, fontWeight: 600, fontSize: 26, color: "white", whiteSpace: "nowrap" }}>{t.titulo}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ width: "62%", height: 10, borderRadius: 99, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                  <div style={{ width: enListo ? "100%" : "35%", height: "100%", borderRadius: 99, background: enListo ? VERDE : "rgba(255,255,255,0.35)" }} />
                </div>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 99,
                    background: t.quien === "L" ? AMBAR : CELESTE,
                    color: "#0C0C0E",
                    fontFamily: F_TEXTO,
                    fontWeight: 800,
                    fontSize: 18,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {t.quien}
                </div>
              </div>
            </div>
          );
        })}
        <AbsoluteFill style={{ zIndex: 20 }}>
          {frame >= 8 ? <Cursor x={cursorV.x} y={cursorV.y} color={CELESTE} letra="V" clicks={[22, 62]} /> : null}
          {frame >= 20 ? <Cursor x={cursorL.x} y={cursorL.y} color={AMBAR} letra="L" clicks={[38]} /> : null}
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
