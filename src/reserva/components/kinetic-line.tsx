import type { CSSProperties } from "react";
import { useCurrentFrame } from "remotion";
import { ease } from "../motion";
import { FONT, PAPER } from "../theme";

export type KineticPart = {
  text: string;
  /** serif = itálica chica editorial | sans = bold grande */
  font: "serif" | "sans";
  /** Frame local donde aparece la primera palabra de esta parte. */
  at: number;
  /** Tamaño en px. Default: serif = size * 0.6, sans = size. */
  size?: number;
  color?: string;
  /** Caja negra detrás con texto blanco (como los resaltados del pin de referencia). */
  highlight?: boolean;
};

type KineticLineProps = {
  parts: KineticPart[];
  /** Tamaño base de la parte sans. */
  size?: number;
  align?: "left" | "center" | "right";
  /** Frames entre palabra y palabra dentro de una parte. */
  stagger?: number;
  style?: CSSProperties;
};

const Word = ({ text, at, part, size }: { text: string; at: number; part: KineticPart; size: number }) => {
  const frame = useCurrentFrame();
  const t = ease(frame, [at, at + 12]);
  const box = ease(frame, [at, at + 9]);
  const isSerif = part.font === "serif";
  const fontSize = part.size ?? (isSerif ? size * 0.6 : size);

  const textStyle: CSSProperties = {
    fontFamily: isSerif ? FONT.serif : FONT.display,
    fontStyle: isSerif ? "italic" : "normal",
    fontWeight: isSerif ? 400 : 700,
    fontSize,
    lineHeight: 1,
    letterSpacing: isSerif ? "-0.01em" : "-0.035em",
    color: part.highlight ? "#ffffff" : (part.color ?? PAPER.ink),
    opacity: t,
    transform: `translateY(${(1 - t) * fontSize * 0.25}px)`,
    filter: `blur(${(1 - t) * 8}px)`,
    display: "inline-block",
    position: "relative",
    whiteSpace: "pre",
  };

  if (!part.highlight) return <span style={textStyle}>{text}</span>;

  return (
    <span style={{ position: "relative", display: "inline-block", padding: `0 ${fontSize * 0.14}px` }}>
      <span
        style={{
          position: "absolute",
          inset: `${fontSize * 0.02}px 0 ${-fontSize * 0.1}px 0`,
          background: PAPER.ink,
          transform: `scaleX(${box})`,
          transformOrigin: "left center",
        }}
      />
      <span style={textStyle}>{text}</span>
    </span>
  );
};

/** Línea tipográfica editorial: mezcla serif itálica + sans bold, palabra por palabra. */
export default function KineticLine({ parts, size = 96, align = "center", stagger = 2, style }: KineticLineProps) {
  const justify = align === "center" ? "center" : align === "left" ? "flex-start" : "flex-end";
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "baseline",
        justifyContent: justify,
        columnGap: size * 0.22,
        rowGap: size * 0.08,
        ...style,
      }}
    >
      {parts.flatMap((part, partIndex) =>
        part.text
          .split(" ")
          .filter(Boolean)
          .map((word, wordIndex) => (
            <Word key={`${partIndex}-${wordIndex}`} text={word} at={part.at + wordIndex * stagger} part={part} size={size} />
          )),
      )}
    </div>
  );
}
