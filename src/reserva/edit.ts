/**
 * EDIT DE IMG_7245 — "Reserva confirmada".
 * Todos los tiempos están en segundos del video ORIGINAL. w(i) = inicio de la palabra i del transcript.
 * Si cambian los cortes en timeline.ts, todo lo de acá se reacomoda solo.
 */
import { w, wEnd } from "./timeline";

export type InsertLayout =
  /** Escena a pantalla completa que tapa a Lucas. */
  | "full"
  /** Escena a pantalla completa con Lucas en un círculo PiP abajo a la derecha. */
  | "full-pip"
  /** Elemento encima de Lucas; el video sigue visible. */
  | "overlay";

export type InsertId =
  | "whatsapp-scene"
  | "demo-48"
  | "call-checklist"
  | "process-board"
  | "whatsapp-cta"
  | "outro";

export type InsertSpec = {
  id: InsertId;
  layout: InsertLayout;
  from: number;
  to: number | "end";
  /** Momentos clave dentro del insert. Se convierten a frames locales (0 = inicio del insert). */
  cues: Record<string, number>;
};

export const INSERTS: InsertSpec[] = [
  {
    // "En pocos minutos vas a estar recibiendo un WhatsApp nuestro, el cual te pedimos que respondas
    //  para así completar la confirmación"
    id: "whatsapp-scene",
    layout: "full",
    from: w(21) - 0.05,
    to: w(42),
    cues: { minutos: w(23), whatsapp: w(29), respondas: w(36), confirmacion: w(41) },
  },
  {
    // "la idea es preparar una demo funcional en 48 horas"
    id: "demo-48",
    layout: "full",
    from: w(104),
    to: w(112),
    cues: { demo: w(106), horas48: w(109) },
  },
  {
    // "Qué funcionalidades entran, cómo tiene que funcionar, cuánto tiempo requiere y cuál es la inversión."
    id: "call-checklist",
    layout: "full",
    from: w(139),
    to: w(154),
    cues: { funcionalidades: w(140), funcionar: w(142), tiempo: w(146), inversion: w(153) },
  },
  {
    // "empezamos nuestro proceso de definición, diseño y desarrollo, el cual vas a estar monitoreando
    //  desde tu portal de cliente, en la cual también vamos a estar teniendo reuniones semanales
    //  para ir viendo cómo vienen los objetivos del proyecto."
    id: "process-board",
    layout: "full",
    from: w(161),
    to: w(207),
    cues: {
      definicion: w(165),
      diseno: w(166),
      desarrollo: w(168),
      monitoreando: w(174),
      portal: w(177),
      reuniones: w(196),
      objetivos: w(204),
    },
  },
  {
    // "es que contestes el WhatsApp para confirmar la llamada." (el "y vernos" trabado está cortado)
    id: "whatsapp-cta",
    layout: "overlay",
    from: w(217),
    to: w(226),
    cues: { whatsapp: w(219), confirmar: w(221), salida: w(223) },
  },
  {
    // "y muchas gracias por agendar tu llamada."
    id: "outro",
    layout: "full",
    from: w(244),
    to: "end",
    cues: { gracias: w(246), llamada: w(250), fin: wEnd(250) },
  },
];

/** Zoom base por tramo (se alterna en cada jump cut para disimularlo). Índice = tramo de timeline.SEGMENTS. */
export const segmentZoom = (segmentIndex: number): number => (segmentIndex % 2 === 0 ? 1.0 : 1.12);

/** Empuje lento dentro de cada tramo (se suma al zoom base hacia el final del tramo). */
export const SEGMENT_PUSH = 0.03;

/** Golpes de zoom suaves en palabras con peso. */
export const ZOOM_HITS: { at: number; amount: number }[] = [
  { at: w(20), amount: 0.08 },
  { at: w(100), amount: 0.07 },
  { at: w(118), amount: 0.07 },
  { at: w(160), amount: 0.08 },
  { at: w(232), amount: 0.07 },
];

/** Palabras que en los subtítulos van en serif itálica (énfasis editorial). Se comparan en minúscula y sin puntuación. */
export const CAPTION_KEYWORDS = new Set([
  "whatsapp",
  "confirmar",
  "confirmación",
  "demo",
  "48",
  "horas",
  "definición",
  "diseño",
  "desarrollo",
  "portal",
]);
