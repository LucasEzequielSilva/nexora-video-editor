import PiezaCompositions from "./pieza/pieza-root";
import ReservaCompositions from "./reserva/reserva-root";
import SpecCompositions from "./spec/spec-root";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <ReservaCompositions />
      <PiezaCompositions />
      <SpecCompositions />
    </>
  );
};
