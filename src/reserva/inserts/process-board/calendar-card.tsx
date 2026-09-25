import { CalendarDays, Video } from "lucide-react";
import { useCurrentFrame } from "remotion";
import DashedPath from "../../components/dashed-path";
import KineticLine from "../../components/kinetic-line";
import { ease, easeInOut, lerp, springAt } from "../../motion";
import { FONT, PAPER, SHADOW, SPRING } from "../../theme";
import PaperClip from "./paper-clip";
import type { Timeline } from "./timing";

export const CALENDAR = { left: 1396, top: 58, width: 400, height: 216, rotation: 3 } as const;

const DAYS = ["L", "M", "X", "J", "V"];

type CalendarCardProps = { t: Timeline };

/** Tarjeta "Weekly" abrochada arriba a la derecha del tablero, con anotación "cada semana". */
export default function CalendarCard({ t }: CalendarCardProps) {
  const frame = useCurrentFrame();
  if (frame < t.calendar) return null;

  const pop = springAt(frame, t.calendar, SPRING.pop);
  const float = Math.sin((frame - t.calendar) / 38) * 4;
  const dayPop = springAt(frame, t.reuniones + 10, SPRING.pop);
  const arrow = easeInOut(frame, [t.annotation + 6, t.annotation + 22]);
  const head = ease(frame, [t.annotation + 18, t.annotation + 24]);

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: CALENDAR.left,
          top: CALENDAR.top,
          width: CALENDAR.width,
          height: CALENDAR.height,
          opacity: ease(frame, [t.calendar, t.calendar + 5]),
          transform: `translateY(${(1 - pop) * 44 + float}px) rotate(${lerp(-8, CALENDAR.rotation, pop)}deg) scale(${lerp(0.72, 1, pop)})`,
          transformOrigin: "50% 30%",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            boxSizing: "border-box",
            padding: "20px 28px 18px",
            borderRadius: 26,
            background: "#ffffff",
            boxShadow: SHADOW.card,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: PAPER.ink,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CalendarDays size={26} strokeWidth={1.8} color="#ffffff" />
            </div>
            <span
              style={{
                fontFamily: FONT.sans,
                fontWeight: 900,
                fontSize: 40,
                lineHeight: 1,
                letterSpacing: "-0.045em",
                color: PAPER.ink,
              }}
            >
              Weekly
            </span>
          </div>

          <div
            style={{
              marginTop: 12,
              fontFamily: FONT.sans,
              fontWeight: 700,
              fontSize: 20,
              letterSpacing: "-0.02em",
              color: PAPER.inkSoft,
              whiteSpace: "nowrap",
            }}
          >
            Todos los jueves · 18:00 hs
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            {DAYS.map((day) => {
              const active = day === "J";
              return (
                <div key={day} style={{ position: "relative", width: 36, height: 36 }}>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 18,
                      background: "#f0f0ed",
                    }}
                  />
                  {active && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 18,
                        background: PAPER.ink,
                        transform: `scale(${dayPop})`,
                      }}
                    />
                  )}
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: FONT.sans,
                      fontWeight: 700,
                      fontSize: 14,
                      color: active && dayPop > 0.5 ? "#ffffff" : PAPER.muted,
                    }}
                  >
                    {day}
                  </span>
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: "auto",
              paddingTop: 10,
              borderTop: "2px dashed #e3e3df",
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontFamily: FONT.sans,
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: "-0.01em",
              color: PAPER.ink,
            }}
          >
            <Video size={18} strokeWidth={2} color={PAPER.inkSoft} />
            Revisión de avances
          </div>
        </div>
        <PaperClip x={CALENDAR.width - 78} y={-34} rotation={10} />
      </div>

      <div
        style={{
          position: "absolute",
          left: 1566,
          top: 368,
          transform: "rotate(-5deg)",
          transformOrigin: "left center",
        }}
      >
        <KineticLine parts={[{ text: "cada semana", font: "serif", at: t.annotation, size: 50 }]} size={50} align="left" />
      </div>
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <DashedPath
          d="M 1610 360 C 1592 334, 1590 316, 1606 294"
          progress={arrow}
          stroke={PAPER.inkSoft}
          strokeWidth={2.6}
          dash={8}
          gap={7}
        />
        <path
          d="M 1594 302 L 1607 292 L 1612 308"
          fill="none"
          stroke={PAPER.inkSoft}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={head}
        />
      </svg>
    </>
  );
}
