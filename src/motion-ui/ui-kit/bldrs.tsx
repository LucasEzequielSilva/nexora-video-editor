import type React from "react";
import { Img, interpolate } from "remotion";
import { Check, Loader, Rocket } from "lucide-react";
import { archivo, conico, lineal } from "../../bldrs-estudio-motion/tema";
import { ubicar, type Acto, type PropsCelda } from "./grilla";
import { Boton, Check as Tilde, Chip, Estado, Marca, mezcla, paso, pulso, rebote, texto, titulo, type Tema } from "./piezas";

// bldrs: Builders Club (fases del programa, 7-Day App Challenge, 12 semanas, Ship Day) + el content-engine como producto
// propio (tablero de estados, contador de la semana, cola de guiones, autoguardado). Sistema de bldrs-web.
// Sin ranking, chat ni testimonios: no hay datos reales.

export const TEMA_BLDRS: Tema = {
  oscuro: true,
  fondo: "#0C0C0E",
  pozo: "#111114",
  tarjeta: "#17171B",
  tarjeta2: "#222228",
  tinta: "#F5F5F7",
  tinta2: "#8A8A93",
  tinta3: "#5C5C66",
  linea: "rgba(255,255,255,0.08)",
  acento: "#4ade80",
  sobreAcento: "#0C0C0E",
  degrade: lineal(90),
  primario: "#F5F5F7",
  sobrePrimario: "#0C0C0E",
  fuenteTitulo: "BldrsEuropa, sans-serif",
  fuenteTexto: "BldrsMona, sans-serif",
  pesoTitulo: 600,
  radioPozo: 28,
  radioTarjeta: 18,
  sombra: "inset 0 1px 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.06)",
};

const llena: React.CSSProperties = { position: "absolute", inset: 0, padding: 22, display: "flex", flexDirection: "column" };
const etiqueta = (t: Tema, color?: string): React.CSSProperties => ({ ...texto(t, 14, 600, color ?? t.tinta2), letterSpacing: "0.08em", textTransform: "uppercase" });

const FASES = ["Qué construir", "Que funcione", "Que se vea", "Que aguante", "Que te paguen"];
const Fases: React.FC<PropsCelda> = ({ f, t }) => {
  const p = paso(f, 40, 14);
  const barra = interpolate(p, [0, 1], [0.4, 0.6]) * paso(f, 4, 24);
  return (
    <div style={{ ...llena, gap: 12, padding: 26 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={etiqueta(t)}>Builders Club · tu camino</div>
        <div style={texto(t, 16, 600, t.tinta2)}>Fase {p > 0.5 ? 4 : 3} de 5</div>
      </div>
      <div style={{ height: 6, borderRadius: 6, background: t.tarjeta2 }}>
        <div style={{ height: 6, borderRadius: 6, width: `${barra * 100}%`, background: lineal(90) }} />
      </div>
      {FASES.map((x, i) => {
        const hecho = i < 2 ? 1 : i === 2 ? p : 0;
        const actual = i === 2 ? 1 - p : i === 3 ? p : 0;
        return (
          <div
            key={x}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              height: 46,
              padding: "0 14px",
              borderRadius: 14,
              background: mezcla("transparent", t.tarjeta, actual),
              boxShadow: actual > 0.05 ? `0 0 0 1px rgba(255,255,255,${0.1 * actual})` : undefined,
            }}
          >
            <div style={{ ...texto(t, 15, 600, t.tinta3), width: 22 }}>{String(i + 1).padStart(2, "0")}</div>
            <div style={{ ...texto(t, 21, 600, hecho > 0.5 || actual > 0.5 ? t.tinta : t.tinta2), flex: 1 }}>{x}</div>
            {i === 4 ? <div style={texto(t, 15, 500, t.tinta3)}>Tu primer cobro.</div> : null}
            {hecho > 0 ? <Tilde t={t} on={hecho} tam={26} /> : actual > 0.5 ? <div style={{ width: 10, height: 10, borderRadius: 10, background: t.acento, boxShadow: `0 0 0 ${4 + pulso(f % 30, 0, 30) * 4}px rgba(74,222,128,0.2)` }} /> : null}
          </div>
        );
      })}
    </div>
  );
};

