import type React from "react";
import { useState } from "react";
import { AbsoluteFill, Easing, Img, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";

// Aviso 16:9 de Elevate para la pantalla del monitor, con la receta de @xzecreative (assets/referencias/xzecreative.md):
// mancha de luz de la marca → frase palabra por palabra con destello → números gigantes que cuentan → pasillo 3D de
// pantallas reales → lista que sube con desenfoque y la fila propia en el acento → logo.

export const FPS_AV = 30;
export const ANCHO_AV = 1920;
export const ALTO_AV = 1080;

const NARANJA = "#FF4E00";
const AMBAR = "#FF8A3D";
const TITULO = "Manrope, sans-serif";
const TEXTO = "Inter, sans-serif";
const OUT = Easing.bezier(0.23, 1, 0.32, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const t = (f: number, a: number, b: number, easing = OUT) => interpolate(f, [a, b], [0, 1], { ...clamp, easing });

// Escenas [desde, duración] en cuadros
const E = {
  frase: [0, 84],
  numeros: [84, 102],
  pasillo: [186, 84],
  lista: [270, 96],
  logo: [366, 66],
} as const;
export const DURACION_AV = 432;

function useFuentes() {
  const [h] = useState(() => delayRender("Fuentes aviso"));
  useState(() => {
    const href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600;700;800&display=block";
    if (!document.querySelector(`link[href="${href}"]`)) {
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = href;
      document.head.appendChild(l);
    }
    Promise.all(["800 120px Manrope", "600 40px Inter"].map((m) => document.fonts.load(m)))
      .then(() => continueRender(h))
      .catch(() => continueRender(h));
  });
}

/** Mancha de luz naranja que respira detrás de todo */
const Luz: React.FC<{ f: number; fuerza?: number; y?: number }> = ({ f, fuerza = 1, y = 62 }) => {
  const r = Math.sin(f / 22) * 4;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(45% 55% at ${50 + r}% ${y}%, rgba(255,78,0,${0.55 * fuerza}), transparent 70%), radial-gradient(30% 40% at ${48 - r}% ${y + 8}%, rgba(255,170,90,${0.35 * fuerza}), transparent 70%), #080808`,
      }}
    />
  );
};

const Estrella: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  <svg width={size} height={size} viewBox="-50 -50 100 100" style={{ position: "absolute", overflow: "visible", ...style }}>
    <defs>
      <radialGradient id="est">
        <stop offset="0" stopColor="#fff" />
        <stop offset="0.35" stopColor="#ffd2b0" />
        <stop offset="1" stopColor={NARANJA} stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle r="46" fill="url(#est)" opacity="0.55" />
    <path d="M0 -50 C4 -8 8 -4 50 0 C8 4 4 8 0 50 C-4 8 -8 4 -50 0 C-8 -4 -4 -8 0 -50Z" fill="#fff" />
  </svg>
);

