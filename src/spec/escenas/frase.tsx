import { AbsoluteFill, useVideoConfig } from "remotion";
import { Content, Escenario, Stage } from "../capas";
import { useLayout } from "../tema";
import Texto from "../texto";
import type { DatosFrase, Escena } from "../tipos";

/** Tagline / frase grande sola sobre el escenario. Cada texto reemplaza al anterior. */
export default function Frase({ escena }: { escena: Escena & { datos: DatosFrase } }) {
  const { fps, durationInFrames } = useVideoConfig();
  const { vertical, u } = useLayout();
  const finS = durationInFrames / fps;
  return (
    <>
      <Stage>
        <Escenario brillo={escena.brillo} />
      </Stage>
      <Content bloom={0.45}>
        {escena.datos.textos.map((tx, i) => {
          const sig = escena.datos.textos[i + 1];
          return (
            <AbsoluteFill key={i} style={{ alignItems: "center", justifyContent: "center", padding: 80 * u }}>
              <Texto texto={{ ...tx, lado: "centro" }} hastaS={sig ? sig.atS : finS + 1} tamanoBase={vertical ? 120 : 132} />
            </AbsoluteFill>
          );
        })}
      </Content>
    </>
  );
}
