import { INSERTS, type InsertId, type InsertLayout, type InsertSpec } from "./edit";
import { SCENE_TRANSITION } from "./theme";
import { srcToFrame, TOTAL_FRAMES } from "./timeline";

export type ResolvedInsert = {
  id: InsertId;
  layout: InsertLayout;
  /** Frame de salida donde arranca. */
  from: number;
  durationInFrames: number;
  /** Cues en frames locales (0 = inicio del insert). */
  cues: Record<string, number>;
};

export const resolveInsert = (spec: InsertSpec): ResolvedInsert => {
  const from = srcToFrame(spec.from);
  const end = spec.to === "end" ? TOTAL_FRAMES : srcToFrame(spec.to);
  const cues: Record<string, number> = {};
  for (const [key, seconds] of Object.entries(spec.cues)) {
    cues[key] = Math.max(0, srcToFrame(seconds) - from);
  }
  return { id: spec.id, layout: spec.layout, from, durationInFrames: Math.max(1, end - from), cues };
};

export const RESOLVED_INSERTS: ResolvedInsert[] = INSERTS.map(resolveInsert);

export const getResolvedInsert = (id: InsertId): ResolvedInsert => {
  const found = RESOLVED_INSERTS.find((insert) => insert.id === id);
  if (!found) throw new Error(`Insert inexistente: ${id}`);
  return found;
};

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** 0..1: cuánto está activo un insert en el frame dado (con rampas de entrada/salida). */
export const insertPresence = (insert: ResolvedInsert, frame: number): number => {
  const local = frame - insert.from;
  if (local < 0 || local > insert.durationInFrames) return 0;
  const enter = Math.min(1, local / SCENE_TRANSITION.enter);
  const reachesEnd = insert.from + insert.durationInFrames >= TOTAL_FRAMES;
  const exit = reachesEnd ? 1 : Math.min(1, (insert.durationInFrames - local) / SCENE_TRANSITION.exit);
  return easeInOut(Math.max(0, Math.min(enter, exit)));
};

/** Máxima presencia de los inserts con cierto layout en el frame dado. */
export const layoutAmount = (layout: InsertLayout, frame: number): number =>
  RESOLVED_INSERTS.filter((insert) => insert.layout === layout).reduce(
    (acc, insert) => Math.max(acc, insertPresence(insert, frame)),
    0,
  );
