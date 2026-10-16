import { AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Content, Stage } from "../capas";
import Notificacion from "../notificacion";
import { useLayout, useSpec } from "../tema";
import Texto from "../texto";
import type { DatosHeroe, Escena } from "../tipos";

/** Plano héroe generado (el objeto 3D, la "caja" del aviso de Amazon) a pantalla completa, con texto y notificación. */
export default function Heroe({ escena }: { escena: Escena & { datos: DatosHeroe } }) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { vertical, u } = useLayout();
  const { spec } = useSpec();
  const d = escena.datos;
  const esc = interpolate(frame, [0, durationInFrames], [1, d.empuje ?? 1.04]);
  const finS = durationInFrames / fps;
  return (
    <>
      <Stage>
        <AbsoluteFill style={{ background: spec.marca.fondo, transform: `scale(${esc})` }}>
          <OffthreadVideo src={staticFile(d.archivo)} muted trimBefore={Math.round((d.desdeS ?? 0) * fps)} playbackRate={d.velocidad ?? 1} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </AbsoluteFill>
      </Stage>
      <Content bloom={0.3}>
        {d.notificacion && <Notificacion n={d.notificacion} icono={spec.marca.icono} />}
        {(d.textos ?? []).map((tx, i) => {
          const sig = d.textos?.[i + 1];
          return (
            <div key={i} style={{ position: "absolute", left: 0, right: 0, bottom: (vertical ? 200 : 34) * u }}>
              <Texto texto={{ ...tx, lado: "centro" }} hastaS={sig ? sig.atS : finS + 1} tamanoBase={vertical ? 84 : 80} />
            </div>
          );
        })}
      </Content>
    </>
  );
}
