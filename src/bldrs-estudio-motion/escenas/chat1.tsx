import type React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { AvatarBldrs, Burbuja, DirBlur, Fondo, Puntos } from "../comun";
import { clamp, salida, suave } from "../tema";

type Cam = { f: number; cx: number; cy: number; s: number };

const CAMARA: Cam[] = [
  { f: 0, cx: 700, cy: 410, s: 1.62 },
  { f: 26, cx: 708, cy: 418, s: 1.55 },
  { f: 46, cx: 800, cy: 486, s: 1.34 },
  { f: 78, cx: 860, cy: 538, s: 1.17 },
  { f: 112, cx: 900, cy: 548, s: 1.1 },
  { f: 130, cx: 2150, cy: 540, s: 1.16 },
  { f: 206, cx: 2160, cy: 540, s: 1.3 },
  { f: 231, cx: 2085, cy: 540, s: 3.6 },
];

const camara = (f: number) => {
  const k = CAMARA;
  if (f <= k[0].f) return k[0];
  for (let i = 0; i < k.length - 1; i++) {
    if (f <= k[i + 1].f) {
      const a = k[i];
      const b = k[i + 1];
      const ease = i === k.length - 2 ? (t: number) => t * t * t : i === 4 ? suave : salida;
      const p = ease((f - a.f) / (b.f - a.f));
      return { f, cx: a.cx + (b.cx - a.cx) * p, cy: a.cy + (b.cy - a.cy) * p, s: a.s + (b.s - a.s) * p };
    }
  }
  return k[k.length - 1];
};

const NECESITO = "Necesito una app";

export const Chat1: React.FC = () => {
  const frame = useCurrentFrame();
  const c = camara(frame);
  const prev = camara(frame - 1);
  const vx = Math.abs(c.cx - prev.cx) * c.s;
  const zoomBlur = interpolate(frame, [216, 231], [0, 16], clamp);
  const letras = Math.max(0, Math.min(NECESITO.length, Math.floor((frame - 44) / 1.4)));
  const t1 = 66;
  const tPropio = 110;
  const salidaDots = interpolate(frame, [142, 146], [1, 0], clamp);

  return (
    <AbsoluteFill>
      <Fondo tipo="chat" />
      <DirBlur x={Math.min(60, vx * 0.5)}>
        <AbsoluteFill style={{ filter: zoomBlur > 0.3 ? `blur(${zoomBlur}px)` : undefined }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 1920,
              height: 1080,
              transformOrigin: "0 0",
              transform: `translate(${960 - c.cx * c.s}px, ${540 - c.cy * c.s}px) scale(${c.s})`,
            }}
          >
            <div style={{ position: "absolute", left: 560, top: 330 }}>
              <Burbuja lado="cliente" tamano={t1} entra={2}>
                Hola
              </Burbuja>
            </div>
            <div style={{ position: "absolute", left: 560, top: 480 }}>
              {frame < 44 ? (
                <Burbuja lado="cliente" tamano={t1} entra={29}>
                  <Puntos tamano={t1 * 0.9} />
                </Burbuja>
              ) : (
                <Burbuja lado="cliente" tamano={t1} entra={42}>
                  {NECESITO.slice(0, Math.max(1, letras))}
                </Burbuja>
              )}
            </div>
            <div style={{ position: "absolute", left: 560, top: 630 }}>
              <Burbuja lado="cliente" tamano={t1} entra={86}>
                ¿Cuánto tarda?
              </Burbuja>
            </div>

            <div style={{ position: "absolute", right: 1920 - 2400, top: 540 - tPropio * 0.98 }}>
              {frame < 146 ? (
                <Burbuja lado="propio" tamano={tPropio} entra={124} style={{ opacity: salidaDots }}>
                  <Puntos tamano={tPropio * 0.9} />
                </Burbuja>
              ) : null}
            </div>
            <div style={{ position: "absolute", right: 1920 - 2400, top: 540 - tPropio * 0.98 }}>
              <Burbuja lado="propio" tamano={tPropio} entra={144} halo={0.3}>
                30 días.
              </Burbuja>
            </div>
            <div style={{ position: "absolute", left: 2432, top: 540 - 10 }}>
              <AvatarBldrs tamano={118} entra={120} />
            </div>
          </div>
        </AbsoluteFill>
      </DirBlur>
    </AbsoluteFill>
  );
};
