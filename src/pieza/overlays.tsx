import { AbsoluteFill, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import Sfx from "../reserva/components/sfx";
import StrikeText from "../reserva/components/strike-text";
import { ease, lerp, springAt } from "../reserva/motion";
import { ACCENT, FPS, SHADOW, SPRING } from "../reserva/theme";
import { msToFrame, resolverMs } from "./anclas";
import type { CaraCuadro } from "./cara";
import { ContenidoEscena, MarcoEscena, Recorte, SonidoEscena } from "./escenas/marco";
import LogoApp from "./marca";
import Objeto3D from "./objeto-3d";
import type { BrollOverlay, EscenaOverlay, IconoOverlay, RawWord, StrikeOverlay } from "./types";

type Rango = { from: number; duration: number };

type ItemTachado = { text?: string; imagen?: string; at: number; strikeDelay?: number };

const STRIKE_DELAY = 14;
const TAM_ICONO_TACHADO = 380;

/** Ícono que entra con pop, lo cruza una línea roja y queda apagado: "esto no". */
const IconoTachado = ({ item, tam }: { item: ItemTachado & { imagen: string }; tam: number }) => {
  const frame = useCurrentFrame();
  const pop = springAt(frame, item.at, SPRING.pop);
  const inicioTrazo = item.at + (item.strikeDelay ?? STRIKE_DELAY);
  const trazo = ease(frame, [inicioTrazo, inicioTrazo + 8]);
  const apagado = ease(frame, [inicioTrazo + 4, inicioTrazo + 16]);
  return (
    <div
      style={{
        position: "relative",
        width: tam,
        height: tam,
        opacity: Math.min(1, pop * 2),
        transform: `scale(${lerp(0.4, 1, pop)}) rotate(${lerp(-12, 0, pop)}deg)`,
      }}
    >
      <Sfx name="pop" at={item.at} volume={0.2} />
      <Sfx name={item.at % 2 === 0 ? "tachado" : "tachado-b"} at={inicioTrazo} volume={0.04} />
      <Img
        src={staticFile(item.imagen)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          filter: `drop-shadow(0 22px 36px rgba(0,0,0,0.35)) grayscale(${apagado * 0.75}) brightness(${1 - apagado * 0.2})`,
        }}
      />
      {/* El giro va en el contenedor (centro del ícono) y el trazo crece de izquierda a derecha adentro: la línea cruza por el medio. */}
      <div style={{ position: "absolute", left: -tam * 0.08, right: -tam * 0.08, top: "50%", height: 0, transform: "rotate(-20deg)" }}>
        <div
          style={{
            height: tam * 0.065,
            marginTop: -tam * 0.0325,
            background: ACCENT.red,
            borderRadius: 999,
            transform: `scaleX(${trazo})`,
            transformOrigin: "left center",
            boxShadow: `0 0 ${tam * 0.08}px ${ACCENT.red}88, 0 4px 10px rgba(0,0,0,0.3)`,
          }}
        />
      </div>
    </div>
  );
};

const StrikeInner = ({ overlay, items, duration }: { overlay: StrikeOverlay; items: ItemTachado[]; duration: number }) => {
  const frame = useCurrentFrame();
  const fade = ease(frame, [duration - 8, duration], [1, 0]);
  const palabras = items.flatMap((p) => (p.text ? [{ text: p.text, at: p.at, strikeDelay: p.strikeDelay }] : []));
  const iconos = items.filter((p): p is ItemTachado & { imagen: string } => Boolean(p.imagen));
  const tam = overlay.size ?? TAM_ICONO_TACHADO;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: fade }}>
      {palabras.length > 0 && (
        <>
          {palabras.map((p) => (
            <Sfx key={p.text} name="pop" at={p.at} volume={0.22} />
          ))}
          <StrikeText
            words={palabras}
            size={overlay.size ?? 92}
            color="#ffffff"
            style={{
              position: "absolute",
              left: 40,
              right: 40,
              top: `${overlay.topPct ?? 56}%`,
              textShadow: "0 3px 20px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.5)",
            }}
          />
        </>
      )}
      {iconos.length > 0 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: `${overlay.topPct ?? 70}%`,
            marginTop: -tam / 2,
            display: "flex",
            justifyContent: "center",
            gap: tam * 0.2,
          }}
        >
          {iconos.map((p) => (
            <IconoTachado key={p.imagen} item={p} tam={tam} />
          ))}
        </div>
      )}
    </AbsoluteFill>
  );
};

export const StrikeLayer = ({ overlay, words }: { overlay: StrikeOverlay; words: RawWord[] }) => {
  const resueltas = overlay.palabras
    .map((p) => ({ p, ms: resolverMs(p.en, words) }))
    .filter((x): x is { p: StrikeOverlay["palabras"][number]; ms: number } => x.ms !== null);
  const hasta = resolverMs(overlay.hasta, words);
  if (resueltas.length === 0 || hasta === null) return null;
  const from = Math.min(...resueltas.map((x) => msToFrame(x.ms))) - 3;
  const duration = Math.max(1, msToFrame(hasta) - from);
  const items = resueltas.map(({ p, ms }) => ({ text: p.text, imagen: p.imagen, at: msToFrame(ms) - from, strikeDelay: p.strikeDelay }));
  return (
    <Sequence from={from} durationInFrames={duration} name="strike">
      <StrikeInner overlay={overlay} items={items} duration={duration} />
    </Sequence>
  );
};

