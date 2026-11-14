import type React from "react";
import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BordeArcoiris, Burbuja, Cursor, Fondo, Puntos, usePop } from "../comun";
import { archivo, CELESTE, clamp, F_TEXTO, recorrido, salida } from "../tema";

const TAM = 44;
const H = 86;
const GAP = 20;
const IZQ = 470;
const DER = 1450;
const BASE = 892;

type Msg = {
  lado: "cliente" | "propio";
  texto?: string;
  aparece: number;
  escribe?: number;
  alto: number;
  tarjeta?: boolean;
};

const MENSAJES: Msg[] = [
  { lado: "cliente", texto: "Hola", aparece: -100, alto: H },
  { lado: "cliente", texto: "Necesito una app", aparece: -100, alto: H },
  { lado: "cliente", texto: "¿Cuánto tarda?", aparece: -100, alto: H },
  { lado: "propio", texto: "30 días.", aparece: -100, alto: H },
  { lado: "propio", texto: "Lista. Ya está publicada.", aparece: 44, alto: 372, tarjeta: true },
  { lado: "cliente", texto: "¿Y después quién la mantiene?", aparece: 76, escribe: 90, alto: H },
  { lado: "propio", texto: "Abono mensual opcional: USD 150 a 400.", aparece: 106, escribe: 120, alto: H },
  { lado: "cliente", texto: "Dale, arranquemos.", aparece: 146, alto: H },
  { lado: "propio", aparece: 160, alto: H },
];

const ESCRITO = "Lista. Ya está publicada.";

const Tarjeta: React.FC<{ entra: number }> = ({ entra }) => {
  const { s, visible, op } = usePop(entra, { damping: 13, stiffness: 210, mass: 0.7 });
  const corazon = usePop(entra + 18, { damping: 9, stiffness: 220, mass: 0.6 });
  if (!visible) return null;
  return (
    <div style={{ position: "relative", transform: `scale(${0.3 + 0.7 * s})`, transformOrigin: "100% 100%", opacity: op }}>
      <BordeArcoiris radio={36} grosor={2.5} halo={0.2} relleno="#131317">
        <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14, width: 560 }}>
          <div style={{ fontFamily: F_TEXTO, fontWeight: 500, fontSize: TAM, color: "white", padding: "4px 10px 0", whiteSpace: "nowrap" }}>{ESCRITO}</div>
          <div style={{ borderRadius: 22, overflow: "hidden", background: "#0b0b0d", boxShadow: "0 0 0 1px rgba(255,255,255,0.1)" }}>
            <Img src={archivo("img/ui-propmatch-welcome.png")} style={{ width: "100%", height: 190, objectFit: "cover", objectPosition: "center 66%", display: "block" }} />
            <div style={{ padding: "14px 18px 16px", fontFamily: F_TEXTO, fontSize: 24, color: "rgba(255,255,255,0.72)", fontWeight: 500, whiteSpace: "nowrap" }}>
              Publicada · App Store y Google Play
            </div>
          </div>
        </div>
      </BordeArcoiris>
      {corazon.visible ? (
        <Img
          src={archivo("img/sticker-heart.png")}
          style={{
            position: "absolute",
            left: -48,
            top: -44,
            width: 104,
            height: 104,
            transform: `scale(${corazon.s}) rotate(${(1 - corazon.s) * -40 - 12}deg)`,
            opacity: corazon.op,
            filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.5))",
          }}
        />
      ) : null}
    </div>
  );
};

