import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import Sfx from "../reserva/components/sfx";
import { FPS } from "../reserva/theme";
import { msToFrame, resolverMs } from "./anclas";
import type { GlitchIaOverlay, RawWord } from "./types";

/**
 * Salto con glitch entre la toma real y una versión generada con IA del mismo tramo (Lucas, 2026-10-05: "me haría tipo
 * en un consultorio con ropa médica y que haya como un glitch de eso para generar retención"). La versión IA es una
 * edición de video (Higgsfield, `scripts/higgsfield.py`) que conserva movimiento y boca, así que se puede saltar en
 * cualquier cuadro. Va adentro del encuadre de la cámara: sigue los mismos zooms que el video.
 */

/** Cuadros de glitch a cada lado de un salto. */
const MEDIO = 4;
const BANDAS = 14;

const azar = (f: number, i: number, k: number) => {
  const x = Math.sin(f * 127.1 + i * 311.7 + k * 74.7) * 43758.5453;
  return x - Math.floor(x);
};

const Video = ({ src, trimBefore, dx = 0 }: { src: string; trimBefore: number; dx?: number }) => (
  <OffthreadVideo
    src={staticFile(src)}
    trimBefore={Math.max(0, trimBefore)}
    muted
    style={{ width: "100%", height: "100%", objectFit: "cover", transform: dx ? `translateX(${dx}px)` : undefined }}
  />
);

/** p = cuánto de la IA se ve (0 real, 1 IA). En el medio del salto las franjas se corren más. */
const Mezcla = ({ real, ia, f, p }: { real: { src: string; trim: number }; ia: { src: string; trim: number }; f: number; p: number }) => {
  const fuerza = 1 - Math.abs(2 * p - 1);
  const cortes = [0, ...Array.from({ length: BANDAS - 1 }, (_, i) => (i + 1 + (azar(f, i, 9) - 0.5) * 0.8) / BANDAS), 1];
  return (
    <AbsoluteFill style={{ filter: `contrast(${1 + 0.35 * fuerza}) saturate(${1 + 0.5 * fuerza})` }}>
      {cortes.slice(0, -1).map((y0, i) => {
        const y1 = cortes[i + 1];
        const esIa = azar(f, i, 1) < p;
        const dx = (azar(f, i, 2) - 0.5) * 140 * fuerza;
        const tinte = azar(f, i, 3) < 0.18 * fuerza ? (azar(f, i, 4) < 0.5 ? "#ff2bd6" : "#00f0ff") : null;
        return (
          <AbsoluteFill key={i} style={{ clipPath: `inset(${(y0 * 100).toFixed(2)}% 0 ${((1 - y1) * 100).toFixed(2)}% 0)` }}>
            <Video src={esIa ? ia.src : real.src} trimBefore={esIa ? ia.trim : real.trim} dx={dx} />
            {tinte && <AbsoluteFill style={{ background: tinte, mixBlendMode: "screen", opacity: 0.35 }} />}
          </AbsoluteFill>
        );
      })}
      {azar(f, 99, 5) < 0.4 * fuerza && <AbsoluteFill style={{ background: "#fff", opacity: 0.12 + 0.15 * azar(f, 99, 6) }} />}
    </AbsoluteFill>
  );
};

const Tramo = ({ desde, largo, realSrc, iaSrc, iaTrim }: { desde: number; largo: number; realSrc: string; iaSrc: string; iaTrim: number }) => {
  const lf = useCurrentFrame();
  const f = desde + lf;
  const real = { src: realSrc, trim: desde };
  const ia = { src: iaSrc, trim: iaTrim };
  const entra = lf < 2 * MEDIO;
  const sale = lf >= largo - 2 * MEDIO;
  if (!entra && !sale) return <Video src={iaSrc} trimBefore={iaTrim} />;
  const p = entra ? (lf + 1) / (2 * MEDIO + 1) : (largo - lf) / (2 * MEDIO + 1);
  return <Mezcla real={real} ia={ia} f={f} p={p} />;
};

/** Va adentro del AbsoluteFill con el encuadre de la cámara, encima del video de la pieza. */
export const CapaGlitchIa = ({ overlay, words, slug }: { overlay: GlitchIaOverlay; words: RawWord[]; slug: string }) => {
  const ancla = resolverMs(overlay.ancla, words);
  if (ancla === null) return null;
  // Segundo del clip IA que corresponde al cuadro 0 de la pieza.
  const corrimiento = overlay.anclaFuenteS - ancla / 1000;
  return (
    <>
      {overlay.tramos.map((t, i) => {
        const a = resolverMs(t.desde, words);
        const b = resolverMs(t.hasta, words);
        if (a === null || b === null) return null;
        const desde = msToFrame(a) - MEDIO;
        const largo = msToFrame(b) - msToFrame(a) + 2 * MEDIO;
        return (
          <Sequence key={i} from={desde} durationInFrames={largo} name="glitch-ia" premountFor={15}>
            <Tramo
              desde={desde}
              largo={largo}
              realSrc={`piezas/${slug}/video.mp4`}
              iaSrc={overlay.archivo}
              iaTrim={Math.round((corrimiento + desde / FPS) * FPS)}
            />
          </Sequence>
        );
      })}
    </>
  );
};

/** Los golpes de glitch, afuera del encuadre (el audio no se transforma). */
export const SonidoGlitchIa = ({ overlay, words }: { overlay: GlitchIaOverlay; words: RawWord[] }) => (
  <>
    {overlay.tramos.flatMap((t, i) =>
      [t.desde, t.hasta].map((x, k) => {
        const ms = resolverMs(x, words);
        return ms === null ? null : (
          <Sfx key={`${i}-${k}`} name={k === 0 ? "glitch" : "glitch-b"} at={msToFrame(ms)} volume={overlay.volumenSfx ?? 0.25} />
        );
      }),
    )}
  </>
);
