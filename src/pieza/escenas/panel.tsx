import type { CSSProperties } from "react";
import { spring, useCurrentFrame } from "remotion";
import Sfx from "../../reserva/components/sfx";
import { ease, easeInOut, lerp, springAt } from "../../reserva/motion";
import { ACCENT, FONT, PAPER, SHADOW, SPRING } from "../../reserva/theme";
import type { EscenaPreview, EscenaProps } from "./tipos";

/**
 * Dashboard: cada métrica entra en su `cue`. OJO: los valores son de ejemplo hasta que Lucas pase datos reales
 * (regla del proyecto: no presentar cifras inventadas como reales).
 */
export type Datos = {
  /** Palabra que abre la escena, grande, y después queda como título arriba del panel. */
  palabra?: { texto: string; cue: string };
  titulo: string;
  periodo: string;
  panelCue?: string;
  metricas: { etiqueta: string; valor: number; cue: string; tono: "neutro" | "bueno" | "malo" }[];
  /** Remate. Lo que va antes de la primera coma sale en sans bold; el resto, en serif itálica. */
  frase?: { texto: string; cue: string };
};

export const PREVIEW: EscenaPreview<Datos> = {
  durationInFrames: 174,
  cues: { medir: 6, panel: 26, entro: 67, agendo: 93, perdio: 125, frase: 139 },
  datos: {
    palabra: { texto: "Medir", cue: "medir" },
    titulo: "Panel",
    periodo: "Esta semana",
    panelCue: "panel",
    metricas: [
      { etiqueta: "Entraron", valor: 48, cue: "entro", tono: "neutro" },
      { etiqueta: "Se agendaron", valor: 31, cue: "agendo", tono: "bueno" },
      { etiqueta: "Se perdieron", valor: 6, cue: "perdio", tono: "malo" },
    ],
    frase: { texto: "Números, no sensaciones", cue: "frase" },
  },
};

const TONO: Record<Datos["metricas"][number]["tono"], { punto: string; valor: string; barra: string; fondo: string }> = {
  neutro: { punto: PAPER.ink, valor: PAPER.ink, barra: "linear-gradient(90deg, #2a2a2a, #111111)", fondo: "#f1f1ee" },
  bueno: { punto: ACCENT.green, valor: ACCENT.greenDark, barra: `linear-gradient(90deg, ${ACCENT.green}, #34d672)`, fondo: ACCENT.greenSoft },
  malo: { punto: ACCENT.red, valor: "#C8363B", barra: "linear-gradient(90deg, #EE6B6F, #E5484D)", fondo: "#FDECEC" },
};

const PANEL = { left: 96, top: 372, width: 888, radius: 36, barra: 64 };
const FILA = { alto: 184, gap: 16 };
const TITULO_Y = 196;

const deslizar = (frame: number, at: number, dx: number, dy: number, dur = 16): CSSProperties => {
  const t = ease(frame, [at, at + dur]);
  return {
    opacity: t,
    transform: `translate(${(1 - t) * dx}px, ${(1 - t) * dy}px)`,
    filter: t < 1 ? `blur(${(1 - t) * 10}px)` : undefined,
  };
};

const Esqueleto = ({ opacidad, frame }: { opacidad: number; frame: number }) => {
  if (opacidad <= 0.001) return null;
  const brillo = ((frame * 18) % 1500) - 300;
  return (
    <div style={{ position: "absolute", inset: 0, padding: "44px 36px", opacity: opacidad }}>
      <div style={{ width: 230, height: 24, borderRadius: 12, background: "#ececea" }} />
      <div style={{ position: "absolute", right: 38, top: 36, width: 130, height: 70, borderRadius: 16, background: "#f0f0ee" }} />
      <div style={{ position: "absolute", left: 36, right: 36, bottom: 28, height: 14, borderRadius: 7, background: "#f0f0ee" }} />
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: brillo,
          width: 220,
          background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.75), rgba(255,255,255,0))",
        }}
      />
    </div>
  );
};

