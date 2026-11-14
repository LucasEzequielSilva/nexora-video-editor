import { AbsoluteFill, useCurrentFrame } from "remotion";
import Sfx from "../../reserva/components/sfx";
import { ease, lerp, springAt } from "../../reserva/motion";
import { SPRING } from "../../reserva/theme";
import { ajustar, anchoCentrado, conCaja, estiloTipo, FINA, type FuenteFina, PESADA, type PresetNeon, SOMBRA_TEXTO, useAnchos } from "./tema";
import TextoNeon from "./texto-neon";
import { entrada } from "./titular";

export type CifraProps = {
  /** La cifra tal como se dice ("+34.000", "300"). */
  valor: string;
  /** Palabra fina arriba de la cifra ("casi"). */
  arriba?: string;
  /** Etiqueta chica abajo. */
  etiqueta?: string;
  /** "plata" (verde) para plata; el resto, el color de la pieza. Default naranja. */
  preset?: PresetNeon;
  fuenteFina?: FuenteFina;
  /** Centro vertical en % del alto. Default 57: sobre el pecho, debajo de la cara. */
  centroY?: number;
  duracion: number;
  gananciaSfx?: number;
};

const MAX = { valor: 300, arriba: 64, serif: 80, etiqueta: 46 } as const;
/** El glow de la cifra es más fuerte que el del titular (gramática #5: "cifra gigante con glow fuerte"). */
const FUERZA = 1.35;
const ENTRA_ETIQUETA = 8;
const SALE = 8;

/**
 * Cifra grande (gramática #4 y #5 de la referencia): el número gigante en Tactic Sans Black con degradé y glow, entra con
 * pop de escala; arriba una palabra fina opcional y abajo una etiqueta chica. Por default tapa los subtítulos.
 */
export default function Cifra({ valor, arriba, etiqueta, preset = "naranja", fuenteFina = "light", centroY = 57, duracion, gananciaSfx = 1 }: CifraProps) {
  const frame = useCurrentFrame();
  const tipoFina = FINA[fuenteFina];
  const anchos = useAnchos([
    { texto: valor, tipo: PESADA },
    { texto: arriba ?? "", tipo: tipoFina },
    { texto: etiqueta ?? "", tipo: FINA.light },
  ]);
  if (!anchos) return null;

  const anchoMax = anchoCentrado((centroY / 100) * 1920 + 230);
  const tamValor = ajustar(anchos[0], anchoMax, MAX.valor);
  const tamArriba = ajustar(anchos[1], anchoMax, fuenteFina === "serif" ? MAX.serif : MAX.arriba);
  const tamEtiqueta = ajustar(anchos[2], anchoMax, MAX.etiqueta);

  const pop = springAt(frame, 0, SPRING.pop);
  const sale = ease(frame, [duracion - SALE, duracion], [1, 0]);
  const enciende = ease(frame, [2, 14]) * (1 + Math.sin(frame / 16) * 0.05);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: sale, filter: sale < 0.999 ? `blur(${(1 - sale) * 10}px)` : undefined }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: `${centroY}%`,
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {arriba && (
          <div style={{ ...estiloTipo(tipoFina, tamArriba), color: "#ffffff", textShadow: SOMBRA_TEXTO, marginBottom: tamValor * 0.06, ...entrada(frame, 0, 8, 16, 0.04) }}>
            {conCaja(tipoFina, arriba)}
          </div>
        )}
        <TextoNeon
          texto={valor}
          tamano={tamValor}
          preset={preset}
          fuerza={FUERZA}
          encendido={enciende}
          style={{
            opacity: Math.min(1, pop * 2),
            transform: `scale(${lerp(0.35, 1, pop)})`,
            filter: pop < 0.9 ? `blur(${(1 - pop) * 10}px)` : undefined,
          }}
        />
        {etiqueta && (
          <div
            style={{
              ...estiloTipo(FINA.light, tamEtiqueta),
              color: "#ffffff",
              textShadow: SOMBRA_TEXTO,
              marginTop: tamValor * 0.08,
              ...entrada(frame, ENTRA_ETIQUETA, 9, -14, 0.04),
            }}
          >
            {conCaja(FINA.light, etiqueta)}
          </div>
        )}
      </div>
      <Sfx name="pop" at={1} volume={0.2 * gananciaSfx} />
    </AbsoluteFill>
  );
}
