import type { ComponentType } from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import Captions from "./components/captions";
import SceneFrame from "./components/scene-frame";
import Sfx from "./components/sfx";
import TalkingHead from "./components/talking-head";
import { useReservaFonts } from "./fonts";
import { INSERT_COMPONENTS } from "./inserts/registry";
import type { InsertProps } from "./inserts/types";
import { layoutAmount, RESOLVED_INSERTS, type ResolvedInsert } from "./resolve";
import { TOTAL_FRAMES } from "./timeline";

export const RESERVA_DURATION = TOTAL_FRAMES;

/** Monta un insert en su lugar del timeline, con la transición y los whooshes que le tocan por layout. */
export const InsertLayer = ({ insert, Component }: { insert: ResolvedInsert; Component: ComponentType<InsertProps> }) => {
  const isScene = insert.layout !== "overlay";
  const holdEnd = insert.from + insert.durationInFrames >= TOTAL_FRAMES;
  const content = <Component durationInFrames={insert.durationInFrames} cues={insert.cues} />;

  return (
    <Sequence from={insert.from} durationInFrames={insert.durationInFrames} premountFor={30} name={`insert:${insert.id}`}>
      {isScene ? (
        <SceneFrame durationInFrames={insert.durationInFrames} holdEnd={holdEnd}>
          {content}
        </SceneFrame>
      ) : (
        content
      )}
      {isScene && <Sfx name="whoosh-soft" at={4} volume={0.32} />}
      {isScene && !holdEnd && <Sfx name="whoosh-short" at={insert.durationInFrames - 4} volume={0.22} />}
    </Sequence>
  );
};

export default function ReservaComposition() {
  useReservaFonts();
  const frame = useCurrentFrame();
  const pip = layoutAmount("full-pip", frame);
  const full = layoutAmount("full", frame);
  const captionsVisibility = 1 - Math.max(pip, full);

  const scenes = RESOLVED_INSERTS.filter((insert) => insert.layout !== "overlay");
  const overlays = RESOLVED_INSERTS.filter((insert) => insert.layout === "overlay");

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ zIndex: pip > 0 ? 3 : 1 }}>
        <TalkingHead pip={pip} />
      </AbsoluteFill>
      <AbsoluteFill style={{ zIndex: 2 }}>
        {scenes.map((insert) => (
          <InsertLayer key={insert.id} insert={insert} Component={INSERT_COMPONENTS[insert.id]} />
        ))}
      </AbsoluteFill>
      <AbsoluteFill style={{ zIndex: 4 }}>
        {overlays.map((insert) => (
          <InsertLayer key={insert.id} insert={insert} Component={INSERT_COMPONENTS[insert.id]} />
        ))}
      </AbsoluteFill>
      <AbsoluteFill style={{ zIndex: 5 }}>
        <Captions visibility={captionsVisibility} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
