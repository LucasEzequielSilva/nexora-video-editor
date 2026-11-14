import React from "react";
import { Composition } from "remotion";
import { ejemploBruma } from "./briefs/ejemplo-bruma";
import { CarruselAnimado, Lamina1 } from "./laminas";
import { ALTO, ANCHO, ANIMADO_DEFAULT, FPS, type Brief } from "./tema";

const BRIEFS: Brief[] = [ejemploBruma];

export const duracionAnimadoF = (b: Brief): number => Math.round((b.animado ?? ANIMADO_DEFAULT).segPorLamina * FPS) * b.laminas.length;

export default function CarruselCompositions() {
  return (
    <>
      {BRIEFS.map((b) => (
        <React.Fragment key={b.slug}>
          {b.laminas.map((_, i) => (
            <Composition
              key={i}
              id={`${b.slug}-${i + 1}`}
              component={Lamina1}
              width={ANCHO}
              height={ALTO}
              fps={FPS}
              durationInFrames={1}
              defaultProps={{ brief: b, indice: i }}
            />
          ))}
          <Composition
            id={`${b.slug}-animado`}
            component={CarruselAnimado}
            width={ANCHO}
            height={ALTO}
            fps={FPS}
            durationInFrames={duracionAnimadoF(b)}
            defaultProps={{ brief: b }}
          />
        </React.Fragment>
      ))}
    </>
  );
}
