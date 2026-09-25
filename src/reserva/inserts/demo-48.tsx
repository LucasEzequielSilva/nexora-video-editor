import { Check } from "lucide-react";
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import DashedPath from "../components/dashed-path";
import KineticLine from "../components/kinetic-line";
import PaperBackground from "../components/paper-background";
import Sfx from "../components/sfx";
import { ease, easeInOut, lerp, springAt } from "../motion";
import { ACCENT, FONT, PAPER, SHADOW, SPRING } from "../theme";
import type { InsertProps } from "./types";

const CARD = { x: 1250, y: 190, w: 400, h: 711, rotate: 2.5 } as const;

const PaperClip = () => (
  <svg width={64} height={130} viewBox="0 0 64 130" style={{ overflow: "visible" }}>
    <path
      d="M 20 96 L 20 22 C 20 8, 44 8, 44 22 L 44 108 C 44 126, 12 126, 12 108 L 12 36"
      fill="none"
      stroke="#9a9a96"
      strokeWidth={7}
      strokeLinecap="round"
    />
    <path
      d="M 20 96 L 20 22 C 20 8, 44 8, 44 22 L 44 108 C 44 126, 12 126, 12 108 L 12 36"
      fill="none"
      stroke="#e6e6e3"
      strokeWidth={2.5}
      strokeLinecap="round"
      transform="translate(-1.2 -1.2)"
    />
  </svg>
);

export default function Demo48({ durationInFrames, cues }: InsertProps) {
  const frame = useCurrentFrame();
  const demoAt = (cues.demo ?? 16) - 4;
  const hitAt = cues.horas48 ?? 54;
  const countStart = hitAt - 9;
  const countEnd = hitAt;

  const push = easeInOut(frame, [0, durationInFrames], [1, 1.03]);

  const cardIn = springAt(frame, 4, SPRING.pop);
  const cardFloat = Math.sin(frame / 40) * 4;
  const cardRotate = lerp(9, CARD.rotate, cardIn);
  const cardY = lerp(140, 0, cardIn) + cardFloat;

  const count = Math.round(ease(frame, [countStart, countEnd], [0, 48], (t) => t));
  const numIn = springAt(frame, countStart, SPRING.pop);
  const numOpacity = ease(frame, [countStart, countStart + 4]);
  const punch = 1 + 0.07 * Math.exp(-Math.max(0, frame - countEnd) / 4) * (frame >= countEnd ? 1 : 0);
  const headlineLift = easeInOut(frame, [countStart - 4, countStart + 6], [160, 0]);

  const horasAt = countEnd;
  const horas = ease(frame, [horasAt, horasAt + 9]);
  const underline = ease(frame, [horasAt + 2, horasAt + 12]);

  const arrowAt = horasAt + 4;
  const arrow = ease(frame, [arrowAt, arrowAt + 10]);
  const chipAt = Math.min(72, arrowAt + 9);
  const chip = springAt(frame, chipAt, SPRING.pop);

  return (
    <AbsoluteFill>
      <PaperBackground variant="grid" seed={2} />
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <div
          style={{
            position: "absolute",
            left: CARD.x,
            top: CARD.y,
            width: CARD.w,
            height: CARD.h,
            transform: `translateY(${cardY}px) rotate(${cardRotate}deg) scale(${lerp(0.85, 1, cardIn)})`,
            opacity: ease(frame, [4, 9]),
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 36,
              background: PAPER.card,
              boxShadow: SHADOW.lifted,
              padding: 14,
            }}
          >
            <div style={{ width: "100%", height: "100%", borderRadius: 24, overflow: "hidden", background: "#1a1a1a" }}>
              <OffthreadVideo
                src={staticFile("reserva/broll/clock-fire.mp4")}
                muted
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          </div>
          <div style={{ position: "absolute", left: CARD.w / 2 - 32, top: -58 }}>
            <PaperClip />
          </div>
          <div
            style={{
              position: "absolute",
              left: -54,
              bottom: 56,
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "16px 26px 16px 16px",
              borderRadius: 999,
              background: PAPER.card,
              boxShadow: SHADOW.card,
              opacity: ease(frame, [chipAt, chipAt + 4]),
              transform: `rotate(-4deg) scale(${lerp(0.6, 1, chip)})`,
              transformOrigin: "left center",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 999,
                background: ACCENT.green,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Check color="#fff" size={28} strokeWidth={3.5} />
            </div>
            <span style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 34, letterSpacing: "-0.02em", color: PAPER.ink }}>
              Demo lista
            </span>
          </div>
        </div>

        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <DashedPath
            d="M 880 745 C 940 850, 1050 850, 1160 808"
            progress={arrow}
            stroke={PAPER.muted}
            strokeWidth={3.5}
            dash={12}
            gap={10}
          />
          <path
            d="M 1136 794 L 1164 806 L 1146 830"
            fill="none"
            stroke={PAPER.muted}
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={ease(frame, [arrowAt + 8, arrowAt + 11])}
          />
        </svg>

        <div style={{ position: "absolute", left: 190, top: 270, width: 1000, transform: `translateY(${headlineLift}px)` }}>
          <KineticLine
            align="left"
            size={112}
            stagger={3}
            parts={[
              { text: "una", font: "serif", at: demoAt, size: 96 },
              { text: "demo funcional", font: "sans", at: demoAt + 3 },
            ]}
          />

          <div style={{ display: "flex", alignItems: "baseline", marginTop: 20 }}>
            <div
              style={{
                width: 432,
                fontFamily: FONT.display,
                fontWeight: 900,
                fontSize: 330,
                lineHeight: 0.9,
                letterSpacing: "-0.06em",
                color: PAPER.ink,
                opacity: numOpacity,
                transform: `translateY(${(1 - numIn) * 60}px) scale(${lerp(0.8, 1, numIn) * punch})`,
                transformOrigin: "left bottom",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {String(count).padStart(2, "0")}
            </div>
            <div style={{ position: "relative", marginLeft: 6 }}>
              <span
                style={{
                  display: "inline-block",
                  fontFamily: FONT.serif,
                  fontStyle: "italic",
                  fontSize: 150,
                  lineHeight: 1,
                  color: PAPER.ink,
                  opacity: horas,
                  transform: `translateX(${(1 - horas) * -30}px)`,
                  filter: `blur(${(1 - horas) * 8}px)`,
                }}
              >
                horas
              </span>
              <div
                style={{
                  position: "absolute",
                  left: 4,
                  right: 0,
                  bottom: -6,
                  height: 12,
                  background: PAPER.ink,
                  transform: `scaleX(${underline})`,
                  transformOrigin: "left center",
                }}
              />
            </div>
          </div>
        </div>
      </AbsoluteFill>

      <Sfx name="counter" at={countStart} volume={0.2} maxFrames={countEnd - countStart} />
      <Sfx name="impact" at={countEnd} volume={0.3} />
      <Sfx name="pop" at={chipAt} volume={0.2} />
    </AbsoluteFill>
  );
}
