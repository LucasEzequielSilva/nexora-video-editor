import type React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { DirBlur, Fondo, Navegador, Pill, Telefono } from "../comun";
import { archivo, clamp, salida } from "../tema";

const desliz = (f: number) => interpolate(f, [0, 11], [560, 0], { ...clamp, easing: salida });

const Base: React.FC<{ etiqueta: string; children: React.ReactNode }> = ({ etiqueta, children }) => {
  const frame = useCurrentFrame();
  const x = desliz(frame);
  const v = Math.abs(x - desliz(frame - 1));
  return (
    <AbsoluteFill>
      <Fondo tipo="negro" />
      <DirBlur x={Math.min(50, v * 0.55)} style={{ transform: `translateX(${x}px)` }}>
        {children}
      </DirBlur>
      <Pill texto={etiqueta} entra={5} />
    </AbsoluteFill>
  );
};

const useSube = (entra: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - entra, fps, config: { damping: 15, stiffness: 150, mass: 0.8 } });
};

export const Apps: React.FC = () => {
  const frame = useCurrentFrame();
  const a = useSube(2);
  const b = useSube(0);
  const c = useSube(5);
  const vaiven = Math.sin(frame / 22);
  const tel = (src: string, x: number, y: number, rot: number, s: number, p: number, z: number) => (
    <div
      style={{
        position: "absolute",
        left: x - 150,
        top: y - 325,
        zIndex: z,
        transform: `translateY(${(1 - p) * 500}px) rotate(${rot + vaiven * 1.2}deg) scale(${s})`,
      }}
    >
      <Telefono src={archivo(`img/${src}.png`)} ancho={300} />
    </div>
  );
  return (
    <Base etiqueta="Apps">
      <AbsoluteFill style={{ transform: `scale(${1 + frame * 0.0012})` }}>
        {tel("ui-futhub-home", 650, 590, -10, 0.88, a, 1)}
        {tel("ui-minga-mangas", 1270, 590, 10, 0.88, c, 1)}
        {tel("ui-fitcrush-explorar", 960, 530, 0, 1, b, 2)}
      </AbsoluteFill>
    </Base>
  );
};

export const Webs: React.FC = () => {
  const frame = useCurrentFrame();
  const ry = interpolate(frame, [0, 72], [-17, -7], clamp);
  return (
    <Base etiqueta="Webs">
      <AbsoluteFill style={{ perspective: 1800, alignItems: "center", justifyContent: "center" }}>
        <div style={{ transform: `translateY(-30px) rotateY(${ry}deg) rotateX(7deg) scale(${1 + frame * 0.001})` }}>
          <Navegador src={archivo("img/proof-gaston.jpg")} ancho={1260} />
        </div>
      </AbsoluteFill>
    </Base>
  );
};

export const Sistemas: React.FC = () => {
  const frame = useCurrentFrame();
  const deriva = frame * 0.9;
  const capa = (src: string, x: number, y: number, z: number, p: number) => (
    <div style={{ position: "absolute", left: 960 - 490 + 60 + x - deriva, top: 540 - 330 - 70 + y, transform: `translateZ(${z}px) translateY(${(1 - p) * 300}px)`, opacity: p }}>
      <Navegador src={archivo(`img/${src}`)} ancho={980} />
    </div>
  );
  const a = useSube(0);
  const b = useSube(4);
  const c = useSube(8);
  return (
    <Base etiqueta="Sistemas de gestión">
      <AbsoluteFill style={{ perspective: 2000 }}>
        <AbsoluteFill style={{ transformStyle: "preserve-3d", transform: "rotateY(-16deg) rotateX(9deg)" }}>
          {capa("proof-gauchos-panel.jpg", -330, -170, -320, a)}
          {capa("proof-elevate.jpg", -20, -10, -160, b)}
          {capa("proof-acelerator-app.jpg", 270, 140, 0, c)}
        </AbsoluteFill>
      </AbsoluteFill>
    </Base>
  );
};

export const Agentes: React.FC = () => {
  const frame = useCurrentFrame();
  const p = useSube(0);
  const cx = 960;
  const cy = 412;
  return (
    <Base etiqueta="Agentes IA">
      <AbsoluteFill>
        <div
          style={{
            position: "absolute",
            left: cx - 520,
            top: cy - 420,
            width: 1040,
            height: 840,
            borderRadius: 9999,
            background: "radial-gradient(closest-side, rgba(167,139,250,0.34), rgba(56,189,248,0.14) 55%, transparent)",
            filter: "blur(30px)",
            opacity: 0.75 + 0.25 * Math.sin(frame / 6),
          }}
        />
        {[0, 1, 2, 3].map((i) => {
          const t = ((frame + i * 18) % 72) / 72;
          const r = 90 + t * 520;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: cx - r,
                top: cy - r,
                width: r * 2,
                height: r * 2,
                borderRadius: 9999,
                border: `3px solid rgba(196,181,253,${0.85 * (1 - t)})`,
                boxShadow: `0 0 50px rgba(56,189,248,${0.4 * (1 - t)}), inset 0 0 40px rgba(167,139,250,${0.25 * (1 - t)})`,
              }}
            />
          );
        })}
        <div style={{ position: "absolute", left: 960 - 165, top: 540 - 357, transform: `translateY(${(1 - p) * 480}px)` }}>
          <Telefono src={archivo("img/ui-voice.png")} ancho={330} />
        </div>
      </AbsoluteFill>
    </Base>
  );
};
