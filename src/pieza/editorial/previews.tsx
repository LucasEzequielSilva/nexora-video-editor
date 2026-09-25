import type { FC } from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import Sfx from "../../reserva/components/sfx";
import { useReservaFonts } from "../../reserva/fonts";
import { ease, lerp } from "../../reserva/motion";
import { FPS } from "../../reserva/theme";
import LogoApp from "../marca";
import BlurX, { filtroBlurX, useBlurXId } from "./blur-x";
import CajaSeleccion from "./caja-seleccion";
import CamaraEscena, { type DirCamara } from "./camara-escena";
import FondoEditorial, { type MarcaFondo } from "./fondo-editorial";
import ObjetoFisico, { type EntradaObjeto, type FuenteObjeto, type TipoObjeto } from "./objeto-fisico";
import { CURVA, ESCENA, FUENTE, PALABRA, REMATE, SOMBRA, SOMBRA_TEXTO, TINTA } from "./tema";
import Titular, { type LineaTitular, type RolPalabra } from "./titular";

/** El mismo cuadro de estructura-nexora que usan los previews de escenas (trimBefore 750). */
const VIDEO: FuenteObjeto = { video: "piezas/estructura-nexora/video.mp4", inicioS: 750 / FPS };
/** Los ojos quedan en el tercio de arriba de la tarjeta. */
const ENCUADRE = "50% 30%";

/** Palabra dicha: `s` es su `start` en public/piezas/estructura-nexora/words.json. */
type Dicha = { text: string; s: number; rol?: RolPalabra };

/** La primera palabra cae a ESCENA.primeraPalabra del corte y el resto a su `start` (whisper ya viene adelantado). */
const alFrame = (s: number, origen: number) => ESCENA.primeraPalabra + Math.round((s - origen) * FPS);

const lineas = (renglones: Dicha[][]): LineaTitular[] => {
  const origen = renglones[0][0].s;
  return renglones.map((r) => ({ palabras: r.map(({ text, s, rol }) => ({ text, rol, at: alFrame(s, origen) })) }));
};

const HOOK = lineas([
  [
    { text: "tu", s: 0.051 },
    { text: "negocio", s: 0.131 },
    { text: "crece", s: 0.511 },
    { text: "pero", s: 1.191 },
    { text: "tu", s: 1.311 },
  ],
  [
    { text: "estructura", s: 1.491, rol: "remate" },
    { text: "no", s: 2.091, rol: "remate" },
  ],
]);

/** Corte de §7 de la guía: el acento va en la misma línea que "a las" (un remate solo en su línea iría en negro). */
const MENSAJE = lineas([
  [
    { text: "el", s: 9.623 },
    { text: "mensaje", s: 9.715 },
    { text: "que", s: 10.115 },
    { text: "entra", s: 10.255 },
  ],
  [
    { text: "a", s: 10.375, rol: "bajadaSans" },
    { text: "las", s: 10.475, rol: "bajadaSans" },
    { text: "11", s: 10.555, rol: "acento" },
    { text: "de", s: 10.735, rol: "acento" },
    { text: "la", s: 10.895, rol: "acento" },
    { text: "noche", s: 11.035, rol: "acento" },
  ],
]);

const Etiqueta = ({ x, y, children }: { x: number; y: number; children: string }) => (
  <div style={{ position: "absolute", left: x, top: y, fontFamily: "monospace", fontSize: 26, color: TINTA.gris }}>{children}</div>
);

const DURACION_TITULAR = 90;

/** T1 + T8: remate solo en negro con el ancho igualado a la bajada, abajo y centrado como B6. */
export function TitularPreview() {
  return (
    <AbsoluteFill>
      <FondoEditorial />
      <Titular lineas={HOOK} alineacion="centro" zona="abajo" />
    </AbsoluteFill>
  );
}

const DURACION_CAJA = 90;
const HOOK_BAJADA = HOOK.slice(0, 1);
const [ESTRUCTURA, NO] = HOOK[1].palabras;
/** El margen de Titular alineado a la izquierda (13 % del ancho). */
const MARGEN = 1080 * 0.13;
/** "estructura" + el aire de la caja + " no" (6,65 em) ≈ "tu negocio crece pero tu" a 90 px (715 px). Medido con fontTools. */
const CUERPO_CAJA = 108;
/** La bajada de Titular en zona arriba termina en ~455 px: queda aire para los tiradores (sobresalen 15 px). */
const TOP_CAJA = 490;
const AIRE_CAJA = 0.12;

/** M2 fuera de Titular, igual que su remate: desde la derecha con estela, sin sonido. */
const RemateEnLinea = ({ text, at }: { text: string; at: number }) => {
  const frame = useCurrentFrame();
  const id = useBlurXId();
  const f = frame - at + 1;
  const p = ease(f, [0, REMATE.asienta], [0, 1], CURVA);
  const estela = REMATE.estelaPx * (1 - p);
  return (
    <>
      <BlurX id={id} sx={estela} />
      <span
        style={{
          display: "inline-block",
          whiteSpace: "pre",
          opacity: ease(f, [0, PALABRA.opacidad], [0, 1], CURVA),
          transform: `translateX(${REMATE.desdeXPx * (1 - p)}px)`,
          filter: filtroBlurX(id, estela),
        }}
      >
        {text}
      </span>
    </>
  );
};

