import type React from "react";
import { Img, interpolate } from "remotion";
import { CheckCheck, Flame, Trophy } from "lucide-react";
import { uk } from "./fuentes";
import { ubicar, type Acto, type PropsCelda } from "./grilla";
import {
  Anillo,
  Boton,
  Burbuja,
  Check,
  Escribiendo,
  Estado,
  Marca,
  Toggle,
  clamp,
  cuenta,
  mezcla,
  paso,
  pulso,
  rebote,
  texto,
  titulo,
  type Tema,
} from "./piezas";

// Elevate (app para coaches). Colores de elevate-web/mobileelevate: #FF4E00 de marca, texto casi negro sobre el naranja
// (el blanco da 3.4:1). Nombres de alumnos inventados: los del panel real son personas.

export const TEMA_ELEVATE: Tema = {
  oscuro: true,
  fondo: "#0A0A0A",
  pozo: "#141414",
  tarjeta: "#1D1D1D",
  tarjeta2: "#2A2A2A",
  tinta: "#FAFAFA",
  tinta2: "#A3A3A3",
  tinta3: "#6B6B6B",
  linea: "rgba(255,255,255,0.08)",
  acento: "#FF4E00",
  sobreAcento: "#0D0D0D",
  degrade: "linear-gradient(135deg, #FF7A2E, #FF4E00)",
  primario: "#FF4E00",
  sobrePrimario: "#0D0D0D",
  fuenteTitulo: "Manrope, sans-serif",
  fuenteTexto: "Inter, sans-serif",
  pesoTitulo: 800,
  radioPozo: 28,
  radioTarjeta: 20,
  sombra: "inset 0 1px 0 rgba(255,255,255,0.05)",
};

const VERDE = "#22C55E";
const AMBAR = "#F59E0B";
const llena: React.CSSProperties = { position: "absolute", inset: 0, padding: 22, display: "flex", flexDirection: "column" };

const Descanso: React.FC<PropsCelda> = ({ f, t }) => {
  const k = Math.max(0, f - 8);
  const seg = Math.max(0, 15 - Math.floor(k / 7));
  const golpe = 1 + 0.05 * interpolate(k % 7, [0, 4], [1, 0], clamp);
  const resto = interpolate(f, [8, 113], [1, 0], clamp);
  const prep = seg <= 5;
  return (
    <div style={{ ...llena, alignItems: "center", justifyContent: "space-between", padding: 26 }}>
      <Estado t={t} de={{ texto: "DESCANSO", color: t.acento }} a={{ texto: "¡PREPARATE!", color: "#EF4444" }} p={prep ? 1 : 0} tam={18} />
      <div style={{ filter: "drop-shadow(0 0 22px rgba(255,78,0,0.35))" }}>
        <Anillo t={t} p={resto} tam={228} grosor={14} color={prep ? "#EF4444" : t.acento}>
          <div>
            <div style={{ ...titulo(t, 66), transform: `scale(${golpe})` }}>0:{String(seg).padStart(2, "0")}</div>
            <div style={{ ...texto(t, 17, 500, t.tinta2), marginTop: 4 }}>de 1:30</div>
          </div>
        </Anillo>
      </div>
      <div style={{ ...texto(t, 19, 500, t.tinta2), textAlign: "center" }}>
        Siguiente · <span style={{ color: t.tinta, fontWeight: 650 }}>Press de banca</span> · 4 × 8-12
      </div>
    </div>
  );
};

const Semana: React.FC<PropsCelda> = ({ f, t }) => {
  const p = paso(f, 38, 16);
  return (
    <div style={{ ...llena, alignItems: "center", justifyContent: "center", gap: 10 }}>
      <Anillo t={t} p={(3 + p) / 5} tam={112} grosor={11}>
        <div style={{ ...titulo(t, 32), transform: `scale(${1 + pulso(f, 46, 12) * 0.12})` }}>{p > 0.5 ? 4 : 3}/5</div>
      </Anillo>
      <div style={{ ...texto(t, 18, 500, t.tinta2) }}>esta semana</div>
    </div>
  );
};

