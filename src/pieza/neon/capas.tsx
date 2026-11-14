import { Sequence } from "remotion";
import { msToFrame, resolverMs } from "../anclas";
import type { AnclaTiempo, Overlay, RawWord } from "../types";
import Cifra from "./cifra";
import Cita from "./cita";
import Fichas, { type FichaNeon } from "./fichas";
import type { NeonOverlay } from "./tipos";
import TitularNeon from "./titular";

export const esNeon = (o: Overlay): o is NeonOverlay =>
  o.tipo === "titular-neon" || o.tipo === "cifra" || o.tipo === "cita" || o.tipo === "fichas";

/** Frames que ocupa en la pieza, o null si alguna ancla no resuelve. */
export const rangoNeon = (o: NeonOverlay, words: RawWord[]) => {
  const desde = resolverMs(o.desde, words);
  const hasta = resolverMs(o.hasta, words);
  if (desde === null || hasta === null || hasta <= desde) return null;
  const from = msToFrame(desde);
  return { from, duration: Math.max(1, msToFrame(hasta) - from) };
};

/** Resuelve las anclas a frames locales y monta la pieza en su Sequence. Una ficha cuyo cue no resuelve no se muestra. */
export const CapaNeon = ({ overlay: o, words }: { overlay: NeonOverlay; words: RawWord[] }) => {
  const rango = rangoNeon(o, words);
  if (!rango) return null;
  const { from, duration } = rango;
  const local = (cues: Record<string, AnclaTiempo>, cue: string | undefined) => {
    const ancla = cue === undefined ? undefined : cues[cue];
    const ms = ancla ? resolverMs(ancla, words) : null;
    return ms === null ? null : msToFrame(ms) - from;
  };
  const comun = { preset: o.preset, duracion: duration, gananciaSfx: o.gananciaSfx };
  return (
    <Sequence from={from} durationInFrames={duration} name={o.tipo}>
      {o.tipo === "titular-neon" && <TitularNeon {...comun} fina={o.fina} pesada={o.pesada} fuenteFina={o.fuenteFina} centroY={o.centroY} />}
      {o.tipo === "cifra" && (
        <Cifra {...comun} valor={o.valor} arriba={o.arriba} etiqueta={o.etiqueta} fuenteFina={o.fuenteFina} centroY={o.centroY} />
      )}
      {o.tipo === "cita" && <Cita {...comun} texto={o.texto} autor={o.autor} centroY={o.centroY} />}
      {o.tipo === "fichas" && (
        <Fichas
          {...comun}
          titulo={o.titulo}
          lado={o.lado}
          topPct={o.topPct}
          grilla={local(o.cues, o.grilla) ?? undefined}
          fichas={o.fichas.flatMap((f): FichaNeon[] => {
            const en = local(o.cues, f.cue);
            return en === null ? [] : [{ titulo: f.titulo, imagen: f.imagen, marca: f.marca, chips: f.chips, en }];
          })}
        />
      )}
    </Sequence>
  );
};
