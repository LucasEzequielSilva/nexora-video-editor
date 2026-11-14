import type React from "react";
import { Img, interpolate } from "remotion";
import { Check, Clock, Flame, Gift, Lock, MapPin, Moon, Users, Zap, ArrowRight } from "lucide-react";
import { uk } from "./fuentes";
import { ubicar, type Acto, type PropsCelda } from "./grilla";
import { Chip, Estado, Marca, Toggle, clamp, cuenta, mezcla, paso, pulso, rebote, texto, titulo, type Tema } from "./piezas";

// Futhub (fútbol: partidos + entrenamiento con XP). Tema oscuro de constants/Themes.ts, acento #FF4C00,
// DM Sans + Space Grotesk. Partidos e invitación: captura publicada (ui-futhub-home). XP, racha, ranking y drills: el código.

export const TEMA_FUTHUB: Tema = {
  oscuro: true,
  fondo: "#151515",
  pozo: "#1E1E1E",
  tarjeta: "#2A2A2A",
  tarjeta2: "#363636",
  tinta: "#FFFFFF",
  tinta2: "#9BA1A6",
  tinta3: "#6E7378",
  linea: "#3A3A3A",
  acento: "#FF4C00",
  sobreAcento: "#FFFFFF",
  degrade: "linear-gradient(90deg, #FF4C00, #FF814C)",
  primario: "#FF4C00",
  sobrePrimario: "#FFFFFF",
  fuenteTitulo: "FhSG, sans-serif",
  fuenteTexto: "FhDM, sans-serif",
  pesoTitulo: 700,
  radioPozo: 26,
  radioTarjeta: 16,
  sombra: "inset 0 0 0 1px #3A3A3A",
};

const VERDE = "#10B981";
const PILARES = [
  { n: "Técnica", c: "#FF4C00", v: 12 },
  { n: "Táctica", c: "#3B82F6", v: 7 },
  { n: "Fitness", c: "#10B981", v: 9 },
  { n: "Mentalidad", c: "#F59E0B", v: 5 },
];
const llena: React.CSSProperties = { position: "absolute", inset: 0, padding: 22, display: "flex", flexDirection: "column" };
const Meta: React.FC<{ t: Tema; icono: React.ReactNode; children: React.ReactNode }> = ({ t, icono, children }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, ...texto(t, 16, 500, t.tinta2) }}>
    {icono}
    {children}
  </span>
);

