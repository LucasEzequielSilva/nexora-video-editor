import { Img, interpolateColors, staticFile, useCurrentFrame } from "remotion";
import DashedPath from "../../reserva/components/dashed-path";
import KineticLine from "../../reserva/components/kinetic-line";
import Sfx from "../../reserva/components/sfx";
import { ease, lerp, springAt } from "../../reserva/motion";
import { ACCENT, FONT, PAPER, SHADOW, SPRING } from "../../reserva/theme";
import type { EscenaPreview, EscenaProps } from "./tipos";

/** Proceso por pasos: cada paso entra cuando se nombra (`cue`). El último termina con un chip de estado. */
export type Datos = {
  titulo: { chico: string; grande: string };
  /** `icono`: ícono premium (ruta en public/, ver assets/catalogo/iconos.md) en lugar del número del paso. */
  pasos: { nombre: string; cue: string; icono?: string }[];
  /** Texto del chip verde que cierra el último paso. Sin chip si se omite. */
  estadoFinal?: string;
};

export const PREVIEW: EscenaPreview<Datos> = {
  durationInFrames: 174,
  cues: { titulo: 8, p1: 50, p2: 80, p3: 97, p4: 123, p5: 142 },
  datos: {
    titulo: { chico: "Armamos tu", grande: "contenido" },
    pasos: [
      { nombre: "Estrategia", cue: "p1", icono: "recursos/icono-003.png" },
      { nombre: "Guion", cue: "p2", icono: "recursos/icono-006.png" },
      { nombre: "Grabación", cue: "p3", icono: "recursos/icono-002.png" },
      { nombre: "Edición", cue: "p4", icono: "recursos/icono-004.png" },
      { nombre: "Publicación", cue: "p5", icono: "recursos/icono-012.png" },
    ],
    estadoFinal: "Publicado",
  },
};

const W = 480;
const H = 150;
const X_IZQ = 80;
const X_DER = 520;
const Y0 = 610;
const PASO_Y = 180;
/** Borde superior del PiP abajo-izquierda: una tarjeta a la izquierda que baje de acá se corre a la derecha. */
const PIP_TOP = 1222;
const X_ESQUIVA_PIP = 420;
const ROTACIONES = [-1.6, 1.4, -1.2, 1.6, -0.8];
const TILE_GRIS = "#f1f1ee";

type Caja = { x: number; cy: number; lado: "izq" | "der" };

const cajas = (n: number): Caja[] =>
  Array.from({ length: n }, (_, i) => {
    const lado = i % 2 === 0 ? "izq" : "der";
    const cy = Y0 + i * PASO_Y;
    if (lado === "izq" && cy + H / 2 > PIP_TOP) return { x: X_ESQUIVA_PIP, cy: cy + 22, lado };
    return { x: lado === "izq" ? X_IZQ : X_DER, cy, lado };
  });

type Conector = { d: string; fin: { x: number; y: number }; angulo: number };

const conector = (a: Caja, b: Caja): Conector => {
  const sy = a.cy + H / 2 + 12;
  if (b.lado === "der") {
    const sx = a.x + 290;
    const ex = b.x - 14;
    return { d: `M ${sx} ${sy} C ${sx} ${sy + 76}, ${ex - 60} ${b.cy}, ${ex} ${b.cy}`, fin: { x: ex, y: b.cy }, angulo: 0 };
  }
  const ex = b.x + W + 14;
  const sx = ex > a.x + 120 ? a.x + W - 50 : a.x + 200;
  return { d: `M ${sx} ${sy} C ${sx} ${sy + 80}, ${ex + 55} ${b.cy}, ${ex} ${b.cy}`, fin: { x: ex, y: b.cy }, angulo: 180 };
};

const Flecha = ({ x, y, angulo, opacity }: { x: number; y: number; angulo: number; opacity: number }) => (
  <path
    d="M -14 -9 L 0 0 L -14 9"
    fill="none"
    stroke={PAPER.muted}
    strokeWidth={3}
    strokeLinecap="round"
    strokeLinejoin="round"
    opacity={opacity}
    transform={`translate(${x} ${y}) rotate(${angulo})`}
  />
);

