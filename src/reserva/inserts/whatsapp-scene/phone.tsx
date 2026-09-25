import { CheckCheck, ChevronLeft, Mic, Phone as PhoneIcon, SendHorizontal, Video } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { ease, springAt } from "../../motion";
import { ACCENT, FONT, PAPER, SHADOW, SPRING } from "../../theme";

export type PhoneTimeline = {
  incomingTypingFrom: number;
  firstBubble: number;
  secondBubble: number;
  typingFrom: number;
  sent: number;
  read: number;
};

const REPLY = "¡Sí, confirmo!";
const CHAT_BG = "#EFEAE2";
const READ_BLUE = "#53BDEB";
const WA_TEXT = "#111B21";
const WA_MUTED = "#667781";

const popStyle = (frame: number, at: number, origin: string): CSSProperties => {
  const s = springAt(frame, at, SPRING.pop);
  return {
    opacity: ease(frame, [at, at + 5]),
    transform: `scale(${0.55 + 0.45 * s})`,
    transformOrigin: origin,
  };
};

const Bubble = ({
  at,
  side,
  children,
  meta,
}: {
  at: number;
  side: "in" | "out";
  children: ReactNode;
  meta: ReactNode;
}) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const incoming = side === "in";
  return (
    <div
      style={{
        alignSelf: incoming ? "flex-start" : "flex-end",
        maxWidth: 372,
        background: incoming ? "#ffffff" : ACCENT.whatsappBubble,
        borderRadius: 18,
        borderTopLeftRadius: incoming ? 4 : 18,
        borderTopRightRadius: incoming ? 18 : 4,
        padding: "12px 16px 8px",
        boxShadow: "0 1px 1.5px rgba(11,20,26,0.13)",
        fontFamily: FONT.sans,
        fontWeight: 500,
        fontSize: 28,
        lineHeight: 1.28,
        letterSpacing: "-0.01em",
        color: WA_TEXT,
        ...popStyle(frame, at, incoming ? "0% 0%" : "100% 0%"),
      }}
    >
      {children}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 4,
          marginTop: 2,
          fontSize: 16,
          fontWeight: 500,
          color: WA_MUTED,
        }}
      >
        {meta}
      </div>
    </div>
  );
};

const TypingDots = ({ from, to, side }: { from: number; to: number; side: "in" | "out" }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return null;
  return (
    <div
      style={{
        alignSelf: side === "in" ? "flex-start" : "flex-end",
        background: side === "in" ? "#ffffff" : ACCENT.whatsappBubble,
        borderRadius: 18,
        borderTopLeftRadius: side === "in" ? 4 : 18,
        padding: "16px 20px",
        display: "flex",
        gap: 7,
        boxShadow: "0 1px 1.5px rgba(11,20,26,0.13)",
        ...popStyle(frame, from, side === "in" ? "0% 0%" : "100% 0%"),
      }}
    >
      {[0, 1, 2].map((i) => {
        const phase = Math.sin((frame - from) / 3.2 - i * 0.9);
        return (
          <div
            key={i}
            style={{
              width: 11,
              height: 11,
              borderRadius: 99,
              background: "#8696A0",
              opacity: 0.45 + 0.55 * Math.max(0, phase),
              transform: `translateY(${-Math.max(0, phase) * 5}px)`,
            }}
          />
        );
      })}
    </div>
  );
};