const Partidos: React.FC<PropsCelda> = ({ f, t }) => {
  const toque = pulso(f, 34, 10);
  const ok = paso(f, 40, 10);
  const lleno = paso(f, 70, 8);
  return (
    <div style={{ ...llena, gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, ...texto(t, 18, 600, t.tinta2) }}>
        <Users size={18} color={t.acento} /> Invitaciones pendientes
      </div>
      <div style={{ padding: 18, borderRadius: 16, background: t.tarjeta, boxShadow: t.sombra }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 44, background: "#3d3d3d", display: "grid", placeItems: "center", ...texto(t, 18, 700) }}>L</div>
          <div>
            <div style={texto(t, 20, 700)}>Luxassilva</div>
            <div style={texto(t, 15, 500, t.tinta2)}>te invita a jugar</div>
          </div>
          <div style={{ marginLeft: "auto", ...titulo(t, 30) }}>$5.000</div>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
          <Meta t={t} icono={<MapPin size={15} />}>Rebote</Meta>
          <Meta t={t} icono={<Clock size={15} />}>18:00</Meta>
          <Meta t={t} icono={<Users size={15} />}>{ok > 0.5 ? "15/16" : "14/16"}</Meta>
        </div>
        {ok < 0.5 ? (
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <div style={{ flex: 1, height: 46, borderRadius: 10, boxShadow: `inset 0 0 0 1.5px ${t.acento}`, display: "grid", placeItems: "center", ...texto(t, 18, 700, t.acento) }}>Rechazar</div>
            <div style={{ flex: 1, height: 46, borderRadius: 10, background: t.degrade, display: "grid", placeItems: "center", ...texto(t, 18, 700, "#fff"), transform: `scale(${1 - toque * 0.06})` }}>Aceptar</div>
          </div>
        ) : (
          <div style={{ marginTop: 14, height: 46, borderRadius: 10, background: "rgba(16,185,129,0.14)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, ...texto(t, 18, 700, VERDE), transform: `scale(${0.9 + 0.1 * paso(f, 40, 10, rebote)})` }}>
            <Check size={20} strokeWidth={3} /> ¡Estás adentro!
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 16, background: t.tarjeta, boxShadow: t.sombra }}>
        <div style={{ flex: 1 }}>
          <div style={texto(t, 18, 700)}>Fútbol 5 at Coronado</div>
          <div style={{ display: "flex", gap: 14, marginTop: 4 }}>
            <Meta t={t} icono={<Clock size={14} />}>18:00</Meta>
            <Meta t={t} icono={<Users size={14} />}>
              <span style={{ color: lleno > 0.5 ? VERDE : undefined, fontWeight: lleno > 0.5 ? 700 : 500 }}>{lleno > 0.5 ? "10/10" : "9/10"}</span>
            </Meta>
          </div>
        </div>
        <div style={titulo(t, 24)}>$5.000</div>
      </div>
    </div>
  );
};

const Racha: React.FC<PropsCelda> = ({ f, t }) => {
  const sube = paso(f, 36, 8);
  const lat = pulso(f, 36, 16);
  return (
    <div style={{ ...llena, alignItems: "center", justifyContent: "center", gap: 2 }}>
      <Flame size={46} strokeWidth={2.2} color={t.acento} fill="rgba(255,76,0,0.3)" style={{ transform: `scale(${1 + lat * 0.35})`, filter: `drop-shadow(0 0 ${14 * lat}px rgba(255,76,0,0.9))` }} />
      <div style={{ ...titulo(t, 48), height: 52, overflow: "hidden" }}>
        <div style={{ transform: `translateY(${-52 * sube}px)`, textAlign: "center" }}>
          <div style={{ height: 52 }}>6</div>
          <div style={{ height: 52 }}>7</div>
        </div>
      </div>
      <div style={texto(t, 16, 500, t.tinta2)}>días</div>
    </div>
  );
};

const Nivel: React.FC<PropsCelda> = ({ f, t }) => {
  const p = paso(f, 14, 40);
  const sube = paso(f, 56, 10);
  const xp = cuenta(p, 300, 700);
  return (
    <div style={{ ...llena, justifyContent: "space-between", padding: "18px 22px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 52, height: 52, borderRadius: 52, background: t.degrade, display: "grid", placeItems: "center", ...titulo(t, 24, "#fff"), transform: `scale(${1 + pulso(f, 56, 14) * 0.2})` }}>
          {sube > 0.5 ? 11 : 10}
        </div>
        <div>
          <div style={texto(t, 20, 700)}>{sube > 0.5 ? "Nivel 11 · Avanzado" : "Nivel 10 · Experto"}</div>
          <div style={texto(t, 15, 500, t.tinta2)}>{sube > 0.5 ? "¡Subiste de nivel!" : `${xp} / 700 XP`}</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, ...texto(t, 18, 700, t.acento) }}>
          <Zap size={18} fill={t.acento} /> 3.500 XP
        </div>
      </div>
      <div style={{ height: 14, borderRadius: 14, background: t.tarjeta2, overflow: "hidden" }}>
        <div style={{ height: 14, borderRadius: 14, width: `${sube > 0.5 ? interpolate(sube, [0.5, 1], [0, 8]) : (xp / 700) * 100}%`, background: t.degrade }} />
      </div>
    </div>
  );
};

const RANKING = [
  { n: "CarlosMendy", xp: 8750 },
  { n: "MatiasGol", xp: 7200 },
  { n: "SofiaFutbol", xp: 6100 },
];
const Ranking: React.FC<PropsCelda> = ({ f, t }) => {
  const s = paso(f, 50, 14);
  const fila = 52;
  const yo = { n: "LucasSilva", xp: cuenta(paso(f, 40, 10), 3500, 3545) };
  const nico = { n: "NicoSkills", xp: 3520 };
  const Fila: React.FC<{ pos: number; n: string; xp: number; propio?: boolean; y?: number; medalla?: string }> = ({ pos, n, xp, propio, y = 0, medalla }) => (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: y,
        height: fila - 8,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0 10px",
        borderRadius: 12,
        background: propio ? "rgba(255,76,0,0.12)" : t.tarjeta,
        boxShadow: propio ? `inset 0 0 0 1.5px ${t.acento}` : undefined,
      }}
    >
      <div style={{ width: 22, ...texto(t, 16, 700, medalla ?? t.tinta2) }}>{pos}</div>
      <div style={{ ...texto(t, 16, 650), flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n}</div>
      <div style={texto(t, 14, 600, t.tinta2)}>{xp.toLocaleString("es-AR")}</div>
    </div>
  );
  return (
    <div style={{ ...llena, gap: 12, padding: 18 }}>
      <div style={texto(t, 20, 700)}>Ranking</div>
      <div style={{ position: "relative", flex: 1 }}>
        {RANKING.map((r, i) => (
          <Fila key={r.n} pos={i + 1} n={r.n} xp={r.xp} y={i * fila} medalla={["#FFD700", "#C0C0C0", "#CD7F32"][i]} />
        ))}
        <div style={{ position: "absolute", top: 3 * fila + 2, left: 0, right: 0, textAlign: "center", ...texto(t, 16, 700, t.tinta3) }}>···</div>
        <Fila pos={s > 0.5 ? 7 : 6} n={nico.n} xp={nico.xp} y={4 * fila - 10 + s * fila} />
        <Fila pos={s > 0.5 ? 6 : 7} n={yo.n} xp={yo.xp} propio y={5 * fila - 10 - s * fila} />
      </div>
    </div>
  );
};

