import type { SfxName } from "../reserva/components/sfx";
import type { Marca } from "../pieza/marcas-paths";

/**
 * Spec ad: comercial de producto de ~20 s (16:9 master + 9:16) en el lenguaje de los spec ads de Revolut/Spotify/Amazon
 * (ver formatos/spec-ad/README.md). Todo sale de `public/spec/<slug>/spec.json`, que escribe Claude como director creativo.
 * Tiempos en SEGUNDOS de la pieza (no hay voz grabada a la que anclarse: el guion se escribe para el video).
 */

/** Punto normalizado 0..1 del cuadro (x, y). Así la misma escena sirve en 16:9 y en 9:16. */
export type Punto = [number, number];

/** Capa que se renderiza. "todo" = BAKED. Las otras se exportan por separado para montar en DaVinci (README §5). */
export type Capa = "todo" | "stage" | "content" | "bloom";

export type Brillo = {
  /** Centro del glow, normalizado. Default: centro. */
  x?: number;
  y?: number;
  /** 0..1.5. Default 1. */
  intensidad?: number;
  /** Default: color de marca. */
  color?: string;
};

/** Tramo del motivo (la línea de luz que viaja por todas las escenas). */
export type TramoLinea = {
  puntos: Punto[];
  /** Puntos para 9:16 si el recorrido cambia con la composición vertical. */
  puntosVertical?: Punto[];
  /** Segundos relativos a la escena. */
  desdeS: number;
  hastaS: number;
  /** Fracción del recorrido visible detrás de la cabeza (cometa). Sin `cola`: queda dibujada entera. */
  cola?: number;
  /** Segundos relativos a la escena en que se apaga. Default: fin de la escena. */
  apagaS?: number;
  grosor?: number;
};

/** Palabra de un texto cinético. `acento`: en color de marca. */
export type Palabra = { t: string; acento?: boolean };
export type LineaTexto = { palabras: Palabra[] | string; serif?: boolean; tamano?: number };
export type TextoCinetico = {
  lineas: LineaTexto[];
  /** Segundos relativos a la escena en que entra la primera palabra. */
  atS: number;
  /** Segundos entre palabras. Default 0.09. */
  pasoS?: number;
  /** Dónde va en 16:9 cuando comparte cuadro con un objeto. Default "centro". */
  lado?: "centro" | "izquierda" | "derecha";
};

export type PantallaTelefono =
  | { tipo: "imagen"; archivo: string }
  | { tipo: "video"; archivo: string; desdeS?: number }
  | {
      tipo: "chat";
      contacto: string;
      hora: string;
      mensajes: { de: "cliente" | "negocio"; texto: string; atS: number; escribeS?: number }[];
      turno?: { etiqueta: string; detalle: string; confirmado: string; atS: number; confirmaS: number };
    };

export type DatosApertura = {
  /** Imagen del logo en public/ (PNG blanco con alfa). Si falta, va `texto`. */
  logo?: string;
  texto?: string;
  /** Segundo (relativo) en que el punto de luz revienta en el logo. */
  revientaS: number;
  bajada?: string;
};

export type DatosDispositivo = {
  pantalla: PantallaTelefono;
  /** Rotación del teléfono en grados [x, y, z] al entrar y al salir: gira despacio entre las dos. */
  giro?: { desde: [number, number, number]; hasta: [number, number, number] };
  /** Lado del teléfono en 16:9. En 9:16 va siempre abajo-centro. */
  lado?: "izquierda" | "centro" | "derecha";
  textos?: TextoCinetico[];
};

export type Tarjeta = {
  titulo: string;
  detalle?: string;
  icono?: Marca;
  imagen?: string;
  /** Muestra un check que se dibuja al entrar. */
  check?: boolean;
  atS: number;
};

export type DatosTarjetas = {
  tarjetas: Tarjeta[];
  textos?: TextoCinetico[];
};

export type DatosFrase = { textos: TextoCinetico[] };

export type DatosPlate = {
  /** Video o imagen generado en Higgsfield, en public/spec/<slug>/plates/. Si falta, se ve el escenario con un aviso en Studio. */
  archivo?: string;
  /** Prompt con el que se genera (o se generó) el plate: queda en el spec como registro. */
  prompt: string;
  modelo?: string;
  /** Empuje de cámara a lo largo de la escena (1.06 = 6 %). */
  empuje?: number;
  /** 0..1, oscurece el plate para que el texto se lea. */
  oscurecer?: number;
  textos?: TextoCinetico[];
};

export type DatosCierre = {
  logo?: string;
  texto?: string;
  bajada?: string;
  /** Segundo (relativo) en que el logo se cierra en una línea y se apaga. */
  apagaS?: number;
};

type Base = {
  /** S01, S02… como en la timeline de DaVinci. */
  id: string;
  nombre: string;
  desdeS: number;
  hastaS: number;
  /** De dónde sale la imagen. Registro de producción: qué es código y qué es generado. */
  origen: "codigo" | "higgsfield" | "katana";
  brillo?: Brillo;
  linea?: TramoLinea[];
  /** Empuje de cámara de la escena (default 1.05). */
  empuje?: number;
};

export type Escena =
  | (Base & { tipo: "apertura"; datos: DatosApertura })
  | (Base & { tipo: "dispositivo"; datos: DatosDispositivo })
  | (Base & { tipo: "tarjetas"; datos: DatosTarjetas })
  | (Base & { tipo: "frase"; datos: DatosFrase })
  | (Base & { tipo: "plate"; datos: DatosPlate })
  | (Base & { tipo: "cierre"; datos: DatosCierre });

export type TipoEscena = Escena["tipo"];

/** Un SFX de la cue sheet. `nombre` = paleta de `SFX_FILES` (el golpe cae en `atS`); `archivo` = cualquier audio en public/. */
export type CueSfx = {
  atS: number;
  nombre?: SfxName;
  archivo?: string;
  volumen?: number;
  categoria: "whoosh" | "ui" | "golpe" | "luz";
  /** Qué acompaña (para la cue sheet). */
  nota: string;
};

/** Una línea de voz en off. Sin `archivo` todavía: el texto queda como guion a grabar. */
export type LineaVoz = { atS: number; texto: string; carril: "A" | "B"; archivo?: string; volumen?: number };

export type Stem = { nombre: string; archivo?: string; desdeS?: number; volumen?: number; nota?: string };

export type Spec = {
  titulo: string;
  /** "spec" = no oficial (marca ajena, portfolio); "cliente" = aprobado por el cliente. */
  tipoPieza: "spec" | "cliente";
  concepto: string;
  motivo: string;
  marca: { nombre: string; color: string; color2?: string; fondo: string; fuente?: "satoshi" | "helvetica" };
  duracionS: number;
  escenas: Escena[];
  voz: LineaVoz[];
  musica: Stem[];
  sfx: CueSfx[];
  /** Cosas a confirmar con Lucas o el cliente (datos de la UI, textos del chat, derechos). */
  pendientes?: string[];
};

export type SpecProps = { slug: string; spec: Spec | null; capa: Capa };
