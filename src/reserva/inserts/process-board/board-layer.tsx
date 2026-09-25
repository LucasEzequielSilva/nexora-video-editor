import { useCurrentFrame } from "remotion";
import { ease, lerp, springAt } from "../../motion";
import { SPRING } from "../../theme";
import Cursor from "./cursor";
import { ORDER, TASKS, type TaskId } from "./data";
import { cursorPose, taskPose, WINDOW, type WindowPose } from "./geometry";
import KanbanCard from "./kanban-card";
import type { Timeline } from "./timing";

type BoardLayerProps = { pose: WindowPose; t: Timeline };

/** Tarjetas del tablero, drags y cursor, en coordenadas locales de la ventana. */
export default function BoardLayer({ pose, t }: BoardLayerProps) {
  const frame = useCurrentFrame();
  if (frame < t.cardsStart) return null;

  const cards = ORDER.map((id, index) => ({ id, at: t.cardsStart + index * t.cardStagger, pose: taskPose(id, frame, t) }))
    .filter((card) => frame >= card.at)
    .sort((a, b) => Number(a.pose.dragging) - Number(b.pose.dragging));

  const doneAt = (id: TaskId): number | null => {
    if (TASKS[id].done) return t.cardsStart + ORDER.indexOf(id) * t.cardStagger + 4;
    const drag = t.drags.find((d) => d.id === id && d.to === 3);
    return drag ? drag.drop + 3 : null;
  };

  const cursor = cursorPose(frame, t);
  const ripples = t.drags.flatMap((drag) => [drag.grab, drag.drop]);

  return (
    <div
      style={{
        position: "absolute",
        left: WINDOW.left,
        top: WINDOW.top,
        width: WINDOW.width,
        height: WINDOW.height,
        transform: `translateY(${pose.dy}px) scale(${pose.scale})`,
      }}
    >
      {cards.map((card) => {
        const done = doneAt(card.id);
        return (
          <KanbanCard
            key={card.id}
            id={card.id}
            x={card.pose.x}
            y={card.pose.y}
            appear={springAt(frame, card.at, SPRING.pop)}
            opacity={ease(frame, [card.at, card.at + 5])}
            lift={card.pose.lift}
            done={done !== null && frame >= done ? springAt(frame, done, SPRING.pop) : 0}
          />
        );
      })}

      {ripples.map((at) => {
        const local = frame - at;
        if (local < 0 || local > 14) return null;
        const p = ease(frame, [at, at + 14]);
        const center = cursorPose(at, t);
        const radius = lerp(6, 34, p);
        return (
          <div
            key={at}
            style={{
              position: "absolute",
              left: center.x - radius,
              top: center.y - radius,
              width: radius * 2,
              height: radius * 2,
              borderRadius: radius,
              border: `2.5px solid rgba(17,17,17,${0.4 * (1 - p)})`,
              boxSizing: "border-box",
            }}
          />
        );
      })}

      <Cursor x={cursor.x} y={cursor.y} opacity={cursor.opacity} press={cursor.press} />
    </div>
  );
}
