import { OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import Sfx from "../../reserva/components/sfx";
import { ease, lerp, springAt } from "../../reserva/motion";
import { FONT, FPS, SPRING } from "../../reserva/theme";
import { useTinta } from "./tema";
import type { EscenaPreview, EscenaProps } from "./tipos";

/**
 * Un celular con grabaciones reales del agente en WhatsApp (Lucas, 2026-09-28: "mucho texto = mucha carga cognitiva, falta
 * más visual" y "apalancate del material de Raquel, fijate los gifs de cada acción"). Cada clip entra en su cue con un tap
 * y arriba queda una sola palabra: la acción que se está viendo.
 */
export type Datos = {
  /** `archivo`: video vertical en public/ (ej. recursos/raquel/agendamiento.mp4); `desde`: segundo del clip en que arranca. */
  clips: { archivo: string; desde?: number; cue: string; etiqueta: string }[];
  /** Bajada chica en serif arriba de la palabra (opcional). */
  bajada?: string;
};

export const PREVIEW: EscenaPreview<Datos> = {
  durationInFrames: 150,
  tema: "blanco",
  sinRecorte: true,
  cues: { a: 4, b: 50, c: 100 },
  datos: {
    bajada: "el agente",
    clips: [
      { archivo: "recursos/raquel/agendamiento.mp4", desde: 2, cue: "a", etiqueta: "agenda" },
      { archivo: "recursos/raquel/confirmaciones.mp4", desde: 6, cue: "b", etiqueta: "confirma" },
      { archivo: "recursos/raquel/recordatorios.mp4", desde: 1, cue: "c", etiqueta: "recuerda" },
    ],
  },
};

const ANCHO = 600;
/** Las grabaciones son de 576x1248. */
const ALTO = Math.round((ANCHO * 1248) / 576);
const BISEL = 16;
const TOP = 470;
const CRUCE = 6;

export default function Celular({ durationInFrames, cues, datos }: EscenaProps<Datos>) {
  const frame = useCurrentFrame();
  const { tinta, tintaSuave, tema } = useTinta();
  const inicios = datos.clips.map((c, i) => cues[c.cue] ?? Math.round((durationInFrames * i) / datos.clips.length));
  const entrada = springAt(frame, inicios[0] ?? 0, SPRING.soft);
  const flote = Math.sin(frame / 40);

  return (
    <>
      {datos.bajada && (
        <div
          style={{
            position: "absolute",
            top: 190,
            width: "100%",
            textAlign: "center",
            fontFamily: FONT.serif,
            fontStyle: "italic",
            fontSize: 64,
            color: tintaSuave,
            opacity: ease(frame, [inicios[0], inicios[0] + 8]),
          }}
        >
          {datos.bajada}
        </div>
      )}

      {datos.clips.map((c, i) => {
        const desde = inicios[i];
        const hasta = inicios[i + 1] ?? durationInFrames;
        const opacidad = ease(frame, [desde, desde + 5]) * (1 - ease(frame, [hasta - 3, hasta]));
        return (
          <div
            key={c.cue}
            style={{
              position: "absolute",
              top: datos.bajada ? 262 : 250,
              width: "100%",
              textAlign: "center",
              fontFamily: "Satoshi, system-ui, sans-serif",
              fontWeight: 900,
              fontSize: 130,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              color: tinta,
              opacity: opacidad,
              filter: `blur(${(1 - ease(frame, [desde, desde + 6])) * 10}px)`,
              transform: `translateY(${(1 - ease(frame, [desde, desde + 6])) * 18}px)`,
            }}
          >
            {c.etiqueta}
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          left: (1080 - ANCHO - BISEL * 2) / 2,
          top: TOP,
          width: ANCHO + BISEL * 2,
          height: ALTO + BISEL * 2,
          padding: BISEL,
          borderRadius: 78,
          background: "#0b0b0b",
          boxShadow:
            tema === "negro"
              ? "0 0 0 2px rgba(255,255,255,0.08), 0 50px 120px rgba(0,0,0,0.7)"
              : "0 2px 6px rgba(0,0,0,0.12), 0 40px 90px rgba(0,0,0,0.28)",
          opacity: ease(frame, [inicios[0], inicios[0] + 6]),
          transform: `translateY(${lerp(220, 0, entrada) + flote * 6}px) rotate(${lerp(-5, 0, entrada) + flote * 0.4}deg) scale(${lerp(0.92, 1, entrada)})`,
        }}
      >
        <div style={{ position: "relative", width: ANCHO, height: ALTO, borderRadius: 62, overflow: "hidden", background: "#0b141a" }}>
          {datos.clips.map((c, i) => {
            const desde = inicios[i];
            const hasta = Math.min(durationInFrames, (inicios[i + 1] ?? durationInFrames) + CRUCE);
            return (
              <Sequence key={c.cue} from={desde} durationInFrames={Math.max(1, hasta - desde)} layout="none">
                <div style={{ position: "absolute", inset: 0, opacity: i === 0 ? 1 : ease(frame, [desde, desde + CRUCE]) }}>
                  <OffthreadVideo
                    src={staticFile(c.archivo)}
                    trimBefore={Math.round((c.desde ?? 0) * FPS)}
                    muted
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              </Sequence>
            );
          })}
        </div>
      </div>

      {inicios.slice(1).map((t, i) => (
        <Sfx key={i} name="tap" at={t} volume={0.15} />
      ))}
    </>
  );
}
