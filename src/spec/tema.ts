import { createContext, useContext } from "react";
import { useVideoConfig } from "remotion";
import type { Capa, Spec } from "./tipos";

/** Valores medidos en los spec ads de referencia (formatos/spec-ad/README.md §3). */
export const SPEC = {
  /** Solape entre escenas: la que entra desenfocada frena encima de la que sale. */
  solape: 10,
  /** Entrada: blur + escala que frena. */
  entra: 14,
  /** Salida: acelera, sin rebote. */
  sale: 10,
  /** Empuje de cámara default a lo largo de una escena. */
  empuje: 1.05,
  /** Paso entre palabras del texto cinético. */
  pasoPalabra: 0.09,
} as const;

export const TINTA = {
  texto: "#F5F7FA",
  tenue: "rgba(245,247,250,0.62)",
  vidrio: "rgba(255,255,255,0.07)",
  vidrioBorde: "rgba(255,255,255,0.14)",
  marcoTelefono: "#16181D",
} as const;

export const fuenteDe = (spec: Spec) =>
  spec.marca.fuente === "helvetica" ? "'Helvetica Neue', Satoshi, system-ui, sans-serif" : "Satoshi, system-ui, sans-serif";

export const SERIF = "'Instrument Serif', Georgia, serif";

type Ctx = { spec: Spec; capa: Capa };
export const SpecCtx = createContext<Ctx | null>(null);

export const useSpec = (): Ctx => {
  const c = useContext(SpecCtx);
  if (!c) throw new Error("useSpec fuera de SpecComposition");
  return c;
};

/** Unidad de layout: 1 u = 1 px en 1080 de lado corto. Las escenas se diseñan en u y valen en 16:9 y 9:16. */
export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const u = Math.min(width, height) / 1080;
  return { width, height, u, vertical: height > width };
};

/** `#RRGGBB` + alfa 0..1 → rgba(). */
export const alfa = (hex: string, a: number) => {
  const n = parseInt(hex.replace("#", ""), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
