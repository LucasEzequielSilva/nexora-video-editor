import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import Sfx from "../../reserva/components/sfx";
import { ease } from "../../reserva/motion";
import { Burbuja, Camara, springAt, Celular, Chip, C, Contador, Escenario, Escribiendo, F, FuentesCss, LogoNexora, LogoTrendSpot, TextoGrande, Vidrio } from "./ui";

export type PhoneOsProps = {
  /** Nombre del producto en el drop (a confirmar con Lucas). */
  nombre: string;
  /** Palabra que se comenta en el CTA (a confirmar con Lucas). */
  palabraCta: string;
  cuenta: string;
};

export const FPS_SPEC = 30;

/** [inicio, duración] de cada escena, en cuadros a 30 fps. Total: 660 (22 s). */
export const T = {
  hook: [0, 78],
  logo: [78, 36],
  chat: [114, 114],
  canje: [228, 60],
  turno: [288, 60],
  kanban: [348, 60],
  stock: [408, 60],
  texto: [468, 60],
  drop: [528, 60],
  cierre: [588, 72],
} as const;
export const DURACION_SPEC = 660;

const NOTIS = [
  "¿Precio del iPhone 15?",
  "¿Tenés el 14 Pro negro?",
  "¿Aceptan canje?",
  "Hola! ¿Está disponible?",
  "¿Cuánto me toman mi 12?",
  "¿Hasta qué hora abren?",
];

const Hook = () => {
  const f = useCurrentFrame();
  const sacudida = f > 8 && f < 22 ? Math.sin(f * 3.1) * (22 - f) * 0.9 : 0;
  const seg = Math.round(ease(f, [34, 72], [0, 900]));
  const reloj = `${String(Math.floor(seg / 60)).padStart(2, "0")}:${String(seg % 60).padStart(2, "0")}`;
  return (
    <Escenario>
      <Camara frames={78} desde={{ s: 1.0, ry: 0, rx: 0, x: sacudida, y: sacudida * 0.6 }} hasta={{ s: 1.12, ry: 0, rx: 0, x: sacudida, y: sacudida * 0.6 }}>
        {NOTIS.map((t, i) => {
          const at = 4 + i * 5;
          const s = springAt(f, at, { damping: 13, stiffness: 160, mass: 0.9 });
          const y = 600 + i * 150 + (1 - s) * -1500;
          return (
            <Vidrio
              key={t}
              style={{
                position: "absolute",
                left: 90 + (i % 2) * 40,
                top: y,
                width: 860,
                height: 124,
                borderRadius: 34,
                display: "flex",
                alignItems: "center",
                gap: 24,
                padding: "0 34px",
                transform: `rotate(${(i % 2 ? 1 : -1) * (1 - s) * 8}deg)`,
                filter: s < 0.97 ? `blur(${(1 - s) * 14}px)` : undefined,
              }}
            >
              <div style={{ width: 64, height: 64, borderRadius: 32, background: "#25D366", flex: "none" }} />
              <div style={{ fontFamily: F.texto, fontSize: 40, color: C.texto, fontWeight: 500 }}>{t}</div>
            </Vidrio>
          );
        })}
      </Camara>
      <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center" }}>
        <TextoGrande texto={reloj} at={30} tamano={230} style={{ fontVariantNumeric: "tabular-nums" }} />
        <TextoGrande texto="sin respuesta" at={46} tamano={64} color={C.apagado} style={{ marginTop: 8 }} />
      </div>
      <Sfx name="impact" at={9} volume={0.5} />
      <Sfx name="tarjeta" at={4} volume={0.12} />
      <Sfx name="tarjeta-b" at={19} volume={0.12} />
      <Sfx name="tarjeta-c" at={29} volume={0.12} />
      <Sfx name="counter" at={34} volume={0.15} />
    </Escenario>
  );
};

