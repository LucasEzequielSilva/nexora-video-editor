import { useId } from "react";

type DashedPathProps = {
  d: string;
  /** 0..1 cuánto del recorrido está dibujado. */
  progress: number;
  stroke?: string;
  strokeWidth?: number;
  dash?: number;
  gap?: number;
  /** Mover los trazos a lo largo del camino (px). */
  offset?: number;
  opacity?: number;
};

/** Camino punteado que se dibuja progresivamente. Va dentro de un <svg>. */
export default function DashedPath({
  d,
  progress,
  stroke = "#8a8a87",
  strokeWidth = 3,
  dash = 12,
  gap = 12,
  offset = 0,
  opacity = 1,
}: DashedPathProps) {
  const maskId = `dash-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <g opacity={opacity}>
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse">
          <path
            d={d}
            fill="none"
            stroke="#fff"
            strokeWidth={strokeWidth + 8}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - Math.max(0, Math.min(1, progress))}
          />
        </mask>
      </defs>
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={-offset}
        mask={`url(#${maskId})`}
      />
    </g>
  );
}
