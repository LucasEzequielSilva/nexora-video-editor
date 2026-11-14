import type React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Fondo } from "../comun";
import { ARCOIRIS, clamp, F_GRANDE, salida } from "../tema";

const PALABRA = "bldrs";

export const Marca: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = spring({ frame, fps, config: { damping: 16, stiffness: 180, mass: 0.7 } });
  const relleno = interpolate(frame, [2, 16], [0, 1.45], { ...clamp, easing: salida });
  const sale = interpolate(frame, [49, 57], [0, 1], { ...clamp, easing: (t) => t * t });
  const tam = 360;

  const base: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: F_GRANDE,
    fontWeight: 600,
    fontSize: tam,
    letterSpacing: "-0.012em",
    lineHeight: 1,
  };
  const borde = relleno * 100;
  const banda = `linear-gradient(90deg, white 0%, white ${Math.max(0, borde - 34)}%, ${ARCOIRIS.map((c, i) => `${c} ${Math.max(0, borde - 30 + i * 6)}%`).join(", ")}, transparent ${borde + 2}%)`;

  return (
    <AbsoluteFill>
      <Fondo tipo="chat" brillo={1 + sale * 0.4} />
      <AbsoluteFill
        style={{
          transform: `translateX(${(1 - entra) * 140 - sale * 60}px) scale(${0.94 + 0.06 * entra + sale * 0.5})`,
          filter: sale > 0.02 ? `blur(${sale * 24}px)` : undefined,
          opacity: 1 - sale,
        }}
      >
        <div style={{ ...base, color: "rgba(255,255,255,0.07)", WebkitTextStroke: "2px rgba(255,255,255,0.22)" }}>
          <span style={{ padding: "0 0.04em" }}>{PALABRA}</span>
        </div>
        <div style={{ ...base, filter: "drop-shadow(0 0 40px rgba(255,255,255,0.18))" }}>
          <span
            style={{
              backgroundImage: banda,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              padding: "0 0.04em",
            }}
          >
            {PALABRA}
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
