import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import Sfx from "../../reserva/components/sfx";
import { ease } from "../../reserva/motion";
import { C, Escenario, F, FuentesCss, LogoNexora } from "./ui";
import { archivoReal, kf, pieza, type Escena } from "./real-ui";
import Telefono3D from "./telefono-3d";
import type { PhoneOsProps } from "./composition";

/**
 * Spec ad 16:9 (1920x1080) con la estética de los reels de referencia (Revolut / Spotify / Amazon): cada plano aísla UNA
 * pieza real del panel en grande sobre negro, golpes de cámara, texto cinético y el logo de remate. El ritmo lo marca la
 * voz en off (Maya, voz preset de Higgsfield): cada plano dura lo que su línea, para que se llegue a leer.
 */

export const TR169 = {
  gancho: [0, 88],
  sinRespuesta: [88, 106],
  tarda: [194, 46],
  pierde: [240, 59],
  logo: [299, 99],
  panel: [398, 157],
  cliente: [555, 95],
  responde: [650, 87],
  canje: [737, 98],
  turno: [835, 98],
  origen: [933, 110],
  etapas: [1043, 115],
  pipeline: [1158, 107],
  cadena: [1265, 188],
  primero: [1453, 64],
  stock: [1517, 59],
  drop: [1576, 138],
  cierre: [1714, 150],
} as const;

export const DURACION_169 = 1864;

/** Línea i de la voz (`audio/vo/vo-ii.mp3`): plano donde arranca y frames desde el inicio del plano. */
const VOZ: [keyof typeof TR169, number][] = [
  ["gancho", 10],
  ["sinRespuesta", 5],
  ["tarda", 4],
  ["logo", 4],
  ["panel", 4],
  ["cliente", 4],
  ["canje", 4],
  ["turno", 4],
  ["origen", 4],
  ["etapas", 4],
  ["pipeline", 4],
  ["cadena", 4],
  ["primero", 4],
  ["drop", 14],
  ["cierre", 6],
];

const W = 1920;
const H = 1080;

/** Recorte de cada burbuja o tarjeta dentro de su fila del chat (px CSS): sin el ícono de responder ni el fondo. */
const RECORTE: Record<string, [number, number, number, number]> = {
  "m1-0": [0, 0, 322, 53],
  "m2-0": [44, 0, 322, 92],
  "m4-0": [44, 0, 322, 90],
  "m4-1": [92, 0, 274, 153],
  "m6-0": [44, 0, 322, 72],
  "m6-1": [92, 0, 274, 130],
};

// ---------------------------------------------------------------------------------------------------------------
// Piezas

/** Aterrizaje con resorte: llega desde el fondo, pasa un poco y se asienta. */
const aterriza = (f: number, at: number) => spring({ frame: f - at, fps: 30, config: { damping: 13, stiffness: 160, mass: 0.8 } });

/** Una pieza real del panel, sola y en grande, con su sombra y brillo. */
const Elemento = ({
  escena,
  id,
  recorte,
  escala,
  cx,
  cy,
  at = 0,
  rx = 0,
  ry = 0,
  rz = 0,
  radio = 22,
  brillo = 0.5,
  anillo = 0,
  barrido,
  style,
  children,
}: {
  escena: Escena;
  id: string;
  recorte?: [number, number, number, number];
  escala: number;
  cx: number;
  cy: number;
  at?: number;
  rx?: number;
  ry?: number;
  rz?: number;
  radio?: number;
  brillo?: number;
  anillo?: number;
  /** 0–1: avance del reflejo de luz que cruza la pieza. */
  barrido?: number;
  style?: CSSProperties;
  /** Capas encima de la pieza, en px del recuadro ya escalado. */
  children?: ReactNode;
}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const p = pieza(escena, id);
  const [x0, y0, w, h] = recorte ?? [0, 0, p.w, p.h];
  const t = aterriza(f, at);
  const o = interpolate(f, [at, at + 5], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: cx - (w * escala) / 2,
        top: cy - (h * escala) / 2,
        width: w * escala,
        height: h * escala,
        borderRadius: radio,
        overflow: "hidden",
        opacity: o,
        transform: `rotateX(${rx + (1 - t) * 28}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${0.55 + 0.45 * t})`,
        filter: `blur(${(1 - o) * 10}px)`,
        boxShadow: `0 0 0 ${anillo > 0 ? 3 : 1.5}px ${anillo > 0 ? `rgba(34,197,94,${0.4 + 0.6 * anillo})` : "rgba(255,255,255,0.12)"}, 0 0 ${90 * brillo + 40 * anillo}px rgba(34,197,94,${0.35 * brillo + 0.4 * anillo}), 0 50px 110px rgba(0,0,0,0.85)`,
        ...style,
      }}
    >
      <Img src={archivoReal(escena, p.archivo)} style={{ position: "absolute", left: -x0 * escala, top: -y0 * escala, width: p.w * escala, height: p.h * escala }} />
      {barrido !== undefined ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.22) 50%, transparent 62%)",
            backgroundSize: "250% 100%",
            backgroundPosition: `${150 - barrido * 200}% 0`,
            mixBlendMode: "screen",
          }}
        />
      ) : null}
      {children}
    </div>
  );
};

