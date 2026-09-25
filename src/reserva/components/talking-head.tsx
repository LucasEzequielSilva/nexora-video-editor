import type { CSSProperties, ReactNode } from "react";
import { interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { SEGMENT_PUSH, segmentZoom, ZOOM_HITS } from "../edit";
import { lerp } from "../motion";
import { FACE, HEIGHT, PIP, WIDTH } from "../theme";
import { SEGMENTS, srcToFrame } from "../timeline";

const VIDEO_SRC = "reserva/video/img7245.mp4";
const HIT_FRAMES = ZOOM_HITS.map((hit) => ({ frame: srcToFrame(hit.at), amount: hit.amount }));

/** Zoom de cámara en el frame de salida dado (jump cuts alternados + empuje lento + golpes). */
export const cameraZoom = (frame: number): number => {
  const seg = SEGMENTS.find((s) => frame >= s.from && frame < s.from + s.durationInFrames) ?? SEGMENTS[SEGMENTS.length - 1];
  const progress = Math.min(1, Math.max(0, (frame - seg.from) / seg.durationInFrames));
  let zoom = segmentZoom(seg.index) + SEGMENT_PUSH * progress;
  for (const hit of HIT_FRAMES) {
    const local = frame - hit.frame;
    if (local < -2 || local > 60) continue;
    const envelope = interpolate(local, [0, 7, 34, 60], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: (t) => 1 - Math.pow(1 - t, 3),
    });
    zoom += hit.amount * envelope;
  }
  return zoom;
};

/** Geometría del plano de Lucas: pip = 0 pantalla completa, 1 círculo abajo a la derecha. */
export const talkingHeadGeometry = (pip: number, zoom: number): { container: CSSProperties; inner: CSSProperties } => {
  const size = PIP.size;
  const x = lerp(0, WIDTH - PIP.right - size, pip);
  const y = lerp(0, HEIGHT - PIP.bottom - size, pip);
  const width = lerp(WIDTH, size, pip);
  const height = lerp(HEIGHT, size, pip);
  const k = lerp(zoom, PIP.zoom, pip);
  const anchorX = lerp(FACE.x, width / 2, pip);
  const anchorY = lerp(FACE.y, height / 2, pip);

  return {
    container: {
      position: "absolute",
      left: x,
      top: y,
      width,
      height,
      overflow: "hidden",
      borderRadius: lerp(0, size / 2, pip),
      boxShadow:
        pip > 0
          ? `0 0 0 ${PIP.border * pip}px #ffffff, 0 ${24 * pip}px ${60 * pip}px rgba(0,0,0,${0.35 * pip})`
          : undefined,
      background: "#000",
    },
    inner: {
      position: "absolute",
      left: 0,
      top: 0,
      width: WIDTH,
      height: HEIGHT,
      transformOrigin: "0 0",
      transform: `translate(${anchorX - FACE.x * k}px, ${anchorY - FACE.y * k}px) scale(${k})`,
    },
  };
};

const GRADE: CSSProperties = { filter: "contrast(1.06) saturate(1.06) brightness(0.99)" };

type TalkingHeadProps = {
  pip: number;
  children?: ReactNode;
};

export default function TalkingHead({ pip }: TalkingHeadProps) {
  const frame = useCurrentFrame();
  const { container, inner } = talkingHeadGeometry(pip, cameraZoom(frame));

  return (
    <div style={container}>
      <div style={inner}>
        {SEGMENTS.map((seg) => (
          <Sequence
            key={seg.index}
            from={seg.from}
            durationInFrames={seg.durationInFrames}
            premountFor={30}
            name={`tramo ${seg.index} (${seg.srcStart.toFixed(2)}s)`}
          >
            <OffthreadVideo
              src={staticFile(VIDEO_SRC)}
              trimBefore={seg.trimBefore}
              style={{ width: WIDTH, height: HEIGHT, ...GRADE }}
              volume={(f) =>
                interpolate(f, [0, 2, seg.durationInFrames - 2, seg.durationInFrames], [0, 1, 1, 0], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })
              }
            />
          </Sequence>
        ))}
      </div>
    </div>
  );
}
