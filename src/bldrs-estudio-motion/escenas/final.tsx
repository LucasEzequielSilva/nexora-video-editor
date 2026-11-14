import type React from "react";
import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AvatarBldrs, Burbuja, Cursor, estiloGrande, Fondo, Palabra, TextoArcoiris, usePop } from "../comun";
import { AMBAR, archivo, CELESTE, clamp, F_GRANDE, F_TEXTO, recorrido, salida, VERDE } from "../tema";

const PREGUNTA = "¿La rompimos?";

export const Rompimos: React.FC = () => {
  const frame = useCurrentFrame();
  const barra = usePop(0, { damping: 16, stiffness: 200, mass: 0.7 });
  const letras = Math.max(0, Math.min(PREGUNTA.length, frame - 1));
  const enviado = frame >= 18;
  const atenua = interpolate(frame, [18, 26], [1, 0.3], clamp);
  const pill = usePop(34, { damping: 10, stiffness: 190, mass: 0.7 });
  const sube = interpolate(frame, [32, 42], [0, -70], { ...clamp, easing: salida });
  return (
    <AbsoluteFill>
      <Fondo tipo="negro" />
      <div
        style={{
          position: "absolute",
          left: 560,
          top: 860,
          width: 800,
          height: 84,
          borderRadius: 42,
          background: "rgba(255,255,255,0.06)",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.12)",
          opacity: barra.op * atenua,
          transform: `translateY(${(1 - barra.s) * 100}px)`,
          display: "flex",
          alignItems: "center",
          padding: "0 14px 0 34px",
          fontFamily: F_TEXTO,
          fontWeight: 500,
          fontSize: 34,
          color: "white",
        }}
      >
        <div style={{ flex: 1 }}>{enviado ? "" : PREGUNTA.slice(0, letras)}</div>
        <div style={{ width: 56, height: 56, borderRadius: 99, background: CELESTE, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0C0C0E" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </div>
      </div>
      <div style={{ position: "absolute", right: 1920 - 1250, top: 380 + sube }}>
        <Burbuja lado="propio" tamano={84} entra={18} halo={0.32}>
          {PREGUNTA}
        </Burbuja>
      </div>
      <div style={{ position: "absolute", left: 1276, top: 418 + sube }}>
        <AvatarBldrs tamano={104} entra={20} />
      </div>
      {pill.visible ? (
        <div
          style={{
            position: "absolute",
            left: 960,
            top: 640,
            transform: `translate(-50%, -50%) scale(${0.4 + 0.6 * pill.s}) rotate(${(1 - pill.s) * -6}deg)`,
            opacity: pill.op,
            display: "flex",
            alignItems: "center",
            gap: 22,
            padding: "18px 44px 18px 22px",
            borderRadius: 999,
            background: "rgba(74,222,128,0.1)",
            boxShadow: `0 0 0 2px ${VERDE}, 0 0 60px rgba(74,222,128,0.3), inset 0 0 30px rgba(74,222,128,0.12)`,
            fontFamily: F_TEXTO,
            fontWeight: 800,
            fontStretch: "75%",
            fontSize: 64,
            color: VERDE,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            lineHeight: 1,
          }}
        >
          <div style={{ width: 70, height: 70, borderRadius: 99, background: VERDE, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#0C0C0E" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </div>
          La rompimos
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const Seleccionada: React.FC<{ texto: string; entra: number; color: string; cursores: { letra: string; color: string; dx: number; dy: number }[] }> = ({
  texto,
  entra,
  color,
  cursores,
}) => {
  const frame = useCurrentFrame();
  const caja = interpolate(frame, [entra + 2, entra + 7], [0, 1], clamp);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <Palabra entra={entra} style={{ color }}>
        {texto}
      </Palabra>
      {caja > 0 ? (
        <span
          style={{
            position: "absolute",
            left: -16,
            right: -16,
            top: 4,
            bottom: -10,
            border: `2.5px solid ${color}`,
            opacity: caja,
            transform: `scale(${1.12 - 0.12 * caja})`,
          }}
        >
          {[
            [0, 0],
            [1, 0],
            [0, 1],
            [1, 1],
          ].map(([x, y]) => (
            <span
              key={`${x}${y}`}
              style={{
                position: "absolute",
                left: `calc(${x * 100}% - 8px)`,
                top: `calc(${y * 100}% - 8px)`,
                width: 14,
                height: 14,
                background: "white",
                border: `2.5px solid ${color}`,
              }}
            />
          ))}
        </span>
      ) : null}
      {cursores.map((c, i) => {
        const p = recorrido(frame, [
          { f: entra - 8, x: c.dx * 4, y: c.dy * 4 },
          { f: entra + 4, x: c.dx, y: c.dy },
          { f: entra + 60, x: c.dx * 1.2, y: c.dy * 1.2 },
        ], salida);
        if (frame < entra - 8) return null;
        return (
          <span key={i} style={{ position: "absolute", left: "100%", top: "100%" }}>
            <Cursor x={p.x} y={p.y} color={c.color} letra={c.letra} clicks={[entra + 4]} />
          </span>
        );
      })}
    </span>
  );
};

export const Seleccion: React.FC = () => {
  const frame = useCurrentFrame();
  const tam = 104;
  return (
    <AbsoluteFill>
      <Fondo tipo="chat" />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 46, transform: `scale(${1 + frame * 0.0006})` }}>
        <div style={{ ...estiloGrande(tam), display: "flex", gap: `0 ${tam * 0.26}px`, whiteSpace: "nowrap" }}>
          <Palabra entra={0}>Las</Palabra>
          <Palabra entra={3}>mismas</Palabra>
          <Palabra entra={6}>manos</Palabra>
        </div>
        <div style={{ ...estiloGrande(tam), display: "flex", gap: `0 ${tam * 0.42}px`, whiteSpace: "nowrap", alignItems: "baseline" }}>
          <Seleccionada texto="diseñan," entra={14} color={AMBAR} cursores={[{ letra: "L", color: AMBAR, dx: -6, dy: -2 }]} />
          <Seleccionada texto="construyen" entra={28} color={CELESTE} cursores={[{ letra: "V", color: CELESTE, dx: -6, dy: -2 }]} />
          <Palabra entra={40} style={{ marginRight: -tam * 0.08 }}>
            y
          </Palabra>
          <Seleccionada
            texto="publican."
            entra={44}
            color={VERDE}
            cursores={[
              { letra: "L", color: AMBAR, dx: -6, dy: -2 },
              { letra: "V", color: CELESTE, dx: -150, dy: 40 },
            ]}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Garantia: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const golpe = spring({ frame: frame - 15, fps, config: { damping: 12, stiffness: 190, mass: 0.8 } });
  const op = interpolate(frame, [15, 18], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Fondo tipo="negro" brillo={1 + interpolate(frame, [15, 20, 50], [0, 0.9, 0.3], clamp)} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 18, transform: `scale(${1 + frame * 0.0007})` }}>
        <div style={{ ...estiloGrande(112), display: "flex", gap: "0 30px", whiteSpace: "nowrap" }}>
          <Palabra entra={0}>30</Palabra>
          <Palabra entra={3}>días</Palabra>
          <Palabra entra={6}>de</Palabra>
          <Palabra entra={9}>desarrollo</Palabra>
        </div>
        <div
          style={{
            ...estiloGrande(190),
            opacity: op,
            transform: `scale(${1.35 - 0.35 * golpe})`,
            filter: "drop-shadow(0 0 50px rgba(255,255,255,0.14))",
            paddingBottom: 12,
          }}
        >
          <TextoArcoiris desplazo={interpolate(frame, [15, 73], [0, 60], clamp)}>o no pagás.</TextoArcoiris>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Cierre: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const icono = spring({ frame: frame - 2, fps, config: { damping: 12, stiffness: 180, mass: 0.7 } });
  const revela = interpolate(frame, [6, 20], [0, 1], { ...clamp, easing: salida });
  const bajada = interpolate(frame, [22, 32], [0, 1], { ...clamp, easing: salida });
  const negro = interpolate(frame, [76, 91], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Fondo tipo="negro" brillo={1.2} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 40, flexDirection: "column", transform: `scale(${1 + frame * 0.0005})` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 38 }}>
          <Img
            src={archivo("img/icon-builders.svg")}
            style={{ width: 150, height: 147, transform: `scale(${icono}) rotate(${(1 - icono) * -25}deg)`, filter: "drop-shadow(0 0 40px rgba(167,139,250,0.25))" }}
          />
          <div
            style={{
              fontFamily: F_GRANDE,
              fontWeight: 600,
              fontSize: 104,
              letterSpacing: "-0.004em",
              color: "white",
              whiteSpace: "nowrap",
              clipPath: `inset(-20% ${(1 - revela) * 100}% -20% 0)`,
              transform: `translateX(${(1 - revela) * -50}px)`,
            }}
          >
            bldrsclub.dev<span style={{ color: "rgba(255,255,255,0.5)" }}>/estudio</span>
          </div>
        </div>
        <div
          style={{
            fontFamily: F_TEXTO,
            fontWeight: 500,
            fontSize: 38,
            color: "rgba(255,255,255,0.66)",
            opacity: bajada,
            transform: `translateY(${(1 - bajada) * 24}px)`,
            letterSpacing: "0.01em",
          }}
        >
          Desde USD 3.000 · Precio cerrado
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "black", opacity: negro }} />
    </AbsoluteFill>
  );
};
