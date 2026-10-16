import { type CalculateMetadataFunction, Composition, Folder, staticFile } from "remotion";
import { FPS } from "../reserva/theme";
import SpecComposition from "./spec-composition";
import type { Spec, SpecProps } from "./tipos";

/**
 * Spec ads. Cada slug lee public/spec/<slug>/spec.json y sale en dos composiciones: `spec-<slug>` (16:9, master) y
 * `spec-<slug>-9x16`. Capas sueltas para DaVinci: `--props='{"capa":"stage"}'` (o content / bloom), ver
 * formatos/spec-ad/README.md §5.
 */
const SPECS = ["demo-agente-turnos"] as const;

const calculateMetadata: CalculateMetadataFunction<SpecProps> = async ({ props }) => {
  const spec = (await fetch(staticFile(`spec/${props.slug}/spec.json`), { cache: "no-store" }).then((r) => r.json())) as Spec;
  return { durationInFrames: Math.round(spec.duracionS * FPS), props: { ...props, spec } };
};

export default function SpecCompositions() {
  return (
    <Folder name="spec-ads">
      {SPECS.flatMap((slug) =>
        [
          { id: `spec-${slug}`, width: 1920, height: 1080 },
          { id: `spec-${slug}-9x16`, width: 1080, height: 1920 },
        ].map((c) => (
          <Composition
            key={c.id}
            id={c.id}
            component={SpecComposition}
            defaultProps={{ slug, spec: null, capa: "todo" } satisfies SpecProps}
            calculateMetadata={calculateMetadata}
            durationInFrames={FPS}
            fps={FPS}
            width={c.width}
            height={c.height}
          />
        )),
      )}
    </Folder>
  );
}
