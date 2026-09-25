import { AbsoluteFill, useCurrentFrame } from "remotion";
import { CAPTION_KEYWORDS } from "../edit";
import { ease } from "../motion";
import { FONT } from "../theme";
import { TIMED_WORDS, type TimedWord } from "../timeline";

const MAX_WORDS = 3;
const MAX_CHARS = 24;
const GAP_BREAK_FRAMES = 9;
const LINGER_FRAMES = 10;
const SHORT_PAGE_FRAMES = 12;
/** Palabras que no deberían cerrar una página: si caen al final, pasan a la siguiente. */
const CARRY_WORDS = new Set([
  "a", "al", "con", "de", "del", "el", "en", "es", "la", "las", "lo", "los", "nos", "para", "pero",
  "por", "que", "si", "su", "te", "tu", "un", "una", "y", "minuto",
]);

type Page = { words: TimedWord[]; from: number; to: number };

const normalize = (text: string) => text.toLowerCase().replace(/[.,;:¿?¡!"]/g, "");

const buildPages = (): Page[] => {
  const pages: Page[] = [];
  let current: TimedWord[] = [];

  const flush = () => {
    if (current.length === 0) return;
    pages.push({ words: current, from: current[0].from, to: current[current.length - 1].to });
    current = [];
  };

  TIMED_WORDS.forEach((word, i) => {
    const chars = current.reduce((acc, item) => acc + item.text.length + 1, 0) + word.text.length;
    if (current.length >= MAX_WORDS || (current.length > 0 && chars > MAX_CHARS)) {
      const last = current[current.length - 1];
      const carry = current.length > 1 && CARRY_WORDS.has(normalize(last.text)) ? current.pop() : undefined;
      flush();
      if (carry) current.push(carry);
    }
    current.push(word);
    const next = TIMED_WORDS[i + 1];
    const endsSentence = /[.,;:?!]$/.test(word.text);
    const bigGap = next ? next.from - word.to > GAP_BREAK_FRAMES : true;
    if (endsSentence || bigGap) flush();
  });
  flush();

  const merged: Page[] = [];
  for (const page of pages) {
    const prev = merged[merged.length - 1];
    const prevChars = prev ? prev.words.reduce((acc, item) => acc + item.text.length + 1, 0) : 0;
    const pageChars = page.words.reduce((acc, item) => acc + item.text.length + 1, 0);
    const prevIsShort = prev && prev.to - prev.from < SHORT_PAGE_FRAMES && !/[.,;:?!]$/.test(prev.words[prev.words.length - 1].text);
    if (prev && prevIsShort && prev.words.length + page.words.length <= 5 && prevChars + pageChars <= MAX_CHARS + 1) {
      merged[merged.length - 1] = { words: [...prev.words, ...page.words], from: prev.from, to: page.to };
    } else {
      merged.push(page);
    }
  }

  return merged.map((page, i) => {
    const next = merged[i + 1];
    const linger = page.to + LINGER_FRAMES;
    return { ...page, to: next ? Math.min(next.from, linger) : linger };
  });
};

const PAGES = buildPages();

type CaptionsProps = {
  /** 0..1 visibilidad global (se baja durante escenas completas). */
  visibility: number;
};

export default function Captions({ visibility }: CaptionsProps) {
  const frame = useCurrentFrame();
  const page = PAGES.find((p) => frame >= p.from && frame < p.to);
  if (!page || visibility <= 0.001) return null;

  const pageOut = ease(frame, [page.to - 4, page.to], [1, 0]);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: visibility }}>
      <AbsoluteFill
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.12) 22%, transparent 38%)" }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 104,
          display: "flex",
          justifyContent: "center",
          alignItems: "baseline",
          columnGap: 18,
          opacity: pageOut,
        }}
      >
        {page.words.map((word) => {
          const t = ease(frame, [word.from - 1, word.from + 5]);
          const isKeyword = CAPTION_KEYWORDS.has(normalize(word.text));
          const display = word.text.replace(/[,;:]$/, "");
          return (
            <span
              key={word.index}
              style={{
                fontFamily: isKeyword ? FONT.serif : FONT.display,
                fontStyle: isKeyword ? "italic" : "normal",
                fontWeight: isKeyword ? 400 : 700,
                fontSize: isKeyword ? 84 : 64,
                letterSpacing: isKeyword ? "-0.01em" : "-0.03em",
                lineHeight: 1,
                color: "#ffffff",
                textShadow: "0 3px 18px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.4)",
                opacity: t,
                transform: `translateY(${(1 - t) * 16}px)`,
                filter: `blur(${(1 - t) * 8}px)`,
                display: "inline-block",
              }}
            >
              {display}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}
