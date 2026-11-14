import { AbsoluteFill, Img, OffthreadVideo, getRemotionEnvironment, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Content, Escenario, Stage } from "../capas";
import { useLayout } from "../tema";
import Texto from "../texto";
import type { DatosPlate, Escena } from "../tipos";

const esVideo = (f: string) => /\.(mp4|mov|webm)$/i.test(f);

/**
 * Plano generado en Higgsfield (ambiente, objeto, momento aspiracional) como STAGE, con empuje de cámara y texto encima.
 * Si el plate todavía no se generó, queda el escenario y, solo en Studio, un aviso con el prompt pendiente.
 */
export default function Plate({ escena }: { escena: Escena & { datos: DatosPlate } }) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { u, vertical } = useLayout();
  const d = escena.datos;
  const esc = interpolate(frame, [0, durationInFrames], [1, d.empuje ?? 1.08]);
  const finS = durationInFrames / fps;
  return (
    <>
      <Stage>
        {d.archivo ? (
          <AbsoluteFill style={{ transform: `scale(${esc})` }}>
            {esVideo(d.archivo) ? (
              <OffthreadVideo src={staticFile(d.archivo)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <Img src={staticFile(d.archivo)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            )}
            <AbsoluteFill style={{ background: `rgba(0,0,0,${d.oscurecer ?? 0.35})` }} />
            <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)" }} />
          </AbsoluteFill>
        ) : (
          <>
            <Escenario brillo={escena.brillo} />
            {getRemotionEnvironment().isStudio && (
              <div
                style={{
                  position: "absolute",
                  left: 40 * u,
                  bottom: 40 * u,
                  maxWidth: 900 * u,
                  padding: 18 * u,
                  borderRadius: 12 * u,
                  border: "2px dashed rgba(255,255,255,0.4)",
                  color: "rgba(255,255,255,0.75)",
                  fontFamily: "monospace",
                  fontSize: 20 * u,
                }}
              >
                PLATE PENDIENTE ({escena.origen}{d.modelo ? ` · ${d.modelo}` : ""}): {d.prompt}
              </div>
            )}
          </>
        )}
      </Stage>
      <Content bloom={0.35}>
        {(d.textos ?? []).map((tx, i) => {
          const sig = d.textos?.[i + 1];
          return (
            <AbsoluteFill key={i} style={{ alignItems: "center", justifyContent: "center", padding: 80 * u }}>
              <Texto texto={{ ...tx, lado: "centro" }} hastaS={sig ? sig.atS : finS + 1} tamanoBase={vertical ? 112 : 120} />
            </AbsoluteFill>
          );
        })}
      </Content>
    </>
  );
}