const Frase: React.FC = () => {
  const f = useCurrentFrame();
  const palabras: [string, boolean][] = [["Elevá", false], ["tu", false], ["coaching.", true]];
  const viaje = t(f, 6, 30, Easing.bezier(0.45, 0, 0.2, 1));
  const salida = t(f, 70, 84, Easing.in(Easing.quad));
  const x = interpolate(viaje, [0, 1], [-700, 330]);
  const tam = interpolate(viaje, [0, 0.5, 1], [260, 200, 70]) * (1 + Math.sin(f / 5) * 0.06);
  return (
    <AbsoluteFill>
      <Luz f={f} fuerza={0.55} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: 1 - salida, transform: `scale(${1 + salida * 0.15})`, filter: `blur(${salida * 12}px)` }}>
        <div style={{ position: "relative", fontFamily: TITULO, fontWeight: 800, fontSize: 132, letterSpacing: "-0.045em", color: "#fff" }}>
          {palabras.map(([p, acento], i) => {
            const v = t(f, 10 + i * 6, 22 + i * 6);
            return (
              <span key={p} style={{ display: "inline-block", marginRight: 34, opacity: v, filter: `blur(${(1 - v) * 14}px)`, color: acento ? NARANJA : undefined }}>
                {p}
              </span>
            );
          })}
          <Estrella size={tam} style={{ left: "50%", top: "50%", marginLeft: x - tam / 2, marginTop: -tam / 2 - (viaje > 0.98 ? 70 : 0) * t(f, 30, 40), filter: "drop-shadow(0 0 30px rgba(255,120,40,0.9))", transform: `rotate(${f * 1.5}deg)` }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Chevrones: React.FC<{ v: number }> = ({ v }) => (
  <>
    {[-1, 1].map((lado) => (
      <svg
        key={lado}
        width="420"
        height="520"
        viewBox="0 0 420 520"
        style={{ position: "absolute", top: 280, [lado < 0 ? "left" : "right"]: interpolate(v, [0, 1], [-160, 40]), transform: lado > 0 ? "scaleX(-1)" : undefined, opacity: v * 0.7 }}
      >
        <defs>
          <linearGradient id={`ch${lado}`} x1="0" x2="1">
            <stop offset="0" stopColor={NARANJA} stopOpacity="0" />
            <stop offset="1" stopColor={NARANJA} stopOpacity="0.55" />
          </linearGradient>
        </defs>
        <path d="M0 0 L170 0 L420 260 L170 520 L0 520 L250 260Z" fill={`url(#ch${lado})`} />
        <path d="M-150 60 L-40 60 L160 260 L-40 460 L-150 460 L50 260Z" fill={`url(#ch${lado})`} opacity="0.5" />
      </svg>
    ))}
  </>
);

const Numeros: React.FC = () => {
  const f = useCurrentFrame();
  const items: { desde: number; hasta: number; sufijo: string; label: string }[] = [
    { desde: 120, hasta: 500, sufijo: "+", label: "EJERCICIOS" },
    { desde: 12, hasta: 0, sufijo: "", label: "PLANILLAS" },
    { desde: 0, hasta: 1, sufijo: "", label: "PLATAFORMA" },
  ];
  const tramo = 34;
  const i = Math.min(items.length - 1, Math.floor(f / tramo));
  const lf = f - i * tramo;
  const it = items[i];
  const cuenta = t(lf, 0, 20, Easing.bezier(0.2, 0.8, 0.3, 1));
  const n = Math.round(interpolate(cuenta, [0, 1], [it.desde, it.hasta]));
  const entra = t(lf, 0, 8);
  const sale = i < items.length - 1 ? t(lf, tramo - 5, tramo, Easing.in(Easing.quad)) : t(f, 96, 102, Easing.in(Easing.quad));
  return (
    <AbsoluteFill>
      <Luz f={f + 84} fuerza={0.8} y={92} />
      <Chevrones v={t(f, 0, 14)} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: entra * (1 - sale), transform: `scale(${1.18 - 0.18 * entra + sale * 0.12}) skewX(-8deg)`, filter: `blur(${(1 - entra) * 16 + sale * 10}px)` }}>
        <div
          style={{
            fontFamily: TITULO,
            fontWeight: 800,
            fontSize: 330,
            lineHeight: 0.9,
            letterSpacing: "-0.06em",
            fontVariantNumeric: "tabular-nums",
            backgroundImage: `linear-gradient(180deg, #ffe2cc 0%, ${AMBAR} 45%, ${NARANJA} 100%)`,
            WebkitBackgroundClip: "text",
            color: "transparent",
            filter: "drop-shadow(0 20px 60px rgba(255,78,0,0.45))",
          }}
        >
          {n}
          {it.sufijo}
        </div>
        <div style={{ marginTop: 10, fontFamily: TITULO, fontWeight: 800, fontSize: 64, letterSpacing: "0.02em", color: "#f5f5f5" }}>{it.label}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Pasillo: React.FC = () => {
  const f = useCurrentFrame();
  const avance = interpolate(f, [0, 84], [0, 1700], { ...clamp, easing: Easing.bezier(0.3, 0, 0.6, 1) });
  const entra = t(f, 0, 12);
  const sale = t(f, 74, 84, Easing.in(Easing.quad));
  const paneles: { src: string; lado: -1 | 1; z: number }[] = [
    { src: "elevate/rutinas.png", lado: -1, z: -600 },
    { src: "elevate/dashboard.png", lado: 1, z: -900 },
    { src: "elevate/antropometria.png", lado: -1, z: -1900 },
    { src: "elevate/cobros.png", lado: 1, z: -2200 },
  ];
  const vTexto = t(f, 18, 34);
  return (
    <AbsoluteFill style={{ opacity: entra * (1 - sale) }}>
      <Luz f={f + 186} fuerza={0.9} y={55} />
      <AbsoluteFill style={{ perspective: 1100, perspectiveOrigin: "50% 50%" }}>
        {paneles.map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 1100,
              height: 700,
              marginLeft: -550,
              marginTop: -350,
              transformStyle: "preserve-3d",
              transform: `translateX(${p.lado * 720}px) translateZ(${p.z + avance}px) rotateY(${-p.lado * 72}deg)`,
            }}
          >
            <Img src={staticFile(p.src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "left top", borderRadius: 24, boxShadow: "0 0 0 2px rgba(255,255,255,0.12), 0 0 80px rgba(255,78,0,0.25)" }} />
          </div>
        ))}
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 92, letterSpacing: "-0.04em", color: "#fff", opacity: vTexto, filter: `blur(${(1 - vTexto) * 10}px)`, textShadow: "0 10px 40px rgba(0,0,0,0.8)" }}>
          Todo en <span style={{ color: NARANJA }}>un solo lugar.</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const ALUMNOS = [
  { n: "Sofía Benítez", plan: "Hipertrofia 4 días", a: 96, ini: "SB" },
  { n: "Tomás Acosta", plan: "Fuerza 3 días", a: 91, ini: "TA" },
  { n: "Joaquín Pereyra", plan: "Running + fuerza", a: 88, ini: "JP" },
  { n: "Mateo Fernández", plan: "Hipertrofia 5 días", a: 82, ini: "MF" },
  { n: "Valentina Ruiz", plan: "Recomposición", a: 74, ini: "VR" },
];

