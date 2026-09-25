import { createContext, useContext } from "react";
import { PAPER, SHADOW } from "../../reserva/theme";

/** Fondo de la escena. Lucas (2026-09-25): "ir rotando de white screen a black screen". */
export type TemaEscena = "blanco" | "negro";

export type Tinta = {
  tinta: string;
  tintaSuave: string;
  tarjeta: string;
  tarjetaBorde: string;
  sombraTarjeta: string;
  pista: string;
};

export const TINTAS: Record<TemaEscena, Tinta> = {
  blanco: {
    tinta: PAPER.ink,
    tintaSuave: PAPER.inkSoft,
    tarjeta: PAPER.card,
    tarjetaBorde: "rgba(0,0,0,0.04)",
    sombraTarjeta: SHADOW.card,
    pista: "#f1f1ee",
  },
  negro: {
    tinta: "#f5f5f3",
    tintaSuave: "#a9a9a5",
    tarjeta: "#171717",
    tarjetaBorde: "rgba(255,255,255,0.07)",
    sombraTarjeta: "0 2px 4px rgba(0,0,0,0.5), 0 24px 60px rgba(0,0,0,0.6)",
    pista: "#262626",
  },
};

export const TemaContext = createContext<TemaEscena>("blanco");

export const useTinta = (): Tinta & { tema: TemaEscena } => {
  const tema = useContext(TemaContext);
  return { ...TINTAS[tema], tema };
};