const Series: React.FC<PropsCelda> = ({ f, t }) => {
  const hecha2 = paso(f, 44, 12);
  const filas = [
    { n: 1, txt: "80 kg × 10", hecho: 1, actual: 0 },
    { n: 2, txt: "80 kg × 10", hecho: hecha2, actual: 1 - hecha2 },
    { n: 3, txt: "8-12 reps", hecho: 0, actual: hecha2 },
  ];
  return (
    <div style={{ ...llena, gap: 10, padding: "18px 22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={texto(t, 20, 650)}>Press de banca</div>
        <Estado t={t} de={{ texto: "PR 85 kg", color: AMBAR }} tam={16} icono={<Trophy size={15} strokeWidth={2.4} />} />
      </div>
      {filas.map((r) => (
        <div
          key={r.n}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            height: 36,
            padding: "0 12px",
            borderRadius: 12,
            background: mezcla(t.tarjeta, "rgba(255,78,0,0.14)", r.actual),
            boxShadow: `inset 0 0 0 1.5px ${mezcla("transparent", t.acento, r.actual * 0.8)}`,
          }}
        >
          <Check t={t} on={r.hecho} tam={24} color={VERDE} />
          <div style={texto(t, 18, 600, r.hecho > 0.5 ? t.tinta : t.tinta2)}>Serie {r.n}</div>
          <div style={{ marginLeft: "auto", ...texto(t, 18, 600, r.hecho > 0.5 ? VERDE : t.tinta2) }}>{r.txt}</div>
        </div>
      ))}
    </div>
  );
};

