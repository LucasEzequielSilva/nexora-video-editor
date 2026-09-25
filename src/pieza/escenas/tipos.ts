import type { TemaEscena } from "./tema";

/** Props que recibe cada escena. El fondo, la transición, el PiP y los whooshes los pone EscenaLayer: la escena solo dibuja su contenido. */
export type EscenaProps<D> = {
  durationInFrames: number;
  /** Momentos clave en frames locales (0 = inicio de la escena), resueltos desde anclas a palabras del props.json. */
  cues: Record<string, number>;
  datos: D;
};

export type EscenaPreview<D> = {
  durationInFrames: number;
  cues: Record<string, number>;
  datos: D;
  /** Fondo del preview (default blanco). */
  tema?: TemaEscena;
  /** Preview sin el recorte del que habla (escenas pensadas para ir solas). */
  sinRecorte?: boolean;
};

export type PosicionPip = "abajo-izquierda" | "abajo-derecha" | "ninguno";

/**
 * El que habla recortado sin fondo, delante de la escena: escala sobre el cuadro de 1080x1920 y dónde quedan sus ojos.
 * Ocupa la esquina de abajo (desde ~y 1320 hasta el borde, ~540 px de ancho): las escenas no ponen contenido ahí.
 */
export const RECORTE = {
  escala: 0.5,
  ojosY: 1440,
  ojosX: { "abajo-izquierda": 250, "abajo-derecha": 830 },
} as const;