/** Plano: entra con látigo lateral (desenfoque direccional) o atravesando, y sale acelerando. */
const Toma = ({
  nombre,
  frames,
  entrada = "latigo",
  children,
}: {
  nombre: string;
  frames: number;
  entrada?: "latigo" | "atraviesa" | "corte";
  children: ReactNode;
}) => {
  const f = useCurrentFrame();
  const tin = entrada === "corte" ? 1 : interpolate(f, [0, 8], [0, 1], { easing: Easing.out(Easing.cubic), extrapolateRight: "clamp" });
  const tout = interpolate(f, [frames - 6, frames], [0, 1], { easing: Easing.in(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const x = (entrada === "latigo" ? (1 - tin) * 760 : 0) - tout * 760;
  const s = entrada === "atraviesa" ? 1.35 - 0.35 * tin : 1;
  const bx = (entrada === "latigo" ? (1 - tin) * 46 : 0) + tout * 46;
  const bz = entrada === "atraviesa" ? (1 - tin) * 14 : 0;
  const id = `mb-${nombre}`;
  return (
    <AbsoluteFill>
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <filter id={id} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={`${bx.toFixed(1)} ${bz.toFixed(1)}`} />
        </filter>
      </svg>
      <AbsoluteFill
        style={{
          opacity: Math.min(1, tin * 1.6) * (1 - tout * 0.6),
          transform: `translateX(${x}px) scale(${s})`,
          filter: bx + bz > 0.6 ? `url(#${id})` : undefined,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Rótulo arriba, centrado: corto, la palabra clave en verde. */
const Rotulo = ({ texto, verde, at = 4, top = 70 }: { texto: string; verde?: string; at?: number; top?: number }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [at, at + 10], [0, 1], { easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top,
        textAlign: "center",
        fontFamily: F.titulo,
        fontWeight: 600,
        fontSize: 78,
        letterSpacing: "-0.02em",
        wordSpacing: "0.16em",
        color: C.texto,
        opacity: t,
        transform: `translateY(${(1 - t) * 26}px)`,
        filter: `blur(${(1 - t) * 10}px)`,
      }}
    >
      {texto}
      {verde ? <span style={{ color: C.verde }}> {verde}</span> : null}
    </div>
  );
};

/** Texto cinético grande: palabra por palabra, desde abajo y desenfocadas. */
const Cinetico = ({ palabras, verdes = [], at = 2, tamano = 170 }: { palabras: string[]; verdes?: number[]; at?: number; tamano?: number }) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        top: 0,
        bottom: 0,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignContent: "center",
        columnGap: tamano * 0.28,
        fontFamily: F.titulo,
        fontWeight: 600,
        fontSize: tamano,
        letterSpacing: "-0.035em",
        lineHeight: 1.02,
      }}
    >
      {palabras.map((p, i) => {
        const t = interpolate(f, [at + i * 3, at + i * 3 + 9], [0, 1], { easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <span key={i} style={{ display: "inline-block", color: verdes.includes(i) ? C.verde : C.texto, opacity: t, transform: `translateY(${(1 - t) * 70}px)`, filter: `blur(${(1 - t) * 16}px)` }}>
            {p}
          </span>
        );
      })}
    </div>
  );
};

/** Destello al aterrizar: flash suave + raya horizontal verde. */
const Destello = ({ at, y = H / 2 }: { at: number; y?: number }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [at, at + 2, at + 14], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (t <= 0) return null;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(900px 500px at 50% ${y}px, rgba(34,197,94,${0.35 * t}), transparent 70%)`, mixBlendMode: "screen" }} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: y - 3,
          height: 6,
          background: `linear-gradient(90deg, transparent, rgba(190,255,215,${0.9 * t}) 50%, transparent)`,
          filter: "blur(2px)",
          transform: `scaleX(${0.4 + 0.6 * t})`,
        }}
      />
    </>
  );
};

/** Temblor corto de cámara desde `at`. */
const temblor = (f: number, at: number, fuerza = 9) => (f >= at && f < at + 8 ? Math.sin((f - at) * 2.6) * (at + 8 - f) * (fuerza / 8) : 0);

const Perspectiva = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <div style={{ position: "absolute", inset: 0, perspective: 2400, ...style }}>{children}</div>
);

// ---------------------------------------------------------------------------------------------------------------
// Planos

/** Gancho: el iPhone con el panel real llega dando vueltas, se clava al centro y la cámara entra en la pantalla. */
const Gancho = ({ d }: { d: number }) => {
  const f = useCurrentFrame();
  const llega = interpolate(f, [0, 9], [0, 1], { easing: Easing.out(Easing.cubic), extrapolateRight: "clamp" });
  const golpe = spring({ frame: f - 9, fps: 30, config: { damping: 9, stiffness: 220, mass: 0.6 } });
  const z = -38 * (1 - llega);
  const rot: [number, number, number] = [
    1.4 * (1 - llega) + 0.06,
    -3.1 * (1 - llega) + kf(f, [[9, -0.28], [d - 12, 0.12]]),
    0.7 * (1 - llega) + 0.03,
  ];
  const entra = kf(f, [[d - 16, 1], [d - 2, 4.2]]);
  const sh = temblor(f, 9);
  return (
    <Escenario intensidad={0.7 + 1.2 * interpolate(f, [9, 11, 26], [0, 1, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${sh}px, ${sh * 0.6}px)` }}>
        <Telefono3D ancho={W} alto={H} pantalla="spec-ad/phoneos/real/tex-lista.png" rotacion={rot} posicion={[0, 0, z]} escala={(f >= 9 ? 1.06 - 0.06 * golpe : 1) * entra} />
      </div>
      <Destello at={9} />
      <div style={{ position: "absolute", inset: 0, background: "#000", opacity: kf(f, [[d - 8, 0], [d, 1]]) }} />
      <Sfx name="whoosh-big" at={8} volume={0.22} />
      <Sfx name="impact" at={9} volume={0.45} />
      <Sfx name="zoom-in-corto" at={d - 4} volume={0.25} />
    </Escenario>
  );
};

