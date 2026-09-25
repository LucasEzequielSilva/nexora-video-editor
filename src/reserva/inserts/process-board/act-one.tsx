import { useCurrentFrame } from "remotion";
import DashedPath from "../../components/dashed-path";
import KineticLine from "../../components/kinetic-line";
import { ease, easeInOut } from "../../motion";
import { PAPER } from "../../theme";
import { restBottom, stringPath, type Point } from "./geometry";
import type { Timeline } from "./timing";

type ActOneProps = { t: Timeline };

const connector = (from: Point, to: Point) => {
  const c1 = { x: from.x + 46, y: from.y + 96 };
  const c2 = { x: to.x - 56, y: to.y + 96 };
  const angle = Math.atan2(to.y - c2.y, to.x - c2.x);
  const wing = (offset: number) =>
    `${(to.x - Math.cos(angle + offset) * 17).toFixed(1)} ${(to.y - Math.sin(angle + offset) * 17).toFixed(1)}`;
  return {
    d: `M ${from.x} ${from.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${to.x} ${to.y}`,
    head: `M ${wing(0.5)} L ${to.x} ${to.y} L ${wing(-0.5)}`,
  };
};

const CONNECTORS = [0, 1].map((i) => {
  const from = restBottom(i, 64);
  const to = restBottom(i + 1, -76);
  return connector({ x: from.x, y: from.y + 34 }, { x: to.x, y: to.y + 40 });
});

/** Título, hilo punteado y flechas entre polaroids. */
export default function ActOne({ t }: ActOneProps) {
  const frame = useCurrentFrame();
  const out = ease(frame, [t.titleOut, t.titleOut + 12]);
  const fade = 1 - ease(frame, [t.monitor - 4, t.monitor + 10]);
  if (fade <= 0) return null;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 116,
          top: 92,
          opacity: 1 - out,
          transform: `translateY(${-out * 26}px)`,
          filter: out > 0 ? `blur(${out * 10}px)` : undefined,
        }}
      >
        <KineticLine
          parts={[
            { text: "nuestro", font: "serif", at: t.titleSerif },
            { text: "proceso", font: "sans", at: t.titleSans },
          ]}
          size={132}
          align="left"
        />
      </div>

      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <DashedPath
          d={stringPath(frame, t)}
          progress={easeInOut(frame, t.stringDraw)}
          stroke="#8c8c88"
          strokeWidth={3}
          dash={14}
          gap={10}
          opacity={fade}
        />
        {CONNECTORS.map((arrow, i) => {
          const at = t.arrows[i];
          if (frame < at) return null;
          return (
            <g key={arrow.d} opacity={fade}>
              <DashedPath
                d={arrow.d}
                progress={easeInOut(frame, [at, at + 16])}
                stroke={PAPER.inkSoft}
                strokeWidth={2.8}
                dash={10}
                gap={9}
              />
              <path
                d={arrow.head}
                fill="none"
                stroke={PAPER.inkSoft}
                strokeWidth={2.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={ease(frame, [at + 13, at + 18])}
              />
            </g>
          );
        })}
      </svg>
    </>
  );
}
