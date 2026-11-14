import type React from "react";
import { Audio, interpolate } from "remotion";
import { Sfx, type NombreSfx } from "./comun";
import { archivo, clamp, DURACION, FPS, MUSICA_INICIO_S, T } from "./tema";

const VOL_MUSICA = 0.62;

export const Musica: React.FC = () => (
  <Audio
    src={archivo("audio/musica-076.mp3")}
    trimBefore={Math.round(MUSICA_INICIO_S * FPS)}
    volume={(f) => VOL_MUSICA * interpolate(f, [0, 2, DURACION - 42, DURACION], [0, 1, 1, 0], clamp)}
  />
);

type Golpe = [NombreSfx, number, number];

const teclas = (desde: number, hasta: number, paso: number, vol = 0.2): Golpe[] => {
  const out: Golpe[] = [];
  for (let f = desde; f <= hasta; f += paso) out.push([out.length % 2 ? "key-b" : "key-soft", f, vol]);
  return out;
};

const servicio = (inicio: number): Golpe[] => [
  ["escena-entra", inicio + 4, 0.35],
  ["tarjeta", inicio + 5, 0.4],
];

const a = (escena: keyof typeof T, local: number) => T[escena][0] + local;

const GOLPES: Golpe[] = [
  ["burbuja", 2, 0.5],
  ["pop-b", 29, 0.35],
  ["burbuja", 42, 0.45],
  ...teclas(44, 66, 3),
  ["burbuja", 86, 0.5],
  ["pop-b", 120, 0.3],
  ["whoosh-short", 121, 0.4],
  ["pop-b", 124, 0.35],
  ["burbuja", 144, 0.55],
  ["remate-b", 144, 0.3],
  ["zoom-punch", 229, 0.45],

  ["remate", a("marca", 0), 0.35],
  ["trazo", a("marca", 2), 0.3],
  ["whoosh-big", a("armado", 8), 0.35],

  ...[2, 14, 26, 38, 50].map((l): Golpe => ["swoosh-tiny", a("armado", l), 0.25]),
  ["whoosh-soft", a("armado", 112), 0.3],
  ["pop-b", a("armado", 118), 0.4],
  ["click", a("armado", 140), 0.5],
  ["check-b", a("armado", 147), 0.45],
  ["burbuja", a("armado", 147), 0.3],

  ["whoosh-short", a("chat2", 2), 0.35],
  ["tap", a("chat2", 13), 0.4],
  ...teclas(a("chat2", 16), a("chat2", 40), 3),
  ["tap", a("chat2", 41), 0.45],
  ["burbuja", a("chat2", 44), 0.5],
  ["pop-b", a("chat2", 62), 0.45],
  ["pop-b", a("chat2", 76), 0.3],
  ["burbuja", a("chat2", 90), 0.45],
  ["pop-b", a("chat2", 106), 0.3],
  ["burbuja", a("chat2", 120), 0.45],
  ["burbuja", a("chat2", 146), 0.45],
  ["pop-b", a("chat2", 160), 0.35],
  ["zoom-punch", a("chat2", 186), 0.45],

  ["trazo", a("logo", 2), 0.35],
  ["trazo", a("logo", 12), 0.3],
  ["trazo", a("logo", 24), 0.3],
  ["trazo", a("logo", 36), 0.25],
  ["remate", a("logo", 46), 0.55],
  ["whoosh-soft", a("logo", 66), 0.3],

  ["swoosh-tiny", a("saleMal", 0), 0.3],
  ["swoosh-tiny", a("saleMal", 6), 0.25],
  ["remate-b", a("saleMal", 27), 0.35],
  ["swoosh-tiny", a("dolor1", 0), 0.25],
  ["tachado", a("dolor1", 24), 0.5],
  ["swoosh-tiny", a("dolor2", 0), 0.25],
  ["tachado", a("dolor2", 24), 0.5],
  ["swoosh-tiny", a("dolor3", 0), 0.25],
  ["tachado", a("dolor3", 24), 0.5],
  ["whoosh-soft", a("reves", 2), 0.35],
  ["whoosh-short", a("reves", 17), 0.3],
  ["swoosh-tiny", a("funciona", 0), 0.25],
  ["trazo", a("funciona", 12), 0.35],
  ...teclas(a("funciona", 14), a("funciona", 30), 3, 0.18),

  ...servicio(T.apps[0]),
  ...servicio(T.webs[0]),
  ...servicio(T.sistemas[0]),
  ...servicio(T.agentes[0]),

  ["tarjeta-b", a("tablero", 2), 0.35],
  ["click", a("tablero", 22), 0.4],
  ["tarjeta", a("tablero", 36), 0.4],
  ["click", a("tablero", 38), 0.4],
  ["tarjeta", a("tablero", 54), 0.4],
  ["click", a("tablero", 62), 0.4],
  ["tarjeta", a("tablero", 78), 0.4],
  ["check-b", a("tablero", 80), 0.5],

  ...teclas(a("rompimos", 2), a("rompimos", 14), 2),
  ["tap", a("rompimos", 17), 0.45],
  ["burbuja", a("rompimos", 18), 0.55],
  ["pop-b", a("rompimos", 20), 0.3],
  ["check-b", a("rompimos", 34), 0.5],
  ["remate-b", a("rompimos", 34), 0.35],

  ["swoosh-tiny", a("seleccion", 0), 0.25],
  ["tap", a("seleccion", 16), 0.35],
  ["tap", a("seleccion", 30), 0.35],
  ["tap", a("seleccion", 46), 0.4],

  ["swoosh-tiny", a("garantia", 0), 0.3],
  ["remate", a("garantia", 15), 0.55],

  ["cta-cierre", a("cierre", 2), 0.5],
];

/** Los efectos cortos y agudos se pierden contra una música llena: van más arriba (medido en la banda de celular). */
const REFUERZO: Partial<Record<NombreSfx, number>> = {
  "pop-b": 1.45,
  burbuja: 1.25,
  tachado: 1.5,
  "key-soft": 1.4,
  "key-b": 1.4,
  "swoosh-tiny": 1.4,
  tap: 1.3,
  trazo: 1.3,
  tarjeta: 1.2,
};

export const Efectos: React.FC = () => (
  <>
    {GOLPES.map(([nombre, en, volumen], i) => (
      <Sfx key={i} nombre={nombre} en={en} volumen={Math.min(1, volumen * (REFUERZO[nombre] ?? 1))} />
    ))}
  </>
);