type TarjetaProps = {
  caja: Caja;
  indice: number;
  nombre: string;
  icono?: string;
  entra: number;
  activo: number;
  listo: number;
  frame: number;
};

const TAM_ICONO = 124;

const Tarjeta = ({ caja, indice, nombre, icono, entra, activo, listo, frame }: TarjetaProps) => {
  const t = springAt(frame, entra, SPRING.soft);
  const lado = caja.lado === "izq" ? -1 : 1;
  const flote = Math.sin((frame + indice * 17) / 26) * 5;
  const giro = ROTACIONES[indice % ROTACIONES.length] + lado * (1 - t) * 5 + Math.sin((frame + indice * 11) / 34) * 0.3;
  const fondoTile = interpolateColors(listo, [0, 1], [interpolateColors(activo, [0, 1], [TILE_GRIS, PAPER.ink]), ACCENT.green]);
  const colorNumero = interpolateColors(Math.max(activo, listo), [0, 1], [PAPER.muted, "#ffffff"]);

  return (
    <div
      style={{
        position: "absolute",
        left: caja.x,
        top: caja.cy - H / 2,
        width: W,
        height: H,
        boxSizing: "border-box",
        padding: "0 26px 0 26px",
        display: "flex",
        alignItems: "center",
        gap: 24,
        borderRadius: 26,
        background: PAPER.card,
        boxShadow: `${SHADOW.card}, 0 0 0 ${listo * 3}px rgba(34,197,94,${0.35 * listo})`,
        opacity: Math.min(1, t * 1.4),
        transform: `translate(${lado * (1 - t) * 160}px, ${(1 - t) * 34 + flote}px) rotate(${giro}deg)`,
        filter: t < 0.99 ? `blur(${(1 - t) * 10}px)` : undefined,
      }}
    >
      {icono ? (
        // El ícono 3D se sale un poco de la tarjeta (arriba e izquierda) y crece cuando el paso está activo.
        <div style={{ width: 96, height: 96, flexShrink: 0, position: "relative" }}>
          <Img
            src={staticFile(icono)}
            style={{
              position: "absolute",
              left: (96 - TAM_ICONO) / 2 - 6,
              top: (96 - TAM_ICONO) / 2 - 8,
              width: TAM_ICONO,
              height: TAM_ICONO,
              objectFit: "contain",
              transform: `scale(${1 + 0.1 * activo}) rotate(${-4 * activo}deg)`,
              filter: `drop-shadow(0 10px 16px rgba(0,0,0,0.22)) drop-shadow(0 0 ${14 * listo}px rgba(34,197,94,${0.7 * listo}))`,
            }}
          />
        </div>
      ) : (
        <div
          style={{
            width: 96,
            height: 96,
            flexShrink: 0,
            borderRadius: 20,
            background: fondoTile,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONT.serif,
            fontStyle: "italic",
            fontSize: 54,
            lineHeight: 1,
            color: colorNumero,
          }}
        >
          {String(indice + 1).padStart(2, "0")}
        </div>
      )}
      <span
        style={{
          fontFamily: FONT.sans,
          fontWeight: 700,
          fontSize: 54,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          color: PAPER.ink,
          whiteSpace: "nowrap",
        }}
      >
        {nombre}
      </span>
    </div>
  );
};

