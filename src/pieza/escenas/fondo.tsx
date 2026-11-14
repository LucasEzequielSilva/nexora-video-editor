import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { TemaEscena } from "./tema";

const W = 1080;
const H = 1920;
/** Las sombras se dibujan en un lienzo más grande que el cuadro para que el desenfoque no deje bordes rectos al rotar. */
const MARGEN_SOMBRA = 500;

const NOISE_SVG = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

const ESTILO: Record<TemaEscena, { base: string; luz: string; sombra: string; opacidadSombra: number; ruido: number; mezcla: "multiply" | "screen"; vineta: string }> = {
  blanco: {
    base: "#f4f4f2",
    luz: "radial-gradient(ellipse 75% 60% at 50% 42%, #ffffff 0%, #fafaf9 45%, #ecece9 100%)",
    sombra: "#000",
    opacidadSombra: 1,
    ruido: 0.06,
    mezcla: "multiply",
    vineta: "radial-gradient(ellipse 85% 75% at 50% 45%, transparent 55%, rgba(0,0,0,0.16) 100%)",
  },
  limpio: {
    base: "#fbfbfb",
    luz: "radial-gradient(ellipse 80% 65% at 50% 45%, #ffffff 0%, #fcfcfc 60%, #f3f3f3 100%)",
    sombra: "#000",
    opacidadSombra: 0,
    ruido: 0.03,
    mezcla: "multiply",
    vineta: "radial-gradient(ellipse 90% 80% at 50% 45%, transparent 65%, rgba(0,0,0,0.06) 100%)",
  },
  negro: {
    base: "#0a0a0a",
    luz: "radial-gradient(ellipse 75% 60% at 50% 42%, #1c1c1c 0%, #121212 50%, #070707 100%)",
    sombra: "#000",
    opacidadSombra: 2.2,
    ruido: 0.05,
    mezcla: "screen",
    vineta: "radial-gradient(ellipse 85% 75% at 50% 45%, transparent 50%, rgba(0,0,0,0.55) 100%)",
  },
};

type FondoProps = {
  tema?: TemaEscena;
  /** Frame absoluto de la pieza: las sombras siguen moviéndose de una escena a la otra sin saltos. */
  frameAbsoluto?: number;
  /** Cambia el ángulo de las sombras curvas para que cada escena no sea idéntica. */
  seed?: number;
};

/**
 * Fondo liso de las escenas, blanco o negro: luz central, dos sombras curvas suaves que se mecen, ruido fino y viñeta
 * interior. Sin grilla (Lucas, 2026-09-25: "eliminá la grilla, dejalo con un poco de shadow y eso inner pero nada eso").
 */
export default function FondoEscena({ tema = "blanco", frameAbsoluto, seed = 0 }: FondoProps) {
  const local = useCurrentFrame();
  const f = frameAbsoluto ?? local;
  const e = ESTILO[tema];
  const sombra = Math.sin((f + seed * 50) / 110) * 18;

  return (
    <AbsoluteFill style={{ background: e.base, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: e.luz }} />
      <svg
        width={W + 2 * MARGEN_SOMBRA}
        height={H + 2 * MARGEN_SOMBRA}
        viewBox={`${-MARGEN_SOMBRA} ${-MARGEN_SOMBRA} ${W + 2 * MARGEN_SOMBRA} ${H + 2 * MARGEN_SOMBRA}`}
        style={{
          position: "absolute",
          left: -MARGEN_SOMBRA,
          top: -MARGEN_SOMBRA,
          transform: `translateY(${sombra}px) rotate(${-6 + seed * 9}deg)`,
          transformOrigin: "50% 50%",
        }}
      >
        <defs>
          <filter
            id={`fondo-sombra-${tema}`}
            filterUnits="userSpaceOnUse"
            x={-MARGEN_SOMBRA}
            y={-MARGEN_SOMBRA}
            width={W + 2 * MARGEN_SOMBRA}
            height={H + 2 * MARGEN_SOMBRA}
          >
            <feGaussianBlur stdDeviation="46" />
          </filter>
        </defs>
        <path d="M -300 1680 C 200 1240, 760 1320, 1400 980" fill="none" stroke={e.sombra} strokeWidth={120} opacity={0.07 * e.opacidadSombra} filter={`url(#fondo-sombra-${tema})`} />
        <path d="M -200 260 C 380 120, 820 380, 1380 140" fill="none" stroke={e.sombra} strokeWidth={80} opacity={0.05 * e.opacidadSombra} filter={`url(#fondo-sombra-${tema})`} />
      </svg>
      <AbsoluteFill style={{ backgroundImage: NOISE_SVG, opacity: e.ruido, mixBlendMode: e.mezcla }} />
      <AbsoluteFill style={{ background: e.vineta }} />
    </AbsoluteFill>
  );
}
