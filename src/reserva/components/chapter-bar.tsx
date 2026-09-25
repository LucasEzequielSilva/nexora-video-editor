import type { CSSProperties } from "react";
import { useCurrentFrame } from "remotion";
import { ease } from "../motion";
import { ACCENT, FONT } from "../theme";

export type Chapter = {
  label: string;
  /** Frame (en la composición completa) donde arranca este capítulo. */
  at: number;
};

type ChapterBarProps = {
  chapters: Chapter[];
  /** Duración total de la pieza — define el 100% de la barra. */
  totalDurationInFrames: number;
  style?: CSSProperties;
};

const MARGIN_PCT = 6;

/**
 * Barra de capítulos persistente ("a lo Jacob", ver CLAUDE.md §5): línea de progreso
 * abajo del frame con las etapas del video nombradas, la activa resaltada.
 * Pensada como overlay sobre video/pantalla (texto blanco con sombra), no sobre fondo PAPER.
 */
export default function ChapterBar({ chapters, totalDurationInFrames, style }: ChapterBarProps) {
  const frame = useCurrentFrame();
  const enter = ease(frame, [0, 18]);
  const sorted = [...chapters].sort((a, b) => a.at - b.at);
  const activeIndex = sorted.reduce((acc, ch, i) => (frame >= ch.at ? i : acc), 0);
  const progressPct = Math.min(100, Math.max(0, (frame / totalDurationInFrames) * 100));

  return (
    <div
      style={{
        position: "absolute",
        left: `${MARGIN_PCT}%`,
        right: `${MARGIN_PCT}%`,
        bottom: 56,
        opacity: enter,
        transform: `translateY(${(1 - enter) * 20}px)`,
        fontFamily: FONT.sans,
        ...style,
      }}
    >
      <div style={{ position: "relative", height: 2, background: "rgba(255,255,255,0.28)", borderRadius: 999 }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: `${progressPct}%`,
            background: ACCENT.red,
            borderRadius: 999,
          }}
        />
        {sorted.map((ch, i) => {
          const left = `${(ch.at / totalDurationInFrames) * 100}%`;
          const passed = i <= activeIndex;
          const isActive = i === activeIndex;
          return (
            <div key={`${ch.label}-${ch.at}`} style={{ position: "absolute", left, top: 0, transform: "translate(-50%, -50%)" }}>
              <div
                style={{
                  width: isActive ? 10 : 6,
                  height: isActive ? 10 : 6,
                  borderRadius: 999,
                  background: passed ? ACCENT.red : "rgba(255,255,255,0.5)",
                  boxShadow: isActive ? `0 0 12px ${ACCENT.red}` : "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  left: "50%",
                  transform: "translateX(-50%)",
                  whiteSpace: "nowrap",
                  fontSize: 20,
                  fontWeight: isActive ? 700 : 500,
                  letterSpacing: "0.01em",
                  color: isActive ? "#ffffff" : "rgba(255,255,255,0.55)",
                  textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                }}
              >
                {ch.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
