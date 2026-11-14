import type React from "react";
import { useState } from "react";
import Sfx from "../reserva/components/sfx";
import {
  AbsoluteFill,
  Img,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const FPS_ELEVATE = 30;
export const DURACION_ELEVATE = 480;
export const ANCHO_ELEVATE = 1080;
export const ALTO_ELEVATE = 1350;

const NARANJA = "#FF4E00";
const FUENTE = "Manrope, sans-serif";
const img = (n: string) => staticFile(`elevate/${n}`);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

if (typeof document !== "undefined" && !document.getElementById("manrope")) {
  const link = document.createElement("link");
  link.id = "manrope";
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Manrope:wght@400..800&display=block";
  document.head.appendChild(link);
}

function useFuente() {
  const [handle] = useState(() => delayRender("Manrope"));
  useState(() => {
    Promise.all([document.fonts.load("800 80px Manrope"), document.fonts.load("500 30px Manrope")])
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
    return null;
  });
}

const useSpring = (delay = 0, config = { damping: 18, stiffness: 110 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config });
};

// Entrada y salida de cada escena: aparece y se va con blur y un leve empuje de cámara.
const Escena: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const frame = useCurrentFrame();
  const sale = interpolate(frame, [dur - 12, dur], [0, 1], clamp);
  const entra = interpolate(frame, [0, 10], [0, 1], clamp);
  return (
    <AbsoluteFill
      style={{
        opacity: entra * (1 - sale),
        filter: sale > 0 ? `blur(${sale * 14}px)` : entra < 1 ? `blur(${(1 - entra) * 10}px)` : undefined,
        transform: `scale(${1 + sale * 0.08})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const LogoMark: React.FC<{ size: number; delay?: number }> = ({ size, delay = 0 }) => {
  const piezas = [
    "M56 48.9999C36.8 48.9999 10.6667 63.3333 0 70.4999C35.2 27.2999 81.6667 19.8333 100.5 21.4999C90.9 27.0999 81.5 43.4999 78 50.9999L36.5 70.4999L35 65.4999L56 48.9999Z",
    "M43 82.5001C47 89.3001 48.3333 98.3334 48.5 102C79.7 71.6001 121.5 57.0001 138.5 53.5001C103.7 49.5001 60.3333 71.1667 43 82.5001Z",
    "M93.5 0L83.5 15.5H106L117 4.5L93.5 0Z",
  ];
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <svg viewBox="0 0 139 102" width={size} height={(size * 102) / 139} style={{ overflow: "visible" }}>
      {piezas.map((d, i) => {
        const s = spring({ frame: frame - delay - i * 4, fps, config: { damping: 14, stiffness: 120 } });
        return (
          <path
            key={d}
            d={d}
            fill={NARANJA}
            opacity={s}
            transform={`translate(${(1 - s) * -60} ${(1 - s) * 40})`}
          />
        );
      })}
    </svg>
  );
};

// Palabras que suben desde una máscara, una detrás de otra.
const Titulo: React.FC<{
  lineas: { texto: string; color?: string }[];
  size: number;
  delay?: number;
  align?: "center" | "left";
}> = ({ lineas, size, delay = 0, align = "center" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let n = 0;
  return (
    <div style={{ fontFamily: FUENTE, fontWeight: 700, fontSize: size, lineHeight: 1.02, letterSpacing: "-0.045em", textAlign: align }}>
      {lineas.map((l) => (
        <div key={l.texto}>
          {l.texto.split(" ").map((p) => {
            const s = spring({ frame: frame - delay - n++ * 3, fps, config: { damping: 20, stiffness: 140 } });
            return (
              <span key={p} style={{ display: "inline-block", overflow: "hidden", paddingBottom: size * 0.12, marginBottom: -size * 0.12, verticalAlign: "top" }}>
                <span style={{ display: "inline-block", transform: `translateY(${(1 - s) * 110}%)`, color: l.color ?? "#fff" }}>
                  {p}&nbsp;
                </span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const Eyebrow: React.FC<{ texto: string; delay?: number }> = ({ texto, delay = 0 }) => {
  const s = useSpring(delay);
  return (
    <div
      style={{
        fontFamily: FUENTE,
        fontWeight: 600,
        fontSize: 26,
        color: NARANJA,
        letterSpacing: `${0.2 - s * 0.06}em`,
        textTransform: "uppercase",
        opacity: s,
        marginBottom: 18,
      }}
    >
      {texto}
    </div>
  );
};

// Reflejo de vidrio que barre la pantalla.
const Reflejo: React.FC<{ inicio: number }> = ({ inicio }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [inicio, inicio + 40], [-0.5, 1.5], clamp);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background: `linear-gradient(115deg, transparent ${(p - 0.2) * 100}%, rgba(255,255,255,0.10) ${p * 100}%, transparent ${(p + 0.2) * 100}%)`,
      }}
    />
  );
};

const Fondo: React.FC = () => {
  const frame = useCurrentFrame();
  const x = 50 + Math.sin(frame / 70) * 18;
  const y = 30 + Math.cos(frame / 90) * 12;
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${x}% ${y}%, rgba(255,78,0,0.30), rgba(255,78,0,0.08) 30%, transparent 60%), radial-gradient(circle at ${100 - x}% ${110 - y}%, rgba(255,122,41,0.10), transparent 50%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "90px 90px",
          maskImage: "radial-gradient(circle at 50% 45%, black, transparent 70%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 45%, black, transparent 70%)",
        }}
      />
    </AbsoluteFill>
  );
};

/* ---------- Escenas ---------- */

const EscenaLogo: React.FC = () => {
  const frame = useCurrentFrame();
  const palabra = useSpring(14, { damping: 22, stiffness: 90 });
  const tag = useSpring(26);
  const halo = useSpring(0, { damping: 30, stiffness: 40 });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `scale(${1 + frame * 0.0012})` }}>
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,78,0,0.35), transparent 60%)",
          transform: `scale(${halo})`,
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 34 }}>
        <LogoMark size={170} delay={2} />
        <div
          style={{
            fontFamily: FUENTE,
            fontWeight: 800,
            fontSize: 150,
            color: "#fff",
            letterSpacing: "-0.05em",
            clipPath: `inset(-20% ${(1 - palabra) * 100}% -20% 0)`,
            transform: `translateX(${(1 - palabra) * -30}px)`,
          }}
        >
          Elevate
        </div>
      </div>
      <div
        style={{
          fontFamily: FUENTE,
          fontWeight: 600,
          fontSize: 30,
          color: NARANJA,
          letterSpacing: `${0.5 - tag * 0.18}em`,
          opacity: tag,
          marginTop: 30,
        }}
      >
        COACHING FITNESS ELEVADO
      </div>
    </AbsoluteFill>
  );
};

const EscenaTitular: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `scale(${1 + frame * 0.0008})` }}>
      <Titulo
        size={124}
        lineas={[{ texto: "Rutinas, nutrición" }, { texto: "y cobros en" }, { texto: "un solo lugar.", color: NARANJA }]}
        delay={2}
      />
    </AbsoluteFill>
  );
};

const EscenaPanel: React.FC = () => {
  const frame = useCurrentFrame();
  const s = useSpring(0, { damping: 22, stiffness: 55 });
  const kpi = useSpring(38, { damping: 13, stiffness: 120 });
  const W = 1500;
  const k = W / 1216;
  const rotX = interpolate(s, [0, 1], [58, 30]);
  const rotZ = interpolate(s, [0, 1], [-34, -18]) + frame * 0.03;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 120, width: "100%", textAlign: "center" }}>
        <Eyebrow texto="Panel del coach" delay={4} />
        <Titulo size={74} lineas={[{ texto: "Todo tu negocio," }, { texto: "en un panel." }]} delay={8} />
      </div>
      <AbsoluteFill style={{ perspective: 2200, perspectiveOrigin: "50% 40%" }}>
        <div
          style={{
            position: "absolute",
            left: (1080 - W) / 2 - 10,
            top: 500,
            width: W,
            height: 766 * k,
            transformStyle: "preserve-3d",
            transform: `translateY(${(1 - s) * 500 - frame * 0.6}px) rotateX(${rotX}deg) rotateZ(${rotZ}deg) scale(${0.75 + s * 0.2})`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 18,
              overflow: "hidden",
              boxShadow: "0 80px 120px rgba(0,0,0,0.7), 0 0 120px rgba(255,78,0,0.18)",
            }}
          >
            <Img src={img("dashboard.png")} style={{ width: "100%", height: "100%", display: "block" }} />
            <Reflejo inicio={30} />
          </div>
          <div
            style={{
              position: "absolute",
              left: 271 * k,
              top: 103 * k,
              width: 913 * k,
              height: 109 * k,
              transform: `translateZ(${kpi * 110}px)`,
              boxShadow: `0 ${kpi * 50}px ${kpi * 70}px rgba(0,0,0,0.6)`,
              borderRadius: 14,
              overflow: "hidden",
              outline: `${kpi * 2}px solid rgba(255,78,0,${kpi * 0.7})`,
              opacity: kpi > 0.01 ? 1 : 0,
            }}
          >
            <Img src={img("kpis.png")} style={{ width: "100%", height: "100%", display: "block" }} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const EscenaRutinas: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useSpring(0, { damping: 22, stiffness: 60 });
  const W = 1180;
  const k = W / 1010;
  const levanta = 22;
  const aterriza = 50;
  const vuelo = spring({ frame: frame - levanta, fps, config: { damping: 16, stiffness: 70 } });
  const golpe = spring({ frame: frame - aterriza, fps, config: { damping: 10, stiffness: 200 } });
  const enAire = frame < aterriza + 4;
  const alto = interpolate(frame, [levanta - 10, levanta, aterriza - 6, aterriza], [0, 1, 1, 0], clamp);
  const dx = (1 - vuelo) * 560;
  const dy = (1 - vuelo) * -150;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 120, width: "100%", textAlign: "center" }}>
        <Eyebrow texto="Rutinas" delay={4} />
        <Titulo size={74} lineas={[{ texto: "Armá rutinas en" }, { texto: "minutos, no en una tarde." }]} delay={8} />
      </div>
      <AbsoluteFill style={{ perspective: 2000 }}>
        <div
          style={{
            position: "absolute",
            left: 40,
            top: 520,
            width: W,
            height: 683 * k,
            transformStyle: "preserve-3d",
            transformOrigin: "0% 50%",
            transform: `translateX(${(1 - s) * 700 - frame * 0.8}px) rotateY(${interpolate(s, [0, 1], [-40, -16])}deg) rotateX(${8}deg)`,
          }}
        >
          <div style={{ position: "absolute", inset: 0, borderRadius: 18, overflow: "hidden", boxShadow: "0 80px 120px rgba(0,0,0,0.7), 0 0 100px rgba(255,78,0,0.15)" }}>
            <Img src={img("rutinas.png")} style={{ width: "100%", height: "100%", display: "block" }} />
            {enAire && (
              <div
                style={{
                  position: "absolute",
                  left: 13 * k,
                  top: 431 * k,
                  width: 408 * k,
                  height: 82 * k,
                  background: "#171717",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 6 * k,
                    borderRadius: 12 * k,
                    border: `${2 * k}px dashed rgba(255,78,0,${0.3 + vuelo * 0.5})`,
                  }}
                />
              </div>
            )}
          </div>
          <div
            style={{
              position: "absolute",
              left: 30 * k,
              top: 438 * k,
              width: 380 * k,
              height: 68 * k,
              transform: `translate(${dx}px, ${dy}px) translateZ(${alto * 120 + (1 - golpe) * 10}px) rotate(${alto * -3}deg) scale(${1 + alto * 0.06})`,
              boxShadow: `0 ${20 + alto * 50}px ${30 + alto * 60}px rgba(0,0,0,${0.3 + alto * 0.4})`,
              borderRadius: 11 * k,
              opacity: interpolate(frame, [levanta - 12, levanta - 4], [0, 1], clamp),
            }}
          >
            <Img src={img("militar.png")} style={{ width: "100%", height: "100%", display: "block" }} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Flotante: React.FC<{
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  delay: number;
  rot?: number;
  radio?: number;
  desde?: [number, number];
}> = ({ src, x, y, w, h, z, delay, rot = 0, radio = 20, desde = [0, 300] }) => {
  const frame = useCurrentFrame();
  const s = useSpring(delay, { damping: 18, stiffness: 80 });
  const flota = Math.sin((frame + delay * 7) / 22) * 8;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        opacity: s,
        transform: `translate(${(1 - s) * desde[0]}px, ${(1 - s) * desde[1] + flota}px) translateZ(${z}px) rotate(${rot * s}deg)`,
        borderRadius: radio,
        overflow: "hidden",
        boxShadow: "0 50px 90px rgba(0,0,0,0.65)",
      }}
    >
      <Img src={img(src)} style={{ width: "100%", height: "100%", display: "block" }} />
      <Reflejo inicio={delay + 20} />
    </div>
  );
};

const EscenaApp: React.FC = () => {
  const frame = useCurrentFrame();
  const giro = interpolate(frame, [0, 90], [-14, -4]);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 120, width: "100%", textAlign: "center", zIndex: 2 }}>
        <Eyebrow texto="App para alumnos" delay={4} />
        <Titulo size={74} lineas={[{ texto: "Y tu alumno," }, { texto: "en su propia app." }]} delay={8} />
      </div>
      <AbsoluteFill style={{ perspective: 1800 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            transformStyle: "preserve-3d",
            transform: `rotateY(${giro}deg) rotateX(6deg)`,
          }}
        >
          <Flotante src="antropometria.png" x={40} y={500} w={330} h={451} z={-160} delay={10} rot={-4} radio={14} desde={[-300, 100]} />
          <Flotante src="chat.png" x={620} y={450} w={350} h={722} z={-120} delay={6} rot={5} radio={42} desde={[300, 200]} />
          <Flotante src="app-alumno.png" x={330} y={420} w={400} h={825} z={60} delay={0} radio={48} desde={[0, 500]} />
          <Flotante src="macros.png" x={70} y={960} w={340} h={202} z={200} delay={20} rot={-3} desde={[-200, 200]} />
          <Flotante src="cobros.png" x={660} y={900} w={340} h={238} z={220} delay={28} rot={3} desde={[200, 200]} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const EscenaCierre: React.FC = () => {
  const boton = useSpring(26, { damping: 14, stiffness: 120 });
  const url = useSpring(36);
  const palabra = useSpring(8, { damping: 22, stiffness: 90 });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
        <LogoMark size={120} />
        <div
          style={{
            fontFamily: FUENTE,
            fontWeight: 800,
            fontSize: 112,
            color: "#fff",
            letterSpacing: "-0.05em",
            clipPath: `inset(-20% ${(1 - palabra) * 100}% -20% 0)`,
          }}
        >
          Elevate
        </div>
      </div>
      <div
        style={{
          marginTop: 60,
          fontFamily: FUENTE,
          fontWeight: 700,
          fontSize: 38,
          color: "#fff",
          background: NARANJA,
          padding: "26px 54px",
          borderRadius: 18,
          opacity: boton,
          transform: `translateY(${(1 - boton) * 40}px) scale(${0.9 + boton * 0.1})`,
          boxShadow: "0 20px 60px rgba(255,78,0,0.45)",
        }}
      >
        Creá tu cuenta gratis
      </div>
      <div style={{ marginTop: 36, fontFamily: FUENTE, fontWeight: 500, fontSize: 32, color: "rgba(255,255,255,0.6)", opacity: url, letterSpacing: "0.02em" }}>
        elevatefit.tech
      </div>
    </AbsoluteFill>
  );
};

const ESCENAS: { from: number; dur: number; C: React.FC }[] = [
  { from: 0, dur: 70, C: EscenaLogo },
  { from: 62, dur: 80, C: EscenaTitular },
  { from: 134, dur: 120, C: EscenaPanel },
  { from: 246, dur: 100, C: EscenaRutinas },
  { from: 338, dur: 82, C: EscenaApp },
  { from: 412, dur: 68, C: EscenaCierre },
];

export default function ElevatePromo({ sonido = true }: { sonido?: boolean }) {
  useFuente();
  const frame = useCurrentFrame();
  const salida = interpolate(frame, [DURACION_ELEVATE - 10, DURACION_ELEVATE], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      <Fondo />
      <AbsoluteFill style={{ opacity: salida }}>
        {ESCENAS.map(({ from, dur, C }) => (
          <Sequence key={from} from={from} durationInFrames={dur}>
            <Escena dur={from + dur >= DURACION_ELEVATE ? dur + 20 : dur}>
              <C />
            </Escena>
          </Sequence>
        ))}
      </AbsoluteFill>
      {sonido && (
        <>
          <Sfx name="whoosh-soft" at={8} volume={0.3} />
          <Sfx name="impact" at={16} volume={0.35} />
          <Sfx name="escena-entra" at={64} volume={0.3} />
          <Sfx name="key-soft" at={66} volume={0.25} />
          <Sfx name="key-soft" at={75} volume={0.25} />
          <Sfx name="key-soft" at={84} volume={0.25} />
          <Sfx name="whoosh-short" at={140} volume={0.35} />
          <Sfx name="pop-b" at={174} volume={0.4} />
          <Sfx name="tarjeta" at={252} volume={0.35} />
          <Sfx name="swoosh-tiny" at={270} volume={0.35} />
          <Sfx name="tap" at={296} volume={0.5} />
          <Sfx name="escena-entra" at={340} volume={0.3} />
          <Sfx name="tarjeta-b" at={348} volume={0.3} />
          <Sfx name="burbuja" at={360} volume={0.35} />
          <Sfx name="pop-b" at={368} volume={0.35} />
          <Sfx name="whoosh-short" at={414} volume={0.3} />
          <Sfx name="remate" at={422} volume={0.35} />
          <Sfx name="cta-cierre" at={440} volume={0.35} />
        </>
      )}
    </AbsoluteFill>
  );
}
