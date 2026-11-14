import type React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from "remotion";
import { clamp, type Tema } from "./piezas";

// Motor del "UI kit en movimiento": grilla bento, entrada en cascada diagonal (arriba-izquierda → abajo-derecha),
// cada celda vive su microinteracción y sale en cascada para dar paso a la próxima app.

export const ANCHO_UK = 1080;
export const ALTO_UK = 1350;
export const FPS_UK = 30;

const PAD = 36;
const GAP = 16;
const COLS = 4;
const FILAS = 6;
export const COL = (ANCHO_UK - PAD * 2 - GAP * (COLS - 1)) / COLS;
export const FILA = (ALTO_UK - PAD * 2 - GAP * (FILAS - 1)) / FILAS;

export type PropsCelda = { f: number; t: Tema; ancho: number; alto: number };

export type Celda = {
  c: number;
  r: number;
  w?: number;
  h?: number;
  /** Color del pozo si no es el del tema (ej. una celda oscura en una app clara). */
  pozo?: string;
  sinPozo?: boolean;
  Cmp: React.FC<PropsCelda>;
  /** Efectos en cuadros locales de la celda (0 = cuando aparece su contenido). */
  sonidos?: { en: number; nombre: string; vol: number }[];
};

/** El mismo esqueleto para todas las apps (4 columnas x 6 filas); `espejo` lo da vuelta para variar. */
const BASE = {
  A: [0, 0, 2, 2],
  B: [2, 0, 1, 1],
  C: [3, 0, 1, 1],
  D: [2, 1, 2, 1],
  E: [0, 2, 1, 2],
  F: [1, 2, 2, 1],
  G: [3, 2, 1, 2],
  H: [1, 3, 2, 1],
  I: [0, 4, 2, 1],
  J: [2, 4, 1, 1],
  K: [3, 4, 1, 2],
  L: [0, 5, 1, 1],
  M: [1, 5, 2, 1],
} as const;
export type Lugar = keyof typeof BASE;
export const ubicar = (k: Lugar, espejo = false) => {
  const [c, r, w, h] = BASE[k];
  return { c: espejo ? 4 - c - w : c, r, w, h };
};

/** Cuadro (dentro del acto) en el que arranca el contenido de la celda i. */
export const inicioContenido = (c: Celda, i: number, primero: boolean) => (primero ? retrasoCelda(c, i) * 0.7 : retrasoCelda(c, i)) + 5;

export type Acto = { nombre: string; tema: Tema; celdas: Celda[]; dur: number };

const sale = Easing.bezier(0.16, 1, 0.3, 1);
const entraCurva = Easing.bezier(0.6, 0, 0.2, 1);

export const retrasoCelda = (c: Celda, i: number) => (c.c + c.r) * 2.6 + random(`d${i}`) * 3;

const CeldaVista: React.FC<{ celda: Celda; i: number; f: number; dur: number; tema: Tema; primero: boolean }> = ({
  celda,
  i,
  f,
  dur,
  tema,
  primero,
}) => {
  const w = celda.w ?? 1;
  const h = celda.h ?? 1;
  const ancho = COL * w + GAP * (w - 1);
  const alto = FILA * h + GAP * (h - 1);
  const d = inicioContenido(celda, i, primero) - 5;
  const pozo = interpolate(f, [d, d + 10], [0, 1], { ...clamp, easing: sale });
  const contenido = interpolate(f, [d + 5, d + 17], [0, 1], { ...clamp, easing: sale });
  const ds = dur - 20 + (celda.c + celda.r) * 1.3;
  const fuera = interpolate(f, [ds, ds + 9], [0, 1], { ...clamp, easing: entraCurva });
  const vis = pozo * (1 - fuera);
  if (vis <= 0.001) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: PAD + celda.c * (COL + GAP),
        top: PAD + celda.r * (FILA + GAP),
        width: ancho,
        height: alto,
        borderRadius: tema.radioPozo,
        background: celda.sinPozo ? "transparent" : (celda.pozo ?? tema.pozo),
        opacity: vis,
        transform: `scale(${(0.9 + 0.1 * pozo) * (1 - 0.06 * fuera)})`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: contenido,
          transform: `scale(${0.94 + 0.06 * contenido})`,
          filter: contenido < 0.98 ? `blur(${(1 - contenido) * 8}px)` : undefined,
        }}
      >
        <celda.Cmp f={f - d - 5} t={tema} ancho={ancho} alto={alto} />
      </div>
    </div>
  );
};

export const Grilla: React.FC<{ acto: Acto; primero?: boolean }> = ({ acto, primero = false }) => {
  const f = useCurrentFrame();
  // El color de la app nueva barre en diagonal desde arriba a la izquierda, junto con la cascada.
  const barrido = interpolate(f, [0, 18], [0, 145], { ...clamp, easing: Easing.bezier(0.5, 0, 0.2, 1) });
  return (
    <AbsoluteFill style={{ background: acto.tema.fondo, clipPath: primero ? undefined : `circle(${barrido}% at 0% 0%)` }}>
      {acto.celdas.map((c, i) => (
        <CeldaVista key={i} celda={c} i={i} f={f} dur={acto.dur} tema={acto.tema} primero={primero} />
      ))}
    </AbsoluteFill>
  );
};
