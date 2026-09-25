import { AbsoluteFill, useCurrentFrame } from "remotion";
import DashedPath from "../components/dashed-path";
import KineticLine from "../components/kinetic-line";
import PaperBackground from "../components/paper-background";
import Sfx from "../components/sfx";
import { ease, easeInOut, lerp, revealStyle, springAt } from "../motion";
import { ACCENT, FONT, PAPER, SHADOW, SPRING } from "../theme";
import ChecklistRow, { CHECK_DRAW, ROW, checkPoint } from "./call-checklist/checklist-row";
import Pencil from "./call-checklist/pencil";
import type { InsertProps } from "./types";

const CARD = { left: 260, top: 250, width: 990, height: 710 } as const;
const LABELS = ["Funcionalidades", "Cómo va a funcionar", "Tiempo de desarrollo", "Inversión"];
const PENCIL_ANGLE = 32;

type Step = { writeAt: number; writeDuration: number; tickAt: number; releaseAt: number | null };

const checkOrigin = (index: number): [number, number] => [
  ROW.boxX,
  ROW.top + index * ROW.height + (ROW.height - ROW.boxSize) / 2,
];

const pencilTip = (frame: number, steps: Step[]): { x: number; y: number; lift: number } => {
  let x = CARD.width * 0.55;
  let y = CARD.height + 220;
  let lift = 1;

  for (let i = 0; i < steps.length; i++) {
    const { tickAt } = steps[i];
    const [ox, oy] = checkOrigin(i);
    const [sx, sy] = checkPoint(0);
    const [ex, ey] = checkPoint(1);
    const travel = easeInOut(frame, [tickAt - 14, tickAt - 1]);
    if (frame < tickAt - 14) break;

    const startX = ox + sx;
    const startY = oy + sy;
    x = lerp(x, startX, travel);
    y = lerp(y, startY, travel);
    lift = 1 - ease(frame, [tickAt - 6, tickAt - 1]);
    if (frame < tickAt) break;

    const [px, py] = checkPoint((frame - tickAt) / CHECK_DRAW);
    x = ox + px;
    y = oy + py;
    lift = 0;
    if (frame < tickAt + CHECK_DRAW) break;

    const rest = ease(frame, [tickAt + CHECK_DRAW, tickAt + CHECK_DRAW + 12]);
    x = ox + ex + rest * 22;
    y = oy + ey + rest * 18;
    lift = rest * 0.6;
  }

  return { x, y, lift };
};

