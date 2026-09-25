import { CalendarDays, Check } from "lucide-react";
import { lerp } from "../../motion";
import { ACCENT, FONT, PAPER } from "../../theme";
import { TASKS, type TaskId } from "./data";
import { CARD_W, cardHeight } from "./geometry";

type KanbanCardProps = {
  id: TaskId;
  x: number;
  y: number;
  /** Spring de aparición (0..1 con rebote). */
  appear: number;
  opacity: number;
  /** 0..1 cuánto está levantada por el drag. */
  lift: number;
  /** Escala del check verde (0 = oculto). */
  done: number;
};

export default function KanbanCard({ id, x, y, appear, opacity, lift, done }: KanbanCardProps) {
  const task = TASKS[id];
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: CARD_W,
        height: cardHeight(id),
        boxSizing: "border-box",
        padding: "13px 15px 12px",
        background: "#ffffff",
        borderRadius: 14,
        opacity,
        boxShadow: `0 1px 2px rgba(0,0,0,0.07), 0 ${4 + 24 * lift}px ${12 + 40 * lift}px rgba(0,0,0,${0.07 + 0.16 * lift})`,
        transform: `translateY(${(1 - appear) * 26}px) scale(${lerp(0.94, 1, appear) * (1 + 0.045 * lift)}) rotate(${3 * lift}deg)`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 24 }}>
        <span
          style={{
            height: 24,
            padding: "0 10px",
            borderRadius: 12,
            background: task.tone.bg,
            color: task.tone.fg,
            fontFamily: FONT.sans,
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: "0.01em",
            display: "flex",
            alignItems: "center",
          }}
        >
          {task.chip}
        </span>
        {done > 0 && (
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 13,
              background: ACCENT.green,
              transform: `scale(${done})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 10px rgba(34,197,94,0.35)",
            }}
          >
            <Check size={16} strokeWidth={3} color="#ffffff" />
          </div>
        )}
      </div>
      <div
        style={{
          marginTop: 9,
          height: task.lines * 25,
          overflow: "hidden",
          fontFamily: FONT.sans,
          fontWeight: 700,
          fontSize: 21,
          lineHeight: "25px",
          letterSpacing: "-0.02em",
          color: PAPER.ink,
        }}
      >
        {task.title}
      </div>
      <div
        style={{ marginTop: "auto", height: 22, display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            background: task.ownerColor,
            color: "#ffffff",
            fontFamily: FONT.sans,
            fontWeight: 700,
            fontSize: 9,
            letterSpacing: "0.02em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {task.owner}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontFamily: FONT.sans,
            fontWeight: 500,
            fontSize: 14,
            color: PAPER.muted,
          }}
        >
          <CalendarDays size={14} strokeWidth={2} color={PAPER.muted} />
          {task.date}
        </div>
      </div>
    </div>
  );
}
