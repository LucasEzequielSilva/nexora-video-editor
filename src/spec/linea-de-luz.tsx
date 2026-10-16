import { useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { alfa, useLayout, useSpec } from "./tema";
import type { Punto, TramoLinea } from "./tipos";

/**
 * El motivo: una línea de luz con el color de marca que viaja por todas las escenas y cierra la pieza (el recurso de la
 * "sonrisa" del spec ad de Amazon: aparece, se vuelve la ruta del envío, subraya el tagline y se apaga en el logo).
 * Cada escena dibuja sus tramos; la cabeza lleva un punto brillante.
 */

const MUESTRAS = 160;

/** Catmull-Rom centrípeta muestreada en px: devuelve la polilínea y el largo acumulado. */
const muestrear = (pts: [number, number][]) => {
  if (pts.length === 1) return { pts: [pts[0], pts[0]], acum: [0, 0], largo: 0 };
  const ext = [pts[0], ...pts, pts[pts.length - 1]];
  const out: [number, number][] = [];
  for (let s = 1; s < ext.length - 2; s++) {
    const [p0, p1, p2, p3] = [ext[s - 1], ext[s], ext[s + 1], ext[s + 2]];
    const n = Math.ceil(MUESTRAS / (pts.length - 1));
    for (let k = 0; k < n; k++) {
      const t = k / n;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(pts[pts.length - 1]);
  const acum = [0];
  for (let i = 1; i < out.length; i++) acum.push(acum[i - 1] + Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]));
  return { pts: out, acum, largo: acum[acum.length - 1] };
};

const puntoEn = (m: ReturnType<typeof muestrear>, d: number): [number, number] => {
  const i = Math.max(1, m.acum.findIndex((a) => a >= d));
  const [a, b] = [m.acum[i - 1], m.acum[i] ?? m.largo];
  const t = b > a ? (d - a) / (b - a) : 0;
  const [p, q] = [m.pts[i - 1], m.pts[i] ?? m.pts[i - 1]];
  return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
};

const Tramo = ({ tramo, finEscena }: { tramo: TramoLinea; finEscena: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { width, height, u, vertical } = useLayout();
  const { spec } = useSpec();
  const fuente: Punto[] = (vertical && tramo.puntosVertical) || tramo.puntos;
  const m = useMemo(() => muestrear(fuente.map(([x, y]) => [x * width, y * height])), [fuente, width, height]);

  const [desde, hasta] = [tramo.desdeS * fps, tramo.hastaS * fps];
  const apaga = (tramo.apagaS ?? finEscena) * fps;
  if (frame < desde || m.largo === 0) return null;
  const p = interpolate(frame, [desde, hasta], [0, 1], {
    easing: Easing.bezier(0.65, 0, 0.35, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const op = interpolate(frame, [apaga - 8, apaga], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (op <= 0) return null;
  const cabeza = p * m.largo;
  const inicio = tramo.cola !== undefined ? Math.max(0, cabeza - tramo.cola * m.largo) : 0;
  const d = m.pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  // Un solo guion desde `inicio` hasta la cabeza (con offset: un guion de largo 0 con punta redonda dibujaría un punto).
  const dash = `${Math.max(0.01, cabeza - inicio)} ${m.largo * 2 + 10}`;
  const off = -inicio;
  const g = (tramo.grosor ?? 6) * u;
  const [hx, hy] = puntoEn(m, cabeza);
  const color = spec.marca.color;
  const id = `ll-${tramo.desdeS}-${fuente.length}`;
  return (
    <AbsoluteFill style={{ opacity: op, pointerEvents: "none" }}>
      <svg width={width} height={height} style={{ overflow: "visible" }}>
        <defs>
          <filter id={id} x={-width} y={-height} width={width * 3} height={height * 3} filterUnits="userSpaceOnUse">
            <feGaussianBlur stdDeviation={g * 2.2} />
          </filter>
        </defs>
        {/* Halo ancho + núcleo blanco: la línea se lee como luz, no como trazo. */}
        <path d={d} fill="none" stroke={color} strokeWidth={g * 3} strokeLinecap="round" strokeDasharray={dash} strokeDashoffset={off} filter={`url(#${id})`} />
        <path d={d} fill="none" stroke={color} strokeWidth={g} strokeLinecap="round" strokeDasharray={dash} strokeDashoffset={off} />
        <path d={d} fill="none" stroke="#ffffff" strokeWidth={g * 0.35} strokeLinecap="round" strokeDasharray={dash} strokeDashoffset={off} opacity={0.85} />
        {p < 1 && (
          <>
            <circle cx={hx} cy={hy} r={g * 4} fill={alfa(color, 0.55)} filter={`url(#${id})`} />
            <circle cx={hx} cy={hy} r={g * 0.9} fill="#ffffff" />
          </>
        )}
      </svg>
    </AbsoluteFill>
  );
};

export default function LineaDeLuz({ tramos, finEscenaS }: { tramos: TramoLinea[]; finEscenaS: number }) {
  return (
    <>
      {tramos.map((t, i) => (
        <Tramo key={i} tramo={t} finEscena={finEscenaS} />
      ))}
    </>
  );
}
