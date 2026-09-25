import { type CalculateMetadataFunction, Composition, Folder, staticFile } from "remotion";
import { FPS } from "../reserva/theme";
import { PREVIEWS_EDITORIAL } from "./editorial/previews";
import EscenaPreviewComp from "./escenas/preview";
import { ESCENA_IDS, ESCENAS } from "./escenas/registry";
import PiezaComposition from "./pieza-composition";
import SubtitulosEstilos from "./previews/subtitulos-estilos";
import type { CaraTrack, PiezaConfig, PiezaProps, RawWord } from "./types";

/** Piezas verticales. Cada slug lee public/piezas/<slug>/{video.mp4, words.json, props.json}. */
const PIEZAS = ["estructura-nexora", "cuenta-juntos", "empieza-a-romperse"] as const;

const WIDTH = 1080;
const HEIGHT = 1920;

const calculateMetadata: CalculateMetadataFunction<PiezaProps> = async ({ props }) => {
  const [config, whisper, cara] = await Promise.all([
    fetch(staticFile(`piezas/${props.slug}/props.json`), { cache: "no-store" }).then((r) => r.json() as Promise<PiezaConfig>),
    fetch(staticFile(`piezas/${props.slug}/words.json`), { cache: "no-store" }).then(
      (r) => r.json() as Promise<{ segments: { words: RawWord[] }[] }>,
    ),
    fetch(staticFile(`piezas/${props.slug}/cara.json`), { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<CaraTrack>) : null))
      .catch(() => null),
  ]);
  return {
    durationInFrames: Math.round(config.durationSeconds * FPS),
    props: { ...props, config, words: whisper.segments.flatMap((s) => s.words), cara },
  };
};

export default function PiezaCompositions() {
  return (
    <Folder name="piezas">
      {PIEZAS.map((slug) => (
        <Composition
          key={slug}
          id={slug}
          component={PiezaComposition}
          defaultProps={{ slug, config: null, words: [] } satisfies PiezaProps}
          calculateMetadata={calculateMetadata}
          durationInFrames={FPS}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
      ))}
      <Composition id="SubtitulosEstilos" component={SubtitulosEstilos} durationInFrames={150} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Folder name="editorial">
        {PREVIEWS_EDITORIAL.map((p) => (
          <Composition key={p.id} id={p.id} component={p.component} durationInFrames={p.durationInFrames} fps={FPS} width={WIDTH} height={HEIGHT} />
        ))}
      </Folder>
      <Folder name="escenas">
        {ESCENA_IDS.map((escena) => (
          <Composition
            key={escena}
            id={`escena-${escena}`}
            component={EscenaPreviewComp}
            defaultProps={{ escena }}
            durationInFrames={ESCENAS[escena].preview.durationInFrames}
            fps={FPS}
            width={WIDTH}
            height={HEIGHT}
          />
        ))}
      </Folder>
    </Folder>
  );
}
