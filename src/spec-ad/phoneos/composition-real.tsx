import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import Sfx from "../../reserva/components/sfx";
import { ease } from "../../reserva/motion";
import { C, Escenario, F, FuentesCss, LogoNexora, TextoGrande, springAt } from "./ui";
import { Anillo, Franja, Leyenda, Lienzo, PiezaEntra, PiezaFija, Plano, Telefono, archivoReal, kf, pieza } from "./real-ui";
import type { PhoneOsProps } from "./composition";

/** Tramos de cada plano [desde, largo] en fotogramas a 30 fps. */
export const TR = {
  hook: [0, 84],
  logo: [84, 36],
  escritorio: [120, 54],
  chat: [174, 168],
  origen: [342, 54],
  etapas: [396, 96],
  pipeline: [492, 72],
  cadena: [564, 60],
  texto: [624, 54],
  drop: [678, 45],
  cierre: [723, 72],
} as const;

export const DURACION_REAL = 795;

// Celular: la captura móvil (390 px CSS) dentro de un marco de 900 px de ancho.
const TEL = { x: 90, y: 400, ancho: 900, alto: 1440 };
const ESC_TEL = (TEL.ancho - 28) / 390;

const TEL_HOOK = { x: 90, y: 330, ancho: 900, alto: 1560 };

const Hook = () => {
  const f = useCurrentFrame();
  const chip = pieza("lista", "conv3");
  // Sin la fila del proveedor (conv0): la lista sube una fila y Sofía entra en pantalla.
  const SUBE = -116;
  // Golpe de cámara: el chip "Sin responder hace 52 min" viaja al centro y se agranda.
  const z = kf(f, [[0, 0.92], [26, 1], [36, 1], [46, 2.3], [84, 2.45]]);
  const k = kf(f, [[36, 0], [46, 1]]);
  const fx = TEL_HOOK.x + 14 + (chip.x + 146) * ESC_TEL;
  const fy = TEL_HOOK.y + 14 + (chip.y + SUBE + 120) * ESC_TEL;
  const rx = kf(f, [[0, 22], [26, 0]]);
  const temblor = f >= 46 && f < 56 ? Math.sin(f * 2.3) * (56 - f) * 1.4 : 0;
  return (
    <Escenario intensidad={0.8}>
      <div style={{ position: "absolute", inset: 0, perspective: rx > 0.01 ? 2400 : undefined }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            transformOrigin: `${fx}px ${fy}px`,
            transform: `translate(${(540 - fx) * k + temblor}px, ${(1080 - fy) * k + temblor * 0.5}px)${rx > 0.01 ? ` rotateX(${rx}deg)` : ""} scale(${z})`,
          }}
        >
          <Telefono {...TEL_HOOK} brillo={0.4}>
            <Lienzo escala={ESC_TEL}>
              <Franja escena="lista" desde={0} hasta={230} ancho={390} />
              {["conv1", "conv2", "conv3"].map((id, i) => (
                <PiezaEntra key={id} escena="lista" id={id} at={2 + i * 6} lado="centro" dy={SUBE} />
              ))}
              <Anillo x={chip.x + 68} y={chip.y + SUBE + 109} w={156} h={22} at={44} radio={8} color="#ef4444" />
            </Lienzo>
          </Telefono>
        </div>
      </div>
      <Leyenda texto="30 a 60 consultas" verde="por día." at={4} hasta={40} />
      <Leyenda texto="El que tarda," verde="pierde la venta." at={48} top={130} velo={400} />
      <Sfx name="tarjeta" at={2} volume={0.14} />
      <Sfx name="tarjeta-b" at={8} volume={0.14} />
      <Sfx name="tarjeta-c" at={14} volume={0.14} />
      <Sfx name="zoom-punch" at={44} volume={0.35} />
      <Sfx name="impact" at={46} volume={0.4} />
    </Escenario>
  );
};

