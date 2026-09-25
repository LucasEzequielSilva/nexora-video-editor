import { useId } from "react";
import { AbsoluteFill } from "remotion";
import { FONDO } from "./tema";

export type MarcaFondo = "cruces" | "banda" | "anillo";

type FondoEditorialProps = {
  /** La banda y el anillo van detrás del héroe: uno por escena, o ninguno. */
  marcas?: MarcaFondo[];
  color?: string;
};

const W = 1080;
const H = 1920;
/** Esquinas opuestas (T8), en reposo: en f-146 ya están corridas hacia el centro por el zoom-out de salida de B6. */
const CRUCES = [
  { x: 918, y: 211 },
  { x: 108, y: 1747 },
];
const CRUZ_LARGO = 180;
const CRUZ_GROSOR = 2;
/** Círculos ajustados a los bordes medidos: la banda de f-064 cruza de borde a borde, apenas curvada. */
const BANDA = { cx: 540, cy: 2310, r: 1555, grosor: 145 };
/** El anillo de f-100 entra por la izquierda, detrás de la foto. */
const ANILLO = { cx: -150, cy: 1210, r: 705, grosor: 160 };

/** Brazo opaco en el centro que se desvanece en las puntas (perfil medido en f-146). */
const Desvanecido = ({ id, vertical }: { id: string; vertical: boolean }) => (
  <linearGradient id={id} x1={0} y1={0} x2={vertical ? 0 : 1} y2={vertical ? 1 : 0}>
    <stop offset={0} stopColor={FONDO.cruz} stopOpacity={0} />
    <stop offset={0.3} stopColor={FONDO.cruz} />
    <stop offset={0.7} stopColor={FONDO.cruz} />
    <stop offset={1} stopColor={FONDO.cruz} stopOpacity={0} />
  </linearGradient>
);

/** T8: gris frío liso, sin grilla ni viñeta. Todo fijo: no deriva con la escena (decisión de Lucas). */
export default function FondoEditorial({ marcas = ["cruces"], color = FONDO.base }: FondoEditorialProps) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const h = `cruz-h-${id}`;
  const v = `cruz-v-${id}`;
  return (
    <AbsoluteFill style={{ background: color, overflow: "hidden" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        {marcas.includes("anillo") && (
          <circle cx={ANILLO.cx} cy={ANILLO.cy} r={ANILLO.r} fill="none" stroke={FONDO.anillo} strokeWidth={ANILLO.grosor} />
        )}
        {marcas.includes("banda") && (
          <circle cx={BANDA.cx} cy={BANDA.cy} r={BANDA.r} fill="none" stroke={FONDO.banda} strokeWidth={BANDA.grosor} />
        )}
        {marcas.includes("cruces") && (
          <>
            <defs>
              <Desvanecido id={h} vertical={false} />
              <Desvanecido id={v} vertical />
            </defs>
            {CRUCES.map(({ x, y }) => (
              <g key={`${x}-${y}`}>
                <rect x={x - CRUZ_LARGO / 2} y={y - CRUZ_GROSOR / 2} width={CRUZ_LARGO} height={CRUZ_GROSOR} fill={`url(#${h})`} />
                <rect x={x - CRUZ_GROSOR / 2} y={y - CRUZ_LARGO / 2} width={CRUZ_GROSOR} height={CRUZ_LARGO} fill={`url(#${v})`} />
              </g>
            ))}
          </>
        )}
      </svg>
    </AbsoluteFill>
  );
}
