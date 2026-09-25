import type { ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ease, lerp } from "../motion";
import { SCENE_TRANSITION } from "../theme";

type SceneFrameProps = {
  durationInFrames: number;
  /** Si la escena llega al final del video no hace transición de salida. */
  holdEnd?: boolean;
  children: ReactNode;
};

/** Transición estándar de entrada/salida para escenas a pantalla completa. */
export default function SceneFrame({ durationInFrames, holdEnd = false, children }: SceneFrameProps) {
  const frame = useCurrentFrame();
  const enter = ease(frame, [0, SCENE_TRANSITION.enter]);
  const exit = holdEnd ? 1 : ease(frame, [durationInFrames - SCENE_TRANSITION.exit, durationInFrames], [1, 0]);
  const visible = Math.min(enter, exit);
  const scale = lerp(1.04, 1, enter) * lerp(0.985, 1, exit);

  return (
    <AbsoluteFill
      style={{
        opacity: visible,
        transform: `scale(${scale})`,
        filter: visible < 1 ? `blur(${(1 - visible) * 14}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
}
