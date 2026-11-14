import type { SfxName } from "../reserva/components/sfx";
import type { DatosPorEscena, EscenaId } from "./escenas/registry";
import type { TemaEscena } from "./escenas/tema";
import type { Gradiente } from "./gradientes";
import type { PosicionPip } from "./escenas/tipos";
import type { Marca } from "./marcas-paths";
import type { NeonOverlay } from "./neon/tipos";

export type RawWord = { start: number; end: number; word: string; p: number };

/** Momento de la pieza. Con `palabra` se ancla a la transcripción (sobrevive a los recortes); con `atMs` es un tiempo fijo. */
export type AnclaTiempo = { atMs?: number; palabra?: string; n?: number; offsetMs?: number; fin?: boolean };

/**
 * Efecto de sonido: `nombre` es una clave de SFX_FILES; el golpe del sonido cae en el momento del ancla.
 * `corte`: dónde se corta en seco (ej. el riser del hook termina exactamente al cerrar la frase, no se sigue en la otra).
 */
export type SfxCue = AnclaTiempo & { volumen?: number; corte?: AnclaTiempo } & (
    | { nombre: SfxName }
    /** Audio propio de la pieza (ruta en public/), arranca en el ancla. Ej. la cola de reverb de una palabra (scripts/cola-reverb.py). */
    | { archivo: string }
  );

/**
 * Movimiento de cámara. Los `suave` se encadenan (el `fin` de uno = el `inicio` del siguiente, con la misma escala) para
 * que la cámara nunca salte: del retrato (~2) a plano abierto (1) y de vuelta, con recorrido largo.
 */
export type Zoom = {
  /** `suave`: de escalaInicial a escala. `punch`: entra en `rampa` cuadros, se sostiene y sale. */
  tipo: "suave" | "punch";
  /** Solo `suave`. `in-out` (default): arranca y llega lento. `salida`: arranca rápido y se asienta (zoom out desde el retrato). */
  curva?: "in-out" | "salida";
  inicio: AnclaTiempo;
  /** "fin" = hasta el final de la pieza. */
  fin: AnclaTiempo | "fin";
  /** Escala al empezar (solo `suave`). Default 1. */
  escalaInicial?: number;
  escala: number;
  /** Cuadros de entrada del `punch`. Default 12. */
  rampa?: number;
  /** Cuadros de salida del `punch`. Default = rampa; 0 = vuelve en seco (para soltar justo en un corte). */
  rampaSalida?: number;
  /** Punto vertical (%) desde el que crece el zoom cuando no hay cara.json. Default 38. */
  origenY?: number;
};

/** Cara del que habla por cuadro (px de 1080x1920), de scripts/cara.py: [ojos_x, ojos_y, ancho_cara]; cortes = cuadros donde empieza cada plano. */
export type CaraTrack = { fps: number; cuadros: ([number, number, number] | null)[]; cortes?: number[] };

/**
 * Tachado retórico ("esto no"). Cada elemento es una palabra (`text`) o un ícono (`imagen`, ruta en public/).
 * Lucas prefiere íconos: la palabra ya está en el subtítulo y tacharla la repite (§8).
 */
export type StrikeOverlay = {
  tipo: "strike";
  palabras: { text?: string; imagen?: string; en: AnclaTiempo; strikeDelay?: number }[];
  hasta: AnclaTiempo;
  /** Posición vertical (centro de los íconos / arriba del texto), en % del alto. Default 70 íconos, 56 texto. */
  topPct?: number;
  /** Tamaño de los íconos (px) o de la letra. Default 300 / 92. */
  size?: number;
};

/** Cutaway de b-roll vertical a pantalla completa sobre la voz. `archivo` es una ruta de public/ (ver `npm run recursos -- usar`). */
export type BrollOverlay = {
  tipo: "broll";
  archivo: string;
  desde: AnclaTiempo;
  hasta: AnclaTiempo;
  /** Segundo del clip donde arranca. Default 0. */
  inicioS?: number;
  /** Escala final del push-in lento. Default 1.1. */
  zoom?: number;
  sfx?: SfxName;
  volumenSfx?: number;
};

/**
 * Ícono grande con pop y sonido, como los logos de @juanexplica.ia. Solo íconos premium de Lucas (`imagen`, ruta en
 * public/, ver `npm run recursos -- usar`) o logos oficiales (`marca`). Nunca íconos genéricos dibujados a mano.
 */
