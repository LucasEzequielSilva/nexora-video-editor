import { FPS } from "../reserva/theme";
import type { AnclaTiempo, RawWord } from "./types";

const normalize = (text: string) => text.toLowerCase().replace(/[.,;:¿?¡!"]/g, "").trim();

export const msToFrame = (ms: number) => Math.round((ms / 1000) * FPS);

/** Momento en ms de un ancla: un tiempo absoluto, o el inicio (o el fin, con `fin`) de la n-ésima aparición de una palabra, más un ajuste. */
export const resolverMs = (ancla: AnclaTiempo, words: RawWord[]): number | null => {
  const offset = ancla.offsetMs ?? 0;
  if (ancla.palabra === undefined) return ancla.atMs === undefined ? null : ancla.atMs + offset;
  const key = normalize(ancla.palabra);
  const hit = words.filter((w) => normalize(w.word) === key)[(ancla.n ?? 1) - 1];
  return hit ? Math.round((ancla.fin ? hit.end : hit.start) * 1000) + offset : null;
};
