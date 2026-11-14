import { Easing } from "remotion";

/**
 * Lenguaje de movimiento de la pieza: pocas curvas y pocos resortes, siempre los mismos.
 * Entrar = arranca rápido y frena largo. Salir = espejo, más corto. Mover de A a B = arranca y frena suave.
 */
export const CURVA = {
  /** Entradas y respuestas de la interfaz (ease-out fuerte). */
  entra: Easing.bezier(0.23, 1, 0.32, 1),
  /** Algo que ya está en pantalla va de A a B: cursor, cámara, empuje, expansión. */
  mueve: Easing.bezier(0.77, 0, 0.175, 1),
  /** Paneles y hojas que suben. */
  hoja: Easing.bezier(0.32, 0.72, 0, 1),
  /** Salidas: espejo de `entra`, se va acelerando. */
  sale: Easing.bezier(0.68, 0, 0.77, 0),
  /** Revelados grandes con máscara. */
  revela: Easing.bezier(0.16, 1, 0.3, 1),
} as const;

/**
 * Resortes. En Remotion ζ = damping / (2·√(stiffness·mass)); con ζ < 0.8 la interfaz rebota y parece de juguete.
 * Usar resorte solo para lo físico (algo que cae, se lanza o se inclina); el sistema que "habla" va con curva.
 */
export const RESORTE = {
  /** ζ 1: llega y queda quieto sin pasarse (~13 cuadros). */
  acomoda: { damping: 31.4, stiffness: 247 },
  /** ζ 0.8: lo que cae o se lanza, con una pasada mínima (~1,5 %). */
  cae: { damping: 25.1, stiffness: 247 },
  /** ζ 0.8 y más rápido (~9 cuadros): tarjetas chicas, hojas, la vuelta del botón después del clic. */
  hoja: { damping: 33.5, stiffness: 439 },
  /** ζ 1 y lento (~26 cuadros): aterrizaje del logo o de una cifra; la cola larga se lee "premium". */
  pesado: { damping: 21, stiffness: 110 },
} as const;

/** Duraciones en cuadros a 30 fps. Lo chico es rápido; las salidas duran menos que las entradas. */
export const CUADROS = {
  /** El clic: el botón baja en este tiempo desde el cuadro en que suena. */
  clic: 3,
  /** Burbuja de chat, chip. */
  burbuja: 7,
  /** Cada palabra del texto. */
  palabra: 10,
  /** Trazo o marcador que se dibuja. */
  trazo: 14,
  /** Entrada del contenido cuando la transición viene con movimiento. */
  escena: 16,
} as const;
