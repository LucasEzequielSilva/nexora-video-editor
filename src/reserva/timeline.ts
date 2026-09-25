import { FPS } from "./theme";
import { WORDS } from "./transcript";

/** Punto de entrada y salida del video original, en segundos. */
export const SOURCE_IN = 1.36;
export const SOURCE_OUT = 132.1;

/** Tramos del original que se eliminan (silencios, repeticiones). Segundos del original. */
export const CUTS: [number, number][] = [
  [4.09, 4.62],
  [9.53, 10.03],
  [16.96, 20.75],
  [23.32, 23.78],
  [27.62, 29.11],
  [30.75, 31.3],
  [32.68, 45.48],
  [47.92, 50.93],
  [54.88, 55.51],
  [59.62, 60.14],
  [65.6, 76.08],
  [81.99, 86.0],
  [88.51, 89.0],
  [90.75, 91.3],
  [94.08, 94.72],
  [99.28, 106.60],
  [109.69, 110.19],
  [113.12, 115.28],
  [120.12, 122.82],
  [126.0, 129.4],
];

/** Segundos de cola después de la última palabra (para el cierre). */
export const TAIL_SECONDS = 1.6;

export type Segment = {
  index: number;
  srcStart: number;
  srcEnd: number;
  /** Frame de salida donde arranca el tramo. */
  from: number;
  durationInFrames: number;
  /** Frame del original donde arranca (para trimBefore). */
  trimBefore: number;
};

const buildSegments = (): Segment[] => {
  const segments: Segment[] = [];
  let cursor = SOURCE_IN;
  let outSeconds = 0;
  const ranges: [number, number][] = [];
  for (const [cutStart, cutEnd] of CUTS) {
    ranges.push([cursor, cutStart]);
    cursor = cutEnd;
  }
  ranges.push([cursor, SOURCE_OUT]);

  ranges.forEach(([srcStart, srcEnd], index) => {
    const from = Math.round(outSeconds * FPS);
    outSeconds += srcEnd - srcStart;
    const to = Math.round(outSeconds * FPS);
    segments.push({
      index,
      srcStart,
      srcEnd,
      from,
      durationInFrames: to - from,
      trimBefore: Math.round(srcStart * FPS),
    });
  });
  return segments;
};

export const SEGMENTS = buildSegments();

const lastSegment = SEGMENTS[SEGMENTS.length - 1];
export const VIDEO_FRAMES = lastSegment.from + lastSegment.durationInFrames;
export const TOTAL_FRAMES = VIDEO_FRAMES + Math.round(TAIL_SECONDS * FPS);

/** Convierte un tiempo del video original (s) a frame de salida. Si cae en un corte, salta al inicio del tramo siguiente. */
export const srcToFrame = (seconds: number): number => {
  for (const seg of SEGMENTS) {
    if (seconds < seg.srcStart) return seg.from;
    if (seconds <= seg.srcEnd) return seg.from + Math.round((seconds - seg.srcStart) * FPS);
  }
  return VIDEO_FRAMES;
};

/** Inicio (s del original) de la palabra i del transcript. */
export const w = (index: number): number => WORDS[index].start;

/** Fin (s del original) de la palabra i del transcript. */
export const wEnd = (index: number): number => WORDS[index].end;

export type TimedWord = {
  index: number;
  text: string;
  from: number;
  to: number;
};

/** Palabras que sobreviven a los cortes, en frames de salida. */
export const TIMED_WORDS: TimedWord[] = WORDS.flatMap((word, index) => {
  const seg = SEGMENTS.find((s) => word.end > s.srcStart && word.start < s.srcEnd);
  if (!seg) return [];
  const start = Math.max(word.start, seg.srcStart);
  const end = Math.min(word.end, seg.srcEnd);
  const from = srcToFrame(start);
  const to = Math.max(from + 2, srcToFrame(end));
  return [{ index, text: word.text, from, to }];
});
