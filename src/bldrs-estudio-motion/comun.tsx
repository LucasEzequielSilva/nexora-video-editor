import type React from "react";
import { useId } from "react";
import { AbsoluteFill, Audio, Img, interpolate, random, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { archivo, clamp, conico, F_GRANDE, F_TEXTO, FONDO, lineal } from "./tema";

/* ───────── Fondo ───────── */

export const Ruido: React.FC = () => {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.06, mixBlendMode: "overlay" }}>
      <filter id={`ruido${id}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#ruido${id})`} />
    </svg>
  );
};

const Particulas: React.FC<{ cantidad?: number }> = ({ cantidad = 46 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {new Array(cantidad).fill(0).map((_, i) => {
        const x = random(`px${i}`) * 1920;
        const y = (random(`py${i}`) * 1180 - frame * (0.15 + random(`pv${i}`) * 0.35)) % 1180;
        const t = 1 + random(`pt${i}`) * 2;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y < -40 ? y + 1180 : y,
              width: t,
              height: t,
              borderRadius: 99,
              background: "white",
              opacity: 0.12 + random(`po${i}`) * 0.3,
              boxShadow: `0 0 ${t * 3}px rgba(255,255,255,0.5)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export type TipoFondo = "chat" | "negro" | "reves";

export const Fondo: React.FC<{ tipo: TipoFondo; brillo?: number }> = ({ tipo, brillo = 1 }) => {
  const frame = useCurrentFrame();
  const d = Math.sin(frame / 70) * 4;
  let capas: string;
  if (tipo === "chat") {
    capas = [
      `radial-gradient(42% 52% at ${24 + d}% ${26 - d}%, rgba(56,189,248,${0.2 * brillo}), transparent 72%)`,
      `radial-gradient(46% 56% at ${78 - d}% ${82 + d}%, rgba(74,222,128,${0.15 * brillo}), transparent 72%)`,
      `radial-gradient(36% 42% at ${62 + d}% ${16}%, rgba(167,139,250,${0.13 * brillo}), transparent 72%)`,
      `radial-gradient(30% 36% at ${12}% ${88 - d}%, rgba(244,114,182,${0.07 * brillo}), transparent 72%)`,
    ].join(", ");
  } else if (tipo === "reves") {
    capas = [
      `radial-gradient(85% 75% at 50% ${112 - d}%, rgba(56,189,248,${0.62 * brillo}), rgba(167,139,250,${0.3 * brillo}) 45%, transparent 76%)`,
      `radial-gradient(60% 42% at ${40 + d}% -12%, rgba(74,222,128,${0.3 * brillo}), transparent 72%)`,
    ].join(", ");
  } else {
    capas = [
      `radial-gradient(62% 46% at 50% ${108 + d * 0.5}%, rgba(56,189,248,${0.16 * brillo}), transparent 72%)`,
      `radial-gradient(38% 34% at ${28 + d}% 110%, rgba(167,139,250,${0.12 * brillo}), transparent 72%)`,
      `radial-gradient(34% 30% at ${74 - d}% 112%, rgba(74,222,128,${0.1 * brillo}), transparent 72%)`,
    ].join(", ");
  }
  return (
    <AbsoluteFill style={{ background: FONDO }}>
      <AbsoluteFill style={{ background: capas }} />
      {tipo === "negro" ? <Particulas /> : null}
      <AbsoluteFill style={{ background: "radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(0,0,0,0.45))" }} />
      <Ruido />
    </AbsoluteFill>
  );
};

/* ───────── Desenfoque de movimiento ───────── */

export const DirBlur: React.FC<{ x?: number; y?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  x = 0,
  y = 0,
  children,
  style,
}) => {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const activo = x > 0.4 || y > 0.4;
  return (
    <>
      {activo ? (
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <filter id={`mb${id}`} x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation={`${x.toFixed(2)} ${y.toFixed(2)}`} />
          </filter>
        </svg>
      ) : null}
      <AbsoluteFill style={{ filter: activo ? `url(#mb${id})` : undefined, ...style }}>{children}</AbsoluteFill>
    </>
  );
};

/* ───────── Arcoíris ───────── */

export const BordeArcoiris: React.FC<{
  grosor?: number;
  radio: number;
  relleno?: string;
  halo?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  interior?: React.CSSProperties;
}> = ({ grosor = 3, radio, relleno = "#121215", halo = 0.22, children, style, interior }) => {
  const frame = useCurrentFrame();
  const angulo = frame * 2.4;
  return (
    <div style={{ position: "relative", display: "inline-flex", ...style }}>
      {halo > 0 ? (
        <div
          style={{
            position: "absolute",
            inset: -10,
            borderRadius: radio + 10,
            background: conico(angulo),
            filter: "blur(22px)",
            opacity: halo,
          }}
        />
      ) : null}
      <div style={{ position: "relative", padding: grosor, borderRadius: radio, background: conico(angulo), display: "inline-flex" }}>
        <div
          style={{
            borderRadius: radio - grosor,
            background: relleno,
            display: "inline-flex",
            alignItems: "center",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
            ...interior,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export const TextoArcoiris: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; desplazo?: number }> = ({
  children,
  style,
  desplazo = 0,
}) => (
  <span
    style={{
      backgroundImage: lineal(90),
      backgroundSize: "200% 100%",
      backgroundPosition: `${desplazo}% 0`,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
      ...style,
    }}
  >
    {children}
  </span>
);

/* ───────── Chat ───────── */

const COLA = "M 100 0 L 100 66 C 92 90 62 100 0 100 C 30 86 46 66 46 0 Z";

export const Puntos: React.FC<{ tamano: number; color?: string }> = ({ tamano, color = "rgba(255,255,255,0.85)" }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", gap: tamano * 0.22, alignItems: "center", height: tamano * 1.15 }}>
      {[0, 1, 2].map((i) => {
        const b = Math.max(0, Math.sin(((frame - i * 4) / 30) * Math.PI * 2 * 1.4));
        return (
          <div
            key={i}
            style={{
              width: tamano * 0.3,
              height: tamano * 0.3,
              borderRadius: 99,
              background: color,
              opacity: 0.4 + 0.6 * b,
              transform: `translateY(${-b * tamano * 0.12}px)`,
            }}
          />
        );
      })}
    </div>
  );
};

/** Escala de entrada de una burbuja: nace del vértice de la cola. */
export const usePop = (entra: number, config = { damping: 13, stiffness: 210, mass: 0.7 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - entra, fps, config });
  return { s, visible: frame >= entra, op: interpolate(frame - entra, [0, 3], [0, 1], clamp) };
};

export const Burbuja: React.FC<{
  lado: "cliente" | "propio";
  tamano: number;
  entra: number;
  children: React.ReactNode;
  cola?: boolean;
  halo?: number;
  style?: React.CSSProperties;
}> = ({ lado, tamano, entra, children, cola = true, halo = 0.22, style }) => {
  const { s, visible, op } = usePop(entra);
  if (!visible) return null;
  const relleno = { padding: `${tamano * 0.4}px ${tamano * 0.66}px`, fontFamily: F_TEXTO, fontWeight: 500, fontSize: tamano, lineHeight: 1.15, whiteSpace: "nowrap" as const };
  const origen = lado === "cliente" ? "0% 100%" : "100% 100%";
  return (
    <div style={{ display: "inline-flex", transform: `scale(${0.25 + 0.75 * s})`, transformOrigin: origen, opacity: op, ...style }}>
      {lado === "cliente" ? (
        <div
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            borderRadius: tamano * 0.95,
            background: "#26262C",
            color: "rgba(255,255,255,0.95)",
            boxShadow: "0 14px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07)",
            ...relleno,
          }}
        >
          {cola ? (
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              style={{ position: "absolute", left: -tamano * 0.2, bottom: -tamano * 0.04, width: tamano * 0.62, height: tamano * 0.5 }}
            >
              <path d={COLA} fill="#26262C" />
            </svg>
          ) : null}
          <span style={{ position: "relative" }}>{children}</span>
        </div>
      ) : (
        <BordeArcoiris radio={tamano * 0.95} grosor={Math.max(2.5, tamano * 0.045)} halo={halo} relleno="#131317">
          <div style={{ color: "white", display: "inline-flex", alignItems: "center", ...relleno }}>{children}</div>
        </BordeArcoiris>
      )}
    </div>
  );
};

export const AvatarBldrs: React.FC<{ tamano: number; entra: number; style?: React.CSSProperties }> = ({ tamano, entra, style }) => {
  const { s, visible, op } = usePop(entra, { damping: 11, stiffness: 200, mass: 0.6 });
  if (!visible) return null;
  return (
    <Img
      src={archivo("img/icon-builders.svg")}
      style={{
        width: tamano,
        height: tamano * (157 / 160),
        transform: `scale(${s})`,
        opacity: op,
        filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.5))",
        ...style,
      }}
    />
  );
};

/* ───────── Cursor ───────── */

export const Cursor: React.FC<{
  x: number;
  y: number;
  color: string;
  letra?: string;
  clicks?: number[];
  escala?: number;
  opacidad?: number;
}> = ({ x, y, color, letra, clicks = [], escala = 1, opacidad = 1 }) => {
  const frame = useCurrentFrame();
  const presion = clicks.reduce((m, c) => Math.max(m, interpolate(frame, [c - 3, c, c + 4], [0, 1, 0], clamp)), 0);
  const s = escala * (1 - presion * 0.18);
  const t = 46;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `scale(${s})`, transformOrigin: "0 0", opacity: opacidad }}>
      <svg width={t} height={t} viewBox="0 0 32 32" style={{ position: "absolute", left: -4 * (t / 32), top: -3 * (t / 32), overflow: "visible", filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.45))" }}>
        <path d="M4 3 L28 13.5 L17.2 17.2 L13.5 28 Z" fill={color} stroke="white" strokeWidth={2.4} strokeLinejoin="round" />
      </svg>
      {letra ? (
        <div
          style={{
            position: "absolute",
            left: t * 0.55,
            top: t * 0.62,
            width: 38,
            height: 38,
            borderRadius: 99,
            background: color,
            border: "2.5px solid white",
            color: "#0C0C0E",
            fontFamily: F_TEXTO,
            fontWeight: 800,
            fontSize: 19,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 6px 14px rgba(0,0,0,0.4)",
          }}
        >
          {letra}
        </div>
      ) : null}
      {presion > 0 ? (
        <div
          style={{
            position: "absolute",
            left: -26,
            top: -26,
            width: 52,
            height: 52,
            borderRadius: 99,
            border: `2px solid ${color}`,
            opacity: presion * 0.8,
            transform: `scale(${0.6 + presion * 0.5})`,
          }}
        />
      ) : null}
    </div>
  );
};

