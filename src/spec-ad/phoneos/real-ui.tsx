import type { CSSProperties, ReactNode } from "react";
import { Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { REAL, type PiezaReal } from "./real";
import { C } from "./ui";

export type Escena = keyof typeof REAL;

export const archivoReal = (escena: Escena | "escritorio", archivo: string) => staticFile(`spec-ad/phoneos/real/${escena}/${archivo}`);

export const pieza = (escena: Escena, id: string): PiezaReal => {
  const p = REAL[escena].items.find((i) => i.id === id);
  if (!p) throw new Error(`Falta la pieza ${escena}/${id}`);
  return p;
};

const CURVA = Easing.bezier(0.65, 0, 0.35, 1);

/** Interpola por fotogramas clave con curva suave en cada tramo. */
export const kf = (f: number, pts: readonly (readonly [number, number])[]) =>
  interpolate(
    f,
    pts.map((p) => p[0]),
    pts.map((p) => p[1]),
    { easing: CURVA, extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

/** Celular flotante: la captura real (px CSS de 390 de ancho) escalada al marco. */
export const Telefono = ({
  x,
  y,
  ancho,
  alto,
  brillo = 0.6,
  children,
}: {
  x: number;
  y: number;
  ancho: number;
  alto: number;
  brillo?: number;
  children: ReactNode;
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: ancho,
      height: alto,
      borderRadius: 78,
      padding: 14,
      background: "linear-gradient(160deg, #1c1c1e, #050505 60%)",
      boxShadow: `0 0 0 2px rgba(255,255,255,0.16), 0 0 ${110 * brillo}px rgba(34,197,94,${0.45 * brillo}), 0 80px 160px rgba(0,0,0,0.8)`,
    }}
  >
    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 64, overflow: "hidden", background: "#0a0a0a" }}>{children}</div>
  </div>
);

/** Contenido en px CSS de la captura, escalado. `scroll` corre todo hacia arriba. */
export const Lienzo = ({ escala, scroll = 0, children, style }: { escala: number; scroll?: number; children: ReactNode; style?: CSSProperties }) => (
  <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: `scale(${escala}) translateY(${-scroll}px)`, ...style }}>{children}</div>
);

/** Un tramo horizontal de la captura de fondo (desde/hasta en px CSS), puesto en `top`. */
export const Franja = ({ escena, desde, hasta, top = desde, ancho }: { escena: Escena; desde: number; hasta: number; top?: number; ancho: number }) => (
  <div style={{ position: "absolute", left: 0, top, width: ancho, height: hasta - desde, overflow: "hidden" }}>
    <Img src={archivoReal(escena, "fondo.png")} style={{ position: "absolute", left: 0, top: -desde, width: ancho }} />
  </div>
);

/** Pieza real que entra con resorte (sube, se agranda desde su lado y se enfoca). */
export const PiezaEntra = ({
  escena,
  id,
  at,
  lado = "izq",
  dy = 0,
  dx = 0,
  resalte = 0,
  style,
}: {
  escena: Escena;
  id: string;
  at: number;
  lado?: "izq" | "der" | "centro";
  dy?: number;
  dx?: number;
  resalte?: number;
  style?: CSSProperties;
}) => {
  const f = useCurrentFrame();
  const p = pieza(escena, id);
  if (f < at) return null;
  const t = interpolate(f, [at, at + 9], [0, 1], { easing: Easing.out(Easing.back(1.4)), extrapolateRight: "clamp" });
  const o = interpolate(f, [at, at + 5], [0, 1], { extrapolateRight: "clamp" });
  const origen = lado === "izq" ? "left bottom" : lado === "der" ? "right bottom" : "center";
  return (
    <Img
      src={archivoReal(escena, p.archivo)}
      style={{
        position: "absolute",
        left: p.x + dx,
        top: p.y + dy,
        width: p.w,
        height: p.h,
        opacity: o,
        transformOrigin: origen,
        transform: `translateY(${(1 - t) * 18}px) scale(${0.86 + 0.14 * t})`,
        filter: `blur(${(1 - o) * 4}px)${resalte > 0 ? ` drop-shadow(0 0 ${14 * resalte}px rgba(34,197,94,${0.7 * resalte}))` : ""}`,
        ...style,
      }}
    />
  );
};

