import type { CSSProperties, ReactNode } from "react";
import { Img, spring, staticFile, useCurrentFrame } from "remotion";
import { ease } from "../../reserva/motion";

export const springAt = (frame: number, at: number, config: { damping?: number; stiffness?: number; mass?: number } = { damping: 200 }) =>
  spring({ frame: frame - at, fps: 30, config });

export const C = {
  bg: "#000000",
  verde: "#22c55e",
  verdeSuave: "rgba(34,197,94,0.18)",
  vidrio: "rgba(255,255,255,0.05)",
  borde: "rgba(255,255,255,0.10)",
  texto: "#f5f5f7",
  apagado: "#86868b",
} as const;

export const F = {
  titulo: "'Europa Grotesk', 'Segoe UI', system-ui, sans-serif",
  texto: "'Segoe UI', system-ui, -apple-system, sans-serif",
  mono: "Consolas, 'Courier New', monospace",
} as const;

export const FuentesCss = () => (
  <style>{`@font-face{font-family:'Europa Grotesk';src:url(${staticFile("fonts/EuropaGrotesk-DemiBold.ttf")});font-weight:600}`}</style>
);

/** Escenario negro con dos brillos verdes que derivan despacio. */
export const Escenario = ({ children, intensidad = 1 }: { children?: ReactNode; intensidad?: number }) => {
  const f = useCurrentFrame();
  const x1 = 50 + Math.sin(f / 70) * 18;
  const y1 = 30 + Math.cos(f / 90) * 12;
  const x2 = 60 + Math.cos(f / 80) * 20;
  const y2 = 78 + Math.sin(f / 60) * 10;
  return (
    <div style={{ position: "absolute", inset: 0, background: C.bg, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(900px 900px at ${x1}% ${y1}%, rgba(34,197,94,${0.2 * intensidad}), transparent 65%), radial-gradient(800px 800px at ${x2}% ${y2}%, rgba(34,197,94,${0.11 * intensidad}), transparent 65%)`,
        }}
      />
      {children}
    </div>
  );
};

export const Vidrio = ({ style, children }: { style?: CSSProperties; children?: ReactNode }) => (
  <div
    style={{
      background: C.vidrio,
      border: `1px solid ${C.borde}`,
      borderRadius: 40,
      backdropFilter: "blur(14px)",
      boxShadow: "0 30px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Cámara: acercamiento + giro suave en 3D sobre todo lo que contiene. */
export const Camara = ({
  children,
  frames,
  desde = { s: 1, ry: 0, rx: 0, x: 0, y: 0 },
  hasta = { s: 1.08, ry: 0, rx: 0, x: 0, y: 0 },
}: {
  children: ReactNode;
  frames: number;
  desde?: { s: number; ry: number; rx: number; x: number; y: number };
  hasta?: { s: number; ry: number; rx: number; x: number; y: number };
}) => {
  const f = useCurrentFrame();
  const t = ease(f, [0, frames]);
  const v = (k: keyof typeof desde) => desde[k] + (hasta[k] - desde[k]) * t;
  return (
    <div style={{ position: "absolute", inset: 0, perspective: 2400 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${v("x")}px, ${v("y")}px) rotateY(${v("ry")}deg) rotateX(${v("rx")}deg) scale(${v("s")})`,
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Marco de celular con borde que brilla. */
export const Celular = ({ children, brillo = 0.5 }: { children: ReactNode; brillo?: number }) => (
  <div
    style={{
      position: "absolute",
      left: 190,
      top: 330,
      width: 700,
      height: 1380,
      borderRadius: 96,
      background: "#050505",
      border: "3px solid rgba(255,255,255,0.18)",
      boxShadow: `0 0 0 10px #0b0b0b, 0 0 ${90 * brillo}px rgba(34,197,94,${0.55 * brillo}), 0 60px 120px rgba(0,0,0,0.7)`,
      overflow: "hidden",
    }}
  >
    <div style={{ position: "absolute", left: 245, top: 22, width: 210, height: 46, borderRadius: 30, background: "#000", zIndex: 5 }} />
    {children}
  </div>
);

export const Burbuja = ({
  texto,
  lado,
  at,
  verde,
  children,
}: {
  texto?: string;
  lado: "izq" | "der";
  at: number;
  verde?: boolean;
  children?: ReactNode;
}) => {
  const f = useCurrentFrame();
  const t = springAt(f, at, { damping: 16, stiffness: 190, mass: 0.7 });
  if (f < at) return null;
  return (
    <div
      style={{
        alignSelf: lado === "izq" ? "flex-start" : "flex-end",
        maxWidth: 520,
        padding: "22px 28px",
        borderRadius: 34,
        borderBottomLeftRadius: lado === "izq" ? 8 : 34,
        borderBottomRightRadius: lado === "der" ? 8 : 34,
        background: verde ? C.verde : "rgba(255,255,255,0.1)",
        color: verde ? "#04210f" : C.texto,
        fontFamily: F.texto,
        fontSize: 38,
        lineHeight: 1.25,
        fontWeight: 500,
        opacity: Math.min(1, t * 1.6),
        transform: `translateY(${(1 - t) * 36}px) scale(${0.9 + 0.1 * t})`,
        transformOrigin: lado === "izq" ? "left bottom" : "right bottom",
      }}
    >
      {texto}
      {children}
    </div>
  );
};

export const Escribiendo = ({ desde, hasta }: { desde: number; hasta: number }) => {
  const f = useCurrentFrame();
  if (f < desde || f >= hasta) return null;
  return (
    <div style={{ alignSelf: "flex-start", display: "flex", gap: 10, padding: "26px 30px", borderRadius: 34, background: "rgba(255,255,255,0.1)" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ width: 16, height: 16, borderRadius: 8, background: C.apagado, opacity: 0.4 + 0.6 * Math.max(0, Math.sin((f - i * 4) / 4)) }} />
      ))}
    </div>
  );
};

/** Número que cuenta hacia arriba entre dos frames. */
export const Contador = ({
  de,
  a,
  desde,
  hasta,
  prefijo = "",
  style,
}: {
  de: number;
  a: number;
  desde: number;
  hasta: number;
  prefijo?: string;
  style?: CSSProperties;
}) => {
  const f = useCurrentFrame();
  const v = Math.round(de + (a - de) * ease(f, [desde, hasta]));
  return <span style={style}>{prefijo}{v.toLocaleString("es-AR")}</span>;
};

export const Chip = ({ texto, verde }: { texto: string; verde?: boolean }) => (
  <span
    style={{
      display: "inline-block",
      whiteSpace: "nowrap",
      padding: "8px 20px",
      borderRadius: 999,
      fontFamily: F.texto,
      fontSize: 26,
      fontWeight: 600,
      background: verde ? C.verdeSuave : "rgba(255,255,255,0.08)",
      color: verde ? C.verde : C.texto,
      border: `1px solid ${verde ? "rgba(34,197,94,0.4)" : C.borde}`,
    }}
  >
    {texto}
  </span>
);

/** Texto grande que entra desenfocado desde abajo. */
export const TextoGrande = ({
  texto,
  at,
  tamano = 120,
  color = C.texto,
  style,
}: {
  texto: string;
  at: number;
  tamano?: number;
  color?: string;
  style?: CSSProperties;
}) => {
  const f = useCurrentFrame();
  const t = ease(f, [at, at + 14]);
  return (
    <div
      style={{
        fontFamily: F.titulo,
        fontWeight: 600,
        fontSize: tamano,
        letterSpacing: "-0.02em",
        wordSpacing: "0.16em",
        lineHeight: 1.02,
        color,
        textAlign: "center",
        opacity: t,
        transform: `translateY(${(1 - t) * 60}px) scale(${1.12 - 0.12 * t})`,
        filter: `blur(${(1 - t) * 18}px)`,
        ...style,
      }}
    >
      {texto}
    </div>
  );
};

export const LogoTrendSpot = ({ ancho = 520, style }: { ancho?: number; style?: CSSProperties }) => (
  <Img src={staticFile("spec-ad/phoneos/trendspot-logo.png")} style={{ width: ancho, ...style }} />
);

export const LogoNexora = ({ ancho = 360, style }: { ancho?: number; style?: CSSProperties }) => (
  <Img src={staticFile("spec-ad/phoneos/nexora-logo-blanco.png")} style={{ width: ancho, ...style }} />
);