/** El chip real "Sin responder hace … min" de una clienta, gigante. */
const SinRespuesta = ({ d }: { d: number }) => {
  const f = useCurrentFrame();
  const esc = 3.4;
  return (
    <Escenario intensidad={0.6}>
      <Perspectiva>
        <Elemento escena="lista" id="conv3" escala={esc} cx={W / 2 + 120} cy={H / 2 - 20} at={0} ry={kf(f, [[0, -14], [d, -4]])} radio={30} brillo={0.2}>
          <div
            style={{
              position: "absolute",
              left: 68 * esc - 8,
              top: 109 * esc - 8,
              width: 156 * esc + 16,
              height: 22 * esc + 16,
              borderRadius: 24,
              border: "4px solid #ef4444",
              boxShadow: `0 0 ${30 + 20 * Math.sin(f / 3)}px #ef4444`,
              opacity: kf(f, [[8, 0], [14, 1]]),
            }}
          />
        </Elemento>
      </Perspectiva>
      <Sfx name="tarjeta" at={1} volume={0.2} />
      <Sfx name="tap" at={10} volume={0.3} />
    </Escenario>
  );
};

/** El nombre cae justo cuando la voz lo dice ("Te presento… PhoneOS"); "de Nexora" entra con su palabra. */
const Logo = ({ nombre }: { nombre: string }) => {
  const f = useCurrentFrame();
  const G = 32;
  const s = spring({ frame: f - G, fps: 30, config: { damping: 15, stiffness: 120, mass: 0.9 } });
  return (
    <Escenario intensidad={interpolate(f, [0, G, G + 2], [0.5, 1, 1.8], { extrapolateRight: "clamp" })}>
      <div style={{ position: "absolute", left: W / 2, top: 500 }}>
        {Array.from({ length: 16 }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: ease(f, [G + 2, G + 20], [0, 320 + (i % 3) * 120]),
              height: 3,
              transformOrigin: "0 50%",
              transform: `rotate(${i * 22.5}deg) translateX(${ease(f, [G + 2, G + 24], [170, 560])}px)`,
              background: "linear-gradient(90deg, rgba(34,197,94,0.9), transparent)",
              opacity: ease(f, [G + 2, G + 8]) * (1 - ease(f, [G + 16, G + 32])),
            }}
          />
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", transform: `scale(${0.7 + 0.3 * s})`, opacity: s }}>
        <div style={{ fontFamily: F.titulo, fontWeight: 600, fontSize: 220, letterSpacing: "-0.045em", color: C.texto }}>{nombre}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 650, display: "flex", justifyContent: "center", alignItems: "center", gap: 18, opacity: ease(f, [G + 26, G + 34]) }}>
        <span style={{ fontFamily: F.texto, fontSize: 42, color: C.apagado }}>de</span>
        <LogoNexora ancho={240} />
      </div>
      <Destello at={G + 1} y={500} />
      <Sfx name="whoosh-big" at={G} volume={0.18} />
      <Sfx name="remate" at={G + 4} volume={0.32} />
    </Escenario>
  );
};

