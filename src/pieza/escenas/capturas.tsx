import { Img, staticFile, useCurrentFrame } from "remotion";
import Sfx from "../../reserva/components/sfx";
import { ease } from "../../reserva/motion";
import { FONT } from "../../reserva/theme";
import type { EscenaPreview, EscenaProps } from "./tipos";

/**
 * Capturas de pantalla apiladas que pasan con desenfoque de movimiento (estilo anuncio, referencia
 * assets/referencias/anuncio-2026-09-27.mp4: el calendario lleno de reuniones). Entran rápido y frenan; se pueden
 * rotular con etiquetas tipo sticker ("como estos") en sus cues. Sin `imagenes` dibuja un calendario semanal de maqueta.
 */
export type Datos = {
  /** Rutas en public/ (capturas reales). Si falta, se dibuja el calendario de maqueta. */
  imagenes?: string[];
  etiquetas?: { texto: string; cue: string }[];
  /** Cuántas tarjetas de calendario de maqueta (default 4). */
  maquetas?: number;
};

export const PREVIEW: EscenaPreview<Datos> = {
  durationInFrames: 90,
  sinRecorte: true,
  cues: { a: 30, b: 56 },
  datos: { etiquetas: [{ texto: "como estos", cue: "a" }, { texto: "por acá", cue: "b" }] },
};

const TARJETA = { ancho: 820, alto: 440, gap: 60 };
const COLORES = ["#4f8ef7", "#4f8ef7", "#4f8ef7", "#8e44ec", "#e0445c"];

/** Semana de calendario de maqueta: 7 columnas, franjas horarias y bloques de color (sin marca ni textos legibles). */
const Calendario = ({ semilla }: { semilla: number }) => {
  const color = COLORES[semilla % COLORES.length];
  const bloques = Array.from({ length: 22 }, (_, i) => {
    const k = (i * 7919 + semilla * 104729) % 9973;
    return { col: k % 7, fila: (k >> 3) % 9, alto: 1 + ((k >> 5) % 2) };
  });
  return (
    <div style={{ position: "absolute", inset: 0, background: "#ffffff", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ height: 44, borderBottom: "1px solid #e6e8ec", display: "flex", alignItems: "center", gap: 10, padding: "0 18px" }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 70 + i * 20, height: 10, borderRadius: 5, background: "#e9ebef" }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: 50, right: 0, top: 44, bottom: 0, display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
        {Array.from({ length: 7 }, (_, c) => (
          <div key={c} style={{ borderLeft: "1px solid #eef0f3", position: "relative" }}>
            {bloques
              .filter((b) => b.col === c)
              .map((b, j) => (
                <div
                  key={j}
                  style={{
                    position: "absolute",
                    left: 4,
                    right: 4,
                    top: 8 + b.fila * 42,
                    height: 38 * b.alto,
                    borderRadius: 5,
                    background: color,
                    opacity: 0.9,
                    padding: "5px 6px",
                  }}
                >
                  <div style={{ width: "70%", height: 6, borderRadius: 3, background: "rgba(255,255,255,0.85)" }} />
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Capturas({ durationInFrames, cues, datos }: EscenaProps<Datos>) {
  const frame = useCurrentFrame();
  const n = datos.imagenes?.length ?? datos.maquetas ?? 4;
  const paso = TARJETA.alto + TARJETA.gap;
  // Entra rápido desde abajo (con estela) y frena en un desplazamiento lento.
  const rapido = ease(frame, [0, 14]);
  const recorrido = (1 - rapido) * 1400 + (frame / Math.max(1, durationInFrames)) * Math.max(0, n * paso - 1100);
  const velocidad = Math.abs((1 - ease(frame + 1, [0, 14])) * 1400 - (1 - rapido) * 1400);
  const estela = Math.min(22, velocidad * 0.12);

  return (
    <>
      <div style={{ position: "absolute", left: 130, top: 360 - recorrido, width: TARJETA.ancho, filter: estela > 0.5 ? `blur(${estela}px)` : undefined }}>
        {Array.from({ length: n }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: i * paso,
              width: TARJETA.ancho,
              height: TARJETA.alto,
              borderRadius: 14,
              boxShadow: "0 18px 50px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.08)",
              transform: `rotate(${i % 2 ? 1.2 : -1.2}deg)`,
              overflow: "hidden",
              background: "#fff",
            }}
          >
            {datos.imagenes ? (
              <Img src={staticFile(datos.imagenes[i])} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <Calendario semilla={i} />
            )}
          </div>
        ))}
      </div>
      {(datos.etiquetas ?? []).map((e) => {
        const at = cues[e.cue] ?? 0;
        const t = ease(frame, [at, at + 8]);
        return (
          <div
            key={e.cue}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 900,
              textAlign: "center",
              fontFamily: FONT.sans,
              fontWeight: 700,
              fontSize: 64,
              letterSpacing: "-0.02em",
              color: "#111111",
              WebkitTextStroke: "12px #ffffff",
              paintOrder: "stroke fill",
              opacity: t * (frame < (cues[datos.etiquetas?.[datos.etiquetas.indexOf(e) + 1]?.cue ?? ""] ?? Infinity) ? 1 : 0),
              transform: `scale(${1.2 - 0.2 * t})`,
              filter: `drop-shadow(0 6px 14px rgba(0,0,0,0.25))${t < 0.999 ? ` blur(${(1 - t) * 8}px)` : ""}`,
            }}
          >
            {e.texto}
          </div>
        );
      })}
      <Sfx name="whoosh-short" at={2} volume={0.12} />
    </>
  );
}
