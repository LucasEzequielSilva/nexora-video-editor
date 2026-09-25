import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { useReservaFonts } from "../../reserva/fonts";
import CaptionsVertical from "../captions-vertical";
import type { FuenteSubtitulo, RawWord } from "../types";

const FRASE = "Fijate cuántas cosas de tu negocio hoy dependen de que vos estés";

const MUESTRA: RawWord[] = FRASE.split(" ").map((word, i) => ({
  word,
  start: 0.3 + i * 0.3,
  end: 0.3 + i * 0.3 + 0.28,
  p: 1,
}));

const OPCIONES: { fuente: FuenteSubtitulo; etiqueta: string; centroY: number }[] = [
  { fuente: "satoshi", etiqueta: "A · Satoshi Black (la actual)", centroY: 16 },
  { fuente: "helvetica-heavy", etiqueta: "B · Helvetica Neue Heavy", centroY: 38 },
  { fuente: "tactic-black", etiqueta: "C · Tactic Sans Black", centroY: 60 },
  { fuente: "bebas", etiqueta: "D · Bebas Neue (mayúsculas)", centroY: 82 },
];

/** Compara fuentes de subtítulo (mismo patrón: grandes, centrados, tamaños variados) sobre un fotograma real. */
export default function SubtitulosEstilos() {
  useReservaFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <OffthreadVideo
        src={staticFile("piezas/estructura-nexora/video.mp4")}
        trimBefore={750}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      {OPCIONES.map((o) => (
        <AbsoluteFill key={o.fuente}>
          <div
            style={{
              position: "absolute",
              left: 48,
              top: `calc(${o.centroY}% - 170px)`,
              fontFamily: "monospace",
              fontSize: 26,
              color: "rgba(255,255,255,0.75)",
              textShadow: "0 1px 4px rgba(0,0,0,0.8)",
            }}
          >
            {o.etiqueta}
          </div>
          <CaptionsVertical words={MUESTRA} fuente={o.fuente} acentos={["negocio", "vos"]} centroY={o.centroY} />
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
}
