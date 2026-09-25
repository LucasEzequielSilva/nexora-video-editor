import type { CSSProperties } from "react";
import { AbsoluteFill, spring, useCurrentFrame } from "remotion";
import KineticLine from "../../reserva/components/kinetic-line";
import Sfx from "../../reserva/components/sfx";
import { ease, lerp } from "../../reserva/motion";
import { FONT, FPS, PAPER, SHADOW } from "../../reserva/theme";
import LogoApp from "../marca";
import type { Marca } from "../marcas-paths";
import type { EscenaPreview, EscenaProps } from "./tipos";

/** Texto cinético: `serif` entra con el cue, `clave` (sans bold) entra `claveEn` frames después, cuando se dice. */
type Frase = { serif: string; clave: string; claveEn: number };

/** Cada ítem es una notificación pendiente; entra cuando llega su `cue` (el momento en que se nombra). */
export type Datos = {
  items: { marca: Marca; app: string; titulo: string; detalle: string; hora: string; cue: string; frase: Frase }[];
  /** Remate: las notificaciones se juntan en una pila prolija. */
  remate: Frase & { cue: string };
};

export const PREVIEW: EscenaPreview<Datos> = {
  durationInFrames: 317,
  cues: { m1: 9, m2: 80, m3: 135, m4: 199, facil: 269 },
  datos: {
    items: [
      {
        marca: "whatsapp",
        app: "WhatsApp",
        titulo: "Nuevo mensaje",
        detalle: "Hola, ¿tienen turno para mañana?",
        hora: "23:04",
        cue: "m1",
        frase: { serif: "el mensaje que entra a las", clave: "11 de la noche", claveEn: 25 },
      },
      {
        marca: "googlecalendar",
        app: "Calendario",
        titulo: "Turno sin confirmar",
        detalle: "Jueves 10:30 · Martina G.",
        hora: "hace 2 h",
        cue: "m2",
        frase: { serif: "el turno que hay que", clave: "confirmar", claveEn: 19 },
      },
      {
        marca: "gmail",
        app: "Gmail",
        titulo: "Presupuesto sin responder",
        detalle: "Re: Cotización",
        hora: "hace 3 días",
        cue: "m3",
        frase: { serif: "el presupuesto que quedó", clave: "sin responder", claveEn: 23 },
      },
      {
        marca: "instagram",
        app: "Instagram",
        titulo: "Borrador sin publicar",
        detalle: "Video guardado",
        hora: "hace 3 sem",
        cue: "m4",
        frase: { serif: "el video que ibas a subir hace", clave: "tres semanas", claveEn: 33 },
      },
    ],
    remate: { serif: "ninguna de esas cosas", clave: "es difícil.", claveEn: 20, cue: "facil" },
  },
};

const LEFT = 100;
const CARD_W = 880;
const CARD_H = 168;
const GAP = 20;
/** La lista crece centrada en este alto; el titular va siempre encima de la tarjeta de arriba. */
const LISTA_CENTRO = 820;
const TITULAR_SOBRE = 262;
const PILA_TOP = 450;
const PILA = [
  { dy: 0, s: 1 },
  { dy: 26, s: 0.95 },
  { dy: 50, s: 0.9 },
  { dy: 72, s: 0.86 },
];
const DESORDEN = [
  { x: -14, rot: -1.6 },
  { x: 18, rot: 1.2 },
  { x: -10, rot: -0.9 },
  { x: 14, rot: 1.5 },
];
const ENTRADA = { damping: 20, stiffness: 150, mass: 0.9 } as const;
const EMPUJE = { damping: 24, stiffness: 170 } as const;
/** La pila arranca antes del remate: el contenido de atrás se apaga, las tarjetas suben y recién ahí entra el serif. */
const PILA_ANTES = 9;
/** Familia "tarjeta" (entrada de notificación), rotando variantes. Volúmenes medidos contra la voz en el render (out/verif/mezcla-v2.py). */
const SFX_ENTRADA = [
  { name: "tarjeta", volume: 0.075 },
  { name: "tarjeta-b", volume: 0.075 },
  { name: "tarjeta-c", volume: 0.075 },
] as const;
/** Frames de entrada de la escena (ENTRA en marco.tsx): ahí ya suena su whoosh, la tarjeta solo lleva un pop. */
const TAPA_ENTRADA = 14;

const resorte = (frame: number, at: number, config: { damping: number; stiffness?: number; mass?: number }) =>
  spring({ frame: frame - at, fps: FPS, config });

type Item = Datos["items"][number];

