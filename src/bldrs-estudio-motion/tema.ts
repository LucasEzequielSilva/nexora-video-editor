import { Easing, interpolate, staticFile } from "remotion";

export const FPS = 30;
export const ANCHO = 1920;
export const ALTO = 1080;

export const FONDO = "#0C0C0E";
export const TINTA = "#F5F5F7";
export const ARCOIRIS = ["#ff5f6d", "#ffc371", "#4ade80", "#38bdf8", "#a78bfa", "#f472b6"] as const;
export const CORAL = ARCOIRIS[0];
export const AMBAR = ARCOIRIS[1];
export const VERDE = ARCOIRIS[2];
export const CELESTE = ARCOIRIS[3];
export const VIOLETA = ARCOIRIS[4];
export const ROSA = ARCOIRIS[5];

export const conico = (angulo: number) =>
  `conic-gradient(from ${angulo}deg, ${ARCOIRIS.join(", ")}, ${ARCOIRIS[0]})`;
export const lineal = (angulo = 90) => `linear-gradient(${angulo}deg, ${ARCOIRIS.join(", ")})`;

export const F_GRANDE = "'BldrsEuropa', 'BldrsMona', sans-serif";
export const F_TEXTO = "'BldrsMona', sans-serif";

export const archivo = (ruta: string) => staticFile(`bldrs-estudio-motion/${ruta}`);

/** Tiempos de golpe de la música (DivKid - Parisian Funk desde 22.616 s, 124 BPM), en cuadros de la pieza. */
export const BEATS = [
  0, 15, 29, 44, 58, 72, 86, 101, 116, 130, 144, 159, 173, 187, 201, 216, 231, 245, 259, 274, 288, 303, 317, 332, 346,
  360, 374, 389, 403, 418, 432, 447, 460, 475, 490, 504, 519, 534, 548, 562, 577, 591, 605, 619, 634, 649, 664, 679, 695,
  711, 727, 742, 757, 771, 785, 800, 814, 828, 843, 858, 871, 886, 901, 915, 929, 944, 959, 972, 987, 1001, 1016, 1030,
  1044, 1059, 1073, 1088, 1102, 1117, 1131, 1145, 1160, 1174, 1188, 1203, 1217, 1232, 1246, 1261, 1275, 1289, 1304,
  1319, 1333, 1347, 1361, 1376, 1390, 1404, 1419, 1434, 1448, 1462, 1477, 1491, 1505, 1520, 1535, 1549, 1563, 1577,
  1592, 1606, 1621, 1636, 1650, 1665, 1680, 1694, 1709, 1723, 1738, 1753, 1767, 1782,
];
export const MUSICA_INICIO_S = 22.616;

/** Escenas: [desde, hasta) en cuadros. Los cortes caen en golpes de la música. */
export const T = {
  chat1: [0, 231],
  marca: [231, 288],
  armado: [288, 460],
  chat2: [460, 649],
  logo: [649, 757],
  saleMal: [757, 814],
  dolor1: [814, 871],
  dolor2: [871, 929],
  dolor3: [929, 987],
  reves: [987, 1044],
  funciona: [1044, 1102],
  apps: [1102, 1174],
  webs: [1174, 1246],
  sistemas: [1246, 1319],
  agentes: [1319, 1390],
  tablero: [1390, 1491],
  rompimos: [1491, 1549],
  seleccion: [1549, 1621],
  garantia: [1621, 1694],
  cierre: [1694, 1785],
} as const satisfies Record<string, readonly [number, number]>;

export const DURACION = T.cierre[1];

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const suave = Easing.bezier(0.45, 0, 0.2, 1);
export const salida = Easing.bezier(0.16, 1, 0.3, 1);

/** Interpola por tramos con easing y sin pasarse de los extremos. */
export const tramos = (f: number, cuadros: number[], valores: number[], easing = suave) =>
  interpolate(f, cuadros, valores, { ...clamp, easing });

export type Punto = { f: number; x: number; y: number };

/** Posición sobre una lista de puntos clave, con easing entre cada par. */
export const recorrido = (f: number, puntos: Punto[], easing = suave) => {
  if (f <= puntos[0].f) return { x: puntos[0].x, y: puntos[0].y };
  for (let i = 0; i < puntos.length - 1; i++) {
    const a = puntos[i];
    const b = puntos[i + 1];
    if (f <= b.f) {
      const p = easing((f - a.f) / Math.max(1, b.f - a.f));
      return { x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p };
    }
  }
  const u = puntos[puntos.length - 1];
  return { x: u.x, y: u.y };
};
