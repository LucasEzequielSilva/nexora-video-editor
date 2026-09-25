import { useMemo } from "react";
import { Audio, interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import { FPS } from "../reserva/theme";
import { msToFrame, resolverMs } from "./anclas";
import type { MusicaConfig, RawWord } from "./types";

/** Margen alrededor de cada palabra: baja un toque antes de que hable y espera un poco antes de subir. */
const ANTES_S = 0.08;
const DESPUES_S = 0.15;
/** Cuadros para bajar (rápido, que no tape la primera sílaba) y para volver a subir (lento, que no bombee). */
const BAJA_CUADROS = 3;
const SUBE_CUADROS = 10;

/** Ganancia por cuadro de la pieza: `bajoVoz` mientras hay palabras, 1 en las pausas, con subidas y bajadas suaves. */
const gananciaDucking = (words: RawWord[], total: number, bajoVoz: number) => {
  const habla = new Uint8Array(total);
  for (const w of words) {
    const a = Math.max(0, Math.floor((w.start - ANTES_S) * FPS));
    const b = Math.min(total - 1, Math.ceil((w.end + DESPUES_S) * FPS));
    for (let f = a; f <= b; f++) habla[f] = 1;
  }
  const g = new Float32Array(total);
  let actual = 1;
  for (let f = 0; f < total; f++) {
    const objetivo = habla[f] ? bajoVoz : 1;
    const paso = (1 - bajoVoz) / (objetivo < actual ? BAJA_CUADROS : SUBE_CUADROS);
    actual = objetivo < actual ? Math.max(objetivo, actual - paso) : Math.min(objetivo, actual + paso);
    g[f] = actual;
  }
  return g;
};

export default function Musica({ musica, words }: { musica: MusicaConfig; words: RawWord[] }) {
  const { durationInFrames } = useVideoConfig();
  const ducking = useMemo(() => gananciaDucking(words, durationInFrames, musica.bajoVoz ?? 0.4), [words, durationInFrames, musica.bajoVoz]);
  const ms = resolverMs(musica.desde, words);
  if (ms === null) return null;
  const desde = msToFrame(ms);
  const dur = durationInFrames - desde;
  const fadeIn = msToFrame(musica.fadeInMs ?? 150);
  const fadeOut = msToFrame(musica.fadeOutMs ?? 1200);
  const volumen = musica.volumen ?? 0.35;
  // Acá sí va trimBefore: la pista es larga, su onda en la línea de tiempo nunca mide 0 px (el problema de Studio era
  // con SFX de pocos cuadros, ver sfx.tsx). Arrancar la Sequence en un cuadro negativo NO sirve para la música: el
  // `f` del volumen cuenta desde que el audio empieza a sonar en la pieza, y quedaba muda ~8 s de más (medido).
  return (
    <Sequence from={desde} durationInFrames={dur} name="musica">
      <Audio
        src={staticFile(musica.archivo)}
        trimBefore={Math.round((musica.inicioS ?? 0) * FPS)}
        // Studio también pide el volumen en cuadros negativos (f = -trimBefore): el índice va acotado o sale NaN.
        volume={(f) =>
          volumen *
          ducking[Math.max(0, Math.min(durationInFrames - 1, desde + f))] *
          interpolate(f, [0, Math.max(1, fadeIn), dur - fadeOut, dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
        }
      />
    </Sequence>
  );
}