const Logo = ({ nombre }: { nombre: string }) => {
  const f = useCurrentFrame();
  const s = springAt(f, 2, { damping: 15, stiffness: 120, mass: 0.9 });
  return (
    <Escenario intensidad={1.8}>
      <div style={{ position: "absolute", left: 540, top: 900 }}>
        {Array.from({ length: 16 }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: ease(f, [4, 22], [0, 260 + (i % 3) * 90]),
              height: 3,
              transformOrigin: "0 50%",
              transform: `rotate(${i * 22.5}deg) translateX(${ease(f, [4, 26], [140, 440])}px)`,
              background: "linear-gradient(90deg, rgba(34,197,94,0.9), transparent)",
              opacity: ease(f, [4, 10]) * (1 - ease(f, [18, 34])),
            }}
          />
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 800, textAlign: "center", transform: `scale(${0.7 + 0.3 * s})`, opacity: s }}>
        <div style={{ fontFamily: F.titulo, fontWeight: 600, fontSize: 190, letterSpacing: "-0.045em", color: C.texto }}>{nombre}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1030, display: "flex", justifyContent: "center", alignItems: "center", gap: 18, opacity: ease(f, [10, 20]) }}>
        <span style={{ fontFamily: F.texto, fontSize: 40, color: C.apagado }}>de</span>
        <LogoNexora ancho={220} />
      </div>
      <Sfx name="whoosh-big" at={2} volume={0.18} />
      <Sfx name="remate" at={8} volume={0.3} />
    </Escenario>
  );
};

/** El panel real en escritorio: la conversación de Paula con el asistente prendido. */
const Escritorio = () => {
  const f = useCurrentFrame();
  const ry = kf(f, [[0, 18], [54, 6]]);
  const ANCHO = 2300;
  const esc = ANCHO / 1440;
  // Paneo de la lista de conversaciones al chat y al interruptor del asistente.
  const x = kf(f, [[0, 610], [54, -806]]);
  const s = kf(f, [[0, 0.96], [54, 1.02]]);
  return (
    <Escenario>
      <div style={{ position: "absolute", inset: 0, perspective: 2200 }}>
        <div
          style={{
            position: "absolute",
            left: 540 - ANCHO / 2 + x,
            top: 560,
            width: ANCHO,
            height: 900 * esc,
            borderRadius: 28,
            overflow: "hidden",
            transform: `rotateY(${-ry}deg) rotateX(6deg) scale(${s})`,
            boxShadow: "0 0 0 2px rgba(255,255,255,0.14), 0 0 90px rgba(34,197,94,0.35), 0 80px 160px rgba(0,0,0,0.85)",
          }}
        >
          <Img src={archivoReal("escritorio", "chat.png")} style={{ width: ANCHO }} />
          <Lienzo escala={esc}>
            <Anillo x={1292} y={17} w={120} h={42} at={34} radio={14} />
          </Lienzo>
        </div>
      </div>
      <Leyenda texto="Atiende tu WhatsApp" verde="24/7." at={6} />
      <Sfx name="whoosh-short" at={4} volume={0.16} />
      <Sfx name="tap" at={36} volume={0.25} />
    </Escenario>
  );
};

/** La conversación real en el celular: los mensajes entran uno por uno y la pantalla acompaña. */
const MENSAJES: { id: string; at: number; lado: "izq" | "der" }[] = [
  { id: "sep0", at: 2, lado: "izq" },
  { id: "m1-0", at: 8, lado: "izq" },
  { id: "m2-0", at: 30, lado: "der" },
  { id: "m3-0", at: 56, lado: "izq" },
  { id: "m4-0", at: 76, lado: "der" },
  { id: "m4-1", at: 90, lado: "der" },
  { id: "m5-0", at: 116, lado: "izq" },
  { id: "m6-0", at: 132, lado: "der" },
  { id: "m6-1", at: 146, lado: "der" },
];

