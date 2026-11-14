import { Composition, Folder } from "remotion";
import { BldrsEstudioMotion } from "./bldrs-estudio-motion";
import { ALTO, ANCHO, DURACION, FPS } from "./tema";

export default function BldrsEstudioMotionCompositions() {
  return (
    <Folder name="bldrs">
      <Composition id="bldrs-estudio-motion" component={BldrsEstudioMotion} durationInFrames={DURACION} fps={FPS} width={ANCHO} height={ALTO} />
    </Folder>
  );
}