export default function Phone({ t }: { t: PhoneTimeline }) {
  const frame = useCurrentFrame();
  const typing = frame >= t.incomingTypingFrom && frame < t.firstBubble;
  const typedChars = frame >= t.sent ? 0 : Math.max(0, Math.min(REPLY.length, Math.floor((frame - t.typingFrom) * 0.95)));
  const draft = REPLY.slice(0, typedChars);
  const read = frame >= t.read;
  const readMix = ease(frame, [t.read, t.read + 4]);

  return (
    <div
      style={{
        width: 480,
        height: 870,
        borderRadius: 48,
        background: PAPER.card,
        boxShadow: SHADOW.lifted,
        padding: 10,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 38,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          background: CHAT_BG,
          border: "1px solid rgba(0,0,0,0.06)",
          boxSizing: "border-box",
        }}
      >
        <div style={{ background: "#ffffff", padding: "14px 26px 0" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontFamily: FONT.sans,
              fontWeight: 700,
              fontSize: 18,
              color: WA_TEXT,
            }}
          >
            <span>18:02</span>
            <div style={{ width: 90, height: 22, borderRadius: 99, background: PAPER.ink }} />
            <div style={{ width: 30, height: 14, borderRadius: 4, border: `2px solid ${WA_TEXT}`, padding: 2, boxSizing: "border-box" }}>
              <div style={{ width: "75%", height: "100%", borderRadius: 1, background: WA_TEXT }} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 0 14px" }}>
            <ChevronLeft size={30} color={WA_TEXT} strokeWidth={2.4} style={{ marginLeft: -8 }} />
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 99,
                background: PAPER.ink,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Img src={staticFile("reserva/img/nexora-logo-white.png")} style={{ width: 44 }} />
            </div>
            <div style={{ flex: 1, marginLeft: 4 }}>
              <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 26, color: WA_TEXT, letterSpacing: "-0.02em" }}>
                Nexora
              </div>
              <div
                style={{
                  fontFamily: FONT.sans,
                  fontWeight: 500,
                  fontSize: 17,
                  color: typing ? ACCENT.greenDark : WA_MUTED,
                  marginTop: 2,
                }}
              >
                {typing ? "escribiendo…" : "en línea"}
              </div>
            </div>
            <Video size={28} color={WA_TEXT} strokeWidth={2} />
            <PhoneIcon size={24} color={WA_TEXT} strokeWidth={2} style={{ marginLeft: 16 }} />
          </div>
        </div>

        <div
          style={{
            flex: 1,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            padding: "18px 18px",
            backgroundImage: "radial-gradient(rgba(84,72,50,0.10) 1.4px, transparent 1.6px)",
            backgroundSize: "26px 26px",
          }}
        >
          <div
            style={{
              alignSelf: "center",
              background: "#ffffff",
              borderRadius: 10,
              padding: "5px 14px",
              fontFamily: FONT.sans,
              fontWeight: 700,
              fontSize: 15,
              letterSpacing: "0.04em",
              color: WA_MUTED,
              boxShadow: "0 1px 1px rgba(11,20,26,0.08)",
              marginBottom: 6,
            }}
          >
            HOY
          </div>

          <TypingDots from={t.incomingTypingFrom} to={t.firstBubble} side="in" />
          <Bubble at={t.firstBubble} side="in" meta="18:03">
            ¡Hola! Somos <b style={{ fontWeight: 700 }}>Nexora</b>. Recibimos tu reserva para el jueves a las 18 hs.
          </Bubble>
          <Bubble at={t.secondBubble} side="in" meta="18:03">
            ¿Nos confirmás respondiendo este mensaje?
          </Bubble>
          <Bubble
            at={t.sent}
            side="out"
            meta={
              <>
                18:04
                <span style={{ position: "relative", display: "inline-flex", width: 20, height: 20 }}>
                  <CheckCheck size={20} color={WA_MUTED} strokeWidth={2.4} style={{ position: "absolute", opacity: 1 - readMix }} />
                  {read && (
                    <CheckCheck size={20} color={READ_BLUE} strokeWidth={2.4} style={{ position: "absolute", opacity: readMix }} />
                  )}
                </span>
              </>
            }
          >
            <span style={{ fontWeight: 700 }}>{REPLY}</span>
          </Bubble>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px 18px", background: CHAT_BG }}>
          <div
            style={{
              flex: 1,
              height: 58,
              borderRadius: 99,
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              padding: "0 22px",
              fontFamily: FONT.sans,
              fontWeight: draft ? 600 : 500,
              fontSize: 23,
              color: draft ? WA_TEXT : "#8696A0",
              boxShadow: "0 1px 1px rgba(11,20,26,0.08)",
            }}
          >
            {draft || "Mensaje"}
            {draft && frame % 16 < 9 && (
              <span style={{ width: 2.5, height: 28, background: ACCENT.whatsapp, marginLeft: 3 }} />
            )}
          </div>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 99,
              background: ACCENT.whatsapp,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${frame >= t.sent - 2 && frame < t.sent + 4 ? 0.9 : 1})`,
            }}
          >
            {draft ? <SendHorizontal size={26} color="#fff" strokeWidth={2.4} /> : <Mic size={26} color="#fff" strokeWidth={2.4} />}
          </div>
        </div>
      </div>
    </div>
  );
}
