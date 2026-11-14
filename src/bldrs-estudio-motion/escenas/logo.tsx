import type React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Fondo } from "../comun";
import { clamp, conico, F_GRANDE, salida, suave } from "../tema";

export const LOGO_PATH =
  "M158.427 0.705078L159.649 93.6309L159.654 93.9775L159.332 94.1035L96.0566 118.863L95.4727 119.092L95.3799 118.472C93.5382 106.225 85.8204 99.7107 76.8838 99.0273C72.8558 98.7195 68.5683 99.6839 64.1553 101.167C59.7292 102.655 55.268 104.628 50.8125 106.332C47.302 107.674 44.3267 108.895 41.5391 110.049C38.8605 111.157 36.3496 112.203 33.71 113.235V143.192L33.3936 143.317L1.60352 155.85L0.924805 156.117L0.919922 155.389L0.00292969 29.4492L0 29.1016L0.325195 28.9785L59.083 6.68164C65.5273 4.23627 72.4771 1.84456 79.4082 3.24512C83.4073 4.05331 87.5179 5.77321 90.7373 8.9541C93.8541 12.0337 96.1002 16.4494 96.6279 22.6348L157.755 0.242188L158.417 0L158.427 0.705078ZM76.6016 35.1602C71.2414 34.5082 66.0082 36.3397 61.1006 38.2012L33.0332 48.8467L32.7109 48.9688V79.9678L33.3711 79.7441L62.0322 70.0322L62.0713 70.0195C67.6268 68.1371 73.2761 66.235 78.8584 67.29C90.0027 69.3964 94.7052 79.573 95.6875 85.4658L95.7881 86.0713L96.3604 85.8506L127.234 73.9287L127.562 73.8027L127.554 73.4521L126.942 44.4131L126.928 43.7002L126.263 43.957L95.9961 55.6426C95.1728 48.5267 92.4604 43.6793 88.9043 40.4756C85.2487 37.1823 80.7451 35.6642 76.6016 35.1602Z";

const VERTICES: [number, number][] = [
  [158.4, 0.7],
  [159.6, 93.6],
  [96, 118.9],
  [33.7, 113.2],
  [33.7, 143.2],
  [0.9, 155.4],
  [0, 29.1],
  [59, 6.7],
  [96.6, 22.6],
  [126.9, 44],
  [127.6, 73.9],
  [96, 55.6],
  [32.7, 49],
  [32.7, 80],
];

const GLIFO = 340;
const ESC_SVG = GLIFO / 160;
const ICONO = 220;

const Ancla: React.FC<{ x: number; y: number; op: number; t?: number }> = ({ x, y, op, t = 12 }) => (
  <rect x={x - t / 2} y={y - t / 2} width={t} height={t} fill="white" stroke="#0C0C0E" strokeWidth={1.5} opacity={op} />
);

