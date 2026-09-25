import { AbsoluteFill, useCurrentFrame } from "remotion";
import PaperBackground from "../components/paper-background";
import ActOne from "./process-board/act-one";
import BoardLayer from "./process-board/board-layer";
import BrowserWindow from "./process-board/browser-window";
import CalendarCard from "./process-board/calendar-card";
import { cameraPose, windowPose } from "./process-board/geometry";
import SoundDesign from "./process-board/sound-design";
import StageLayer from "./process-board/stage-layer";
import { buildTimeline } from "./process-board/timing";
import type { InsertProps } from "./types";

export default function ProcessBoard({ durationInFrames, cues }: InsertProps) {
  const frame = useCurrentFrame();
  const t = buildTimeline(cues, durationInFrames);
  const camera = cameraPose(frame, t);
  const pose = windowPose(frame, t);

  return (
    <AbsoluteFill>
      <PaperBackground variant="arcs" seed={4} />
      <AbsoluteFill
        style={{
          transform: `scale(${camera.scale})`,
          transformOrigin: `${camera.origin.x}px ${camera.origin.y}px`,
        }}
      >
        <ActOne t={t} />
        <BrowserWindow pose={pose} t={t} />
        <StageLayer pose={pose} t={t} />
        <BoardLayer pose={pose} t={t} />
        <CalendarCard t={t} />
      </AbsoluteFill>
      <SoundDesign t={t} />
    </AbsoluteFill>
  );
}
