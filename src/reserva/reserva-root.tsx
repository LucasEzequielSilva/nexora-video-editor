import { Composition, Folder } from "remotion";
import type { InsertId } from "./edit";
import { INSERT_COMPONENTS } from "./inserts/registry";
import { InsertPreviewComposition } from "./previews/insert-preview";
import ChapterBarPreview from "./previews/chapter-bar-preview";
import StrikeTextPreview from "./previews/strike-text-preview";
import ReservaComposition, { RESERVA_DURATION } from "./reserva-composition";
import { FPS, HEIGHT, WIDTH } from "./theme";

export default function ReservaCompositions() {
  return (
    <Folder name="reserva">
      <Composition
        id="Reserva7245"
        component={ReservaComposition}
        durationInFrames={RESERVA_DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Folder name="reserva-inserts">
        {(Object.keys(INSERT_COMPONENTS) as InsertId[]).map((id) => (
          <InsertPreviewComposition key={id} id={id} Component={INSERT_COMPONENTS[id]} />
        ))}
      </Folder>
      <Folder name="reserva-components">
        <Composition id="StrikeTextPreview" component={StrikeTextPreview} durationInFrames={60} fps={FPS} width={WIDTH} height={HEIGHT} />
        <Composition id="ChapterBarPreview" component={ChapterBarPreview} durationInFrames={180} fps={FPS} width={WIDTH} height={HEIGHT} />
      </Folder>
    </Folder>
  );
}
