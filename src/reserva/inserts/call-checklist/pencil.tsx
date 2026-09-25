type PencilProps = {
  x: number;
  y: number;
  angle: number;
  lift: number;
};

export default function Pencil({ x, y, angle, lift }: PencilProps) {
  const shadowX = 8 + lift * 22;
  const shadowY = 14 + lift * 30;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 0,
        height: 0,
        filter: `drop-shadow(${shadowX}px ${shadowY}px ${10 + lift * 10}px rgba(0,0,0,${0.28 - lift * 0.08}))`,
      }}
    >
      <div style={{ position: "absolute", left: 0, top: 0, transform: `rotate(${angle}deg)`, transformOrigin: "0 0" }}>
        <svg width={372} height={44} viewBox="0 -22 372 44" style={{ position: "absolute", left: 0, top: -22 }}>
          <defs>
            <linearGradient id="pencil-body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFE17A" />
              <stop offset="40%" stopColor="#FACC15" />
              <stop offset="100%" stopColor="#D69E0B" />
            </linearGradient>
            <linearGradient id="pencil-wood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F3D9B1" />
              <stop offset="100%" stopColor="#D9B386" />
            </linearGradient>
            <linearGradient id="pencil-metal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E9E9E6" />
              <stop offset="50%" stopColor="#A9A9A5" />
              <stop offset="100%" stopColor="#7A7A76" />
            </linearGradient>
            <linearGradient id="pencil-eraser" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F9A8C0" />
              <stop offset="100%" stopColor="#E0708F" />
            </linearGradient>
          </defs>
          <path d="M 0 0 L 62 -15 L 62 15 Z" fill="url(#pencil-wood)" />
          <path d="M 0 0 L 15 -4.7 L 15 4.7 Z" fill="#2a2a2a" />
          <path d="M 60 -15 L 310 -15 L 310 15 L 60 15 Q 50 10 60 5 Q 50 0 60 -5 Q 50 -10 60 -15 Z" fill="url(#pencil-body)" />
          <rect x={60} y={-5} width={250} height={2} fill="#B7860B" opacity={0.35} />
          <rect x={60} y={5} width={250} height={2} fill="#B7860B" opacity={0.35} />
          <rect x={306} y={-16} width={28} height={32} fill="url(#pencil-metal)" />
          <rect x={312} y={-16} width={3} height={32} fill="#6f6f6b" opacity={0.5} />
          <rect x={323} y={-16} width={3} height={32} fill="#6f6f6b" opacity={0.5} />
          <path d="M 334 -15 L 358 -15 Q 370 -15 370 0 Q 370 15 358 15 L 334 15 Z" fill="url(#pencil-eraser)" />
        </svg>
      </div>
    </div>
  );
}
