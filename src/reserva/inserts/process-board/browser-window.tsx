import { Check, Lock } from "lucide-react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { ease, easeInOut, lerp, revealStyle, springAt } from "../../motion";
import { ACCENT, FONT, PAPER, SHADOW, SPRING } from "../../theme";
import { URL_DOMAIN, URL_PATH } from "./data";
import { WINDOW, type WindowPose } from "./geometry";
import type { Timeline } from "./timing";

type BrowserWindowProps = { pose: WindowPose; t: Timeline };

const FULL_URL = URL_DOMAIN + URL_PATH;

export const typedChars = (frame: number, t: Timeline) =>
  Math.floor(
    interpolate(frame, [t.urlStart, t.urlStart + t.urlFrames], [0, FULL_URL.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

const AVATARS = [
  { initials: "LC", bg: "#111111" },
  { initials: "MR", bg: "#5b5b58" },
  { initials: "SG", bg: "#9a9a96" },
];

const TopBar = ({ t }: { t: Timeline }) => {
  const frame = useCurrentFrame();
  const typed = typedChars(frame, t);
  const typingEnd = t.urlStart + t.urlFrames;
  const typing = frame >= t.urlStart && frame <= typingEnd;
  const caretVisible = frame >= t.windowIn + 8 && frame < typingEnd + 16 && (typing || Math.floor(frame / 8) % 2 === 0);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: WINDOW.width,
        height: WINDOW.bar,
        background: "#f5f5f3",
        borderBottom: "1px solid #e8e8e5",
      }}
    >
      <div style={{ position: "absolute", left: 24, top: WINDOW.bar / 2 - 7, display: "flex", gap: 9 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 14, height: 14, borderRadius: 7, background: "#d9d9d5" }} />
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: WINDOW.width / 2 - 270,
          top: WINDOW.bar / 2 - 19,
          width: 540,
          height: 38,
          borderRadius: 19,
          background: "#ffffff",
          border: "1px solid #e3e3df",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 18px",
          fontFamily: FONT.sans,
          fontWeight: 500,
          fontSize: 19,
          letterSpacing: "-0.01em",
          whiteSpace: "pre",
        }}
      >
        <Lock size={15} strokeWidth={2.2} color={PAPER.muted} />
        <span style={{ display: "flex", alignItems: "center" }}>
          <span style={{ color: PAPER.ink }}>{FULL_URL.slice(0, Math.min(typed, URL_DOMAIN.length))}</span>
          <span style={{ color: PAPER.muted }}>{typed > URL_DOMAIN.length ? FULL_URL.slice(URL_DOMAIN.length, typed) : ""}</span>
          <span
            style={{
              width: 2,
              height: 22,
              marginLeft: 2,
              background: PAPER.ink,
              opacity: caretVisible ? 1 : 0,
            }}
          />
        </span>
      </div>
    </div>
  );
};

const Progress = ({ t }: { t: Timeline }) => {
  const frame = useCurrentFrame();
  const fill = easeInOut(frame, [t.objectives - 4, t.fillEnd]);
  const pct = lerp(45, 80, fill);
  const filling = frame >= t.objectives - 4 && frame <= t.fillEnd + 6;
  const glow = filling ? Math.sin(Math.PI * Math.min(1, (frame - t.objectives + 4) / (t.fillEnd - t.objectives + 10))) : 0;
  const check = springAt(frame, t.check, SPRING.pop);
  const ring = ease(frame, [t.check, t.check + 16]);

  return (
    <div style={{ position: "absolute", left: 790, top: 84, width: 390, ...revealStyle(frame, t.progressIn, 16) }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: 44 }}>
        <span
          style={{
            fontFamily: FONT.sans,
            fontWeight: 700,
            fontSize: 18,
            letterSpacing: "-0.01em",
            color: PAPER.inkSoft,
            paddingBottom: 5,
          }}
        >
          Objetivos del sprint
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {frame >= t.check && (
            <div style={{ position: "relative", width: 30, height: 30 }}>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 15,
                  border: `2px solid ${ACCENT.green}`,
                  transform: `scale(${lerp(1, 2.3, ring)})`,
                  opacity: 0.6 * (1 - ring),
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 15,
                  background: ACCENT.green,
                  transform: `scale(${check})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Check size={18} strokeWidth={3} color="#ffffff" />
              </div>
            </div>
          )}
          <span
            style={{
              fontFamily: FONT.sans,
              fontWeight: 900,
              fontSize: 42,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              color: PAPER.ink,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {Math.round(pct)}%
          </span>
        </div>
      </div>
      <div
        style={{
          position: "relative",
          marginTop: 10,
          height: 14,
          borderRadius: 7,
          background: "#ebebe7",
          boxShadow: `0 0 0 ${5 * glow}px rgba(34,197,94,${0.16 * glow})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${pct}%`,
            borderRadius: 7,
            background: `linear-gradient(90deg, ${ACCENT.green} 0%, #34d672 100%)`,
          }}
        />
      </div>
    </div>
  );
};

