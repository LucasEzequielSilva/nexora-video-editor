import type { CSSProperties } from "react";
import { useCurrentFrame } from "remotion";
import { ease } from "../motion";
import { ACCENT, FONT, PAPER } from "../theme";

export type StrikeWord = {
  text: string;
  /** Frame local donde aparece la palabra. */
  at: number;
  /** Frames después de `at` en que arranca el tachado. Default 14 (primero se lee, después se cruza). */
  strikeDelay?: number;
};

type StrikeTextProps = {
  words: StrikeWord[];
  size?: number;
  align?: "left" | "center" | "right";
  color?: string;
  strikeColor?: string;
  style?: CSSProperties;
};

const Word = ({
  word,
  size,
  color,
  strikeColor,
}: {
  word: StrikeWord;
  size: number;
  color: string;
  strikeColor: string;
}) => {
  const frame = useCurrentFrame();
  const appear = ease(frame, [word.at, word.at + 12]);
  const strikeStart = word.at + (word.strikeDelay ?? 14);
  const strike = ease(frame, [strikeStart, strikeStart + 8]);

  const textStyle: CSSProperties = {
    fontFamily: FONT.display,
    fontWeight: 700,
    fontSize: size,
    lineHeight: 1,
    letterSpacing: "-0.03em",
    color,
    opacity: appear,
    transform: `translateY(${(1 - appear) * size * 0.25}px)`,
    filter: `blur(${(1 - appear) * 8}px)`,
    whiteSpace: "pre",
  };

  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span style={textStyle}>{word.text}</span>
      <span
        style={{
          position: "absolute",
          left: -size * 0.04,
          right: -size * 0.04,
          top: "50%",
          height: Math.max(3, size * 0.05),
          background: strikeColor,
          borderRadius: 999,
          transform: `translateY(-50%) rotate(-6deg) scaleX(${strike})`,
          transformOrigin: "left center",
          boxShadow: `0 0 ${size * 0.12}px ${strikeColor}66`,
          opacity: appear,
        }}
      />
    </span>
  );
};

/**
 * Tachado retórico ("a lo Jacob", ver CLAUDE.md §5): la palabra aparece y después
 * se cruza con una línea diagonal, para mostrar "esto ya no aplica".
 * Suelto — se posiciona como overlay dentro de cualquier insert o escena.
 */
export default function StrikeText({
  words,
  size = 72,
  align = "center",
  color = PAPER.ink,
  strikeColor = ACCENT.red,
  style,
}: StrikeTextProps) {
  const justify = align === "center" ? "center" : align === "left" ? "flex-start" : "flex-end";
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "baseline",
        justifyContent: justify,
        columnGap: size * 0.3,
        rowGap: size * 0.1,
        ...style,
      }}
    >
      {words.map((word, i) => (
        <Word key={i} word={word} size={size} color={color} strikeColor={strikeColor} />
      ))}
    </div>
  );
}
