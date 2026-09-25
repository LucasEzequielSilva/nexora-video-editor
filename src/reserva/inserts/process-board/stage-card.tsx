import { Check, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { lerp } from "../../motion";
import { ACCENT, FONT, PAPER } from "../../theme";
import { LANE, POLAROID, type Point } from "./geometry";

type StageCardProps = {
  center: Point;
  width: number;
  height: number;
  rotation: number;
  scale: number;
  opacity: number;
  /** 0 = polaroid, 1 = columna del tablero (tipografía y márgenes). */
  morph: number;
  /** 1 = foto visible, 0 = foto colapsada. */
  photo: number;
  /** 0 = blanco polaroid, 1 = gris de columna. */
  tint: number;
  /** 1 = sombra de tarjeta, 0 = sin sombra. */
  shadow: number;
  /** Opacidad del contador y del pie "Añadir tarjeta". */
  chrome: number;
  label: string;
  number?: string;
  done?: boolean;
  count: number;
  art?: ReactNode;
};

const mixChannel = (a: number, b: number, t: number) => Math.round(lerp(a, b, t));

export default function StageCard({
  center,
  width,
  height,
  rotation,
  scale,
  opacity,
  morph,
  photo,
  tint,
  shadow,
  chrome,
  label,
  number,
  done,
  count,
  art,
}: StageCardProps) {
  const background = `rgb(${mixChannel(255, 240, tint)}, ${mixChannel(255, 240, tint)}, ${mixChannel(255, 237, tint)})`;
  const captionTop = (POLAROID.pad + POLAROID.photo) * photo;
  const captionHeight = lerp(POLAROID.caption, LANE.header, morph);

  return (
    <div
      style={{
        position: "absolute",
        left: center.x - width / 2,
        top: center.y - height / 2,
        width,
        height,
        opacity,
        transform: `rotate(${rotation}deg) scale(${scale})`,
        borderRadius: lerp(18, LANE.radius, morph),
        background,
        overflow: "hidden",
        boxShadow: `0 2px 4px rgba(0,0,0,${0.06 * shadow}), 0 18px 40px rgba(0,0,0,${0.16 * shadow}), 0 40px 90px rgba(0,0,0,${0.12 * shadow}), inset 0 0 0 1px rgba(0,0,0,${0.04 * tint})`,
      }}
    >
      {art && photo > 0.001 && (
        <div
          style={{
            position: "absolute",
            left: POLAROID.pad,
            top: POLAROID.pad * photo,
            width: POLAROID.w - POLAROID.pad * 2,
            height: POLAROID.photo * photo,
            borderRadius: 8,
            overflow: "hidden",
            opacity: Math.min(1, photo * 1.5),
          }}
        >
          {art}
        </div>
      )}

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: captionTop,
          height: captionHeight,
          display: "flex",
          alignItems: "center",
          gap: lerp(12, 10, morph),
          padding: `0 16px 0 ${lerp(24, 18, morph)}px`,
          boxSizing: "border-box",
        }}
      >
        {number && (
          <span
            style={{
              fontFamily: FONT.serif,
              fontStyle: "italic",
              fontSize: lerp(36, 24, morph),
              lineHeight: 1,
              color: PAPER.muted,
              transform: `translateY(${lerp(2, 1, morph)}px)`,
            }}
          >
            {number}
          </span>
        )}
        {done && (
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              background: ACCENT.green,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Check size={15} strokeWidth={3} color="#ffffff" />
          </div>
        )}
        <span
          style={{
            fontFamily: FONT.sans,
            fontWeight: 700,
            fontSize: lerp(40, 24, morph),
            letterSpacing: "-0.035em",
            lineHeight: 1,
            color: PAPER.ink,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
        <div style={{ flex: 1 }} />
        <div
          style={{
            opacity: chrome,
            minWidth: 30,
            height: 28,
            padding: "0 9px",
            boxSizing: "border-box",
            borderRadius: 14,
            background: "#e2e2de",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONT.sans,
            fontWeight: 700,
            fontSize: 15,
            color: PAPER.inkSoft,
          }}
        >
          {count}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: LANE.footer,
          display: "flex",
          alignItems: "center",
          gap: 8,
          paddingLeft: 18,
          opacity: chrome,
          fontFamily: FONT.sans,
          fontWeight: 500,
          fontSize: 16,
          color: PAPER.muted,
        }}
      >
        <Plus size={16} strokeWidth={2.2} color={PAPER.muted} />
        Añadir tarjeta
      </div>
    </div>
  );
}