/** El panel real de escritorio, de lejos y en 3D: es un producto de verdad. */
const Panel = ({ d }: { d: number }) => {
  const f = useCurrentFrame();
  const ANCHO = 1500;
  return (
    <Escenario>
      <Perspectiva>
        <div
          style={{
            position: "absolute",
            left: W / 2 - ANCHO / 2 + kf(f, [[0, 120], [d, -60]]),
            top: 190,
            width: ANCHO,
            height: (ANCHO * 1000) / 1440,
            borderRadius: 24,
            overflow: "hidden",
            transform: `rotateY(${kf(f, [[0, -26], [d, -8]])}deg) rotateX(${kf(f, [[0, 10], [d, 3]])}deg) scale(${kf(f, [[0, 0.92], [d, 1.02]])})`,
            boxShadow: "0 0 0 2px rgba(255,255,255,0.14), 0 0 120px rgba(34,197,94,0.32), 0 80px 160px rgba(0,0,0,0.85)",
          }}
        >
          <Img src={archivoReal("chat-esc", "completo.png")} style={{ width: ANCHO }} />
        </div>
      </Perspectiva>
      <Rotulo texto="Tu WhatsApp," verde="atendido por IA." top={60} />
    </Escenario>
  );
};

/** Una burbuja real del chat, gigante. */
const Burbuja = ({ id, rotulo, verde, lado, d }: { id: string; rotulo?: string; verde?: string; lado: "izq" | "der"; d: number }) => {
  const f = useCurrentFrame();
  return (
    <Escenario>
      <Perspectiva>
        <Elemento escena="chat" id={id} recorte={RECORTE[id]} escala={3.3} cx={W / 2 + (lado === "izq" ? -40 : 40)} cy={H / 2 + 60} at={2} ry={kf(f, [[0, lado === "izq" ? 10 : -10], [d, lado === "izq" ? -3 : 3]])} radio={46} brillo={lado === "der" ? 0.7 : 0.25} />
      </Perspectiva>
      {rotulo ? <Rotulo texto={rotulo} verde={verde} at={8} /> : null}
      <Sfx name={lado === "der" ? "burbuja" : "pop-b"} at={2} volume={0.3} />
    </Escenario>
  );
};

/** HÉROE: la tarjeta real de la cotización del canje, girando bajo la luz. */
const Canje = ({ d }: { d: number }) => {
  const f = useCurrentFrame();
  return (
    <Escenario intensidad={1.2}>
      <Perspectiva>
        <Elemento
          escena="chat"
          id="m4-1"
          recorte={RECORTE["m4-1"]}
          escala={3.4}
          cx={W / 2}
          cy={H / 2 + 70}
          at={2}
          ry={kf(f, [[0, -20], [d, 10]])}
          rx={kf(f, [[0, 8], [d, -3]])}
          radio={40}
          brillo={1}
          anillo={kf(f, [[18, 0], [26, 1]])}
          barrido={kf(f, [[10, 0], [44, 1]])}
        />
      </Perspectiva>
      <Rotulo texto="Cotiza" verde="el canje." at={6} />
      <Destello at={2} y={H / 2 + 70} />
      <Sfx name="tarjeta" at={2} volume={0.25} />
      <Sfx name="counter" at={20} volume={0.16} />
      <Sfx name="remate-b" at={24} volume={0.2} />
    </Escenario>
  );
};