const Header = ({ t }: { t: Timeline }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 32,
          top: 76,
          height: 32,
          display: "flex",
          alignItems: "center",
          gap: 14,
          ...revealStyle(frame, t.eyebrow, 14),
        }}
      >
        <Img
          src={staticFile("reserva/img/nexora-logo-white.png")}
          style={{ height: 18, width: (18 * 4544) / 616, filter: "brightness(0)" }}
        />
        <div style={{ width: 1.5, height: 22, background: "#cfcfcb" }} />
        <span
          style={{
            fontFamily: FONT.serif,
            fontStyle: "italic",
            fontSize: 31,
            lineHeight: 1,
            color: PAPER.ink,
            transform: "translateY(1px)",
          }}
        >
          Portal de cliente
        </span>
      </div>

      <div style={{ position: "absolute", left: 30, top: 118, display: "flex", alignItems: "center", gap: 24 }}>
        <span
          style={{
            fontFamily: FONT.sans,
            fontWeight: 700,
            fontSize: 50,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            color: PAPER.ink,
            whiteSpace: "pre",
            ...revealStyle(frame, t.title, 18),
          }}
        >
          Tu app <span style={{ color: "#b5b5b1" }}>·</span> Sprint 2
        </span>
        <div style={{ display: "flex" }}>
          {AVATARS.map((avatar, i) => {
            const s = springAt(frame, t.avatars + i * 3, SPRING.pop);
            return (
              <div
                key={avatar.initials}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  marginLeft: i === 0 ? 0 : -11,
                  background: avatar.bg,
                  border: "3px solid #ffffff",
                  boxSizing: "border-box",
                  color: "#ffffff",
                  fontFamily: FONT.sans,
                  fontWeight: 700,
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `scale(${s})`,
                  opacity: Math.min(1, s * 2),
                }}
              >
                {avatar.initials}
              </div>
            );
          })}
        </div>
      </div>

      <Progress t={t} />

      <div
        style={{
          position: "absolute",
          left: 28,
          right: 28,
          top: 180,
          height: 1,
          background: "#ededea",
          transform: `scaleX(${ease(frame, [t.title, t.title + 20])})`,
          transformOrigin: "left center",
        }}
      />
    </>
  );
};

export default function BrowserWindow({ pose, t }: BrowserWindowProps) {
  if (pose.opacity <= 0.001) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: WINDOW.left,
        top: WINDOW.top,
        width: WINDOW.width,
        height: WINDOW.height,
        opacity: pose.opacity,
        transform: `translateY(${pose.dy}px) scale(${pose.scale})`,
        borderRadius: WINDOW.radius,
        background: "#ffffff",
        overflow: "hidden",
        boxShadow: `${SHADOW.lifted}, 0 0 0 1px rgba(0,0,0,0.05)`,
      }}
    >
      <TopBar t={t} />
      <Header t={t} />
    </div>
  );
}
