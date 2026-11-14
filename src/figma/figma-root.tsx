import { Composition, Folder } from "remotion";
import LaAgenciaBento, { ALTO_BENTO, ANCHO_BENTO, DURACION_BENTO, FPS_BENTO } from "./la-agencia-bento";

export default function FigmaCompositions() {
  return (
    <Folder name="figma">
      <Composition
        id="la-agencia-bento"
        component={LaAgenciaBento}
        durationInFrames={DURACION_BENTO}
        fps={FPS_BENTO}
        width={ANCHO_BENTO}
        height={ALTO_BENTO}
      />
    </Folder>
  );
}
