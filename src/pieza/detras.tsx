import type { CSSProperties } from "react";
import { AbsoluteFill, Easing, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import Sfx from "../reserva/components/sfx";
import { ease } from "../reserva/motion";
import { msToFrame, resolverMs } from "./anclas";
import { type Gradiente, textoGradiente } from "./gradientes";
import type { DestelloOverlay, DetrasOverlay, RawWord } from "./types";

/**
 * Estilo Matías Costas (assets/referencias/matias-costas.md, recurso 11): el fondo se va a un degradé oscuro, el que
 * habla (persona.webm, recortado) se achica hacia abajo y la palabra clave queda **detrás de su cabeza**; una segunda
 * línea puede ir **delante**, sobre el pecho. Lucas (2026-09-28): "pondría a Mati en png transparent y cosas así".
 */

const ENTRA = 9;
const SALE = 6;
const SUAVE = Easing.bezier(0.33, 1, 0.68, 1);

const FONDO: Record<Gradiente, string> = {
  verde: "radial-gradient(120% 70% at 50% 18%, #1f6b3f 0%, #0d2a1a 45%, #050b08 100%)",
  violeta: "radial-gradient(120% 70% at 50% 18%, #5b2bb5 0%, #22104a 45%, #07040f 100%)",
};

export type RangoDetras = { from: number; duration: number; escala: number; sinEntrada: boolean };

export const rangoDetras = (o: DetrasOverlay, words: RawWord[]): RangoDetras | null => {
  const desde = resolverMs(o.desde, words);
  const hasta = resolverMs(o.hasta, words);
  if (desde === null || hasta === null) return null;
  const from = msToFrame(desde);
  return {
    from,
    duration: Math.max(ENTRA + SALE, msToFrame(hasta) - from),
    escala: o.escalaPersona ?? 0.72,
    sinEntrada: o.sinEntrada ?? false,
  };
};

/** Cuánto está puesto el bloque (0 fuera, 1 adentro) en el cuadro global `frame`. */
export const presencia = (r: RangoDetras, frame: number) =>
  Math.min(
    r.sinEntrada ? 1 : ease(frame, [r.from, r.from + ENTRA], [0, 1], SUAVE),
    ease(frame, [r.from + r.duration - SALE, r.from + r.duration], [1, 0]),
  );

type Linea = DetrasOverlay["lineas"][number];

const TextoLinea = ({ o, l, en, g, delante }: { o: DetrasOverlay; l: Linea; en: number; g: Gradiente; delante: boolean }) => {
  const frame = useCurrentFrame();
  const t = en <= 0 && o.sinEntrada ? 1 : ease(frame, [en, en + 8], [0, 1], SUAVE);
  const pesada = l.estilo !== "fina";
  const conDegrade = pesada && l.gradiente !== false;
  const estilo: CSSProperties = {
    fontFamily: "'Tactic Sans', system-ui, sans-serif",
    fontWeight: pesada ? 900 : 300,
    fontSize: l.tamano ?? (pesada ? 200 : 62),
    lineHeight: pesada ? 0.9 : 1.15,
    letterSpacing: pesada ? "-0.035em" : "0.02em",
    textTransform: pesada && l.mayusculas !== false ? "uppercase" : "none",
    whiteSpace: "nowrap",
    padding: "0 0.08em",
    color: "#fff",
    ...(conDegrade ? textoGradiente(l.gradiente || g, { sombra: delante }) : {}),
    ...(!conDegrade && delante ? { textShadow: "0 3px 14px rgba(0,0,0,0.7)" } : {}),
  };
  const blur = t < 1 ? `blur(${(1 - t) * 14}px)` : "";
  return (
    <div
      style={{
        ...estilo,
        opacity: t,
        transform: `translateY(${(1 - t) * 40}px) scale(${1.25 - 0.25 * t})`,
        filter: [estilo.filter ?? "", blur].filter(Boolean).join(" ") || undefined,
      }}
    >
      {l.texto}
    </div>
  );
};

const cuesDe = (o: DetrasOverlay, words: RawWord[], from: number) => {
  const cues: Record<string, number> = {};
  for (const [nombre, ancla] of Object.entries(o.cues ?? {})) {
    const ms = resolverMs(ancla, words);
    if (ms !== null) cues[nombre] = msToFrame(ms) - from;
  }
  return cues;
};

const Lineas = ({ o, cues, delante }: { o: DetrasOverlay; cues: Record<string, number>; delante: boolean }) => {
  const g = o.gradiente ?? "verde";
  const lineas = o.lineas.map((l, i) => ({ l, en: cues[l.cue ?? ""] ?? i * 6 })).filter(({ l }) => Boolean(l.delante) === delante);
  if (lineas.length === 0) return null;
  const pos: CSSProperties = delante
    ? { top: `${o.yDelante ?? 68}%`, transform: "translateY(-50%)" }
    : { bottom: `${100 - (o.bajoY ?? 36)}%` };
  return (
    <div style={{ position: "absolute", left: 0, right: 0, ...pos, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      {lineas.map(({ l, en }, i) => (
        <TextoLinea key={i} o={o} l={l} en={en} g={g} delante={delante} />
      ))}
    </div>
  );
};

/** Fondo en degradé + las líneas de atrás. Va entre el video y el recorte (`PersonaDelante`). */
export const DetrasLayer = ({ overlay, words }: { overlay: DetrasOverlay; words: RawWord[] }) => {
  const r = rangoDetras(overlay, words);
  if (!r) return null;
  const cues = cuesDe(overlay, words, r.from);
  const golpe = overlay.lineas.find((l) => l.estilo !== "fina" && !l.delante);
  const golpeEn = golpe ? cues[golpe.cue ?? ""] : undefined;
  const ganancia = overlay.gananciaSfx ?? 1;
  return (
    <Sequence from={r.from} durationInFrames={r.duration} premountFor={30} name="detras">
      <Fondo o={overlay} cues={cues} duracion={r.duration} />
      {ganancia > 0 && !overlay.sinEntrada && <Sfx name="escena-entra" at={0} volume={0.2 * ganancia} />}
      {ganancia > 0 && golpeEn !== undefined && <Sfx name="remate-b" at={golpeEn} volume={0.15 * ganancia} />}
    </Sequence>
  );
};

const Fondo = ({ o, cues, duracion }: { o: DetrasOverlay; cues: Record<string, number>; duracion: number }) => {
  const frame = useCurrentFrame();
  const opacidad = Math.min(o.sinEntrada ? 1 : ease(frame, [0, ENTRA], [0, 1]), ease(frame, [duracion - SALE, duracion], [1, 0]));
  return (
    <AbsoluteFill style={{ opacity: opacidad }}>
      <AbsoluteFill style={{ background: FONDO[o.gradiente ?? "verde"] }} />
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1.4px)",
          backgroundSize: "7px 7px",
          mixBlendMode: "overlay",
        }}
      />
      <Lineas o={o} cues={cues} delante={false} />
    </AbsoluteFill>
  );
};

