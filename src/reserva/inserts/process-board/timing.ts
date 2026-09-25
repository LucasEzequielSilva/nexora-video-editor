import type { TaskId } from "./data";

export type DragTiming = {
  id: TaskId;
  from: number;
  to: number;
  /** El cursor empieza a ir hacia la tarjeta. */
  approach: number;
  grab: number;
  /** La tarjeta suelta en la columna destino (click). */
  drop: number;
};

export type Timeline = {
  end: number;
  titleSerif: number;
  titleSans: number;
  titleOut: number;
  stringDraw: [number, number];
  clips: number[];
  drops: number[];
  arrows: number[];
  monitor: number;
  windowIn: number;
  morph: number[];
  morphLength: number;
  listoIn: number;
  portal: number;
  urlStart: number;
  urlFrames: number;
  eyebrow: number;
  title: number;
  avatars: number;
  progressIn: number;
  cardsStart: number;
  cardStagger: number;
  cursorIn: number;
  drags: [DragTiming, DragTiming];
  cursorOut: number;
  calendar: number;
  reuniones: number;
  annotation: number;
  objectives: number;
  fillEnd: number;
  check: number;
};

export const buildTimeline = (cues: Record<string, number>, end: number): Timeline => {
  const cue = (key: string, fallback: number) => cues[key] ?? fallback;
  const definicion = cue("definicion", 57);
  const diseno = cue("diseno", 92);
  const desarrollo = cue("desarrollo", 114);
  const monitor = cue("monitoreando", 163);
  const portal = cue("portal", 194);
  const reuniones = cue("reuniones", 311);
  const objectives = cue("objetivos", 403);

  const drops = [definicion, diseno, desarrollo].map((at) => at - 3);
  const cardsStart = portal + 4;
  const cursorIn = cardsStart + 30;
  const grab1 = cursorIn + 12;
  const drop1 = grab1 + 19;
  const grab2 = drop1 + 15;
  const drop2 = grab2 + 21;
  const fillEnd = objectives + 10;

  return {
    end,
    titleSerif: 6,
    titleSans: 14,
    titleOut: monitor - 16,
    stringDraw: [10, 40],
    clips: [0, 1, 2].map((i) => Math.min(24 + i * 6, drops[i] - 10)),
    drops,
    arrows: [drops[1] + 6, drops[2] + 6],
    monitor,
    windowIn: monitor - 4,
    morph: [0, 1, 2].map((i) => monitor + 2 + i * 3),
    morphLength: 26,
    listoIn: monitor + 22,
    portal,
    urlStart: portal - 3,
    urlFrames: 26,
    eyebrow: portal - 2,
    title: portal + 4,
    avatars: portal + 10,
    progressIn: portal + 14,
    cardsStart,
    cardStagger: 3,
    cursorIn,
    drags: [
      { id: "prototipo", from: 1, to: 2, approach: cursorIn, grab: grab1, drop: drop1 },
      { id: "alcance", from: 0, to: 3, approach: drop1 + 2, grab: grab2, drop: drop2 },
    ],
    cursorOut: drop2 + 3,
    calendar: reuniones - 4,
    reuniones,
    annotation: reuniones + 8,
    objectives,
    fillEnd,
    check: fillEnd + 1,
  };
};
