import type React from "react";
import { useState } from "react";
import { AbsoluteFill, Easing, Img, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Sfx } from "../bldrs-estudio-motion/comun";

// Motion "zoom settle + cascada" (medido del reel de @itschatto, /design references/motion.md §10) para contenido de
// Instagram: la tarjeta entra grande, sube, se asienta a 1.0 mientras el contenido cae en orden de lectura; queda viva con
// la banda de pantallas en loop y sale espejando la entrada, así el clip se puede repetir.

export const FPS_ZS = 30;
export const ANCHO_ZS = 1080;
export const ALTO_ZS = 1350;
export const DURACION_ZS = 240;

export type Segmento = { texto: string; apagado?: boolean; acento?: boolean };

export type DatosZoomSettle = {
  label: string;
  titulo: Segmento[];
  bajada: string;
  cta: string;
  nota?: string;
  datos: { valor: string; label: string }[];
  pantallas: string[];
  colores: { fondo: string; tarjeta: string; acento: string; textoCta: string; brillo: string };
  fuenteTitulo: string;
  fuenteTexto: string;
  fuentesGoogle: string;
  sonido?: boolean;
};

const OUT = Easing.bezier(0.23, 1, 0.32, 1);
const SETTLE = Easing.bezier(0.6, 0, 0.2, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Entrada en f = INICIO; salida (espejo) en f = SALIDA
const INICIO = 6;
const SALIDA = DURACION_ZS - 36;

const ms = (f: number) => ((f - INICIO) / FPS_ZS) * 1000;
/** 0→1 entre `desde` y `desde + dur` (en ms desde el inicio de la entrada) */
const tramo = (f: number, desde: number, dur: number, easing = OUT) =>
  interpolate(ms(f), [desde, desde + dur], [0, 1], { ...clamp, easing });

function useFuentes(href: string, muestras: string[]) {
  const [handle] = useState(() => delayRender("Fuentes motion-ui"));
  useState(() => {
    if (!document.querySelector(`link[data-zs="${href}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.dataset.zs = href;
      document.head.appendChild(link);
    }
    Promise.all(muestras.map((m) => document.fonts.load(m)))
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  });
}

const Palabra: React.FC<{ children: string; v: number; blur?: number; style?: React.CSSProperties }> = ({ children, v, blur = 0, style }) => (
  <span style={{ display: "inline-block", opacity: v, filter: blur ? `blur(${(1 - v) * blur}px)` : undefined, ...style }}>{children}</span>
);

export const ZoomSettle: React.FC<DatosZoomSettle> = (d) => {
  const f = useCurrentFrame();
  useFuentes(d.fuentesGoogle, [`800 92px ${d.fuenteTitulo}`, `500 34px ${d.fuenteTexto}`, `600 34px ${d.fuenteTexto}`]);

  // Salida: se agranda a 1.1 y se hunde apagándose (el espejo de la entrada)
  const sGrande = interpolate(f, [SALIDA, SALIDA + 12], [0, 1], { ...clamp, easing: SETTLE });
  const sHunde = interpolate(f, [SALIDA + 16, SALIDA + 28], [0, 1], { ...clamp, easing: Easing.bezier(0.55, 0, 0.75, 0.2) });

  const opacidad = tramo(f, 0, 150, Easing.linear) * (1 - sHunde);
  const sube = (1 - tramo(f, 0, 400)) * 12 + sHunde * 12;
  const escala = 1.1 - 0.1 * tramo(f, 400, 400, SETTLE) + 0.1 * sGrande;

  const brillo = tramo(f, 0, 1250, Easing.inOut(Easing.quad));
  const brilloOp = interpolate(brillo, [0, 0.25, 0.7, 1], [0, 0.4, 0.3, 0]);

  const banda = tramo(f, 100, 350);
  const avance = Math.max(0, f - INICIO) * 1.4;

  const palabrasTitulo = d.titulo.flatMap((s, i) =>
    s.texto.split(" ").map((t, j) => ({ t, s, nueva: i > 0 && j === 0 && d.titulo[i - 1].apagado })),
  );
  const paso = Math.min(100, 600 / Math.max(1, palabrasTitulo.length - 1));
  const palabrasBajada = d.bajada.split(" ");

  const anchoPantalla = 250;
  const pantallas = [...d.pantallas, ...d.pantallas, ...d.pantallas];
  const largoCiclo = d.pantallas.length * (anchoPantalla + 24);

  return (
    <AbsoluteFill style={{ background: d.colores.fondo, fontFamily: d.fuenteTexto, color: "#fafafa" }}>
      <div
        style={{
          position: "absolute",
          left: 84,
          right: 84,
          top: 110,
          bottom: 110,
          borderRadius: 48,
          overflow: "hidden",
          isolation: "isolate",
          background: `radial-gradient(120% 70% at 0% 100%, ${d.colores.acento}29, transparent 55%), ${d.colores.tarjeta}`,
          boxShadow: "0 0 0 2px rgba(255,255,255,0.08), 0 40px 80px -40px rgba(0,0,0,0.8)",
          opacity: opacidad,
          transform: `translateY(${sube}%) scale(${escala})`,
        }}
      >
        {/* Barrido de luz */}
        <div
          style={{
            position: "absolute",
            zIndex: -1,
            width: 620,
            height: 620,
            left: 150,
            top: 380,
            borderRadius: "50%",
            background: `radial-gradient(closest-side, ${d.colores.brillo}, transparent)`,
            filter: "blur(40px)",
            opacity: brilloOp,
            transform: `translate(${interpolate(brillo, [0, 1], [240, -380])}px, ${interpolate(brillo, [0, 1], [120, -420])}px)`,
          }}
        />

        {/* Banda inclinada de pantallas reales, en loop */}
        <div
          style={{
            position: "absolute",
            zIndex: -1,
            left: -260,
            right: -260,
            top: -40,
            height: 470,
            transform: "rotate(-12deg)",
            opacity: banda,
            filter: `blur(${(1 - banda) * 14}px)`,
            WebkitMaskImage: "linear-gradient(90deg, transparent, #000 15%, #000 85%, transparent)",
          }}
        >
          <div style={{ display: "flex", gap: 24, transform: `translateX(${-((avance % largoCiclo) + largoCiclo / 2)}px)` }}>
            {pantallas.map((src, i) => (
              <Img
                key={i}
                src={staticFile(src)}
                style={{
                  width: anchoPantalla,
                  height: 450,
                  flexShrink: 0,
                  objectFit: "cover",
                  objectPosition: "top",
                  borderRadius: 30,
                  boxShadow: "0 0 0 2px rgba(255,255,255,0.08)",
                  transform: `translateY(${i % 2 ? 40 : 0}px)`,
                }}
              />
            ))}
          </div>
        </div>
        <div style={{ position: "absolute", zIndex: -1, left: 0, right: 0, top: 220, height: 230, background: `linear-gradient(transparent, ${d.colores.tarjeta})` }} />

        {/* Contenido en cascada, en orden de lectura */}
        <div style={{ position: "absolute", left: 56, right: 56, top: 400, textAlign: "center" }}>
          <div style={{ opacity: tramo(f, 100, 250), fontSize: 24, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: d.colores.acento }}>
            {d.label}
          </div>

          <div style={{ marginTop: 22, fontFamily: d.fuenteTitulo, fontWeight: 800, fontSize: 84, lineHeight: 1.04, letterSpacing: "-0.04em" }}>
            {palabrasTitulo.map((p, i) => (
              <span key={i}>
                {p.nueva ? <br /> : i > 0 ? " " : null}
                <Palabra
                  v={tramo(f, 150 + i * paso, 220)}
                  blur={8}
                  style={{ color: p.s.acento ? d.colores.acento : p.s.apagado ? "rgba(255,255,255,0.4)" : undefined }}
                >
                  {p.t}
                </Palabra>
              </span>
            ))}
          </div>

          <div style={{ margin: "28px auto 0", maxWidth: 740, fontSize: 31, lineHeight: 1.45, color: "#a3a3a3" }}>
            {palabrasBajada.map((p, i) => (
              <span key={i}>
                {i > 0 ? " " : null}
                <Palabra v={tramo(f, 300 + i * 30, 200)}>{p}</Palabra>
              </span>
            ))}
          </div>

          <div
            style={{
              margin: "40px auto 0",
              display: "inline-flex",
              alignItems: "center",
              gap: 14,
              height: 92,
              padding: "0 44px",
              borderRadius: 26,
              background: d.colores.acento,
              color: d.colores.textoCta,
              fontSize: 32,
              fontWeight: 600,
              boxShadow: "inset 0 2px 0 rgba(255,255,255,0.25)",
              opacity: tramo(f, 600, 300),
              transform: `scale(${0.96 + 0.04 * tramo(f, 600, 300)})`,
            }}
          >
            {d.cta}
            <svg viewBox="0 0 20 20" width="34" height="34" fill="currentColor" aria-hidden>
              <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
            </svg>
          </div>
          {d.nota ? <div style={{ marginTop: 18, fontSize: 23, color: "#737373", opacity: tramo(f, 750, 300) }}>{d.nota}</div> : null}

          <div style={{ marginTop: 44, display: "grid", gridTemplateColumns: `repeat(${d.datos.length}, 1fr)`, gap: 12 }}>
            {d.datos.map((x, i) => {
              const v = tramo(f, 650 + i * 100, 350);
              return (
                <div key={x.label} style={{ opacity: v, filter: `blur(${(1 - v) * 5}px)` }}>
                  <div style={{ fontFamily: d.fuenteTitulo, fontWeight: 700, fontSize: 34, letterSpacing: "-0.02em" }}>{x.valor}</div>
                  <div style={{ marginTop: 6, fontSize: 20, lineHeight: 1.3, color: "#8a8a8a" }}>{x.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {d.sonido ? (
        <>
          <Sfx nombre="whoosh-soft" en={INICIO + 4} volumen={0.35} />
          <Sfx nombre="tarjeta" en={INICIO + Math.round(0.6 * FPS_ZS)} volumen={0.4} />
          <Sfx nombre="pop-b" en={INICIO + Math.round(0.65 * FPS_ZS)} volumen={0.3} />
          <Sfx nombre="whoosh-short" en={SALIDA + 18} volumen={0.3} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

export const ELEVATE: DatosZoomSettle = {
  label: "Plataforma para coaches",
  titulo: [{ texto: "Dejá de improvisar.", apagado: true }, { texto: "Elevá tu" }, { texto: "coaching.", acento: true }],
  bajada: "Gestioná alumnos, rutinas, nutrición y cobros desde una plataforma pensada para coaches profesionales.",
  cta: "Crear mi cuenta gratis",
  nota: "Sin tarjeta · Sin compromiso",
  datos: [
    { valor: "Rutinas", label: "Editor y ejercicios" },
    { valor: "Nutrición", label: "Planes por alumno" },
    { valor: "Cobros", label: "Finanzas al día" },
    { valor: "Progreso", label: "Métricas y reportes" },
  ],
  pantallas: ["elevate/app-alumno.png", "elevate/antropometria.png", "elevate/chat.png", "elevate/rutinas.png", "elevate/cobros.png", "elevate/dashboard.png"],
  // Blanco sobre #FF4E00 da 3.4:1: el texto del botón va casi negro
  colores: { fondo: "#0d0d0d", tarjeta: "#141414", acento: "#FF4E00", textoCta: "#0d0d0d", brillo: "rgba(255,150,90,0.6)" },
  fuenteTitulo: "Manrope",
  fuenteTexto: "Inter",
  fuentesGoogle: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@700;800&display=block",
  sonido: true,
};
