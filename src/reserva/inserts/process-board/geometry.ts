import { spring } from "remotion";
import { ease, easeInOut, lerp, springAt } from "../../motion";
import { FPS, SPRING } from "../../theme";
import { INITIAL_COLUMNS, ORDER, TASKS, type TaskId } from "./data";
import type { DragTiming, Timeline } from "./timing";

export type Point = { x: number; y: number };

export const WINDOW = { left: 100, top: 84, width: 1420, height: 866, radius: 24, bar: 56 } as const;
const WINDOW_CENTER: Point = { x: WINDOW.left + WINDOW.width / 2, y: WINDOW.top + WINDOW.height / 2 };

export const BOARD = { top: 196, padX: 28, colW: 330, gap: 14 } as const;
export const LANE = { header: 58, pad: 8, gap: 10, footer: 42, radius: 20 } as const;
export const CARD_W = BOARD.colW - LANE.pad * 2;

export const cardHeight = (id: TaskId) => 90 + TASKS[id].lines * 25;
export const laneLeft = (col: number) => BOARD.padX + col * (BOARD.colW + BOARD.gap);

export const POLAROID = { w: 330, h: 400, pad: 16, photo: 268, caption: 116 } as const;
export const STAGE_X = [450, 865, 1280] as const;
const STAGE_ROTATION = [-4, 2, -3] as const;
/** Distancia entre el hilo y el borde superior de la polaroid (lo que muerde el clip). */
export const CLIP_BITE = 18;

const STRING = { from: -40, span: 2000, left: 418, rise: -295, sag: 87 } as const;

const stringBaseY = (x: number) => {
  const u = (x - STRING.from) / STRING.span;
  return STRING.left + STRING.rise * u + 4 * STRING.sag * u * (1 - u);
};

export const landings = (t: Timeline) => t.drops.map((drop) => drop + 5);

const dip = (frame: number, landing: number) => {
  const local = frame - landing;
  if (local < 0) return 0;
  return 20 * Math.exp(-local / 10) * Math.sin(local * 0.36);
};

export const stringY = (x: number, frame: number, t: Timeline) =>
  stringBaseY(x) +
  landings(t).reduce((acc, landing, i) => acc + dip(frame, landing) * Math.exp(-(((x - STAGE_X[i]) / 260) ** 2)), 0);

export const stringPath = (frame: number, t: Timeline) => {
  const points: string[] = [];
  for (let x = STRING.from; x <= STRING.from + STRING.span; x += 40) {
    points.push(`${points.length === 0 ? "M" : "L"} ${x} ${stringY(x, frame, t).toFixed(2)}`);
  }
  return points.join(" ");
};

export type HangPose = { pivot: Point; center: Point; rotation: number; opacity: number };

const DROP_SPRING = { damping: 11, stiffness: 140, mass: 0.9 };
const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Polaroid colgada del hilo: pivote en el clip, rotación con balanceo amortiguado. */
export const hangPose = (index: number, frame: number, t: Timeline): HangPose => {
  const start = t.drops[index];
  const fall = spring({ frame: frame - start, fps: FPS, config: DROP_SPRING });
  const x = STAGE_X[index];
  const pivot = { x, y: stringY(x, frame, t) + CLIP_BITE - (1 - fall) * 190 };
  const local = frame - start;
  const swing = local >= 0 ? 7 * Math.exp(-local / 15) * Math.sin(local / 3.4) : 0;
  const rotation = STAGE_ROTATION[index] + swing + 0.6 * Math.sin((frame + index * 37) / 36);
  const rad = toRad(rotation);
  return {
    pivot,
    center: { x: pivot.x - (POLAROID.h / 2) * Math.sin(rad), y: pivot.y + (POLAROID.h / 2) * Math.cos(rad) },
    rotation,
    opacity: ease(frame, [start, start + 5]),
  };
};

/** Punto medio inferior de una polaroid en reposo, desplazado a lo largo de su borde. */
export const restBottom = (index: number, along: number): Point => {
  const x = STAGE_X[index];
  const rad = toRad(STAGE_ROTATION[index]);
  const bottom = { x: x - POLAROID.h * Math.sin(rad), y: stringBaseY(x) + CLIP_BITE + POLAROID.h * Math.cos(rad) };
  return { x: bottom.x + Math.cos(rad) * along, y: bottom.y + Math.sin(rad) * along };
};

export type WindowPose = { scale: number; dy: number; opacity: number };

export const windowPose = (frame: number, t: Timeline): WindowPose => ({
  scale: lerp(1.14, 1, springAt(frame, t.windowIn, SPRING.soft)),
  dy: Math.sin(frame / 40) * 3,
  opacity: ease(frame, [t.windowIn, t.windowIn + 10]),
});

/** Coordenadas locales de la ventana (0,0 = esquina superior izquierda) a coordenadas de escena. */
export const toScene = (pose: WindowPose, x: number, y: number): Point => ({
  x: WINDOW_CENTER.x + (WINDOW.left + x - WINDOW_CENTER.x) * pose.scale,
  y: WINDOW_CENTER.y + (WINDOW.top + y - WINDOW_CENTER.y) * pose.scale + pose.dy,
});

type Entry = { id: TaskId; presence: number };

const moveStart = (drag: DragTiming) => drag.grab + 3;

