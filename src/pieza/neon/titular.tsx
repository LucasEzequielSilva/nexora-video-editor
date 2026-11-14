import type { CSSProperties } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import Sfx from "../../reserva/components/sfx";
import { ease } from "../../reserva/motion";
import { ajustar, anchoCentrado, conCaja, estiloTipo, FINA, type FuenteFina, PESADA, type PresetNeon, SOMBRA_TEXTO, useAnchos } from "./tema";
import TextoNeon from "./texto-neon";

export type TitularNeonProps = {
  /** Línea fina de arriba (opcional). */
  fina?: string;
  /** Línea pesada con degradé y glow. Un "\n" la parte en dos renglones del mismo cuerpo. */
  pesada: string;
  preset?: PresetNeon;
  fuenteFina?: FuenteFina;
  /** Centro vertical en % del alto. Default 60: tercio medio-bajo, sobre el pecho (la referencia lo pone ahí). */
  centroY?: number;
  /** Frames que dura (sale en los últimos 6). */
  duracion: number;
  gananciaSfx?: number;
};

const MAX = { fina: 62, serif: 78, pesada: 150 } as const;
/** La pesada entra apenas después de la fina: se leen como una frase. */
const ENTRA_PESADA = 3;
const SALE = 6;

/** Entra desenfocada y achicándose apenas (como el titular del anuncio); `dy` sube desde abajo. */
export const entrada = (frame: number, at: number, dur = 8, dy = 0, escala = 0.1): CSSProperties => {
  const t = ease(frame, [at, at + dur]);
  return {
    opacity: ease(frame, [at, at + dur * 0.6]),
    transform: `translateY(${(1 - t) * dy}px) scale(${1 + escala * (1 - t)})`,
    filter: t < 0.999 ? `blur(${(1 - t) * 14}px)` : undefined,
  };
};

/**
 * Titular gancho (gramática #1 de la referencia): arriba una línea fina blanca y abajo la pesada (Tactic Sans Black) con
 * degradé y glow del preset. Vive ~2 s en el tercio medio-bajo; por default tapa los subtítulos mientras está.
 */
export default function TitularNeon({
  fina,
  pesada,
  preset = "naranja",
  fuenteFina = "light",
  centroY = 60,
  duracion,
  gananciaSfx = 1,
}: TitularNeonProps) {
  const frame = useCurrentFrame();
  const tipoFina = FINA[fuenteFina];
  const renglones = pesada.split("\n").filter((r) => r.trim().length > 0);
  const anchos = useAnchos([...(fina ? [{ texto: fina, tipo: tipoFina }] : []), ...renglones.map((texto) => ({ texto, tipo: PESADA }))]);
  if (!anchos) return null;

  const anchoMax = anchoCentrado((centroY / 100) * 1920 + 60 + renglones.length * 80);
  const anchosPesada = fina ? anchos.slice(1) : anchos;
  const tamPesada = Math.min(...anchosPesada.map((a) => ajustar(a, anchoMax, MAX.pesada)));
  const tamFina = fina ? ajustar(anchos[0], anchoMax, fuenteFina === "serif" ? MAX.serif : MAX.fina) : 0;

  const sale = ease(frame, [duracion - SALE, duracion], [1, 0]);
  const flote = Math.sin(frame / 26) * 3;
  const enciende = ease(frame, [ENTRA_PESADA + 2, ENTRA_PESADA + 16]) * (1 + Math.sin(frame / 14) * 0.05);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: sale, filter: sale < 0.999 ? `blur(${(1 - sale) * 10}px)` : undefined }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: `${centroY}%`,
          transform: `translateY(calc(-50% + ${flote}px))`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {fina && (
          <div
            style={{
              ...estiloTipo(tipoFina, tamFina),
              color: "#ffffff",
              textShadow: SOMBRA_TEXTO,
              marginBottom: tamPesada * 0.12,
              ...entrada(frame, 0, 8, 18, 0.04),
            }}
          >
            {conCaja(tipoFina, fina)}
          </div>
        )}
        {renglones.map((r, i) => (
          <TextoNeon
            key={i}
            texto={r}
            tamano={tamPesada}
            preset={preset}
            encendido={enciende}
            style={{ marginTop: i > 0 ? tamPesada * 0.04 : 0, ...entrada(frame, ENTRA_PESADA + i * 2, 9) }}
          />
        ))}
      </div>
      <Sfx name="pop-b" at={ENTRA_PESADA + 2} volume={0.12 * gananciaSfx} />
    </AbsoluteFill>
  );
}