const Fila = ({ metrica, at, max, top }: { metrica: Datos["metricas"][number]; at: number; max: number; top: number }) => {
  const frame = useCurrentFrame();
  const tono = TONO[metrica.tono];
  const entra = ease(frame, [at, at + 14]);
  const cuenta = ease(frame, [at + 3, at + 22]);
  const barra = easeInOut(frame, [at + 6, at + 30]);
  const lift = ease(frame, [at, at + 8]) * (1 - springAt(frame, at + 12, SPRING.soft));
  const flote = Math.sin((frame + top) / 22) * 2;

  return (
    <div
      style={{
        position: "absolute",
        left: 32,
        right: 32,
        top,
        height: FILA.alto,
        zIndex: lift > 0.01 ? 2 : 1,
        transform: `translateY(${flote * entra - 6 * lift}px) scale(${1 + 0.025 * lift})`,
      }}
    >
      <div style={{ position: "absolute", inset: 0, borderRadius: 24, boxShadow: SHADOW.lifted, opacity: lift }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 24,
          background: "#fbfbfa",
          border: "1.5px solid #efefec",
          boxShadow: entra > 0.01 ? SHADOW.soft : "none",
          overflow: "hidden",
        }}
      >
        <Esqueleto opacidad={1 - entra} frame={frame + top / 6} />
        <div style={{ position: "absolute", inset: 0, ...deslizar(frame, at, 140, 0) }}>
          <div style={{ position: "absolute", left: 36, top: 36, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 16, height: 16, borderRadius: 8, background: tono.punto, transform: `scale(${springAt(frame, at + 2, SPRING.pop)})` }} />
            <span style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 42, letterSpacing: "-0.02em", color: PAPER.inkSoft }}>
              {metrica.etiqueta}
            </span>
          </div>
          <span
            style={{
              position: "absolute",
              right: 38,
              top: 12,
              fontFamily: FONT.display,
              fontWeight: 900,
              fontSize: 118,
              lineHeight: 1,
              letterSpacing: "-0.045em",
              color: tono.valor,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {Math.round(metrica.valor * cuenta)}
          </span>
          <div style={{ position: "absolute", left: 36, right: 36, bottom: 28, height: 14, borderRadius: 7, background: "#ececea" }}>
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: `${(metrica.valor / max) * 100 * barra}%`,
                borderRadius: 7,
                background: tono.barra,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Panel({ durationInFrames, cues, datos }: EscenaProps<Datos>) {
  const frame = useCurrentFrame();
  const d = durationInFrames;
  const cue = (nombre: string | undefined, fallback: number) => (nombre ? (cues[nombre] ?? fallback) : fallback);

  const tPalabra = cue(datos.palabra?.cue, Math.round(d * 0.03));
  const tPanel = cue(datos.panelCue, Math.round(d * 0.15));
  const tFrase = cue(datos.frase?.cue, Math.round(d * 0.8));
  const tiempos = datos.metricas.map((m, i) => cue(m.cue, Math.round(d * (0.38 + i * 0.17))));
  const max = Math.max(1, ...datos.metricas.map((m) => m.valor));

  const sube = springAt(frame, tPanel - 4, SPRING.soft);
  const panelIn = spring({ frame: frame - tPanel, fps: 30, config: { damping: 20, stiffness: 110, mass: 0.9 } });
  const panelOp = ease(frame, [tPanel, tPanel + 10]);
  const foco = ease(frame, [tFrase - 4, tFrase + 10]);
  const floteY = Math.sin(frame / 34) * 6;
  const floteR = Math.sin(frame / 48) * 0.35;

  const palabraT = ease(frame, [tPalabra, tPalabra + 14]);
  const panelAlto = PANEL.barra + 118 + datos.metricas.length * (FILA.alto + FILA.gap) + 14;
  const [fraseA, ...resto] = (datos.frase?.texto ?? "").split(", ");
  const fraseB = resto.join(", ");

  return (
    <>
      {datos.palabra && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: lerp(700, TITULO_Y, sube),
            textAlign: "center",
            transform: `scale(${lerp(1, 0.56, sube)})`,
            transformOrigin: "50% 0%",
          }}
        >
          <span
            style={{
              display: "inline-block",
              fontFamily: FONT.display,
              fontWeight: 900,
              fontSize: 230,
              lineHeight: 1,
              letterSpacing: "-0.05em",
              color: PAPER.ink,
              opacity: palabraT,
              transform: `translateY(${(1 - palabraT) * 60}px)`,
              filter: palabraT < 1 ? `blur(${(1 - palabraT) * 12}px)` : undefined,
            }}
          >
            {datos.palabra.texto}
            <span style={{ color: ACCENT.green }}>.</span>
          </span>
        </div>
      )}

      <div
        style={{
          position: "absolute",
          left: PANEL.left,
          top: PANEL.top,
          width: PANEL.width,
          height: panelAlto,
          borderRadius: PANEL.radius,
          background: PAPER.card,
          boxShadow: `${SHADOW.card}, 0 0 0 1px rgba(0,0,0,0.04)`,
          opacity: panelOp * lerp(1, 0.94, foco),
          transform: `translate(${(1 - panelIn) * 120}px, ${(1 - panelIn) * 90 + floteY - foco * 18}px) rotate(${(1 - panelIn) * 3 + floteR}deg) scale(${lerp(0.94, 1, panelIn) * lerp(1, 0.97, foco)})`,
          filter: panelOp < 1 ? `blur(${(1 - panelOp) * 12}px)` : undefined,
        }}
      >
        <div
          style={{
            height: PANEL.barra,
            background: "#f6f6f4",
            borderBottom: "1px solid #ececea",
            borderRadius: `${PANEL.radius}px ${PANEL.radius}px 0 0`,
            position: "relative",
          }}
        >
          <div style={{ position: "absolute", left: 30, top: PANEL.barra / 2 - 8, display: "flex", gap: 10 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ width: 16, height: 16, borderRadius: 8, background: "#dcdcd8" }} />
            ))}
          </div>
        </div>

        <div style={{ position: "absolute", left: 36, top: PANEL.barra + 34, display: "flex", alignItems: "baseline", gap: 18 }}>
          <span
            style={{
              fontFamily: FONT.sans,
              fontWeight: 700,
              fontSize: 58,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              color: PAPER.ink,
              ...deslizar(frame, tPanel + 2, 0, 22, 12),
            }}
          >
            {datos.titulo}
          </span>
          <span style={{ fontFamily: FONT.sans, fontSize: 44, color: "#c2c2be", ...deslizar(frame, tPanel + 4, 0, 22, 12) }}>·</span>
          <span
            style={{
              fontFamily: FONT.serif,
              fontStyle: "italic",
              fontSize: 50,
              lineHeight: 1,
              color: PAPER.inkSoft,
              ...deslizar(frame, tPanel + 6, 0, 22, 12),
            }}
          >
            {datos.periodo}
          </span>
        </div>

        {datos.metricas.map((m, i) => (
          <div key={m.cue} style={{ position: "absolute", inset: 0, ...deslizar(frame, tPanel + 2 + i * 3, 0, 28, 12) }}>
            <Fila metrica={m} at={tiempos[i]} max={max} top={PANEL.barra + 118 + i * (FILA.alto + FILA.gap)} />
          </div>
        ))}
      </div>

      {datos.frase && (
        <div
          style={{
            position: "absolute",
            left: 400,
            width: 556,
            top: 1262,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <span
            style={{
              fontFamily: FONT.display,
              fontWeight: 900,
              fontSize: 112,
              lineHeight: 1,
              letterSpacing: "-0.045em",
              color: PAPER.ink,
              whiteSpace: "nowrap",
              ...deslizar(frame, tFrase, 90, 0, 12),
            }}
          >
            {fraseA}
            {fraseB ? "," : "."}
          </span>
          {fraseB && (
            <span
              style={{
                fontFamily: FONT.serif,
                fontStyle: "italic",
                fontSize: 84,
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
                color: PAPER.inkSoft,
                whiteSpace: "nowrap",
                marginTop: 6,
                ...deslizar(frame, tFrase + 6, 90, 0, 12),
              }}
            >
              {fraseB}.
            </span>
          )}
        </div>
      )}

      <Sfx name="tarjeta" at={tPanel + 2} volume={0.09} />
      {tiempos.map((t, i) => (
        <Sfx key={i} name="counter" at={t + 3} volume={0.16} maxFrames={20} />
      ))}
      {datos.frase && <Sfx name="pop" at={tFrase} volume={0.2} />}
    </>
  );
}
