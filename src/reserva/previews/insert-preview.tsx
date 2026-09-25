import type { ComponentType } from "react";
import { AbsoluteFill, Composition, Img, staticFile, useCurrentFrame } from "remotion";
import SceneFrame from "../components/scene-frame";
import { talkingHeadGeometry } from "../components/talking-head";
import type { InsertId } from "../edit";
import { useReservaFonts } from "../fonts";
import type { InsertProps } from "../inserts/types";
import { ease } from "../motion";
import { getResolvedInsert } from "../resolve";
import { FPS, HEIGHT, SCENE_TRANSITION, WIDTH } from "../theme";
import { TOTAL_FRAMES } from "../timeline";

/** Previsualiza un insert aislado, con un frame fijo de Lucas donde corresponde según el layout. */
const InsertPreview = ({ id, Component }: { id: InsertId; Component: ComponentType<InsertProps> }) => {
  useReservaFonts();
  const frame = useCurrentFrame();
  const insert = getResolvedInsert(id);
  const still = <Img src={staticFile("reserva/img/preview-lucas-50.jpg")} style={{ width: WIDTH, height: HEIGHT }} />;
  const content = <Component durationInFrames={insert.durationInFrames} cues={insert.cues} />;

  if (insert.layout === "overlay") {
    return (
      <AbsoluteFill style={{ background: "#000" }}>
        {still}
        {content}
      </AbsoluteFill>
    );
  }

  const holdEnd = insert.from + insert.durationInFrames >= TOTAL_FRAMES;
  const pip =
    insert.layout === "full-pip"
      ? Math.min(
          ease(frame, [0, SCENE_TRANSITION.enter]),
          holdEnd ? 1 : ease(frame, [insert.durationInFrames - SCENE_TRANSITION.exit, insert.durationInFrames], [1, 0]),
        )
      : 0;
  const geometry = talkingHeadGeometry(pip, 1);

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {insert.layout === "full" && still}
      <SceneFrame durationInFrames={insert.durationInFrames} holdEnd={holdEnd}>
        {content}
      </SceneFrame>
      {insert.layout === "full-pip" && (
        <div style={geometry.container}>
          <div style={geometry.inner}>{still}</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const previewCompositionId = (id: InsertId) => `preview-${id}`;

const previewCache = new Map<InsertId, ComponentType>();

const stablePreview = (id: InsertId, Component: ComponentType<InsertProps>): ComponentType => {
  const cached = previewCache.get(id);
  if (cached) return cached;
  const Bound = () => <InsertPreview id={id} Component={Component} />;
  previewCache.set(id, Bound);
  return Bound;
};

export const InsertPreviewComposition = ({ id, Component }: { id: InsertId; Component: ComponentType<InsertProps> }) => (
  <Composition
    id={previewCompositionId(id)}
    component={stablePreview(id, Component)}
    durationInFrames={getResolvedInsert(id).durationInFrames}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
