export const FPS = 30;
export const ANCHO_ANIM = 1920;
export const ALTO_ANIM = 1080;
export const ANCHO_REEL = 1080;
export const ALTO_REEL = 1920;
export const CIERRE_S = 4.5;

export type Marca = {
  nombre: string;
  tagline: string;
  /** Un solo color de marca, plano. Si no se lee sobre `fondo` (contraste < 3), la palabra clave va resaltada con marcador. */
  acento: string;
  /** Fondo claro de la marca. */
  fondo: string;
  tinta: string;
  tintaSuave: string;
  fuenteTitulo: string;
  fuenteTexto: string;
  /** Logo real: ruta dentro de public/ (SVG o PNG). Sin logo se arma uno tipográfico con el nombre. */
  logo?: string;
};

export type FondoBeat = "base" | "acento" | "oscuro";

export type Notificacion = { titulo: string; detalle?: string; app?: string; hora?: string };
export type Mensaje = { de: "cliente" | "marca"; texto: string };
/** `dia` = índice en `dias`; `hora` = "HH:MM". */
export type Turno = { dia: number; hora: string; nombre: string; detalle?: string };

/**
 * Cómo ENTRA el beat (la transición desde el anterior). Cada una tiene un motivo:
 * fundido = cambio de tema sin relación espacial · corte = golpe seco en el pulso ·
 * empuje = avanzar en la historia (el nuevo empuja desde la derecha) ·
 * zoom = entrar al objeto del beat anterior (teléfono → chat) ·
 * expande = el objeto del beat anterior crece hasta ser la pantalla nueva.
 */
export type Transicion = "fundido" | "corte" | "empuje" | "zoom" | "expande";

type Comun = { durS: number; fondo?: FondoBeat; transicion?: Transicion };

export type Beat = Comun &
  (
    | { tipo: "frase"; texto: string; tamano?: number }
    | { tipo: "heroe"; palabra: string; pie: string }
    | {
        tipo: "numero";
        valor: number;
        decimales?: number;
        prefijo?: string;
        sufijo?: string;
        etiqueta?: string;
        leyenda: string;
      }
    | { tipo: "lista"; titulo: string; items: string[] }
    | {
        tipo: "telefono";
        texto: string;
        lineas: Notificacion[];
        hora?: string;
        fecha?: string;
        lado?: "izq" | "der";
      }
    | {
        tipo: "chat";
        texto?: string;
        mensajes: Mensaje[];
        /** Nombre arriba del chat (el negocio). Default: la marca. */
        contacto?: string;
        /** Hora que muestran las burbujas. */
        hora?: string;
      }
    | {
        tipo: "agenda";
        texto?: string;
        mes?: string;
        dias: string[];
        turnos: Turno[];
        desdeHora?: number;
        hastaHora?: number;
      }
    | { tipo: "logo"; boton?: string }
  );

export type EtiquetaParte = { t: string; pill?: boolean };

export type TipoSonido = "transicion" | "notificacion" | "burbuja" | "turno" | "numero" | "remate" | "clic" | "logo";

export type SonidoAuto = { archivo: string; volumen: number; golpeS?: number };

export type Brief = {
  slug: string;
  marca: Marca;
  beats: Beat[];
  etiqueta: EtiquetaParte[][];
  cta: { palabra: string; pie: string };
  fuentes?: { familia: string; archivo: string; peso?: number; estilo?: "normal" | "italic" }[];
  audio?: {
    musica?: { archivo: string; volumen: number; desdeS?: number };
    auto?: Partial<Record<TipoSonido, SonidoAuto>>;
    duck?: number;
    sfx?: { archivo: string; beat: number; offsetS?: number; golpeS?: number; volumen: number }[];
  };
};
