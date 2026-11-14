import { useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender, staticFile } from "remotion";

export const uk = (ruta: string) => staticFile(`ui-kit/${ruta}`);

const GOOGLE = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=block";

let carga: Promise<unknown> | null = null;

const cargar = () => {
  if (!carga) {
    const caras = [
      ...[500, 600, 700, 900].map((w) => new FontFace("PmSF", `url('${uk(`fonts/SFProDisplay-${w}.woff2`)}') format('woff2')`, { weight: String(w) })),
      new FontFace("FhDM", `url('${uk("fonts/DMSans-Medium.ttf")}')`, { weight: "500" }),
      new FontFace("FhDM", `url('${uk("fonts/DMSans-SemiBold.ttf")}')`, { weight: "600" }),
      new FontFace("FhDM", `url('${uk("fonts/DMSans-Bold.ttf")}')`, { weight: "700" }),
      new FontFace("FhSG", `url('${uk("fonts/SpaceGrotesk-Bold.ttf")}')`, { weight: "700" }),
      new FontFace("BldrsEuropa", `url('${staticFile("bldrs-estudio-motion/fonts/EuropaGroteskSH-DemiBold.ttf")}')`, { weight: "600" }),
      new FontFace("BldrsMona", `url('${staticFile("bldrs-estudio-motion/fonts/MonaSans-Variable.ttf")}')`, { weight: "200 900", stretch: "75% 125%" }),
    ];
    if (!document.querySelector(`link[href="${GOOGLE}"]`)) {
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = GOOGLE;
      document.head.appendChild(l);
    }
    carga = Promise.all([
      Promise.all(caras.map((c) => c.load())).then((cs) => cs.forEach((c) => document.fonts.add(c))),
      Promise.all(["800 60px Manrope", "500 30px Inter", "700 30px Inter"].map((m) => document.fonts.load(m))),
    ]);
  }
  return carga;
};

export const useFuentesKit = () => {
  const [h] = useState(() => delayRender("Fuentes UI kit"));
  useEffect(() => {
    cargar()
      .then(() => continueRender(h))
      .catch((e) => cancelRender(e));
  }, [h]);
};
