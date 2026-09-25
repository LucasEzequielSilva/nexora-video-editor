import { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, interpolateColors, useCurrentFrame, useDelayRender, useVideoConfig } from "remotion";
import { useReservaFonts } from "../../reserva/fonts";
import { ease } from "../../reserva/motion";
import BlurX, { filtroBlurX, useBlurXId } from "./blur-x";
import { ACENTO, CURVA, FUENTE, PALABRA, REMATE, SOMBRA_TEXTO, TINTA } from "./tema";

/**
 * bajada: serif (M1) · bajadaSans: sans que entra como la bajada, antes del acento en su línea (M1) ·
 * remate: grotesca Bold (M2), igualada en ancho si va sola en su línea · acento: Heavy inclinada en verde (M2 lento).
 */
export type RolPalabra = "bajada" | "bajadaSans" | "remate" | "acento";

export type PalabraTitular = {
  text: string;
  /** Primer frame local en que se ve. La escena lo resuelve desde el ancla en words.json (whisper ya viene adelantado). */
  at: number;
  /** Default "bajada". */
  rol?: RolPalabra;
};

export type LineaTitular = { palabras: PalabraTitular[] };

export type TitularProps = {
  /** Normalmente 2: la bajada y la línea del remate. */
  lineas: LineaTitular[];
  alineacion?: "izquierda" | "centro";
  zona?: "arriba" | "medio" | "abajo";
  /** La línea hecha solo de remate toma el ancho de la primera que no lo es (T1). Sin igualar, va al cuerpo de la sans. */
  igualarAncho?: boolean;
  /** Cuerpo de la bajada en px (70–110 a 1080). */
  tamanoBajada?: number;
};

type Estilo = { familia: string; peso: number };

const ESTILO: Record<RolPalabra, Estilo> = {
  bajada: { familia: FUENTE.bajada, peso: 400 },
  bajadaSans: { familia: FUENTE.remate, peso: FUENTE.pesoRemate },
  remate: { familia: FUENTE.remate, peso: FUENTE.pesoRemate },
  /** Heavy: no hay archivo itálico de Helvetica Neue, se inclina con skew. */
  acento: { familia: FUENTE.remate, peso: 800 },
};
const ROLES = Object.keys(ESTILO) as RolPalabra[];
const INCLINACION_ACENTO = -11;

const TAMANO_BAJADA = 90;
/** Línea en sans (con acento, o remate sin igualar): casi el cuerpo de la bajada, 1,0–1,2×. */
const ESCALA_SANS = 1.1;
/** Ningún renglón pasa el 75 % del ancho (tope de T1). */
const ANCHO_MAX = 0.75;
/** Alineado a la izquierda desde x ≈ 110–180 px de 1080. */
const MARGEN_IZQUIERDA = 0.13;
/** Centro del bloque: el medio de cada rango medido (arriba 9–34 %, medio 54–66 %, abajo 73–85 %). */
const ZONA = { arriba: 0.215, medio: 0.6, abajo: 0.79 } as const;
/** Entre el descendente de un renglón y la mayúscula del siguiente: 25–35 px. Las líneas no se tocan. */
const AIRE = 30;
/** Se mide a este cuerpo y se escala: el ancho del texto es lineal con el tamaño. */
const MEDIDA = 100;

/** Por px de cuerpo. `caja*` son las métricas con las que el navegador ubica la línea base dentro del renglón. */
type MetricaFuente = { espacio: number; mayuscula: number; descendente: number; cajaArriba: number; cajaAbajo: number };
type Medidas = { fuentes: Record<RolPalabra, MetricaFuente>; anchos: number[][] };

type PalabraUbicada = Required<PalabraTitular> & { tamano: number; x: number; top: number };

const rolDe = (p: PalabraTitular): RolPalabra => p.rol ?? "bajada";
const fuenteCanvas = ({ familia, peso }: Estilo) => `${peso} ${MEDIDA}px ${familia}`;

