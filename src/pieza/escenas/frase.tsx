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
  lineas: { texto: string; estilo: "serif" | "sans"; cue: string; tamano?: number }[][];
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
  const textoTop = obj ? centroY + lado / 2 + 20 : 760;

  return (
    <>
      {obj && (
        <div
          style={{
            position: "absolute",
            left: 540 - lado / 2,
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
            {linea.map((p) => (
              <span
                key={p.cue + p.texto}
                style={{
                  display: "inline-block",
                  whiteSpace: "nowrap",
                  lineHeight: 1,
                  ...(p.estilo === "serif"
                    ? { fontFamily: FONT.serif, fontStyle: "italic", fontSize: p.tamano ?? SERIF, color: tintaSuave }
                    : { fontFamily: FONT.display, fontWeight: 900, fontSize: p.tamano ?? SANS, letterSpacing: "-0.05em", color: tinta }),
                  ...entra(frame, cue(p.cue, 0)),
                }}
              >
                {p.texto}
              </span>
            ))}
          </div>
        ))}
      </div>

      {obj && <Sfx name="pop" at={tObj} volume={0.2} />}
      {tTacha !== null && <Sfx name="tachado" at={tTacha} volume={0.1} />}
    </>
  );
}
