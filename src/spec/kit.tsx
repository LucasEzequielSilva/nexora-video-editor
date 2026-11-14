import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import LogoApp from "../pieza/marca";
import type { Marca } from "../pieza/marcas-paths";
import { Content, Escenario, Stage } from "./capas";
import { TINTA, alfa, fuenteDe, tintaAcento, useLayout, useSpec } from "./tema";
import Texto from "./texto";
import type { Brillo, TextoCinetico } from "./tipos";

/**
 * Kit de componentes de UI para los spec ads: tiles de vidrio, números que cuentan, anillos que se llenan, botones que
 * se aprietan, filas que entran. Es lo que los spec ads de Revolut/Amazon muestran en cada beat: UN componente grande y
 * limpio, no la pantalla entera chiquita. Colores de la UI de PropMatch (tokens del prototipo / CRM).
 */
export const UI = {
  surf: "#251E52",
  bg: "#181640",
  deep: "#0F0D2E",
  texto: "#F7F5F2",
  tenue: "#9C98B8",
  ok: "#34D399",
  borde: "rgba(255,255,255,0.12)",
} as const;

export const OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const INOUT = Easing.bezier(0.65, 0, 0.35, 1);

/** 0..1 desde `at` durante `dur` cuadros, con ease-out. */
export const prog = (frame: number, at: number, dur = 16, easing: (t: number) => number = OUT) =>
  interpolate(frame, [at, at + dur], [0, 1], { easing, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** Entrada de los spec ads: desde la profundidad, desenfocado, frenando. */
export const desdeProfundidad = (frame: number, at: number, u: number, dur = 18, dist = 60): CSSProperties => {
  const t = prog(frame, at, dur);
  return {
    opacity: t,
    transform: `translateY(${(1 - t) * dist * u}px) scale(${0.94 + 0.06 * t})`,
    filter: t < 0.999 ? `blur(${(1 - t) * 16 * u}px)` : undefined,
  };
};

/** Entrada lateral (filas, pills): desde la derecha, desenfocada. */
export const desdeDerecha = (frame: number, at: number, u: number, dur = 16, dist = 48): CSSProperties => {
  const t = prog(frame, at, dur);
  return {
    opacity: t,
    transform: `translateX(${(1 - t) * dist * u}px)`,
    filter: t < 0.999 ? `blur(${(1 - t) * 10 * u}px)` : undefined,
  };
};

export const miles = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
export const usd = (n: number) => `USD ${miles(n)}`;

export const useGrad = () => {
  const { spec } = useSpec();
  return spec.marca.degradado ?? [spec.marca.color, spec.marca.color2 ?? spec.marca.color];
};

export const gradCss = (grad: string[], ang = 95) => `linear-gradient(${ang}deg, ${grad.join(", ")})`;

/** Tile de vidrio oscuro: la tarjeta base de la UI. */
export const Tile = ({
  at = 0,
  children,
  style,
  radio = 32,
  relleno = 30,
  claro = false,
}: {
  at?: number;
  children: ReactNode;
  style?: CSSProperties;
  radio?: number;
  relleno?: number;
  /** Variante elevada (la tarjeta principal). */
  claro?: boolean;
}) => {
  const frame = useCurrentFrame();
  const { u } = useLayout();
  if (frame < at) return null;
  return (
    <div
      style={{
        ...desdeProfundidad(frame, at, u),
        background: claro
          ? `linear-gradient(160deg, ${alfa("#2F2866", 0.96)}, ${alfa(UI.surf, 0.94)})`
          : `linear-gradient(160deg, ${alfa(UI.surf, 0.9)}, ${alfa(UI.bg, 0.88)})`,
        border: `${1.5 * u}px solid ${UI.borde}`,
        borderRadius: radio * u,
        padding: relleno * u,
        boxShadow: `0 ${30 * u}px ${80 * u}px rgba(0,0,0,0.55), inset 0 ${1 * u}px 0 rgba(255,255,255,0.1)`,
        backdropFilter: `blur(${20 * u}px)`,
        boxSizing: "border-box",
        position: "relative",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Texto de UI (SF Pro de la marca). */
export const T = ({
  children,
  tam = 32,
  peso = 600,
  color = UI.texto,
  style,
  acento = false,
}: {
  children: ReactNode;
  tam?: number;
  peso?: number;
  color?: string;
  style?: CSSProperties;
  acento?: boolean;
}) => {
  const { u } = useLayout();
  const { spec } = useSpec();
  return (
    <div
      style={{
        fontFamily: fuenteDe(spec),
        fontWeight: peso,
        fontSize: tam * u,
        lineHeight: 1.15,
        letterSpacing: tam >= 60 ? "-0.035em" : "-0.015em",
        color,
        ...(acento ? tintaAcento(spec) : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Etiqueta chica en mayúsculas (los "// HÁBITAT" del prototipo). */
export const Etiqueta = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <T tam={20} peso={700} color={UI.tenue} style={{ letterSpacing: "0.14em", textTransform: "uppercase", ...style }}>
    {children}
  </T>
);

/** Número que cuenta hasta `valor` (ease-out) desde `at`. */
export const Numero = ({
  at,
  dur = 32,
  valor,
  formato = miles,
  tam = 96,
  peso = 800,
  style,
  acento = false,
}: {
  at: number;
  dur?: number;
  valor: number;
  formato?: (n: number) => string;
  tam?: number;
  peso?: number;
  style?: CSSProperties;
  acento?: boolean;
}) => {
  const frame = useCurrentFrame();
  const t = prog(frame, at, dur, Easing.out(Easing.cubic));
  return (
    <T tam={tam} peso={peso} acento={acento} style={{ fontVariantNumeric: "tabular-nums", letterSpacing: "-0.04em", lineHeight: 1, ...style }}>
      {formato(valor * t)}
    </T>
  );
};

/** Anillo de progreso con el degradé que se llena hasta `valor` (0..1). */
export const Anillo = ({
  at,
  dur = 36,
  valor = 1,
  tam = 180,
  grosor = 14,
  children,
  id,
}: {
  at: number;
  dur?: number;
  valor?: number;
  tam?: number;
  grosor?: number;
  children?: ReactNode;
  id: string;
}) => {
  const frame = useCurrentFrame();
  const { u } = useLayout();
  const grad = useGrad();
  const t = prog(frame, at, dur, INOUT) * valor;
  const r = (tam - grosor) / 2;
  return (
    <div style={{ position: "relative", width: tam * u, height: tam * u, flexShrink: 0 }}>
      <svg width={tam * u} height={tam * u} viewBox={`0 0 ${tam} ${tam}`} style={{ transform: "rotate(-90deg)", overflow: "visible" }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            {grad.map((c, i) => (
              <stop key={c + i} offset={i / Math.max(1, grad.length - 1)} stopColor={c} />
            ))}
          </linearGradient>
        </defs>
        <circle cx={tam / 2} cy={tam / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={grosor} />
        <circle
          cx={tam / 2}
          cy={tam / 2}
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={grosor}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={`${Math.max(0.0001, t)} 1`}
          style={{ filter: `drop-shadow(0 0 ${8}px ${alfa(grad[1] ?? grad[0], 0.7)})` }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>{children}</div>
    </div>
  );
};

/** Tilde que se dibuja (confirmación). */
export const Check = ({ at, tam = 56, dur = 12 }: { at: number; tam?: number; dur?: number }) => {
  const frame = useCurrentFrame();
  const { u } = useLayout();
  const grad = useGrad();
  if (frame < at) return null;
  const t = prog(frame, at, dur, INOUT);
  const pop = interpolate(frame, [at, at + 6, at + 14], [0.6, 1.08, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <svg width={tam * u} height={tam * u} viewBox="0 0 40 40" style={{ flexShrink: 0, transform: `scale(${pop})` }}>
      <circle cx={20} cy={20} r={18} fill={alfa(UI.ok, 0.18)} stroke={UI.ok} strokeWidth={2.5} />
      <path d="M12 20.5 L18 26.5 L29 14" fill="none" stroke="#fff" strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${t} 1`} />
    </svg>
  );
};

/**
 * Botón primario de PropMatch (relleno oscuro con borde fino del degradé y glow). `presionaS` (relativo a la escena):
 * se hunde, y después muestra `despues` con tilde — el "Add to Cart → Order placed" del aviso de Amazon.
 */
export const Boton = ({
  at,
  presionaS,
  etiqueta,
  despues,
  ancho,
  alto = 80,
  tam = 30,
}: {
  at: number;
  presionaS?: number;
  etiqueta: string;
  despues?: string;
  ancho?: number;
  alto?: number;
  tam?: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u } = useLayout();
  const { spec } = useSpec();
  const grad = useGrad();
  if (frame < at) return null;
  const p = presionaS !== undefined ? presionaS * fps : Number.POSITIVE_INFINITY;
  const press = interpolate(frame, [p, p + 5, p + 16], [1, 0.95, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const hecho = despues !== undefined && frame >= p + 8;
  const cross = prog(frame, p + 8, 10);
  return (
    <div style={desdeProfundidad(frame, at, u, 14, 24)}>
      <div
        style={{
          transform: `scale(${press})`,
          width: ancho ? ancho * u : undefined,
          height: alto * u,
          borderRadius: 18 * u,
          padding: 2 * u,
          background: gradCss(grad, 92),
          boxShadow: `0 ${10 * u}px ${30 * u}px rgba(0,0,0,0.4), 0 0 ${28 * u}px ${alfa(grad[1] ?? grad[0], hecho ? 0.55 : 0.3)}`,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 16 * u,
            background: UI.deep,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14 * u,
            padding: `0 ${34 * u}px`,
            fontFamily: fuenteDe(spec),
            fontWeight: 600,
            fontSize: tam * u,
            color: "#fff",
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <span style={{ opacity: hecho ? 1 - cross : 1, transform: `translateY(${hecho ? -cross * 20 * u : 0}px)`, display: "inline-block" }}>{etiqueta}</span>
          {hecho && (
            <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 * u, opacity: cross, transform: `translateY(${(1 - cross) * 20 * u}px)` }}>
              <Check at={p + 8} tam={44} />
              <span style={tintaAcento(spec)}>{despues}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/** Pill chica (estados, filtros). `acento`: relleno con el degradé y texto oscuro. */
export const Pill = ({ at = 0, children, acento = false, ok = false, tam = 22 }: { at?: number; children: ReactNode; acento?: boolean; ok?: boolean; tam?: number }) => {
  const frame = useCurrentFrame();
  const { u } = useLayout();
  const { spec } = useSpec();
  const grad = useGrad();
  if (frame < at) return null;
  return (
    <div
      style={{
        ...desdeDerecha(frame, at, u, 12, 20),
        display: "inline-flex",
        alignItems: "center",
        gap: 8 * u,
        padding: `${8 * u}px ${16 * u}px`,
        borderRadius: 999,
        background: acento ? gradCss(grad) : ok ? alfa(UI.ok, 0.16) : "rgba(255,255,255,0.08)",
        border: acento ? "none" : `${1 * u}px solid ${ok ? alfa(UI.ok, 0.5) : UI.borde}`,
        fontFamily: fuenteDe(spec),
        fontWeight: 700,
        fontSize: tam * u,
        color: acento ? UI.deep : ok ? UI.ok : UI.texto,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
};

/** Avatar con iniciales (los contactos del CRM). */
export const Avatar = ({ inicial, color, tam = 64 }: { inicial: string; color: string; tam?: number }) => {
  const { u } = useLayout();
  const { spec } = useSpec();
  return (
    <div
      style={{
        width: tam * u,
        height: tam * u,
        borderRadius: 999,
        background: `linear-gradient(160deg, ${color}, ${alfa(color, 0.6)})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: fuenteDe(spec),
        fontWeight: 800,
        fontSize: tam * 0.38 * u,
        color: "#fff",
        flexShrink: 0,
        boxShadow: `0 ${6 * u}px ${18 * u}px rgba(0,0,0,0.35)`,
      }}
    >
      {inicial}
    </div>
  );
};

/** Fila de lista (contacto, canal): entra desde la derecha. */
export const Fila = ({ at, izquierda, titulo, detalle, derecha, ancho }: { at: number; izquierda: ReactNode; titulo: string; detalle?: string; derecha?: ReactNode; ancho?: number }) => {
  const frame = useCurrentFrame();
  const { u } = useLayout();
  if (frame < at) return null;
  return (
    <div
      style={{
        ...desdeDerecha(frame, at, u),
        display: "flex",
        alignItems: "center",
        gap: 22 * u,
        width: ancho ? ancho * u : "100%",
        padding: `${18 * u}px ${22 * u}px`,
        borderRadius: 24 * u,
        background: "rgba(255,255,255,0.05)",
        border: `${1 * u}px solid rgba(255,255,255,0.07)`,
        boxSizing: "border-box",
      }}
    >
      {izquierda}
      <div style={{ flex: 1, minWidth: 0 }}>
        <T tam={32} peso={700} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {titulo}
        </T>
        {detalle && (
          <T tam={23} peso={500} color={UI.tenue} style={{ marginTop: 4 * u, whiteSpace: "nowrap" }}>
            {detalle}
          </T>
        )}
      </div>
      {derecha}
    </div>
  );
};

/** Campo de formulario cuyo valor "aterriza" (la ficha que se arma sola). `tipea`: el valor se escribe letra a letra. */
export const Campo = ({ at, etiqueta, valor, tipea = false, ancho }: { at: number; etiqueta: string; valor: string; tipea?: boolean; ancho?: number }) => {
  const frame = useCurrentFrame();
  const { u } = useLayout();
  const visible = frame >= at;
  const n = tipea ? Math.min(valor.length, Math.max(0, Math.floor((frame - at) / 1.6))) : valor.length;
  return (
    <div style={{ width: ancho ? ancho * u : "100%", minWidth: 0 }}>
      <Etiqueta style={{ marginBottom: 8 * u }}>{etiqueta}</Etiqueta>
      <div
        style={{
          height: 64 * u,
          borderRadius: 16 * u,
          background: "rgba(255,255,255,0.06)",
          border: `${1 * u}px solid ${visible ? "rgba(255,255,255,0.18)" : UI.borde}`,
          display: "flex",
          alignItems: "center",
          padding: `0 ${18 * u}px`,
          boxSizing: "border-box",
          boxShadow: visible ? `0 0 0 ${3 * u}px ${alfa("#A855FF", Math.max(0, 0.35 - prog(frame, at, 20) * 0.35))}` : undefined,
        }}
      >
        {visible && (
          <T tam={28} peso={600} style={{ ...(tipea ? {} : desdeDerecha(frame, at, u, 12, 16)), whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {valor.slice(0, n)}
          </T>
        )}
      </div>
    </div>
  );
};

/** Barra de rango con el marcador que se desliza hasta `valor` (precio sugerido dentro del rango competitivo). */
export const BarraRango = ({
  at,
  escala,
  rango,
  valor,
  dur = 40,
  etiquetas,
}: {
  at: number;
  /** [min, max] de la barra. */
  escala: [number, number];
  /** [desde, hasta] de la zona "en rango". */
  rango: [number, number];
  valor: number;
  dur?: number;
  etiquetas: [string, string];
}) => {
  const frame = useCurrentFrame();
  const { u } = useLayout();
  const grad = useGrad();
  const pos = (v: number) => (v - escala[0]) / (escala[1] - escala[0]);
  const t = prog(frame, at, dur, INOUT);
  const x = pos(escala[0] + (valor - escala[0]) * t);
  const zona = prog(frame, at - 10, 24);
  return (
    <div style={{ width: "100%" }}>
      <div style={{ position: "relative", height: 18 * u, borderRadius: 999, background: "rgba(255,255,255,0.08)" }}>
        <div
          style={{
            position: "absolute",
            left: `${pos(rango[0]) * 100}%`,
            width: `${(pos(rango[1]) - pos(rango[0])) * 100 * zona}%`,
            top: 0,
            bottom: 0,
            borderRadius: 999,
            background: gradCss(grad),
            boxShadow: `0 0 ${18 * u}px ${alfa(grad[1] ?? grad[0], 0.6)}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: `${x * 100}%`,
            top: "50%",
            width: 40 * u,
            height: 40 * u,
            transform: "translate(-50%, -50%)",
            borderRadius: 999,
            background: "#fff",
            boxShadow: `0 0 0 ${5 * u}px ${alfa(grad[2] ?? grad[0], 0.45)}, 0 ${6 * u}px ${18 * u}px rgba(0,0,0,0.5)`,
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 * u }}>
        <T tam={22} peso={600} color={UI.tenue}>
          {etiquetas[0]}
        </T>
        <T tam={22} peso={600} color={UI.tenue}>
          {etiquetas[1]}
        </T>
      </div>
    </div>
  );
};

export type Canal = Marca | "mercadolibre" | "propmatch";

/** Logo de canal como ícono de app: oficiales de simple-icons (LogoApp), el de Mercado Libre (PNG oficial) y el de PropMatch. */
export const LogoCanal = ({ canal, tam = 96, archivos }: { canal: Canal; tam?: number; archivos: { mercadolibre: string; propmatch: string } }) => {
  const { u } = useLayout();
  const comun: CSSProperties = { width: tam * u, height: tam * u, borderRadius: tam * 0.235 * u, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.08)" };
  if (canal === "mercadolibre")
    return (
      <div style={{ ...comun, background: "#FFE600" }}>
        <Img src={staticFile(archivos.mercadolibre)} style={{ width: tam * 0.72 * u, height: tam * 0.72 * u, objectFit: "contain" }} />
      </div>
    );
  if (canal === "propmatch")
    return (
      <div style={{ ...comun, background: UI.deep, border: `${1.5 * u}px solid ${UI.borde}` }}>
        <Img src={staticFile(archivos.propmatch)} style={{ width: tam * 0.62 * u, height: tam * 0.62 * u, objectFit: "contain" }} />
      </div>
    );
  return <LogoApp marca={canal} size={tam * u} />;
};

/** Borde de luz con el degradé que se dibuja alrededor de un rectángulo (progreso 0..1) y queda brillando. */
export const BordeLuz = ({ progreso, ancho, alto, radio, id }: { progreso: number; ancho: number; alto: number; radio: number; id: string }) => {
  const grad = useGrad();
  if (progreso <= 0) return null;
  return (
    <svg width={ancho} height={alto} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2={ancho} y2={alto} gradientUnits="userSpaceOnUse">
          {grad.map((c, i) => (
            <stop key={c + i} offset={i / Math.max(1, grad.length - 1)} stopColor={c} />
          ))}
        </linearGradient>
        <filter id={`${id}-f`} x={-200} y={-200} width={ancho + 400} height={alto + 400} filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation={14} />
        </filter>
      </defs>
      <rect x={2} y={2} width={ancho - 4} height={alto - 4} rx={radio} fill="none" stroke={`url(#${id}-g)`} strokeWidth={14} pathLength={1} strokeDasharray={`${progreso} 1`} filter={`url(#${id}-f)`} opacity={0.9} />
      <rect x={2} y={2} width={ancho - 4} height={alto - 4} rx={radio} fill="none" stroke={`url(#${id}-g)`} strokeWidth={4} pathLength={1} strokeDasharray={`${progreso} 1`} />
    </svg>
  );
};

export const WEB = { ancho: 1600, barra: 56, radio: 22 } as const;

/** Ventana de navegador oscura (el CRM web) con la captura real debajo de la barra; el zoom va adentro de la ventana. */
export const Navegador = ({ archivo, url, alto, zoom = 1, foco = [0.5, 0.5] }: { archivo: string; url?: string; alto: number; zoom?: number; foco?: [number, number] }) => (
  <div style={{ width: WEB.ancho, height: alto, borderRadius: WEB.radio, overflow: "hidden", background: "#120F33", border: "1.5px solid rgba(255,255,255,0.14)", boxSizing: "border-box" }}>
    <div style={{ height: WEB.barra, display: "flex", alignItems: "center", gap: 12, padding: "0 22px", background: "#1B1745", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
        <div key={c} style={{ width: 16, height: 16, borderRadius: 99, background: c }} />
      ))}
      <div style={{ flex: 1, marginLeft: 24, height: 32, maxWidth: 560, borderRadius: 10, background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)", fontSize: 18, display: "flex", alignItems: "center", padding: "0 16px", fontFamily: "'SF Pro Display', system-ui, sans-serif" }}>
        {url ?? "app.propmatch.com.ar"}
      </div>
    </div>
    <div style={{ width: WEB.ancho, height: alto - WEB.barra, overflow: "hidden" }}>
      <Img
        src={staticFile(archivo)}
        style={{ width: WEB.ancho, height: alto - WEB.barra, objectFit: "cover", objectPosition: "top", display: "block", transform: `scale(${zoom})`, transformOrigin: `${foco[0] * 100}% ${foco[1] * 100}%` }}
      />
    </div>
  </div>
);

/** Bloque de textos cinéticos de una escena, en su zona (izquierda en 16:9, arriba en 9:16). */
export const TextosZona = ({ textos, finS, tamano }: { textos?: TextoCinetico[]; finS: number; tamano?: number }) => {
  const { width, height, u, vertical } = useLayout();
  if (!textos?.length) return null;
  const zona: CSSProperties = vertical ? { left: 60 * u, right: 60 * u, top: height * 0.09 } : { left: width * 0.055, width: width * 0.3, top: height * 0.36 };
  return (
    <>
      {textos.map((tx, i) => {
        const sig = textos[i + 1];
        return (
          <div key={i} style={{ position: "absolute", ...zona }}>
            <Texto texto={{ ...tx, lado: vertical ? "centro" : "izquierda" }} hastaS={sig ? sig.atS : finS + 1} tamanoBase={tamano ?? (vertical ? 78 : 74)} />
          </div>
        );
      })}
    </>
  );
};

/**
 * Lienzo de una escena de componente: escenario con glow en el componente, el componente centrado en su zona (derecha
 * en 16:9, abajo del texto en 9:16) entrando desde la profundidad, y los textos en la suya.
 */
export const Lienzo = ({
  brillo,
  textos,
  children,
  bloom = 0.22,
  fondo,
  ancho,
}: {
  brillo?: Brillo;
  textos?: TextoCinetico[];
  children: ReactNode;
  bloom?: number;
  /** Capa opcional detrás del componente (ventana desenfocada, plate). */
  fondo?: ReactNode;
  /** Ancho del componente en u. Default: 1000 en 16:9, 960 en 9:16. */
  ancho?: number;
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { width, height, u, vertical } = useLayout();
  const cx = vertical ? 0.5 : 0.655;
  const cy = vertical ? 0.6 : 0.5;
  const w = (ancho ?? (vertical ? 960 : 1000)) * u;
  return (
    <>
      <Stage>
        <Escenario brillo={{ x: cx, y: cy, ...brillo }} />
        {fondo}
      </Stage>
      <Content bloom={bloom}>
        <AbsoluteFill style={{ perspective: 1800 * u }}>
          <div style={{ position: "absolute", left: cx * width - w / 2, top: cy * height, width: w, transform: "translateY(-50%)" }}>
            <div style={desdeProfundidad(frame, 0, u, 18, 40)}>{children}</div>
          </div>
        </AbsoluteFill>
        <TextosZona textos={textos} finS={durationInFrames / fps} />
      </Content>
    </>
  );
};