const Turno = ({ d }: { d: number }) => {
  const f = useCurrentFrame();
  return (
    <Escenario>
      <Perspectiva>
        <Elemento escena="chat" id="m6-1" recorte={RECORTE["m6-1"]} escala={3.6} cx={W / 2} cy={H / 2 + 80} at={2} ry={kf(f, [[0, 14], [d, -5]])} radio={40} brillo={0.8} anillo={kf(f, [[14, 0], [22, 1]])} />
      </Perspectiva>
      <Rotulo texto="Agenda" verde="la visita." at={6} />
      <Sfx name="tarjeta-b" at={2} volume={0.25} />
      <Sfx name="check-b" at={16} volume={0.25} />
    </Escenario>
  );
};

const Origen = ({ d }: { d: number }) => {
  const f = useCurrentFrame();
  return (
    <Escenario>
      <Perspectiva>
        <Elemento escena="lead" id="como-llego" escala={4.4} cx={W / 2} cy={H / 2 + 60} at={2} rx={kf(f, [[0, 14], [d, -2]])} radio={20} brillo={0.6} anillo={kf(f, [[12, 0], [20, 1]])} />
      </Perspectiva>
      <Rotulo texto="Sabe de dónde" verde="vino cada lead." at={6} />
      <Sfx name="whoosh-short" at={0} volume={0.14} />
      <Sfx name="check-b" at={14} volume={0.25} />
    </Escenario>
  );
};

/** Los cambios de etapa reales del lead, apilándose uno por uno. */
const Etapas = ({ d }: { d: number }) => {
  const f = useCurrentFrame();
  const ids = ["evento1", "evento3", "evento5", "evento8"];
  const at = (i: number) => 6 + i * 16;
  return (
    <Escenario>
      <Perspectiva style={{ transform: `translateY(${kf(f, [[0, 40], [d, -30]])}px)` }}>
        {ids.map((id, i) => (
          <Elemento
            key={id}
            escena="lead"
            id={id}
            escala={2.35}
            cx={W / 2 + (i - 1.5) * 46}
            cy={300 + i * 196}
            at={at(i)}
            ry={kf(f, [[0, -12], [d, -3]])}
            radio={18}
            brillo={0.35}
            anillo={kf(f, [[at(i) + 4, 0], [at(i) + 9, 1], [at(i) + 30, 0.25]])}
          />
        ))}
      </Perspectiva>
      <Rotulo texto="Y lo mueve" verde="de etapa, solo." at={4} top={48} />
      {ids.map((id, i) => (
        <Sfx key={id} name="check-b" at={at(i)} volume={0.22} />
      ))}
    </Escenario>
  );
};

