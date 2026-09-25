import { AbsoluteFill } from "remotion";
import ChapterBar from "../components/chapter-bar";
import { useReservaFonts } from "../fonts";

const TOTAL = 180;

/** Preview aislado de ChapterBar sobre un fondo oscuro, simulando una grabación de pantalla. */
export default function ChapterBarPreview() {
  useReservaFonts();
  return (
    <AbsoluteFill style={{ background: "linear-gradient(160deg, #1a1a1a, #050505)" }}>
      <ChapterBar
        totalDurationInFrames={TOTAL}
        chapters={[
          { label: "Intro", at: 0 },
          { label: "Prompting", at: 30 },
          { label: "Building", at: 70 },
          { label: "Connecting MCP", at: 110 },
          { label: "Debugging", at: 150 },
          { label: "Outro", at: 176 },
        ]}
      />
    </AbsoluteFill>
  );
}
