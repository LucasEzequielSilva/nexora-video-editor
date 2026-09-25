import { AbsoluteFill, useCurrentFrame } from "remotion";
import { PAPER } from "../theme";

type PaperBackgroundProps = {
  /** arcs: arcos grises grandes + línea punteada | grid: papel cuadriculado con cruces | plain: solo papel */
  variant?: "arcs" | "grid" | "plain";
  /** Variación de la posición de los arcos para que cada escena no sea idéntica. */
  seed?: number;
};

const NOISE_SVG = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

export default function PaperBackground({ variant = "arcs", seed = 0 }: PaperBackgroundProps) {
  const frame = useCurrentFrame();
  const drift = Math.sin((frame + seed * 40) / 90) * 14;
  const rotate = -8 + seed * 11 + Math.sin(frame / 140) * 1.5;

  return (
    <AbsoluteFill style={{ background: PAPER.base, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 75% at 50% 45%, ${PAPER.light} 0%, ${PAPER.base} 55%, ${PAPER.shade} 100%)`,
        }}
      />

      {variant === "arcs" && (
        <svg
          width={1920}
          height={1080}
          viewBox="0 0 1920 1080"
          style={{ position: "absolute", inset: 0, transform: `translateY(${drift}px) rotate(${rotate}deg)`, transformOrigin: "50% 50%" }}
        >
          <defs>
            <linearGradient id="paper-arc" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6e6e6a" />
              <stop offset="55%" stopColor="#b4b4b0" />
              <stop offset="100%" stopColor="#e4e4e1" />
            </linearGradient>
            <filter id="paper-arc-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="18" stdDeviation="16" floodColor="#000" floodOpacity="0.18" />
            </filter>
          </defs>
          <path
            d="M -260 980 C 240 520, 900 300, 2240 420"
            fill="none"
            stroke="url(#paper-arc)"
            strokeWidth={46}
            strokeLinecap="round"
            filter="url(#paper-arc-shadow)"
            opacity={0.9}
          />
          <path
            d="M -200 180 C 520 60, 1300 160, 2180 -40"
            fill="none"
            stroke="url(#paper-arc)"
            strokeWidth={22}
            strokeLinecap="round"
            filter="url(#paper-arc-shadow)"
            opacity={0.6}
          />
          <path
            d="M -120 760 C 620 560, 1280 900, 2080 640"
            fill="none"
            stroke="#a3a39f"
            strokeWidth={2.5}
            strokeDasharray="14 14"
            strokeDashoffset={-frame * 0.6}
            opacity={0.7}
          />
        </svg>
      )}

      {variant === "grid" && (
        <AbsoluteFill
          style={{
            backgroundImage: `linear-gradient(${PAPER.line}33 1px, transparent 1px), linear-gradient(90deg, ${PAPER.line}33 1px, transparent 1px)`,
            backgroundSize: "72px 72px",
            backgroundPosition: `${(frame * 0.3) % 72}px 0px`,
            maskImage: "radial-gradient(ellipse 65% 70% at 50% 50%, black 30%, transparent 85%)",
          }}
        />
      )}

      <AbsoluteFill style={{ backgroundImage: NOISE_SVG, opacity: 0.08, mixBlendMode: "multiply" }} />
      <AbsoluteFill
        style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 50%, rgba(0,0,0,0.32) 100%)" }}
      />
    </AbsoluteFill>
  );
}
