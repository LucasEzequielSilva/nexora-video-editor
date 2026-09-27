import type { CSSProperties } from "react";
import { useCurrentFrame } from "remotion";
import Sfx from "../../reserva/components/sfx";
import { ease, lerp, springAt } from "../../reserva/motion";
import { ACCENT, FONT, SHADOW, SPRING } from "../../reserva/theme";
import LogoApp from "../marca";
import type { Marca } from "../marcas-paths";
import Objeto3D from "../objeto-3d";
import { useTinta } from "./tema";
import type { EscenaPreview, EscenaProps } from "./tipos";

/**
 * Beat de texto a pantalla completa, sin el que habla (Lucas, 2026-09-25: "dejaría el motion solo... white screen a
 * black screen + texts + icons si es que aplica"). Texto en dos voces (serif itálica + sans pesada) que entra palabra
 * por palabra en sus cues, sin sonido; opcional un objeto 3D del pack que entra con pop y se puede tachar.
 */
export type Datos = {
  /**
   * estilo: "serif" (bajada itálica), "sans" (remate pesado), y del estilo anuncio (2026-09-27): "neon" (rosa/rojo con
   * brillo, "30 DÍAS") y "etiqueta" (negro con borde blanco, tipo sticker). animar "letras": entra letra por letra.
   */
  lineas: { texto: string; estilo: "serif" | "sans" | "neon" | "etiqueta"; cue: string; tamano?: number; animar?: "letras" }[][];
  /** Alto (px) donde arranca el bloque de texto. Default: debajo del objeto, o 760 sin objeto. */
  textoY?: number;
  objeto?: {
    /** Objeto 3D (.glb en public/). O bien `marca`: logo oficial (whatsapp, instagram, googlecalendar, gmail). */
    archivo?: string;
    marca?: Marca;
    cue: string;
    /** Cue en que una línea roja lo tacha y se apaga (para "no es X"). */
    tachar?: string;
    lado?: number;
    /** Centro vertical del objeto (px). Default 640. */
    y?: number;
    /** Centro horizontal del objeto (px). Default 540 (centrado). */
    x?: number;
    /** Inclinación hacia la cámara (rad): los objetos planos (billetera) se paran con ~1.1. */
    inclinacion?: number;
  };
};

export const PREVIEW: EscenaPreview<Datos> = {
  durationInFrames: 75,
  tema: "negro",
  sinRecorte: true,
  cues: { no: 4, gasto: 12, dejar: 26, plata: 40 },
  datos: {
    lineas: [
      [
        { texto: "no es un", estilo: "serif", cue: "no" },
        { texto: "gasto,", estilo: "sans", cue: "gasto" },
      ],
      [
        { texto: "es dejar de", estilo: "serif", cue: "dejar" },
        { texto: "tirar plata.", estilo: "sans", cue: "plata" },
      ],
    ],
    objeto: { archivo: "recursos/objeto-3d-003.glb", cue: "no", tachar: "gasto", inclinacion: 1.1 },
  },
};

const SERIF = 96;
const SANS = 150;

const entra = (frame: number, at: number): CSSProperties => {
  const t = ease(frame, [at, at + 12]);
  return {
    opacity: ease(frame, [at, at + 7]),
    transform: `translateY(${(1 - t) * 50}px)`,
    filter: t < 0.999 ? `blur(${(1 - t) * 12}px)` : undefined,
  };
};

const estiloTexto = (estilo: Datos["lineas"][number][number]["estilo"], tamano: number | undefined, tinta: string, tintaSuave: string): CSSProperties => {
  switch (estilo) {
    case "serif":
      return { fontFamily: FONT.serif, fontStyle: "italic", fontSize: tamano ?? SERIF, color: tintaSuave };
    case "neon":
      return {
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        fontWeight: 800,
        fontSize: tamano ?? SANS,
        letterSpacing: "0.01em",
        color: "#ff4d73",
        WebkitTextStroke: "3px rgba(255,228,235,0.95)",
        textShadow: "0 0 18px rgba(255,70,110,0.9), 0 0 48px rgba(255,60,100,0.55)",
      };
    case "etiqueta":
      return {
        fontFamily: FONT.sans,
        fontWeight: 700,
        fontSize: tamano ?? 60,
        letterSpacing: "-0.02em",
        color: "#111111",
        WebkitTextStroke: "10px #ffffff",
        paintOrder: "stroke fill",
        filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.18))",
      };
    default:
      return { fontFamily: FONT.display, fontWeight: 900, fontSize: tamano ?? SANS, letterSpacing: "-0.05em", color: tinta };
  }
};

