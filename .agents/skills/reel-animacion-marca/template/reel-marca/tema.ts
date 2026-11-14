export const FPS = 30;
export const ANCHO_ANIM = 1920;
export const ALTO_ANIM = 1080;
export const ANCHO_REEL = 1080;
export const ALTO_REEL = 1920;
export const CIERRE_S = 4.5;
export const SOLAPE_F = 10;

export type Marca = {
  nombre: string;
  inicial?: string;
  tagline: string;
  acento: string;
  acento2?: string;
  fondo: string;
  tinta: string;
  tintaSuave: string;
  fuenteTitulo: string;
  fuenteTexto: string;
  fuenteAcento?: string;
};

export type FondoBeat = "base" | "acento" | "oscuro";

export type Notificacion = { titulo: string; detalle?: string; app?: string; hora?: string };
export type Mensaje = { de: "cliente" | "marca"; texto: string };

export type Beat =
  | { tipo: "frase"; texto: string; durS: number; fondo?: FondoBeat; tamano?: number }
  | { tipo: "heroe"; palabra: string; pie: string; durS: number; fondo?: FondoBeat }
  | {
      tipo: "numero";
      valor: number;
      decimales?: number;
      prefijo?: string;
      sufijo?: string;
      etiqueta?: string;
      leyenda: string;
      durS: number;
      fondo?: FondoBeat;
    }
  | { tipo: "lista"; titulo: string; items: string[]; durS: number; fondo?: FondoBeat }
  | {
      tipo: "telefono";
      texto: string;
      lineas: Notificacion[];
      hora?: string;
      fecha?: string;
      lado?: "izq" | "der";
      durS: number;
      fondo?: FondoBeat;
    }
  | { tipo: "chat"; texto?: string; mensajes: Mensaje[]; estado?: string; durS: number; fondo?: FondoBeat }
  | { tipo: "logo"; durS: number; boton?: string; fondo?: FondoBeat };

export type EtiquetaParte = { t: string; pill?: boolean };

export type TipoSonido = "transicion" | "notificacion" | "burbuja" | "numero" | "remate" | "clic" | "logo";

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
