import type React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, useCurrentFrame } from "remotion";
import { Sfx, type NombreSfx } from "../../bldrs-estudio-motion/comun";
import { F_GRANDE, F_TEXTO, FPS, MUSICA_INICIO_S, archivo, clamp, lineal } from "../../bldrs-estudio-motion/tema";
import { paso, rebote } from "./piezas";
import { uk } from "./fuentes";
import { useFuentesKit } from "./fuentes";
import { Grilla, inicioContenido, type Acto } from "./grilla";
import { ACTO_ELEVATE } from "./elevate";
import { ACTO_PROPMATCH, Isotipo } from "./propmatch";
import { ACTO_FUTHUB } from "./futhub";
import { ACTO_BLDRS } from "./bldrs";

// "UI kit en movimiento" con los productos de bldrs (ref. @dominikmartn, "fable 5.2 can actually design", 2026-11-10).
// Una grilla bento por app: entra en cascada, cada celda hace su microinteracción y sale para la siguiente app.

export const ACTOS: Acto[] = [ACTO_ELEVATE, ACTO_PROPMATCH, ACTO_FUTHUB, ACTO_BLDRS];

// Lucas (2026-11-10): "sin ponerle música". Quedan solo los clicks de las interacciones.
const CON_MUSICA = false;

const SOLAPE = 8;
export const inicioActo = (k: number) => ACTOS.slice(0, k).reduce((s, a) => s + a.dur - SOLAPE, 0);
const FIN_ACTOS = inicioActo(ACTOS.length) + SOLAPE;
const CIERRE = 100;
export const DURACION_UK = FIN_ACTOS + CIERRE;

const LOGOS = [
  <Img key="e" src={uk("img/elevate-logo.svg")} style={{ height: 50 }} />,
  <Isotipo key="p" alto={58} />,
  <Img key="f" src={uk("img/futhub-logo.png")} style={{ height: 62 }} />,
  <Img key="b" src={archivo("img/logo_builders.svg")} style={{ height: 52 }} />,
];

const Cierre: React.FC = () => {
  const f = useCurrentFrame();
  const fondo = interpolate(f, [0, 10], [0, 1], clamp);
  const palabras = ["Diseñado", "y", "construido", "por", "bldrs."];
  return (
    <AbsoluteFill style={{ background: "#0C0C0E", opacity: fondo, alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <AbsoluteFill style={{ background: "radial-gradient(50% 36% at 50% 50%, rgba(167,139,250,0.14), transparent 70%)" }} />
      <div style={{ display: "flex", gap: 22, marginBottom: 64 }}>
        {LOGOS.map((l, i) => {
          const e = paso(f, 6 + i * 4, 14, rebote);
          return (
            <div key={i} style={{ width: 112, height: 112, borderRadius: 30, background: "#17171B", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.06)", display: "grid", placeItems: "center", opacity: Math.min(1, e), transform: `translateY(${(1 - e) * 30}px) scale(${0.8 + 0.2 * e})` }}>
              {l}
            </div>
          );
        })}
      </div>
      <div style={{ fontFamily: F_GRANDE, fontWeight: 600, fontSize: 92, lineHeight: 1.04, letterSpacing: "-0.02em", color: "#F5F5F7", maxWidth: 860 }}>
        {palabras.map((w, i) => {
          const e = paso(f, 18 + i * 3.5, 14);
          return (
            <span key={i} style={{ display: "inline-block", marginRight: i < palabras.length - 1 ? "0.24em" : 0, opacity: e, transform: `translateY(${(1 - e) * 24}px)`, filter: e < 0.98 ? `blur(${(1 - e) * 8}px)` : undefined }}>
              {w}
            </span>
          );
        })}
      </div>
      <div style={{ marginTop: 34, height: 6, width: 420 * paso(f, 38, 18), borderRadius: 6, background: lineal(90) }} />
      <div style={{ marginTop: 40, fontFamily: F_TEXTO, fontWeight: 600, fontSize: 38, color: "rgba(245,245,247,0.72)", opacity: paso(f, 46, 12) }}>Tu app, en 30 días.</div>
    </AbsoluteFill>
  );
};

export const UiKit: React.FC = () => {
  useFuentesKit();
  return (
    <AbsoluteFill style={{ background: ACTOS[0].tema.fondo }}>
      {ACTOS.map((a, k) => (
        <Sequence key={a.nombre} from={inicioActo(k)} durationInFrames={a.dur} name={a.nombre}>
          <Grilla acto={a} primero={k === 0} />
        </Sequence>
      ))}

      <Sequence from={FIN_ACTOS - SOLAPE} durationInFrames={CIERRE + SOLAPE} name="cierre">
        <Cierre />
      </Sequence>

      {CON_MUSICA ? (
        <Audio
          src={archivo("audio/musica-076.mp3")}
          trimBefore={Math.round(MUSICA_INICIO_S * FPS)}
          volume={(fr) => 0.5 * interpolate(fr, [0, 6, DURACION_UK - 30, DURACION_UK], [0, 1, 1, 0], clamp)}
        />
      ) : null}

      {ACTOS.map((a, k) =>
        a.celdas.flatMap((c, i) =>
          (c.sonidos ?? []).map((s, j) => (
            <Sfx
              key={`${k}-${i}-${j}`}
              nombre={s.nombre as NombreSfx}
              en={Math.round(inicioActo(k) + inicioContenido(c, i, k === 0) + s.en)}
              volumen={s.vol}
            />
          )),
        ),
      )}
      {ACTOS.slice(1).map((a, k) => (
        <Sfx key={`w${k}`} nombre="whoosh-soft" en={inicioActo(k + 1) + 4} volumen={0.2} />
      ))}
      <Sfx nombre="remate" en={FIN_ACTOS - SOLAPE + 18} volumen={0.4} />
    </AbsoluteFill>
  );
};
