import type React from "react";
import { useState } from "react";
import { AbsoluteFill, Easing, Img, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Sfx } from "../bldrs-estudio-motion/comun";

// Historia de Instagram (1080x1920) informativa: una tarjeta por idea, cada una entra con el motion "zoom settle +
// cascada" (/design references/motion.md §10) y sale espejándolo. Copia ampliada de zoom-settle.tsx (que queda igual).
// Zonas seguras de historias: lo importante entre y≈250 y y≈1670 (arriba va la barra de progreso, abajo la respuesta).

export const FPS_H = 30;
export const ANCHO_H = 1080;
export const ALTO_H = 1920;

type Colores = { fondo: string; tarjeta: string; acento: string; textoCta: string; brillo: string };

type Comun = { label: string; titulo: string; apagado?: string; acento?: string; texto?: string };
export type Tarjeta =
  | (Comun & { tipo: "portada"; pantallas: string[] })
  | (Comun & { tipo: "modulo"; imagen: string; detalle?: string; sangrado?: boolean })
  | (Comun & { tipo: "cierre"; cta: string; url: string; nota?: string; tira?: string });

export type DatosHistoria = {
  tarjetas: { duracion: number; tarjeta: Tarjeta }[];
  colores: Colores;
  fuenteTitulo: string;
  fuenteTexto: string;
  fuentesGoogle: string;
  sonido?: boolean;
};

const OUT = Easing.bezier(0.23, 1, 0.32, 1);
const SETTLE = Easing.bezier(0.6, 0, 0.2, 1);
const HUNDE = Easing.bezier(0.55, 0, 0.75, 0.2);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const E = 4; // cuadro en que arranca la entrada de cada tarjeta

const tramo = (f: number, desde: number, dur: number, easing = OUT) =>
  interpolate(((f - E) / FPS_H) * 1000, [desde, desde + dur], [0, 1], { ...clamp, easing });

export const duracionHistoria = (d: DatosHistoria) => d.tarjetas.reduce((s, t) => s + t.duracion, 0);

function useFuentes(href: string, muestras: string[]) {
  const [handle] = useState(() => delayRender("Fuentes historia"));
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

const Palabras: React.FC<{ texto: string; f: number; desde: number; paso: number; dur: number; blur?: number; color?: string; inicio?: number }> = ({
  texto,
  f,
  desde,
  paso,
  dur,
  blur = 0,
  color,
  inicio = 0,
}) => (
  <>
    {texto.split(" ").map((p, i) => {
      const v = tramo(f, desde + (inicio + i) * paso, dur);
      return (
        <span key={i}>
          {i > 0 ? " " : null}
          <span style={{ display: "inline-block", opacity: v, color, filter: blur ? `blur(${(1 - v) * blur}px)` : undefined }}>{p}</span>
        </span>
      );
    })}
  </>
);

const Flecha: React.FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 20 20" width={size} height={size} fill="currentColor" aria-hidden>
    <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
  </svg>
);