export const Chat2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = interpolate(frame, [0, 9], [0, 1], { ...clamp, easing: salida });
  const sp = (f: number) => (f < -50 ? 1 : spring({ frame: frame - f, fps, config: { damping: 18, stiffness: 170, mass: 0.8 } }));

  const zoom = interpolate(frame, [168, 189], [0, 1], { ...clamp, easing: (t) => t * t * t });
  const zx = DER - 90;
  const zy = BASE - H / 2;
  const escala = (1 + interpolate(frame, [0, 168], [0, 0.04], clamp)) * (1 + zoom * 2.6);

  const letras = Math.max(0, Math.min(ESCRITO.length, Math.floor((frame - 16) / 1)));
  const enviado = frame >= 42;
  const barra = usePop(3, { damping: 16, stiffness: 200, mass: 0.7 });
  const cur = recorrido(
    frame,
    [
      { f: 4, x: 1500, y: 1140 },
      { f: 13, x: 900, y: 978 },
      { f: 30, x: 1060, y: 1010 },
      { f: 40, x: 1392, y: 972 },
      { f: 60, x: 1560, y: 1120 },
    ],
    salida,
  );

  return (
    <AbsoluteFill>
      <Fondo tipo="chat" />
      <AbsoluteFill
        style={{
          transformOrigin: `${zx}px ${zy}px`,
          transform: `scale(${escala * (1.06 - 0.06 * entra)})`,
          filter: zoom > 0.05 ? `blur(${zoom * 14}px)` : entra < 1 ? `blur(${(1 - entra) * 10}px)` : undefined,
          opacity: entra,
        }}
      >
        {MENSAJES.map((m, i) => {
          let bottom = BASE;
          for (let j = i + 1; j < MENSAJES.length; j++) bottom -= (MENSAJES[j].alto + GAP) * sp(MENSAJES[j].aparece);
          if (frame < m.aparece) return null;
          const top = bottom - m.alto;
          const conPuntos = m.texto === undefined || (m.escribe !== undefined && frame < m.escribe);
          const pos: React.CSSProperties =
            m.lado === "cliente" ? { position: "absolute", left: IZQ, top } : { position: "absolute", right: 1920 - DER, top };
          if (m.tarjeta) {
            return (
              <div key={i} style={pos}>
                <Tarjeta entra={m.aparece} />
              </div>
            );
          }
          return (
            <div key={i} style={pos}>
              {conPuntos ? (
                <Burbuja lado={m.lado} tamano={TAM} entra={m.aparece} halo={i === MENSAJES.length - 1 ? 0.45 : 0.18}>
                  <Puntos tamano={TAM * 0.9} />
                </Burbuja>
              ) : (
                <Burbuja lado={m.lado} tamano={TAM} entra={m.escribe ?? m.aparece} halo={0.18}>
                  {m.texto}
                </Burbuja>
              )}
            </div>
          );
        })}

        {barra.visible ? (
          <div
            style={{
              position: "absolute",
              left: IZQ,
              top: 936,
              width: DER - IZQ,
              height: 84,
              borderRadius: 42,
              background: "rgba(255,255,255,0.06)",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
              transform: `translateY(${(1 - barra.s) * 120}px)`,
              opacity: barra.op,
              display: "flex",
              alignItems: "center",
              padding: "0 14px",
              gap: 18,
            }}
          >
            <div style={{ width: 56, height: 56, borderRadius: 99, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.7)", fontSize: 34, fontFamily: F_TEXTO }}>
              +
            </div>
            <div style={{ flex: 1, fontFamily: F_TEXTO, fontSize: 34, fontWeight: 500, color: "white", display: "flex", alignItems: "center" }}>
              {!enviado && frame >= 16 ? ESCRITO.slice(0, letras) : ""}
              {frame >= 12 && !enviado && Math.floor(frame / 8) % 2 === 0 ? (
                <span style={{ width: 3, height: 38, background: CELESTE, marginLeft: 3, display: "inline-block" }} />
              ) : null}
            </div>
            <div style={{ width: 56, height: 56, borderRadius: 99, background: CELESTE, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0C0C0E" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </div>
          </div>
        ) : null}

        {frame >= 4 && frame < 66 ? <Cursor x={cur.x} y={cur.y} color={CELESTE} clicks={[13, 41]} /> : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
