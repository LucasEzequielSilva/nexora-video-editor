import PiezaCompositions from "./pieza/pieza-root";
import ReservaCompositions from "./reserva/reserva-root";
import SpecAdCompositions from "./spec-ad/spec-ad-root";
import FigmaCompositions from "./figma/figma-root";
import ElevateCompositions from "./elevate/elevate-root";
import BldrsEstudioMotionCompositions from "./bldrs-estudio-motion/bldrs-estudio-motion-root";
import MotionUiCompositions from "./motion-ui/motion-ui-root";
import ReelMarcaCompositions from "./reel-marca/reel-marca-root";
import CarruselCompositions from "./carrusel/carrusel-root";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <ReservaCompositions />
      <PiezaCompositions />
      <SpecAdCompositions />
      <FigmaCompositions />
      <ElevateCompositions />
      <BldrsEstudioMotionCompositions />
      <MotionUiCompositions />
      <ReelMarcaCompositions />
      <CarruselCompositions />
    </>
  );
};
