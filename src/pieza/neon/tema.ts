import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { useDelayRender } from "remotion";
import { useReservaFonts } from "../../reserva/fonts";
import { FONT } from "../../reserva/theme";

/**
 * Familia "neón" (referencia assets/referencias/matias-costas.md, Lucas 2026-09-27: "Tactic Sans Black, más una delgada
 * para contrastar, más el gradient"): texto pesado con degradé vertical y glow, sobre el plano de la cara.
 */

/** naranja (default), violeta y azul; alerta (rojo) y plata (verde) para dolores y plata, como en la referencia. */
export type PresetNeon = "naranja" | "violeta" | "azul" | "alerta" | "plata";
/** Línea fina de contraste: Tactic Sans Light / Thin, o Instrument Serif itálica. */
export type FuenteFina = "light" | "thin" | "serif";

type Rgb = readonly [number, number, number];

export type Preset = {
  /** Degradé vertical del texto pesado, de arriba abajo: tope claro, medio y base saturada. */
  tope: Rgb;
  medio: Rgb;
  base: Rgb;
  brillo: Rgb;
  /** Opacidad del glow (0–1). El naranja va más bajo: sobre la piel un glow naranja fuerte la tiñe. */
  intensidad: number;
};

export const PRESETS: Record<PresetNeon, Preset> = {
  naranja: { tope: [255, 236, 172], medio: [255, 170, 60], base: [255, 78, 16], brillo: [255, 104, 30], intensidad: 0.5 },
  violeta: { tope: [240, 222, 255], medio: [190, 130, 255], base: [132, 52, 255], brillo: [150, 76, 255], intensidad: 0.75 },
  azul: { tope: [214, 240, 255], medio: [110, 175, 255], base: [36, 96, 255], brillo: [56, 128, 255], intensidad: 0.7 },
  alerta: { tope: [255, 214, 222], medio: [255, 110, 140], base: [240, 24, 68], brillo: [255, 44, 88], intensidad: 0.7 },
  plata: { tope: [228, 255, 210], medio: [120, 245, 140], base: [22, 196, 76], brillo: [56, 255, 110], intensidad: 0.7 },
};

/**
 * Paradas del degradé dentro del renglón (line-height 1). En Tactic Sans las mayúsculas van del 11 % al 81 % del renglón
 * (medido con fontTools: ascenso 0.814, descenso 0.186, altura de mayúscula 0.7): el degradé recorre exactamente eso.
 */
export const DEGRADE = { tope: 12, medio: 46, base: 80 } as const;

export const rgb = ([r, g, b]: Rgb) => `rgb(${r}, ${g}, ${b})`;
export const rgba = ([r, g, b]: Rgb, a: number) => `rgba(${r}, ${g}, ${b}, ${a})`;

export type Tipografia = { familia: string; peso: number; italica?: boolean; mayusculas?: boolean; /** em */ tracking?: number };

const TACTIC = "'Tactic Sans', system-ui, sans-serif";

export const PESADA: Tipografia = { familia: TACTIC, peso: 900, mayusculas: true };
export const FINA: Record<FuenteFina, Tipografia> = {
  light: { familia: TACTIC, peso: 300, mayusculas: true, tracking: 0.06 },
  thin: { familia: TACTIC, peso: 100, mayusculas: true, tracking: 0.06 },
  serif: { familia: FONT.serif, peso: 400, italica: true, tracking: -0.01 },
};
export const COMILLAS: Tipografia = { familia: FONT.serif, peso: 400 };
export const CITA: Tipografia = { familia: FONT.serif, peso: 400, italica: true, tracking: -0.01 };
export const CHIP: Tipografia = { familia: FONT.sans, peso: 700, tracking: -0.01 };

export const conCaja = (t: Tipografia, texto: string) => (t.mayusculas ? texto.toLocaleUpperCase("es") : texto);

export const estiloTipo = (t: Tipografia, tamano: number): CSSProperties => ({
  fontFamily: t.familia,
  fontWeight: t.peso,
  fontStyle: t.italica ? "italic" : "normal",
  fontSize: tamano,
  letterSpacing: `${t.tracking ?? 0}em`,
  lineHeight: 1,
  whiteSpace: "pre",
});

/** Sombra para texto blanco sobre video (sin caja, como los subtítulos). */
export const SOMBRA_TEXTO = "0 2px 14px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.5)";

/**
 * Zona segura de Reels/TikTok en 1080x1920 (PACKS/ZONA SEGURA/Margen seguro.png): arriba 212, abajo 1548, izquierda 50,
 * derecha 1028; debajo de y 1118 la columna de botones corre el borde derecho a 920.
 */
export const ZONA = { arriba: 212, abajo: 1548, izquierda: 50, derecha: 1028, derechaBajo: 920, yBotones: 1118 } as const;
const AIRE = 24;

/** Ancho máximo de un bloque centrado en x = 540 cuyo borde de abajo cae en `yAbajo`. */
export const anchoCentrado = (yAbajo: number) =>
  2 * ((yAbajo > ZONA.yBotones ? ZONA.derechaBajo : ZONA.derecha) - 540 - AIRE);

/** Tamaño para que un texto de `anchoPorPx` (ancho medido a 1 px de cuerpo) entre en `anchoMax`, sin pasar `tamanoMax`. */
export const ajustar = (anchoPorPx: number, anchoMax: number, tamanoMax: number) =>
  Math.min(tamanoMax, anchoMax / Math.max(anchoPorPx, 1e-6));

const MEDIDA = 100;
const fuenteCanvas = (t: Tipografia) => `${t.italica ? "italic " : ""}${t.peso} ${MEDIDA}px ${t.familia}`;
const A_CARGAR: Tipografia[] = [PESADA, FINA.light, FINA.thin, FINA.serif, COMILLAS, CHIP];

type Pedido = { texto: string; tipo: Tipografia };

/**
 * Ancho de cada texto a 1 px de cuerpo (con su caja y su tracking), medido con canvas recién cuando las fuentes están
 * cargadas: medir con la de reemplazo da otro ancho y el texto se corta. Espera una sola vez (como editorial/titular).
 */
export const useAnchos = (pedidos: Pedido[]): number[] | null => {
  useReservaFonts();
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() => delayRender("Cargando las fuentes del neón"));
  const [listas, setListas] = useState(false);
  const clave = pedidos.map((p) => `${fuenteCanvas(p.tipo)}|${p.tipo.tracking ?? 0}|${conCaja(p.tipo, p.texto)}`).join("\n");

  useEffect(() => {
    let vigente = true;
    Promise.all(A_CARGAR.map((t) => document.fonts.load(fuenteCanvas(t))))
      .then((caras) => {
        if (caras.some((c) => c.length === 0)) {
          throw new Error("Neón: Tactic Sans, Instrument Serif o Satoshi no están registradas (useReservaFonts)");
        }
        if (vigente) setListas(true);
        continueRender(handle);
      })
      .catch((err: unknown) => cancelRender(err));
    return () => {
      vigente = false;
    };
  }, []);

  // De `pedidos` solo importan el texto y la tipografía, que ya están en `clave`.
  return useMemo(() => {
    if (!listas) return null;
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) throw new Error("Neón: no hay contexto 2d para medir el texto");
    return pedidos.map(({ texto, tipo }) => {
      ctx.font = fuenteCanvas(tipo);
      const t = conCaja(tipo, texto);
      return ctx.measureText(t).width / MEDIDA + (tipo.tracking ?? 0) * [...t].length;
    });
  }, [clave, listas]);
};
