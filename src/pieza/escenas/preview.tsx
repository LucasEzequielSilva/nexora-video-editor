import { AbsoluteFill } from "remotion";
import { useReservaFonts } from "../../reserva/fonts";
import { ContenidoEscena, MarcoEscena, Recorte, SonidoEscena } from "./marco";
import { ESCENAS, type EscenaId } from "./registry";

/** Cuadro de estructura-nexora desde el que se toma el recorte del que habla en los previews. */
const RECORTE_PREVIEW_FRAME = 750;

/** Preview aislado de una escena (fondo + contenido + recorte del que habla) con los datos y cues de ejemplo de su PREVIEW. */
export default function EscenaPreviewComp({ escena }: { escena: EscenaId }) {
  useReservaFonts();
  const { preview } = ESCENAS[escena];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <MarcoEscena durationInFrames={preview.durationInFrames} desdeFrame={0} tema={preview.tema}>
        <ContenidoEscena escena={escena} durationInFrames={preview.durationInFrames} cues={preview.cues} datos={preview.datos} />
        {!preview.sinRecorte && (
          <Recorte
            videoSrc="piezas/estructura-nexora/persona.webm"
            desdeFrame={RECORTE_PREVIEW_FRAME}
            durationInFrames={preview.durationInFrames}
            posicion="abajo-izquierda"
          />
        )}
      </MarcoEscena>
      <SonidoEscena durationInFrames={preview.durationInFrames} llegaAlFinal={false} />
    </AbsoluteFill>
  );
}
