export const FPS = 30;
export const ANCHO = 1080;
export const ALTO = 1350;

export type Marca = {
  nombre: string;
  /** Usuario de la red, sin @. */
  usuario: string;
  /** Un solo color de marca, plano. */
  acento: string;
  /** Color del texto sobre el acento (contraste >= 4,5:1). */
  textoAcento: string;
  fondo: string;
  tinta: string;
  tintaSuave: string;
  fuente: string;
};

export type FondoLamina = "base" | "acento" | "oscuro";

type Comun = { fondo?: FondoLamina };

/** Texto con [clave] resaltada en el color de marca. Una clave por lámina. */
export type Lamina = Comun &
  (
    | { tipo: "portada"; titulo: string; bajada?: string }
    | { tipo: "punto"; titulo: string; texto: string }
    | { tipo: "lista"; titulo: string; items: string[] }
    | { tipo: "cifra"; valor: string; leyenda: string }
    | { tipo: "versus"; antes: { etiqueta: string; texto: string }; despues: { etiqueta: string; texto: string } }
    | { tipo: "cierre"; titulo: string; accion: string; pie?: string }
  );

export type Brief = {
  slug: string;
  marca: Marca;
  laminas: Lamina[];
  fuentes?: { familia: string; archivo: string; peso?: number; estilo?: "normal" | "italic" }[];
  /** Solo para el video en bucle. */
  animado?: { segPorLamina: number; transicionS: number };
};

export const ANIMADO_DEFAULT = { segPorLamina: 3.2, transicionS: 0.5 };