export type IconoOverlay = {
  tipo: "icono";
  imagen?: string;
  marca?: Marca;
  /** Objeto 3D del pack (.glb en public/), girando. Lucas prefiere estos a los íconos estilo Airbnb (2026-09-25). */
  modelo?: string;
  /** Inclinación del objeto 3D hacia la cámara (rad). */
  inclinacion?: number;
  /** Volumen del pop de entrada. Default 0.055. */
  volumenSfx?: number;
  en: AnclaTiempo;
  duracionMs?: number;
  /** Centro vertical en % del alto. Default 74: sobre las manos, debajo del subtítulo. */
  centroY?: number;
  tamano?: number;
  sfx?: SfxName;
};

type EscenaBase = {
  tipo: "escena";
  desde: AnclaTiempo;
  hasta: AnclaTiempo | "fin";
  /** Momentos clave de la escena; los nombres los define cada escena (ver su `Datos`/`PREVIEW`). */
  cues?: Record<string, AnclaTiempo>;
  /** Esquina donde va el que habla recortado sin fondo (persona.webm). Default abajo-izquierda. */
  pip?: PosicionPip;
  /** Mostrar los subtítulos durante la escena. Default false: la escena ya muestra su texto. */
  subtitulos?: boolean;
  seed?: number;
  /** Fondo blanco o negro (liso, sin grilla). Las escenas de una pieza alternan. Default blanco. */
  tema?: TemaEscena;
  /** Multiplica el volumen de los whooshes de entrada y salida (default 1). Subirlo cuando la música de la pieza va más fuerte. */
  gananciaSfx?: number;
};

/** Escena a pantalla completa sobre fondo liso blanco o negro; con `pip` muestra al que habla recortado delante (desde 2026-09-25 se usa sin). */
export type EscenaOverlay = { [K in EscenaId]: EscenaBase & { escena: K; datos: DatosPorEscena[K] } }[EscenaId];

/**
 * Titular arriba de la cabeza (estilo anuncio, referencia assets/referencias/anuncio-2026-09-27.mp4): frase chica,
 * palabra o cifra grande (azul eléctrico con brillo, opcionalmente entre corchetes) y bajada en serif itálica.
 */
export type TitularOverlay = {
  tipo: "titular";
  desde: AnclaTiempo;
  hasta: AnclaTiempo;
  arriba?: string;
  grande: string;
  /** Envuelve la palabra grande en corchetes: [4 A 6]. */
  corchetes?: boolean;
  abajo?: string;
  /** Cuándo entra la bajada (default: 0.4 s después de la grande). */
  abajoEn?: AnclaTiempo;
  color?: "azul" | "blanco" | "rosa";
  /** Centro vertical en % del alto. Default 12: arriba de la cabeza. */
  centroY?: number;
};

/** Aro blanco luminoso que flota arriba a la derecha sobre la cara (estilo anuncio). Las escenas lo tapan. */
export type AroOverlay = { tipo: "aro"; desde: AnclaTiempo; hasta: AnclaTiempo | "fin" };

/**
 * Frase clave detrás de la cabeza (estilo Matías Costas): el fondo pasa a un degradé oscuro, el que habla (persona.webm)
 * se achica hacia abajo y el texto queda entre el fondo y él. Ver src/pieza/detras.tsx.
 */
export type DetrasOverlay = {
  tipo: "detras";
  desde: AnclaTiempo;
  hasta: AnclaTiempo;
  /**
   * `pesada`: Tactic Sans Black (mayúsculas salvo `mayusculas: false`) con degradé; `fina`: Tactic Sans Light blanca.
   * Las de atrás se apilan hacia arriba desde `bajoY`; las `delante` van sobre el pecho, arriba del recorte.
   */
  lineas: {
    texto: string;
    estilo?: "pesada" | "fina";
    tamano?: number;
    cue?: string;
    gradiente?: Gradiente | false;
    mayusculas?: boolean;
    delante?: boolean;
  }[];
  cues?: Record<string, AnclaTiempo>;
  gradiente?: Gradiente;
  /** Borde de abajo de las líneas de atrás, en % del alto. Default 36: la última línea queda tras la coronilla. */
  bajoY?: number;
  /** Centro de las líneas `delante`, en % del alto. Default 68. */
  yDelante?: number;
  /** Arranca ya puesto, sin la transición de entrada (para el cuadro 0 de un hook). */
  sinEntrada?: boolean;
  /** Tamaño del que habla durante el bloque (1 = como en el video). Default 0.72. */
  escalaPersona?: number;
  /** Mostrar los subtítulos durante el bloque. Default false. */
  subtitulos?: boolean;
  gananciaSfx?: number;
};

