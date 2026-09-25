import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import DashedPath from "../components/dashed-path";
import KineticLine from "../components/kinetic-line";
import PaperBackground from "../components/paper-background";
import Sfx from "../components/sfx";
import { ease, easeInOut, lerp, springAt } from "../motion";
import { PAPER, SPRING } from "../theme";
import type { InsertProps } from "./types";

const LOGO_W = 560;
const LOGO_H = Math.round((LOGO_W * 616) / 4544);
const ARC_W = 980;
const ARC_END_X = ARC_W - 130;
const ARC_END_Y = 22;
const ARC_D = `M 50 16 C 300 72, 640 74, ${ARC_END_X} ${ARC_END_Y}`;

export default function Outro({ durationInFrames, cues }: InsertProps) {
  const frame = useCurrentFrame();
  const gracias = cues.gracias ?? 14;
  const llamada = cues.llamada ?? 39;
  const fin = cues.fin ?? 52;

  const push = easeInOut(frame, [0, Math.min(durationInFrames, fin + 30)], [1, 1.03]);
  const float = Math.sin(frame / 40) * 4;

  const wipe = ease(frame, [2, 18]);
  const logoIn = ease(frame, [0, 14]);
  const logoSpring = springAt(frame, 2, SPRING.soft);

  const arc = ease(frame, [llamada + 3, fin + 10]);
  const settleScale =
    frame < fin
      ? lerp(1, 1.012, ease(frame, [fin - 8, fin]))
      : lerp(1.012, 1, springAt(frame, fin, SPRING.soft));

  return (
    <AbsoluteFill>
      <PaperBackground variant="arcs" seed={5} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 46% 44% at 50% 52%, ${PAPER.light} 0%, ${PAPER.light}e6 55%, transparent 100%)`,
          opacity: ease(frame, [0, 20]),
        }}
      />
      <AbsoluteFill style={{ transform: `scale(${push})`, alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: `translateY(${float - 30}px) scale(${settleScale})`,
          }}
        >
          <div
            style={{
              width: LOGO_W,
              height: LOGO_H,
              clipPath: `inset(-20% ${(1 - wipe) * 100}% -20% 0)`,
              opacity: logoIn,
              transform: `translateX(${(1 - logoSpring) * -18}px)`,
            }}
          >
            <Img
              src={staticFile("reserva/img/nexora-logo-white.png")}
              style={{ width: LOGO_W, height: LOGO_H, filter: "brightness(0)", display: "block" }}
            />
          </div>

          <div
            style={{
              marginTop: 40,
              width: lerp(0, 72, ease(frame, [8, 22])),
              height: 3,
              background: PAPER.ink,
              opacity: 0.85,
            }}
          />

          <KineticLine
            size={240}
            stagger={2}
            style={{ marginTop: 44 }}
            parts={[
              { text: "muchas", font: "serif", at: gracias - 3, size: 150 },
              { text: "gracias", font: "sans", at: gracias - 1 },
            ]}
          />

          <div style={{ position: "relative", marginTop: 40 }}>
            <KineticLine
              size={104}
              stagger={1}
              parts={[
                { text: "nos vemos en la", font: "serif", at: llamada - 4, size: 84 },
                { text: "llamada", font: "sans", at: llamada - 1, highlight: true },
              ]}
            />
            <svg
              width={ARC_W}
              height={80}
              viewBox={`0 0 ${ARC_W} 80`}
              style={{ position: "absolute", left: "50%", top: "100%", marginLeft: -ARC_W / 2, marginTop: 20, overflow: "visible" }}
            >
              <DashedPath d={ARC_D} progress={arc} stroke={PAPER.inkSoft} strokeWidth={3} dash={14} gap={11} />
              <circle
                cx={ARC_END_X}
                cy={ARC_END_Y}
                r={11 * springAt(frame, fin + 8, SPRING.pop)}
                fill={PAPER.ink}
              />
            </svg>
          </div>
        </div>
      </AbsoluteFill>

      <Sfx name="pop" at={gracias} volume={0.22} />
      <Sfx name="click" at={llamada} volume={0.25} />
      <Sfx name="pop" at={fin + 8} volume={0.15} />
    </AbsoluteFill>
  );
}
