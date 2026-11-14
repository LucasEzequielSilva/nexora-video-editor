import type React from "react";
import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, useCurrentFrame } from "remotion";
import { Burbuja, Fondo, Navegador, Pill, Puntos, Sfx, Telefono } from "../bldrs-estudio-motion/comun";
import { useFuentes } from "../bldrs-estudio-motion/fuentes";
import { ARCOIRIS, BEATS, F_GRANDE, F_TEXTO, FPS, MUSICA_INICIO_S, archivo, clamp, lineal } from "../bldrs-estudio-motion/tema";

// Formato "chat del cliente → montaje" (assets/referencias/reels-motion-2026-11.md, Formato 2: Dd7LoTKSsbT, 19 mil likes)
// con los productos reales de bldrs. Vertical para reels. El chat va en silencio (tensión) y en el remate entra la música
// con un montaje de un plano por golpe y un golpe grave en cada corte.

export const ANCHO_CM = 1080;
export const ALTO_CM = 1920;

const DROP = 292;

type Toma = { src: string; tipo: "tel" | "web"; label: string; golpes: number };
const TOMAS: Toma[] = [
  { src: "img/ui-broker-dashboard.png", tipo: "tel", label: "Modo Martillero", golpes: 2 },
  { src: "img/ui-futhub-home.png", tipo: "tel", label: "Futhub", golpes: 2 },
  { src: "img/proof-elevate.jpg", tipo: "web", label: "Elevate", golpes: 2 },
  { src: "img/ui-propmatch-feed.png", tipo: "tel", label: "PropMatch", golpes: 2 },
  { src: "img/ui-minga-author.png", tipo: "tel", label: "Minga", golpes: 1 },
  { src: "img/ui-fitcrush-onboarding.png", tipo: "tel", label: "FitCrush", golpes: 1 },
  { src: "img/proof-acelerator-app.jpg", tipo: "web", label: "Acelerator", golpes: 1 },
  { src: "img/ui-habits.png", tipo: "tel", label: "Tracker de hábitos", golpes: 1 },
  { src: "img/ui-futhub-partido.png", tipo: "tel", label: "Futhub · partidos", golpes: 1 },
  { src: "img/ui-broker-proyecto.png", tipo: "tel", label: "Ficha de proyecto", golpes: 1 },
  { src: "img/ui-propmatch-welcome.png", tipo: "tel", label: "PropMatch", golpes: 1 },
  { src: "img/ui-fitcrush-explorar.png", tipo: "tel", label: "FitCrush", golpes: 1 },
];

// Cortes en los golpes de la música (BEATS cuenta desde que arranca el tema)
const CORTES: number[] = [];
{
  let b = 0;
  for (const t of TOMAS) {
    CORTES.push(DROP + BEATS[b]);
    b += t.golpes;
  }
  CORTES.push(DROP + BEATS[b]);
}
const CIERRE = CORTES[CORTES.length - 1];
export const DURACION_CM = CIERRE + 96;

type Msj = { f: number; lado: "propio" | "cliente"; texto?: string; puntosHasta?: number };
const CHAT: Msj[] = [
  { f: 12, lado: "propio", texto: "¡Hola! 👋" },
  { f: 34, lado: "propio", texto: "Tu app está lista 🚀" },
  { f: 58, lado: "propio", texto: "🔗 Abrir la demo" },
  { f: 82, lado: "propio", texto: "¿Qué te parece?" },
  { f: 108, lado: "cliente", puntosHasta: 150, texto: "está buena pero…" },
  { f: 178, lado: "cliente", puntosHasta: 236, texto: "LOCOOO 🔥🔥" },
  { f: 254, lado: "cliente", texto: "¿CÓMO LA HICIERON TAN RÁPIDO?" },
];

const Chat: React.FC = () => {
  const f = useCurrentFrame();
  const empuje = interpolate(f, [0, 250], [1, 1.08], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const zoom = interpolate(f, [266, DROP], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const flash = interpolate(f, [DROP - 6, DROP - 1, DROP + 4], [0, 1, 0], clamp);
  const tam = 52;
  return (
    <AbsoluteFill>
      <Fondo tipo="chat" brillo={0.8} />
      <AbsoluteFill
        style={{
          transform: `scale(${empuje * (1 + zoom * 1.4)})`,
          transformOrigin: "30% 72%",
          filter: zoom > 0.05 ? `blur(${zoom * 14}px)` : undefined,
        }}
      >
        {/* Barra del contacto */}
        <div style={{ position: "absolute", left: 60, right: 60, top: 230, display: "flex", alignItems: "center", gap: 24, paddingBottom: 28, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ width: 84, height: 84, borderRadius: 42, display: "grid", placeItems: "center", background: "#2a2a30", fontFamily: F_TEXTO, fontWeight: 600, fontSize: 32, color: "rgba(255,255,255,0.8)" }}>C</div>
          <div>
            <div style={{ fontFamily: F_TEXTO, fontWeight: 700, fontSize: 40, color: "white" }}>Cliente</div>
            <div style={{ fontFamily: F_TEXTO, fontWeight: 500, fontSize: 26, color: f > 100 && f < 240 && (f < 150 || f > 176) ? "#4ade80" : "rgba(255,255,255,0.5)" }}>
              {f > 100 && f < 240 && (f < 150 || f > 176) ? "escribiendo…" : "en línea"}
            </div>
          </div>
        </div>

        {CHAT.map((m, i) => {
          const y = 430 + i * 134;
          const muestraPuntos = m.puntosHasta !== undefined && f < m.puntosHasta;
          return (
            <div key={i} style={{ position: "absolute", top: y, left: m.lado === "cliente" ? 60 : undefined, right: m.lado === "propio" ? 60 : undefined }}>
              {muestraPuntos ? (
                <Burbuja lado="cliente" tamano={tam} entra={m.f}>
                  <Puntos tamano={tam * 0.9} />
                </Burbuja>
              ) : (
                <Burbuja lado={m.lado} tamano={i === CHAT.length - 1 ? 45 : tam} entra={m.puntosHasta ?? m.f}>
                  {m.texto}
                </Burbuja>
              )}
            </div>
          );
        })}
        {/* Barra de escribir */}
        <div style={{ position: "absolute", left: 60, right: 60, top: 1430, height: 96, borderRadius: 48, background: "rgba(255,255,255,0.06)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)", display: "flex", alignItems: "center", padding: "0 40px", fontFamily: F_TEXTO, fontSize: 32, color: "rgba(255,255,255,0.35)" }}>
          Mensaje
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "white", opacity: flash }} />
    </AbsoluteFill>
  );
};

