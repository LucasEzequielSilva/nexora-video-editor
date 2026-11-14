import { Composition, Folder } from "remotion";
import { ALTO_ZS, ANCHO_ZS, DURACION_ZS, ELEVATE, FPS_ZS, ZoomSettle } from "./zoom-settle";
import { ALTO_H, ANCHO_H, FPS_H, HISTORIA_ELEVATE, Historia, duracionHistoria } from "./historia";
import { ALTO_AV, ANCHO_AV, AvisoElevate, DURACION_AV, FPS_AV } from "./aviso-elevate";
import { ALTO_CM, ANCHO_CM, ChatMontajeBldrs, DURACION_CM } from "./chat-montaje-bldrs";
import { ALTO_UK, ANCHO_UK, FPS_UK } from "./ui-kit/grilla";
import { DURACION_UK, UiKit } from "./ui-kit/ui-kit";

export default function MotionUiCompositions() {
  return (
    <Folder name="motion-ui">
      <Composition
        id="zoom-settle-elevate"
        component={ZoomSettle}
        durationInFrames={DURACION_ZS}
        fps={FPS_ZS}
        width={ANCHO_ZS}
        height={ALTO_ZS}
        defaultProps={ELEVATE}
      />
      <Composition
        id="historia-elevate"
        component={Historia}
        durationInFrames={duracionHistoria(HISTORIA_ELEVATE)}
        fps={FPS_H}
        width={ANCHO_H}
        height={ALTO_H}
        defaultProps={HISTORIA_ELEVATE}
      />
      <Composition id="chat-montaje-bldrs" component={ChatMontajeBldrs} durationInFrames={DURACION_CM} fps={30} width={ANCHO_CM} height={ALTO_CM} />
      <Composition id="ui-kit-bldrs" component={UiKit} durationInFrames={DURACION_UK} fps={FPS_UK} width={ANCHO_UK} height={ALTO_UK} />
      <Composition id="aviso-elevate" component={AvisoElevate} durationInFrames={DURACION_AV} fps={FPS_AV} width={ANCHO_AV} height={ALTO_AV} />
    </Folder>
  );
}
