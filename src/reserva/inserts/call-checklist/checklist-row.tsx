import { useCurrentFrame } from "remotion";
import { ease, easeInOut, springAt } from "../../motion";
import { ACCENT, FONT, PAPER, SPRING } from "../../theme";

export const ROW = {
  top: 132,
  height: 135,
  boxX: 92,
  boxSize: 60,
  labelX: 196,
} as const;

export const CHECK_POINTS: [number, number][] = [
  [15, 31],
  [26, 43],
  [46, 17],
];

export const checkPoint = (progress: number): [number, number] => {
  const [a, b, c] = CHECK_POINTS;
  const l1 = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const l2 = Math.hypot(c[0] - b[0], c[1] - b[1]);
  const d = Math.max(0, Math.min(1, progress)) * (l1 + l2);
  if (d <= l1) {
    const t = d / l1;
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  }
  const t = (d - l1) / l2;
  return [b[0] + (c[0] - b[0]) * t, b[1] + (c[1] - b[1]) * t];
};

export const CHECK_DRAW = 7;

type ChecklistRowProps = {
  index: number;
  label: string;
  writeAt: number;
  writeDuration: number;
  tickAt: number;
  releaseAt: number | null;
};

const LABEL_SIZE = 58;

export default function ChecklistRow({ index, label, writeAt, writeDuration, tickAt, releaseAt }: ChecklistRowProps) {
  const frame = useCurrentFrame();
  const top = ROW.top + index * ROW.height;

  const write = easeInOut(frame, [writeAt, writeAt + writeDuration]);
  const boxSweep = ease(frame, [writeAt - 3, writeAt + writeDuration - 2]);
  const boxIn = Math.min(boxSweep, write);
  const boxOut = releaseAt === null ? 0 : easeInOut(frame, [releaseAt, releaseAt + 10]);
  const check = ease(frame, [tickAt, tickAt + CHECK_DRAW], [0, 1], (t) => t);
  const tickPop = springAt(frame, tickAt, SPRING.pop);
  const boxScale = frame < tickAt ? 1 : 1 + Math.sin(Math.min(1, tickPop) * Math.PI) * 0.12;
  const fill = ease(frame, [tickAt, tickAt + 8]);
  const lineDraw = ease(frame, [writeAt - 4, writeAt + 16]);

  const inkClip = `inset(-20% ${(1 - write) * 100}% -20% 0)`;
  const whiteRight = (1 - boxIn) * 100;
  const whiteClip = `inset(-20% ${whiteRight}% -20% ${boxOut * 100}%)`;

  const textStyle = {
    fontFamily: FONT.sans,
    fontWeight: 700,
    fontSize: LABEL_SIZE,
    letterSpacing: "-0.035em",
    lineHeight: 1,
    whiteSpace: "pre" as const,
  };

  return (
    <div style={{ position: "absolute", left: 0, top, width: "100%", height: ROW.height }}>
      <div
        style={{
          position: "absolute",
          left: 48,
          right: 48,
          bottom: 0,
          height: 2,
          background: "#dcdcd8",
          transform: `scaleX(${0.35 + lineDraw * 0.65})`,
          transformOrigin: "left center",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: ROW.boxX,
          top: (ROW.height - ROW.boxSize) / 2,
          width: ROW.boxSize,
          height: ROW.boxSize,
          transform: `scale(${boxScale})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 14,
            border: `4px solid ${PAPER.ink}`,
            background: PAPER.card,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 4,
            borderRadius: 10,
            background: ACCENT.greenSoft,
            opacity: fill,
            transform: `scale(${0.4 + fill * 0.6})`,
          }}
        />
        <svg width={ROW.boxSize} height={ROW.boxSize} viewBox="0 0 60 60" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <path
            d={`M ${CHECK_POINTS.map((p) => p.join(" ")).join(" L ")}`}
            fill="none"
            stroke={ACCENT.green}
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - check}
            opacity={check > 0 ? 1 : 0}
          />
        </svg>
      </div>

      <div style={{ position: "absolute", left: ROW.labelX, top: "50%", transform: "translateY(-54%)" }}>
        <div style={{ position: "relative", padding: "12px 18px 16px" }}>
          <span style={{ ...textStyle, color: PAPER.ink, clipPath: inkClip, display: "block" }}>{label}</span>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: PAPER.ink,
              borderRadius: 6,
              clipPath: `inset(0 ${(1 - boxIn) * 100}% 0 ${boxOut * 100}%)`,
            }}
          />
          <span
            style={{
              ...textStyle,
              color: "#ffffff",
              clipPath: whiteClip,
              position: "absolute",
              left: 18,
              top: 12,
            }}
          >
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