/** Flash de luz: un film burn del pack (fondo negro) en modo `screen`, con el pico del destello en `en`. */
export type DestelloOverlay = {
  tipo: "destello";
  archivo: string;
  en: AnclaTiempo;
  /** Segundo del clip donde el destello está más brillante (medido). */
  picoS: number;
  largoS: number;
  opacidad?: number;
  sfx?: SfxName;
  volumenSfx?: number;
};

/**
 * Salto con glitch entre la toma real y una versión IA del mismo tramo (edición de video que conserva movimiento y boca).
 * `archivo`: el clip IA en public/. `ancla` + `anclaFuenteS`: una palabra de la pieza y el segundo del clip IA en que
 * suena esa misma palabra (así se alinean). `tramos`: dónde se ve la versión IA; cada borde lleva glitch y su sonido.
 */
export type GlitchIaOverlay = {
  tipo: "glitch-ia";
  archivo: string;
  ancla: AnclaTiempo;
  anclaFuenteS: number;
  tramos: { desde: AnclaTiempo; hasta: AnclaTiempo }[];
  volumenSfx?: number;
};

/** Neón (titular-neon, cifra, cita, fichas): ver src/pieza/neon/tipos.ts. */
export type Overlay =
  | StrikeOverlay
  | BrollOverlay
  | IconoOverlay
  | EscenaOverlay
  | TitularOverlay
  | AroOverlay
  | NeonOverlay
  | DetrasOverlay
  | DestelloOverlay
  | GlitchIaOverlay;

export type FuenteSubtitulo = "satoshi" | "helvetica-heavy" | "tactic-black" | "bebas";

/** Palabra clave a acentuar: un string acentúa todas sus apariciones; el objeto con atMs solo la más cercana a ese momento. */
export type Acento = string | { palabra: string; atMs?: number; color?: string };

export type SubtitulosConfig = {
  fuente?: FuenteSubtitulo;
  acentos?: Acento[];
  /** "grande" (default, patrón juanexplica.ia) o "anuncio": chico, una frase corta por vez que entra entera desenfocada.
   *  "neon": como "grande" pero con halo de color y la palabra clave en neón (Lucas, 2026-09-28: "probá con neon style captions"). */
  estilo?: "grande" | "anuncio" | "neon";
  /** Color del neón (solo estilo "neon"). Default verde neón. */
  neon?: string;
  /** Degradé de las palabras clave (acentos): "violeta" o "verde" Nexora (Lucas, 2026-09-28). Sin esto van en blanco. */
  gradiente?: "violeta" | "verde";
};

/**
 * Cama musical (Lucas: "falta música instrumental de fondo post blackscreen"). Arranca en `desde`, sigue hasta el final
 * y baja sola cuando hay voz (ducking con las palabras de words.json). Elegir el tema con assets/catalogo/musica.md.
 */
export type MusicaConfig = {
  /** Ruta en public/ (ver `npm run recursos -- usar`). */
  archivo: string;
  desde: AnclaTiempo;
  /** Segundo del tema donde arranca (idealmente un tiempo fuerte). Default 0. */
  inicioS?: number;
  /** Volumen en las pausas. Default 0.35. */
  volumen?: number;
  /** Multiplicador mientras habla. Default 0.4 (~ -8 dB bajo el volumen de las pausas). */
  bajoVoz?: number;
  fadeInMs?: number;
  fadeOutMs?: number;
};

export type PiezaConfig = {
  durationSeconds: number;
  zooms: Zoom[];
  overlays: Overlay[];
  subtitulos?: SubtitulosConfig;
  sfx?: SfxCue[];
  musica?: MusicaConfig;
};

export type PiezaProps = {
  slug: string;
  config: PiezaConfig | null;
  words: RawWord[];
  cara?: CaraTrack | null;
};
