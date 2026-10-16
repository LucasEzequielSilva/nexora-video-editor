import { Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TINTA, fuenteDe, useLayout, useSpec } from "./tema";
import type { Notificacion as N } from "./tipos";

/** Notificación tipo iOS que cae desde arriba con el ícono de la marca (el "Delivered" del aviso de Amazon). */
export default function Notificacion({ n, icono }: { n: N; icono?: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { width, u, vertical } = useLayout();
  const { spec } = useSpec();
  const at = n.atS * fps;
  if (frame < at) return null;
  const e = interpolate(frame, [at, at + 14], [0, 1], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateRight: "clamp" });
  const sale = n.hastaS !== undefined ? interpolate(frame, [n.hastaS * fps - 8, n.hastaS * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const w = (vertical ? 920 : 860) * u;
  return (
    <div
      style={{
        position: "absolute",
        left: (width - w) / 2,
        top: (vertical ? 120 : 48) * u,
        width: w,
        transform: `translateY(${(e - 1) * 160 * u - sale * 120 * u}px) scale(${0.96 + 0.04 * e})`,
        opacity: Math.min(e * 1.5, 1) * (1 - sale),
        display: "flex",
        alignItems: "center",
        gap: 24 * u,
        padding: `${24 * u}px ${28 * u}px`,
        borderRadius: 36 * u,
        background: "rgba(40,36,84,0.72)",
        border: `${1.5 * u}px solid ${TINTA.vidrioBorde}`,
        backdropFilter: `blur(${24 * u}px)`,
        boxShadow: `0 ${24 * u}px ${60 * u}px rgba(0,0,0,0.55)`,
        fontFamily: fuenteDe(spec),
        color: TINTA.texto,
      }}
    >
      {icono && <Img src={staticFile(icono)} style={{ width: 84 * u, height: 84 * u, borderRadius: 20 * u, background: "#0F0D2E", padding: 10 * u, boxSizing: "border-box", objectFit: "contain" }} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26 * u, fontWeight: 600, color: TINTA.tenue }}>
          <span>{spec.marca.nombre}</span>
          <span>ahora</span>
        </div>
        <div style={{ fontSize: 36 * u, fontWeight: 800, marginTop: 4 * u, letterSpacing: "-0.01em" }}>{n.titulo}</div>
        <div style={{ fontSize: 30 * u, fontWeight: 500, marginTop: 2 * u, color: TINTA.tenue }}>{n.texto}</div>
      </div>
    </div>
  );
}