const Lista: React.FC = () => {
  const f = useCurrentFrame();
  const entra = t(f, 0, 10);
  const sale = t(f, 88, 96, Easing.in(Easing.quad));
  const vTitulo = t(f, 4, 18);
  return (
    <AbsoluteFill style={{ opacity: entra * (1 - sale), transform: `scale(${1 + sale * 0.08})` }}>
      <Luz f={f + 270} fuerza={0.45} y={40} />
      <div style={{ position: "absolute", top: 120, width: "100%", textAlign: "center", fontFamily: TITULO, fontWeight: 800, fontSize: 84, letterSpacing: "-0.04em", color: "#fff", opacity: vTitulo, filter: `blur(${(1 - vTitulo) * 10}px)` }}>
        Tus alumnos, <span style={{ color: NARANJA }}>al día.</span>
      </div>
      <div style={{ position: "absolute", left: "50%", top: 290, width: 1080, marginLeft: -540 }}>
        {ALUMNOS.map((al, i) => {
          const v = t(f, 10 + i * 4, 26 + i * 4, Easing.bezier(0.16, 1, 0.3, 1));
          const primero = i === 0;
          const pct = Math.round(al.a * t(f, 20 + i * 4, 60 + i * 4));
          return (
            <div
              key={al.n}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 28,
                height: 120,
                marginBottom: 20,
                padding: "0 40px",
                borderRadius: 28,
                background: primero ? NARANJA : "#161616",
                boxShadow: primero ? "0 20px 60px -10px rgba(255,78,0,0.55)" : "0 0 0 2px rgba(255,255,255,0.06)",
                color: primero ? "#0d0d0d" : "#f5f5f5",
                opacity: v,
                transform: `translateY(${(1 - v) * 260}px) scale(${primero ? 1 + 0.04 * t(f, 40, 52) : 1})`,
                filter: `blur(${(1 - v) * 16}px)`,
              }}
            >
              <div style={{ width: 64, height: 64, borderRadius: 32, display: "grid", placeItems: "center", background: primero ? "rgba(0,0,0,0.15)" : "#262626", fontFamily: TEXTO, fontWeight: 600, fontSize: 24 }}>{al.ini}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: TEXTO, fontWeight: 600, fontSize: 36 }}>{al.n}</div>
                <div style={{ fontFamily: TEXTO, fontSize: 24, opacity: 0.65 }}>{al.plan}</div>
              </div>
              <div style={{ width: 260, height: 12, borderRadius: 6, background: primero ? "rgba(0,0,0,0.2)" : "#2a2a2a", overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", borderRadius: 6, background: primero ? "#0d0d0d" : NARANJA }} />
              </div>
              <div style={{ width: 110, textAlign: "right", fontFamily: TITULO, fontWeight: 800, fontSize: 40, fontVariantNumeric: "tabular-nums" }}>{pct}%</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 260, background: "linear-gradient(transparent, #080808)" }} />
    </AbsoluteFill>
  );
};