const EnVivo: React.FC<PropsCelda> = ({ f, t }) => {
  const lat = (f % 36) / 36;
  return (
    <div style={{ ...llena, justifyContent: "space-between" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, alignSelf: "flex-start", height: 34, padding: "0 14px", borderRadius: 999, background: "rgba(40,200,64,0.12)" }}>
        <div style={{ position: "relative", width: 10, height: 10 }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 10, background: "#28C840" }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: 10, background: "#28C840", transform: `scale(${1 + lat * 2.2})`, opacity: 1 - lat }} />
        </div>
        <span style={{ ...etiqueta(t, "#28C840"), letterSpacing: "0.06em" }}>En vivo</span>
      </div>
      <div>
        <div style={texto(t, 21, 650)}>Clase en vivo</div>
        <div style={texto(t, 16, 500, t.tinta2)}>Una por semana, grabada</div>
      </div>
    </div>
  );
};

const LECCIONES = [
  { n: "Construí el flujo principal", d: "21:30", en: 22 },
  { n: "Usuarios y datos", d: "18:10", en: 46 },
];
const Challenge: React.FC<PropsCelda> = ({ f, t }) => (
  <div style={{ ...llena, gap: 10, padding: "18px 22px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <div style={texto(t, 20, 650)}>Día 3 · Tu app publicada</div>
      <div style={etiqueta(t)}>Challenge</div>
    </div>
    {LECCIONES.map((l) => {
      const on = paso(f, l.en, 10);
      return (
        <div key={l.n} style={{ display: "flex", alignItems: "center", gap: 12, height: 50, padding: "0 14px", borderRadius: 14, background: t.tarjeta }}>
          <Tilde t={t} on={on} tam={26} />
          <div style={{ ...texto(t, 18, 550, on > 0.5 ? t.tinta2 : t.tinta), flex: 1 }}>{l.n}</div>
          <div style={{ width: 60, height: 4, borderRadius: 4, background: t.tarjeta2 }}>
            <div style={{ height: 4, borderRadius: 4, width: `${paso(f, l.en - 16, 16) * 100}%`, background: t.acento }} />
          </div>
          <div style={texto(t, 15, 600, t.tinta3)}>{l.d}</div>
        </div>
      );
    })}
  </div>
);

const ESTADOS = [
  { n: "Idea", c: "#71717A", v: [4, 4, 4] },
  { n: "Investigación", c: "#38BDF8", v: [2, 2, 2] },
  { n: "Borrador", c: "#FFC371", v: [3, 2, 2] },
  { n: "Revisión", c: "#F472B6", v: [1, 2, 2] },
  { n: "Programado", c: "#A78BFA", v: [2, 2, 1] },
  { n: "Publicado", c: "#4ADE80", v: [5, 5, 6] },
];
const Tablero: React.FC<PropsCelda> = ({ f, t }) => {
  const a = paso(f, 30, 14);
  const b = paso(f, 64, 14);
  const fase = b > 0.5 ? 2 : a > 0.5 ? 1 : 0;
  const fila = 46;
  const y = a < 1 ? interpolate(a, [0, 1], [2, 3]) : interpolate(b, [0, 1], [3, 5]);
  return (
    <div style={{ ...llena, gap: 10, padding: 18 }}>
      <div style={etiqueta(t)}>Content engine</div>
      <div style={{ position: "relative", flex: 1 }}>
        {ESTADOS.map((e, i) => (
          <div key={e.n} style={{ position: "absolute", top: i * fila, left: 0, right: 0, height: fila - 8, display: "flex", alignItems: "center", gap: 10, padding: "0 6px" }}>
            <div style={{ width: 9, height: 9, borderRadius: 9, background: e.c }} />
            <div style={{ ...texto(t, 16, 550), flex: 1 }}>{e.n}</div>
            <div style={texto(t, 15, 700, t.tinta2)}>{e.v[fase]}</div>
          </div>
        ))}
        <div
          style={{
            position: "absolute",
            top: y * fila - 4,
            left: -6,
            right: -6,
            height: fila,
            borderRadius: 12,
            background: "rgba(255,255,255,0.06)",
            boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.12)`,
          }}
        />
      </div>
      <div style={{ ...texto(t, 15, 500, t.tinta2) }}>
        «Caso real» → <span style={{ color: fase === 2 ? "#4ADE80" : fase === 1 ? "#F472B6" : "#FFC371", fontWeight: 650 }}>{["Borrador", "Revisión", "Publicado"][fase]}</span>
      </div>
    </div>
  );
};

const Semana: React.FC<PropsCelda> = ({ f, t }) => {
  const p = paso(f, 46, 10);
  const chips = [
    { k: "TOFU", v: "3/3", ok: 1 },
    { k: "MOFU", v: "2/2", ok: 1 },
    { k: "BOFU", v: p > 0.5 ? "1/1" : "0/1", ok: p },
  ];
  return (
    <div style={{ ...llena, justifyContent: "space-between", padding: "18px 22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={texto(t, 20, 650)}>La semana</div>
        <div style={texto(t, 17, 600, p > 0.5 ? t.acento : t.tinta2)}>{p > 0.5 ? "6" : "5"} piezas de 6</div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {chips.map((c) => (
          <div
            key={c.k}
            style={{
              flex: 1,
              height: 50,
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: mezcla("rgba(255,195,113,0.14)", t.tarjeta, c.ok),
              boxShadow: `inset 0 0 0 1px ${mezcla("rgba(255,195,113,0.5)", "rgba(255,255,255,0.08)", c.ok)}`,
              transform: `scale(${1 + Math.sin(c.ok * Math.PI) * (c.k === "BOFU" ? 0.08 : 0)})`,
            }}
          >
            <span style={texto(t, 16, 650, mezcla("#FFC371", t.tinta2, c.ok))}>{c.k}</span>
            <span style={texto(t, 17, 700, mezcla("#FFC371", t.tinta, c.ok))}>{c.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Semanas: React.FC<PropsCelda> = ({ f, t }) => {
  const p = paso(f, 40, 14);
  const ang = f * 4;
  return (
    <div style={{ ...llena, gap: 14 }}>
      <div>
        <div style={etiqueta(t)}>Programa</div>
        <div style={{ ...titulo(t, 30), marginTop: 2 }}>12 semanas</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {Array.from({ length: 12 }, (_, i) => {
          const n = i + 1;
          const hecha = n < 4 || (n === 4 && p > 0) ? (n === 4 ? p : 1) : 0;
          const actual = n === 5 ? p : n === 4 ? 1 - p : 0;
          return (
            <div key={n} style={{ position: "relative", height: 50, borderRadius: 14, padding: 2, background: actual > 0.05 ? conico(ang) : "transparent", opacity: actual > 0.05 ? 0.4 + actual * 0.6 : 1 }}>
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 12,
                  background: hecha > 0.5 ? "rgba(74,222,128,0.12)" : t.tarjeta,
                  display: "grid",
                  placeItems: "center",
                  ...texto(t, 18, 650, hecha > 0.5 ? t.acento : actual > 0.5 ? t.tinta : t.tinta3),
                }}
              >
                {hecha > 0.5 ? <Check size={20} strokeWidth={3} /> : n}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: "auto", ...texto(t, 15, 500, t.tinta2) }}>
        Semana {p > 0.5 ? 5 : 4}
        {p > 0.5 ? <span style={{ color: t.tinta }}> · Leer lo que escribió</span> : null}
      </div>
    </div>
  );
};

const ShipDay: React.FC<PropsCelda> = ({ f, t }) => {
  const p = paso(f, 48, 10);
  return (
    <div style={{ ...llena, flexDirection: "row", alignItems: "center", gap: 18, padding: "0 24px" }}>
      <div style={{ width: 64, height: 64, borderRadius: 18, background: t.tarjeta, display: "grid", placeItems: "center", flexShrink: 0 }}>
        <Rocket size={30} color={t.tinta} style={{ transform: `translate(${p * 3}px, ${-p * 3}px)` }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={texto(t, 21, 650)}>Ship Day</div>
        <div style={texto(t, 16, 500, t.tinta2)}>Una app corriendo y un commit hecho.</div>
      </div>
      <Estado t={t} de={{ texto: "Pendiente", color: "#8A8A93" }} a={{ texto: "✓ Shipped", color: "#4ADE80" }} p={p} tam={17} />
    </div>
  );
};

const PASOS = [
  { k: "Aprobado", c: "#4ADE80" },
  { k: "Grabado", c: "#38BDF8" },
  { k: "Para revisar", c: "#A78BFA" },
];
const Guion: React.FC<PropsCelda> = ({ f, t }) => {
  const a = paso(f, 26, 8);
  const b = paso(f, 60, 8);
  const i = b > 0.5 ? 2 : a > 0.5 ? 1 : 0;
  const toque = pulso(f, 54, 10);
  return (
    <div style={{ ...llena, justifyContent: "space-between", padding: "18px 22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={etiqueta(t)}>Guion</div>
        <Boton t={t} toque={toque} tam={15} label={b > 0.5 ? "Mandada a revisar" : "Mandar a revisar"} secundario={b > 0.5} />
      </div>
      <div style={texto(t, 20, 650)}>Paso a paso: tu primer cobro</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {PASOS.map((s, j) => (
          <div key={s.k} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Estado t={t} de={{ texto: s.k, color: j <= i ? s.c : "#5C5C66" }} tam={15} />
            {j < 2 ? <div style={{ width: 16, height: 2, background: j < i ? t.tinta2 : t.tinta3 }} /> : null}
          </div>
        ))}
      </div>
    </div>
  );
};

const Guardado: React.FC<PropsCelda> = ({ f, t }) => {
  const s = f < 26 ? 0 : f < 52 ? 1 : 2;
  const txt = ["Sin guardar…", "Guardando…", "Guardado"][s];
  const color = [t.tinta3, t.tinta2, t.acento][s];
  return (
    <div style={{ ...llena, justifyContent: "space-between" }}>
      <div style={{ width: 46, height: 46, borderRadius: 46, background: s === 2 ? "rgba(74,222,128,0.14)" : t.tarjeta, display: "grid", placeItems: "center" }}>
        {s === 1 ? (
          <Loader size={24} color={t.tinta2} style={{ transform: `rotate(${f * 12}deg)` }} />
        ) : s === 2 ? (
          <Check size={24} strokeWidth={3} color={t.acento} style={{ transform: `scale(${paso(f, 52, 10, rebote)})` }} />
        ) : (
          <div style={{ width: 10, height: 10, borderRadius: 10, background: "#FFC371" }} />
        )}
      </div>
      <div>
        <div style={texto(t, 20, 650, color)}>{txt}</div>
        <div style={texto(t, 15, 500, t.tinta3)}>Autoguardado</div>
      </div>
    </div>
  );
};

const ANGULOS = ["Dolor", "Caso real", "Paso a paso", "Demo", "Contraintuitivo"];
const CAMBIA = [-100, 30, 56, 82, 9999];
const Angulos: React.FC<PropsCelda> = ({ f, t }) => (
  <div style={{ ...llena, gap: 10 }}>
    <div style={etiqueta(t)}>Ángulo</div>
    {ANGULOS.map((a, i) => {
      const idx = [1, 2, 3, 0, 4].indexOf(i);
      const sel = idx >= 0 && idx < 4 ? paso(f, CAMBIA[idx], 8) * (1 - paso(f, CAMBIA[idx + 1], 8)) : 0;
      return (
        <div key={a} style={{ alignSelf: "flex-start" }}>
          <Chip t={{ ...t, acento: "#F5F5F7", sobreAcento: "#0C0C0E" }} label={a} sel={sel} tam={18} />
        </div>
      );
    })}
  </div>
);

const Reprogramar: React.FC<PropsCelda> = ({ f, t }) => {
  const p = paso(f, 34, 14);
  const ok = paso(f, 50, 10, rebote);
  return (
    <div style={{ ...llena, justifyContent: "space-between" }}>
      <div style={{ display: "flex", gap: 8 }}>
        {["Mar 11", "Jue 13"].map((d, i) => (
          <div key={d} style={{ flex: 1, height: 58, borderRadius: 14, background: t.tarjeta, display: "grid", placeItems: "center", ...texto(t, 16, 650, t.tinta2), position: "relative" }}>
            {d}
            <div style={{ position: "absolute", bottom: 8, width: 26, height: 5, borderRadius: 5, background: "#A78BFA", opacity: i === 0 ? 1 - p : p, transform: `translateX(${i === 0 ? p * 40 : (1 - p) * -40}px)` }} />
          </div>
        ))}
      </div>
      <div style={{ opacity: ok, transform: `translateY(${(1 - ok) * 10}px)` }}>
        <div style={{ ...texto(t, 18, 650), display: "flex", alignItems: "center", gap: 6 }}>
          <Check size={18} strokeWidth={3} color={t.acento} /> Pieza reprogramada
        </div>
        <div style={texto(t, 15, 500, t.tinta3)}>Calendario</div>
      </div>
    </div>
  );
};

const Cta: React.FC<PropsCelda> = ({ f, t }) => {
  const toque = pulso(f, 58, 12);
  return (
    <div style={{ ...llena, alignItems: "center", justifyContent: "center" }}>
      <div style={{ padding: 2, borderRadius: 999, background: conico(f * 4), transform: `scale(${1 - toque * 0.04})`, boxShadow: `0 0 ${18 + toque * 30}px rgba(167,139,250,${0.25 + toque * 0.3})` }}>
        <div style={{ height: 76, padding: "0 40px", borderRadius: 999, background: "#08080A", display: "flex", alignItems: "center", ...texto(t, 23, 650) }}>Sumarme al club</div>
      </div>
    </div>
  );
};

const espejo = true;
export const ACTO_BLDRS: Acto = {
  nombre: "bldrs",
  tema: TEMA_BLDRS,
  dur: 150,
  celdas: [
    { ...ubicar("A", espejo), Cmp: Fases, sonidos: [{ en: 40, nombre: "check-b", vol: 0.16 }] },
    {
      ...ubicar("B", espejo),
      Cmp: ({ f, t, alto }) => <Marca t={t} f={f} alto={alto} logo={<Img src={archivo("img/logo_builders.svg")} style={{ height: 58 }} />} nombre="Builders Club" bajada="Construí tu app con IA" />,
    },
    { ...ubicar("C", espejo), Cmp: EnVivo },
    { ...ubicar("D", espejo), Cmp: Challenge, sonidos: [22, 46].map((en) => ({ en, nombre: "tap", vol: 0.12 })) },
    { ...ubicar("E", espejo), Cmp: Tablero },
    { ...ubicar("F", espejo), Cmp: Semana },
    { ...ubicar("G", espejo), Cmp: Semanas },
    { ...ubicar("H", espejo), Cmp: ShipDay, sonidos: [{ en: 48, nombre: "pop-b", vol: 0.16 }] },
    { ...ubicar("I", espejo), Cmp: Guion, sonidos: [{ en: 54, nombre: "click", vol: 0.14 }] },
    { ...ubicar("J", espejo), Cmp: Guardado },
    { ...ubicar("K", espejo), Cmp: Angulos },
    { ...ubicar("L", espejo), Cmp: Reprogramar },
    { ...ubicar("M", espejo), Cmp: Cta, sonidos: [{ en: 58, nombre: "tap", vol: 0.14 }] },
  ],
};
