import type { CSSProperties } from "react";
import { ACCENT } from "../reserva/theme";

/**
 * Degradés para las palabras clave (Lucas, 2026-09-28: "falta añadir gradient a palabras clave, tipo violet, tipo green
 * nexora"). El texto se pinta con el degradé; como `text-shadow` ensucia un texto transparente, la sombra y el halo van
 * como `drop-shadow`.
 */
export type Gradiente = "violeta" | "verde";

const DEGRADE: Record<Gradiente, { fondo: string; halo: string }> = {
  violeta: {
    fondo: "linear-gradient(100deg, #efe3ff 0%, #c084fc 32%, #8b5cf6 62%, #6d28d9 100%)",
    halo: "rgba(139, 92, 246, 0.55)",
  },
  verde: {
    fondo: `linear-gradient(100deg, #d9fbe6 0%, #4ade80 32%, ${ACCENT.green} 62%, ${ACCENT.greenDark} 100%)`,
    halo: "rgba(34, 197, 94, 0.5)",
  },
};

/** Estilo de texto con degradé. `sombra`: la sombra oscura para leerse sobre la cara (subtítulos); `blur`: desenfoque de entrada. */
export const textoGradiente = (g: Gradiente, { sombra = true, blur = 0 }: { sombra?: boolean; blur?: number } = {}): CSSProperties => ({
  backgroundImage: DEGRADE[g].fondo,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
  textShadow: "none",
  filter: [blur > 0 ? `blur(${blur}px)` : "", `drop-shadow(0 0 18px ${DEGRADE[g].halo})`, sombra ? "drop-shadow(0 3px 10px rgba(0,0,0,0.55))" : ""]
    .filter(Boolean)
    .join(" "),
});
