export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const PAPER = {
  base: "#efefed",
  light: "#fbfbfa",
  shade: "#d9d9d6",
  ink: "#111111",
  inkSoft: "#3a3a3a",
  muted: "#8a8a87",
  line: "#b9b9b5",
  card: "#ffffff",
} as const;

export const ACCENT = {
  green: "#22C55E",
  greenDark: "#15803D",
  greenSoft: "#DCFCE7",
  whatsapp: "#25D366",
  whatsappBubble: "#D9FDD3",
  amber: "#F59E0B",
  /** Línea de tachado retórico (StrikeText) — "esto ya no aplica". */
  red: "#E5484D",
} as const;

export const FONT = {
  sans: "Satoshi, system-ui, sans-serif",
  /** Tipografía grande de impacto (titulares, subtítulos bold, números protagonistas). */
  display: "Satoshi, system-ui, sans-serif",
  serif: "'Instrument Serif', Georgia, serif",
} as const;

export const SHADOW = {
  card: "0 2px 4px rgba(0,0,0,0.06), 0 18px 40px rgba(0,0,0,0.16), 0 40px 90px rgba(0,0,0,0.12)",
  soft: "0 1px 2px rgba(0,0,0,0.06), 0 10px 24px rgba(0,0,0,0.10)",
  lifted: "0 4px 8px rgba(0,0,0,0.08), 0 30px 60px rgba(0,0,0,0.22)",
} as const;

export const SPRING = {
  soft: { damping: 200 },
  pop: { damping: 14, stiffness: 170, mass: 0.8 },
  snappy: { damping: 22, stiffness: 240 },
} as const;

/** Cara de Lucas en el frame original (1920x1080), usada como ancla de zoom y PiP. */
export const FACE = { x: 970, y: 440 } as const;

/** PiP circular de Lucas durante las escenas "full-pip". */
export const PIP = { size: 300, right: 72, bottom: 72, zoom: 0.62, border: 8 } as const;

/** Frames de la transición de entrada/salida de escenas completas. */
export const SCENE_TRANSITION = { enter: 12, exit: 10 } as const;