const Chat = () => {
  const f = useCurrentFrame();
  // Lo que se ve debajo de la cabecera (159 px CSS); la pantalla sube para que el último mensaje quede abajo.
  const scroll = kf(f, [[0, 0], [60, 0], [74, 120], [96, 270], [114, 300], [130, 420], [146, 520], [168, 560]]);
  const z = kf(f, [[0, 1], [90, 1.04], [104, 1.16], [126, 1.16], [140, 1.04], [168, 1.08]]);
  const oy = kf(f, [[0, 0], [90, 0], [104, -120], [126, -120], [140, 0]]);
  const ry = kf(f, [[0, -8], [168, 6]]);
  return (
    <Escenario>
      <div style={{ position: "absolute", inset: 0, perspective: 2600 }}>
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${oy}px) rotateY(${ry}deg) scale(${z})` }}>
          <Telefono {...TEL}>
            <Lienzo escala={ESC_TEL} scroll={scroll}>
              <Franja escena="chat" desde={159} hasta={1033} ancho={390} />
              {MENSAJES.map((m) => (
                <PiezaEntra key={m.id} escena="chat" id={m.id} at={m.at} lado={m.lado} />
              ))}
              {/* La tarjeta de la cotización ocupa x 104–378 dentro de su fila. */}
              <Anillo x={104} y={528} w={274} h={152} at={98} hasta={132} radio={12} />
            </Lienzo>
            <Lienzo escala={ESC_TEL}>
              <Franja escena="chat" desde={0} hasta={159} ancho={390} />
            </Lienzo>
          </Telefono>
        </div>
      </div>
      <Leyenda texto="Responde." at={8} hasta={70} />
      <Leyenda texto="Cotiza" verde="el canje." at={76} hasta={128} />
      <Leyenda texto="Agenda" verde="la visita." at={132} />
      {MENSAJES.map((m) => (
        <Sfx key={m.id} name={m.lado === "der" ? "burbuja" : "pop-b"} at={m.at} volume={m.id.startsWith("sep") ? 0 : 0.2} />
      ))}
      <Sfx name="counter" at={98} volume={0.14} />
    </Escenario>
  );
};

/** Ficha real del lead: "Cómo llegó: Anuncio". */
const Origen = () => {
  const f = useCurrentFrame();
  const p = pieza("lead", "como-llego");
  const z = kf(f, [[0, 1.0], [20, 1.0], [34, 1.22], [54, 1.26]]);
  const fy = TEL.y + 14 + (p.y + 14 - 40) * ESC_TEL;
  const sube = kf(f, [[20, 0], [34, 1]]) * (fy - 1060);
  return (
    <Escenario>
      <div style={{ position: "absolute", inset: 0, transformOrigin: `540px ${fy}px`, transform: `translateY(${-sube}px) scale(${z})` }}>
        <Telefono {...TEL}>
          <Lienzo escala={ESC_TEL} scroll={40}>
            <Franja escena="lead" desde={56} hasta={900} ancho={390} />
            <PiezaFija escena="lead" id="como-llego" />
            <Anillo x={p.x - 6} y={p.y - 2} w={p.w + 12} h={p.h + 4} at={24} radio={10} />
          </Lienzo>
          <Lienzo escala={ESC_TEL}>
            <Franja escena="lead" desde={0} hasta={56} ancho={390} />
          </Lienzo>
        </Telefono>
      </div>
      <Leyenda texto="Sabe de dónde" verde="vino cada lead." at={6} velo={330} />
      <Sfx name="whoosh-short" at={2} volume={0.14} />
      <Sfx name="zoom-in-corto" at={34} volume={0.2} />
      <Sfx name="check-b" at={26} volume={0.25} />
    </Escenario>
  );
};

/** Línea de tiempo real del lead: el asistente y el sistema lo mueven de etapa. */
const Etapas = () => {
  const f = useCurrentFrame();
  const ids = Array.from({ length: 9 }, (_, i) => `evento${i}`);
  const scroll = kf(f, [[0, 1440], [96, 1760]]);
  const cambios = new Set(["evento1", "evento3", "evento5", "evento8"]);
  return (
    <Escenario>
      <div style={{ position: "absolute", inset: 0, perspective: 2600 }}>
        <div style={{ position: "absolute", inset: 0, transform: `rotateY(${kf(f, [[0, 8], [96, -6]])}deg) scale(${kf(f, [[0, 1.02], [96, 1.08]])})` }}>
          <Telefono {...TEL}>
            <Lienzo escala={ESC_TEL} scroll={scroll}>
              <Franja escena="lead" desde={1400} hasta={2400} ancho={390} />
              {ids.map((id, i) => (
                <PiezaEntra key={id} escena="lead" id={id} at={4 + i * 9} lado="izq" resalte={cambios.has(id) ? kf(f, [[4 + i * 9 + 6, 0], [4 + i * 9 + 12, 0.8], [4 + i * 9 + 30, 0]]) : 0} />
              ))}
            </Lienzo>
            <Lienzo escala={ESC_TEL}>
              <Franja escena="lead" desde={0} hasta={56} ancho={390} />
            </Lienzo>
          </Telefono>
        </div>
      </div>
      <Leyenda texto="Y lo mueve" verde="de etapa, solo." at={6} />
      {ids.map((id, i) => (
        <Sfx key={id} name={cambios.has(id) ? "check-b" : "tap"} at={4 + i * 9} volume={cambios.has(id) ? 0.2 : 0.12} />
      ))}
    </Escenario>
  );
};

/** Pipeline real del escritorio: la tarjeta de Camila pasa de Cotizó a Turno. */
const Pipeline = () => {
  const f = useCurrentFrame();
  const ESC = 2;
  const camila = pieza("pipeline", "cotizo-3");
  const t = interpolate(f, [16, 40], [0, 1], { easing: Easing.inOut(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lev = Math.sin(Math.PI * t);
  const destinoX = 863 - camila.x;
  const baja = interpolate(f, [26, 40], [0, camila.h + 8], { easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // De la columna Cotizó (centro 706 px CSS) a Turno (989), siguiendo la tarjeta.
  const panX = kf(f, [[0, 540 - 680 * ESC], [16, 540 - 706 * ESC], [44, 540 - 989 * ESC], [72, 540 - 1010 * ESC]]);
  const ids = ["consulta-0", "consulta-1", "consulta-2", "turno-4", "turno-5", "turno-6", "turno-7", "turno-8", "compro-9", "compro-10"];
  return (
    <Escenario>
      <div style={{ position: "absolute", inset: 0, perspective: 2400 }}>
        <div
          style={{
            position: "absolute",
            left: panX,
            top: 560 - 240 * ESC,
            width: 1440 * ESC,
            height: 900 * ESC,
            borderRadius: 30,
            overflow: "hidden",
            transform: `rotateX(${kf(f, [[0, 14], [72, 6]])}deg) rotateY(${kf(f, [[0, -6], [72, 4]])}deg)`,
            boxShadow: "0 0 0 2px rgba(255,255,255,0.14), 0 0 90px rgba(34,197,94,0.3), 0 80px 160px rgba(0,0,0,0.85)",
          }}
        >
          <Lienzo escala={ESC}>
            <Img src={archivoReal("pipeline", "fondo.png")} style={{ position: "absolute", left: 0, top: 0, width: 1440 }} />
            {ids.map((id) => (
              <PiezaFija key={id} escena="pipeline" id={id} dy={id.startsWith("turno") ? baja : 0} />
            ))}
            <PiezaFija
              escena="pipeline"
              id="cotizo-3"
              dx={destinoX * t}
              dy={-lev * 26}
              style={{
                transform: `rotate(${lev * 3}deg) scale(${1 + lev * 0.06})`,
                boxShadow: `0 ${20 * lev}px ${50 * lev}px rgba(0,0,0,${0.7 * lev}), 0 0 ${30 * lev}px rgba(34,197,94,${0.5 * lev})`,
                borderRadius: 14,
                zIndex: 5,
              }}
            />
          </Lienzo>
        </div>
      </div>
      <Leyenda texto="Cada lead," verde="en su etapa." at={4} />
      <Sfx name="whoosh-short" at={2} volume={0.14} />
      <Sfx name="tarjeta" at={18} volume={0.2} />
      <Sfx name="tap" at={40} volume={0.3} />
    </Escenario>
  );
};

/** Trazabilidad real de un lead que compró: lead, conversación, turno, unidad, venta y stock, confirmados. */
const Cadena = () => {
  const f = useCurrentFrame();
  const ids = Array.from({ length: 6 }, (_, i) => `traza${i}`);
  return (
    <Escenario>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${kf(f, [[0, 1.12], [60, 1.2]])})`, transformOrigin: "540px 1000px" }}>
        <Telefono {...TEL}>
          <Lienzo escala={ESC_TEL} scroll={760}>
            <Franja escena="cadena" desde={760} hasta={1420} ancho={390} />
            {ids.map((id, i) => (
              <PiezaEntra key={id} escena="cadena" id={id} at={4 + i * 7} lado="centro" resalte={i === 5 ? kf(f, [[42, 0], [48, 1]]) : 0} />
            ))}
          </Lienzo>
          <Lienzo escala={ESC_TEL}>
            <Franja escena="cadena" desde={0} hasta={56} ancho={390} />
          </Lienzo>
        </Telefono>
      </div>
      <Leyenda texto="Del chat al stock." verde="Todo conectado." at={6} />
      {ids.map((id, i) => (
        <Sfx key={id} name="check-b" at={4 + i * 7} volume={0.18} />
      ))}
      <Sfx name="remate-b" at={44} volume={0.22} />
    </Escenario>
  );
};

