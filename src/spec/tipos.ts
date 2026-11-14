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
  | {
      tipo: "imagen";
      archivo: string;
      /** Ancho/alto de la captura (las del prototipo PropMatch: 402/874). Default: el del teléfono del editor. */
      aspecto?: number;
    }
  | { tipo: "video"; archivo: string; desdeS?: number }
  /** Captura de una web app (el CRM) dentro de una ventana de navegador. `aspecto` = ancho/alto de la captura. */
  | { tipo: "web"; archivo: string; aspecto?: number; url?: string }
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
  /** Alto del logo en u (default 150). */
  tamano?: number;
};

export type DatosDispositivo = {
  pantalla: PantallaTelefono;
  /** Rotación del teléfono en grados [x, y, z] al entrar y al salir: gira despacio entre las dos. */
  giro?: { desde: [number, number, number]; hasta: [number, number, number] };
  /** Lado del teléfono en 16:9. En 9:16 va siempre abajo-centro. */
  lado?: "izquierda" | "centro" | "derecha";
  textos?: TextoCinetico[];
  /** Acercamiento de cámara a una zona de la pantalla (foco normalizado sobre la pantalla). */
  zoom?: { desdeS: number; hastaS: number; escala: number; foco: Punto };
  /** Onda de voz con el degradé al costado del teléfono (dictado). */
  onda?: { atS: number; hastaS: number };
  /** Texto dictado que se tipea en vivo debajo de la onda. */
  dictado?: { atS: number; texto: string; pasoS?: number };
  /** Borde de luz con el degradé que se dibuja alrededor del teléfono al entrar (la línea del motivo "entra" al celular). */
  borde?: { desdeS: number; hastaS: number };
  /** Notificación tipo iOS que cae desde arriba. */
  notificacion?: Notificacion;
};

export type Notificacion = { atS: number; titulo: string; texto: string; hastaS?: number };

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

export type DatosHeroe = {
  /** Video del objeto héroe (plate de Higgsfield) a pantalla completa, con texto encima. */
  archivo: string;
  /** Segundo del video desde el que arranca. */
  desdeS?: number;
  velocidad?: number;
  empuje?: number;
  notificacion?: Notificacion;
  textos?: TextoCinetico[];
};

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

export type PinMapa = {
  /** Posición normalizada sobre el cuadro; `xv`/`yv` para 9:16. */
  x: number;
  y: number;
  xv?: number;
  yv?: number;
  atS: number;
  tipo: "propiedad" | "persona";
  titulo: string;
  detalle?: string;
};

export type DatosMapa = {
  /** Video (plate de Higgsfield) o imagen de fondo; `archivoVertical` para 9:16. */
  archivo: string;
  archivoVertical?: string;
  /** Velocidad del plate (< 1 lo estira cuando la escena dura más que el video generado). */
  velocidad?: number;
  empuje?: number;
  oscurecer?: number;
  pines: PinMapa[];
  /** Chip de match que salta sobre un pin. */
  match?: { texto: string; atS: number; pin: number };
  notificacion?: Notificacion;
  textos?: TextoCinetico[];
};

export type Kpi = { valor: number; formato?: "entero" | "usd" | "usdM"; etiqueta: string; sub?: string };
export type DatosTablero = {
  /** Captura del CRM para la ventana de navegador (establishing shot). */
  ventana: string;
  /** Segundo (relativo) en que la ventana pasa al fondo (desenfocada) y salen los KPIs. */
  kpisS: number;
  kpis: Kpi[];
  textos?: TextoCinetico[];
};

export type DatosFicha = {
  fotos: string[];
  titulo: string;
  precio: number;
  ambientes: string;
  superficie: string;
  zona: string;
  boton: string;
  botonDespues: string;
  /** Segundo (relativo) en que se aprieta el botón. */
  presionaS: number;
  textos?: TextoCinetico[];
};