const medir = (lineas: LineaTitular[]): Medidas => {
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) throw new Error("Titular: no hay contexto 2d para medir el texto");
  const metrica = (rol: RolPalabra): MetricaFuente => {
    ctx.font = fuenteCanvas(ESTILO[rol]);
    const h = ctx.measureText("H");
    return {
      espacio: ctx.measureText(" ").width / MEDIDA,
      mayuscula: h.actualBoundingBoxAscent / MEDIDA,
      descendente: ctx.measureText("gjpqy").actualBoundingBoxDescent / MEDIDA,
      cajaArriba: h.fontBoundingBoxAscent / MEDIDA,
      cajaAbajo: h.fontBoundingBoxDescent / MEDIDA,
    };
  };
  const fuentes: Record<RolPalabra, MetricaFuente> = {
    bajada: metrica("bajada"),
    bajadaSans: metrica("bajadaSans"),
    remate: metrica("remate"),
    acento: metrica("acento"),
  };
  const anchos = lineas.map((l) =>
    l.palabras.map((p) => {
      ctx.font = fuenteCanvas(ESTILO[rolDe(p)]);
      return ctx.measureText(p.text).width / MEDIDA;
    }),
  );
  return { fuentes, anchos };
};

/**
 * Mide con canvas recién cuando están cargadas las fuentes: medir con la de reemplazo desarma el ancho igualado. La espera
 * es una sola; después measureText es sincrónico, así que un cambio de texto se mide en el mismo render y ningún frame
 * queda sin titular.
 */
const useMedidas = (lineas: LineaTitular[]): Medidas | null => {
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() => delayRender("Cargando las fuentes del titular"));
  const [fuentesListas, setFuentesListas] = useState(false);
  const clave = lineas.map((l) => l.palabras.map((p) => `${rolDe(p)}:${p.text}`).join(" ")).join("\n");

  useEffect(() => {
    let vigente = true;
    Promise.all(ROLES.map((r) => document.fonts.load(fuenteCanvas(ESTILO[r]))))
      .then((cargadas) => {
        if (cargadas.some((caras) => caras.length === 0)) {
          throw new Error("Titular: Instrument Serif o Helvetica Neue no están registradas (useReservaFonts)");
        }
        if (vigente) setFuentesListas(true);
        continueRender(handle);
      })
      .catch((err: unknown) => cancelRender(err));
    return () => {
      vigente = false;
    };
  }, []);

  // De `lineas` solo importan el texto y el rol, que ya están en `clave`.
  return useMemo(() => (fuentesListas ? medir(lineas) : null), [clave, fuentesListas]);
};

type Opciones = Required<Omit<TitularProps, "lineas">> & { ancho: number; alto: number };

const ubicar = (lineas: LineaTitular[], { fuentes, anchos }: Medidas, o: Opciones): PalabraUbicada[] => {
  const anchoMax = o.ancho * ANCHO_MAX;
  const renglones = lineas.map((l, i) => {
    const roles = l.palabras.map(rolDe);
    return {
      roles,
      /** Ancho por px de cuerpo de cada palabra más el espacio que la sigue. */
      unidades: roles.map((rol, j) => anchos[i][j] + (j < roles.length - 1 ? fuentes[rol].espacio : 0)),
      soloRemate: roles.every((r) => r === "remate"),
    };
  });
  const anchoDe = (unidades: number[], tamanos: number[]) => unidades.reduce((s, u, j) => s + u * tamanos[j], 0);

  const libres = renglones.map(({ roles, unidades }) => {
    const t = roles.map((rol) => (rol === "bajada" ? o.tamanoBajada : o.tamanoBajada * ESCALA_SANS));
    const k = Math.min(1, anchoMax / anchoDe(unidades, t));
    return t.map((x) => x * k);
  });
  const ref = renglones.findIndex((r) => !r.soloRemate);
  const anchoRef = ref >= 0 ? anchoDe(renglones[ref].unidades, libres[ref]) : null;
  const tamanos = renglones.map((r, i) => {
    if (!r.soloRemate || !o.igualarAncho || anchoRef === null) return libres[i];
    const t = Math.min(anchoRef, anchoMax) / anchoDe(r.unidades, r.unidades.map(() => 1));
    return r.roles.map(() => t);
  });

  const altos = renglones.map((r, i) => Math.max(...r.roles.map((rol, j) => tamanos[i][j] * fuentes[rol].mayuscula)));
  const descendentes = renglones.map((r, i) => Math.max(...r.roles.map((rol, j) => tamanos[i][j] * fuentes[rol].descendente)));
  const bases: number[] = [];
  altos.forEach((a, i) => bases.push(i === 0 ? a : bases[i - 1] + descendentes[i - 1] + AIRE + a));
  const ultimo = bases.length - 1;
  const arriba = o.alto * ZONA[o.zona] - (bases[ultimo] + descendentes[ultimo]) / 2;

  return renglones.flatMap((r, i) => {
    const anchoRenglon = anchoDe(r.unidades, tamanos[i]);
    let x = o.alineacion === "centro" ? (o.ancho - anchoRenglon) / 2 : o.ancho * MARGEN_IZQUIERDA;
    return lineas[i].palabras.map((p, j) => {
      const rol = r.roles[j];
      const tamano = tamanos[i][j];
      const f = fuentes[rol];
      // Con line-height 1 la línea base queda a (1 + ascenso − descenso) / 2 del borde de arriba del renglón.
      const top = arriba + bases[i] - (tamano * (1 + f.cajaArriba - f.cajaAbajo)) / 2;
      const ubicada: PalabraUbicada = { text: p.text, at: p.at, rol, tamano, x, top };
      x += r.unidades[j] * tamano;
      return ubicada;
    });
  });
};