const Texto = () => (
  <Escenario intensidad={1.3}>
    <div style={{ position: "absolute", left: 60, right: 60, top: 760 }}>
      <TextoGrande texto="Contesta primero." at={2} tamano={104} />
      <TextoGrande texto="Vende con stock real." at={22} tamano={104} color={C.verde} style={{ marginTop: 18 }} />
    </div>
    <Sfx name="remate" at={4} volume={0.25} />
    <Sfx name="remate-b" at={24} volume={0.28} />
  </Escenario>
);

const Drop = ({ nombre }: { nombre: string }) => {
  const f = useCurrentFrame();
  const s = springAt(f, 2, { damping: 12, stiffness: 140, mass: 1 });
  return (
    <Escenario intensidad={2}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 760, textAlign: "center", transform: `scale(${1.5 - 0.5 * s})`, opacity: s }}>
        <div style={{ fontFamily: F.titulo, fontWeight: 600, fontSize: 220, color: C.texto, letterSpacing: "-0.04em", textShadow: "0 0 80px rgba(34,197,94,0.35)" }}>{nombre}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1030, textAlign: "center" }}>
        <TextoGrande texto="para locales de iPhone" at={12} tamano={62} color={C.apagado} />
      </div>
      <Sfx name="boom-negro" at={2} volume={0.5} />
      <Sfx name="impact" at={2} volume={0.4} />
    </Escenario>
  );
};

