import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import Sfx from "../reserva/components/sfx";
import { ease, springAt } from "../reserva/motion";
import { FONT, FPS, SPRING } from "../reserva/theme";
import { msToFrame, resolverMs } from "./anclas";
import type { AroOverlay, RawWord, TitularOverlay } from "./types";

/**
 * Piezas del estilo "anuncio" (referencia assets/referencias/anuncio-2026-09-27.mp4, Lucas 2026-09-27: "copiá este
 * estilo visual para que nos quede de template"): titular arriba de la cabeza y aro luminoso sobre la cara.
 */

const COLORES = {
  azul: { relleno: "#2a3dff", borde: "rgba(190,205,255,0.95)", brillo: "rgba(50,80,255,0.95)", brillo2: "rgba(40,70,255,0.55)" },
  rosa: { relleno: "#ff4d73", borde: "rgba(255,225,232,0.95)", brillo: "rgba(255,70,110,0.95)", brillo2: "rgba(255,60,100,0.5)" },
  blanco: { relleno: "#ffffff", borde: "rgba(255,255,255,0)", brillo: "rgba(255,255,255,0.55)", brillo2: "rgba(0,0,0,0.35)" },
} as const;

const entrada = (frame: number, at: number, dur = 8) => {
  const t = ease(frame, [at, at + dur]);
  return {
    opacity: ease(frame, [at, at + dur * 0.6]),
    transform: `scale(${1.1 - 0.1 * t})`,
    filter: t < 0.999 ? `blur(${(1 - t) * 14}px)` : undefined,
  };
};

const Titular = ({ overlay, duracion, abajoEn }: { overlay: TitularOverlay; duracion: number; abajoEn: number }) => {
  const frame = useCurrentFrame();
  const c = COLORES[overlay.color ?? "azul"];
  const sale = ease(frame, [duracion - 6, duracion], [1, 0]);
  const flote = Math.sin(frame / 26) * 3;
  const grande = overlay.corchetes ? `[${overlay.grande}]` : overlay.grande;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: sale, filter: sale < 0.999 ? `blur(${(1 - sale) * 10}px)` : undefined }}>
      <div
        style={{
          position: "absolute",
          left: 40,
          right: 40,
          top: `${overlay.centroY ?? 12}%`,
          transform: `translateY(calc(-50% + ${flote}px))`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {overlay.arriba && (
          <div
            style={{
              fontFamily: FONT.sans,
              fontWeight: 600,
              fontSize: 46,
              letterSpacing: "-0.01em",
              color: "#ffffff",
              textShadow: "0 2px 12px rgba(0,0,0,0.45)",
              marginBottom: -6,
              ...entrada(frame, 0),
            }}
          >
            {overlay.arriba}
          </div>
        )}
        <div
          style={{
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            fontWeight: 800,
            fontSize: grande.length > 9 ? 120 : 170,
            lineHeight: 1,
            letterSpacing: "0.03em",
            color: c.relleno,
            WebkitTextStroke: `3px ${c.borde}`,
            textShadow: `0 0 18px ${c.brillo}, 0 0 46px ${c.brillo2}, 0 6px 24px rgba(0,0,0,0.25)`,
            whiteSpace: "nowrap",
            ...entrada(frame, overlay.arriba ? 3 : 0, 9),
          }}
        >
          {grande}
        </div>
        {overlay.abajo && (
          <div
            style={{
              alignSelf: "flex-end",
              marginRight: 120,
              marginTop: -4,
              fontFamily: FONT.serif,
              fontStyle: "italic",
              fontSize: 56,
              color: "#ffffff",
              textShadow: "0 2px 12px rgba(0,0,0,0.5)",
              ...entrada(frame, abajoEn, 10),
            }}
          >
            {overlay.abajo}
          </div>
        )}
      </div>
      <Sfx name="pop-b" at={Math.max(2, overlay.arriba ? 5 : 2)} volume={0.12} />
    </AbsoluteFill>
  );
};

export const TitularLayer = ({ overlay, words }: { overlay: TitularOverlay; words: RawWord[] }) => {
  const desde = resolverMs(overlay.desde, words);
  const hasta = resolverMs(overlay.hasta, words);
  if (desde === null || hasta === null || hasta <= desde) return null;
  const from = msToFrame(desde);
  const abajo = overlay.abajoEn ? resolverMs(overlay.abajoEn, words) : null;
  const abajoEn = abajo === null ? Math.round(0.4 * FPS) + 3 : Math.max(0, msToFrame(abajo) - from);
  return (
    <Sequence from={from} durationInFrames={Math.max(1, msToFrame(hasta) - from)} name="titular">
      <Titular overlay={overlay} duracion={Math.max(1, msToFrame(hasta) - from)} abajoEn={abajoEn} />
    </Sequence>
  );
};

/** Aro blanco con brillo que flota arriba a la derecha (en la referencia está sobre la cara todo el tiempo). */
const Aro = ({ duracion }: { duracion: number }) => {
  const frame = useCurrentFrame();
  const entra = springAt(frame, 0, SPRING.soft);
  const sale = ease(frame, [duracion - 6, duracion], [1, 0]);
  const x = Math.sin(frame / 40) * 10;
  const y = Math.cos(frame / 52) * 8;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          right: 70 - x,
          top: 60 + y,
          width: 250,
          height: 250,
          borderRadius: "50%",
          border: "16px solid rgba(255,255,255,0.92)",
          boxShadow: "0 0 26px rgba(255,255,255,0.75), inset 0 0 22px rgba(255,255,255,0.55)",
          filter: "blur(1.5px)",
          opacity: entra * sale * 0.9,
          transform: `scale(${0.85 + 0.15 * entra}) rotateX(${Math.sin(frame / 60) * 12}deg)`,
        }}
      />
    </AbsoluteFill>
  );
};

export const AroLayer = ({ overlay, words, totalFrames }: { overlay: AroOverlay; words: RawWord[]; totalFrames: number }) => {
  const desde = resolverMs(overlay.desde, words);
  const hasta = overlay.hasta === "fin" ? (totalFrames / FPS) * 1000 : resolverMs(overlay.hasta, words);
  if (desde === null || hasta === null || hasta <= desde) return null;
  const from = msToFrame(desde);
  const dur = Math.max(1, Math.min(totalFrames, msToFrame(hasta)) - from);
  return (
    <Sequence from={from} durationInFrames={dur} name="aro">
      <Aro duracion={dur} />
    </Sequence>
  );
};
