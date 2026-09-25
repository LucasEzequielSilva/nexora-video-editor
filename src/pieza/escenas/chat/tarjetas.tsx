import { useCurrentFrame } from "remotion";
import { ease, lerp, springAt } from "../../../reserva/motion";
import { ACCENT, FONT, PAPER, SHADOW, SPRING } from "../../../reserva/theme";
import LogoApp from "../../marca";

const G_AZUL = "#1A73E8";
const G_AZUL_SUAVE = "#E8F0FE";

type NotificacionProps = { titulo: string; texto: string; at: number; saleAt?: number };

/** Banner de notificación que baja desde arriba del teléfono y vuelve a subir en `saleAt`. */
export const Notificacion = ({ titulo, texto, at, saleAt = Infinity }: NotificacionProps) => {
  const frame = useCurrentFrame();
  if (frame < at - 1 || frame > saleAt + 10) return null;
  const s = springAt(frame, at, SPRING.snappy);
  const sale = ease(frame, [saleAt, saleAt + 10]);
  const t = ease(frame, [at, at + 10]) * (1 - sale);
  return (
    <div
      style={{
        width: 640,
        display: "flex",
        gap: 22,
        alignItems: "flex-start",
        padding: "24px 28px 26px",
        borderRadius: 34,
        background: "rgba(255,255,255,0.96)",
        boxShadow: SHADOW.card,
        opacity: t,
        transform: `translateY(${(1 - s) * -50 - sale * 30}px) scale(${lerp(0.94, 1, s)})`,
        filter: t < 1 ? `blur(${(1 - t) * 10}px)` : undefined,
      }}
    >
      <LogoApp marca="whatsapp" size={76} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 34, letterSpacing: "-0.02em", color: PAPER.ink }}>
            {titulo}
          </span>
          <span style={{ fontFamily: FONT.sans, fontWeight: 500, fontSize: 30, color: PAPER.muted }}>ahora</span>
        </div>
        <div
          style={{
            fontFamily: FONT.sans,
            fontWeight: 500,
            fontSize: 30,
            lineHeight: 1.28,
            color: PAPER.inkSoft,
            marginTop: 6,
          }}
        >
          {texto}
        </div>
      </div>
    </div>
  );
};

export type Franja = { hora: string; evento?: string };

type CalendarioProps = {
  titulo: string;
  franjas: Franja[];
  /** Índice de la franja vacía donde cae el turno nuevo. */
  destino: number;
  evento: string;
  at: number;
  caeAt: number;
};

const FILA = 82;

/** Agenda del día (Google Calendar) donde el turno nuevo cae en su casillero. */
export const Calendario = ({ titulo, franjas, destino, evento, at, caeAt }: CalendarioProps) => {
  const frame = useCurrentFrame();
  if (frame < at - 1) return null;
  const s = springAt(frame, at, SPRING.snappy);
  const t = ease(frame, [at, at + 10]);
  const cae = springAt(frame, caeAt, SPRING.pop);
  const caeT = ease(frame, [caeAt, caeAt + 6]);
  const brillo = ease(frame, [caeAt + 2, caeAt + 20], [1, 0]);

  return (
    <div
      style={{
        width: 450,
        padding: "24px 22px 26px",
        borderRadius: 36,
        background: PAPER.card,
        boxShadow: SHADOW.card,
        opacity: t,
        transform: `translateX(${(1 - s) * -520}px) rotate(${lerp(-6, -2, s)}deg)`,
        transformOrigin: "0% 100%",
        filter: t < 1 ? `blur(${(1 - t) * 12}px)` : undefined,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 18 }}>
        <LogoApp marca="googlecalendar" size={64} style={{ boxShadow: "0 0 0 1.5px rgba(0,0,0,0.08)" }} />
        <span style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 38, letterSpacing: "-0.025em", color: PAPER.ink }}>
          {titulo}
        </span>
      </div>
      {franjas.map((f, i) => {
        const esDestino = i === destino;
        return (
          <div
            key={f.hora}
            style={{
              height: FILA,
              display: "flex",
              alignItems: "center",
              gap: 16,
              borderTop: "1.5px solid rgba(0,0,0,0.07)",
            }}
          >
            <span style={{ width: 88, flexShrink: 0, fontFamily: FONT.sans, fontWeight: 500, fontSize: 30, color: PAPER.muted }}>{f.hora}</span>
            <div style={{ flex: 1, height: FILA - 18, position: "relative" }}>
              {f.evento && (
                <div
                  style={{
                    height: "100%",
                    borderRadius: 14,
                    background: G_AZUL_SUAVE,
                    borderLeft: `6px solid ${G_AZUL}`,
                    display: "flex",
                    alignItems: "center",
                    padding: "0 18px",
                    fontFamily: FONT.sans,
                    fontWeight: 500,
                    fontSize: 30,
                    color: "#174EA6",
                    boxSizing: "border-box",
                  }}
                >
                  {f.evento}
                </div>
              )}
              {esDestino && (
                <>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 14,
                      border: `2.5px dashed ${PAPER.line}`,
                      opacity: 1 - caeT,
                    }}
                  />
                  {frame >= caeAt && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 14,
                        background: ACCENT.green,
                        display: "flex",
                        alignItems: "center",
                        padding: "0 18px",
                        fontFamily: FONT.sans,
                        fontWeight: 700,
                        fontSize: 30,
                        letterSpacing: "-0.01em",
                        color: "#ffffff",
                        opacity: caeT,
                        transform: `translateY(${(1 - cae) * -70}px) scale(${lerp(1.08, 1, cae)})`,
                        boxShadow: `0 8px 20px rgba(21,128,61,0.30), 0 0 0 ${10 * brillo}px rgba(34,197,94,${0.25 * brillo})`,
                      }}
                    >
                      {evento}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