/* ───────── Etiqueta en pill ───────── */

export const Pill: React.FC<{ texto: string; entra: number; style?: React.CSSProperties }> = ({ texto, entra, style }) => {
  const { s, visible, op } = usePop(entra, { damping: 14, stiffness: 230, mass: 0.6 });
  if (!visible) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 96,
        bottom: 92,
        transform: `scale(${0.5 + 0.5 * s}) translateY(${(1 - s) * 30}px)`,
        transformOrigin: "0% 100%",
        opacity: op,
        padding: "16px 34px 17px",
        borderRadius: 999,
        background: "rgba(14,14,17,0.78)",
        backdropFilter: "blur(14px)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.12), inset 0 1px 0 rgba(255,255,255,0.1), 0 18px 40px rgba(0,0,0,0.45)",
        color: "white",
        fontFamily: F_TEXTO,
        fontSize: 50,
        fontWeight: 700,
        fontStretch: "75%",
        letterSpacing: "0.01em",
        textTransform: "uppercase",
        lineHeight: 1,
        ...style,
      }}
    >
      {texto}
    </div>
  );
};

/* ───────── Dispositivos ───────── */

export const Telefono: React.FC<{ src: string; ancho: number; style?: React.CSSProperties; sombra?: boolean }> = ({
  src,
  ancho,
  style,
  sombra = true,
}) => {
  const alto = ancho * 2.165;
  const borde = ancho * 0.03;
  return (
    <div
      style={{
        width: ancho,
        height: alto,
        borderRadius: ancho * 0.15,
        background: "linear-gradient(160deg, #2a2a2f, #0b0b0d 40%, #1a1a1e)",
        padding: borde,
        boxShadow: sombra
          ? "0 0 0 1.5px rgba(255,255,255,0.16), 0 40px 90px rgba(0,0,0,0.6), 0 12px 30px rgba(0,0,0,0.4)"
          : "0 0 0 1.5px rgba(255,255,255,0.16)",
        position: "relative",
        ...style,
      }}
    >
      <div style={{ width: "100%", height: "100%", borderRadius: ancho * 0.122, overflow: "hidden", background: "#000", position: "relative" }}>
        <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
        <div
          style={{
            position: "absolute",
            top: ancho * 0.03,
            left: "50%",
            width: ancho * 0.29,
            height: ancho * 0.082,
            transform: "translateX(-50%)",
            borderRadius: 999,
            background: "#000",
          }}
        />
      </div>
    </div>
  );
};