export const Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const arco = interpolate(frame, [0, 22], [0, 0.62], { ...clamp, easing: salida });
  const arcoOp = interpolate(frame, [30, 44], [1, 0], clamp);
  const giro = frame * 1.6 - 120;
  const trazo = interpolate(frame, [8, 44], [0, 1], { ...clamp, easing: suave });
  const caja = interpolate(frame, [4, 10], [0, 1], clamp) * interpolate(frame, [46, 50], [1, 0], clamp);
  const relleno = interpolate(frame, [46, 50], [0, 1], clamp);

  const encoge = spring({ frame: frame - 47, fps, config: { damping: 15, stiffness: 160, mass: 0.8 } });
  const glifoEsc = 1 - encoge * (1 - (ICONO * 0.58) / GLIFO);
  const marco = spring({ frame: frame - 49, fps, config: { damping: 12, stiffness: 170, mass: 0.7 } });
  const corre = interpolate(frame, [60, 78], [0, 1], { ...clamp, easing: suave });
  const cx = 960 - corre * 442;
  const revela = interpolate(frame, [62, 74], [0, 1], { ...clamp, easing: salida });
  const golpe = interpolate(frame, [46, 49, 60], [0, 1, 0], clamp);

  const R = 430;
  const puntosArco = [0, 0.18, 0.36, 0.55].filter((p) => p <= arco);

  return (
    <AbsoluteFill>
      <Fondo tipo="negro" brillo={0.7 + golpe * 0.8} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <g transform={`rotate(${giro} 960 540)`} opacity={arcoOp}>
          <circle cx={960} cy={540} r={R} fill="none" stroke="white" strokeWidth={2} pathLength={1} strokeDasharray={`${arco} 1`} />
          {puntosArco.map((p) => {
            const a = p * Math.PI * 2;
            const x = 960 + R * Math.cos(a);
            const y = 540 + R * Math.sin(a);
            const tx = -Math.sin(a) * 70;
            const ty = Math.cos(a) * 70;
            return (
              <g key={p}>
                <line x1={x - tx} y1={y - ty} x2={x + tx} y2={y + ty} stroke="rgba(255,255,255,0.55)" strokeWidth={1.2} />
                <circle cx={x - tx} cy={y - ty} r={4} fill="#0C0C0E" stroke="white" strokeWidth={1.2} />
                <circle cx={x + tx} cy={y + ty} r={4} fill="#0C0C0E" stroke="white" strokeWidth={1.2} />
                <Ancla x={x} y={y} op={1} />
              </g>
            );
          })}
        </g>
        {caja > 0 ? (
          <g opacity={caja}>
            <rect
              x={960 - GLIFO / 2 - 24}
              y={540 - (GLIFO * 157) / 160 / 2 - 24}
              width={GLIFO + 48}
              height={(GLIFO * 157) / 160 + 48}
              fill="none"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth={1.2}
              strokeDasharray="6 7"
            />
            {[
              [-1, -1],
              [1, -1],
              [1, 1],
              [-1, 1],
            ].map(([sx, sy]) => (
              <Ancla key={`${sx}${sy}`} x={960 + sx * (GLIFO / 2 + 24)} y={540 + sy * ((GLIFO * 157) / 160 / 2 + 24)} op={1} t={10} />
            ))}
          </g>
        ) : null}
      </svg>

      <div
        style={{
          position: "absolute",
          left: cx - ICONO / 2,
          top: 540 - (ICONO * 157) / 160 / 2,
          width: ICONO,
          height: (ICONO * 157) / 160,
          transform: `scale(${0.4 + 0.6 * marco})`,
          opacity: marco,
        }}
      >
        <div style={{ position: "absolute", inset: -16, borderRadius: ICONO * 0.3, background: conico(frame * 2.4), filter: "blur(28px)", opacity: 0.3 }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: ICONO * 0.24, background: conico(frame * 2.4), padding: ICONO * 0.056 }}>
          <div style={{ width: "100%", height: "100%", borderRadius: ICONO * 0.19, background: "#040404", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)" }} />
        </div>
      </div>

      <svg
        width={GLIFO}
        height={(GLIFO * 157) / 160}
        viewBox="0 0 160 157"
        style={{
          position: "absolute",
          left: cx - GLIFO / 2,
          top: 540 - (GLIFO * 157) / 160 / 2,
          overflow: "visible",
          transform: `scale(${glifoEsc * (1 + golpe * 0.06)})`,
          filter: relleno > 0 ? `drop-shadow(0 0 ${30 * golpe}px rgba(255,255,255,0.6))` : undefined,
        }}
      >
        <path
          d={LOGO_PATH}
          fillRule="evenodd"
          fill="white"
          fillOpacity={relleno}
          stroke="white"
          strokeWidth={1.3 / ESC_SVG * 2}
          strokeOpacity={1 - relleno}
          pathLength={1}
          strokeDasharray={`${trazo} 1`}
        />
        {VERTICES.map(([x, y], i) => {
          const op = interpolate(frame, [10 + i * 2.4, 12 + i * 2.4], [0, 1], clamp) * (1 - relleno);
          return <Ancla key={i} x={x} y={y} op={op} t={10 / ESC_SVG} />;
        })}
      </svg>

      <div
        style={{
          position: "absolute",
          left: cx + ICONO / 2 + 44,
          top: 540,
          transform: `translateY(-52%) translateX(${(1 - revela) * -60}px)`,
          clipPath: `inset(-20% ${(1 - revela) * 100}% -20% 0)`,
          fontFamily: F_GRANDE,
          fontWeight: 600,
          fontSize: 138,
          letterSpacing: "-0.004em",
          color: "white",
          whiteSpace: "nowrap",
          lineHeight: 1,
        }}
      >
        Builders Club
      </div>
    </AbsoluteFill>
  );
};