const ChipEstado = ({ texto, caja, at, frame }: { texto: string; caja: Caja; at: number; frame: number }) => {
  const t = springAt(frame, at, SPRING.pop);
  const tilde = ease(frame, [at + 4, at + 14]);
  return (
    <div
      style={{
        position: "absolute",
        right: 1080 - (caja.x + W + 6),
        top: caja.cy + H / 2 + 16,
        height: 62,
        padding: "0 26px 0 12px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        borderRadius: 31,
        background: ACCENT.greenSoft,
        boxShadow: SHADOW.soft,
        opacity: Math.min(1, t * 1.6),
        transform: `translateY(${(1 - Math.min(1, t)) * 18}px) scale(${lerp(0.7, 1, t)}) rotate(2deg)`,
        transformOrigin: "right center",
      }}
    >
      <svg width={40} height={40} viewBox="0 0 40 40">
        <circle cx={20} cy={20} r={20} fill={ACCENT.green} />
        <path
          d="M 11 20.5 L 17.5 27 L 29 14"
          fill="none"
          stroke="#ffffff"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - tilde}
        />
      </svg>
      <span style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 34, letterSpacing: "-0.02em", color: ACCENT.greenDark }}>
        {texto}
      </span>
    </div>
  );
};

export default function Proceso({ durationInFrames, cues, datos }: EscenaProps<Datos>) {
  const frame = useCurrentFrame();
  const D = durationInFrames;
  const n = datos.pasos.length;
  const aTitulo = cues.titulo ?? Math.round(D * 0.05);
  const cuePasos = datos.pasos.map((p, i) => cues[p.cue] ?? Math.round(D * (0.25 + i * 0.14)));
  const entradas = cuePasos.map((c) => c - 3);
  const ultimo = cuePasos[n - 1] ?? D;
  const aChip = Math.min(ultimo + 3, D - 30);
  const listo = datos.estadoFinal ? ease(frame, [aChip, aChip + 8]) : 0;

  const geo = cajas(n);
  const conectores = geo.slice(1).map((b, i) => conector(geo[i], b));
  const deriva = lerp(26, -26, frame / D);
  const derivaTitulo = lerp(10, -10, frame / D);

  return (
    <>
      <div style={{ position: "absolute", left: X_IZQ, top: 200, transform: `translateY(${derivaTitulo}px)` }}>
        <KineticLine parts={[{ text: datos.titulo.chico, font: "serif", at: aTitulo, size: 84 }]} align="left" />
        <KineticLine
          parts={[{ text: datos.titulo.grande, font: "sans", at: aTitulo + 12 }]}
          size={168}
          align="left"
          style={{ marginTop: 4 }}
        />
      </div>

      <div style={{ position: "absolute", inset: 0, transform: `translateY(${deriva}px)` }}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
          {conectores.map((c, i) => {
            const destino = cuePasos[i + 1];
            const p = ease(frame, [destino - 12, destino + 3]);
            return (
              <g key={i}>
                <DashedPath d={c.d} progress={p} strokeWidth={3.5} dash={11} gap={10} offset={frame * 0.6} />
                <Flecha x={c.fin.x} y={c.fin.y} angulo={c.angulo} opacity={ease(p, [0.85, 1])} />
              </g>
            );
          })}
        </svg>

        {datos.pasos.map((paso, i) => {
          const siguiente = cuePasos[i + 1];
          const activo =
            ease(frame, [cuePasos[i], cuePasos[i] + 8]) * (siguiente === undefined ? 1 : 1 - ease(frame, [siguiente, siguiente + 8]));
          return (
            <Tarjeta
              key={paso.cue}
              caja={geo[i]}
              indice={i}
              nombre={paso.nombre}
              icono={paso.icono}
              entra={entradas[i]}
              activo={activo}
              listo={i === n - 1 ? listo : 0}
              frame={frame}
            />
          );
        })}

        {datos.estadoFinal && n > 0 && <ChipEstado texto={datos.estadoFinal} caja={geo[n - 1]} at={aChip} frame={frame} />}
      </div>

      {cuePasos.map((c, i) =>
        datos.estadoFinal && Math.abs(c - aChip) < 3 ? null : (
          <Sfx key={i} name={(["tarjeta", "tarjeta-b", "tarjeta-c"] as const)[i % 3]} at={c} volume={0.045} />
        ),
      )}
      {datos.estadoFinal && <Sfx name="double-click" at={aChip} volume={0.2} />}
    </>
  );
}
