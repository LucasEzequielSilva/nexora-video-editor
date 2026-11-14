import type { CSSProperties } from "react";
import { conCaja, DEGRADE, estiloTipo, PESADA, PRESETS, type PresetNeon, rgb, type Tipografia } from "./tema";

type TextoNeonProps = {
  texto: string;
  /** Cuerpo en px. */
  tamano: number;
  preset: PresetNeon;
  tipo?: Tipografia;
  /** Multiplica el glow (1 = titular; la cifra va más fuerte). */
  fuerza?: number;
  /** 0–1: el glow se enciende al entrar. */
  encendido?: number;
  style?: CSSProperties;
};

/**
 * Texto con degradé vertical (tope claro → base saturada) y glow. Cuatro capas apiladas en la misma celda de grilla: sombra
 * oscura (se lee sobre pared clara), glow ancho, glow ceñido y el relleno con degradé. El glow va en capas propias y no con
 * text-shadow: con background-clip:text Chrome pinta el text-shadow encima del degradé y lo ensucia. El orden va con
 * zIndex explícito: las capas con filter/opacity forman contexto de apilamiento y sin zIndex se pintan ENCIMA del relleno
 * (medido: el naranja salía R≈200 en vez de 255, tapado por la sombra).
 */
export default function TextoNeon({ texto, tamano, preset, tipo = PESADA, fuerza = 1, encendido = 1, style }: TextoNeonProps) {
  const p = PRESETS[preset];
  const t = conCaja(tipo, texto);
  const capa: CSSProperties = { ...estiloTipo(tipo, tamano), gridArea: "1 / 1" };
  const glow = Math.max(0, encendido);
  return (
    <div style={{ display: "inline-grid", isolation: "isolate", ...style }}>
      <span aria-hidden style={{ ...capa, zIndex: 0, color: "rgba(0,0,0,0.5)", filter: `blur(${tamano * 0.05}px)`, transform: `translateY(${tamano * 0.035}px)` }}>
        {t}
      </span>
      <span
        aria-hidden
        style={{ ...capa, zIndex: 1, color: rgb(p.brillo), opacity: Math.min(1, p.intensidad * 0.6 * fuerza) * glow, filter: `blur(${tamano * 0.14 * fuerza}px)` }}
      >
        {t}
      </span>
      <span
        aria-hidden
        style={{ ...capa, zIndex: 2, color: rgb(p.brillo), opacity: Math.min(1, p.intensidad * 0.9 * fuerza) * glow, filter: `blur(${tamano * 0.03}px)` }}
      >
        {t}
      </span>
      <span
        style={{
          ...capa,
          zIndex: 3,
          backgroundImage: `linear-gradient(180deg, ${rgb(p.tope)} ${DEGRADE.tope}%, ${rgb(p.medio)} ${DEGRADE.medio}%, ${rgb(p.base)} ${DEGRADE.base}%)`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        {t}
      </span>
    </div>
  );
}
