import type React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Armado } from "./escenas/armado";
import { Chat1 } from "./escenas/chat1";
import { Chat2 } from "./escenas/chat2";
import { Dolor, Funciona, Reves, SaleMal } from "./escenas/cinetica";
import { Cierre, Garantia, Rompimos, Seleccion } from "./escenas/final";
import { Logo } from "./escenas/logo";
import { Marca } from "./escenas/marca";
import { Agentes, Apps, Sistemas, Webs } from "./escenas/servicios";
import { Tablero } from "./escenas/tablero";
import { useFuentes } from "./fuentes";
import { Efectos, Musica } from "./sonido";
import { FONDO, T } from "./tema";

const ESCENAS: [keyof typeof T, React.ReactNode][] = [
  ["chat1", <Chat1 />],
  ["marca", <Marca />],
  ["armado", <Armado />],
  ["chat2", <Chat2 />],
  ["logo", <Logo />],
  ["saleMal", <SaleMal />],
  ["dolor1", <Dolor texto="Tarda meses en arrancar" />],
  ["dolor2", <Dolor texto="Te venden una web disfrazada" />],
  ["dolor3", <Dolor texto="El presupuesto se mueve solo" />],
  ["reves", <Reves />],
  ["funciona", <Funciona />],
  ["apps", <Apps />],
  ["webs", <Webs />],
  ["sistemas", <Sistemas />],
  ["agentes", <Agentes />],
  ["tablero", <Tablero />],
  ["rompimos", <Rompimos />],
  ["seleccion", <Seleccion />],
  ["garantia", <Garantia />],
  ["cierre", <Cierre />],
];

export const BldrsEstudioMotion: React.FC = () => {
  useFuentes();
  return (
    <AbsoluteFill style={{ background: FONDO }}>
      {ESCENAS.map(([id, nodo]) => (
        <Sequence key={id} name={id} from={T[id][0]} durationInFrames={T[id][1] - T[id][0]}>
          {nodo}
        </Sequence>
      ))}
      <Musica />
      <Efectos />
    </AbsoluteFill>
  );
};
