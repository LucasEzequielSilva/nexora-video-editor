import { Composition, Folder } from "remotion";
import PhoneOsAd, { DURACION_SPEC, FPS_SPEC, type PhoneOsProps } from "./phoneos/composition";
import PhoneOsReal, { DURACION_REAL } from "./phoneos/composition-real";
import PhoneOsCarrusel, { SLIDES_TOTAL } from "./phoneos/carrusel";
import PhoneOs169, { DURACION_169 } from "./phoneos/composition-169";

export default function SpecAdCompositions() {
  return (
    <Folder name="spec-ad">
      <Composition
        id="phoneos-ad"
        component={PhoneOsAd}
        defaultProps={{ nombre: "PhoneOS", palabraCta: "PHONE", cuenta: "@nexorasistem.ar" } satisfies PhoneOsProps}
        durationInFrames={DURACION_SPEC}
        fps={FPS_SPEC}
        width={1080}
        height={1920}
      />
      <Composition
        id="phoneos-real"
        component={PhoneOsReal}
        defaultProps={{ nombre: "PhoneOS", palabraCta: "PHONE", cuenta: "@nexorasistem.ar" } satisfies PhoneOsProps}
        durationInFrames={DURACION_REAL}
        fps={FPS_SPEC}
        width={1080}
        height={1920}
      />
      <Composition
        id="phoneos-169"
        component={PhoneOs169}
        defaultProps={{ nombre: "PhoneOS", palabraCta: "PHONE", cuenta: "@nexorasistem.ar" } satisfies PhoneOsProps}
        durationInFrames={DURACION_169}
        fps={FPS_SPEC}
        width={1920}
        height={1080}
      />
      <Composition
        id="phoneos-carrusel"
        component={PhoneOsCarrusel}
        defaultProps={{ nombre: "PhoneOS", palabraCta: "PHONE", cuenta: "@nexorasistem.ar" } satisfies PhoneOsProps}
        durationInFrames={SLIDES_TOTAL}
        fps={FPS_SPEC}
        width={1080}
        height={1350}
      />
    </Folder>
  );
}