const ALUMNOS = [
  { ini: "MG", n: "Martina G.", ok: true },
  { ini: "JP", n: "Julián P.", ok: true },
  { ini: "SR", n: "Sofía R.", ok: true },
  { ini: "TV", n: "Tomás V.", ok: false },
];
const Alumnos: React.FC<PropsCelda> = ({ f, t }) => {
  const pago = paso(f, 52, 12);
  return (
    <div style={{ ...llena, gap: 12 }}>
      <div>
        <div style={texto(t, 21, 700)}>Alumnos</div>
        <div style={texto(t, 16, 500, t.tinta2)}>4 activos</div>
      </div>
      {ALUMNOS.map((a, i) => {
        const e = paso(f, 6 + i * 5, 12);
        const ok = a.ok ? 1 : pago;
        return (
          <div key={a.ini} style={{ display: "flex", alignItems: "center", gap: 10, opacity: e, transform: `translateX(${(1 - e) * -16}px)` }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(255,78,0,0.14)", display: "grid", placeItems: "center", ...texto(t, 16, 700, "#FF8A4C") }}>
              {a.ini}
            </div>
            <div>
              <div style={texto(t, 18, 600)}>{a.n}</div>
              <div style={{ ...texto(t, 15, 600, mezcla(AMBAR, VERDE, ok)), display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: 7, background: mezcla(AMBAR, VERDE, ok) }} />
                {ok > 0.5 ? "Al día" : "Pendiente"}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Cobro: React.FC<PropsCelda> = ({ f, t }) => {
  const p = paso(f, 40, 12);
  const ingreso = cuenta(paso(f, 44, 26), 385000, 420000);
  return (
    <div style={{ ...llena, justifyContent: "space-between", padding: "20px 22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={texto(t, 18, 600, t.tinta2)}>Cuota de noviembre</div>
        <Estado t={t} de={{ texto: "Pendiente", color: AMBAR }} a={{ texto: "Pagado", color: VERDE }} p={p} tam={17} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,78,0,0.14)", display: "grid", placeItems: "center", ...texto(t, 17, 700, "#FF8A4C") }}>TV</div>
        <div style={texto(t, 21, 650)}>Tomás V.</div>
        <div style={{ marginLeft: "auto", ...titulo(t, 36) }}>$ 35.000</div>
      </div>
      <div style={{ ...texto(t, 16, 500, t.tinta2), display: "flex", justifyContent: "space-between" }}>
        <span>Ingresos del mes</span>
        <span style={{ color: t.acento, fontWeight: 700 }}>$ {ingreso.toLocaleString("es-AR")}</span>
      </div>
    </div>
  );
};

const MACROS = [
  { k: "Proteínas", g: 120, de: 180, c: "#3B82F6" },
  { k: "Carbos", g: 180, de: 280, c: "#FF4E00" },
  { k: "Grasas", g: 55, de: 80, c: "#10B981" },
];
const Macros: React.FC<PropsCelda> = ({ f, t }) => {
  const p = paso(f, 10, 40);
  return (
    <div style={{ ...llena, gap: 14 }}>
      <div style={texto(t, 21, 700)}>Nutrición</div>
      <div style={{ display: "grid", placeItems: "center" }}>
        <Anillo t={t} p={0.84 * p} tam={150} grosor={13}>
          <div>
            <div style={titulo(t, 30)}>{cuenta(p, 0, 1850).toLocaleString("es-AR")}</div>
            <div style={texto(t, 14, 500, t.tinta2)}>/ 2.200 kcal</div>
          </div>
        </Anillo>
      </div>
      {MACROS.map((m, i) => {
        const pi = paso(f, 22 + i * 7, 26);
        return (
          <div key={m.k}>
            <div style={{ display: "flex", justifyContent: "space-between", ...texto(t, 15, 600, t.tinta2) }}>
              <span>{m.k}</span>
              <span style={{ color: t.tinta }}>{cuenta(pi, 0, m.g)} g</span>
            </div>
            <div style={{ marginTop: 5, height: 7, borderRadius: 7, background: t.tarjeta2 }}>
              <div style={{ height: 7, borderRadius: 7, width: `${(m.g / m.de) * 100 * pi}%`, background: m.c }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const RUTINA = ["Press banca · 4×10", "Remo con barra · 4×12", "Press militar · 3×10"];
const Rutina: React.FC<PropsCelda> = ({ f, t }) => (
  <div style={{ ...llena, gap: 9, padding: "18px 22px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <div style={texto(t, 20, 700)}>Día 1 · Tren superior</div>
      <div style={texto(t, 16, 500, t.tinta2)}>45 min</div>
    </div>
    {RUTINA.map((r, i) => {
      const on = paso(f, 18 + i * 16, 10);
      return (
        <div key={r} style={{ display: "flex", alignItems: "center", gap: 12, height: 36 }}>
          <Check t={t} on={on} tam={26} />
          <div style={{ ...texto(t, 18, 550, on > 0.5 ? t.tinta2 : t.tinta), textDecoration: on > 0.5 ? "line-through" : undefined, textDecorationColor: t.tinta3 }}>{r}</div>
        </div>
      );
    })}
  </div>
);

const Chat: React.FC<PropsCelda> = ({ f, t }) => {
  const visto = paso(f, 74, 6);
  return (
    <div style={{ ...llena, gap: 10, justifyContent: "flex-end", padding: "16px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "auto" }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,78,0,0.14)", display: "grid", placeItems: "center", ...texto(t, 14, 700, "#FF8A4C") }}>MG</div>
        <div style={texto(t, 18, 650)}>Martina G.</div>
        <div style={texto(t, 15, 500, f > 22 && f < 46 ? t.acento : t.tinta3)}>{f > 22 && f < 46 ? "escribiendo…" : "en línea"}</div>
      </div>
      <Burbuja t={{ ...t, tarjeta2: "#262626" }} p={paso(f, 6, 10)} tam={19}>
        ¿Cómo te fue con la rutina?
      </Burbuja>
      {f < 46 ? (
        <Escribiendo t={t} f={f} p={paso(f, 22, 6)} />
      ) : (
        <Burbuja t={t} propio p={paso(f, 46, 10)} tam={19}>
          ¡La terminé! Subí 2,5 kg 💪
          <span style={{ marginLeft: 10, fontSize: 14, opacity: 0.7, display: "inline-flex", alignItems: "center", gap: 3 }}>
            18:42 <CheckCheck size={15} strokeWidth={2.6} color={visto > 0.5 ? "#0D0D0D" : "rgba(13,13,13,0.45)"} />
          </span>
        </Burbuja>
      )}
    </div>
  );
};

const Racha: React.FC<PropsCelda> = ({ f, t }) => {
  const sube = paso(f, 30, 8);
  const lat = pulso(f, 30, 16);
  return (
    <div style={{ ...llena, justifyContent: "space-between" }}>
      <Flame size={44} strokeWidth={2.2} color={t.acento} fill="rgba(255,78,0,0.25)" style={{ transform: `scale(${1 + lat * 0.35})`, filter: `drop-shadow(0 0 ${12 * lat}px rgba(255,78,0,0.8))` }} />
      <div>
        <div style={{ ...titulo(t, 54), height: 58, overflow: "hidden" }}>
          <div style={{ transform: `translateY(${-58 * sube}px)` }}>
            <div style={{ height: 58 }}>11</div>
            <div style={{ height: 58 }}>12</div>
          </div>
        </div>
        <div style={texto(t, 17, 500, t.tinta2)}>días de racha</div>
      </div>
    </div>
  );
};

const PESOS = [80.5, 80.1, 79.8, 79.9, 79.2, 78.9, 78.6, 78.4];
const Peso: React.FC<PropsCelda> = ({ f, t, ancho }) => {
  const p = paso(f, 12, 50);
  const w = ancho - 44;
  const h = 170;
  const pts = PESOS.map((v, i) => [(i / (PESOS.length - 1)) * w, ((80.8 - v) / 2.6) * h] as const);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const largo = 400;
  const ult = pts[pts.length - 1];
  return (
    <div style={{ ...llena, gap: 6 }}>
      <div style={texto(t, 17, 600, t.tinta2)}>Peso</div>
      <div style={titulo(t, 40)}>78,4 kg</div>
      <div>
        <Estado t={t} de={{ texto: "−2,1 kg", color: VERDE }} tam={16} />
      </div>
      <svg width={w} height={h + 20} style={{ marginTop: "auto", overflow: "visible" }}>
        <defs>
          <linearGradient id="ev-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FF4E00" stopOpacity={0.35} />
            <stop offset="1" stopColor="#FF4E00" stopOpacity={0} />
          </linearGradient>
          <clipPath id="ev-clip">
            <rect x={-4} y={-10} width={(w + 8) * p} height={h + 30} />
          </clipPath>
        </defs>
        <path d={`${d} L${w},${h + 20} L0,${h + 20} Z`} fill="url(#ev-area)" clipPath="url(#ev-clip)" />
        <path d={d} fill="none" stroke={t.acento} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" pathLength={largo} strokeDasharray={largo} strokeDashoffset={largo * (1 - p)} />
        <circle cx={ult[0]} cy={ult[1]} r={7 * paso(f, 60, 10, rebote)} fill={t.acento} />
      </svg>
    </div>
  );
};

const Recordatorio: React.FC<PropsCelda> = ({ f, t }) => (
  <div style={{ ...llena, justifyContent: "space-between" }}>
    <Toggle t={t} on={paso(f, 34, 10, rebote)} escala={1.15} />
    <div>
      <div style={texto(t, 20, 650)}>Recordatorios</div>
      <div style={texto(t, 16, 500, t.tinta2)}>Todos los días, 8:00</div>
    </div>
  </div>
);

const Asignar: React.FC<PropsCelda> = ({ f, t }) => {
  const toque = pulso(f, 40, 10);
  const listo = paso(f, 46, 8);
  return (
    <div style={{ ...llena, justifyContent: "space-between", padding: "18px 22px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Estado t={t} de={{ texto: "Principiante", color: VERDE }} tam={15} />
        <div style={texto(t, 15, 500, t.tinta2)}>8 sem</div>
      </div>
      <div style={texto(t, 22, 700)}>Torso Pierna · Hipertrofia</div>
      <Boton t={t} toque={toque} tam={19} label={listo > 0.5 ? "✓ Asignada a Martina" : "Asignar rutina"} style={{ alignSelf: "flex-start" }} />
    </div>
  );
};

const Logo: React.FC = () => <Img src={uk("img/elevate-logo.svg")} style={{ width: 70 }} />;

const espejo = false;
export const ACTO_ELEVATE: Acto = {
  nombre: "Elevate",
  tema: TEMA_ELEVATE,
  dur: 150,
  celdas: [
    { ...ubicar("A", espejo), Cmp: Descanso },
    { ...ubicar("B", espejo), Cmp: ({ f, t, alto }) => <Marca t={t} f={f} alto={alto} logo={<Logo />} nombre="Elevate" bajada="La app del coach" /> },
    { ...ubicar("C", espejo), Cmp: Semana },
    { ...ubicar("D", espejo), Cmp: Series, sonidos: [{ en: 44, nombre: "check-b", vol: 0.16 }] },
    { ...ubicar("E", espejo), Cmp: Alumnos },
    { ...ubicar("F", espejo), Cmp: Cobro, sonidos: [{ en: 40, nombre: "pop-b", vol: 0.18 }] },
    { ...ubicar("G", espejo), Cmp: Macros },
    { ...ubicar("H", espejo), Cmp: Rutina, sonidos: [18, 34, 50].map((en) => ({ en, nombre: "tap", vol: 0.12 })) },
    { ...ubicar("I", espejo), Cmp: Chat, sonidos: [{ en: 46, nombre: "burbuja", vol: 0.16 }] },
    { ...ubicar("J", espejo), Cmp: Racha },
    { ...ubicar("K", espejo), Cmp: Peso },
    { ...ubicar("L", espejo), Cmp: Recordatorio, sonidos: [{ en: 34, nombre: "click", vol: 0.14 }] },
    { ...ubicar("M", espejo), Cmp: Asignar, sonidos: [{ en: 40, nombre: "tap", vol: 0.16 }] },
  ],
};

