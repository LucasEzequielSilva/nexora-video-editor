import Sfx from "../../components/sfx";
import { typedChars } from "./browser-window";
import type { Timeline } from "./timing";

type SoundDesignProps = { t: Timeline };

const keyFrames = (t: Timeline): number[] => {
  const frames: number[] = [];
  let last = 0;
  for (let frame = t.urlStart; frame <= t.urlStart + t.urlFrames; frame++) {
    const typed = typedChars(frame, t);
    if (typed - last >= 3) {
      frames.push(frame);
      last = typed;
    }
  }
  return frames;
};

export default function SoundDesign({ t }: SoundDesignProps) {
  return (
    <>
      {t.drops.map((drop) => (
        <Sfx key={`clip-${drop}`} name="click" at={drop + 6} volume={0.24} />
      ))}
      <Sfx name="whoosh-short" at={t.monitor + 8} volume={0.18} />
      {keyFrames(t).map((frame) => (
        <Sfx key={`key-${frame}`} name="key" at={frame} volume={0.1} />
      ))}
      <Sfx name="swoosh-tiny" at={t.cardsStart} volume={0.14} />
      {t.drags.map((drag) => (
        <Sfx key={`drop-${drag.id}`} name="click" at={drag.drop} volume={0.26} />
      ))}
      <Sfx name="pop" at={t.reuniones} volume={0.28} />
      <Sfx name="counter" at={t.objectives - 3} volume={0.12} maxFrames={t.fillEnd - t.objectives + 4} />
      <Sfx name="pop" at={t.check + 2} volume={0.2} />
    </>
  );
}