/** T3 en la palabra clave del hook: la caja revela "estructura" y el "no" remata detrás. */
export function CajaSeleccionPreview() {
  useReservaFonts();
  return (
    <AbsoluteFill>
      <FondoEditorial />
      <Titular lineas={HOOK_BAJADA} alineacion="izquierda" zona="arriba" />
      <div
        style={{
          position: "absolute",
          left: MARGEN - AIRE_CAJA * CUERPO_CAJA,
          top: TOP_CAJA,
          fontFamily: FUENTE.remate,
          fontWeight: FUENTE.pesoRemate,
          fontSize: CUERPO_CAJA,
          lineHeight: 1,
          whiteSpace: "nowrap",
          color: TINTA.plena,
          textShadow: SOMBRA_TEXTO,
        }}
      >
        <CajaSeleccion at={ESTRUCTURA.at} relleno={`0 ${AIRE_CAJA}em`}>
          {ESTRUCTURA.text}
        </CajaSeleccion>
        <RemateEnLinea text={` ${NO.text}`} at={NO.at} />
      </div>
    </AbsoluteFill>
  );
}

const DURACION_OBJETOS = 90;
const MUESTRA = { ancho: 420, alto: 600 } as const;

type Muestra = { tipo: TipoObjeto; x: number; y: number; entrada: EntradaObjeto; etiqueta: string };

const MUESTRAS: Muestra[] = [
  { tipo: "foto", x: 80, y: 250, entrada: { escala: 0.84 }, etiqueta: "foto · push-in" },
  { tipo: "cuadro", x: 580, y: 250, entrada: { en: 8, dir: "arriba" }, etiqueta: "cuadro · sube" },
  { tipo: "marco-doble", x: 80, y: 1050, entrada: { en: 16, dir: "izquierda" }, etiqueta: "marco-doble · izquierda" },
  { tipo: "documento", x: 580, y: 1050, entrada: { en: 24, escala: 1.28 }, etiqueta: "documento · pull-back" },
];

/** T7: los cuatro tipos en B/N con trama, cada uno con otra entrada (push-in y vertical con blur; lateral y pull-back sin). */
export function ObjetoFisicoPreview() {
  return (
    <AbsoluteFill>
      <FondoEditorial />
      {MUESTRAS.map((m) => (
        <ObjetoFisico key={m.tipo} tipo={m.tipo} fuente={VIDEO} encuadre={ENCUADRE} x={m.x} y={m.y} {...MUESTRA} entrada={m.entrada} />
      ))}
      {MUESTRAS.map((m) => (
        <Etiqueta key={m.tipo} x={m.x} y={m.y - 56}>
          {m.etiqueta}
        </Etiqueta>
      ))}
    </AbsoluteFill>
  );
}

const DURACION_ICONO = 60;
const ICONO: FuenteObjeto = { imagen: "recursos/icono-005.png" };
/** icono-005 (estructura) mide 253x208: a ~2× todavía no se ablanda. Centrado. */
const HEROE_ICONO = { x: 290, y: 755, ancho: 500, alto: 411 } as const;

/**
 * Ícono premium como protagonista de un beat (§7, lista de servicios): suelto, sin papel, en B/N con la trama recortada
 * a su silueta y sombra abajo-derecha. Entra con el push-in de M8 (0,84 → 1,00).
 */
export function IconoPreview() {
  return (
    <CamaraEscena durationInFrames={DURACION_ICONO} dirEntrada="push" dirSalida="push" llegaAlFinal>
      <ObjetoFisico tipo="suelto" fuente={ICONO} {...HEROE_ICONO} />
    </CamaraEscena>
  );
}

type EscenaCadena = {
  /** La salida es la entrada de la siguiente: la continuidad de dirección sale por construcción (M6). */
  dirEntrada: DirCamara;
  duracion: number;
  marcas: MarcaFondo[];
  heroe: { tipo: TipoObjeto; x: number; y: number; ancho: number; alto: number };
};

/** Abajo → push → arriba → pull: los cortes de B2 → B3 → B4 → B5 y el cierre B6 → B7, que no sale y deja asentar el pull-back (~48 fr). */
const CADENA: EscenaCadena[] = [
  { dirEntrada: "abajo", duracion: 45, marcas: ["cruces", "banda"], heroe: { tipo: "foto", x: 160, y: 680, ancho: 760, alto: 560 } },
  { dirEntrada: "push", duracion: 45, marcas: ["cruces", "anillo"], heroe: { tipo: "cuadro", x: 240, y: 570, ancho: 600, alto: 780 } },
  { dirEntrada: "arriba", duracion: 60, marcas: ["cruces"], heroe: { tipo: "marco-doble", x: 250, y: 580, ancho: 580, alto: 760 } },
  { dirEntrada: "pull", duracion: 75, marcas: ["cruces"], heroe: { tipo: "documento", x: 200, y: 560, ancho: 680, alto: 800 } },
];
const INICIOS = CADENA.map((_, i) => CADENA.slice(0, i).reduce((s, e) => s + e.duracion, 0));
const DURACION_CAMARA = CADENA.reduce((s, e) => s + e.duracion, 0);
/** La escena siguiente se monta antes del corte para que su video ya esté cargado. */
const PREMONTAJE = 30;
const VOLUMEN_WHOOSH = 0.16;