const Logo = () => {
  const f = useCurrentFrame();
  const s = springAt(f, 2, { damping: 15, stiffness: 120, mass: 0.9 });
  const rayos = Array.from({ length: 16 }, (_, i) => i);
  return (
    <Escenario intensidad={1.8}>
      <div style={{ position: "absolute", left: 540, top: 960 }}>
        {rayos.map((i) => {
          const len = ease(f, [4, 22], [0, 260 + (i % 3) * 90]);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                width: len,
                height: 3,
                left: 0,
                top: 0,
                transformOrigin: "0 50%",
                transform: `rotate(${i * 22.5}deg) translateX(${ease(f, [4, 26], [120, 420])}px)`,
                background: `linear-gradient(90deg, rgba(34,197,94,0.9), transparent)`,
                opacity: ease(f, [4, 10]) * (1 - ease(f, [18, 34])),
              }}
            />
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 880, display: "flex", justifyContent: "center", transform: `scale(${0.7 + 0.3 * s})`, opacity: s }}>
        <LogoTrendSpot ancho={620} />
      </div>
      <Sfx name="whoosh-big" at={2} volume={0.18} />
      <Sfx name="remate" at={8} volume={0.3} />
    </Escenario>
  );
};

const Chat = () => {
  const f = useCurrentFrame();
  const tarjeta = springAt(f, 62, { damping: 15, stiffness: 150, mass: 0.8 });
  return (
    <Escenario>
      <Camara frames={114} desde={{ s: 0.94, ry: -10, rx: 3, x: -20, y: 30 }} hasta={{ s: 1.1, ry: 5, rx: 0, x: 0, y: -40 }}>
        <Celular brillo={0.6}>
          <div style={{ position: "absolute", inset: 0, background: "#0a0a0a", display: "flex", flexDirection: "column" }}>
            <div style={{ height: 150, padding: "84px 40px 0", display: "flex", alignItems: "center", gap: 20, borderBottom: `1px solid ${C.borde}` }}>
              <div style={{ width: 56, height: 56, borderRadius: 28, background: C.verde }} />
              <div>
                <div style={{ fontFamily: F.titulo, color: C.texto, fontSize: 36 }}>TrendSpot</div>
                <div style={{ fontFamily: F.texto, color: C.verde, fontSize: 24 }}>en línea</div>
              </div>
            </div>
            <div style={{ flex: 1, padding: "40px 36px", display: "flex", flexDirection: "column", gap: 22 }}>
              <Burbuja lado="der" at={8} texto="¿Tenés iPhone 15?" verde />
              <Escribiendo desde={26} hasta={42} />
              <Burbuja lado="izq" at={42} texto="Hola, buenas! Sí, tenemos. Esto es lo que hay:" />
              {f >= 62 && (
                <div
                  style={{
                    alignSelf: "flex-start",
                    width: 560,
                    padding: 30,
                    borderRadius: 34,
                    background: "rgba(255,255,255,0.07)",
                    border: `1px solid ${C.borde}`,
                    opacity: tarjeta,
                    transform: `translateY(${(1 - tarjeta) * 50}px) scale(${0.92 + 0.08 * tarjeta})`,
                  }}
                >
                  <div style={{ fontFamily: F.titulo, fontSize: 42, color: C.texto }}>iPhone 15 128GB · Rosa</div>
                  <div style={{ display: "flex", gap: 12, margin: "18px 0" }}>
                    <Chip texto="En stock" verde />
                    <Chip texto="Seminuevo" />
                    <Chip texto="Batería 92%" />
                  </div>
                  <div style={{ fontFamily: F.titulo, fontSize: 74, color: C.verde }}>
                    <Contador de={0} a={400} desde={64} hasta={84} prefijo="US$ " />
                  </div>
                </div>
              )}
            </div>
          </div>
        </Celular>
      </Camara>
      <Sfx name="burbuja" at={8} volume={0.22} />
      <Sfx name="key-soft" at={26} volume={0.1} />
      <Sfx name="key-soft" at={32} volume={0.1} />
      <Sfx name="burbuja" at={42} volume={0.22} />
      <Sfx name="tarjeta" at={62} volume={0.2} />
      <Sfx name="counter" at={64} volume={0.14} />
    </Escenario>
  );
};

