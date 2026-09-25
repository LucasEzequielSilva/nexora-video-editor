import type { CSSProperties } from "react";
import { Easing, interpolate, spring } from "remotion";
import { FPS, SPRING } from "./theme";

const OUT_EXPO = Easing.bezier(0.16, 1, 0.3, 1);
const IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);

/** Interpolación con clamp y ease-out suave (default de todo el edit). */
export const ease = (
  frame: number,
  input: [number, number],
  output: [number, number] = [0, 1],
  easing: (t: number) => number = OUT_EXPO,
): number =>
  interpolate(frame, input, output, { easing, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

export const easeInOut = (frame: number, input: [number, number], output: [number, number] = [0, 1]) =>
  ease(frame, input, output, IN_OUT);

/** Spring 0..1 que arranca en el frame `at`. */
export const springAt = (
  frame: number,
  at: number,
  config: (typeof SPRING)[keyof typeof SPRING] = SPRING.soft,
): number => spring({ frame: frame - at, fps: FPS, config });

/** Aparición editorial estándar de un elemento: opacidad + subida + desenfoque. */
export const revealStyle = (frame: number, at: number, distance = 24, duration = 14): CSSProperties => {
  const t = ease(frame, [at, at + duration]);
  return {
    opacity: t,
    transform: `translateY(${(1 - t) * distance}px)`,
    filter: `blur(${(1 - t) * 10}px)`,
  };
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
