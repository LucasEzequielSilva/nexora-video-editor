import type React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { estiloGrande, Fondo, Palabra } from "../comun";
import { clamp, CORAL, F_TEXTO, salida, VERDE } from "../tema";

const Centro: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", ...style }}>{children}</AbsoluteFill>
);

const Palabras: React.FC<{ palabras: { t: string; en: number; color?: string }[]; tam: number }> = ({ palabras, tam }) => (
  <div style={{ ...estiloGrande(tam), display: "flex", gap: `0 ${tam * 0.26}px`, whiteSpace: "nowrap" }}>
    {palabras.map((p, i) => (
      <Palabra key={i} entra={p.en} style={{ color: p.color ?? "white" }}>
        {p.t}
      </Palabra>
    ))}
  </div>
);

export const SaleMal: React.FC = () => {
  const frame = useCurrentFrame();
  const empuje = interpolate(frame, [0, 57], [1, 1.05], clamp);
  return (
    <AbsoluteFill>
      <Fondo tipo="negro" />
      <Centro style={{ transform: `scale(${empuje})` }}>
        <Palabras
          tam={128}
          palabras={[
            { t: "Contratar", en: 0 },
            { t: "desarrollo", en: 6 },
            { t: "sale", en: 27, color: CORAL },
            { t: "mal.", en: 31, color: CORAL },
          ]}
        />
      </Centro>
    </AbsoluteFill>
  );
};

export const Dolor: React.FC<{ texto: string }> = ({ texto }) => {
  const frame = useCurrentFrame();
  const tachado = interpolate(frame, [24, 34], [0, 1], { ...clamp, easing: salida });
  const apaga = interpolate(frame, [30, 40], [1, 0.42], clamp);
  const empuje = interpolate(frame, [0, 58], [1, 1.04], clamp);
  const palabras = texto.split(" ");
  const tam = 100;
  return (
    <AbsoluteFill>
      <Fondo tipo="negro" />
      <Centro style={{ transform: `scale(${empuje})` }}>
        <div
          style={{
            position: "absolute",
            top: 372,
            fontFamily: F_TEXTO,
            fontWeight: 600,
            fontStretch: "75%",
            fontSize: 36,
            letterSpacing: "0.16em",
            color: "rgba(255,255,255,0.62)",
            textTransform: "uppercase",
          }}
        >
          El problema
        </div>
        <div style={{ position: "relative", ...estiloGrande(tam), display: "flex", gap: `0 ${tam * 0.26}px`, whiteSpace: "nowrap" }}>
          <div style={{ display: "flex", gap: `0 ${tam * 0.26}px`, opacity: apaga }}>
            {palabras.map((p, i) => (
              <Palabra key={i} entra={i * 3}>
                {p}
              </Palabra>
            ))}
          </div>
          <div
            style={{
              position: "absolute",
              left: -14,
              top: "52%",
              height: tam * 0.075,
              width: `calc(${tachado * 100}% + ${tachado * 28}px)`,
              borderRadius: 99,
              background: CORAL,
              boxShadow: `0 0 24px ${CORAL}`,
              transform: "translateY(-50%) rotate(-1.2deg)",
            }}
          />
        </div>
      </Centro>
    </AbsoluteFill>
  );
};

export const Reves: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const gira = spring({ frame: frame - 15, fps, config: { damping: 13, stiffness: 120, mass: 0.9 } });
  const op = interpolate(frame, [15, 18], [0, 1], clamp);
  const tam = 132;
  return (
    <AbsoluteFill>
      <Fondo tipo="reves" brillo={interpolate(frame, [0, 10], [0.6, 1], clamp)} />
      <Centro>
        <div style={{ ...estiloGrande(tam), display: "flex", gap: `0 ${tam * 0.26}px`, whiteSpace: "nowrap", alignItems: "baseline" }}>
          <Palabra entra={0}>Acá</Palabra>
          <Palabra entra={4}>se</Palabra>
          <Palabra entra={8}>trabaja</Palabra>
          <span style={{ display: "inline-block", opacity: op, transform: `rotate(${(1 - gira) * 180}deg)`, transformOrigin: "50% 58%" }}>al revés.</span>
        </div>
      </Centro>
    </AbsoluteFill>
  );
};

export const Funciona: React.FC = () => {
  const frame = useCurrentFrame();
  const palabra = "funcionando.";
  const letras = Math.max(0, Math.min(palabra.length, Math.floor((frame - 14) / 1.4) + 1));
  const haz = interpolate(frame, [12, 18, 58], [0, 1, 0.7], clamp);
  const caret = frame >= 12 && (frame < 34 || Math.floor(frame / 7) % 2 === 0);
  const tam = 96;
  return (
    <AbsoluteFill>
      <Fondo tipo="negro" />
      <Centro>
        <div style={{ ...estiloGrande(tam), display: "flex", whiteSpace: "nowrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: `0 ${tam * 0.26}px` }}>
            <Palabra entra={0}>primero</Palabra>
            <Palabra entra={3}>ves</Palabra>
            <Palabra entra={6}>tu</Palabra>
            <Palabra entra={9}>idea</Palabra>
          </div>
          <div style={{ position: "relative", marginLeft: tam * 0.24, paddingLeft: 22, minWidth: tam * 6.1 }}>
            <div
              style={{
                position: "absolute",
                left: 0,
                top: "-90%",
                height: "280%",
                width: "150%",
                background: `linear-gradient(90deg, rgba(74,222,128,0.55), rgba(74,222,128,0.18) 45%, rgba(74,222,128,0) 85%)`,
                clipPath: "polygon(0 42%, 100% 0, 100% 100%, 0 58%)",
                filter: "blur(10px)",
                opacity: haz,
              }}
            />
            {caret ? (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: "4%",
                  width: 8,
                  height: "96%",
                  borderRadius: 4,
                  background: VERDE,
                  boxShadow: `0 0 18px ${VERDE}`,
                }}
              />
            ) : null}
            <span style={{ position: "relative", color: VERDE, textShadow: "0 0 40px rgba(74,222,128,0.35)" }}>{frame >= 14 ? palabra.slice(0, letras) : ""}</span>
          </div>
        </div>
      </Centro>
    </AbsoluteFill>
  );
};
