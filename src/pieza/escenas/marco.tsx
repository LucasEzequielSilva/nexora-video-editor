import type { ComponentType, ReactNode } from "react";
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import Sfx from "../../reserva/components/sfx";
import { ease, lerp, springAt } from "../../reserva/motion";
import { SPRING } from "../../reserva/theme";
import { type CaraCuadro, caraEn, type Punto } from "../cara";
import FondoEscena from "./fondo";
import { type DatosPorEscena, ESCENAS, type EscenaId } from "./registry";
import { TemaContext, type TemaEscena } from "./tema";
import { type EscenaProps, type PosicionPip, RECORTE } from "./tipos";

const ENTRA = 14;
const SALE = 10;
/** Ojos cuando no hay cara.json (previews). */
const OJOS_DEFAULT: Punto = { x: 480, y: 740 };
/** Abajo del recorte asoman silla y escritorio: se funde contra el borde inferior del cuadro. */
const FUNDIDO_ABAJO = "linear-gradient(to bottom, #000 86%, transparent 100%)";

type RecorteProps = {
  /** persona.webm (de scripts/silueta.py): el mismo video de la pieza, sin fondo. */
  videoSrc: string;
  /** Frame de la pieza donde arranca la escena: el recorte muestra el mismo instante que se escucha. */
  desdeFrame: number;
  durationInFrames: number;
  posicion: Exclude<PosicionPip, "ninguno">;
  /** Ojos suavizados por cuadro de la pieza: la cabeza queda en su lugar aunque el plano cambie en un jump cut. */
  cara?: (CaraCuadro | null)[];
  llegaAlFinal?: boolean;
};

/** El que habla recortado sin fondo, delante de la escena, entrando y saliendo desde abajo. */
export const Recorte = ({ videoSrc, desdeFrame, durationInFrames, posicion, cara, llegaAlFinal = false }: RecorteProps) => {
  const frame = useCurrentFrame();
  const entra = springAt(frame, 4, SPRING.soft);
  const sale = llegaAlFinal ? 0 : ease(frame, [durationInFrames - SALE - 2, durationInFrames - 2]);
  const ojos = (cara && caraEn(cara, desdeFrame + frame)) ?? OJOS_DEFAULT;
  const k = RECORTE.escala;
  const x = RECORTE.ojosX[posicion] - ojos.x * k;
  const y = RECORTE.ojosY - ojos.y * k + (1 - entra) * 700 + sale * 700;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", maskImage: FUNDIDO_ABAJO, WebkitMaskImage: FUNDIDO_ABAJO }}>
      <div
        style={{
          position: "absolute",
          width: 1080,
          height: 1920,
          transformOrigin: "0 0",
          transform: `translate(${x}px, ${y}px) scale(${k})`,
          filter: "drop-shadow(0 30px 50px rgba(0,0,0,0.28))",
        }}
      >
        <OffthreadVideo src={staticFile(videoSrc)} trimBefore={desdeFrame} transparent muted style={{ width: 1080, height: 1920 }} />
      </div>
    </AbsoluteFill>
  );
};

type MarcoProps = {
  durationInFrames: number;
  desdeFrame: number;
  seed?: number;
  tema?: TemaEscena;
  /** Si la escena llega al final de la pieza no hace transición de salida. */
  llegaAlFinal?: boolean;
  children: ReactNode;
};

/** Entrada y salida de una escena: sube y se asienta desde abajo con desenfoque; sale con fundido. */
export const MarcoEscena = ({ durationInFrames, desdeFrame, seed, tema = "blanco", llegaAlFinal = false, children }: MarcoProps) => {
  const frame = useCurrentFrame();
  const enter = ease(frame, [0, ENTRA]);
  const exit = llegaAlFinal ? 1 : ease(frame, [durationInFrames - SALE, durationInFrames], [1, 0]);
  const visible = Math.min(enter, exit);
  return (
    <AbsoluteFill
      style={{
        opacity: visible,
        transform: `translateY(${(1 - enter) * 90}px) scale(${lerp(1.04, 1, enter) * lerp(0.985, 1, exit)})`,
        filter: visible < 1 ? `blur(${(1 - visible) * 14}px)` : undefined,
      }}
    >
      <FondoEscena tema={tema} frameAbsoluto={desdeFrame + frame} seed={seed} />
      <TemaContext.Provider value={tema}>{children}</TemaContext.Provider>
    </AbsoluteFill>
  );
};

type ContenidoProps<K extends EscenaId> = {
  escena: K;
  durationInFrames: number;
  cues: Record<string, number>;
  datos: DatosPorEscena[K];
};

export const ContenidoEscena = <K extends EscenaId>({ escena, durationInFrames, cues, datos }: ContenidoProps<K>) => {
  const Componente = ESCENAS[escena].Componente as ComponentType<EscenaProps<DatosPorEscena[K]>>;
  return <Componente durationInFrames={durationInFrames} cues={cues} datos={datos} />;
};

/** Whoosh al entrar y al salir de la escena (el de salida no suena si la escena llega al final de la pieza). */
export const SonidoEscena = ({ durationInFrames, llegaAlFinal, ganancia = 1 }: { durationInFrames: number; llegaAlFinal: boolean; ganancia?: number }) => (
  <>
    <Sfx name="escena-entra" at={4} volume={0.08 * ganancia} />
    {!llegaAlFinal && <Sfx name="escena-sale" at={durationInFrames - 4} volume={0.1 * ganancia} />}
  </>
);
