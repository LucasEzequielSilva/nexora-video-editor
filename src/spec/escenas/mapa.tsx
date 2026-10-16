import { AbsoluteFill, Easing, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Content, Stage } from "../capas";
import { TINTA, alfa, fuenteDe, tintaAcento, useLayout, useSpec } from "../tema";
import Notificacion from "../notificacion";
import Texto from "../texto";
import type { DatosMapa, Escena, PinMapa } from "../tipos";

const esVideo = (f: string) => /\.(mp4|mov|webm)$/i.test(f);

/** Pin del mapa: punto con el degradé que late + etiqueta de vidrio (propiedad con precio, persona que busca). */
const Pin = ({ pin }: { pin: PinMapa }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { width, height, u, vertical } = useLayout();
  const { spec } = useSpec();
  const at = pin.atS * fps;
  if (frame < at) return null;
  const e = interpolate(frame, [at, at + 14], [0, 1], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateRight: "clamp" });
  const late = ((frame - at) % 36) / 36;
  const x = (vertical && pin.xv !== undefined ? pin.xv : pin.x) * width;
  const y = (vertical && pin.yv !== undefined ? pin.yv : pin.y) * height;
  const grad = spec.marca.degradado ?? [spec.marca.color, spec.marca.color];
  const persona = pin.tipo === "persona";
  // En 9:16 no hay lugar a la izquierda del pin: la etiqueta va siempre a la derecha.
  const derecha = persona || vertical;
  const r = 18 * u;
  return (
    <div style={{ position: "absolute", left: x, top: y }}>
      <div
        style={{
          position: "absolute",
          left: -r * (1 + late * 2.2),
          top: -r * (1 + late * 2.2),
          width: r * 2 * (1 + late * 2.2),
          height: r * 2 * (1 + late * 2.2),
          borderRadius: 999,
          border: `${2 * u}px solid ${alfa(persona ? grad[2] ?? grad[0] : grad[0], 0.7 * (1 - late))}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -r,
          top: -r,
          width: r * 2,
          height: r * 2,
          borderRadius: 999,
          transform: `scale(${e})`,
          background: `linear-gradient(135deg, ${grad.join(", ")})`,
          boxShadow: `0 0 ${30 * u}px ${alfa(grad[1] ?? grad[0], 0.9)}`,
          border: `${3 * u}px solid #fff`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: derecha ? 30 * u : undefined,
          right: derecha ? undefined : 30 * u,
          top: -38 * u,
          whiteSpace: "nowrap",
          opacity: e,
          transform: `translateY(${(1 - e) * 16 * u}px)`,
          filter: e < 0.999 ? `blur(${(1 - e) * 8 * u}px)` : undefined,
          padding: `${14 * u}px ${22 * u}px`,
          borderRadius: 20 * u,
          background: "rgba(24,22,64,0.78)",
          border: `${1.5 * u}px solid ${TINTA.vidrioBorde}`,
          backdropFilter: `blur(${14 * u}px)`,
          boxShadow: `0 ${20 * u}px ${50 * u}px rgba(0,0,0,0.5)`,
          fontFamily: fuenteDe(spec),
          color: TINTA.texto,
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 34 * u, letterSpacing: "-0.02em" }}>{pin.titulo}</div>
        {pin.detalle && <div style={{ fontWeight: 500, fontSize: 24 * u, color: TINTA.tenue, marginTop: 4 * u }}>{pin.detalle}</div>}
      </div>
    </div>
  );
};

/** Chip "94 % match" que salta sobre un pin. */
const Match = ({ texto, atS, pin }: { texto: string; atS: number; pin: PinMapa }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { width, height, u, vertical } = useLayout();
  const { spec } = useSpec();
  const at = atS * fps;
  if (frame < at) return null;
  const e = interpolate(frame, [at, at + 12], [0, 1], { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateRight: "clamp" });
  const x = (vertical && pin.xv !== undefined ? pin.xv : pin.x) * width;
  const y = (vertical && pin.yv !== undefined ? pin.yv : pin.y) * height;
  const grad = spec.marca.degradado ?? [spec.marca.color];
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + 46 * u,
        transform: `translateX(-50%) scale(${e})`,
        padding: 3 * u,
        borderRadius: 999,
        background: `linear-gradient(95deg, ${grad.join(", ")})`,
        boxShadow: `0 0 ${40 * u}px ${alfa(grad[1] ?? grad[0], 0.8)}`,
      }}
    >
      <div
        style={{
          padding: `${12 * u}px ${26 * u}px`,
          borderRadius: 999,
          background: "#0F0D2E",
          fontFamily: fuenteDe(spec),
          fontWeight: 900,
          fontSize: 40 * u,
          letterSpacing: "-0.02em",
          whiteSpace: "nowrap",
        }}
      >
        <span style={tintaAcento(spec)}>{texto}</span>
      </div>
    </div>
  );
};

/**
 * El mapa: la ciudad de noche (plate de Higgsfield o la aérea del producto) con empuje lento; la línea de luz del motivo
 * viaja de un pin a otro (va en `linea` de la escena) y salta el chip del match.
 */
export default function Mapa({ escena }: { escena: Escena & { datos: DatosMapa } }) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { vertical, u } = useLayout();
  const { spec } = useSpec();
  const d = escena.datos;
  const archivo = vertical && d.archivoVertical ? d.archivoVertical : d.archivo;
  const esc = interpolate(frame, [0, durationInFrames], [1, d.empuje ?? 1.06]);
  const finS = durationInFrames / fps;
  return (
    <>
      <Stage>
        <AbsoluteFill style={{ transform: `scale(${esc})` }}>
          {esVideo(archivo) ? (
            <OffthreadVideo src={staticFile(archivo)} muted playbackRate={d.velocidad ?? 1} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <Img src={staticFile(archivo)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          )}
        </AbsoluteFill>
        <AbsoluteFill style={{ background: `rgba(8,11,31,${d.oscurecer ?? 0.25})` }} />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(8,11,31,0.8) 100%)" }} />
      </Stage>
      <Content bloom={0.3}>
        {d.pines.map((p, i) => (
          <Pin key={i} pin={p} />
        ))}
        {d.notificacion && <Notificacion n={d.notificacion} icono={spec.marca.icono} />}
        {d.match && d.pines[d.match.pin] && <Match texto={d.match.texto} atS={d.match.atS} pin={d.pines[d.match.pin]} />}
        {(d.textos ?? []).map((tx, i) => {
          const sig = d.textos?.[i + 1];
          return (
            <div key={i} style={{ position: "absolute", left: 0, right: 0, top: vertical ? 160 * u : 70 * u }}>
              <Texto texto={{ ...tx, lado: "centro" }} hastaS={sig ? sig.atS : finS + 1} tamanoBase={vertical ? 84 : 80} />
            </div>
          );
        })}
      </Content>
    </>
  );
}
