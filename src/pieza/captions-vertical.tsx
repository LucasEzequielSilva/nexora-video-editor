import { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ease } from "../reserva/motion";
import { FONT, FPS } from "../reserva/theme";
import type { Acento, FuenteSubtitulo, RawWord } from "./types";

const MAX_WORDS = 4;
const MAX_CHARS = 26;
const GAP_BREAK_S = 0.35;
const LINGER_FRAMES = 8;
/** Jerarquía de tamaños (patrón juanexplica.ia): la palabra clave crece, las funcionales se achican. */
const SCALE_ACCENT = 1.3;
const SCALE_FUNCTIONAL = 0.74;
/** Palabras funcionales: no cierran una página y se muestran más chicas. */
const FUNCTIONAL = new Set([
  "a", "al", "con", "de", "del", "el", "en", "es", "la", "las", "lo", "los", "nos", "para", "pero",
  "por", "que", "si", "su", "te", "tu", "un", "una", "y", "ni",
]);

const FUENTES: Record<FuenteSubtitulo, { family: string; weight: number; size: number; spacing: string; upper: boolean }> = {
  satoshi: { family: "Satoshi, system-ui, sans-serif", weight: 900, size: 108, spacing: "-0.05em", upper: false },
  "helvetica-heavy": { family: "'Helvetica Neue', Helvetica, Arial, sans-serif", weight: 800, size: 104, spacing: "-0.045em", upper: false },
  "tactic-black": { family: "'Tactic Sans', system-ui, sans-serif", weight: 900, size: 104, spacing: "-0.04em", upper: false },
  bebas: { family: "'Bebas Neue', Impact, sans-serif", weight: 400, size: 140, spacing: "0", upper: true },
};

type CapWord = { text: string; from: number; to: number; accent?: { color?: string } };
type Page = { words: CapWord[]; from: number; to: number };

const normalize = (text: string) => text.toLowerCase().replace(/[.,;:¿?¡!"]/g, "");
const charsOf = (words: CapWord[]) => words.reduce((acc, w) => acc + w.text.length + 1, 0);

const markAccents = (words: CapWord[], acentos: Acento[]) => {
  for (const acento of acentos) {
    const key = normalize(typeof acento === "string" ? acento : acento.palabra);
    const color = typeof acento === "string" ? undefined : acento.color;
    const matches = words.filter((w) => normalize(w.text) === key);
    if (typeof acento === "string" || acento.atMs === undefined) {
      for (const w of matches) w.accent = { color };
    } else if (matches.length > 0) {
      const target = acento.atMs;
      const nearest = matches.reduce((best, w) =>
        Math.abs((w.from / FPS) * 1000 - target) < Math.abs((best.from / FPS) * 1000 - target) ? w : best,
      );
      nearest.accent = { color };
    }
  }
};

const buildPages = (raw: RawWord[], acentos: Acento[]): Page[] => {
  const words: CapWord[] = raw.map((w) => ({
    text: w.word.trim(),
    from: Math.round(w.start * FPS),
    to: Math.max(Math.round(w.end * FPS), Math.round(w.start * FPS) + 3),
  }));
  markAccents(words, acentos);

  const pages: Page[] = [];
  let current: CapWord[] = [];
  const flush = () => {
    if (current.length === 0) return;
    pages.push({ words: current, from: current[0].from, to: current[current.length - 1].to });
    current = [];
  };

  words.forEach((word, i) => {
    if (current.length >= MAX_WORDS || (current.length > 0 && charsOf(current) + word.text.length > MAX_CHARS)) {
      const last = current[current.length - 1];
      const carry = current.length > 1 && FUNCTIONAL.has(normalize(last.text)) ? current.pop() : undefined;
      flush();
      if (carry) current.push(carry);
    }
    current.push(word);
    const next = words[i + 1];
    const endsSentence = /[.,;:?!]$/.test(word.text);
    const bigGap = next ? (next.from - word.to) / FPS > GAP_BREAK_S : true;
    if (endsSentence || bigGap) flush();
  });
  flush();

  return pages.map((page, i) => {
    const next = pages[i + 1];
    return { ...page, to: next ? Math.min(next.from, page.to + LINGER_FRAMES) : page.to + LINGER_FRAMES };
  });
};

type CaptionsProps = {
  words: RawWord[];
  fuente?: FuenteSubtitulo;
  acentos?: Acento[];
  /** Centro vertical del subtítulo, en % del alto. Default 54: sobre el pecho, sin tapar la cara. */
  centroY?: number;
};

/**
 * Subtítulos sin fondo, grandes y centrados (patrón @juanexplica.ia): cada palabra aparece cuando se dice,
 * el tamaño varía por jerarquía (palabra clave grande, funcionales chicas) y las clave van en serif itálica.
 */
export default function CaptionsVertical({ words, fuente = "satoshi", acentos = [], centroY = 54 }: CaptionsProps) {
  const frame = useCurrentFrame();
  const pages = useMemo(() => buildPages(words, acentos), [words, acentos]);
  const page = pages.find((p) => frame >= p.from && frame < p.to);
  if (!page) return null;

  const cfg = FUENTES[fuente];
  const enter = ease(frame, [page.from - 2, page.from + 4]);
  const exit = ease(frame, [page.to - 3, page.to], [1, 0]);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          top: `${centroY}%`,
          display: "flex",
          justifyContent: "center",
          alignItems: "baseline",
          columnGap: "0.2em",
          rowGap: 0,
          flexWrap: "wrap",
          fontSize: cfg.size,
          opacity: Math.min(enter, exit),
          transform: `translateY(calc(-50% + ${(1 - enter) * 14}px))`,
        }}
      >
        {page.words.map((word, i) => {
          const appear = ease(frame, [word.from - 1, word.from + 5]);
          const isAccent = word.accent !== undefined;
          const scale = isAccent ? SCALE_ACCENT : FUNCTIONAL.has(normalize(word.text)) ? SCALE_FUNCTIONAL : 1;
          return (
            <span
              key={`${word.from}-${i}`}
              style={{
                opacity: appear,
                transform: `translateY(${(1 - appear) * 16}px)`,
                filter: `blur(${(1 - appear) * 8}px)`,
                display: "inline-block",
                fontFamily: isAccent ? FONT.serif : cfg.family,
                fontStyle: isAccent ? "italic" : "normal",
                fontWeight: isAccent ? 400 : cfg.weight,
                fontSize: `${scale}em`,
                letterSpacing: isAccent ? "-0.02em" : cfg.spacing,
                textTransform: cfg.upper && !isAccent ? "uppercase" : "none",
                lineHeight: 0.95,
                color: word.accent?.color ?? "#ffffff",
                textShadow: "0 3px 22px rgba(0,0,0,0.6), 0 2px 5px rgba(0,0,0,0.65)",
              }}
            >
              {word.text.replace(/[,;:]$/, "")}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}