const Drill: React.FC<PropsCelda> = ({ f, t, alto }) => {
  const ok = paso(f, 56, 10);
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex" }}>
      <div style={{ position: "relative", width: 170, height: alto, background: `center 30%/cover url(${uk("img/futhub-jugador.png")})` }}>
        <div style={{ position: "absolute", inset: 0, background: `rgba(16,185,129,${0.75 * ok})`, display: "grid", placeItems: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 56, background: "#fff", display: "grid", placeItems: "center", transform: `scale(${paso(f, 56, 12, rebote)})` }}>
            <Check size={32} strokeWidth={3.4} color={VERDE} />
          </div>
        </div>
      </div>
      <div style={{ flex: 1, padding: "18px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Estado t={t} de={{ texto: "Técnica", color: "#FF6A2A" }} tam={15} />
          <Estado t={t} de={{ texto: "Intermedio", color: "#F59E0B" }} tam={15} />
        </div>
        <div style={texto(t, 22, 700)}>Regate en zig-zag</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Meta t={t} icono={<Clock size={15} />}>15 min</Meta>
          <div style={{ ...texto(t, 17, 700, ok > 0.5 ? VERDE : t.acento) }}>{ok > 0.5 ? "Completado" : "+50 XP"}</div>
        </div>
      </div>
    </div>
  );
};

const Pilares: React.FC<PropsCelda> = ({ f, t }) => {
  const p = paso(f, 10, 40);
  const max = 12;
  return (
    <div style={{ ...llena, gap: 12 }}>
      <div style={texto(t, 20, 700)}>Drills por pilar</div>
      <div style={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 4px" }}>
        {PILARES.map((x, i) => {
          const pi = interpolate(p, [i * 0.1, i * 0.1 + 0.6], [0, 1], { ...clamp, easing: (v) => 1 - Math.pow(1 - v, 3) });
          return (
            <div key={x.n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={texto(t, 16, 700)}>{Math.round(x.v * pi)}</div>
              <div style={{ width: 34, height: 220 * (x.v / max) * pi + 6, borderRadius: 10, background: x.c }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {PILARES.map((x) => (
          <div key={x.n} style={{ width: 44, textAlign: "center", ...texto(t, 13, 600, t.tinta2) }}>
            {x.n.slice(0, 3)}
          </div>
        ))}
      </div>
    </div>
  );
};

const CAMBIOS = [-100, 36, 58, 80, 9999, 9999];
const Filtros: React.FC<PropsCelda> = ({ f, t }) => {
  const lista = [{ n: "Todos", c: t.acento }, ...PILARES];
  return (
    <div style={{ ...llena, justifyContent: "center", padding: "16px 20px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
        {lista.map((x, i) => (
          <Chip key={x.n} t={{ ...t, acento: x.c }} label={x.n} sel={paso(f, CAMBIOS[i], 8) * (1 - paso(f, CAMBIOS[i + 1], 8))} tam={19} />
        ))}
      </div>
    </div>
  );
};

const Desafio: React.FC<PropsCelda> = ({ f, t }) => {
  const p = paso(f, 36, 12);
  const color = mezcla(t.acento, VERDE, p);
  return (
    <div style={{ ...llena, justifyContent: "space-between", padding: "18px 22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={texto(t, 21, 700)}>Semana técnica</div>
        <div style={{ transform: `scale(${1 + pulso(f, 44, 14) * 0.25})` }}>
          <Estado t={t} de={{ texto: "+100 XP", color: t.acento }} tam={16} icono={<Zap size={14} fill={t.acento} />} />
        </div>
      </div>
      <div style={texto(t, 17, 500, t.tinta2)}>Completá 5 drills de técnica esta semana</div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, height: 12, borderRadius: 12, background: t.tarjeta2 }}>
          <div style={{ height: 12, borderRadius: 12, width: `${(4 + p) * 20}%`, background: color }} />
        </div>
        <div style={texto(t, 18, 700, color)}>{p > 0.5 ? "5/5" : "4/5"}</div>
      </div>
    </div>
  );
};

const XpHoy: React.FC<PropsCelda> = ({ f, t }) => (
  <div style={{ ...llena, justifyContent: "space-between" }}>
    <div style={{ width: 46, height: 46, borderRadius: 14, background: "rgba(255,76,0,0.15)", display: "grid", placeItems: "center" }}>
      <Zap size={24} color={t.acento} fill={t.acento} />
    </div>
    <div>
      <div style={titulo(t, 46, t.acento)}>+{cuenta(paso(f, 30, 24), 0, 45)}</div>
      <div style={texto(t, 16, 500, t.tinta2)}>XP hoy</div>
    </div>
  </div>
);

const Insignia: React.FC<PropsCelda> = ({ f, t }) => {
  const u = paso(f, 40, 14, rebote);
  return (
    <div style={{ ...llena, alignItems: "center", justifyContent: "center", gap: 16, textAlign: "center" }}>
      <div style={{ ...texto(t, 16, 700, t.tinta2), letterSpacing: "0.04em", opacity: paso(f, 46, 8) }}>NUEVO BADGE</div>
      <div
        style={{
          position: "relative",
          width: 128,
          height: 128,
          borderRadius: 32,
          background: u > 0.3 ? "rgba(255,76,0,0.14)" : t.tarjeta,
          boxShadow: `inset 0 0 0 2px ${mezcla(t.linea, t.acento, Math.min(1, u))}, 0 0 ${30 * Math.min(1, u)}px rgba(255,76,0,0.35)`,
          display: "grid",
          placeItems: "center",
          opacity: 0.5 + 0.5 * Math.min(1, u),
          transform: `scale(${0.9 + 0.1 * u}) rotate(${(1 - Math.min(1, u)) * -8}deg)`,
        }}
      >
        {u > 0.3 ? <Flame size={64} color={t.acento} fill="rgba(255,76,0,0.3)" strokeWidth={2} /> : <Lock size={48} color={t.tinta3} />}
        <div style={{ position: "absolute", right: -8, bottom: -8, width: 38, height: 38, borderRadius: 38, background: VERDE, display: "grid", placeItems: "center", transform: `scale(${paso(f, 50, 10, rebote)})` }}>
          <Check size={22} strokeWidth={3.4} color="#fff" />
        </div>
      </div>
      <div>
        <div style={texto(t, 21, 700)}>En Racha</div>
        <div style={texto(t, 15, 500, t.tinta2)}>7 días seguidos</div>
      </div>
    </div>
  );
};

const ModoOscuro: React.FC<PropsCelda> = ({ f, t }) => (
  <div style={{ ...llena, justifyContent: "space-between" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Moon size={28} color={t.tinta} />
      <Toggle t={t} on={paso(f, 28, 10, rebote)} escala={1.1} />
    </div>
    <div>
      <div style={texto(t, 20, 700)}>Modo oscuro</div>
      <div style={texto(t, 16, 500, t.tinta2)}>Siempre</div>
    </div>
  </div>
);

const Invitar: React.FC<PropsCelda> = ({ f, t }) => {
  const toque = pulso(f, 48, 10);
  return (
    <div style={{ ...llena, flexDirection: "row", alignItems: "center", gap: 16, background: t.degrade, padding: "0 24px" }}>
      <Gift size={36} color="#fff" style={{ transform: `rotate(${Math.sin(f / 5) * 6}deg)` }} />
      <div style={{ flex: 1 }}>
        <div style={texto(t, 22, 700, "#fff")}>Recomendá y ganá</div>
        <div style={texto(t, 16, 500, "rgba(255,255,255,0.85)")}>Un mes de fútbol gratis</div>
      </div>
      <div style={{ height: 48, padding: "0 20px", borderRadius: 999, background: "#fff", display: "flex", alignItems: "center", gap: 6, ...texto(t, 18, 700, t.acento), transform: `scale(${1 - toque * 0.08})` }}>
        Invitar <ArrowRight size={18} strokeWidth={2.6} />
      </div>
    </div>
  );
};

const espejo = false;
export const ACTO_FUTHUB: Acto = {
  nombre: "Futhub",
  tema: TEMA_FUTHUB,
  dur: 150,
  celdas: [
    { ...ubicar("A", espejo), Cmp: Partidos, sonidos: [{ en: 34, nombre: "tap", vol: 0.16 }, { en: 40, nombre: "check-b", vol: 0.14 }] },
    {
      ...ubicar("B", espejo),
      Cmp: ({ f, t, alto }) => <Marca t={t} f={f} alto={alto} logo={<Img src={uk("img/futhub-logo.png")} style={{ height: 66 }} />} nombre="Futhub" bajada="Entrená y jugá" />,
    },
    { ...ubicar("C", espejo), Cmp: Racha },
    { ...ubicar("D", espejo), Cmp: Nivel, sonidos: [{ en: 56, nombre: "pop-b", vol: 0.16 }] },
    { ...ubicar("E", espejo), Cmp: Ranking },
    { ...ubicar("F", espejo), Cmp: Drill },
    { ...ubicar("G", espejo), Cmp: Pilares },
    { ...ubicar("H", espejo), Cmp: Filtros },
    { ...ubicar("I", espejo), Cmp: Desafio },
    { ...ubicar("J", espejo), Cmp: XpHoy },
    { ...ubicar("K", espejo), Cmp: Insignia, sonidos: [{ en: 40, nombre: "pop-b", vol: 0.18 }] },
    { ...ubicar("L", espejo), Cmp: ModoOscuro },
    { ...ubicar("M", espejo), Cmp: Invitar, sinPozo: true, sonidos: [{ en: 48, nombre: "tap", vol: 0.14 }] },
  ],
};