/** Las líneas `delante`: van arriba del recorte. */
export const DetrasFrente = ({ overlay, words }: { overlay: DetrasOverlay; words: RawWord[] }) => {
  const r = rangoDetras(overlay, words);
  if (!r || !overlay.lineas.some((l) => l.delante)) return null;
  const cues = cuesDe(overlay, words, r.from);
  return (
    <Sequence from={r.from} durationInFrames={r.duration} premountFor={30} name="detras-frente">
      <Frente o={overlay} cues={cues} duracion={r.duration} />
    </Sequence>
  );
};

const Frente = ({ o, cues, duracion }: { o: DetrasOverlay; cues: Record<string, number>; duracion: number }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: ease(frame, [duracion - SALE, duracion], [1, 0]) }}>
      <Lineas o={o} cues={cues} delante />
    </AbsoluteFill>
  );
};

/** Al achicarse se verían los bordes rectos del cuadro original (le cortan los hombros): se funden con el fondo. */
const bordes = (p: number): CSSProperties => {
  const m = `linear-gradient(to right, transparent 0%, #000 ${9 * p}%, #000 ${100 - 9 * p}%, transparent 100%)`;
  return p > 0 ? { maskImage: m, WebkitMaskImage: m } : {};
};

/**
 * El que habla sin fondo (persona.webm, alineado cuadro a cuadro con video.mp4), con el mismo encuadre que el video
 * (`estiloEncuadre`) y achicado hacia abajo mientras dura cada bloque `detras`.
 */
export const PersonaDelante = ({
  slug,
  rangos,
  estiloEncuadre,
}: {
  slug: string;
  rangos: RangoDetras[];
  estiloEncuadre: CSSProperties;
}) => {
  const frame = useCurrentFrame();
  return (
    <>
      {rangos.map((r, i) => {
        const from = Math.max(0, r.from);
        const k = 1 - (1 - r.escala) * presencia(r, frame);
        return (
          <Sequence key={i} from={from} durationInFrames={r.from + r.duration - from} premountFor={30} name="persona">
            <AbsoluteFill style={{ transform: `scale(${k})`, transformOrigin: "50% 100%", ...bordes(presencia(r, frame)) }}>
              <AbsoluteFill style={estiloEncuadre}>
                <OffthreadVideo
                  src={staticFile(`piezas/${slug}/persona.webm`)}
                  trimBefore={from}
                  transparent
                  muted
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </AbsoluteFill>
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </>
  );
};

/** Flash de luz (film burn del pack, fondo negro) en modo `screen`: el pico del destello cae en el ancla. */
export const DestelloLayer = ({ overlay, words }: { overlay: DestelloOverlay; words: RawWord[] }) => {
  const ms = resolverMs(overlay.en, words);
  if (ms === null) return null;
  const pico = msToFrame(ms);
  const from = pico - Math.round(overlay.picoS * 30);
  return (
    <>
      <Sequence from={from} durationInFrames={Math.round(overlay.largoS * 30)} name="destello">
        <AbsoluteFill style={{ mixBlendMode: "screen", opacity: overlay.opacidad ?? 1 }}>
          <OffthreadVideo src={staticFile(overlay.archivo)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </AbsoluteFill>
      </Sequence>
      {overlay.sfx && <Sfx name={overlay.sfx} at={pico} volume={overlay.volumenSfx ?? 0.2} />}
    </>
  );
};
