import { Easing } from "remotion";
import { ACCENT, FONT } from "../../reserva/theme";

/*
 * Estilo editorial (assets/referencias/estilo-editorial.md) con las decisiones de Lucas del 2026-09-24: acento verde
 * Nexora en vez del violeta, gris frío liso con cruces fijas, remate en Helvetica Neue Bold.
 * Tiempos en frames a 30 fps; "fr N" es el frame de la referencia.
 */

/** Medido #D2D6DC–#E2E7EB en la tarjeta: lo que varía es la luz del envoltorio, no el gris. */
export const FONDO = {
  base: "#DCE0E5",
  /** Banda en arco detrás del héroe (f-064). */
  banda: "#A6A9AD",
  /** Anillo tenue (f-100). */
  anillo: "#D0D5D9",
  /** Cruces de registro, en el centro del trazo: los brazos se desvanecen hacia las puntas. */
  cruz: "#6C7075",
} as const;

export const TINTA = {
  /** Remate, y bajada de las líneas que terminan en acento (B2/B3). Núcleo medido #0A0A0E–#0E1015. */
  plena: "#0C0E12",
  /** Bajada cuando el remate va solo en negro (B4–B6): así el remate pesa más. */
  gris: "#3A3E42",
  /** De dónde arranca el color de una palabra al revelarse (M1: de gris claro a tinta). A ojo, no está medido. */
  arranque: "#ABAFB4",
} as const;

export const ACENTO = {
  /** El verde que se lee como texto sobre gris claro. El logo de WhatsApp es el único otro color de la imagen. */
  relleno: ACCENT.greenDark,
  /** greenDark aclarado ~68 % hacia blanco: la misma relación que la lavanda #CDAFDA con el violeta #65296F. */
  arranque: "#B4D6C1",
} as const;

export const FUENTE = {
  bajada: FONT.serif,
  /** useReservaFonts carga 'Helvetica Neue' 700/800/900. */
  remate: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  pesoRemate: 700,
} as const;

/** Van en `filter`. Siempre abajo-derecha: SHADOW.card (centrada) no va en este estilo. Valores de T6/T7 sin validar en stills. */
export const SOMBRA = {
  pesada: "drop-shadow(14px 18px 22px rgba(20,24,28,0.45)) drop-shadow(30px 40px 70px rgba(20,24,28,0.18))",
  /** Marco doble. */
  suave: "drop-shadow(8px 10px 18px rgba(0,0,0,0.15))",
  /** Recorte de persona delante de su cuadro. */
  recorte: "drop-shadow(18px 22px 30px rgba(20,24,28,0.35))",
} as const;

/** Casi imperceptible (≤4 % en 3–5 px hacia abajo, f-101, f-146). El halo claro de la referencia es compresión: no va. */
export const SOMBRA_TEXTO = "0 3px 6px rgba(0,0,0,0.08)";

/** Foto en B/N (T7): `filtro` en la imagen y `trama` en una capa encima con `mezcla`. Sin probar en stills. */
export const BN = {
  filtro: "grayscale(1) contrast(1.25)",
  trama: "repeating-linear-gradient(45deg, rgba(0,0,0,0.15) 0 1.5px, transparent 1.5px 5px)",
  mezcla: "multiply",
} as const;

/**
 * Curva de las entradas de texto (M1, M2, T3): las duraciones de abajo son el tiempo hasta el estado final. Con el out-expo
 * default de ease() todo quedaba asentado a la mitad (el remate a 1,7 px en f=6 en vez de 9–14).
 */
export const CURVA = Easing.out(Easing.cubic);

/** M1, revelado de palabra de la bajada. */
export const PALABRA = {
  /** Solo si no hay ancla: en Nexora cada palabra va a su `start` de words.json. Moda 5 fr (He 1 · never 6 · raised 11 · his 16). */
  cadencia: 5,
  /** El cierre va más lento, 10–13 fr (remembers fr304 → ~318). */
  cadenciaCierre: 12,
  /** Legible en 6–8 fr. */
  opacidad: 8,
  /** Blur mayormente horizontal, resuelto en 5–8 fr. */
  blur: 8,
  blurPx: 10,
  /** Color pleno con cola larga, 16–24 fr (Loyalty fr104 → ~120; They fr257 → ~281). */
  color: 20,
  /** Corrimiento propio máximo; la dirección no es concluyente. */
  corrimientoPx: 12,
} as const;

/** M2, entrada del remate, y del acento cuando va en la misma línea. */
export const REMATE = {
  /** Remate solo en su línea: +7 a +10 fr después de la última palabra (voice +7, weakness +10, empire +8, Godfather +7). */
  despues: 8,
  /** Se asienta en 9–14 fr (weakness fr183 → ~196; Godfather fr274 → ~285). */
  asienta: 12,
  /** Llega desde la derecha: +35–75 px (weakness 25–32 px de tarjeta ≈ 58–74 px). */
  desdeXPx: 60,
  /** Estela horizontal (T2), de ~28 px a 0. */
  estelaPx: 28,
  /** El acento en línea llega con la cadencia normal, +5–6 fr (silent fr77, currency fr141)... */
  acentoDespues: 5,
  /** ...y pasa de ACENTO.arranque a ACENTO.relleno en 16–20 fr (silent fr80 → 96; currency fr143 → 159). */
  acentoColor: 18,
} as const;

/** Cámara de la escena (M4–M6, T4). */
export const ESCENA = {
  /** Asentamiento expo-out, p = 1 - exp(-f / tau) (retrato fr0 → 40: −52, −26, −18… ~1 px). */
  tau: 10,
  /** Deriva que queda hasta la salida: nunca quieta, ~0,5–1 px/fr. */
  derivaPx: 0.75,
  /** Remate nítido → arranca la salida: 0–10 fr, típico ~4 (B3: 0; B4: ~10). */
  hold: 4,
  /** Salida ease-in; el corte cae en su último frame, que va nítido (T2 fr88–99; T4 fr204–216). */
  salida: 11,
  /** Blur-in de la escena entrante, 10–12 fr (fr100 → 112; fr162 → 174; fr217 → 230). */
  blurIn: 11,
  /** σ del blur de escena completa en cortes verticales o de escala: ≈25–30 px. */
  blurInPx: 28,
  /** Primera palabra del beat siguiente: +1 a +4 fr desde el primer frame de la escena ('Loyalty' fr104; 'They' fr257). */
  primeraPalabra: 3,
  /** Push-in de entrada: arranca a esta escala y llega a 1,00 en ~24 fr (M8, B4 fr162 → 186). */
  pushDesde: 0.84,
  /** Pull-back de entrada, 1,28 → 1,00 → 0,98 (M9, diario fr298 → 347 → 370). */
  pullDesde: 1.28,
  /** Hacia dónde sigue alejándose el pull-back después de pasar por 1,00. */
  pullFondo: 0.97,
  /** Pull-back del cierre, 1,28 → 1,00 (diario fr298 → 347). */
  asientaCierre: 48,
} as const;
