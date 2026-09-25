import PiezaCompositions from "./pieza/pieza-root";
import ReservaCompositions from "./reserva/reserva-root";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <ReservaCompositions />
      <PiezaCompositions />
    </>
  );
};
