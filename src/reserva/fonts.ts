import { useEffect } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

type FontSpec = { family: string; file: string; weight: string; style: "normal" | "italic" };

const FONTS: FontSpec[] = [
  { family: "Satoshi", file: "reserva/fonts/Satoshi-400.woff2", weight: "400", style: "normal" },
  { family: "Satoshi", file: "reserva/fonts/Satoshi-500.woff2", weight: "500", style: "normal" },
  { family: "Satoshi", file: "reserva/fonts/Satoshi-700.woff2", weight: "700", style: "normal" },
  { family: "Satoshi", file: "reserva/fonts/Satoshi-900.woff2", weight: "900", style: "normal" },
  { family: "Instrument Serif", file: "reserva/fonts/InstrumentSerif-normal.woff2", weight: "400", style: "normal" },
  { family: "Instrument Serif", file: "reserva/fonts/InstrumentSerif-italic.woff2", weight: "400", style: "italic" },
  { family: "Europa Grotesk SH", file: "reserva/fonts/EuropaGroteskSH-DemiBold.ttf", weight: "700", style: "normal" },
  { family: "Helvetica Neue", file: "reserva/fonts/HelveticaNeue-Bold.otf", weight: "700", style: "normal" },
  { family: "Helvetica Neue", file: "reserva/fonts/HelveticaNeue-Heavy.otf", weight: "800", style: "normal" },
  { family: "Helvetica Neue", file: "reserva/fonts/HelveticaNeue-Black.otf", weight: "900", style: "normal" },
  { family: "Tactic Sans", file: "reserva/fonts/TacticSans-Bold.otf", weight: "700", style: "normal" },
  { family: "Tactic Sans", file: "reserva/fonts/TacticSans-Black.otf", weight: "900", style: "normal" },
  { family: "Bebas Neue", file: "reserva/fonts/BebasNeue-Regular.ttf", weight: "400", style: "normal" },
];

const FORMAT_BY_EXTENSION: Record<string, string> = {
  woff2: "woff2",
  woff: "woff",
  ttf: "truetype",
  otf: "opentype",
};

const formatFor = (file: string): string => {
  const ext = file.split(".").pop()?.toLowerCase() ?? "";
  return FORMAT_BY_EXTENSION[ext] ?? ext;
};

const fontFaceCSS = FONTS.map(
  (spec) => `
@font-face {
  font-family: '${spec.family}';
  src: url('${staticFile(spec.file)}') format('${formatFor(spec.file)}');
  font-weight: ${spec.weight};
  font-style: ${spec.style};
  font-display: block;
}`,
).join("\n");

let fontsLoaded = false;

/**
 * Registra las fuentes vía CSS @font-face (mismo patrón que las composiciones existentes del
 * proyecto, ver Composition.tsx) y fuerza su descarga con document.fonts.load(). Debe llamarse
 * dentro de un componente React (usa useEffect); llamarlo a nivel de módulo deja delayRender()
 * fuera del ciclo de vida que Remotion espera y puede colgar el render.
 */
export const useReservaFonts = () => {
  useEffect(() => {
    if (typeof document === "undefined" || fontsLoaded) return;
    const handle = delayRender("Cargando fuentes de Reserva");

    const style = document.createElement("style");
    style.id = "reserva-font-face";
    style.innerHTML = fontFaceCSS;
    document.head.appendChild(style);

    const resolve = () => {
      fontsLoaded = true;
      continueRender(handle);
    };

    const fontsApi = document.fonts;
    if (fontsApi && typeof fontsApi.ready === "object") {
      Promise.all(FONTS.map((spec) => fontsApi.load(`${spec.weight} 48px '${spec.family}'`)))
        .then(resolve)
        .catch(resolve);
    } else {
      setTimeout(resolve, 500);
    }
  }, []);
};