type Movimiento = { opacidad: number; dx: number; dy: number; estela: number; color: string };

const movimiento = (rol: RolPalabra, f: number, colorBajada: string): Movimiento => {
  const opacidad = ease(f, [0, PALABRA.opacidad], [0, 1], CURVA);
  if (rol === "bajada" || rol === "bajadaSans") {
    const nitidez = ease(f, [0, PALABRA.blur], [0, 1], CURVA);
    return {
      opacidad,
      dx: 0,
      dy: PALABRA.corrimientoPx * (1 - nitidez),
      estela: PALABRA.blurPx * (1 - nitidez),
      color: interpolateColors(ease(f, [0, PALABRA.color], [0, 1], CURVA), [0, 1], [TINTA.arranque, colorBajada]),
    };
  }
  const p = ease(f, [0, rol === "acento" ? REMATE.acentoColor : REMATE.asienta], [0, 1], CURVA);
  return {
    opacidad,
    dx: REMATE.desdeXPx * (1 - p),
    dy: 0,
    estela: REMATE.estelaPx * (1 - p),
    color: rol === "acento" ? interpolateColors(p, [0, 1], [ACENTO.arranque, ACENTO.relleno]) : TINTA.plena,
  };
};

const Palabra = ({ palabra, colorBajada }: { palabra: PalabraUbicada; colorBajada: string }) => {
  const frame = useCurrentFrame();
  const id = useBlurXId();
  const f = frame - palabra.at + 1;
  if (f <= 0) return null;
  const { opacidad, dx, dy, estela, color } = movimiento(palabra.rol, f, colorBajada);
  const estilo = ESTILO[palabra.rol];
  return (
    <>
      <BlurX id={id} sx={estela} />
      <span
        style={{
          position: "absolute",
          left: palabra.x,
          top: palabra.top,
          fontFamily: estilo.familia,
          fontWeight: estilo.peso,
          fontSize: palabra.tamano,
          lineHeight: 1,
          whiteSpace: "pre",
          color,
          opacity: opacidad,
          textShadow: SOMBRA_TEXTO,
          transform: `translate(${dx}px, ${dy}px)${palabra.rol === "acento" ? ` skewX(${INCLINACION_ACENTO}deg)` : ""}`,
          filter: filtroBlurX(id, estela),
        }}
      >
        {palabra.text}
      </span>
    </>
  );
};

/**
 * T1, lockup de titular: bajada en serif que se arma palabra por palabra (M1) y remate en grotesca que entra desde la
 * derecha con estela (M2), con el ancho igualado al de la bajada. Sin sonido: las palabras entran en silencio. Va
 * dentro del contenedor que mueve la escena, así viaja con la cámara; cada palabra ya está en su lugar final.
 */
export default function Titular({
  lineas,
  alineacion = "izquierda",
  zona = "arriba",
  igualarAncho = true,
  tamanoBajada = TAMANO_BAJADA,
}: TitularProps) {
  useReservaFonts();
  const { width, height } = useVideoConfig();
  const conTexto = useMemo(() => lineas.filter((l) => l.palabras.length > 0), [lineas]);
  const medidas = useMedidas(conTexto);
  const palabras = useMemo(
    () =>
      medidas &&
      ubicar(conTexto, medidas, { alineacion, zona, igualarAncho, tamanoBajada, ancho: width, alto: height }),
    [conTexto, medidas, alineacion, zona, igualarAncho, tamanoBajada, width, height],
  );
  if (!palabras) return null;
  const colorBajada = palabras.some((p) => p.rol === "acento") ? TINTA.plena : TINTA.gris;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {palabras.map((p, i) => (
        <Palabra key={`${i}-${p.text}`} palabra={p} colorBajada={colorBajada} />
      ))}
    </AbsoluteFill>
  );
}