export default function CallChecklist({ durationInFrames, cues }: InsertProps) {
  const frame = useCurrentFrame();

  const cueList = [cues.funcionalidades, cues.funcionar, cues.tiempo, cues.inversion];
  const steps: Step[] = cueList.map((cue, i) => {
    const last = i === cueList.length - 1;
    const writeAt = last ? cue - 9 : cue - 2;
    const writeDuration = last ? 8 : 13;
    const tickAt = last ? writeAt + writeDuration : cue + 11;
    // Last row has no following row to trigger its release, so it must release
    // itself. Give the retract (10f) a head start so it finishes together with
    // the check draw (7f) instead of trailing behind it into the scene exit.
    const releaseAt = last ? tickAt - 3 : null;
    return { writeAt, writeDuration, tickAt, releaseAt };
  });
  steps.forEach((s, i) => {
    if (i < steps.length - 1) s.releaseAt = steps[i + 1].writeAt - 4;
  });

  const push = lerp(1, 1.03, frame / durationInFrames);
  const cardPop = springAt(frame, 0, SPRING.pop);
  const float = Math.sin(frame / 40) * 4;
  const tip = pencilTip(frame, steps);
  const idle = Math.sin(frame / 18) * 3 * tip.lift;

  const done = steps.filter((s) => frame >= s.tickAt + CHECK_DRAW).length;
  const lastTick = steps[Math.max(0, done - 1)].tickAt + CHECK_DRAW;
  const countPop = done > 0 ? springAt(frame, lastTick, SPRING.pop) : 1;
  const countScale = 1 + Math.sin(Math.min(1, countPop) * Math.PI) * 0.08;

  const noteAt = cues.inversion - 10;
  const arrow = ease(frame, [noteAt + 4, noteAt + 18]);
  const head = ease(frame, [noteAt + 16, noteAt + 21]);

  return (
    <AbsoluteFill>
      <PaperBackground variant="grid" seed={3} />

      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "45% 50%" }}>
        <div style={{ position: "absolute", left: 120, top: 78 }}>
          <KineticLine
            align="left"
            size={92}
            parts={[
              { text: "en la llamada", font: "serif", at: 0, size: 60 },
              { text: "definimos", font: "sans", at: 4 },
            ]}
          />
        </div>

        <div
          style={{
            position: "absolute",
            left: CARD.left,
            top: CARD.top,
            width: CARD.width,
            height: CARD.height,
            opacity: ease(frame, [0, 6]),
            transform: `translateY(${(1 - cardPop) * 60 + float}px) rotate(${-2 + (1 - cardPop) * -3}deg) scale(${0.94 + cardPop * 0.06})`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 22,
              background: PAPER.card,
              boxShadow: SHADOW.card,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                height: 96,
                background: "linear-gradient(#f6f6f4, #ffffff)",
                borderBottom: "2px solid #e6e6e3",
              }}
            />
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: 40,
                  left: 90 + i * 76,
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  background: "#d4d4d0",
                  boxShadow: "inset 0 3px 4px rgba(0,0,0,0.25)",
                }}
              />
            ))}
            <div
              style={{
                position: "absolute",
                right: 52,
                top: 34,
                fontFamily: FONT.serif,
                fontStyle: "italic",
                fontSize: 34,
                color: PAPER.muted,
              }}
            >
              control
            </div>
            {LABELS.map((label, i) => (
              <ChecklistRow
                key={label}
                index={i}
                label={label}
                writeAt={steps[i].writeAt}
                writeDuration={steps[i].writeDuration}
                tickAt={steps[i].tickAt}
                releaseAt={steps[i].releaseAt}
              />
            ))}
          </div>

          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: -26,
                left: 94 + i * 76,
                width: 14,
                height: 62,
                borderRadius: 7,
                background: "linear-gradient(90deg, #3a3a3a, #9a9a96 45%, #2a2a2a)",
                boxShadow: "0 3px 5px rgba(0,0,0,0.25)",
              }}
            />
          ))}

          <Pencil x={tip.x} y={tip.y + idle} angle={PENCIL_ANGLE} lift={tip.lift} />
        </div>

        <div style={{ position: "absolute", left: 1390, top: 330, ...revealStyle(frame, 8) }}>
          <div style={{ fontFamily: FONT.serif, fontStyle: "italic", fontSize: 46, color: PAPER.inkSoft, lineHeight: 1 }}>
            definido
          </div>
          <div
            style={{
              fontFamily: FONT.display,
              fontWeight: 900,
              fontSize: 132,
              letterSpacing: "-0.05em",
              lineHeight: 1,
              color: PAPER.ink,
              marginTop: 8,
              transform: `scale(${countScale})`,
              transformOrigin: "left center",
            }}
          >
            {done}
            <span style={{ color: PAPER.muted }}>/4</span>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ width: 84, height: 12, borderRadius: 6, background: "#d6d6d2", overflow: "hidden" }}>
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: ACCENT.green,
                    transform: `scaleX(${ease(frame, [s.tickAt, s.tickAt + 10])})`,
                    transformOrigin: "left center",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: "absolute", left: 1390, top: 640, width: 420, ...revealStyle(frame, noteAt, 20, 12) }}>
          <div style={{ fontFamily: FONT.serif, fontStyle: "italic", fontSize: 58, lineHeight: 1.02, color: PAPER.ink }}>
            todo claro
            <br />
            antes de arrancar
          </div>
        </div>

        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <DashedPath d="M 1470 790 C 1440 900 1340 920 1268 872" progress={arrow} stroke={PAPER.ink} strokeWidth={3.5} dash={12} gap={10} />
          <path
            d="M 1293 873 L 1268 872 L 1279 895"
            fill="none"
            stroke={PAPER.ink}
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={head}
          />
        </svg>
      </AbsoluteFill>

      <Sfx name="swoosh-tiny" at={2} volume={0.2} />
      {steps.map((s, i) => (
        <Sfx key={i} name="click" at={s.tickAt} volume={0.3} />
      ))}
      <Sfx name="pop" at={noteAt} volume={0.18} />
    </AbsoluteFill>
  );
}