/** Letra por letra: cada una entra desenfocada desde un desvío chico y distinto (como "imagina" en la referencia). */
const Letras = ({ texto, at, frame }: { texto: string; at: number; frame: number }) => (
  <>
    {[...texto].map((ch, i) => {
      const t = ease(frame, [at + i * 1.2, at + i * 1.2 + 8]);
      const dx = ((i * 37) % 23) - 11;
      const dy = ((i * 53) % 31) - 15;
      return (
        <span
          key={i}
          style={{
            display: "inline-block",
            whiteSpace: "pre",
            opacity: t,
            transform: `translate(${(1 - t) * dx * 3}px, ${(1 - t) * dy * 3}px) rotate(${(1 - t) * dx}deg)`,
            filter: t < 0.999 ? `blur(${(1 - t) * 10}px)` : undefined,
          }}
        >
          {ch}
        </span>
      );
    })}
  </>
);

export default function Frase({ durationInFrames, cues, datos }: EscenaProps<Datos>) {
  const frame = useCurrentFrame();
  const { tinta, tintaSuave, tema } = useTinta();
  const cue = (nombre: string, fallback: number) => cues[nombre] ?? fallback;
  const obj = datos.objeto;
  const tObj = obj ? cue(obj.cue, 2) : 0;
  const tTacha = obj?.tachar ? cue(obj.tachar, Math.round(durationInFrames * 0.4)) : null;
  const lado = obj?.lado ?? 620;
  const centroY = obj?.y ?? 640;
  const pop = springAt(frame, tObj, SPRING.pop);
  const trazo = tTacha === null ? 0 : ease(frame, [tTacha, tTacha + 8]);
  const apagado = tTacha === null ? 0 : ease(frame, [tTacha + 4, tTacha + 16]);
  const flote = Math.sin(frame / 24) * 8;
  const textoTop = datos.textoY ?? (obj ? centroY + lado / 2 + 20 : 760);
  const centroX = obj?.x ?? 540;

  return (
    <>
      {obj && (
        <div
          style={{
            position: "absolute",
            left: centroX - lado / 2,
            top: centroY - lado / 2 + flote,
            width: lado,
            height: lado,
            opacity: ease(frame, [tObj, tObj + 5]),
            transform: `scale(${lerp(0.4, 1, pop)}) rotate(${(1 - pop) * -12}deg)`,
          }}
        >
          <div
            style={{
              width: lado,
              height: lado,
              filter: `grayscale(${apagado}) brightness(${lerp(1, tema === "negro" ? 0.55 : 0.85, apagado)}) drop-shadow(0 40px 50px rgba(0,0,0,${tema === "negro" ? 0.6 : 0.25}))`,
            }}
          >
            {obj.marca ? (
              <div style={{ position: "absolute", left: lado * 0.2, top: lado * 0.2 }}>
                <LogoApp marca={obj.marca} size={lado * 0.6} style={{ boxShadow: SHADOW.lifted, transform: `rotate(${Math.sin(frame / 30) * 3}deg)` }} />
              </div>
            ) : obj.archivo ? (
              <Objeto3D archivo={obj.archivo} lado={lado} inclinacion={obj.inclinacion} />
            ) : null}
          </div>
          {tTacha !== null && (
            <svg width={lado} height={lado} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
              <line
                x1={lado * 0.12}
                y1={lado * 0.7}
                x2={lado * 0.12 + lado * 0.76 * trazo}
                y2={lado * 0.7 - lado * 0.4 * trazo}
                stroke={ACCENT.red}
                strokeWidth={26}
                strokeLinecap="round"
                opacity={trazo > 0 ? 1 : 0}
              />
            </svg>
          )}
        </div>
      )}

      <div style={{ position: "absolute", left: 60, right: 60, top: textoTop, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        {datos.lineas.map((linea, i) => (
          <div key={i} style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 22, flexWrap: "wrap" }}>
            {linea.map((p) => {
              const at = cue(p.cue, 0);
              return (
                <span
                  key={p.cue + p.texto}
                  style={{
                    display: "inline-block",
                    whiteSpace: "nowrap",
                    lineHeight: 1,
                    ...estiloTexto(p.estilo, p.tamano, tinta, tintaSuave),
                    ...(p.animar === "letras" ? {} : entra(frame, at)),
                  }}
                >
                  {p.animar === "letras" ? <Letras texto={p.texto} at={at} frame={frame} /> : p.texto}
                </span>
              );
            })}
          </div>
        ))}
      </div>

      {obj && <Sfx name="pop" at={tObj} volume={0.2} />}
      {tTacha !== null && <Sfx name="tachado" at={tTacha} volume={0.1} />}
    </>
  );
}
