import type { ReactNode } from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import Sfx, { type SfxName } from "../../reserva/components/sfx";
import { ease } from "../../reserva/motion";
import FondoEditorial, { type MarcaFondo } from "./fondo-editorial";
import { ESCENA, FONDO } from "./tema";

/** Hacia dónde se mueve la escena. La salida de una escena y la entrada de la siguiente llevan la misma (M6). */
export type DirCamara = "arriba" | "abajo" | "izquierda" | "derecha" | "push" | "pull";

type CamaraEscenaProps = {
  durationInFrames: number;
  dirEntrada: DirCamara;
  dirSalida: DirCamara;
  /**
   * Fracción del cuadro que recorre la salida (M5: 0,05–0,16): del alto o del ancho según el eje; en push y pull, lo que
   * crece o se achica la escala. Tiene que ser la misma en las dos escenas de un corte para que la velocidad empalme,
   * salvo al entrar en push o pull, que llevan el recorrido medido (M8 0,84 → 1,00; M9 1,28 → 1,00).
   */
  amplitud?: number;
  /** Desenfoque de toda la escena, fondo incluido, al entrar. Default: sí en cortes verticales y push, no en laterales ni pull (T4). */
  blurIn?: boolean;
  /** Si la escena llega al final de la pieza no sale: se queda derivando. */
  llegaAlFinal?: boolean;
  /** Marcas del fondo, fijas: no viajan con la cámara (T8, decisión de Lucas). */
  marcas?: MarcaFondo[];
  /**
   * Sonido del cambio de escena, con el golpe en el corte (frame 0). Solo en cambios grandes (decisión de Lucas):
   * golpe-grave, whoosh-cine. Sin él no suena nada: así va la primera escena, que abre con el riser del hook.
   */
  sfxEntrada?: SfxName;
  volumenSfx?: number;
  children: ReactNode;
};

const W = 1080;
const H = 1920;
/** Vertical ≈230 px, lateral ≈130 px, push +12 %, pull −12 % (referencia: 169–296 px, 60 px, +14 %, −13 %). */
const AMPLITUD = 0.12;
/** Entre los que ya usa la pieza para cortes (b-roll 0,16, boom-negro 0,2): siempre debajo de la voz. */
const VOLUMEN_SFX = 0.18;
const SALIDA = Easing.in(Easing.exp);
/** Último paso de la salida, en fracción del recorrido: el corte cae en el cuadro más rápido. */
const PASO_FINAL = 1 - SALIDA((ESCENA.salida - 1) / ESCENA.salida);
/** Recorrido de la entrada, en amplitudes (≈2,5): la entrante arranca a la mitad de la velocidad con que salió la anterior. */
const ENTRADA = (0.5 * PASO_FINAL) / (1 - Math.exp(-1 / ESCENA.tau));
/** A los asientaCierre fr queda el 10 % del recorrido del pull-back: pasa por 1,00 y sigue alejándose hacia pullFondo. */
const TAU_PULL = ESCENA.asientaCierre / Math.LN10;

const VECTOR: Record<Exclude<DirCamara, "push" | "pull">, [number, number]> = {
  arriba: [0, -1],
  abajo: [0, 1],
  izquierda: [-1, 0],
  derecha: [1, 0],
};

const lateral = (dir: DirCamara) => dir === "izquierda" || dir === "derecha";
const deEscala = (dir: DirCamara) => dir === "push" || dir === "pull";

/** En push y pull, lo que se corren los bordes de arriba y abajo cuando la escala cambia 1: así la deriva en px vale para todos. */
const eje = (dir: DirCamara) => (deEscala(dir) ? H / 2 : lateral(dir) ? W : H);

type Movimiento = { x: number; y: number; escala: number };

/** Avance `f` (fracción del eje) en la dirección `dir`. */
const mover = (dir: DirCamara, f: number): Movimiento => {
  if (dir === "push") return { x: 0, y: 0, escala: f };
  if (dir === "pull") return { x: 0, y: 0, escala: -f };
  const [vx, vy] = VECTOR[dir];
  const px = f * eje(dir);
  return { x: vx * px, y: vy * px, escala: 0 };
};

/** Corrimiento de entrada en el frame `frame`, relativo al reposo (escala 1 o traslación 0). */
const entrar = (dir: DirCamara, frame: number, amplitud: number): Movimiento => {
  // M9 es un expo-out largo que termina alejándose (1,28 → 1,00 → 0,98): no lleva la deriva lineal de las demás.
  if (dir === "pull") {
    const escala = ESCENA.pullFondo + (ESCENA.pullDesde - ESCENA.pullFondo) * Math.exp(-frame / TAU_PULL);
    return { x: 0, y: 0, escala: escala - 1 };
  }
  const recorrido = dir === "push" ? 1 - ESCENA.pushDesde : amplitud * ENTRADA;
  return mover(dir, (ESCENA.derivaPx * frame) / eje(dir) - recorrido * Math.exp(-frame / ESCENA.tau));
};

/**
 * T4: cámara de una escena editorial. Entra frenando (expo-out) desde su dirección con blur de escena completa, deriva sin
 * quedarse quieta y sale acelerando (ease-in) hacia dirSalida, nítida hasta el último frame, que es el del corte. Opacidad
 * 1 siempre: sin fundido. El fondo queda fijo detrás; los children viajan con la cámara.
 */
export default function CamaraEscena({
  durationInFrames,
  dirEntrada,
  dirSalida,
  amplitud = AMPLITUD,
  blurIn = dirEntrada === "abajo" || dirEntrada === "arriba" || dirEntrada === "push",
  llegaAlFinal = false,
  marcas,
  sfxEntrada,
  volumenSfx = VOLUMEN_SFX,
  children,
}: CamaraEscenaProps) {
  const frame = useCurrentFrame();
  const entrada = entrar(dirEntrada, frame, amplitud);
  const sale = llegaAlFinal
    ? 0
    : ease(frame, [durationInFrames - 1 - ESCENA.salida, durationInFrames - 1], [0, 1], SALIDA);
  const salida = mover(dirSalida, amplitud * sale);
  const blur = blurIn ? ease(frame, [0, ESCENA.blurIn], [ESCENA.blurInPx, 0], Easing.out(Easing.quad)) : 0;
  return (
    <AbsoluteFill style={{ background: FONDO.base, overflow: "hidden" }}>
      <AbsoluteFill style={{ filter: blur > 0.1 ? `blur(${blur}px)` : undefined }}>
        <FondoEditorial marcas={marcas} />
        <AbsoluteFill
          style={{
            transform: `translate(${entrada.x + salida.x}px, ${entrada.y + salida.y}px) scale(${1 + entrada.escala + salida.escala})`,
          }}
        >
          {children}
        </AbsoluteFill>
      </AbsoluteFill>
      {sfxEntrada && <Sfx name={sfxEntrada} at={0} volume={volumenSfx} />}
    </AbsoluteFill>
  );
}