const TomaVista: React.FC<{ t: Toma; i: number; dur: number }> = ({ t, i, dur }) => {
  const f = useCurrentFrame();
  const e = interpolate(f, [0, 7], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const deriva = interpolate(f, [0, dur], [0, 1], clamp);
  const lado = i % 2 ? 1 : -1;
  const color = ARCOIRIS[i % ARCOIRIS.length];
  return (
    <AbsoluteFill>
      <Fondo tipo="negro" brillo={0.6} />
      <AbsoluteFill style={{ background: `radial-gradient(55% 40% at 50% 52%, ${color}40, transparent 70%)` }} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${(1.16 - 0.16 * e) * (1 + deriva * 0.04)}) rotate(${lado * (1 - e) * 4}deg) translateY(${-40 + deriva * -10}px)`,
          filter: e < 0.95 ? `blur(${(1 - e) * 10}px)` : undefined,
        }}
      >
        {t.tipo === "tel" ? <Telefono src={archivo(t.src)} ancho={480} /> : <Navegador src={archivo(t.src)} ancho={980} />}
      </AbsoluteFill>
      <Pill texto={t.label} entra={2} style={{ left: 60, bottom: 330 }} />
    </AbsoluteFill>
  );
};

const Cierre: React.FC = () => {
  const f = useCurrentFrame();
  const e = interpolate(f, [0, 12], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const t2 = interpolate(f, [10, 24], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const t3 = interpolate(f, [22, 36], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Fondo tipo="reves" brillo={0.7} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 80px" }}>
        <Img src={archivo("img/logo_builders.svg")} style={{ width: 150, opacity: e, transform: `scale(${1.3 - 0.3 * e})`, filter: `blur(${(1 - e) * 10}px)` }} />
        <div style={{ marginTop: 56, fontFamily: F_GRANDE, fontWeight: 600, fontSize: 112, lineHeight: 1.05, letterSpacing: "-0.02em", color: "white", opacity: t2, transform: `translateY(${(1 - t2) * 30}px)` }}>
          Tu app,
          <br />
          en 30 días.
        </div>
        <div style={{ marginTop: 28, height: 6, width: 360 * t2, borderRadius: 3, background: lineal(90) }} />
        <div style={{ marginTop: 48, fontFamily: F_TEXTO, fontWeight: 600, fontSize: 40, color: "rgba(255,255,255,0.75)", opacity: t3 }}>Comentá «APP» y te la mostramos funcionando.</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const ChatMontajeBldrs: React.FC = () => {
  useFuentes();
  return (
    <AbsoluteFill style={{ background: "#0C0C0E" }}>
      <Sequence durationInFrames={DROP} name="chat">
        <Chat />
      </Sequence>
      {TOMAS.map((t, i) => (
        <Sequence key={i} from={CORTES[i]} durationInFrames={CORTES[i + 1] - CORTES[i]} name={t.label}>
          <TomaVista t={t} i={i} dur={CORTES[i + 1] - CORTES[i]} />
        </Sequence>
      ))}
      <Sequence from={CIERRE} durationInFrames={DURACION_CM - CIERRE} name="cierre">
        <Cierre />
      </Sequence>

      {/* Música desde el remate */}
      <Sequence from={DROP} name="música">
        <Audio
          src={archivo("audio/musica-076.mp3")}
          trimBefore={Math.round(MUSICA_INICIO_S * FPS)}
          volume={(fr) => 0.62 * interpolate(fr, [0, 2, DURACION_CM - DROP - 40, DURACION_CM - DROP], [0, 1, 1, 0], clamp)}
        />
      </Sequence>

      {/* Efectos: el chat en voz baja, el remate grave, un golpe en cada corte */}
      {CHAT.map((m, i) => (
        <Sfx key={`m${i}`} nombre={m.lado === "propio" ? "pop-b" : "burbuja"} en={m.puntosHasta ?? m.f} volumen={m.lado === "propio" ? 0.3 : 0.45} />
      ))}
      <Sfx nombre="tap" en={254} volumen={0.5} />
      <Sfx nombre="whoosh-big" en={DROP} volumen={0.4} />
      <Sfx nombre="zoom-punch" en={DROP} volumen={0.6} />
      {CORTES.slice(1, -1).map((c, i) => (
        <Sfx key={`c${i}`} nombre="zoom-punch" en={c} volumen={0.28} />
      ))}
      <Sfx nombre="remate" en={CIERRE} volumen={0.45} />
    </AbsoluteFill>
  );
};
