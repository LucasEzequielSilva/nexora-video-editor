import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Content, Escenario, Stage } from "../capas";
import { TINTA, alfa, fuenteDe, useLayout, useSpec } from "../tema";
import type { DatosCierre, Escena } from "../tipos";

/**
 * End card: logo con glow pleno, bajada chica; en `apagaS` el logo se aplasta en una línea de luz que se acorta y se
 * apaga (el cierre de Amazon / Spotify). Después, negro con el glow muriendo.
 */
export default function Cierre({ escena }: { escena: Escena & { datos: DatosCierre } }) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { u, width } = useLayout();
  const { spec } = useSpec();
  const d = escena.datos;
  const apaga = (d.apagaS ?? durationInFrames / fps - 1.2) * fps;
  const e = interpolate(frame, [0, 22], [0, 1], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateRight: "clamp" });
  const aplasta = interpolate(frame, [apaga, apaga + 10], [0, 1], { easing: Easing.in(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const linea = interpolate(frame, [apaga + 8, apaga + 26], [1, 0], { easing: Easing.inOut(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const glow = interpolate(frame, [0, 20, apaga, apaga + 30], [0.4, 1.1, 1, 0.08], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tb = interpolate(frame, [14, 30], [0, 1], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <Stage>
        <Escenario brillo={{ ...escena.brillo, intensidad: (escena.brillo?.intensidad ?? 1) * glow }} />
      </Stage>
      <Content bloom={0.65}>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 30 * u }}>
          {aplasta < 1 && (
            <div
              style={{
                opacity: e,
                transform: `scale(${(0.94 + 0.06 * e) * (1 + aplasta * 0.1)}, ${(0.94 + 0.06 * e) * (1 - aplasta * 0.97)})`,
                filter: e < 0.999 ? `blur(${(1 - e) * 18 * u}px)` : undefined,
                fontFamily: fuenteDe(spec),
                fontWeight: 700,
                fontSize: 140 * u,
                letterSpacing: "-0.04em",
                color: TINTA.texto,
              }}
            >
              {d.logo ? <Img src={staticFile(d.logo)} style={{ height: 140 * u, maxWidth: width * 0.7, objectFit: "contain", display: "block" }} /> : (d.texto ?? spec.marca.nombre)}
            </div>
          )}
          {aplasta >= 1 && linea > 0 && (
            <div
              style={{
                width: 520 * u * linea,
                height: 5 * u,
                borderRadius: 99,
                background: "#fff",
                boxShadow: `0 0 ${24 * u}px ${8 * u}px ${alfa(spec.marca.color, 0.8)}`,
              }}
            />
          )}
          {d.bajada && aplasta < 0.5 && (
            <div
              style={{
                opacity: tb * (1 - aplasta * 2),
                transform: `translateY(${(1 - tb) * 14 * u}px)`,
                fontFamily: fuenteDe(spec),
                fontWeight: 500,
                fontSize: 38 * u,
                letterSpacing: "0.01em",
                color: TINTA.tenue,
              }}
            >
              {d.bajada}
            </div>
          )}
        </AbsoluteFill>
      </Content>
    </>
  );
}