export const Navegador: React.FC<{ src: string; ancho: number; style?: React.CSSProperties }> = ({ src, ancho, style }) => {
  const barra = ancho * 0.032;
  return (
    <div
      style={{
        width: ancho,
        borderRadius: ancho * 0.014,
        overflow: "hidden",
        background: "#18181b",
        boxShadow: "0 0 0 1.5px rgba(255,255,255,0.12), 0 40px 100px rgba(0,0,0,0.55)",
        ...style,
      }}
    >
      <div style={{ height: barra, display: "flex", alignItems: "center", gap: barra * 0.28, paddingLeft: barra * 0.5 }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <div key={c} style={{ width: barra * 0.32, height: barra * 0.32, borderRadius: 99, background: c, opacity: 0.85 }} />
        ))}
      </div>
      <Img src={src} style={{ width: "100%", display: "block", aspectRatio: "1440 / 900", objectFit: "cover" }} />
    </div>
  );
};

/* ───────── Texto cinético ───────── */

export const Palabra: React.FC<{ entra: number; children: React.ReactNode; style?: React.CSSProperties; desde?: number }> = ({
  entra,
  children,
  style,
  desde = 0.42,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - entra, fps, config: { damping: 15, stiffness: 240, mass: 0.6 } });
  const op = interpolate(frame - entra, [0, 4], [0, 1], clamp);
  const blur = interpolate(frame - entra, [0, 6], [12, 0], clamp);
  return (
    <span
      style={{
        display: "inline-block",
        opacity: op,
        transform: `translateY(${(1 - s) * desde}em) scale(${0.86 + 0.14 * s})`,
        filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

export const estiloGrande = (tamano: number): React.CSSProperties => ({
  fontFamily: F_GRANDE,
  fontWeight: 600,
  fontSize: tamano,
  letterSpacing: "-0.004em",
  lineHeight: 1.08,
  color: "white",
});

/* ───────── Sonido ───────── */

const GOLPE = {
  burbuja: 0.047,
  "pop-b": 0.035,
  tap: 0.01,
  click: 0.01,
  "key-b": 0.015,
  "key-soft": 0.02,
  "whoosh-short": 0.54,
  "whoosh-soft": 0.7,
  "whoosh-big": 1.09,
  "swoosh-tiny": 0.05,
  "escena-entra": 0.506,
  tarjeta: 0.07,
  "tarjeta-b": 0.067,
  "check-b": 0.015,
  remate: 0.124,
  "remate-b": 0.122,
  "cta-cierre": 0.025,
  tachado: 0,
  trazo: 0.055,
  "zoom-punch": 0.119,
} as const;

export type NombreSfx = keyof typeof GOLPE;

/** El golpe del sonido cae en `en`. Sin trimBefore: si hace falta, la Sequence arranca en un cuadro negativo. */
export const Sfx: React.FC<{ nombre: NombreSfx; en: number; volumen: number }> = ({ nombre, en, volumen }) => {
  const lead = Math.round(GOLPE[nombre] * 30);
  const ext = nombre === "whoosh-short" ? "mp3" : "wav";
  return (
    <Sequence from={en - lead} layout="none" name={`sfx:${nombre}`} showInTimeline={false}>
      <Audio src={archivo(`sfx/${nombre}.${ext}`)} volume={volumen} showInTimeline={false} />
    </Sequence>
  );
};
