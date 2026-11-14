import type React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BordeArcoiris, Cursor, DirBlur, Fondo, Telefono, usePop } from "../comun";
import { archivo, CELESTE, clamp, F_TEXTO, recorrido, salida, suave, VERDE } from "../tema";

const ANCHO_TEL = 260;
const ALTO_TEL = ANCHO_TEL * 2.165;
const GX = 50;
const GY = 50;
const COLS = 5;
const W = COLS * ANCHO_TEL + (COLS - 1) * GX;

const FILAS = [
  ["ui-habits", "ui-fitcrush-explorar", "ui-minga-mangas", "ui-broker-dashboard", "ui-pets"],
  ["ui-futhub-home", "ui-broker-proyecto", "ui-propmatch-welcome", "ui-futhub-partido", "ui-fitcrush-onboarding"],
  ["ui-propmatch-feed", "ui-voice", "ui-broker-listing", "ui-minga-author", "ui-futhub-home"],
  ["ui-pets", "ui-broker-dashboard", "ui-fitcrush-onboarding", "ui-minga-mangas", "ui-broker-proyecto"],
  ["ui-futhub-partido", "ui-habits", "ui-propmatch-feed", "ui-voice", "ui-broker-listing"],
];
const OBJ = { c: 2, r: 1 };
const centroY = (r: number) => r * (ALTO_TEL + GY) + ALTO_TEL / 2;
const FY_FIN = centroY(OBJ.r);
const FY_INI = centroY(4) - 40;

const Esqueleto: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      borderRadius: ANCHO_TEL * 0.15,
      background: "#17171b",
      boxShadow: "0 0 0 1.5px rgba(255,255,255,0.1)",
      padding: 26,
      display: "flex",
      flexDirection: "column",
      gap: 16,
      paddingTop: 70,
    }}
  >
    {[0.7, 0.45, 1, 1, 0.6, 1, 0.8].map((w, i) => (
      <div key={i} style={{ width: `${w * 100}%`, height: i === 2 || i === 3 ? 90 : 16, borderRadius: 10, background: "rgba(255,255,255,0.07)" }} />
    ))}
  </div>
);

const Slot: React.FC<{ src: string; arma: number; esObjetivo: boolean; desvanece: number }> = ({ src, arma, esObjetivo, desvanece }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - arma, fps, config: { damping: 14, stiffness: 200, mass: 0.6 } });
  const op = interpolate(frame - arma, [0, 5], [0, 1], clamp);
  return (
    <div style={{ position: "relative", width: ANCHO_TEL, height: ALTO_TEL, opacity: esObjetivo ? 1 : 1 - desvanece }}>
      <Esqueleto />
      {frame >= arma ? (
        <div style={{ position: "absolute", inset: 0, opacity: op, transform: `scale(${0.88 + 0.12 * s})` }}>
          <Telefono src={archivo(`img/${src}.png`)} ancho={ANCHO_TEL} sombra={false} />
        </div>
      ) : null}
    </div>
  );
};

const plano = (f: number) => {
  const fy = interpolate(f, [0, 100], [FY_INI, FY_FIN], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const giro = interpolate(f, [94, 126], [0, 1], { ...clamp, easing: suave });
  const rx = 62 * (1 - giro);
  const sc = 0.92 + giro * 0.44 + interpolate(f, [126, 172], [0, 0.04], clamp);
  const yc = 560 - giro * 112;
  return { fy, rx, sc, yc, giro };
};

export const Armado: React.FC = () => {
  const frame = useCurrentFrame();
  const p = plano(frame);
  const prev = plano(frame - 1);
  const vel = Math.abs(p.fy - prev.fy) * Math.cos((p.rx * Math.PI) / 180) * p.sc;
  const entra = interpolate(frame, [0, 4], [0, 1], clamp);
  const desvanece = interpolate(frame, [98, 120], [0, 1], clamp);

  const boton = usePop(118, { damping: 13, stiffness: 220, mass: 0.6 });
  const presion = interpolate(frame, [137, 140, 145], [0, 1, 0], clamp);
  const botonSale = interpolate(frame, [145, 151], [0, 1], clamp);
  const chip = usePop(147, { damping: 12, stiffness: 220, mass: 0.6 });

  const cur = recorrido(
    frame,
    [
      { f: 120, x: 1560, y: 1180 },
      { f: 137, x: 1010, y: 918 },
      { f: 146, x: 1010, y: 918 },
      { f: 170, x: 1180, y: 990 },
    ],
    salida,
  );

  return (
    <AbsoluteFill>
      <Fondo tipo="chat" />
      <DirBlur y={Math.min(34, vel * 0.32)} style={{ opacity: entra }}>
        <AbsoluteFill style={{ perspective: 1500, perspectiveOrigin: `960px ${p.yc - 120}px` }}>
          <div
            style={{
              position: "absolute",
              left: 960 - W / 2,
              top: p.yc - p.fy,
              width: W,
              transformOrigin: `${W / 2}px ${p.fy}px`,
              transform: `scale(${p.sc}) rotateX(${p.rx}deg)`,
              transformStyle: "preserve-3d",
              display: "flex",
              flexDirection: "column",
              gap: GY,
            }}
          >
            {FILAS.map((fila, r) => {
              const d = centroY(r) - p.fy;
              const oculto = (p.rx > 15 && d > 950) || (desvanece >= 1 && r !== OBJ.r);
              return (
                <div key={r} style={{ display: "flex", gap: GX, height: ALTO_TEL, visibility: oculto ? "hidden" : "visible" }}>
                  {fila.map((src, c) => (
                    <Slot
                      key={c}
                      src={src}
                      arma={2 + (4 - r) * 12 + c * 2}
                      esObjetivo={r === OBJ.r && c === OBJ.c}
                      desvanece={desvanece}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      </DirBlur>

      {boton.visible ? (
        <div
          style={{
            position: "absolute",
            left: 960,
            top: 912,
            transform: `translate(-50%, -50%) scale(${(0.4 + 0.6 * boton.s) * (1 - presion * 0.08) * (1 - botonSale * 0.25)})`,
            opacity: boton.op * (1 - botonSale),
          }}
        >
          <BordeArcoiris radio={40} grosor={3} halo={0.35} relleno="#0b0b0d">
            <div style={{ padding: "18px 44px", fontFamily: F_TEXTO, fontWeight: 600, fontSize: 36, color: "white", display: "flex", gap: 16, alignItems: "center" }}>
              Publicar
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </div>
          </BordeArcoiris>
        </div>
      ) : null}

      {chip.visible ? (
        <div
          style={{
            position: "absolute",
            left: 960,
            top: 912,
            transform: `translate(-50%, -50%) scale(${0.5 + 0.5 * chip.s})`,
            opacity: chip.op,
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "16px 34px 16px 18px",
            borderRadius: 999,
            background: "rgba(74,222,128,0.12)",
            boxShadow: "0 0 0 1.5px rgba(74,222,128,0.55), 0 0 40px rgba(74,222,128,0.18)",
            fontFamily: F_TEXTO,
            fontWeight: 500,
            fontSize: 32,
            color: "white",
            whiteSpace: "nowrap",
          }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 99, background: VERDE, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0C0C0E" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </div>
          Publicada en App Store y Google Play
        </div>
      ) : null}

      {frame >= 120 ? <Cursor x={cur.x} y={cur.y} color={CELESTE} clicks={[140]} /> : null}
    </AbsoluteFill>
  );
};
