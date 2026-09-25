import type { CaraTrack } from "./types";

/** Inercia de la posición: promedio centrado de ±N cuadros. Chico: la cámara sigue de cerca y queda el temblor natural. */
const SUAVIZADO_POSICION = 5;
/** El ancho de la cara que mide YuNet tiembla ±3 %: se suaviza más para que el zoom no respire. */
const SUAVIZADO_ANCHO = 15;

export type Punto = { x: number; y: number };
export type CaraCuadro = Punto & { ancho: number };
export type CaraSuave = { cuadros: (CaraCuadro | null)[]; cortes: number[] };

/** Cuadro donde empieza el plano de `frame` (0 si no hubo corte antes). */
export const inicioDePlano = (cortes: number[], frame: number) => {
  let inicio = 0;
  for (const c of cortes) {
    if (c > frame) break;
    inicio = c;
  }
  return inicio;
};

/** Ojos y ancho de cara por cuadro (px de 1080x1920), suavizados sin cruzar cortes: cada plano es una toma distinta. */
export const suavizarCara = (cara: CaraTrack): CaraSuave => {
  const cortes = cara.cortes ?? [];
  const n = cara.cuadros.length;
  const promedio = (i: number, radio: number, campo: 0 | 1 | 2) => {
    const desde = Math.max(inicioDePlano(cortes, i), i - radio);
    const siguiente = cortes.find((c) => c > i) ?? n;
    const hasta = Math.min(siguiente - 1, i + radio);
    let suma = 0;
    let cuenta = 0;
    for (let k = desde; k <= hasta; k++) {
      const q = cara.cuadros[k];
      if (q) {
        suma += q[campo];
        cuenta++;
      }
    }
    return cuenta ? suma / cuenta : null;
  };
  const suaves = cara.cuadros.map((p, i): CaraCuadro | null => {
    if (!p) return null;
    const x = promedio(i, SUAVIZADO_POSICION, 0);
    const y = promedio(i, SUAVIZADO_POSICION, 1);
    const ancho = promedio(i, SUAVIZADO_ANCHO, 2);
    return x === null || y === null || ancho === null ? null : { x, y, ancho };
  });
  return { cortes, cuadros: rellenarHuecos(suaves, cortes) };
};

/**
 * Cuadros sin cara dentro de un plano (cabeza de perfil, un brazo delante, cámara en mano que panea): se interpola entre
 * la cara anterior y la siguiente del mismo plano, o se sostiene la más cercana. Sin esto la cámara volvía al encuadre
 * del centro y mostraba la pared (cuenta-juntos, primer cuadro después del negro y el final del CTA).
 */
const rellenarHuecos = (cuadros: (CaraCuadro | null)[], cortes: number[]): (CaraCuadro | null)[] =>
  sostenerSinCara(rellenarEnPlano(cuadros, cortes));

/**
 * Planos enteros sin cara (el negro después del hook): se sostiene la última cara (o la primera que viene). Studio
 * puede mostrar un cuadro de imagen donde cara.py ya ve negro; sin cara ese cuadro caía al encuadre del centro con el
 * zoom del retrato y mostraba la pared (cuenta-juntos, cuadro 71: "sigue haciendo brusco").
 */
const sostenerSinCara = (cuadros: (CaraCuadro | null)[]): (CaraCuadro | null)[] => {
  const primera = cuadros.find((c) => c !== null) ?? null;
  let ultima: CaraCuadro | null = null;
  return cuadros.map((c) => {
    if (c) ultima = c;
    return c ?? ultima ?? primera;
  });
};

const rellenarEnPlano = (cuadros: (CaraCuadro | null)[], cortes: number[]): (CaraCuadro | null)[] =>
  cuadros.map((c, i) => {
    if (c) return c;
    const inicio = inicioDePlano(cortes, i);
    const fin = (cortes.find((k) => k > i) ?? cuadros.length) - 1;
    let a = i - 1;
    while (a >= inicio && !cuadros[a]) a--;
    let b = i + 1;
    while (b <= fin && !cuadros[b]) b++;
    const antes = a >= inicio ? cuadros[a] : null;
    const despues = b <= fin ? cuadros[b] : null;
    if (antes && despues) {
      const t = (i - a) / (b - a);
      return { x: antes.x + (despues.x - antes.x) * t, y: antes.y + (despues.y - antes.y) * t, ancho: antes.ancho + (despues.ancho - antes.ancho) * t };
    }
    return antes ?? despues;
  });

export const caraEn = (track: (CaraCuadro | null)[], frame: number): CaraCuadro | null => track[Math.min(frame, track.length - 1)] ?? null;
