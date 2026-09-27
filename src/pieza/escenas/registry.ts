import type { ComponentType } from "react";
import Capturas, { type Datos as DatosCapturas, PREVIEW as PREVIEW_CAPTURAS } from "./capturas";
import Chat, { type Datos as DatosChat, PREVIEW as PREVIEW_CHAT } from "./chat";
import Cta, { type Datos as DatosCta, PREVIEW as PREVIEW_CTA } from "./cta";
import Cuenta, { type Datos as DatosCuenta, PREVIEW as PREVIEW_CUENTA } from "./cuenta";
import Frase, { type Datos as DatosFrase, PREVIEW as PREVIEW_FRASE } from "./frase";
import Panel, { type Datos as DatosPanel, PREVIEW as PREVIEW_PANEL } from "./panel";
import Pendientes, { type Datos as DatosPendientes, PREVIEW as PREVIEW_PENDIENTES } from "./pendientes";
import Proceso, { type Datos as DatosProceso, PREVIEW as PREVIEW_PROCESO } from "./proceso";
import type { EscenaPreview, EscenaProps } from "./tipos";

export type DatosPorEscena = {
  pendientes: DatosPendientes;
  proceso: DatosProceso;
  chat: DatosChat;
  panel: DatosPanel;
  cta: DatosCta;
  cuenta: DatosCuenta;
  frase: DatosFrase;
  capturas: DatosCapturas;
};

export type EscenaId = keyof DatosPorEscena;

type Entrada<K extends EscenaId> = {
  Componente: ComponentType<EscenaProps<DatosPorEscena[K]>>;
  preview: EscenaPreview<DatosPorEscena[K]>;
};

export const ESCENAS: { [K in EscenaId]: Entrada<K> } = {
  pendientes: { Componente: Pendientes, preview: PREVIEW_PENDIENTES },
  proceso: { Componente: Proceso, preview: PREVIEW_PROCESO },
  chat: { Componente: Chat, preview: PREVIEW_CHAT },
  panel: { Componente: Panel, preview: PREVIEW_PANEL },
  cta: { Componente: Cta, preview: PREVIEW_CTA },
  cuenta: { Componente: Cuenta, preview: PREVIEW_CUENTA },
  frase: { Componente: Frase, preview: PREVIEW_FRASE },
  capturas: { Componente: Capturas, preview: PREVIEW_CAPTURAS },
};

export const ESCENA_IDS = Object.keys(ESCENAS) as EscenaId[];