/** Pipeline real del escritorio: la tarjeta salta de columna. */
const Pipeline = ({ d }: { d: number }) => {
  const f = useCurrentFrame();
  const S = 1.9;
  const camila = pieza("pipeline", "cotizo-3");
  const t = interpolate(f, [18, 46], [0, 1], { easing: Easing.inOut(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lev = Math.sin(Math.PI * t);
  const baja = interpolate(f, [30, 46], [0, camila.h + 8], { easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cx = kf(f, [[0, 760], [d, 960]]);
  const cy = 470;
  const ids = ["consulta-0", "consulta-1", "consulta-2", "turno-4", "turno-5", "turno-6", "turno-7", "turno-8", "compro-9", "compro-10"];
  return (
    <Escenario>
      <Perspectiva>
        <div
          style={{
            position: "absolute",
            left: 110,
            top: 170,
            width: W - 220,
            height: H - 230,
            borderRadius: 26,
            overflow: "hidden",
            background: "#0a0a0a",
            transform: `rotateX(${kf(f, [[0, 12], [d, 4]])}deg)`,
            boxShadow: "0 0 0 2px rgba(255,255,255,0.14), 0 0 100px rgba(34,197,94,0.3), 0 70px 140px rgba(0,0,0,0.85)",
          }}
        >
          <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: `translate(${(W - 220) / 2 - cx * S}px, ${(H - 230) / 2 - cy * S}px) scale(${S})` }}>
            <Img src={archivoReal("pipeline", "fondo.png")} style={{ position: "absolute", left: 0, top: 0, width: 1440 }} />
            {ids.map((id) => {
              const p = pieza("pipeline", id);
              return <Img key={id} src={archivoReal("pipeline", p.archivo)} style={{ position: "absolute", left: p.x, top: p.y + (id.startsWith("turno") ? baja : 0), width: p.w, height: p.h }} />;
            })}
            <Img
              src={archivoReal("pipeline", camila.archivo)}
              style={{
                position: "absolute",
                left: camila.x + (863 - camila.x) * t,
                top: camila.y - lev * 24,
                width: camila.w,
                height: camila.h,
                borderRadius: 14,
                transform: `rotate(${lev * 3}deg) scale(${1 + lev * 0.07})`,
                boxShadow: `0 ${18 * lev}px ${46 * lev}px rgba(0,0,0,${0.7 * lev}), 0 0 ${30 * lev}px rgba(34,197,94,${0.55 * lev})`,
              }}
            />
          </div>
        </div>
      </Perspectiva>
      <Rotulo texto="Cada lead," verde="en su etapa." at={2} top={50} />
      <Sfx name="tarjeta" at={20} volume={0.22} />
      <Sfx name="tap" at={46} volume={0.3} />
    </Escenario>
  );
};

/** HÉROE: la trazabilidad real de una venta, los seis eslabones confirmados; "Stock" cae cuando la voz dice "stock". */
const Cadena = ({ d }: { d: number }) => {
  const f = useCurrentFrame();
  const pos: [number, number][] = [
    [560, 400],
    [560, 540],
    [560, 680],
    [1360, 380],
    [1360, 545],
    [1360, 710],
  ];
  const at = (i: number) => (i < 5 ? 8 + i * 30 : 158);
  return (
    <Escenario intensidad={1.1}>
      <Perspectiva style={{ transform: `scale(${kf(f, [[0, 0.95], [d, 1.04]])})` }}>
        {pos.map(([x, y], i) => (
          <Elemento
            key={i}
            escena="cadena"
            id={`traza${i}`}
            escala={2.1}
            cx={x}
            cy={y + 40}
            at={at(i)}
            ry={i < 3 ? 8 : -8}
            radio={20}
            brillo={i === 5 ? 1 : 0.3}
            anillo={i === 5 ? kf(f, [[at(5) + 6, 0], [at(5) + 12, 1]]) : 0}
          />
        ))}
      </Perspectiva>
      <Rotulo texto="Del chat al stock," verde="todo conectado." at={2} top={60} />
      {pos.map((_, i) => (
        <Sfx key={i} name="check-b" at={at(i)} volume={0.2} />
      ))}
      <Sfx name="remate-b" at={at(5) + 8} volume={0.24} />
    </Escenario>
  );
};

/** El nombre cae con la palabra en la voz; "para locales de iPhone" entra con la suya. */
const Drop = ({ nombre }: { nombre: string }) => {
  const f = useCurrentFrame();
  const G = 15;
  const s = spring({ frame: f - G, fps: 30, config: { damping: 12, stiffness: 140, mass: 1 } });
  return (
    <Escenario intensidad={interpolate(f, [0, G, G + 2], [0.6, 1, 2], { extrapolateRight: "clamp" })}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", transform: `scale(${1.5 - 0.5 * s})`, opacity: s }}>
        <div style={{ fontFamily: F.titulo, fontWeight: 600, fontSize: 250, color: C.texto, letterSpacing: "-0.045em", textShadow: "0 0 80px rgba(34,197,94,0.35)" }}>{nombre}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 650, textAlign: "center", fontFamily: F.texto, fontSize: 58, color: C.apagado, opacity: ease(f, [75, 85]) }}>
        para locales de iPhone
      </div>
      <Destello at={G} y={480} />
      <Sfx name="boom-negro" at={G} volume={0.5} />
      <Sfx name="impact" at={G} volume={0.4} />
    </Escenario>
  );
};

const Cierre = ({ cuenta, palabraCta }: { cuenta: string; palabraCta: string }) => {
  const f = useCurrentFrame();
  const a = (at: number) => interpolate(f, [at, at + 10], [0, 1], { easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Escenario>
      <div style={{ position: "absolute", left: 0, right: 0, top: 210, display: "flex", justifyContent: "center", opacity: a(2) }}>
        <LogoNexora ancho={360} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 400, textAlign: "center", fontFamily: F.titulo, fontWeight: 600, fontSize: 96, color: C.texto, opacity: a(8), transform: `translateY(${(1 - a(8)) * 30}px)` }}>
        Comentá <span style={{ color: C.verde }}>{palabraCta}</span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", fontFamily: F.texto, fontSize: 50, color: C.apagado, opacity: a(18) }}>{cuenta}</div>
      <Sfx name="cta-cierre" at={8} volume={0.3} />
    </Escenario>
  );
};

