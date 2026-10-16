import type { ReactNode } from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import Sfx from "../reserva/components/sfx";
import { useReservaFonts } from "../reserva/fonts";
import { componenteDe } from "./escenas/registry";
import LineaDeLuz from "./linea-de-luz";
import { SPEC, SpecCtx, useLayout } from "./tema";
import type { Escena, SpecProps } from "./tipos";

/** Cámara de la escena: entra desenfocada frenando, empuja despacio todo el plano, sale acelerando. */
const Marco = ({ escena, primera, ultima, children }: { escena: Escena; primera: boolean; ultima: boolean; children: ReactNode }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { u } = useLayout();
  const ent = primera ? 1 : interpolate(frame, [0, SPEC.entra], [0, 1], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateRight: "clamp" });
  const sal = ultima
    ? 0
    : interpolate(frame, [durationInFrames - SPEC.sale, durationInFrames], [0, 1], {
        easing: Easing.in(Easing.cubic),
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
  const empuje = interpolate(frame, [0, durationInFrames], [1, escena.empuje ?? SPEC.empuje]);
  const escala = empuje * (1.07 - 0.07 * ent) * (1 + 0.05 * sal);
  const blur = (1 - ent) * 22 + sal * 16;
  return (
    <AbsoluteFill
      style={{
        opacity: ent * (1 - sal),
        transform: `scale(${escala})`,
        filter: blur > 0.05 ? `blur(${blur * u}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export default function SpecComposition({ spec, capa }: SpecProps) {
  useReservaFonts();
  const { fps } = useVideoConfig();
  if (!spec) return null;
  const f = (s: number) => Math.round(s * fps);
  const conAudio = capa === "todo";
  return (
    <SpecCtx.Provider value={{ spec, capa }}>
      <AbsoluteFill style={{ background: capa === "content" || capa === "bloom" ? "transparent" : spec.marca.fondo }}>
        {spec.escenas.map((e, i) => {
          const Comp = componenteDe(e);
          const ultima = i === spec.escenas.length - 1;
          const dur = f(e.hastaS - e.desdeS) + (ultima ? 0 : SPEC.solape);
          return (
            <Sequence key={e.id} from={f(e.desdeS)} durationInFrames={dur} name={`${e.id} · ${e.nombre} (${e.origen})`}>
              <Marco escena={e} primera={i === 0} ultima={ultima}>
                <Comp escena={e} />
                {e.linea && capa !== "stage" && <LineaDeLuz tramos={e.linea} finEscenaS={dur / fps} />}
              </Marco>
            </Sequence>
          );
        })}

        {conAudio &&
          spec.sfx.map((c, i) =>
            c.nombre ? (
              <Sfx key={`sfx${i}`} name={c.nombre} at={f(c.atS)} volume={c.volumen ?? 0.35} />
            ) : c.archivo ? (
              <Sequence key={`sfx${i}`} from={f(c.atS)} layout="none" name={`sfx:${c.nota}`} showInTimeline={false}>
                <Audio src={staticFile(c.archivo)} volume={c.volumen ?? 0.35} showInTimeline={false} />
              </Sequence>
            ) : null,
          )}
        {conAudio &&
          spec.voz
            .filter((v) => v.archivo)
            .map((v, i) => (
              <Sequence key={`vo${i}`} from={f(v.atS)} layout="none" name={`VO ${v.carril}: ${v.texto}`}>
                <Audio src={staticFile(v.archivo as string)} volume={v.volumen ?? 1} />
              </Sequence>
            ))}
        {conAudio &&
          spec.musica
            .filter((m) => m.archivo)
            .map((m, i) => (
              <Sequence key={`mu${i}`} from={f(m.desdeS ?? 0)} layout="none" name={`música: ${m.nombre}`}>
                <Audio src={staticFile(m.archivo as string)} volume={m.volumen ?? 0.4} />
              </Sequence>
            ))}
      </AbsoluteFill>
    </SpecCtx.Provider>
  );
}