const Canje = () => {
  const f = useCurrentFrame();
  const entra = springAt(f, 0, { damping: 18, stiffness: 150, mass: 0.8 });
  const fila = (t: string, v: string, at: number) => (
    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F.texto, fontSize: 40, color: C.texto, opacity: ease(f, [at, at + 8]), marginBottom: 22 }}>
      <span style={{ color: C.apagado }}>{t}</span>
      <span>{v}</span>
    </div>
  );
  return (
    <Escenario>
      <Camara frames={60} desde={{ s: 0.96, ry: 8, rx: 0, x: 0, y: 20 }} hasta={{ s: 1.06, ry: -4, rx: 0, x: 0, y: -20 }}>
        <Vidrio style={{ position: "absolute", left: 110, top: 520, width: 860, height: 860, padding: 56, opacity: entra, transform: `translateY(${(1 - entra) * 80}px)` }}>
          <div style={{ fontFamily: F.titulo, fontSize: 56, color: C.verde, marginBottom: 36 }}>Plan Canje</div>
          {fila("Tu equipo", "iPhone 12 · 128GB", 4)}
          {fila("Batería", "85%", 9)}
          <div style={{ height: 1, background: C.borde, margin: "10px 0 30px" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F.texto, fontSize: 40, color: C.texto, marginBottom: 14 }}>
            <span style={{ color: C.apagado }}>Valor de toma</span>
            <Contador de={0} a={210} desde={12} hasta={30} prefijo="US$ " style={{ fontFamily: F.titulo }} />
          </div>
          <div style={{ fontFamily: F.texto, fontSize: 34, color: C.apagado, marginTop: 36 }}>Diferencia a pagar</div>
          <div style={{ fontFamily: F.titulo, fontSize: 150, color: C.verde, letterSpacing: "-0.03em", opacity: ease(f, [24, 32]) }}>
            <Contador de={0} a={190} desde={26} hasta={46} prefijo="US$ " />
          </div>
          <div style={{ marginTop: 20 }}>
            <Chip texto="Estimado · sujeto a inspección" />
          </div>
        </Vidrio>
      </Camara>
      <Sfx name="whoosh-short" at={0} volume={0.12} />
      <Sfx name="counter" at={12} volume={0.14} />
      <Sfx name="counter" at={26} volume={0.14} />
      <Sfx name="remate-b" at={46} volume={0.25} />
    </Escenario>
  );
};