const Cierre = ({ cuenta, palabraCta }: { cuenta: string; palabraCta: string }) => (
  <Escenario>
    <div style={{ position: "absolute", left: 0, right: 0, top: 520, display: "flex", justifyContent: "center" }}>
      <LogoNexora ancho={420} />
    </div>
    <div style={{ position: "absolute", left: 60, right: 60, top: 820 }}>
      <TextoGrande texto="Comentá" at={8} tamano={100} />
      <TextoGrande texto={palabraCta} at={16} tamano={190} color={C.verde} style={{ marginTop: 6 }} />
      <TextoGrande texto={cuenta} at={30} tamano={56} color={C.apagado} style={{ marginTop: 50 }} />
    </div>
    <Sfx name="cta-cierre" at={16} volume={0.3} />
  </Escenario>
);

export default function PhoneOsReal({ nombre, palabraCta, cuenta }: PhoneOsProps) {
  const seq = (k: keyof typeof TR, el: React.ReactNode, plano = true) => (
    <Sequence from={TR[k][0]} durationInFrames={TR[k][1]} name={k}>
      {plano ? <Plano frames={TR[k][1]}>{el}</Plano> : el}
    </Sequence>
  );
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <FuentesCss />
      <Audio
        src={staticFile("spec-ad/phoneos/audio/quantum-20s.m4a")}
        volume={(f) => 0.32 * interpolate(f, [DURACION_REAL - 45, DURACION_REAL - 4], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
      {seq("hook", <Hook />, false)}
      {seq("logo", <Logo nombre={nombre} />)}
      {seq("escritorio", <Escritorio />)}
      {seq("chat", <Chat />)}
      {seq("origen", <Origen />)}
      {seq("etapas", <Etapas />)}
      {seq("pipeline", <Pipeline />)}
      {seq("cadena", <Cadena />)}
      {seq("texto", <Texto />)}
      {seq("drop", <Drop nombre={nombre} />)}
      {seq("cierre", <Cierre cuenta={cuenta} palabraCta={palabraCta} />, false)}
    </AbsoluteFill>
  );
}
