import { useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender } from "remotion";
import { archivo } from "./tema";

let carga: Promise<void> | null = null;

const cargar = () => {
  if (!carga) {
    const caras = [
      new FontFace("BldrsEuropa", `url('${archivo("fonts/EuropaGroteskSH-Reg.otf")}') format('opentype')`, { weight: "400" }),
      new FontFace("BldrsEuropa", `url('${archivo("fonts/EuropaGroteskSH-DemiBold.ttf")}') format('truetype')`, { weight: "600" }),
      new FontFace("BldrsMona", `url('${archivo("fonts/MonaSans-Variable.ttf")}') format('truetype')`, {
        weight: "200 900",
        stretch: "75% 125%",
      }),
    ];
    carga = Promise.all(caras.map((c) => c.load())).then((cargadas) => {
      cargadas.forEach((c) => document.fonts.add(c));
    });
  }
  return carga;
};

export const useFuentes = () => {
  const [handle] = useState(() => delayRender("Fuentes bldrs"));
  useEffect(() => {
    cargar()
      .then(() => continueRender(handle))
      .catch((e) => cancelRender(e));
  }, [handle]);
};
