type CursorProps = {
  x: number;
  y: number;
  opacity: number;
  /** 0..1 presionado. */
  press: number;
};

/** Puntero negro con borde blanco; la punta queda en (x, y). */
export default function Cursor({ x, y, opacity, press }: CursorProps) {
  if (opacity <= 0.001) return null;
  return (
    <svg
      width={44}
      height={52}
      viewBox="0 0 44 52"
      style={{
        position: "absolute",
        left: x - 5,
        top: y - 4,
        opacity,
        overflow: "visible",
        transform: `scale(${1 - 0.14 * press})`,
        transformOrigin: "5px 4px",
        filter: "drop-shadow(0 8px 10px rgba(0,0,0,0.28))",
      }}
    >
      <path
        d="M 5 4 L 5 40 L 14 31.5 L 20.5 46 L 27.5 43 L 21 28.5 L 33 28.5 Z"
        fill="#111111"
        stroke="#ffffff"
        strokeWidth={2.6}
        strokeLinejoin="round"
      />
    </svg>
  );
}
