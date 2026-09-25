export type InsertProps = {
  /** Duración total del insert en frames. */
  durationInFrames: number;
  /** Momentos clave en frames locales (0 = inicio del insert). Ver edit.ts para las claves de cada insert. */
  cues: Record<string, number>;
};
