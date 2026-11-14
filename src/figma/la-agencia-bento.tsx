import type React from "react";
import Sfx from "../reserva/components/sfx";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

export const FPS_BENTO = 30;
export const DURACION_BENTO = 8 * FPS_BENTO;
export const ANCHO_BENTO = 1600;
export const ALTO_BENTO = 1200;

const ruta = (archivo: string) => staticFile(`figma/la-agencia-bento/${archivo}`);
const RADIO = 13.526;

type Tarjeta = {
  archivo: string;
  x: number;
  y: number;
  w: number;
  h: number;
  entra: number;
  radio?: number;
  recorte?: string;
};

// Posiciones tomadas del frame "Temlate 2" de Figma (1600x1200).
const TARJETAS: Tarjeta[] = [
  { archivo: "hero-hd.png", x: 54, y: 54, w: 1190, h: 535, entra: 0 },
  { archivo: "lateral.png", x: 1261, y: 54, w: 285, h: 535, entra: 6 },
  { archivo: "app-fondo.png", x: 54, y: 606, w: 282, h: 262, entra: 12 },
  { archivo: "navegador.png", x: 654, y: 606, w: 282, h: 262, entra: 20 },
  { archivo: "instagram.png", x: 953, y: 606, w: 593, h: 540, entra: 24 },
  { archivo: "iphone.png", x: 54, y: 884, w: 282, h: 262, entra: 28 },
  { archivo: "post-fondo.png", x: 654, y: 884, w: 282, h: 262, entra: 32 },
];

const SUPERPUESTAS: Tarjeta[] = [
  { archivo: "app-widget-hd.png", x: 68, y: 656, w: 254, h: 161, entra: 30, radio: 12 },
  { archivo: "post-hd.png", x: 690, y: 900, w: 220, h: 233, entra: 48, radio: 12.37 },
];

const Brillo: React.FC<{ x: number; w: number }> = ({ x, w }) => {
  const frame = useCurrentFrame();
  const inicio = 150 + (x / ANCHO_BENTO) * 30;
  const p = interpolate(frame, [inicio, inicio + 28], [-0.6, 1.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(110deg, transparent ${(p - 0.25) * 100}%, rgba(255,255,255,0.28) ${p * 100}%, transparent ${(p + 0.25) * 100}%)`,
        mixBlendMode: "soft-light",
        pointerEvents: "none",
        width: w,
      }}
    />
  );
};

const Pieza: React.FC<{ t: Tarjeta; indice: number; pop?: boolean }> = ({ t, indice, pop }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - t.entra, fps, config: pop ? { damping: 12, stiffness: 160 } : { damping: 18, stiffness: 90 } });
  const flota = Math.sin((frame - t.entra) / 28 + indice * 1.3) * 3 * s;
  const kenBurns = interpolate(frame, [t.entra, DURACION_BENTO], [1.06, 1], { extrapolateLeft: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        left: t.x,
        top: t.y,
        width: t.w,
        height: t.h,
        opacity: s,
        transform: pop
          ? `translateY(${flota}px) scale(${interpolate(s, [0, 1], [0.6, 1])})`
          : `translateY(${interpolate(s, [0, 1], [70, 0]) + flota}px) scale(${interpolate(s, [0, 1], [0.92, 1])})`,
        borderRadius: t.radio ?? RADIO,
        overflow: "hidden",
        filter: pop ? "drop-shadow(0 18px 24px rgba(0,0,0,0.35))" : undefined,
      }}
    >
      <Img
        src={ruta(t.archivo)}
        style={{ width: "100%", height: "100%", display: "block", transform: pop ? undefined : `scale(${kenBurns})` }}
      />
      <Brillo x={t.x} w={t.w} />
    </div>
  );
};

// La credencial cuelga del clip: entra desde arriba y se balancea hasta quedar quieta.
const Credencial: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = 16;
  const s = spring({ frame: frame - entra, fps, config: { damping: 14, stiffness: 70 } });
  const t = Math.max(0, frame - entra) / fps;
  const balanceo = 7 * Math.exp(-t * 1.1) * Math.sin(t * 5.5) + Math.sin(frame / 40) * 0.6;

  return (
    <div
      style={{
        position: "absolute",
        left: 284,
        top: 609,
        width: 424,
        height: 591,
        opacity: s,
        transformOrigin: "212px 0px",
        transform: `translateY(${interpolate(s, [0, 1], [-160, 0])}px) rotate(${balanceo}deg)`,
      }}
    >
      <Img
        src={ruta("credencial-hd.png")}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", clipPath: "inset(75px 80px 54px 80px round 13.5px)" }}
      />
      <Img
        src={ruta("credencial-hd.png")}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", clipPath: "inset(0 175px 463px 175px round 12px)" }}
      />
    </div>
  );
};

export default function LaAgenciaBento() {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, DURACION_BENTO], [1, 1.03]);
  const salida = interpolate(frame, [DURACION_BENTO - 12, DURACION_BENTO], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#131313" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, opacity: salida }}>
        {TARJETAS.map((t, i) => (
          <Pieza key={t.archivo} t={t} indice={i} />
        ))}
        <Credencial />
        {SUPERPUESTAS.map((t, i) => (
          <Pieza key={t.archivo} t={t} indice={i + 10} pop />
        ))}
      </AbsoluteFill>
      <Sfx name="impact" at={6} volume={0.35} />
      {TARJETAS.map((t, i) => (
        <Sfx key={t.archivo} name={(["tarjeta", "tarjeta-b", "tarjeta-c"] as const)[i % 3]} at={t.entra + 5} volume={0.35} />
      ))}
      <Sfx name="whoosh-short" at={24} volume={0.3} />
      <Sfx name="pop-b" at={34} volume={0.4} />
      <Sfx name="burbuja" at={52} volume={0.4} />
      <Sfx name="whoosh-soft" at={170} volume={0.25} />
    </AbsoluteFill>
  );
}
