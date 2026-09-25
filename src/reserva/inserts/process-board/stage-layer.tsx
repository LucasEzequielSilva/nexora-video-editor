import { useCurrentFrame } from "remotion";
import { ease, easeInOut, lerp, springAt } from "../../motion";
import { SPRING } from "../../theme";
import { STAGES } from "./data";
import {
  BOARD,
  hangPose,
  laneCount,
  laneHeight,
  laneLeft,
  POLAROID,
  STAGE_X,
  stringY,
  toScene,
  type WindowPose,
} from "./geometry";
import PaperClip from "./paper-clip";
import StageArt from "./stage-art";
import StageCard from "./stage-card";
import type { Timeline } from "./timing";

type StageLayerProps = { pose: WindowPose; t: Timeline };

/** Polaroids colgadas que se transforman en las columnas del tablero, más la columna "Listo". */
export default function StageLayer({ pose, t }: StageLayerProps) {
  const frame = useCurrentFrame();
  const listoPop = springAt(frame, t.listoIn, SPRING.pop);
  const listoHeight = laneHeight(3, frame, t);

  return (
    <>
      {STAGES.map((stage, i) => {
        if (frame < t.drops[i]) return null;
        const hang = hangPose(i, frame, t);
        const start = t.morph[i];
        const end = start + t.morphLength;
        const morph = easeInOut(frame, [start, end]);
        const height = laneHeight(i, frame, t);
        const lane = toScene(pose, laneLeft(i) + BOARD.colW / 2, BOARD.top + height / 2);
        return (
          <StageCard
            key={stage.label}
            center={{ x: lerp(hang.center.x, lane.x, morph), y: lerp(hang.center.y, lane.y, morph) }}
            width={lerp(POLAROID.w, BOARD.colW, morph)}
            height={lerp(POLAROID.h, height, morph)}
            rotation={lerp(hang.rotation, 0, morph)}
            scale={lerp(1, pose.scale, morph)}
            opacity={hang.opacity}
            morph={morph}
            photo={1 - easeInOut(frame, [start + 1, start + 17])}
            tint={ease(frame, [start + 8, end])}
            shadow={1 - ease(frame, [start + 4, end])}
            chrome={ease(frame, [end - 4, end + 8])}
            number={stage.number}
            label={stage.label}
            count={laneCount(i, frame, t)}
            art={<StageArt stage={stage} badge={springAt(frame, t.drops[i] + 9, SPRING.pop)} spin={frame * 0.35 + i * 40} />}
          />
        );
      })}

      {frame >= t.listoIn && (
        <StageCard
          center={toScene(pose, laneLeft(3) + BOARD.colW / 2, BOARD.top + listoHeight / 2)}
          width={BOARD.colW}
          height={listoHeight}
          rotation={0}
          scale={pose.scale * lerp(0.9, 1, listoPop)}
          opacity={ease(frame, [t.listoIn, t.listoIn + 6])}
          morph={1}
          photo={0}
          tint={1}
          shadow={0}
          chrome={ease(frame, [t.listoIn + 4, t.listoIn + 14])}
          done
          label="Listo"
          count={laneCount(3, frame, t)}
        />
      )}

      {STAGES.map((stage, i) => {
        if (frame < t.clips[i]) return null;
        const appear = springAt(frame, t.clips[i], SPRING.pop);
        const gone = ease(frame, [t.morph[i] - 4, t.morph[i] + 4]);
        if (gone >= 1) return null;
        const hang = hangPose(i, frame, t);
        const attached = ease(frame, [t.drops[i] + 3, t.drops[i] + 8]);
        const idle = Math.sin(frame / 16 + i * 2) * 4;
        return (
          <PaperClip
            key={stage.label}
            x={STAGE_X[i]}
            y={stringY(STAGE_X[i], frame, t) - 9}
            rotation={lerp(idle, hang.rotation, attached)}
            scale={appear}
            opacity={Math.min(1, appear * 1.5) * (1 - gone)}
          />
        );
      })}
    </>
  );
}