/** Pieza real fija (sin entrada). */
export const PiezaFija = ({ escena, id, dx = 0, dy = 0, style }: { escena: Escena; id: string; dx?: number; dy?: number; style?: CSSProperties }) => {
  const p = pieza(escena, id);
  return <Img src={archivoReal(escena, p.archivo)} style={{ position: "absolute", left: p.x + dx, top: p.y + dy, width: p.w, height: p.h, ...style }} />;
};

/** Anillo verde que late alrededor de una caja (px CSS). */
export const Anillo = ({
  x,
  y,
  w,
  h,
  at,
  hasta,
  radio = 10,
  color = C.verde,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  at: number;
  hasta?: number;
  radio?: number;
  color?: string;
}) => {
  const f = useCurrentFrame();
  if (f < at || (hasta !== undefined && f > hasta)) return null;
  const sale = hasta === undefined ? 0 : interpolate(f, [hasta - 6, hasta], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t = interpolate(f, [at, at + 8], [0, 1], { easing: Easing.out(Easing.cubic), extrapolateRight: "clamp" }) * (1 - sale);
  const late = 0.5 + 0.5 * Math.sin((f - at) / 4);
  return (
    <div
      style={{
        position: "absolute",
        left: x - 4,
        top: y - 4,
        width: w + 8,
        height: h + 8,
        borderRadius: radio,
        border: `2px solid ${color}`,
        opacity: t,
        transform: `scale(${1.15 - 0.15 * t})`,
        boxShadow: `0 0 ${10 + 10 * late}px ${color}, inset 0 0 ${6 + 6 * late}px rgba(34,197,94,0.35)`,
      }}
    />
  );
};

/** Entrada y salida de cada plano: entra frenando desde el desenfoque, sale acelerando. */
export const Plano = ({ frames, children, desdeEscala = 1.1, haciaEscala = 0.94 }: { frames: number; children: ReactNode; desdeEscala?: number; haciaEscala?: number }) => {
  const f = useCurrentFrame();
  const entra = interpolate(f, [0, 10], [0, 1], { easing: Easing.out(Easing.cubic), extrapolateRight: "clamp" });
  const sale = interpolate(f, [frames - 7, frames], [0, 1], { easing: Easing.in(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const s = (desdeEscala + (1 - desdeEscala) * entra) * (1 + (haciaEscala - 1) * sale);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: entra * (1 - sale),
        transform: `scale(${s})`,
        filter: `blur(${(1 - entra) * 16 + sale * 14}px)`,
      }}
    >
      {children}
    </div>
  );
};

/** Leyenda arriba: palabras grandes, la última en verde. */
export const Leyenda = ({
  texto,
  verde,
  at,
  hasta,
  top = 150,
  velo = 230,
}: {
  texto: string;
  verde?: string;
  at: number;
  hasta?: number;
  top?: number;
  /** Alto del velo negro debajo del texto, contado desde `top`: largo solo si la interfaz sube detrás. */
  velo?: number;
}) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [at, at + 12], [0, 1], { easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const s = hasta === undefined ? 0 : interpolate(f, [hasta - 6, hasta], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (f < at || (hasta !== undefined && f > hasta)) return null;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: top + velo,
          zIndex: 20,
          background: "linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.97) 68%, rgba(0,0,0,0) 100%)",
          opacity: t * (1 - s),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top,
          zIndex: 21,
          textAlign: "center",
          fontFamily: "'Europa Grotesk', 'Segoe UI', sans-serif",
          fontWeight: 600,
          fontSize: 92,
          lineHeight: 1.04,
          letterSpacing: "-0.02em",
          wordSpacing: "0.16em",
          color: C.texto,
          opacity: t * (1 - s),
          transform: `translateY(${(1 - t) * 40 - s * 20}px)`,
          filter: `blur(${(1 - t) * 14 + s * 10}px)`,
          textShadow: "0 8px 40px rgba(0,0,0,0.8)",
        }}
      >
        {texto}
        {verde ? <span style={{ color: C.verde }}> {verde}</span> : null}
      </div>
    </>
  );
};
