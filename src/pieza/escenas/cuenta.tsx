import type { CSSProperties, ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import Sfx from "../../reserva/components/sfx";
import { ease, easeInOut, lerp, springAt } from "../../reserva/motion";
import { ACCENT, FONT, SPRING } from "../../reserva/theme";
import Objeto3D from "../objeto-3d";
import { useTinta } from "./tema";
import type { EscenaPreview, EscenaProps } from "./tipos";

/**
 * La cuenta de la objeción de precio: un contador con los números que se dicen, "× lo que te deja un turno" y dos
 * barras (lo que se pierde contra lo que cuesta el soporte). Sin montos: las barras son relativas, así no se inventan cifras.
 */
export type Datos = {
  /** Titular del arranque (serif itálica + sans), reemplazado por `pregunta` en su cue. */
  titulo: { serif: string; sans: string };
  pregunta: { serif: string; sans: string; cue: string };
  /** Tarjeta del contador: cada número entra en su cue; el último queda en rojo. */
  contador: { etiqueta: string; numeros: { valor: string; cue: string }[] };
  /** "×" + segunda tarjeta (lo que deja cada unidad). */
  multiplica: { cue: string; etiqueta: string; valor: string; cueValor: string; modelo?: string };
  /** Barras: `perdida` crece en su cue hasta el 100 %; `costo` llena `costoPct` en el suyo. */
  barras: { perdida: string; cuePerdida: string; costo: string; cueCosto: string; costoPct: number };
};

export const PREVIEW: EscenaPreview<Datos> = {
  durationInFrames: 190,
  sinRecorte: true,
  cues: { n1: 9, n2: 27, n3: 47, multiplica: 80, deja: 111, pregunta: 141, supero: 146, cuesta: 161 },
  datos: {
    titulo: { serif: "hagamos", sans: "la cuenta." },
    pregunta: { serif: "¿ya", sans: "superó?", cue: "pregunta" },
    contador: {
      etiqueta: "turnos por mes",
      numeros: [
        { valor: "1", cue: "n1" },
        { valor: "2", cue: "n2" },
        { valor: "5", cue: "n3" },
      ],
    },
    multiplica: { cue: "multiplica", etiqueta: "lo que te deja un turno", valor: "$", cueValor: "deja", modelo: "recursos/objeto-3d-016.glb" },
    barras: { perdida: "5 × $", cuePerdida: "supero", costo: "lo que cuesta el soporte", cueCosto: "cuesta", costoPct: 0.58 },
  },
};

const CARD = { left: 96, width: 888, radius: 34 } as const;
const A = { top: 390, alto: 250 } as const;
const X_Y = 668;
const B = { top: 760, alto: 230 } as const;
const BARRAS = { top: 1036, alto: 272 } as const;
const CENTRADO = 170;

const entra = (frame: number, at: number, dx: number, dy: number, dur = 14): CSSProperties => {
  const t = ease(frame, [at, at + dur]);
  return {
    opacity: ease(frame, [at, at + dur * 0.6]),
    transform: `translate(${(1 - t) * dx}px, ${(1 - t) * dy}px)`,
    filter: t < 0.999 ? `blur(${(1 - t) * 10}px)` : undefined,
  };
};

const Tarjeta = ({ top, alto, style, children }: { top: number; alto: number; style: CSSProperties; children: ReactNode }) => {
  const tin = useTinta();
  return (
  <div
    style={{
      position: "absolute",
      left: CARD.left,
      width: CARD.width,
      top,
      height: alto,
      borderRadius: CARD.radius,
      background: tin.tarjeta,
      boxShadow: `${tin.sombraTarjeta}, 0 0 0 1px ${tin.tarjetaBorde}`,
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
  );
};

const Etiqueta = ({ texto }: { texto: string }) => (
  <EtiquetaColor texto={texto} />
);

const EtiquetaColor = ({ texto }: { texto: string }) => {
  const { tintaSuave } = useTinta();
  return (
  <span
    style={{
      position: "absolute",
      left: 44,
      top: 40,
      fontFamily: FONT.serif,
      fontStyle: "italic",
      fontSize: 54,
      lineHeight: 1,
      color: tintaSuave,
    }}
  >
    {texto}
  </span>
  );
};

const Titular = ({ serif, sans, estilo }: { serif: string; sans: string; estilo: CSSProperties }) => {
  const { tinta, tintaSuave } = useTinta();
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", ...estilo }}>
      <span style={{ fontFamily: FONT.serif, fontStyle: "italic", fontSize: 96, color: tintaSuave, marginRight: 22 }}>{serif}</span>
      <span style={{ fontFamily: FONT.display, fontWeight: 900, fontSize: 124, letterSpacing: "-0.05em", color: tinta }}>{sans}</span>
    </div>
  );
};

const Barra = ({ etiqueta, top, llenado, color, fondo, tinta }: { etiqueta: string; top: number; llenado: number; color: string; fondo: string; tinta: string }) => (
  <div style={{ position: "absolute", left: 44, right: 44, top }}>
    <span style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 40, letterSpacing: "-0.02em", color: tinta }}>{etiqueta}</span>
    <div style={{ position: "relative", marginTop: 14, height: 34, borderRadius: 17, background: fondo }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${llenado * 100}%`, borderRadius: 17, background: color }} />
    </div>
  </div>
);

export default function Cuenta({ durationInFrames, cues, datos }: EscenaProps<Datos>) {
  const frame = useCurrentFrame();
  const d = durationInFrames;
  const cue = (nombre: string, fallback: number) => cues[nombre] ?? fallback;

  const tPregunta = cue(datos.pregunta.cue, Math.round(d * 0.74));
  const tNumeros = datos.contador.numeros.map((n, i) => cue(n.cue, Math.round(d * (0.05 + i * 0.1))));
  const tMultiplica = cue(datos.multiplica.cue, Math.round(d * 0.42));
  const tValor = cue(datos.multiplica.cueValor, tMultiplica + 20);
  const tPerdida = cue(datos.barras.cuePerdida, Math.round(d * 0.77));
  const tCosto = cue(datos.barras.cueCosto, tPerdida + 15);
  const tBarras = Math.min(tPregunta, tPerdida) - 4;

  const cambio = ease(frame, [tPregunta - 2, tPregunta + 10]);
  const ultimo = datos.contador.numeros.length - 1;
  const golpe = Math.max(0, ...tNumeros.map((t) => (frame >= t ? 1 - springAt(frame, t, SPRING.snappy) : 0)));
  const floteA = Math.sin(frame / 30) * 4;
  const floteB = Math.sin((frame + 40) / 34) * 4;
  const xPop = springAt(frame, tMultiplica, SPRING.pop);
  const perdida = easeInOut(frame, [tPerdida, tPerdida + 22]);
  const costo = easeInOut(frame, [tCosto, tCosto + 16]) * datos.barras.costoPct;
  const tin = useTinta();

  return (
    <>
      {/* Sin el recorte del que habla abajo (2026-09-25), el bloque va centrado en el alto. */}
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${CENTRADO}px)` }}>
      <Titular serif={datos.titulo.serif} sans={datos.titulo.sans} estilo={{ ...entra(frame, 2, 0, 40), opacity: ease(frame, [2, 12]) * (1 - cambio) }} />
      <Titular
        serif={datos.pregunta.serif}
        sans={datos.pregunta.sans}
        estilo={{ opacity: cambio, transform: `translateY(${(1 - cambio) * 40}px)`, filter: cambio < 0.999 ? `blur(${(1 - cambio) * 10}px)` : undefined }}
      />

      <Tarjeta top={A.top + floteA} alto={A.alto} style={{ ...entra(frame, 4, 140, 0, 16), scale: `${1 + golpe * 0.035}` }}>
        <Etiqueta texto={datos.contador.etiqueta} />
        {datos.contador.numeros.map((n, i) => {
          const t = tNumeros[i];
          const siguiente = tNumeros[i + 1];
          const e = ease(frame, [t, t + 9]);
          const s = siguiente === undefined ? 0 : ease(frame, [siguiente, siguiente + 7]);
          if (frame < t || (siguiente !== undefined && frame > siguiente + 7)) return null;
          return (
            <span
              key={n.cue}
              style={{
                position: "absolute",
                right: 56,
                top: 6,
                fontFamily: FONT.display,
                fontWeight: 900,
                fontSize: 236,
                lineHeight: 1,
                letterSpacing: "-0.05em",
                fontVariantNumeric: "tabular-nums",
                color: i === ultimo ? ACCENT.red : tin.tinta,
                opacity: e * (1 - s),
                transform: `translateY(${(1 - e) * 90 - s * 90}px)`,
                filter: e < 0.999 || s > 0.001 ? `blur(${Math.max(1 - e, s) * 12}px)` : undefined,
              }}
            >
              {n.valor}
            </span>
          );
        })}
      </Tarjeta>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: X_Y,
          textAlign: "center",
          fontFamily: FONT.serif,
          fontStyle: "italic",
          fontSize: 110,
          lineHeight: 1,
          color: tin.tinta,
          opacity: ease(frame, [tMultiplica, tMultiplica + 6]),
          transform: `scale(${lerp(0.4, 1, xPop)}) rotate(${(1 - xPop) * -20}deg)`,
        }}
      >
        ×
      </div>

      <Tarjeta top={B.top + floteB} alto={B.alto} style={entra(frame, tMultiplica + 4, -140, 0, 16)}>
        <Etiqueta texto={datos.multiplica.etiqueta} />
        {datos.multiplica.modelo ? (
          <div style={{ position: "absolute", right: 24, top: -14, width: 260, height: 260, ...entra(frame, tValor, 0, 60, 10) }}>
            <Objeto3D archivo={datos.multiplica.modelo} lado={260} giro={0.2} />
          </div>
        ) : (
          <span
            style={{
              position: "absolute",
              right: 60,
              bottom: 18,
              fontFamily: FONT.display,
              fontWeight: 900,
              fontSize: 150,
              lineHeight: 1,
              color: ACCENT.greenDark,
              ...entra(frame, tValor, 0, 60, 10),
            }}
          >
            {datos.multiplica.valor}
          </span>
        )}
      </Tarjeta>

      <Tarjeta top={BARRAS.top} alto={BARRAS.alto} style={entra(frame, tBarras, 0, 90, 14)}>
        <Barra etiqueta={datos.barras.perdida} top={38} llenado={perdida} color={`linear-gradient(90deg, #EE6B6F, ${ACCENT.red})`} fondo={tin.pista} tinta={ACCENT.red} />
        <Barra etiqueta={datos.barras.costo} top={140} llenado={costo} color="linear-gradient(90deg, #9a9a96, #6b6b68)" fondo={tin.pista} tinta={tin.tintaSuave} />
      </Tarjeta>
      </div>

      {tNumeros.map((t, i) => (
        <Sfx key={i} name={i === ultimo ? "pop" : "counter"} at={t} volume={i === ultimo ? 0.2 : 0.16} maxFrames={20} />
      ))}
      <Sfx name="pop-b" at={tMultiplica} volume={0.08} />
      <Sfx name="tarjeta" at={tMultiplica + 6} volume={0.09} />
      <Sfx name="tarjeta-b" at={tBarras + 4} volume={0.06} />
      <Sfx name="counter" at={tPerdida + 2} volume={0.14} maxFrames={20} />
      <Sfx name="tarjeta-c" at={tCosto + 2} volume={0.1} />
    </>
  );
}