const Tarjeta = ({ item, contenido }: { item: Item; contenido: number }) => {
  const texto: CSSProperties = { fontFamily: FONT.sans, lineHeight: 1.15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
  return (
    <div
      style={{
        width: CARD_W,
        height: CARD_H,
        borderRadius: 40,
        background: PAPER.card,
        boxShadow: SHADOW.card,
        padding: "0 34px 0 30px",
        display: "flex",
        alignItems: "center",
        gap: 26,
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 26, width: "100%", opacity: contenido }}>
        <LogoApp marca={item.marca} size={100} style={{ border: "1px solid rgba(0,0,0,0.06)" }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
            <span style={{ ...texto, fontSize: 30, fontWeight: 500, color: PAPER.muted }}>{item.app}</span>
            <span style={{ ...texto, fontSize: 30, fontWeight: 500, color: PAPER.muted, flexShrink: 0 }}>{item.hora}</span>
          </div>
          <div style={{ ...texto, fontSize: 44, fontWeight: 700, color: PAPER.ink, letterSpacing: "-0.015em", marginTop: 4 }}>
            {item.titulo}
          </div>
          <div style={{ ...texto, fontSize: 34, fontWeight: 400, color: PAPER.inkSoft, marginTop: 2 }}>{item.detalle}</div>
        </div>
      </div>
    </div>
  );
};

const Titular = ({ frase, at, sale, top }: { frase: Frase; at: number; sale: number; top: number }) => {
  const frame = useCurrentFrame();
  if (frame < at - 1 || frame > sale + 12) return null;
  const out = ease(frame, [sale, sale + 9]);
  return (
    <div
      style={{
        position: "absolute",
        left: LEFT,
        top,
        width: CARD_W,
        opacity: 1 - out,
        transform: `translateY(${-50 * out}px)`,
        filter: out > 0 ? `blur(${out * 10}px)` : undefined,
      }}
    >
      <KineticLine align="left" size={112} stagger={3} parts={[{ text: frase.serif, font: "serif", at, size: 60 }]} />
      <KineticLine
        align="left"
        size={112}
        stagger={4}
        parts={[{ text: frase.clave, font: "sans", at: at + frase.claveEn }]}
        style={{ marginTop: 14 }}
      />
    </div>
  );
};

export default function Pendientes({ durationInFrames, cues, datos }: EscenaProps<Datos>) {
  const frame = useCurrentFrame();
  const { items, remate } = datos;
  const n = items.length;
  const inicios = items.map((it, i) => cues[it.cue] ?? Math.round(durationInFrames * (0.03 + i * 0.2)));
  const facil = cues[remate.cue] ?? Math.round(durationInFrames * 0.85);
  const juntaAt = facil - PILA_ANTES;
  const junta = resorte(frame, juntaAt, EMPUJE);
  const apaga = ease(frame, [juntaAt - 6, juntaAt]);
  const visibles = 1 + inicios.slice(1).reduce((acc, at) => acc + resorte(frame, at - 3, EMPUJE), 0);
  const listaTop = LISTA_CENTRO - (visibles * (CARD_H + GAP) - GAP) / 2;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {inicios.map((at, i) => {
        const s = at < TAPA_ENTRADA ? { name: "pop" as const, volume: 0.2 } : SFX_ENTRADA[i % SFX_ENTRADA.length];
        return <Sfx key={`s${i}`} name={s.name} at={at + 2} volume={s.volume} />;
      })}
      <Sfx name="tarjeta-c" at={juntaAt} volume={0.15} />

      {items.map((it, i) => (
        <Titular key={`t${i}`} frase={it.frase} at={inicios[i]} sale={i < n - 1 ? inicios[i + 1] - 2 : juntaAt - 6} top={listaTop - TITULAR_SOBRE} />
      ))}

      {items.map((it, i) => {
        const at = inicios[i];
        if (frame < at - 2) return null;
        const dir = i % 2 === 0 ? 1 : -1;
        const e = resorte(frame, at, ENTRADA);
        const aparece = ease(frame, [at, at + 8]);
        const nitidez = ease(frame, [at, at + 12]);
        const slot = inicios.slice(i + 1).reduce((acc, later) => acc + resorte(frame, later - 3, EMPUJE), 0);
        const desorden = DESORDEN[i % DESORDEN.length];
        const pila = PILA[Math.min(n - 1 - i, PILA.length - 1)];

        const flote = Math.sin((frame + i * 37) / 46) * 5 * (1 - 0.6 * junta);
        const yLista = listaTop + slot * (CARD_H + GAP);
        const y = lerp(yLista, PILA_TOP + pila.dy, junta) + flote;
        const x = lerp(dir * 620, 0, e) + desorden.x * (1 - junta) + Math.sin((frame + i * 53) / 70) * 3;
        const rot = lerp(dir * 7, desorden.rot, e) * (1 - junta);
        const escala = lerp(1, pila.s, junta);
        const detras = n - 1 - i > 0 ? apaga : 0;

        return (
          <div
            key={`c${i}`}
            style={{
              position: "absolute",
              left: LEFT,
              top: 0,
              zIndex: i,
              opacity: aparece,
              transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${escala})`,
              transformOrigin: "50% 0%",
              filter: nitidez < 1 ? `blur(${(1 - nitidez) * 12}px)` : undefined,
            }}
          >
            <Tarjeta item={it} contenido={1 - detras} />
          </div>
        );
      })}

      {frame >= facil - 1 && (
        <div style={{ position: "absolute", left: 60, width: 960, top: 760, zIndex: 10 }}>
          <KineticLine align="center" size={150} stagger={3} parts={[{ text: remate.serif, font: "serif", at: facil, size: 76 }]} />
          <KineticLine
            align="center"
            size={150}
            stagger={4}
            parts={[{ text: remate.clave, font: "sans", at: facil + remate.claveEn }]}
            style={{ marginTop: 18 }}
          />
        </div>
      )}
    </AbsoluteFill>
  );
}
