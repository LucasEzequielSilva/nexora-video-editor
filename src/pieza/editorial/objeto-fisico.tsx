import type { CSSProperties, ReactNode } from "react";
import { Easing, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { ease, lerp } from "../../reserva/motion";
import { FPS } from "../../reserva/theme";
import { BN, ESCENA, SOMBRA, TINTA } from "./tema";

/**
 * "suelto": sin papel ni borde, para un PNG con fondo transparente (ícono premium de public/recursos/icono-*.png) como
 * protagonista del beat; la sombra sigue su silueta. Los de PACKS/ICONOS miden 211–285 px de ancho: pasado ~500 px se
 * ablandan.
 */
export type TipoObjeto = "foto" | "cuadro" | "marco-doble" | "documento" | "suelto";
export type Tratamiento = "bn-trama" | "color";
export type SombraObjeto = "pesada" | "suave";
export type AjusteMedio = "cover" | "contain";
/** Hacia dónde viaja al entrar: la misma dirección con la que salió la escena anterior (T4). */
export type DirEntrada = "abajo" | "arriba" | "izquierda" | "derecha";

/** Rutas en public/. `inicioS`: segundo del clip desde el que se ve, como en los b-rolls. */
export type FuenteObjeto = { imagen: string } | { video: string; inicioS?: number };

export type EntradaObjeto = {
  /** Frame local en el que aparece. */
  en?: number;
  /** Escala de arranque: 0,84 = push-in (M8), 1,28 = pull-back (M9). */
  escala?: number;
  dir?: DirEntrada;
  /** El cuadro de B5 sube ≈270 px (T6). */
  distancia?: number;
  /** σ 28 → 0 px en 11 fr sobre todo el objeto (M6). Por defecto como T4: solo si viaja en vertical o entra con push-in. */
  blur?: boolean;
};

type ObjetoFisicoProps = {
  tipo: TipoObjeto;
  fuente?: FuenteObjeto;
  /** Caja exterior en px del cuadro 1080x1920, bordes incluidos. */
  x: number;
  y: number;
  ancho: number;
  alto: number;
  /** Por defecto "suave" en el marco doble y "pesada" en el resto (T7). */
  sombra?: SombraObjeto;
  tratamiento?: Tratamiento;
  /** object-position de la foto o el video (los b-rolls son verticales: elegir qué parte entra en una tarjeta apaisada). */
  encuadre?: string;
  /** object-fit de la foto o el video. Default: "contain" en "suelto" (el ícono entero, sin estirar), "cover" en el resto. */
  ajuste?: AjusteMedio;
  entrada?: EntradaObjeto;
  /** Encima de la foto y fuera del B/N: el único objeto a color (LogoApp, T9) o el contenido del documento. */
  children?: ReactNode;
};

const RADIO_FOTO = 8;
const LINEA = 5;
const FILETE = 9;
const COLOR_FILETE = "#F1F3F5";
const PAPEL = "#F4F5F7";
const CANTO = "inset 0 -6px 0 #c9ccd0";
/** Lado de la esquina doblada respecto del lado corto: a ojo, no está medido. */
const DOBLEZ = 0.12;
const DEGRADE_DOBLEZ = "linear-gradient(135deg, #b7bbc0 50%, #e2e5e8 72%, #f7f8f9 100%)";
const SOMBRA_DOBLEZ = "drop-shadow(3px 4px 4px rgba(20,24,28,0.28))";
const DISTANCIA = 270;
const PREMONTAJE_VIDEO = 30;

const ORIGEN: Record<DirEntrada, [number, number]> = {
  abajo: [0, -1],
  arriba: [0, 1],
  izquierda: [1, 0],
  derecha: [-1, 0],
};

const CAPA: CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%" };

type MedioProps = { fuente: FuenteObjeto; tratamiento: Tratamiento; encuadre?: string; ajuste: AjusteMedio };

const Medio = ({ fuente, tratamiento, encuadre, ajuste }: MedioProps) => {
  const bn = tratamiento === "bn-trama";
  const posicion = encuadre ?? "50% 50%";
  const estilo: CSSProperties = { ...CAPA, objectFit: ajuste, objectPosition: posicion, filter: bn ? BN.filtro : undefined };
  // Enmascarada con la misma imagen, ubicada igual: sobre un PNG transparente la trama rayaría también el hueco.
  const mascara: CSSProperties =
    "imagen" in fuente
      ? { maskImage: `url("${staticFile(fuente.imagen)}")`, maskSize: ajuste, maskPosition: posicion, maskRepeat: "no-repeat" }
      : {};
  return (
    <div style={{ ...CAPA, isolation: "isolate" }}>
      {"video" in fuente ? (
        <OffthreadVideo src={staticFile(fuente.video)} trimBefore={Math.round((fuente.inicioS ?? 0) * FPS)} muted style={estilo} />
      ) : (
        <Img src={staticFile(fuente.imagen)} style={estilo} />
      )}
      {bn && <div style={{ ...CAPA, backgroundImage: BN.trama, mixBlendMode: BN.mezcla, ...mascara }} />}
    </div>
  );
};

type SuperficieProps = { tipo: TipoObjeto; ancho: number; alto: number; children: ReactNode };

const Superficie = ({ tipo, ancho, alto, children }: SuperficieProps) => {
  if (tipo === "suelto") return <>{children}</>;
  if (tipo === "foto") {
    return <div style={{ ...CAPA, borderRadius: RADIO_FOTO, overflow: "hidden", background: PAPEL }}>{children}</div>;
  }
  if (tipo === "cuadro") {
    return (
      <div style={{ ...CAPA, boxSizing: "border-box", border: `${LINEA}px solid ${TINTA.plena}`, overflow: "hidden", background: PAPEL }}>
        {children}
      </div>
    );
  }
  if (tipo === "marco-doble") {
    return (
      <div style={{ ...CAPA, boxSizing: "border-box", border: `${LINEA}px solid ${TINTA.plena}`, padding: FILETE, background: COLOR_FILETE }}>
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            boxSizing: "border-box",
            border: `${LINEA}px solid ${TINTA.plena}`,
            overflow: "hidden",
            background: PAPEL,
          }}
        >
          {children}
        </div>
      </div>
    );
  }
  const d = Math.round(Math.min(ancho, alto) * DOBLEZ);
  return (
    <>
      <div style={{ ...CAPA, overflow: "hidden", background: PAPEL, clipPath: `polygon(${d}px 0, 100% 0, 100% 100%, 0 100%, 0 ${d}px)` }}>
        {children}
        <div style={{ ...CAPA, boxShadow: CANTO }} />
      </div>
      {/* La sombra va en un contenedor aparte: el clip-path de la solapa la recortaría. */}
      <div style={{ position: "absolute", left: 0, top: 0, width: d, height: d, filter: SOMBRA_DOBLEZ }}>
        <div style={{ width: "100%", height: "100%", clipPath: "polygon(100% 0, 100% 100%, 0 100%)", background: DEGRADE_DOBLEZ }} />
      </div>
    </>
  );
};

