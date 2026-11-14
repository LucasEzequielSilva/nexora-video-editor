import { Composition, Folder } from "remotion";
import ElevatePromo, { ALTO_ELEVATE, ANCHO_ELEVATE, DURACION_ELEVATE, FPS_ELEVATE } from "./elevate-promo";

export default function ElevateCompositions() {
  return (
    <Folder name="elevate">
      <Composition
        id="elevate-promo"
        component={ElevatePromo}
        durationInFrames={DURACION_ELEVATE}
        fps={FPS_ELEVATE}
        width={ANCHO_ELEVATE}
        height={ALTO_ELEVATE}
        defaultProps={{ sonido: true }}
      />
    </Folder>
  );
}