export default function PhoneOs169({ nombre, palabraCta, cuenta }: PhoneOsProps) {
  const toma = (k: keyof typeof TR169, el: ReactNode, entrada: "latigo" | "atraviesa" | "corte" = "latigo") => (
    <Sequence from={TR169[k][0]} durationInFrames={TR169[k][1]} name={k}>
      <Toma nombre={k} frames={TR169[k][1]} entrada={entrada}>
        {el}
      </Toma>
    </Sequence>
  );
  const d = (k: keyof typeof TR169) => TR169[k][1];
  const finVoz = TR169.cierre[0] + VOZ[14][1] + 115;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <FuentesCss />
      {/* Música ~15 dB debajo de la voz; sube cuando la voz termina y se va con el cierre. */}
      <Audio
        src={staticFile("spec-ad/phoneos/audio/quantum-20s-63.m4a")}
        volume={(f) =>
          interpolate(f, [finVoz, finVoz + 10], [0.15, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
          interpolate(f, [DURACION_169 - 30, DURACION_169 - 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
        }
      />
      {VOZ.map(([k, desde], i) => (
        <Sequence key={i} from={TR169[k][0] + desde} name={`voz-${i}`}>
          <Audio src={staticFile(`spec-ad/phoneos/audio/vo/vo-${String(i).padStart(2, "0")}.mp3`)} />
        </Sequence>
      ))}
      <Sequence from={TR169.gancho[0]} durationInFrames={TR169.gancho[1]} name="gancho">
        <Gancho d={d("gancho")} />
      </Sequence>
      {toma("sinRespuesta", <SinRespuesta d={d("sinRespuesta")} />, "atraviesa")}
      {toma(
        "tarda",
        <Escenario>
          <Cinetico palabras={["El", "que", "tarda,"]} />
          <Sfx name="remate" at={2} volume={0.26} />
        </Escenario>,
        "corte",
      )}
      {toma(
        "pierde",
        <Escenario intensidad={1.4}>
          <Cinetico palabras={["pierde", "la", "venta."]} verdes={[0, 1, 2]} />
          <Sfx name="remate-b" at={2} volume={0.3} />
          <Sfx name="impact" at={2} volume={0.3} />
        </Escenario>,
        "corte",
      )}
      {toma("logo", <Logo nombre={nombre} />, "atraviesa")}
      {toma("panel", <Panel d={d("panel")} />)}
      {toma("cliente", <Burbuja id="m1-0" lado="izq" d={d("cliente")} />)}
      {toma("responde", <Burbuja id="m2-0" lado="der" rotulo="Responde" verde="solo." d={d("responde")} />)}
      {toma("canje", <Canje d={d("canje")} />, "atraviesa")}
      {toma("turno", <Turno d={d("turno")} />)}
      {toma("origen", <Origen d={d("origen")} />)}
      {toma("etapas", <Etapas d={d("etapas")} />)}
      {toma("pipeline", <Pipeline d={d("pipeline")} />)}
      {toma("cadena", <Cadena d={d("cadena")} />, "atraviesa")}
      {toma(
        "primero",
        <Escenario>
          <Cinetico palabras={["Contesta", "primero."]} />
          <Sfx name="remate" at={2} volume={0.26} />
        </Escenario>,
        "corte",
      )}
      {toma(
        "stock",
        <Escenario intensidad={1.4}>
          <Cinetico palabras={["Vende", "con", "stock", "real."]} verdes={[2, 3]} />
          <Sfx name="remate-b" at={2} volume={0.3} />
        </Escenario>,
        "corte",
      )}
      {toma("drop", <Drop nombre={nombre} />, "atraviesa")}
      <Sequence from={TR169.cierre[0]} durationInFrames={TR169.cierre[1]} name="cierre">
        <Cierre cuenta={cuenta} palabraCta={palabraCta} />
      </Sequence>
    </AbsoluteFill>
  );
}