/**
 * T4 encadenado. Cada corte lleva golpe grave + whoosh (decisión de Lucas): el golpe lo pone CamaraEscena en el frame del
 * corte y el whoosh va afuera, porque su subida tiene que sonar sobre la salida de la escena anterior.
 */
export function CamaraEscenaPreview() {
  return (
    <AbsoluteFill>
      {CADENA.map((e, i) => {
        const siguiente = CADENA[i + 1];
        return (
          <Sequence key={i} from={INICIOS[i]} durationInFrames={e.duracion} premountFor={PREMONTAJE} name={`camara:${e.dirEntrada}`}>
            <CamaraEscena
              durationInFrames={e.duracion}
              dirEntrada={e.dirEntrada}
              dirSalida={siguiente?.dirEntrada ?? e.dirEntrada}
              llegaAlFinal={!siguiente}
              marcas={e.marcas}
              sfxEntrada={i > 0 ? "golpe-grave" : undefined}
            >
              <ObjetoFisico {...e.heroe} fuente={VIDEO} encuadre={ENCUADRE} />
            </CamaraEscena>
            <Etiqueta x={48} y={48}>
              {`entra ${e.dirEntrada} · ${siguiente ? `sale ${siguiente.dirEntrada}` : "llega al final"}`}
            </Etiqueta>
          </Sequence>
        );
      })}
      {INICIOS.slice(1).map((at) => (
        <Sfx key={at} name="whoosh-cine" at={at} volume={VOLUMEN_WHOOSH} />
      ))}
    </AbsoluteFill>
  );
}

const DURACION_BEAT = 120;
const TARJETA = { x: 140, y: 620, ancho: 800, alto: 1040 } as const;
const LOGO = 190;
/** El logo entra con "mensaje": es el mensaje que entra. */
const ENTRA_LOGO = MENSAJE[0].palabras[1].at;

/** T9: el único objeto a color de la imagen, al que repite el acento verde. Sin sonido, como las palabras. */
const LogoMensaje = ({ at }: { at: number }) => {
  const frame = useCurrentFrame();
  const p = ease(frame, [at, at + ESCENA.blurIn]);
  const blur = PALABRA.blurPx * (1 - p);
  return (
    <div
      style={{
        position: "absolute",
        right: 56,
        bottom: 56,
        opacity: ease(frame, [at, at + PALABRA.opacidad]),
        transform: `scale(${lerp(0.84, 1, p)})`,
        transformOrigin: "100% 100%",
        filter: SOMBRA.suave + (blur > 0.1 ? ` blur(${blur}px)` : ""),
      }}
    >
      <LogoApp marca="whatsapp" size={LOGO} />
    </div>
  );
};

/**
 * Beat de dolor de §7: foto-tarjeta B/N con el logo de WhatsApp como único color y el titular con acento verde en la
 * misma línea. Entra subiendo con golpe grave, la tarjeta recorre más que el texto (parallax M10) y sale a la izquierda.
 */
export function BeatCompletoPreview() {
  return (
    <CamaraEscena durationInFrames={DURACION_BEAT} dirEntrada="arriba" dirSalida="izquierda" sfxEntrada="golpe-grave">
      {/* Sin blur propio: CamaraEscena ya desenfoca toda la escena al entrar. */}
      <ObjetoFisico tipo="foto" fuente={VIDEO} encuadre={ENCUADRE} {...TARJETA} entrada={{ dir: "arriba", blur: false }}>
        <LogoMensaje at={ENTRA_LOGO} />
      </ObjetoFisico>
      <Titular lineas={MENSAJE} alineacion="izquierda" zona="arriba" />
    </CamaraEscena>
  );
}

export const PREVIEWS_EDITORIAL: { id: string; component: FC; durationInFrames: number }[] = [
  { id: "editorial-titular", component: TitularPreview, durationInFrames: DURACION_TITULAR },
  { id: "editorial-caja-seleccion", component: CajaSeleccionPreview, durationInFrames: DURACION_CAJA },
  { id: "editorial-objeto-fisico", component: ObjetoFisicoPreview, durationInFrames: DURACION_OBJETOS },
  { id: "editorial-icono", component: IconoPreview, durationInFrames: DURACION_ICONO },
  { id: "editorial-camara", component: CamaraEscenaPreview, durationInFrames: DURACION_CAMARA },
  { id: "editorial-beat-completo", component: BeatCompletoPreview, durationInFrames: DURACION_BEAT },
];
