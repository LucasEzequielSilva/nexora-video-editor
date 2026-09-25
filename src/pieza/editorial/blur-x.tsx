import { useId } from "react";

/** Por debajo de esto el desenfoque no se ve: el elemento va sin filtro, nítido y más barato de pintar. */
const UMBRAL = 0.1;
/** T2: la estela es casi solo horizontal. */
const PROPORCION_Y = 0.15;

type BlurXProps = {
  /** De useBlurXId(): uno por instancia. */
  id: string;
  /** Desvío horizontal en px (T2: de ~28 a 0 en 10–14 fr). */
  sx: number;
  /** Desvío vertical en px; por defecto sx · 0,15. */
  sy?: number;
};

const desvios = (sx: number, sy?: number): [number, number] => {
  const x = Math.max(0, sx);
  return [x, Math.max(0, sy ?? x * PROPORCION_Y)];
};

const activo = ([x, y]: [number, number]) => Math.max(x, y) > UMBRAL;

export const useBlurXId = (): string => `blurx-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

/** Valor de `filter` para el elemento con estela (combinable con otros filtros); undefined cuando ya está nítido. */
export const filtroBlurX = (id: string, sx: number, sy?: number): string | undefined =>
  activo(desvios(sx, sy)) ? `url(#${id})` : undefined;

/**
 * T2, estela horizontal: el blur de CSS no es direccional, así que cada elemento lleva su filtro SVG y lo referencia con
 * filtroBlurX (mismos sx/sy). Región de 300 %: con la default (10 %), y hasta con 50 %, la estela de 28 px de un remate
 * corto ("no") se corta en bordes rectos.
 */
export default function BlurX({ id, sx, sy }: BlurXProps) {
  const d = desvios(sx, sy);
  if (!activo(d)) return null;
  return (
    <svg width={0} height={0} aria-hidden style={{ position: "absolute", pointerEvents: "none" }}>
      <defs>
        <filter id={id} x="-100%" y="-50%" width="300%" height="200%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation={`${d[0]} ${d[1]}`} />
        </filter>
      </defs>
    </svg>
  );
}
