import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Content, Escenario, Stage } from "../capas";
import { TINTA, alfa, fuenteDe, useLayout, useSpec } from "../tema";
import type { DatosApertura, Escena } from "../tipos";

/**
 * Apertura (0–2 s): un punto de luz (la cabeza de la línea del motivo) llega al centro, revienta en un destello del color
 * de marca y deja el logo, que entra desenfocado y con el tracking abierto que se cierra.
 */
export default function Apertura({ escena }: { escena: Escena & { datos: DatosApertura } }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, width } = useLayout();
  const { spec } = useSpec();
  const d = escena.datos;
  const rev = d.revientaS * fps;
  const flash = interpolate(frame, [rev - 2, rev + 2, rev + 22], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t = interpolate(frame, [rev, rev + 20], [0, 1], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const glow = interpolate(frame, [0, rev, rev + 30], [0.15, 0.6, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tb = interpolate(frame, [rev + 14, rev + 30], [0, 1], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <>
      <Stage>
        <Escenario brillo={{ ...escena.brillo, intensidad: (escena.brillo?.intensidad ?? 1) * glow }} />
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at 50% 50%, ${alfa("#ffffff", 0.9 * flash)} 0%, ${alfa(spec.marca.color, 0.7 * flash)} ${10 + 30 * flash}%, transparent ${30 + 50 * flash}%)`,
          }}
        />
      </Stage>
      <Content bloom={0.7}>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 28 * u }}>
          <div
            style={{
              opacity: t,
              transform: `scale(${1.12 - 0.12 * t})`,
              filter: t < 0.999 ? `blur(${(1 - t) * 24 * u}px)` : undefined,
              letterSpacing: `${(1 - t) * 0.4 - 0.04}em`,
              fontFamily: fuenteDe(spec),
              fontWeight: 700,
              fontSize: 150 * u,
              color: TINTA.texto,
            }}
          >
            {d.logo ? <Img src={staticFile(d.logo)} style={{ height: 150 * u, maxWidth: width * 0.7, objectFit: "contain", display: "block" }} /> : (d.texto ?? spec.marca.nombre)}
          </div>
          {d.bajada && (
            <div
              style={{
                opacity: tb,
                transform: `translateY(${(1 - tb) * 16 * u}px)`,
                fontFamily: fuenteDe(spec),
                fontWeight: 500,
                fontSize: 40 * u,
                letterSpacing: "0.02em",
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
