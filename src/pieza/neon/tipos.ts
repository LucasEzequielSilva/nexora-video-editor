import type { Marca } from "../marcas-paths";
import type { AnclaTiempo } from "../types";
import type { FuenteFina, PresetNeon } from "./tema";

/**
 * Overlays de la familia neón (referencia assets/referencias/matias-costas.md). Todos van sobre el plano de la cara,
 * anclados a palabras, entre `desde` y `hasta`. Todo el texto es literal del guion (solo cambian mayúsculas y puntuación).
 */
type BaseNeon = {
  desde: AnclaTiempo;
  hasta: AnclaTiempo;
  /** naranja (default), violeta, azul, alerta (rojo, dolores) o plata (verde, plata). */
  preset?: PresetNeon;
  /** Mostrar los subtítulos mientras está en pantalla. Default false: el texto ya está acá (como las escenas). */
  subtitulos?: boolean;
  /** Multiplica el volumen de sus SFX (default 1). */
  gananciaSfx?: number;
};

/** Titular gancho: línea fina blanca arriba + línea pesada (Tactic Sans Black) con degradé y glow. */
export type TitularNeonOverlay = BaseNeon & {
  tipo: "titular-neon";
  fina?: string;
  /** Un "\n" la parte en dos renglones del mismo cuerpo. */
  pesada: string;
  /** light (default), thin o serif (Instrument Serif itálica). */
  fuenteFina?: FuenteFina;
  /** Centro vertical en % del alto. Default 60. */
  centroY?: number;
};

/** Cifra gigante con glow y pop de escala; entra en `desde` (anclarlo a la palabra de la cifra). */
export type CifraOverlay = BaseNeon & {
  tipo: "cifra";
  valor: string;
  /** Palabra fina arriba ("casi"). */
  arriba?: string;
  /** Etiqueta chica abajo. */
  etiqueta?: string;
  fuenteFina?: FuenteFina;
  /** Centro vertical en % del alto. Default 57. */
  centroY?: number;
};

/** Tarjeta de cita con borde que brilla. */
export type CitaOverlay = BaseNeon & {
  tipo: "cita";
  /** La cita literal, sin comillas. */
  texto: string;
  autor?: string;
  /** Centro vertical de la tarjeta en % del alto. Default 62. */
  centroY?: number;
};

/**
 * Fichas de lista al costado de la persona. Cada ficha entra en su cue (como las escenas: `cues` = anclas con nombre,
 * así `npm run verificar` y `chequeo-formato.mjs` las chequean); el título de categoría entra en `desde`.
 */
export type FichasOverlay = BaseNeon & {
  tipo: "fichas";
  titulo?: string;
  cues: Record<string, AnclaTiempo>;
  fichas: { titulo: string; cue: string; imagen?: string; marca?: Marca; chips?: string[] }[];
  /** Cue en el que la lista pasa a grilla sobre el fondo del preset (opcional). */
  grilla?: string;
  lado?: "izquierda" | "derecha";
  /** Borde de arriba de la lista en % del alto. Default 43. */
  topPct?: number;
};

export type NeonOverlay = TitularNeonOverlay | CifraOverlay | CitaOverlay | FichasOverlay;