const BrollInner = ({ overlay, duration }: { overlay: BrollOverlay; duration: number }) => {
  const frame = useCurrentFrame();
  const visible = Math.min(ease(frame, [0, 6]), ease(frame, [duration - 6, duration], [1, 0]));
  const push = interpolate(frame, [0, duration], [1.02, overlay.zoom ?? 1.1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: visible }}>
      <Sfx name={overlay.sfx ?? "corte-broll"} at={4} volume={overlay.volumenSfx ?? 0.2} />
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <OffthreadVideo
          src={staticFile(overlay.archivo)}
          trimBefore={Math.round((overlay.inicioS ?? 0) * FPS)}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "rgba(0,0,0,0.22)" }} />
    </AbsoluteFill>
  );
};

export const BrollLayer = ({ overlay, words }: { overlay: BrollOverlay; words: RawWord[] }) => {
  const desde = resolverMs(overlay.desde, words);
  const hasta = resolverMs(overlay.hasta, words);
  if (desde === null || hasta === null) return null;
  const from = msToFrame(desde);
  const duration = Math.max(1, msToFrame(hasta) - from);
  return (
    <Sequence from={from} durationInFrames={duration} name={`broll:${overlay.archivo}`}>
      <BrollInner overlay={overlay} duration={duration} />
    </Sequence>
  );
};

const IconoInner = ({ overlay, duration }: { overlay: IconoOverlay; duration: number }) => {
  const frame = useCurrentFrame();
  const size = overlay.tamano ?? 300;
  const pop = springAt(frame, 0, SPRING.pop);
  const exit = ease(frame, [duration - 8, duration], [1, 0]);
  const float = Math.sin(frame / 12) * 6;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Sfx name={overlay.sfx ?? "pop-b"} at={2} volume={overlay.volumenSfx ?? 0.055} />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: `${overlay.centroY ?? 74}%`,
          width: size,
          height: size,
          marginLeft: -size / 2,
          marginTop: -size / 2,
          opacity: Math.min(1, pop * 2) * exit,
          transform: `translateY(${float}px) scale(${lerp(0.4, 1, pop) * lerp(1, 0.92, 1 - exit)}) rotate(${lerp(-10, 0, pop)}deg)`,
          filter: "drop-shadow(0 24px 40px rgba(0,0,0,0.35))",
        }}
      >
        {overlay.modelo ? (
          <Objeto3D archivo={overlay.modelo} lado={size} inclinacion={overlay.inclinacion} giro={0.25} />
        ) : overlay.marca ? (
          <LogoApp marca={overlay.marca} size={size} style={{ boxShadow: SHADOW.lifted }} />
        ) : overlay.imagen ? (
          <Img src={staticFile(overlay.imagen)} style={{ width: size, height: size, objectFit: "contain" }} />
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

export const IconoLayer = ({ overlay, words }: { overlay: IconoOverlay; words: RawWord[] }) => {
  const at = resolverMs(overlay.en, words);
  if (at === null) return null;
  const from = Math.max(0, msToFrame(at) - 2);
  const duration = msToFrame(overlay.duracionMs ?? 1400);
  return (
    <Sequence from={from} durationInFrames={duration} name="icono">
      <IconoInner overlay={overlay} duration={duration} />
    </Sequence>
  );
};

/** Frames que ocupa una escena en la pieza, o null si alguna ancla no resuelve. */
export const rangoEscena = (overlay: EscenaOverlay, words: RawWord[], totalFrames: number): Rango | null => {
  const desde = resolverMs(overlay.desde, words);
  const hasta = overlay.hasta === "fin" ? (totalFrames / FPS) * 1000 : resolverMs(overlay.hasta, words);
  if (desde === null || hasta === null) return null;
  const from = msToFrame(desde);
  return { from, duration: Math.max(1, Math.min(totalFrames, msToFrame(hasta)) - from) };
};

export const EscenaLayer = ({
  overlay,
  words,
  slug,
  totalFrames,
  cara,
}: {
  overlay: EscenaOverlay;
  words: RawWord[];
  slug: string;
  totalFrames: number;
  cara: (CaraCuadro | null)[];
}) => {
  const rango = rangoEscena(overlay, words, totalFrames);
  if (!rango) return null;
  const { from, duration } = rango;
  const llegaAlFinal = from + duration >= totalFrames - 1;
  const cues: Record<string, number> = {};
  for (const [nombre, ancla] of Object.entries(overlay.cues ?? {})) {
    const ms = resolverMs(ancla, words);
    if (ms !== null) cues[nombre] = msToFrame(ms) - from;
  }
  const pip = overlay.pip ?? "abajo-izquierda";
  return (
    <Sequence from={from} durationInFrames={duration} premountFor={30} name={`escena:${overlay.escena}`}>
      <MarcoEscena durationInFrames={duration} desdeFrame={from} seed={overlay.seed} tema={overlay.tema} llegaAlFinal={llegaAlFinal}>
        <ContenidoEscena escena={overlay.escena} durationInFrames={duration} cues={cues} datos={overlay.datos} />
        {pip !== "ninguno" && (
          <Recorte
            videoSrc={`piezas/${slug}/persona.webm`}
            desdeFrame={from}
            durationInFrames={duration}
            posicion={pip}
            cara={cara}
            llegaAlFinal={llegaAlFinal}
          />
        )}
      </MarcoEscena>
      <SonidoEscena durationInFrames={duration} llegaAlFinal={llegaAlFinal} ganancia={overlay.gananciaSfx} />
    </Sequence>
  );
};