type CuerpoProps = Omit<ObjetoFisicoProps, "entrada"> & { entrada: EntradaObjeto };

const Cuerpo = ({
  tipo,
  fuente,
  x,
  y,
  ancho,
  alto,
  sombra,
  tratamiento = "bn-trama",
  encuadre,
  ajuste = tipo === "suelto" ? "contain" : "cover",
  entrada,
  children,
}: CuerpoProps) => {
  const f = useCurrentFrame();
  const escala0 = entrada.escala ?? 1;
  const conBlur = entrada.blur ?? (entrada.dir === "abajo" || entrada.dir === "arriba" || escala0 < 1);
  const p = 1 - Math.exp(-Math.max(0, f) / ESCENA.tau);
  const [ox, oy] = entrada.dir ? ORIGEN[entrada.dir] : [0, 0];
  const resto = (entrada.distancia ?? DISTANCIA) * (1 - p);
  const blur = conBlur ? ease(f, [0, ESCENA.blurIn], [ESCENA.blurInPx, 0], Easing.out(Easing.cubic)) : 0;
  const filtro = SOMBRA[sombra ?? (tipo === "marco-doble" ? "suave" : "pesada")] + (blur > 0.1 ? ` blur(${blur}px)` : "");
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: ancho,
        height: alto,
        transform: `translate(${ox * resto}px, ${oy * resto}px) scale(${lerp(escala0, 1, p)})`,
        filter: filtro,
      }}
    >
      <Superficie tipo={tipo} ancho={ancho} alto={alto}>
        {fuente && <Medio fuente={fuente} tratamiento={tratamiento} encuadre={encuadre} ajuste={ajuste} />}
        {children}
      </Superficie>
    </div>
  );
};

/**
 * T7: foto-tarjeta, cuadro, marco doble, documento con la esquina doblada u objeto suelto (ícono), con sombra siempre
 * abajo-derecha. Un protagonista por beat y en B/N: el único color sigue siendo LogoApp whatsapp (T9). La entrada
 * frena en expo-out (τ 10) sin fundido y deja la cola de deriva: el objeto nunca queda quieto (M4). Va en una Sequence
 * para que el video arranque en `inicioS` justo cuando aparece, no cuando arrancó la escena.
 */
export default function ObjetoFisico({ entrada = {}, ...props }: ObjetoFisicoProps) {
  const esVideo = props.fuente !== undefined && "video" in props.fuente;
  return (
    <Sequence from={entrada.en ?? 0} premountFor={esVideo ? PREMONTAJE_VIDEO : 0} name={`objeto:${props.tipo}`}>
      <Cuerpo {...props} entrada={entrada} />
    </Sequence>
  );
}