const TarjetaAnimada: React.FC<{ t: Tarjeta; duracion: number; d: DatosHistoria; sonido: boolean }> = ({ t, duracion, d, sonido }) => {
  const f = useCurrentFrame();
  const c = d.colores;
  const salida = duracion - 26;

  const sGrande = interpolate(f, [salida, salida + 12], [0, 1], { ...clamp, easing: SETTLE });
  const sHunde = interpolate(f, [salida + 14, salida + 26], [0, 1], { ...clamp, easing: HUNDE });
  const opacidad = tramo(f, 0, 150, Easing.linear) * (1 - sHunde);
  const sube = (1 - tramo(f, 0, 400)) * 12 + sHunde * 12;
  const escala = 1.1 - 0.1 * tramo(f, 400, 400, SETTLE) + 0.1 * sGrande;

  const brillo = tramo(f, 0, 1250, Easing.inOut(Easing.quad));
  const brilloOp = interpolate(brillo, [0, 0.25, 0.7, 1], [0, 0.4, 0.3, 0]);

  const nTitulo = (t.apagado ? t.apagado.split(" ").length : 0) + t.titulo.split(" ").length + (t.acento ? t.acento.split(" ").length : 0);
  const paso = Math.min(100, 600 / Math.max(1, nTitulo - 1));
  const nApagado = t.apagado ? t.apagado.split(" ").length : 0;
  const nTit = t.titulo.split(" ").length;

  const Encabezado = (
    <>
      <div style={{ opacity: tramo(f, 100, 250), fontSize: 26, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: c.acento }}>
        {t.label}
      </div>
      <div style={{ marginTop: 22, fontFamily: d.fuenteTitulo, fontWeight: 800, fontSize: t.tipo === "modulo" ? 76 : 88, lineHeight: 1.04, letterSpacing: "-0.04em", textWrap: "balance" }}>
        {t.apagado ? (
          <>
            <Palabras texto={t.apagado} f={f} desde={150} paso={paso} dur={220} blur={8} color="rgba(255,255,255,0.4)" />
            <br />
          </>
        ) : null}
        <Palabras texto={t.titulo} f={f} desde={150} paso={paso} dur={220} blur={8} inicio={nApagado} />
        {t.acento ? (
          <>
            {" "}
            <Palabras texto={t.acento} f={f} desde={150} paso={paso} dur={220} blur={8} color={c.acento} inicio={nApagado + nTit} />
          </>
        ) : null}
      </div>
      {t.texto ? (
        <div style={{ margin: "26px auto 0", maxWidth: 760, fontSize: 32, lineHeight: 1.42, color: "#a3a3a3", textWrap: "pretty" }}>
          <Palabras texto={t.texto} f={f} desde={300} paso={25} dur={200} />
        </div>
      ) : null}
    </>
  );

  const vImagen = tramo(f, 550, 400);
  const acercar = interpolate(f, [E + 30, salida], [1, 1.035], { ...clamp, easing: Easing.inOut(Easing.quad) });

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 72,
          right: 72,
          top: 250,
          bottom: 250,
          borderRadius: 52,
          overflow: "hidden",
          isolation: "isolate",
          background: `radial-gradient(120% 60% at 0% 100%, ${c.acento}29, transparent 55%), ${c.tarjeta}`,
          boxShadow: "0 0 0 2px rgba(255,255,255,0.08), 0 40px 80px -40px rgba(0,0,0,0.8)",
          opacity: opacidad,
          transform: `translateY(${sube}%) scale(${escala})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            zIndex: -1,
            width: 680,
            height: 680,
            left: 130,
            top: 520,
            borderRadius: "50%",
            background: `radial-gradient(closest-side, ${c.brillo}, transparent)`,
            filter: "blur(40px)",
            opacity: brilloOp,
            transform: `translate(${interpolate(brillo, [0, 1], [240, -380])}px, ${interpolate(brillo, [0, 1], [160, -480])}px)`,
          }}
        />

        {t.tipo === "portada" ? (
          <>
            <Banda f={f} pantallas={t.pantallas} tarjeta={c.tarjeta} />
            <div style={{ position: "absolute", left: 64, right: 64, top: 640, textAlign: "center" }}>{Encabezado}</div>
          </>
        ) : null}

        {t.tipo === "modulo" ? (
          <>
            <div style={{ position: "absolute", left: 64, right: 64, top: 84, textAlign: "center" }}>{Encabezado}</div>
            <div
              style={
                t.sangrado
                  ? { position: "absolute", left: 56, top: 560, height: 720, right: -600 }
                  : { position: "absolute", left: 56, right: 56, top: 560, bottom: 64, display: "flex", alignItems: "center", justifyContent: "center" }
              }
            >
              <Img
                src={staticFile(t.imagen)}
                style={{
                  ...(t.sangrado ? { height: "100%", width: "auto", transformOrigin: "left center" } : { maxWidth: "100%", maxHeight: "100%", objectFit: "contain" as const }),
                  borderRadius: 28,
                  boxShadow: "0 0 0 2px rgba(255,255,255,0.1), 0 30px 60px -30px rgba(0,0,0,0.9)",
                  opacity: vImagen,
                  filter: `blur(${(1 - vImagen) * 10}px)`,
                  transform: `scale(${(0.96 + 0.04 * vImagen) * acercar})`,
                }}
              />
            </div>
            {t.detalle ? <Detalle f={f} src={t.detalle} /> : null}
          </>
        ) : null}

        {t.tipo === "cierre" ? (
          <div style={{ position: "absolute", left: 64, right: 64, top: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            {Encabezado}
            <div
              style={{
                marginTop: 52,
                display: "inline-flex",
                alignItems: "center",
                gap: 14,
                height: 100,
                padding: "0 48px",
                borderRadius: 26,
                background: c.acento,
                color: c.textoCta,
                fontSize: 34,
                fontWeight: 600,
                boxShadow: "inset 0 2px 0 rgba(255,255,255,0.25)",
                opacity: tramo(f, 600, 300),
                transform: `scale(${0.96 + 0.04 * tramo(f, 600, 300)})`,
              }}
            >
              {t.cta}
              <Flecha size={36} />
            </div>
            <div style={{ marginTop: 28, fontFamily: d.fuenteTitulo, fontWeight: 700, fontSize: 40, letterSpacing: "-0.02em", opacity: tramo(f, 750, 300) }}>{t.url}</div>
            {t.nota ? <div style={{ marginTop: 12, fontSize: 25, color: "#737373", opacity: tramo(f, 850, 300) }}>{t.nota}</div> : null}
            {t.tira ? (
              <Img
                src={staticFile(t.tira)}
                style={{
                  marginTop: 64,
                  width: "100%",
                  borderRadius: 18,
                  boxShadow: "0 0 0 2px rgba(255,255,255,0.08)",
                  opacity: tramo(f, 950, 400),
                  filter: `blur(${(1 - tramo(f, 950, 400)) * 6}px)`,
                }}
              />
            ) : null}
          </div>
        ) : null}
      </div>

      {sonido ? (
        <>
          <Sfx nombre="whoosh-soft" en={E + 3} volumen={0.3} />
          {t.tipo === "modulo" ? <Sfx nombre="tarjeta" en={E + Math.round(0.55 * FPS_H)} volumen={0.35} /> : null}
          {t.tipo === "modulo" && t.detalle ? <Sfx nombre="pop-b" en={E + Math.round(0.9 * FPS_H)} volumen={0.3} /> : null}
          {t.tipo === "cierre" ? <Sfx nombre="pop-b" en={E + Math.round(0.6 * FPS_H)} volumen={0.35} /> : null}
          <Sfx nombre="whoosh-short" en={salida + 14} volumen={0.22} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

/** Banda inclinada de pantallas que pasa en loop (portada) */
const Banda: React.FC<{ f: number; pantallas: string[]; tarjeta: string }> = ({ f, pantallas, tarjeta }) => {
  const v = tramo(f, 100, 350);
  const ancho = 270;
  const ciclo = pantallas.length * (ancho + 24);
  const avance = Math.max(0, f - E) * 1.4;
  return (
    <>
      <div
        style={{
          position: "absolute",
          zIndex: -1,
          left: -280,
          right: -280,
          top: -30,
          height: 660,
          transform: "rotate(-12deg)",
          opacity: v,
          filter: `blur(${(1 - v) * 14}px)`,
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 15%, #000 85%, transparent)",
        }}
      >
        <div style={{ display: "flex", gap: 24, transform: `translateX(${-((avance % ciclo) + ciclo / 2)}px)` }}>
          {[...pantallas, ...pantallas, ...pantallas].map((src, i) => (
            <Img
              key={i}
              src={staticFile(src)}
              style={{
                width: ancho,
                height: 560,
                flexShrink: 0,
                objectFit: "cover",
                objectPosition: "top",
                borderRadius: 30,
                boxShadow: "0 0 0 2px rgba(255,255,255,0.08)",
                transform: `translateY(${i % 2 ? 50 : 0}px)`,
              }}
            />
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", zIndex: -1, left: 0, right: 0, top: 330, height: 300, background: `linear-gradient(transparent, ${tarjeta})` }} />
    </>
  );
};

/** Pieza suelta de la interfaz que entra desde el borde girando y queda flotando sobre la captura */
const Detalle: React.FC<{ f: number; src: string }> = ({ f, src }) => {
  const v = tramo(f, 850, 450);
  return (
    <Img
      src={staticFile(src)}
      style={{
        position: "absolute",
        left: 40,
        bottom: 150,
        width: 600,
        borderRadius: 18,
        boxShadow: "0 30px 60px -20px rgba(0,0,0,0.9)",
        opacity: v,
        transform: `translate(${(1 - v) * -60}%, ${(1 - v) * 40}%) rotate(${-4 - (1 - v) * 14}deg)`,
      }}
    />
  );
};

export const Historia: React.FC<DatosHistoria> = (d) => {
  useFuentes(d.fuentesGoogle, [`800 88px ${d.fuenteTitulo}`, `500 32px ${d.fuenteTexto}`, `600 32px ${d.fuenteTexto}`]);
  let desde = 0;
  return (
    <AbsoluteFill style={{ background: d.colores.fondo, fontFamily: d.fuenteTexto, color: "#fafafa" }}>
      {d.tarjetas.map(({ duracion, tarjeta }, i) => {
        const inicio = desde;
        desde += duracion;
        return (
          <Sequence key={i} from={inicio} durationInFrames={duracion} name={`${i + 1}·${tarjeta.label}`}>
            <TarjetaAnimada t={tarjeta} duracion={duracion} d={d} sonido={!!d.sonido} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

// Textos de elevate-landing y de lo que muestran las capturas de la app (public/elevate/). Nada de cifras de demo.
export const HISTORIA_ELEVATE: DatosHistoria = {
  tarjetas: [
    {
      duracion: 150,
      tarjeta: {
        tipo: "portada",
        label: "Elevate · para coaches",
        apagado: "Dejá de improvisar.",
        titulo: "Elevá tu",
        acento: "coaching.",
        texto: "Alumnos, rutinas, nutrición y cobros en una sola plataforma.",
        pantallas: ["elevate/app-alumno.png", "elevate/antropometria.png", "elevate/chat.png", "elevate/rutinas.png", "elevate/cobros.png", "elevate/dashboard.png"],
      },
    },
    {
      duracion: 135,
      tarjeta: {
        tipo: "modulo",
        label: "01 · Rutinas",
        titulo: "Armá la rutina en",
        acento: "minutos.",
        texto: "Arrastrás ejercicios de una biblioteca de más de 500 y la asignás a tus alumnos.",
        imagen: "elevate/rutinas.png",
        detalle: "elevate/militar.png",
        sangrado: true,
      },
    },
    {
      duracion: 135,
      tarjeta: {
        tipo: "modulo",
        label: "02 · App del alumno",
        titulo: "Entrena con tu rutina",
        acento: "en el celular.",
        texto: "Ve cada serie, carga los kilos y la registra en el momento.",
        imagen: "elevate/app-alumno.png",
      },
    },
    {
      duracion: 135,
      tarjeta: {
        tipo: "modulo",
        label: "03 · Nutrición",
        titulo: "Los macros del día,",
        acento: "a la vista.",
        texto: "Calorías, proteínas, carbohidratos y grasas contra su objetivo.",
        imagen: "elevate/macros.png",
      },
    },
    {
      duracion: 135,
      tarjeta: {
        tipo: "modulo",
        label: "04 · Progreso",
        titulo: "Medí el cambio,",
        acento: "no la sensación.",
        texto: "Antropometría con 6 pliegues, peso, grasa y medidas, mes a mes.",
        imagen: "elevate/antropometria.png",
      },
    },
    {
      duracion: 135,
      tarjeta: {
        tipo: "modulo",
        label: "05 · Cobros",
        titulo: "Sabés quién pagó",
        acento: "y quién no.",
        texto: "Mercado Pago o tarjeta, acreditado o pendiente, en una sola lista.",
        imagen: "elevate/cobros.png",
      },
    },
    {
      duracion: 150,
      tarjeta: {
        tipo: "cierre",
        label: "Plataforma para coaches",
        apagado: "Dejá de improvisar.",
        titulo: "Elevá tu",
        acento: "coaching.",
        cta: "Creá tu cuenta gratis",
        url: "elevatefit.tech",
        nota: "Sin tarjeta · Sin compromiso",
        tira: "elevate/kpis.png",
      },
    },
  ],
  // Blanco sobre #FF4E00 da 3.4:1: el texto del botón va casi negro
  colores: { fondo: "#0d0d0d", tarjeta: "#141414", acento: "#FF4E00", textoCta: "#0d0d0d", brillo: "rgba(255,150,90,0.6)" },
  fuenteTitulo: "Manrope",
  fuenteTexto: "Inter",
  fuentesGoogle: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@700;800&display=block",
  sonido: true,
};