const Turno = () => {
  const f = useCurrentFrame();
  const entra = springAt(f, 0, { damping: 18, stiffness: 150, mass: 0.8 });
  const aro = ease(f, [8, 26]);
  const stock = Math.round(ease(f, [30, 40], [5, 4]));
  return (
    <Escenario>
      <Camara frames={60} desde={{ s: 1.06, ry: -6, rx: 0, x: 0, y: -20 }} hasta={{ s: 0.97, ry: 4, rx: 0, x: 0, y: 20 }}>
        <Vidrio style={{ position: "absolute", left: 110, top: 440, width: 860, height: 1000, padding: 56, opacity: entra, transform: `translateY(${(1 - entra) * 80}px)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <svg width="110" height="110" viewBox="0 0 110 110">
              <circle cx="55" cy="55" r="48" fill="none" stroke={C.verde} strokeWidth="7" strokeDasharray={302} strokeDashoffset={302 * (1 - aro)} strokeLinecap="round" transform="rotate(-90 55 55)" />
              <path d="M34 57 L49 71 L78 40" fill="none" stroke={C.verde} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={80} strokeDashoffset={80 * (1 - ease(f, [18, 28]))} />
            </svg>
            <div style={{ fontFamily: F.titulo, fontSize: 60, color: C.texto }}>Turno reservado</div>
          </div>
          <div style={{ fontFamily: F.titulo, fontSize: 120, color: C.texto, margin: "50px 0 10px", letterSpacing: "-0.03em" }}>Jueves · 17:00</div>
          <div style={{ fontFamily: F.texto, fontSize: 38, color: C.apagado }}>Retiro en la oficina · 30 min</div>
          <div style={{ marginTop: 50, padding: 36, borderRadius: 30, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.35)" }}>
            <div style={{ fontFamily: F.texto, fontSize: 30, color: C.verde, marginBottom: 10 }}>EQUIPO APARTADO</div>
            <div style={{ fontFamily: F.titulo, fontSize: 50, color: C.texto }}>iPhone 15 128GB · Rosa</div>
          </div>
          <div style={{ marginTop: 44, display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: F.texto, fontSize: 38, color: C.apagado }}>
            <span>Stock disponible</span>
            <span style={{ fontFamily: F.titulo, fontSize: 90, color: C.texto }}>{stock}</span>
          </div>
        </Vidrio>
      </Camara>
      <Sfx name="whoosh-short" at={0} volume={0.12} />
      <Sfx name="check-b" at={22} volume={0.25} />
      <Sfx name="pop" at={32} volume={0.2} />
    </Escenario>
  );
};

const ETAPAS = ["Consulta", "Cotizado", "Visita agendada", "En local", "Cerrado"];

const Kanban = () => {
  const f = useCurrentFrame();
  const entra = springAt(f, 0, { damping: 18, stiffness: 150, mass: 0.8 });
  const paso = Math.min(4, Math.max(0, Math.floor((f - 6) / 10)));
  const posY = ease(f, [6, 46], [0, 4 * 150], (x) => x);
  return (
    <Escenario>
      <Camara frames={60} desde={{ s: 0.95, ry: 6, rx: 4, x: 0, y: 30 }} hasta={{ s: 1.05, ry: -4, rx: 0, x: 0, y: -10 }}>
        <div style={{ position: "absolute", left: 110, top: 360, width: 860, opacity: entra }}>
          <div style={{ fontFamily: F.titulo, fontSize: 60, color: C.texto, marginBottom: 36 }}>Pipeline</div>
          <div style={{ position: "relative" }}>
            {ETAPAS.map((e, i) => {
              const activa = i <= paso && f >= 6;
              return (
                <Vidrio
                  key={e}
                  style={{
                    height: 126,
                    marginBottom: 24,
                    borderRadius: 30,
                    display: "flex",
                    alignItems: "center",
                    padding: "0 40px",
                    gap: 24,
                    borderColor: activa ? "rgba(34,197,94,0.5)" : C.borde,
                    background: activa ? "rgba(34,197,94,0.10)" : C.vidrio,
                  }}
                >
                  <div style={{ width: 26, height: 26, borderRadius: 13, background: activa ? C.verde : "rgba(255,255,255,0.18)", boxShadow: activa ? "0 0 18px rgba(34,197,94,0.8)" : undefined }} />
                  <div style={{ fontFamily: F.titulo, fontSize: 44, color: activa ? C.texto : C.apagado }}>{e}</div>
                </Vidrio>
              );
            })}
            <div
              style={{
                position: "absolute",
                left: 450,
                top: 18 + posY,
                width: 360,
                height: 90,
                borderRadius: 24,
                background: C.verde,
                color: "#04210f",
                fontFamily: F.titulo,
                fontSize: 32,
                display: "flex",
                alignItems: "center",
                padding: "0 26px",
                whiteSpace: "nowrap",
                boxShadow: "0 0 50px rgba(34,197,94,0.55)",
              }}
            >
              Lauti · iPhone 15
            </div>
          </div>
        </div>
      </Camara>
      <Sfx name="whoosh-short" at={0} volume={0.12} />
      {[6, 16, 26, 36, 46].map((a) => (
        <Sfx key={a} name="tap" at={a} volume={0.18} />
      ))}
    </Escenario>
  );
};

const FILAS = [
  { m: "iPhone 15 128GB · Rosa", imei: "994729971815156", bat: "92%" },
  { m: "iPhone 15 128GB · Azul", imei: "994729959284771", bat: "89%" },
  { m: "iPhone 14 Pro 256GB · Negro", imei: "356938104472019", bat: "91%" },
  { m: "iPhone 13 128GB · Medianoche", imei: "358240051119204", bat: "87%" },
];

const Stock = () => {
  const f = useCurrentFrame();
  const vendida = f >= 26;
  const flash = ease(f, [26, 30]) * (1 - ease(f, [30, 46]));
  return (
    <Escenario>
      <Camara frames={60} desde={{ s: 1.05, ry: 4, rx: -3, x: 0, y: -10 }} hasta={{ s: 0.96, ry: -6, rx: 2, x: 0, y: 20 }}>
        <div style={{ position: "absolute", left: 90, top: 400, width: 900 }}>
          <div style={{ fontFamily: F.titulo, fontSize: 60, color: C.texto, marginBottom: 12 }}>Stock por IMEI</div>
          <div style={{ fontFamily: F.texto, fontSize: 32, color: C.apagado, marginBottom: 34 }}>Cada unidad, trazada</div>
          {FILAS.map((r, i) => {
            const s = springAt(f, 2 + i * 4, { damping: 17, stiffness: 160, mass: 0.8 });
            const es = i === 1 && vendida;
            return (
              <Vidrio
                key={r.imei}
                style={{
                  height: 190,
                  marginBottom: 24,
                  borderRadius: 32,
                  padding: "28px 40px",
                  opacity: s * (es ? 0.55 : 1),
                  transform: `translateX(${(1 - s) * 120}px)`,
                  borderColor: es ? "rgba(34,197,94,0.6)" : C.borde,
                  boxShadow: es ? `0 0 ${60 * flash}px rgba(34,197,94,0.7)` : undefined,
                }}
              >
                <div style={{ fontFamily: F.titulo, fontSize: 44, color: C.texto }}>{r.m}</div>
                <div style={{ fontFamily: F.mono, fontSize: 28, color: C.apagado, margin: "8px 0 14px" }}>IMEI {r.imei}</div>
                <div style={{ display: "flex", gap: 12 }}>
                  <Chip texto={es ? "Vendida" : "En stock"} verde />
                  <Chip texto={`Batería ${r.bat}`} />
                </div>
              </Vidrio>
            );
          })}
        </div>
      </Camara>
      <Sfx name="whoosh-short" at={0} volume={0.12} />
      <Sfx name="check-b" at={26} volume={0.25} />
    </Escenario>
  );
};

const Texto = () => (
  <Escenario intensidad={1.4}>
    <div style={{ position: "absolute", left: 60, right: 60, top: 640 }}>
      <TextoGrande texto="Contesta primero." at={2} tamano={150} />
      <TextoGrande texto="Vende lo que tiene." at={26} tamano={150} color={C.verde} style={{ marginTop: 30 }} />
    </div>
    <Sfx name="remate" at={4} volume={0.25} />
    <Sfx name="remate-b" at={28} volume={0.28} />
  </Escenario>
);

const Drop = ({ nombre }: { nombre: string }) => {
  const f = useCurrentFrame();
  const s = springAt(f, 2, { damping: 12, stiffness: 140, mass: 1 });
  return (
    <Escenario intensidad={2}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 740, textAlign: "center", transform: `scale(${1.5 - 0.5 * s})`, opacity: s }}>
        <div style={{ fontFamily: F.titulo, fontSize: 220, color: C.texto, letterSpacing: "-0.04em", textShadow: "0 0 80px rgba(34,197,94,0.35)" }}>{nombre}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1010, textAlign: "center" }}>
        <TextoGrande texto="para minoristas de iPhone" at={14} tamano={64} color={C.apagado} />
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

export default function PhoneOsAd({ nombre, palabraCta, cuenta }: PhoneOsProps) {
  const seq = (k: keyof typeof T, el: React.ReactNode) => (
    <Sequence from={T[k][0]} durationInFrames={T[k][1]} name={k}>
      {el}
    </Sequence>
  );
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <FuentesCss />
      {seq("hook", <Hook />)}
      {seq("logo", <Logo />)}
      {seq("chat", <Chat />)}
      {seq("canje", <Canje />)}
      {seq("turno", <Turno />)}
      {seq("kanban", <Kanban />)}
      {seq("stock", <Stock />)}
      {seq("texto", <Texto />)}
      {seq("drop", <Drop nombre={nombre} />)}
      {seq("cierre", <Cierre cuenta={cuenta} palabraCta={palabraCta} />)}
    </AbsoluteFill>
  );
}
