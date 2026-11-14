import { useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender, staticFile } from "remotion";
import type { Spec } from "./tipos";

/** Carga la familia propia de la marca (`marca.familia` + `marca.fuentes`) antes del primer cuadro. */
export const useFuentesMarca = (spec: Spec | null) => {
  const familia = spec?.marca.familia;
  const fuentes = spec?.marca.fuentes;
  const [handle] = useState(() => (familia && fuentes?.length ? delayRender(`Fuentes de ${familia}`) : null));
  useEffect(() => {
    if (handle === null || !familia || !fuentes) return;
    Promise.all(
      fuentes.map((f) => {
        const ff = new FontFace(familia, `url('${staticFile(f.archivo)}')`, { weight: String(f.peso) });
        return ff.load().then((cargada) => document.fonts.add(cargada));
      }),
    )
      .then(() => continueRender(handle))
      .catch((e) => cancelRender(e));
  }, [handle, familia, fuentes]);
};