export type CanalPublicacion = { canal: "mercadolibre" | "facebook" | "instagram" | "whatsapp" | "propmatch"; nombre: string; estado: string; atS: number };
export type DatosCanales = {
  ficha: { foto: string; titulo: string; precio: string; zona: string };
  canales: CanalPublicacion[];
  logos: { mercadolibre: string; propmatch: string };
  textos?: TextoCinetico[];
};

export type DatosDictado = {
  /** Lo que dicta el martillero: se tipea en vivo. */
  transcripcion: string;
  atS: number;
  /** Campos que se completan solos, cada uno en su segundo. */
  campos: { etiqueta: string; valor: string; atS: number }[];
  listoS: number;
  textos?: TextoCinetico[];
};

export type DatosPrecio = {
  contexto: string;
  sugerido: number;
  rango: [number, number];
  escala: [number, number];
  comparables: string;
  m2: string;
  atS: number;
  textos?: TextoCinetico[];
};

export type DatosContactos = {
  titulo: string;
  resumen: string;
  filas: { inicial: string; color: string; nombre: string; detalle: string; match: number; atS: number }[];
  textos?: TextoCinetico[];
};

export type DatosCierre = {
  logo?: string;
  texto?: string;
  bajada?: string;
  /** Segundo (relativo) en que el logo se cierra en una línea y se apaga. */
  apagaS?: number;
  /** Alto del logo en u (default 140). */
  tamano?: number;
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
  | (Base & { tipo: "mapa"; datos: DatosMapa })
  | (Base & { tipo: "heroe"; datos: DatosHeroe })
  | (Base & { tipo: "tablero"; datos: DatosTablero })
  | (Base & { tipo: "ficha"; datos: DatosFicha })
  | (Base & { tipo: "canales"; datos: DatosCanales })
  | (Base & { tipo: "dictado"; datos: DatosDictado })
  | (Base & { tipo: "precio"; datos: DatosPrecio })
  | (Base & { tipo: "contactos"; datos: DatosContactos })
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

export type Stem = {
  nombre: string;
  archivo?: string;
  desdeS?: number;
  volumen?: number;
  /** Automatización de volumen: puntos (segundo de la pieza, volumen) interpolados linealmente. Gana sobre `volumen`. */
  curva?: { atS: number; v: number }[];
  nota?: string;
};

export type Spec = {
  titulo: string;
  /** "spec" = no oficial (marca ajena, portfolio); "cliente" = aprobado por el cliente. */
  tipoPieza: "spec" | "cliente";
  concepto: string;
  motivo: string;
  marca: {
    nombre: string;
    color: string;
    color2?: string;
    fondo: string;
    fuente?: "satoshi" | "helvetica";
    /** Familia CSS propia de la marca (se carga de `fuentes`). Gana sobre `fuente`. */
    familia?: string;
    fuentes?: { archivo: string; peso: number }[];
    /** Degradé de marca: la línea de luz y las palabras acentuadas lo usan en vez del color plano. */
    degradado?: string[];
    /** "mayus": titulares en mayúsculas 900 apretadas (el estilo de la UI de PropMatch). */
    titulos?: "mayus";
    /** Ícono de app (notificaciones). */
    icono?: string;
  };
  duracionS: number;
  escenas: Escena[];
  voz: LineaVoz[];
  musica: Stem[];
  sfx: CueSfx[];
  luces?: CapaLuz[];
  /** Textura de ambiente (bokeh generado) sumada en screen sobre el escenario de todas las escenas. */
  ambiente?: { archivo: string; opacidad: number };
  /** Cosas a confirmar con Lucas o el cliente (datos de la UI, textos del chat, derechos). */
  pendientes?: string[];
};

/** Capa de luz generada (trazo, destellos) que se suma en `screen` sobre las escenas: el hook y las transiciones. */
export type CapaLuz = { archivo: string; desdeS: number; hastaS: number; opacidad?: number; velocidad?: number };

export type SpecProps = { slug: string; spec: Spec | null; capa: Capa };
