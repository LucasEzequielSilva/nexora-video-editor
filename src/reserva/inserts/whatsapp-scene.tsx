import { Check } from "lucide-react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import KineticLine, { type KineticPart } from "../components/kinetic-line";
import PaperBackground from "../components/paper-background";
import Sfx from "../components/sfx";
import { ease, easeInOut, lerp, springAt } from "../motion";
import { ACCENT, FONT, PAPER, SPRING } from "../theme";
import type { InsertProps } from "./types";
import Phone from "./whatsapp-scene/phone";

const SANS = 136;
const BLOCK = 250;

type Block = { at: number; serif: string; sans: string; sansDelay: number; highlight?: boolean };

export default function WhatsappScene({ durationInFrames, cues }: InsertProps) {
  const frame = useCurrentFrame();
  const { minutos, whatsapp, respondas, confirmacion } = cues;

  const blocks: Block[] = [
    { at: minutos - 6, serif: "en pocos", sans: "minutos", sansDelay: 5 },
    { at: whatsapp - 6, serif: "te llega un", sans: "WhatsApp", sansDelay: 3, highlight: true },
    { at: respondas - 4, serif: "respondé para", sans: "confirmar", sansDelay: 5 },
  ];

  const shown =
    1 + easeInOut(frame, [blocks[1].at - 2, blocks[1].at + 14]) + easeInOut(frame, [blocks[2].at - 2, blocks[2].at + 14]);
  const stackTop = 540 - (shown * BLOCK - 40) / 2 - 10;

  const timeline = {
    incomingTypingFrom: whatsapp - 26,
    firstBubble: whatsapp,
    secondBubble: whatsapp + 40,
    typingFrom: respondas,
    sent: respondas + 18,
    read: respondas + 28,
  };

  const phoneIn = springAt(frame, 2, SPRING.soft);
  const phoneFloat = Math.sin(frame / 40) * 4;
  const push = lerp(1, 1.03, easeInOut(frame, [0, durationInFrames]));

  const badgeAt = confirmacion - 4;
  const badge = springAt(frame, badgeAt, SPRING.snappy);
  const check = springAt(frame, badgeAt, SPRING.snappy);
  const underline = ease(frame, [badgeAt, badgeAt + 14]);

  return (
    <AbsoluteFill>
      <PaperBackground variant="arcs" seed={1} />
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <div style={{ position: "absolute", left: 150, top: stackTop, width: 760 }}>
          {blocks.map((b, i) => {
            const nextAt = blocks[i + 1]?.at;
            const dim = nextAt === undefined ? 1 : lerp(1, 0.38, ease(frame, [nextAt, nextAt + 14]));
            const parts: KineticPart[] = [{ text: b.sans, font: "sans", at: b.at + b.sansDelay, highlight: b.highlight }];
            return (
              <div key={b.sans} style={{ position: "absolute", top: i * BLOCK, left: 0, opacity: dim }}>
                <KineticLine parts={[{ text: b.serif, font: "serif", at: b.at, size: 76 }]} size={SANS} align="left" />
                <div style={{ position: "relative", marginTop: 4 }}>
                  <KineticLine parts={parts} size={SANS} align="left" />
                  {i === 2 && (
                    <svg
                      width={600}
                      height={40}
                      viewBox="0 0 600 40"
                      style={{ position: "absolute", left: 0, top: SANS * 1.02 }}
                    >
                      <path
                        d="M 6 26 C 140 12, 350 10, 592 20"
                        fill="none"
                        stroke={ACCENT.green}
                        strokeWidth={10}
                        strokeLinecap="round"
                        pathLength={1}
                        strokeDasharray="1 1"
                        strokeDashoffset={1 - underline}
                      />
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            position: "absolute",
            left: 1140,
            top: 104,
            opacity: ease(frame, [2, 12]),
            transform: `translateY(${(1 - phoneIn) * 120 + phoneFloat}px) rotate(${lerp(7, 3, phoneIn)}deg)`,
            transformOrigin: "50% 60%",
          }}
        >
          <Phone t={timeline} />
        </div>

        {frame >= badgeAt && (
          <div
            style={{
              position: "absolute",
              left: 960,
              top: 842,
              display: "flex",
              alignItems: "center",
              opacity: ease(frame, [badgeAt, badgeAt + 3]),
              transform: `translateY(${phoneFloat * 0.6}px) scale(${0.75 + 0.25 * badge}) rotate(${lerp(-10, -4, badge)}deg)`,
              transformOrigin: "20% 50%",
            }}
          >
            <div
              style={{
                width: 92,
                height: 92,
                borderRadius: 99,
                background: ACCENT.green,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 24px rgba(21,128,61,0.35), 0 2px 4px rgba(0,0,0,0.12)",
                border: "6px solid #fff",
                position: "relative",
                zIndex: 1,
                transform: `scale(${0.3 + 0.7 * check})`,
              }}
            >
              <Check size={50} color="#fff" strokeWidth={3.6} />
            </div>
            <div
              style={{
                marginLeft: -26,
                padding: "20px 34px 22px 50px",
                background: PAPER.ink,
                color: "#fff",
                fontFamily: FONT.sans,
                fontWeight: 700,
                fontSize: 42,
                letterSpacing: "-0.03em",
                lineHeight: 1,
                borderRadius: 16,
                boxShadow: "0 4px 8px rgba(0,0,0,0.12), 0 24px 48px rgba(0,0,0,0.28)",
                whiteSpace: "nowrap",
              }}
            >
              Llamada confirmada
            </div>
          </div>
        )}
      </AbsoluteFill>

      <Sfx name="pop" at={timeline.firstBubble} volume={0.3} />
      <Sfx name="pop" at={timeline.secondBubble} volume={0.22} />
      <Sfx name="key" at={timeline.typingFrom + 3} volume={0.18} />
      <Sfx name="key" at={timeline.typingFrom + 9} volume={0.15} />
      <Sfx name="swoosh-tiny" at={timeline.sent} volume={0.25} />
      <Sfx name="click" at={badgeAt + 3} volume={0.32} />
    </AbsoluteFill>
  );
}
