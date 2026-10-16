import type { ComponentType } from "react";
import type { Escena, TipoEscena } from "../tipos";
import Apertura from "./apertura";
import Cierre from "./cierre";
import Dispositivo from "./dispositivo";
import Frase from "./frase";
import Plate from "./plate";
import Tarjetas from "./tarjetas";

/** Escena nueva = archivo nuevo + tipo en `tipos.ts` + registrarla acá. */
// biome-ignore lint/suspicious/noExplicitAny: cada componente recibe su variante de Escena.
export const ESCENAS_SPEC: Record<TipoEscena, ComponentType<{ escena: any }>> = {
  apertura: Apertura,
  dispositivo: Dispositivo,
  tarjetas: Tarjetas,
  frase: Frase,
  plate: Plate,
  cierre: Cierre,
};

export const componenteDe = (e: Escena) => ESCENAS_SPEC[e.tipo];
