const WIRE = "M 9 26 L 9 56 A 4.5 4.5 0 0 0 18 56 L 18 11 A 7.5 7.5 0 0 0 3 11 L 3 62 A 10.5 10.5 0 0 0 24 62 L 24 24";

type PaperClipProps = {
  /** Centro horizontal del clip. */
  x: number;
  /** Borde superior del alambre. */
  y: number;
  rotation?: number;
  scale?: number;
  opacity?: number;
};

/** Clip de papel metálico; el lazo superior queda ~12px por debajo de `y`. */
export default function PaperClip({ x, y, rotation = 0, scale = 1, opacity = 1 }: PaperClipProps) {
  return (
    <svg
      width={27}
      height={76}
      viewBox="0 0 27 76"
      style={{
        position: "absolute",
        left: x - 13.5,
        top: y,
        overflow: "visible",
        opacity,
        transform: `rotate(${rotation}deg) scale(${scale})`,
        transformOrigin: "13.5px 12px",
        filter: "drop-shadow(0 3px 2px rgba(0,0,0,0.22))",
      }}
    >
      <path d={WIRE} fill="none" stroke="#7b7b77" strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" />
      <path
        d={WIRE}
        fill="none"
        stroke="#ececea"
        strokeWidth={1.1}
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(-0.7 -0.5)"
        opacity={0.85}
      />
    </svg>
  );
}
