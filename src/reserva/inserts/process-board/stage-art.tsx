import { PAPER, SHADOW } from "../../theme";
import type { Stage } from "./data";
import { POLAROID } from "./geometry";

type StageArtProps = {
  stage: Stage;
  /** 0..1+ escala del sticker negro (entra con spring). */
  badge: number;
  /** Rotación del anillo punteado (grados). */
  spin: number;
};

const W = POLAROID.w - POLAROID.pad * 2;
const H = POLAROID.photo;

/** "Foto" de la polaroid: papel cuadriculado + tile blanco con el ícono principal + sticker negro. */
export default function StageArt({ stage, badge, spin }: StageArtProps) {
  const Icon = stage.icon;
  const Badge = stage.badge;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: W,
        height: H,
        overflow: "hidden",
        background: "linear-gradient(160deg, #f3f3f0 0%, #e0e0dc 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          backgroundPosition: "10px 12px",
        }}
      />
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        <circle
          cx={W / 2}
          cy={H / 2 + 4}
          r={96}
          fill="none"
          stroke="#aeaeaa"
          strokeWidth={1.8}
          strokeDasharray="6 8"
          transform={`rotate(${spin} ${W / 2} ${H / 2 + 4})`}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: W / 2 - 64 - 14,
          top: H / 2 - 64 + 14,
          width: 128,
          height: 128,
          borderRadius: 30,
          background: "#ffffff",
          boxShadow: SHADOW.soft,
          transform: "rotate(-6deg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={64} strokeWidth={1.5} color={PAPER.ink} />
      </div>
      <div
        style={{
          position: "absolute",
          left: W / 2 + 18,
          top: H / 2 - 84,
          width: 78,
          height: 78,
          borderRadius: 39,
          background: PAPER.ink,
          boxShadow: "0 10px 20px rgba(0,0,0,0.22)",
          transform: `rotate(9deg) scale(${badge})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Badge size={34} strokeWidth={1.9} color="#ffffff" />
      </div>
    </div>
  );
}
