import { Check, MessageCircle, Phone } from "lucide-react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import Sfx from "../components/sfx";
import { ease, easeInOut, lerp, springAt } from "../motion";
import { ACCENT, FONT, PAPER, SHADOW, SPRING } from "../theme";
import type { InsertProps } from "./types";

const CARD = { right: 56, top: 64, width: 520 } as const;
const TOUCH = { left: "74%", top: "62%" } as const;
const BUTTON = { width: 212, height: 56 } as const;

export default function WhatsappCta({ durationInFrames, cues }: InsertProps) {
  const frame = useCurrentFrame();
  const whatsapp = cues.whatsapp ?? 17;
  const confirmar = cues.confirmar ?? 38;
  const vernos = cues.salida ?? 58;
  const end = Math.min(durationInFrames - 2, vernos + 12);

  const enter = springAt(frame, 0, SPRING.pop);
  const enterOpacity = ease(frame, [0, 6]);
  const exit = easeInOut(frame, [vernos, end]);
  const exitOpacity = easeInOut(frame, [vernos + 3, end], [1, 0]);

  const iconPop = springAt(frame, whatsapp - 3, SPRING.pop);
  const iconScale = 1 + 0.2 * Math.sin(Math.min(1, iconPop) * Math.PI);
  const iconRotate = 8 * Math.sin(Math.min(1, iconPop) * Math.PI * 2) * (1 - Math.min(1, iconPop));
  const punchT = Math.min(1, Math.max(0, (frame - (whatsapp - 3)) / 8));
  const punch = 1 + 0.035 * Math.sin(punchT * Math.PI);

  const float = Math.sin(frame / 40) * 4;
  const y = lerp(-280, 0, enter) - exit * 200 + float;
  const scale = lerp(0.92, 1, enter) * punch;
  const rotate = lerp(-3, 0, enter);

  const pressDown = ease(frame, [confirmar - 6, confirmar - 1]);
  const release = springAt(frame, confirmar, SPRING.pop);
  const buttonScale = 1 - 0.07 * pressDown * (1 - release);
  const done = frame >= confirmar;
  const doneT = springAt(frame, confirmar, SPRING.pop);

  const touchIn = ease(frame, [confirmar - 14, confirmar - 6]);
  const touchOut = ease(frame, [confirmar, confirmar + 5], [1, 0]);
  const touchOpacity = Math.min(touchIn, touchOut);
  const touchX = lerp(70, 0, touchIn);
  const touchY = lerp(80, 0, touchIn);
  const touchScale = 1 - 0.22 * pressDown * (1 - release);

  const ripple = ease(frame, [confirmar - 2, confirmar + 16]);
  const rippleOpacity = frame >= confirmar - 2 ? (1 - ripple) * 0.45 : 0;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Sfx name="pop" at={6} volume={0.25} />
      <Sfx name="pop" at={whatsapp} volume={0.12} />
      <Sfx name="click" at={confirmar} volume={0.3} />
      <Sfx name="swoosh-tiny" at={vernos + 2} volume={0.15} />

      <div
        style={{
          position: "absolute",
          top: CARD.top,
          right: CARD.right,
          width: CARD.width,
          opacity: Math.min(enterOpacity, exitOpacity),
          transform: `translateY(${y}px) scale(${scale}) rotate(${rotate}deg)`,
          transformOrigin: "50% 0%",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(24px) saturate(1.4)",
            WebkitBackdropFilter: "blur(24px) saturate(1.4)",
            borderRadius: 30,
            boxShadow: SHADOW.lifted,
            padding: "22px 24px 22px 22px",
            fontFamily: FONT.sans,
            color: PAPER.ink,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 16,
                background: ACCENT.whatsapp,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                flexShrink: 0,
                boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.08)",
                transform: `scale(${iconScale}) rotate(${iconRotate}deg)`,
              }}
            >
              <MessageCircle size={40} color="#fff" fill="#fff" strokeWidth={2} />
              <Phone
                size={17}
                color={ACCENT.whatsapp}
                fill={ACCENT.whatsapp}
                strokeWidth={1.5}
                style={{ position: "absolute", left: 21.5, top: 21.5 }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 900, fontSize: 27, letterSpacing: -0.6 }}>Nexora</span>
                <span style={{ fontWeight: 500, fontSize: 20, color: PAPER.muted }}>ahora</span>
              </div>
              <div style={{ fontWeight: 500, fontSize: 18, color: PAPER.muted, marginTop: 1 }}>WhatsApp</div>
            </div>
          </div>

          <div
            style={{
              fontWeight: 700,
              fontSize: 27,
              lineHeight: 1.22,
              letterSpacing: -0.5,
              marginTop: 16,
            }}
          >
            ¿Confirmás tu llamada del
            <br />
            <span style={{ whiteSpace: "nowrap" }}>jueves a las 18 hs?</span>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
            <div style={{ position: "relative", width: BUTTON.width, height: BUTTON.height }}>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 999,
                  background: done ? ACCENT.green : PAPER.ink,
                  transform: `scale(${buttonScale * (done ? lerp(0.94, 1, doneT) : 1)})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 23,
                  letterSpacing: -0.3,
                  boxShadow: done ? "0 8px 22px rgba(34,197,94,0.35)" : "0 6px 16px rgba(0,0,0,0.18)",
                }}
              >
                {done && (
                  <div
                    style={{
                      transform: `scale(${doneT}) rotate(${lerp(-40, 0, doneT)}deg)`,
                      display: "flex",
                    }}
                  >
                    <Check size={24} strokeWidth={3.4} color="#fff" />
                  </div>
                )}
                <span>{done ? "Confirmada" : "Confirmar"}</span>
              </div>

              <div
                style={{
                  position: "absolute",
                  left: TOUCH.left,
                  top: TOUCH.top,
                  width: 60,
                  height: 60,
                  marginLeft: -30,
                  marginTop: -30,
                  borderRadius: 999,
                  border: `3px solid ${done ? ACCENT.green : PAPER.ink}`,
                  opacity: rippleOpacity,
                  transform: `scale(${interpolate(ripple, [0, 1], [0.6, 2.2])})`,
                }}
              />

              <div
                style={{
                  position: "absolute",
                  left: TOUCH.left,
                  top: TOUCH.top,
                  width: 70,
                  height: 70,
                  marginLeft: -35,
                  marginTop: -35,
                  borderRadius: 999,
                  background: "rgba(160,160,160,0.45)",
                  border: "3px solid rgba(255,255,255,0.95)",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
                  opacity: touchOpacity,
                  transform: `translate(${touchX}px, ${touchY}px) scale(${touchScale})`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}
