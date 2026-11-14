import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import LogoApp from "../../pieza/marca";
import { Content, Escenario, Stage } from "../capas";
import { TINTA, alfa, fuenteDe, useLayout, useSpec } from "../tema";
import Texto from "../texto";
import type { DatosTarjetas, Escena, Tarjeta } from "../tipos";

const Check = ({ at, size, color }: { at: number; size: number; color: string }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [at, at + 12], [0, 1], { easing: Easing.bezier(0.65, 0, 0.35, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
      <circle cx={20} cy={20} r={18} fill={alfa(color, 0.18)} stroke={color} strokeWidth={2.5} />
      <path d="M12 20.5 L18 26.5 L29 14" fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${t} 1`} />
    </svg>
  );
};

/** Tarjeta de vidrio oscuro (la estética de las UI flotantes de Revolut): entra desde la profundidad, frenando. */
const Vidrio = ({ t, i, total, at }: { t: Tarjeta; i: number; total: number; at: number }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { u, vertical } = useLayout();
  const { spec } = useSpec();
  const e = interpolate(frame, [at, at + 18], [0, 1], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (frame < at) return null;
  // Escalera en diagonal: cada tarjeta un escalón más adelante; deriva lenta para que el plano no quede quieto.
  const paso = vertical ? 250 : 150;
  const dx = vertical ? 0 : (i - (total - 1) / 2) * 120;
  const dy = (i - (total - 1) / 2) * paso;
  const deriva = interpolate(frame, [0, durationInFrames], [0, -30]);
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: (vertical ? 840 : 760) * u,
        transform: `translate(-50%, -50%) translate(${(dx + deriva * (i + 1) * 0.3) * u}px, ${dy * u}px) translateZ(${(1 - e) * -500 * u}px) rotateX(${(1 - e) * 30}deg)`,
        opacity: e,
        filter: e < 0.999 ? `blur(${(1 - e) * 14 * u}px)` : undefined,
        display: "flex",
        alignItems: "center",
        gap: 28 * u,
        padding: `${30 * u}px ${36 * u}px`,
        borderRadius: 34 * u,
        background: `linear-gradient(160deg, ${TINTA.vidrio}, rgba(255,255,255,0.025))`,
        border: `${1.5 * u}px solid ${TINTA.vidrioBorde}`,
        boxShadow: `0 ${30 * u}px ${70 * u}px rgba(0,0,0,0.5), inset 0 ${1 * u}px 0 rgba(255,255,255,0.12)`,
        backdropFilter: `blur(${18 * u}px)`,
      }}
    >
      {t.icono && <LogoApp marca={t.icono} size={96 * u} />}
      {t.imagen && <Img src={staticFile(t.imagen)} style={{ width: 96 * u, height: 96 * u, borderRadius: 22 * u, objectFit: "cover" }} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: fuenteDe(spec), fontWeight: 700, fontSize: 44 * u, letterSpacing: "-0.02em", color: TINTA.texto }}>{t.titulo}</div>
        {t.detalle && <div style={{ fontFamily: fuenteDe(spec), fontWeight: 500, fontSize: 32 * u, marginTop: 6 * u, color: TINTA.tenue }}>{t.detalle}</div>}
      </div>
      {t.check && <Check at={at + 10} size={64 * u} color={spec.marca.color} />}
    </div>
  );
};

/** Tarjetas de UI que caen en escalera (agendó, confirmó, recordó…): una por beat de la voz. */
export default function Tarjetas({ escena }: { escena: Escena & { datos: DatosTarjetas } }) {
  const { fps, durationInFrames } = useVideoConfig();
  const { width, height, u, vertical } = useLayout();
  const d = escena.datos;
  const finS = durationInFrames / fps;
  return (
    <>
      <Stage>
        <Escenario brillo={escena.brillo} />
      </Stage>
      <Content bloom={0.3}>
        <AbsoluteFill style={{ perspective: 1600 * u }}>
          <div
            style={{
              position: "absolute",
              left: vertical ? 0 : width * 0.38,
              right: 0,
              top: vertical ? height * 0.18 : 0,
              bottom: 0,
              transformStyle: "preserve-3d",
            }}
          >
            {d.tarjetas.map((t, i) => (
              <Vidrio key={i} t={t} i={i} total={d.tarjetas.length} at={Math.round(t.atS * fps)} />
            ))}
          </div>
        </AbsoluteFill>
        {(d.textos ?? []).map((tx, i) => {
          const sig = d.textos?.[i + 1];
          const zona = vertical ? { left: 60 * u, right: 60 * u, top: height * 0.08 } : { left: width * 0.07, width: width * 0.36, top: height * 0.36 };
          return (
            <div key={i} style={{ position: "absolute", ...zona }}>
              <Texto texto={{ ...tx, lado: vertical ? "centro" : "izquierda" }} hastaS={sig ? sig.atS : finS + 1} tamanoBase={vertical ? 84 : 88} />
            </div>
          );
        })}
      </Content>
    </>
  );
}
