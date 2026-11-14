import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AnimacionMarca } from "./animacion";
import { useFuentes } from "./primitivas";
import { ALTO_ANIM, ANCHO_ANIM, CIERRE_S, FPS, type Brief, type EtiquetaParte } from "./tema";
import { duracionAnimF } from "./tiempos";

const FUENTE = `"Satoshi", "Helvetica Neue", Arial, sans-serif`;

const Etiqueta: React.FC<{ lineas: EtiquetaParte[][] }> = ({ lineas }) => (
  <div
    style={{
      position: "absolute",
      top: 150,
      left: 0,
      right: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 14,
      fontFamily: FUENTE,
    }}
  >
    {lineas.map((linea, i) => (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {linea.map((p, j) => (
          <span
            key={j}
            style={
              p.pill
                ? {
                    background: "rgba(10,10,12,0.88)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 42,
                    padding: "10px 26px",
                    borderRadius: 999,
                  }
                : { color: "rgba(255,255,255,0.92)", fontWeight: 500, fontSize: 40, textShadow: "0 2px 10px rgba(0,0,0,0.5)" }
            }
          >
            {p.t}
          </span>
        ))}
      </div>
    ))}
  </div>
);

const Teclado: React.FC = () => {
  const filas = [14, 14, 13, 12, 8];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9, padding: "34px 40px 0" }}>
      {filas.map((n, r) => (
        <div key={r} style={{ display: "flex", gap: 9 }}>
          {Array.from({ length: n }).map((_, k) => (
            <div
              key={k}
              style={{
                flex: r === 4 && k === 3 ? 5 : 1,
                height: 58,
                borderRadius: 10,
                background: "#17171A",
                boxShadow: "inset 0 -3px 0 rgba(255,255,255,0.05)",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

const Laptop: React.FC<{ brief: Brief; luz: string }> = ({ brief, luz }) => {
  const PANT_W = 940;
  const PANT_H = Math.round((PANT_W * ALTO_ANIM) / ANCHO_ANIM);
  const escala = PANT_W / ANCHO_ANIM;
  return (
    <div style={{ position: "absolute", left: (1080 - 1010) / 2, top: 520, width: 1010 }}>
      <div
        style={{
          position: "absolute",
          left: -120,
          top: -160,
          width: 1250,
          height: 900,
          background: `radial-gradient(ellipse at 50% 40%, ${luz}55 0%, transparent 62%)`,
        }}
      />
      <div
        style={{
          position: "relative",
          width: 1010,
          padding: 35,
          borderRadius: "26px 26px 8px 8px",
          background: "linear-gradient(180deg,#2B2B30,#1B1B1F)",
          boxShadow: "0 40px 90px rgba(0,0,0,0.55)",
        }}
      >
        <div style={{ width: PANT_W, height: PANT_H, overflow: "hidden", borderRadius: 6, background: "#000", position: "relative" }}>
          <div style={{ width: ANCHO_ANIM, height: ALTO_ANIM, transform: `scale(${escala})`, transformOrigin: "top left" }}>
            <AnimacionMarca brief={brief} />
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(115deg, rgba(255,255,255,0.10) 0%, transparent 34%)",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>
      <div
        style={{
          width: 1110,
          marginLeft: -50,
          borderRadius: "4px 4px 26px 26px",
          background: "linear-gradient(180deg,#C9CACF,#9FA0A6)",
          paddingBottom: 150,
          boxShadow: "0 50px 90px rgba(0,0,0,0.5)",
        }}
      >
        <Teclado />
        <div
          style={{
            width: 360,
            height: 190,
            margin: "34px auto 0",
            borderRadius: 14,
            background: "rgba(0,0,0,0.08)",
            border: "1px solid rgba(0,0,0,0.12)",
          }}
        />
      </div>
    </div>
  );
};

export const Cierre: React.FC<{ brief: Brief }> = ({ brief }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const letras = "Comentá";
  const n = Math.min(letras.length, Math.floor(Math.max(0, frame - 6) / 2.2));
  const pill = spring({ frame: frame - 26, fps, config: { damping: 12, stiffness: 150 } });
  const pie = interpolate(frame, [48, 62], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cur = interpolate(frame, [30, 56], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ background: "#F3F6F8", alignItems: "center", justifyContent: "center", fontFamily: FUENTE }}>
      <div style={{ textAlign: "center", transform: "translateY(-30px)" }}>
        <div style={{ fontSize: 120, fontWeight: 700, color: "#111", letterSpacing: -3, minHeight: 140 }}>
          {letras.slice(0, n)}
          <span style={{ opacity: frame % 16 < 9 ? 1 : 0, color: "#3B82F6" }}>|</span>
        </div>
        <div
          style={{
            position: "relative",
            display: "inline-block",
            marginTop: 30,
            padding: "30px 80px",
            borderRadius: 999,
            background: "#111",
            color: "#fff",
            fontSize: 110,
            fontWeight: 800,
            transform: `scale(${0.7 + 0.3 * pill})`,
            opacity: pill,
            outline: "2px solid #3B82F6",
            outlineOffset: 8,
          }}
        >
          {brief.cta.palabra}
          <svg
            width={64}
            height={64}
            viewBox="0 0 24 24"
            style={{ position: "absolute", right: -22 + (1 - cur) * 120, bottom: -34 + (1 - cur) * 90 }}
          >
            <path d="M3 2l17 8-7 2-2 7z" fill="#3B82F6" stroke="#fff" strokeWidth={1.2} />
          </svg>
        </div>
        <div style={{ marginTop: 56, fontSize: 52, color: "#6B7280", opacity: pie }}>{brief.cta.pie}</div>
      </div>
    </AbsoluteFill>
  );
};

export const ReelEmpaque: React.FC<{ brief: Brief }> = ({ brief }) => {
  useFuentes(brief.fuentes);
  const frame = useCurrentFrame();
  const animF = duracionAnimF(brief);
  const deriva = interpolate(frame, [0, animF], [1, 1.05], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#0A0A0C" }}>
      <Sequence from={0} durationInFrames={animF} layout="none">
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse at 30% 10%, #3A2A1E 0%, #14100D 55%, #0A0A0C 100%)",
          }}
        >
          <div style={{ position: "absolute", inset: 0, transform: `scale(${deriva})`, transformOrigin: "50% 45%" }}>
            <Laptop brief={brief} luz={brief.marca.acento} />
          </div>
          <Etiqueta lineas={brief.etiqueta} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={animF} durationInFrames={Math.round(CIERRE_S * FPS)} layout="none">
        <Cierre brief={brief} />
      </Sequence>
    </AbsoluteFill>
  );
};
