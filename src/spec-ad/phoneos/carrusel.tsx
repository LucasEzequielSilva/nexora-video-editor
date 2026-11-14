import { useEffect, useState, type ReactNode } from "react";
import { AbsoluteFill, Img, continueRender, delayRender, useCurrentFrame } from "remotion";
import { C, Escenario, F, FuentesCss, LogoNexora } from "./ui";
import { archivoReal, pieza, type Escena } from "./real-ui";
import { REAL } from "./real";
import type { PhoneOsProps } from "./composition";

/** Carrusel de feed (1080x1350): cada fotograma es un slide con una pantalla real del panel en grande. */

const ANCHO = 1080;

type Caja = { x: number; y: number; w: number; h: number };

/** Recorte de una captura completa (px CSS) a una escala dada, en una tarjeta de vidrio. */
const Captura = ({
  escena,
  region,
  escala,
  top,
  marcos = [],
  sangra = false,
}: {
  escena: Escena;
  region: Caja;
  escala: number;
  top: number;
  marcos?: (Caja & { color?: string; radio?: number })[];
  sangra?: boolean;
}) => {
  const w = region.w * escala;
  const h = region.h * escala;
  return (
    <div
      style={{
        position: "absolute",
        left: (ANCHO - w) / 2,
        top,
        width: w,
        height: h,
        borderRadius: sangra ? "40px 40px 0 0" : 36,
        overflow: "hidden",
        background: "#0a0a0a",
        boxShadow: "0 0 0 2px rgba(255,255,255,0.13), 0 0 90px rgba(34,197,94,0.28), 0 60px 120px rgba(0,0,0,0.8)",
      }}
    >
      <Img
        src={archivoReal(escena, "completo.png")}
        style={{ position: "absolute", left: -region.x * escala, top: -region.y * escala, width: REAL[escena].ancho * escala }}
      />
      {marcos.map((m, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: (m.x - region.x) * escala - 6,
            top: (m.y - region.y) * escala - 6,
            width: m.w * escala + 12,
            height: m.h * escala + 12,
            borderRadius: m.radio ?? 18,
            border: `3px solid ${m.color ?? C.verde}`,
            boxShadow: `0 0 26px ${m.color ?? C.verde}, inset 0 0 14px ${m.color === undefined ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
          }}
        />
      ))}
    </div>
  );
};

const Cabecera = ({ n, total }: { n: number; total: number }) => (
  <div style={{ position: "absolute", left: 72, right: 72, top: 56, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: F.texto, fontSize: 28, color: C.apagado }}>
    <span>
      <span style={{ fontFamily: F.titulo, fontWeight: 600, color: C.texto, letterSpacing: "-0.01em" }}>PhoneOS</span> · de Nexora
    </span>
    <span style={{ fontVariantNumeric: "tabular-nums" }}>
      {n}/{total}
    </span>
  </div>
);

const Titular = ({ texto, verde, top = 128, tamano = 84, salto = false }: { texto: string; verde?: string; top?: number; tamano?: number; salto?: boolean }) => (
  <div
    style={{
      position: "absolute",
      left: 72,
      right: 72,
      top,
      fontFamily: F.titulo,
      fontWeight: 600,
      fontSize: tamano,
      lineHeight: 1.04,
      letterSpacing: "-0.02em",
      wordSpacing: "0.16em",
      color: C.texto,
    }}
  >
    {texto}
    {salto ? <br /> : null}
    {verde ? <span style={{ color: C.verde }}>{salto ? "" : " "}{verde}</span> : null}
  </div>
);

const Bajada = ({ children, top }: { children: ReactNode; top: number }) => (
  <div style={{ position: "absolute", left: 72, right: 72, top, fontFamily: F.texto, fontSize: 34, lineHeight: 1.35, color: "#a1a1aa" }}>{children}</div>
);

const Slide = ({ n, total, children }: { n: number; total: number; children: ReactNode }) => (
  <Escenario intensidad={0.9}>
    <Cabecera n={n} total={total} />
    {children}
  </Escenario>
);

const conv3 = pieza("lista", "conv3");

const SLIDES: ((n: number, total: number, p: PhoneOsProps) => ReactNode)[] = [
  // 1. Portada: el problema, con la pantalla real.
  (n, total) => (
    <Slide n={n} total={total}>
      <Titular texto="El que tarda," verde="pierde la venta." top={150} tamano={104} salto />
      <Bajada top={390}>El cliente le compra al primero que contesta.</Bajada>
      <div
        style={{
          position: "absolute",
          left: (ANCHO - conv3.w * 2.4) / 2,
          top: 560,
          width: conv3.w * 2.4,
          height: conv3.h * 2.4,
          borderRadius: 36,
          overflow: "hidden",
          background: "#0a0a0a",
          boxShadow: "0 0 0 2px rgba(255,255,255,0.13), 0 0 90px rgba(239,68,68,0.22), 0 60px 120px rgba(0,0,0,0.8)",
        }}
      >
        <Img src={archivoReal("lista", conv3.archivo)} style={{ width: conv3.w * 2.4 }} />
        <div
          style={{
            position: "absolute",
            left: 68 * 2.4 - 6,
            top: 109 * 2.4 - 6,
            width: 156 * 2.4 + 12,
            height: 22 * 2.4 + 12,
            borderRadius: 18,
            border: "3px solid #ef4444",
            boxShadow: "0 0 26px #ef4444",
          }}
        />
      </div>
      <div style={{ position: "absolute", right: 72, bottom: 64, fontFamily: F.texto, fontSize: 30, color: C.apagado }}>Deslizá →</div>
    </Slide>
  ),
  // 2. El asistente contesta en el WhatsApp del negocio.
  (n, total) => (
    <Slide n={n} total={total}>
      <Titular texto="Atiende tu WhatsApp" verde="24/7." />
      <Bajada top={250}>Un asistente con IA contesta cada consulta, con tus precios y tu stock.</Bajada>
      <Captura escena="chat" region={{ x: 0, y: 56, w: 390, h: 420 }} escala={2.2} top={430} sangra />
    </Slide>
  ),
  // 3. Cotización del canje.
  (n, total) => (
    <Slide n={n} total={total}>
      <Titular texto="Cotiza el canje" verde="al instante." />
      <Bajada top={250}>El rango sale del cotizador de tu negocio, no de la IA. El valor final se confirma al ver el equipo.</Bajada>
      <Captura
        escena="chat"
        region={{ x: 12, y: 428, w: 366, h: 258 }}
        escala={2.5}
        top={490}
        marcos={[{ x: 104, y: 528, w: 274, h: 152 }]}
      />
    </Slide>
  ),
  // 4. Turno agendado.
  (n, total) => (
    <Slide n={n} total={total}>
      <Titular texto="Agenda" verde="la visita." />
      <Bajada top={250}>Ofrece horarios, reserva el turno y te lo deja en la agenda.</Bajada>
      <Captura
        escena="chat"
        region={{ x: 12, y: 680, w: 366, h: 275 }}
        escala={2.5}
        top={450}
        marcos={[{ x: 104, y: 821, w: 274, h: 129 }]}
      />
    </Slide>
  ),
  // 5. Origen del lead.
  (n, total) => {
    const p = pieza("lead", "como-llego");
    return (
      <Slide n={n} total={total}>
        <Titular texto="Sabe de dónde" verde="vino cada lead." salto />
        <Bajada top={330}>Anuncio, web, orgánico o referido: cada lead queda con su origen.</Bajada>
        <Captura escena="lead" region={{ x: 0, y: 70, w: 390, h: 340 }} escala={2.3} top={500} marcos={[{ x: p.x - 4, y: p.y - 2, w: p.w + 8, h: p.h + 4, radio: 14 }]} />
      </Slide>
    );
  },
  // 6. Etapas que mueven el asistente y el sistema.
  (n, total) => (
    <Slide n={n} total={total}>
      <Titular texto="Y lo mueve" verde="de etapa, solo." />
      <Bajada top={250}>Cada paso queda registrado: quién lo hizo y cuándo.</Bajada>
      <Captura escena="lead" region={{ x: 16, y: 1540, w: 362, h: 366 }} escala={2.15} top={400} />
    </Slide>
  ),
  // 7. Pipeline del escritorio.
  (n, total) => (
    <Slide n={n} total={total}>
      <Titular texto="Todo tu pipeline," verde="a la vista." />
      <Bajada top={250}>Desde el celular o la compu: en qué etapa está cada cliente.</Bajada>
      <Captura escena="pipeline" region={{ x: 855, y: 245, w: 555, h: 500 }} escala={1.68} top={400} />
    </Slide>
  ),
  // 8. Trazabilidad completa de una venta.
  (n, total) => (
    <Slide n={n} total={total}>
      <Titular texto="Del chat al stock," verde="todo conectado." salto />
      <Bajada top={330}>Lead, conversación, turno, unidad por IMEI, venta y stock.</Bajada>
      <Captura escena="cadena" region={{ x: 10, y: 916, w: 370, h: 428 }} escala={1.85} top={470} />
    </Slide>
  ),
  // 9. Cierre.
  (n, total, { nombre, palabraCta, cuenta }) => (
    <Slide n={n} total={total}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", fontFamily: F.titulo, fontWeight: 600, fontSize: 190, letterSpacing: "-0.04em", color: C.texto, textShadow: "0 0 80px rgba(34,197,94,0.35)" }}>
        {nombre}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 570, display: "flex", justifyContent: "center", alignItems: "center", gap: 18 }}>
        <span style={{ fontFamily: F.texto, fontSize: 40, color: C.apagado }}>de</span>
        <LogoNexora ancho={240} />
      </div>
      <div style={{ position: "absolute", left: 72, right: 72, top: 720, textAlign: "center", fontFamily: F.titulo, fontWeight: 600, fontSize: 64, lineHeight: 1.1, letterSpacing: "-0.02em", wordSpacing: "0.16em", color: C.texto }}>
        Contesta primero.
        <br />
        <span style={{ color: C.verde }}>Vende con stock real.</span>
      </div>
      <div style={{ position: "absolute", left: 72, right: 72, top: 960, textAlign: "center", fontFamily: F.texto, fontSize: 44, color: C.texto }}>
        Comentá <span style={{ fontFamily: F.titulo, fontWeight: 600, color: C.verde, fontSize: 64 }}>{palabraCta}</span>
      </div>
      <div style={{ position: "absolute", left: 72, right: 72, top: 1070, textAlign: "center", fontFamily: F.texto, fontSize: 36, color: C.apagado }}>{cuenta}</div>
    </Slide>
  ),
];

export const SLIDES_TOTAL = SLIDES.length;

export default function PhoneOsCarrusel(props: PhoneOsProps) {
  const f = useCurrentFrame();
  const [espera] = useState(() => delayRender("fuente Europa Grotesk"));
  useEffect(() => {
    document.fonts.load("600 80px 'Europa Grotesk'").finally(() => continueRender(espera));
  }, [espera]);
  const i = Math.min(SLIDES.length - 1, Math.max(0, f));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <FuentesCss />
      {SLIDES[i](i + 1, SLIDES.length, props)}
    </AbsoluteFill>
  );
}