const Logo: React.FC = () => {
  const f = useCurrentFrame();
  const v = t(f, 0, 18);
  const vUrl = t(f, 14, 30);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Luz f={f + 366} fuerza={0.7 * v} y={58} />
      <div style={{ display: "flex", alignItems: "center", gap: 36, opacity: v, transform: `scale(${1.15 - 0.15 * v})`, filter: `blur(${(1 - v) * 14}px)` }}>
        <svg width="200" height="147" viewBox="0 0 139 102" fill="none">
          <path d="M56 48.9999C36.8 48.9999 10.6667 63.3333 0 70.4999C35.2 27.2999 81.6667 19.8333 100.5 21.4999C90.9 27.0999 81.5 43.4999 78 50.9999L36.5 70.4999L35 65.4999L56 48.9999Z" fill={NARANJA} />
          <path d="M43 82.5001C47 89.3001 48.3333 98.3334 48.5 102C79.7 71.6001 121.5 57.0001 138.5 53.5001C103.7 49.5001 60.3333 71.1667 43 82.5001Z" fill={NARANJA} />
          <path d="M93.5 0L83.5 15.5H106L117 4.5L93.5 0Z" fill={NARANJA} />
        </svg>
        <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 168, letterSpacing: "-0.05em", color: "#fff" }}>Elevate</div>
      </div>
      <div style={{ marginTop: 40, fontFamily: TEXTO, fontWeight: 500, fontSize: 42, color: "rgba(255,255,255,0.7)", letterSpacing: "0.02em", opacity: vUrl }}>elevatefit.tech</div>
    </AbsoluteFill>
  );
};

export const AvisoElevate: React.FC = () => {
  useFuentes();
  return (
    <AbsoluteFill style={{ background: "#080808" }}>
      <Sequence from={E.frase[0]} durationInFrames={E.frase[1]} name="frase"><Frase /></Sequence>
      <Sequence from={E.numeros[0]} durationInFrames={E.numeros[1]} name="numeros"><Numeros /></Sequence>
      <Sequence from={E.pasillo[0]} durationInFrames={E.pasillo[1]} name="pasillo"><Pasillo /></Sequence>
      <Sequence from={E.lista[0]} durationInFrames={E.lista[1]} name="lista"><Lista /></Sequence>
      <Sequence from={E.logo[0]} durationInFrames={E.logo[1]} name="logo"><Logo /></Sequence>
    </AbsoluteFill>
  );
};
