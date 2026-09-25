import type { ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { ease } from "../../reserva/motion";
import { ACENTO, CURVA, PALABRA } from "./tema";

type CajaSeleccionProps = {
  /** Frame local en que aparece la caja, ya a `escalaInicial` (en la referencia, +7 fr después de la palabra anterior). */
  at: number;
  color?: string;
  escalaInicial?: number;
  /** Hasta la escala 1 (96 % a los 9 fr con 14). */
  duracion?: number;
  /**
   * Aire entre la palabra y el trazo, en em para que acompañe al cuerpo del texto: 0,12em ≈ 28 px a los lados en un
   * 'voice' de 240 px (f-019). Arriba y abajo no hace falta: la caja de línea ya deja más aire que la referencia.
   */
  relleno?: string;
  /** Un string se revela letra por letra; cualquier otro nodo, entero. */
  children: ReactNode;
};

/** A 1080, medido en fr37 (px de tarjeta × 2,31). Crecen con la caja, como en la referencia: fr25 mide el 62 % de fr37. */
const TIRADOR = 30;
const TRAZO = 4;
const GUIONES = "12 9";
const ESQUINAS = [
  [0, 0],
  [1, 0],
  [0, 1],
  [1, 1],
] as const;

/** Letras de izquierda a derecha: 'v' fr23, 'o' ~25, 'i' ~27, 'ce' ~29; cada una tarda ~6 fr en enfocarse. */
const LETRA = { escalon: 2, opacidad: 5, blur: 6 } as const;
/** El componente no conoce el cuerpo de la letra: el blur va en em (≈14 px en un remate de 240 px). */
const BLUR_EM = 0.06;

/**
 * T3, caja de selección (f-013 → f-019): la caja crece anclada arriba a la izquierda y hace de máscara; la palabra ya
 * está en su tamaño final y solo se ve dentro. Sin sonido: las palabras entran en silencio.
 */
export default function CajaSeleccion({
  at,
  color = ACENTO.relleno,
  escalaInicial = 0.35,
  duracion = 14,
  relleno = "0 0.12em",
  children,
}: CajaSeleccionProps) {
  const frame = useCurrentFrame();
  // Out-cubic es la curva que mejor ajusta el ancho medido fr23 → 37 (error ≤ 0,04); el out-expo llega demasiado rápido.
  const s = ease(frame, [at, at + duracion], [escalaInicial, 1], CURVA);
  const recorte = (1 - s) * 100;

  let contenido: ReactNode;
  if (typeof children === "string") {
    const letras = Array.from(children);
    // Palabras largas: el barrido se comprime para terminar junto con la caja, como 'voice' en la referencia.
    const escalon = letras.length > 1 ? Math.max(0, Math.min(LETRA.escalon, (duracion - LETRA.blur) / (letras.length - 1))) : 0;
    contenido = letras.map((letra, i) => {
      const t0 = at + i * escalon;
      const blur = ease(frame, [t0, t0 + LETRA.blur], [BLUR_EM, 0], CURVA);
      return (
        <span key={i} style={{ opacity: ease(frame, [t0, t0 + LETRA.opacidad], [0, 1], CURVA), filter: blur > 0.002 ? `blur(${blur}em)` : undefined }}>
          {letra}
        </span>
      );
    });
  } else {
    const blur = ease(frame, [at, at + duracion], [PALABRA.blurPx, 0], CURVA);
    contenido = (
      <span style={{ display: "inline-block", opacity: ease(frame, [at, at + LETRA.opacidad], [0, 1], CURVA), filter: blur > 0.1 ? `blur(${blur}px)` : undefined }}>
        {children}
      </span>
    );
  }

  return (
    <span style={{ position: "relative", display: "inline-block", visibility: frame < at ? "hidden" : undefined }}>
      <span
        style={{
          display: "block",
          padding: relleno,
          whiteSpace: "nowrap",
          clipPath: s < 1 ? `inset(0 ${recorte}% ${recorte}% 0)` : undefined,
        }}
      >
        {contenido}
      </span>
      <span style={{ position: "absolute", inset: 0, transform: `scale(${s})`, transformOrigin: "0 0" }}>
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <rect x={0} y={0} width="100%" height="100%" fill="none" stroke={color} strokeWidth={TRAZO} strokeDasharray={GUIONES} />
        </svg>
        {ESQUINAS.map(([x, y]) => (
          <span
            key={`${x}-${y}`}
            style={{
              position: "absolute",
              left: `${x * 100}%`,
              top: `${y * 100}%`,
              width: TIRADOR,
              height: TIRADOR,
              marginLeft: -TIRADOR / 2,
              marginTop: -TIRADOR / 2,
              background: color,
            }}
          />
        ))}
      </span>
    </span>
  );
}