const columnEntries = (col: number, frame: number, t: Timeline): Entry[] => {
  const arriving = t.drags
    .filter((drag) => drag.to === col)
    .map((drag) => ({ id: drag.id, presence: easeInOut(frame, [moveStart(drag) + 4, drag.drop]) }));
  const initial = INITIAL_COLUMNS[col].map((id) => {
    const leaving = t.drags.find((drag) => drag.id === id && drag.from === col);
    return { id, presence: leaving ? 1 - easeInOut(frame, [leaving.grab + 3, leaving.grab + 15]) : 1 };
  });
  return [...arriving, ...initial];
};

export const slotTop = (col: number, id: TaskId, frame: number, t: Timeline) => {
  let y = BOARD.top + LANE.header;
  for (const entry of columnEntries(col, frame, t)) {
    if (entry.id === id) return y;
    y += entry.presence * (cardHeight(entry.id) + LANE.gap);
  }
  return y;
};

export const laneHeight = (col: number, frame: number, t: Timeline) =>
  columnEntries(col, frame, t).reduce<number>(
    (acc, entry) => acc + entry.presence * (cardHeight(entry.id) + LANE.gap),
    LANE.header,
  ) + LANE.footer;

/** Sólo cuenta tarjetas que ya arrancaron su entrada (mismo stagger que usa BoardLayer). */
const hasEntered = (id: TaskId, frame: number, t: Timeline) => frame >= t.cardsStart + ORDER.indexOf(id) * t.cardStagger;

export const laneCount = (col: number, frame: number, t: Timeline) =>
  INITIAL_COLUMNS[col].filter((id) => hasEntered(id, frame, t)).length +
  t.drags.filter((drag) => drag.to === col && frame >= drag.drop).length -
  t.drags.filter((drag) => drag.from === col && frame >= drag.drop).length;

export type TaskPose = { x: number; y: number; lift: number; dragging: boolean };

export const taskPose = (id: TaskId, frame: number, t: Timeline): TaskPose => {
  const drag = t.drags.find((d) => d.id === id);
  if (!drag) {
    const col = INITIAL_COLUMNS.findIndex((ids) => ids.includes(id));
    return { x: laneLeft(col) + LANE.pad, y: slotTop(col, id, frame, t), lift: 0, dragging: false };
  }
  if (frame < drag.grab) {
    return { x: laneLeft(drag.from) + LANE.pad, y: slotTop(drag.from, id, frame, t), lift: 0, dragging: false };
  }
  const source = { x: laneLeft(drag.from) + LANE.pad, y: slotTop(drag.from, id, drag.grab, t) };
  const target = { x: laneLeft(drag.to) + LANE.pad, y: slotTop(drag.to, id, drag.drop + 30, t) };
  const p = easeInOut(frame, [moveStart(drag), drag.drop]);
  const lift = ease(frame, [drag.grab, drag.grab + 6]) * (1 - easeInOut(frame, [drag.drop, drag.drop + 6]));
  return {
    x: lerp(source.x, target.x, p),
    y: lerp(source.y, target.y, p) - Math.sin(Math.PI * p) * 34,
    lift,
    dragging: frame < drag.drop + 6,
  };
};

const grabOffset = (id: TaskId): Point => ({ x: CARD_W * 0.6, y: cardHeight(id) * 0.55 });

export type CursorPose = Point & { opacity: number; press: number };

export const cursorPose = (frame: number, t: Timeline): CursorPose => {
  const [first, second] = t.drags;
  const held = (drag: DragTiming, at: number): Point => {
    const pose = taskPose(drag.id, at, t);
    const offset = grabOffset(drag.id);
    return { x: pose.x + offset.x, y: pose.y + offset.y };
  };
  const travel = (from: Point, to: Point, range: [number, number]): Point => {
    const p = easeInOut(frame, range);
    return { x: lerp(from.x, to.x, p), y: lerp(from.y, to.y, p) - Math.sin(Math.PI * p) * 40 };
  };

  let point: Point;
  if (frame < first.grab) {
    point = travel({ x: 760, y: 800 }, held(first, first.grab), [first.approach, first.grab - 1]);
  } else if (frame < first.drop + 2) {
    point = held(first, frame);
  } else if (frame < second.grab) {
    point = travel(held(first, first.drop + 2), held(second, second.grab), [second.approach, second.grab - 1]);
  } else if (frame < second.drop + 3) {
    point = held(second, frame);
  } else {
    const from = held(second, second.drop + 3);
    point = travel(from, { x: from.x + 90, y: from.y + 150 }, [t.cursorOut, t.cursorOut + 18]);
  }

  const press = t.drags.reduce(
    (acc, drag) => Math.max(acc, ease(frame, [drag.grab - 2, drag.grab + 1]) * (1 - ease(frame, [drag.drop, drag.drop + 4]))),
    0,
  );
  return {
    ...point,
    opacity: ease(frame, [t.cursorIn, t.cursorIn + 6]) * (1 - ease(frame, [t.cursorOut + 4, t.cursorOut + 16])),
    press,
  };
};

export type CameraPose = { scale: number; origin: Point };

export const cameraPose = (frame: number, t: Timeline): CameraPose => {
  const scale =
    1 +
    0.02 * easeInOut(frame, [0, t.monitor - 8]) +
    0.02 * easeInOut(frame, [t.monitor - 6, t.monitor + 34]) +
    0.008 * easeInOut(frame, [t.monitor + 34, t.objectives - 36]) +
    0.022 * easeInOut(frame, [t.objectives - 36, t.end]);
  const focus = easeInOut(frame, [t.objectives - 36, t.objectives + 12]);
  return { scale, origin: { x: lerp(820, 1010, focus), y: lerp(540, 230, focus) } };
};
