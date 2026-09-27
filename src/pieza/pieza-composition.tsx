import { useMemo } from "react";
import { AbsoluteFill, Audio, Easing, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import Sfx from "../reserva/components/sfx";
import { useReservaFonts } from "../reserva/fonts";
import { ease, easeInOut } from "../reserva/motion";
import { msToFrame, resolverMs } from "./anclas";
import { AroLayer, TitularLayer } from "./anuncio";
import CaptionsVertical from "./captions-vertical";
import Musica from "./musica";
import { type CaraCuadro, caraEn, inicioDePlano, suavizarCara } from "./cara";
import { BrollLayer, EscenaLayer, IconoLayer, rangoEscena, StrikeLayer } from "./overlays";
import type { PiezaProps, RawWord, Zoom } from "./types";

const DEFAULT_ORIGIN_Y = 38;
const PUNCH_RAMP = 12;
/** Ease-out cúbico: el zoom out arranca con envión y el recorrido se sigue viendo, no un latigazo. */
const SALIDA = Easing.bezier(0.33, 1, 0.68, 1);
const RAMPA_SUBTITULOS = 6;

const ANCHO = 1080;
const ALTO = 1920;

/**
 * Cámara que calibra todo el tiempo sobre la cara (Lucas: "esa forma de calibrar constantemente en base al movimiento
 * de la cara... re contra hookea"). Medido en assets/referencias/camara-que-sigue-la-cara.mp4 con
 * scripts/analizar-camara.py: los ojos quedan clavados al 27 % del alto (±0.5 %), la cara siempre del mismo tamaño
 * (41 % del ancho, ±3 %) y cada plano nuevo entra ~6 % más abierto y se asienta en ~0.27 s.
 */
const CAMARA = {
  /** Ancho de la cara / ancho del cuadro en el encuadre base. La referencia usa 0.41, pero con fuente de 1080 eso es
   * ampliar ~1.8x todo el tiempo y se ablanda: 0.26 es ~1.12x sobre la cara típica de la pieza (0.23). */
  anchoCara: 0.26,
  /** Límites de la ampliación base (sin los zooms de props.json). El mínimo deja margen para mover el encuadre. */
  escalaBase: [1.08, 1.35] as [number, number],
  /** Donde quedan los ojos (fracción del cuadro). */
  ojos: { x: 0.5, y: 0.3 },
  /** Cada plano nuevo entra más abierto y más abajo y aterriza en su encuadre. */
  asentar: { escala: 0.07, bajada: 0.02, cuadros: 10 },
  /** Tope de la escala total (retrato de los zooms incluido). */
  escalaMax: 2.4,
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Con cara: escala para que la cara tenga siempre el mismo tamaño (por los zooms de props.json) y la lleva a los ojos de CAMARA, sin mostrar bordes. */
const encuadre = (factorZoom: number, cara: CaraCuadro | null, frame: number, cortes: number[], originY: number) => {
  if (!cara) return { transform: `scale(${factorZoom})`, transformOrigin: `50% ${originY}%` };
  const base = clamp((CAMARA.anchoCara * ANCHO) / cara.ancho, ...CAMARA.escalaBase);
  const t = ease(frame - inicioDePlano(cortes, frame), [0, CAMARA.asentar.cuadros], [0, 1], SALIDA);
  const scale = clamp(base * factorZoom * (1 - CAMARA.asentar.escala * (1 - t)), 1, CAMARA.escalaMax);
  const ox = clamp(CAMARA.ojos.x * ANCHO - scale * cara.x, ANCHO * (1 - scale), 0);
  const oy = clamp((CAMARA.ojos.y + CAMARA.asentar.bajada * (1 - t)) * ALTO - scale * cara.y, ALTO * (1 - scale), 0);
  return { transform: `translate(${ox}px, ${oy}px) scale(${scale})`, transformOrigin: "0 0" };
};

type ZoomResuelto = { zoom: Zoom; start: number; end: number };

const resolverZooms = (zooms: Zoom[], words: RawWord[], totalFrames: number): ZoomResuelto[] =>
  zooms.flatMap((zoom) => {
    const inicio = resolverMs(zoom.inicio, words);
    const fin = zoom.fin === "fin" ? (totalFrames / 30) * 1000 : resolverMs(zoom.fin, words);
    return inicio === null || fin === null ? [] : [{ zoom, start: msToFrame(inicio), end: msToFrame(fin) }];
  });

const zoomAt = (frame: number, zooms: ZoomResuelto[]): { scale: number; originY: number } => {
  let scale = 1;
  let originY = DEFAULT_ORIGIN_Y;
  for (const { zoom, start, end } of zooms) {
    if (frame < start || frame >= end) continue;
    let factor: number;
    if (zoom.tipo === "suave") {
      const rango: [number, number] = [zoom.escalaInicial ?? 1, zoom.escala];
      factor = zoom.curva === "salida" ? ease(frame, [start, end], rango, SALIDA) : easeInOut(frame, [start, end], rango);
    } else {
      const entra = zoom.rampa ?? PUNCH_RAMP;
      const sale = zoom.rampaSalida ?? entra;
      const amount = Math.min(
        easeInOut(frame, [start, start + entra]),
        sale === 0 ? 1 : easeInOut(frame, [end - sale, end], [1, 0]),
      );
      factor = 1 + (zoom.escala - 1) * amount;
    }
    scale *= factor;
    if (zoom.origenY !== undefined && factor > 1.001) originY = zoom.origenY;
  }
  return { scale, originY };
};

export default function PiezaComposition({ slug, config, words, cara }: PiezaProps) {
  useReservaFonts();
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const zooms = useMemo(() => (config ? resolverZooms(config.zooms, words, durationInFrames) : []), [config, words, durationInFrames]);
  const caraSuave = useMemo(() => (cara ? suavizarCara(cara) : { cuadros: [], cortes: [] }), [cara]);
  const escenasSinSubtitulos = useMemo(
    () =>
      (config?.overlays ?? []).flatMap((o) => {
        if (o.tipo !== "escena" || o.subtitulos) return [];
        const r = rangoEscena(o, words, durationInFrames);
        return r ? [r] : [];
      }),
    [config, words, durationInFrames],
  );
  if (!config) return null;

  const { scale, originY } = zoomAt(frame, zooms);
  const overlays = config.overlays;
  const tapados = escenasSinSubtitulos.reduce((acc, r) => {
    const fin = r.from + r.duration;
    const sale = fin >= durationInFrames - 1 ? 1 : ease(frame, [fin - RAMPA_SUBTITULOS, fin], [1, 0]);
    return Math.max(acc, Math.min(ease(frame, [r.from, r.from + RAMPA_SUBTITULOS]), sale));
  }, 0);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={encuadre(scale, caraEn(caraSuave.cuadros, frame), frame, caraSuave.cortes, originY)}>
        <OffthreadVideo src={staticFile(`piezas/${slug}/video.mp4`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      {overlays.map((o, i) => (o.tipo === "broll" ? <BrollLayer key={`b${i}`} overlay={o} words={words} /> : null))}
      {overlays.map((o, i) => {
        if (o.tipo === "aro") return <AroLayer key={`a${i}`} overlay={o} words={words} totalFrames={durationInFrames} />;
        if (o.tipo === "titular") return <TitularLayer key={`t${i}`} overlay={o} words={words} />;
        return null;
      })}
      {overlays.map((o, i) =>
        o.tipo === "escena" ? (
          <EscenaLayer key={`e${i}`} overlay={o} words={words} slug={slug} totalFrames={durationInFrames} cara={caraSuave.cuadros} />
        ) : null,
      )}
      {overlays.map((o, i) => {
        if (o.tipo === "strike") return <StrikeLayer key={`s${i}`} overlay={o} words={words} />;
        if (o.tipo === "icono") return <IconoLayer key={`i${i}`} overlay={o} words={words} />;
        return null;
      })}
      {config.musica && <Musica musica={config.musica} words={words} />}
      {(config.sfx ?? []).map((cue, i) => {
        const ms = resolverMs(cue, words);
        const corte = cue.corte ? resolverMs(cue.corte, words) : null;
        if (ms === null) return null;
        if ("archivo" in cue) {
          return (
            <Sequence
              key={i}
              from={msToFrame(ms)}
              durationInFrames={Math.max(1, (corte === null ? durationInFrames : msToFrame(corte)) - msToFrame(ms))}
              name="audio"
            >
              <Audio src={staticFile(cue.archivo)} volume={cue.volumen ?? 1} />
            </Sequence>
          );
        }
        return <Sfx key={i} name={cue.nombre} at={msToFrame(ms)} volume={cue.volumen ?? 0.3} cutAt={corte === null ? undefined : msToFrame(corte)} />;
      })}
      <AbsoluteFill style={{ opacity: 1 - tapados }}>
        <CaptionsVertical
          words={words}
          fuente={config.subtitulos?.fuente}
          acentos={config.subtitulos?.acentos}
          estilo={config.subtitulos?.estilo}
          centroY={config.subtitulos?.estilo === "anuncio" ? 55 : undefined}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
