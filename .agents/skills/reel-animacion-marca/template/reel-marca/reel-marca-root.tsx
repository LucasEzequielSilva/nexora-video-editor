import React from "react";
import { Composition } from "remotion";
import { AnimacionMarca } from "./animacion";
import { Cierre, ReelEmpaque } from "./empaque";
import { ejemploTurnix } from "./briefs/ejemplo-turnix";
import { ALTO_ANIM, ALTO_REEL, ANCHO_ANIM, ANCHO_REEL, CIERRE_S, FPS, type Brief } from "./tema";
import { duracionAnimF, duracionReelF } from "./tiempos";

const BRIEFS: Brief[] = [ejemploTurnix];

export default function ReelMarcaCompositions() {
  return (
    <>
      {BRIEFS.map((b) => (
        <React.Fragment key={b.slug}>
          <Composition
            id={`${b.slug}-16x9`}
            component={AnimacionMarca}
            width={ANCHO_ANIM}
            height={ALTO_ANIM}
            fps={FPS}
            durationInFrames={duracionAnimF(b)}
            defaultProps={{ brief: b }}
          />
          <Composition
            id={`${b.slug}-reel`}
            component={ReelEmpaque}
            width={ANCHO_REEL}
            height={ALTO_REEL}
            fps={FPS}
            durationInFrames={duracionReelF(b)}
            defaultProps={{ brief: b }}
          />
          <Composition
            id={`${b.slug}-cierre`}
            component={Cierre}
            width={ANCHO_REEL}
            height={ALTO_REEL}
            fps={FPS}
            durationInFrames={Math.round(CIERRE_S * FPS)}
            defaultProps={{ brief: b }}
          />
        </React.Fragment>
      ))}
    </>
  );
}
