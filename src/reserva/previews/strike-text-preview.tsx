import { AbsoluteFill } from "remotion";
import StrikeText from "../components/strike-text";
import { useReservaFonts } from "../fonts";
import { PAPER } from "../theme";

/** Preview aislado de StrikeText, para ver el timing sin renderizar un video real. */
export default function StrikeTextPreview() {
  useReservaFonts();
  return (
    <AbsoluteFill style={{ background: PAPER.base, alignItems: "center", justifyContent: "center" }}>
      <StrikeText
        words={[
          { text: "schedule", at: 10 },
          { text: "post", at: 22 },
        ]}
        size={110}
      />
    </AbsoluteFill>
  );
}
