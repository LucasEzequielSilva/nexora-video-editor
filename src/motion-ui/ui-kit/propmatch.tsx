import type React from "react";
import { Img, interpolate } from "remotion";
import { Bell, Check, Eye, Heart, Sparkles, ArrowRight, X, Zap } from "lucide-react";
import { uk } from "./fuentes";
import { ubicar, type Acto, type PropsCelda } from "./grilla";
import { Anillo, Chip, Estado, Marca, Segmentado, Tipeo, Toggle, clamp, cuenta, mezcla, paso, pulso, rebote, texto, titulo, type Tema } from "./piezas";

// PropMatch (búsqueda inmobiliaria con swipe, CABA). Modo claro de las capturas del App Store, SF Pro Display,
// gradiente firma azul → violeta → rosa → coral. Sin "% de match": la app lo sacó por ser un número inventado.

export const TEMA_PROPMATCH: Tema = {
  oscuro: false,
  fondo: "#FAF8F5",
  pozo: "#EFEBE5",
  tarjeta: "#FFFFFF",
  tarjeta2: "#F3F0EB",
  tinta: "#1A1A1A",
  tinta2: "#6B7280",
  tinta3: "#A3A3AD",
  linea: "rgba(0,0,0,0.08)",
  acento: "#A855FF",
  sobreAcento: "#FFFFFF",
  degrade: "linear-gradient(90deg, #4C7CFF, #A855FF 35%, #FF5ECA 70%, #FF8A3D)",
  primario: "#181640",
  sobrePrimario: "#FFFFFF",
  fuenteTitulo: "PmSF, sans-serif",
  fuenteTexto: "PmSF, sans-serif",
  pesoTitulo: 900,
  radioPozo: 30,
  radioTarjeta: 22,
  sombra: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(24,22,64,0.06)",
};

const ROSA = "#FF5ECA";
const VERDE = "#22C55E";
const AMBAR = "#F59E0B";
const GRAD = TEMA_PROPMATCH.degrade;
const llena: React.CSSProperties = { position: "absolute", inset: 0, padding: 22, display: "flex", flexDirection: "column" };
const mayus = (t: Tema, tam: number, color?: string): React.CSSProperties => ({ ...titulo(t, tam, color), textTransform: "uppercase", letterSpacing: "-0.035em" });

const ISO_PATH =
  "M512 526C500 496 461 472 433 472C400 472 349 510 349 557C349 641 436 726 512 776C550 799 609 833 655 833L750 833C763 833 818 809 818 735L818 483C818 449 801 420 784 400L584 216C564.4 198 538.6 188 512 188" +
  "M512 526C524 496 563 472 591 472C624 472 675 510 675 557C675 641 588 726 512 776C474 799 415 833 369 833L274 833C261 833 206 809 206 735L206 483C206 449 223 420 240 400L440 216C459.6 198 485.4 188 512 188";
const ISO_STOPS = [
  ["0", "#3C7FFA"],
  ["0.23", "#6962E4"],
  ["0.37", "#8332C3"],
  ["0.5", "#C642D3"],
  ["0.62", "#EE45D0"],
  ["0.77", "#FE6A8E"],
  ["1", "#FF805B"],
] as const;
export const Isotipo: React.FC<{ alto: number; trazo?: number }> = ({ alto, trazo = 40 }) => {
  const pad = (trazo - 27) / 2;
  const w = 644 + pad * 2;
  const h = 678 + pad * 2;
  return (
    <svg width={(alto * w) / h} height={alto} viewBox={`${190 - pad} ${172 - pad} ${w} ${h}`} fill="none">
      <defs>
        <linearGradient id="pm-iso" x1="207" y1="0" x2="818" y2="0" gradientUnits="userSpaceOnUse">
          {ISO_STOPS.map(([o, c]) => (
            <stop key={o} offset={o} stopColor={c} />
          ))}
        </linearGradient>
      </defs>
      <path d={ISO_PATH} stroke="url(#pm-iso)" strokeWidth={trazo} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const Vidrio: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      height: 34,
      padding: "0 14px",
      borderRadius: 999,
      background: "rgba(20,18,40,0.38)",
      boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.28)",
      backdropFilter: "blur(10px)",
      color: "#fff",
      fontFamily: "PmSF",
      fontWeight: 700,
      fontSize: 15,
      letterSpacing: "0.02em",
      ...style,
    }}
  >
    {children}
  </div>
);

const RAZONES = ["Tu zona", "Dentro de tu presupuesto", "Mascotas OK"];
const Tarjeta: React.FC<{ foto: string; barrio: string; nombre: string; datos: string; f: number; razones?: boolean }> = ({ foto, barrio, nombre, datos, f, razones }) => (
  <div style={{ position: "absolute", inset: 0, borderRadius: 30, overflow: "hidden", background: `center/cover url(${foto})` }}>
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,8,30,0.25) 0%, rgba(10,8,30,0) 30%, rgba(10,8,30,0.15) 50%, rgba(10,8,30,0.82) 100%)" }} />
    <div style={{ position: "absolute", top: 18, left: 18, right: 18, display: "flex", justifyContent: "space-between" }}>
      <Vidrio>
        <Sparkles size={15} color={ROSA} fill={ROSA} /> SMART MATCH
      </Vidrio>
      <Vidrio>3 / 24</Vidrio>
    </div>
    <div style={{ position: "absolute", left: 24, right: 24, bottom: 22 }}>
      <div style={{ fontFamily: "PmSF", fontWeight: 700, fontSize: 16, letterSpacing: "0.06em", color: "rgba(255,255,255,0.8)" }}>{barrio}</div>
      <div style={{ ...mayus(TEMA_PROPMATCH, 42, "#fff"), marginTop: 4, whiteSpace: "pre-line" }}>{nombre}</div>
      <div style={{ fontFamily: "PmSF", fontWeight: 600, fontSize: 20, color: "rgba(255,255,255,0.92)", marginTop: 6 }}>{datos}</div>
      {razones ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          {RAZONES.map((r, i) => {
            const e = paso(f, 14 + i * 9, 12, rebote);
            return (
              <Vidrio key={r} style={{ opacity: e, transform: `translateY(${(1 - e) * 10}px) scale(${0.8 + 0.2 * e})`, height: 32, fontSize: 15, letterSpacing: 0 }}>
                <Check size={15} strokeWidth={3} color="#7CF0A6" /> {r}
              </Vidrio>
            );
          })}
        </div>
      ) : null}
    </div>
  </div>
);

const Swipe: React.FC<PropsCelda> = ({ f }) => {
  const s = paso(f, 82, 16, (x) => x * x);
  const debajo = paso(f, 84, 14);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${0.92 + 0.08 * debajo})`, opacity: 0.4 + 0.6 * debajo }}>
        <Tarjeta foto={uk("img/palermo-soho.jpg")} barrio="PALERMO SOHO" nombre="Loft luminoso" datos="USD 1.100 /mes · 2 amb" f={f} />
      </div>
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${s * 620}px) rotate(${s * 14}deg)`, transformOrigin: "50% 120%" }}>
        <Tarjeta foto={uk("img/recoleta.jpg")} barrio="RECOLETA" nombre={`Loft con vista\nal río`} datos="USD 980 · 2 amb · 3 pers" f={f} razones />
        <div style={{ position: "absolute", top: 70, left: 26, transform: "rotate(-12deg)", opacity: paso(f, 76, 6), border: `4px solid ${ROSA}`, color: ROSA, borderRadius: 12, padding: "2px 14px", ...mayus(TEMA_PROPMATCH, 40, ROSA) }}>
          ME GUSTA
        </div>
      </div>
    </div>
  );
};

const Corazon: React.FC<PropsCelda> = ({ f, t }) => {
  const on = paso(f, 30, 10, rebote);
  const aro = paso(f, 30, 18);
  return (
    <div style={{ ...llena, alignItems: "center", justifyContent: "center", gap: 12 }}>
      <div style={{ position: "relative", width: 96, height: 96, display: "grid", placeItems: "center" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 96, border: `3px solid ${ROSA}`, transform: `scale(${0.6 + aro * 0.8})`, opacity: aro > 0 ? 1 - aro : 0 }} />
        <div style={{ width: 84, height: 84, borderRadius: 84, background: t.tarjeta, boxShadow: on > 0.5 ? `0 4px 16px rgba(255,94,202,0.35)` : t.sombra, display: "grid", placeItems: "center" }}>
          <Heart size={40} strokeWidth={2.4} color={mezcla(t.tinta, ROSA, Math.min(1, on))} fill={on > 0.5 ? ROSA : "transparent"} style={{ transform: `scale(${0.85 + 0.15 * on})` }} />
        </div>
      </div>
      <div style={texto(t, 18, 600, t.tinta2)}>{on > 0.5 ? "Guardado" : "Guardar"}</div>
    </div>
  );
};

const PROMPT = "depto con terraza en Palermo";
const Prompt: React.FC<PropsCelda> = ({ f, t }) => {
  const listo = f > 10 + PROMPT.length * 1.4 + 4;
  const toque = pulso(f, 66, 10);
  return (
    <div style={{ ...llena, justifyContent: "center", padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, height: 84, padding: "0 10px", borderRadius: 999, background: t.tarjeta, boxShadow: "0 10px 30px rgba(168,85,255,0.16)" }}>
        <div style={{ width: 64, height: 64, borderRadius: 64, background: GRAD, display: "grid", placeItems: "center", flexShrink: 0 }}>
          <Sparkles size={30} color="#fff" fill="#fff" style={{ transform: `rotate(${f * 1.5}deg)` }} />
        </div>
        <div style={{ ...texto(t, 22, 500, f < 10 ? t.tinta3 : t.tinta), flex: 1, whiteSpace: "nowrap", overflow: "hidden" }}>
          {f < 10 ? "Pedile a PropMatch…" : <Tipeo t={t} f={f} desde={10} texto={PROMPT} />}
        </div>
        <div style={{ width: 56, height: 56, borderRadius: 56, background: listo ? t.primario : t.tarjeta2, display: "grid", placeItems: "center", flexShrink: 0, transform: `scale(${1 - toque * 0.12})` }}>
          <ArrowRight size={26} strokeWidth={2.4} color={listo ? "#fff" : t.tinta} />
        </div>
      </div>
    </div>
  );
};

const VISITAS = [
  { h: "15:00", n: "Loft luminoso", b: "Palermo Soho", con: "Con Lucía", c: ROSA, en: 40 },
  { h: "18:30", n: "Depto con balcón", b: "Recoleta", con: "Con Diego", c: "#A855FF", en: 70 },
];
const Visitas: React.FC<PropsCelda> = ({ f, t }) => (
  <div style={{ ...llena, gap: 14 }}>
    <div>
      <div style={mayus(t, 28)}>Jueves 14</div>
      <div style={texto(t, 17, 500, t.tinta2)}>2 visitas</div>
    </div>
    {VISITAS.map((v, i) => {
      const e = paso(f, 8 + i * 8, 12);
      return (
        <div key={v.n} style={{ position: "relative", padding: "14px 14px 14px 20px", borderRadius: 20, background: t.tarjeta, boxShadow: t.sombra, opacity: e, transform: `translateY(${(1 - e) * 14}px)` }}>
          <div style={{ position: "absolute", left: 0, top: 14, bottom: 14, width: 5, borderRadius: 5, background: v.c }} />
          <div style={texto(t, 16, 600, t.tinta2)}>{v.h}</div>
          <div style={{ ...texto(t, 19, 700), marginTop: 2 }}>{v.n}</div>
          <div style={texto(t, 15, 500, t.tinta2)}>
            {v.b} · {v.con}
          </div>
          <div style={{ marginTop: 10 }}>
            <Estado t={t} de={{ texto: "Propuesta", color: AMBAR }} a={{ texto: "Confirmada", color: VERDE }} p={paso(f, v.en, 10)} tam={15} />
          </div>
        </div>
      );
    })}
  </div>
);

const Operacion: React.FC<PropsCelda> = ({ f, t, ancho }) => {
  const idx = interpolate(f, [30, 42, 70, 82], [0, 2, 2, 0], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  const venta = idx > 1;
  return (
    <div style={{ ...llena, justifyContent: "space-between", padding: "18px 20px" }}>
      <Segmentado t={t} opciones={["Alquiler", "Temporario", "Venta"]} idx={idx} ancho={ancho - 40} tam={19} />
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div style={texto(t, 18, 600, t.tinta2)}>Palermo Soho · 2 amb</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ ...titulo(t, 34), fontWeight: 700, letterSpacing: "-0.03em" }}>{venta ? "USD 180.000" : "USD 1.100"}</span>
          <span style={texto(t, 18, 600, t.tinta2)}>{venta ? "" : "/mes"}</span>
        </div>
      </div>
    </div>
  );
};

const Oferta: React.FC<PropsCelda> = ({ f, t }) => {
  const s = 59 - Math.floor(Math.max(0, f) / 30);
  return (
    <div style={{ ...llena, alignItems: "center", gap: 14, background: t.primario }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, ...texto(t, 15, 800, "#fff"), letterSpacing: "0.06em", alignSelf: "flex-start" }}>
        <Zap size={16} color="#FFC371" fill="#FFC371" /> OFERTA EXCLUSIVA
      </div>
      <div style={{ ...texto(t, 15, 600, "rgba(255,255,255,0.6)"), alignSelf: "flex-start", marginTop: -8 }}>Solo para vos</div>
      <div style={{ marginTop: "auto", marginBottom: "auto" }}>
        <Anillo t={t} p={0.999 - Math.max(0, f) / 3000} tam={168} grosor={9} color="#fff" pista="rgba(255,255,255,0.14)">
          <div>
            <div style={{ ...texto(t, 30, 800, "#fff"), letterSpacing: "-0.02em" }}>23:59:{String(s).padStart(2, "0")}</div>
            <div style={{ ...texto(t, 13, 600, "rgba(255,255,255,0.55)"), letterSpacing: "0.04em" }}>hs · min · seg</div>
          </div>
        </Anillo>
      </div>
      <div style={{ ...texto(t, 16, 600, "rgba(255,255,255,0.75)") }}>La oferta expira en</div>
    </div>
  );
};

const BARRIOS = [
  { n: "Palermo Soho", en: 18 },
  { n: "Recoleta", en: 40 },
  { n: "Belgrano", en: -1 },
  { n: "Núñez", en: 62 },
  { n: "Colegiales", en: -1 },
  { n: "Caballito", en: -1 },
];
const Barrios: React.FC<PropsCelda> = ({ f, t }) => (
  <div style={{ ...llena, gap: 12, padding: "18px 20px" }}>
    <div style={mayus(t, 22)}>Barrios</div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
      {BARRIOS.map((b) => (
        <Chip key={b.n} t={t} label={b.n} sel={b.en < 0 ? 0 : paso(f, b.en, 10)} tam={19} />
      ))}
    </div>
  </div>
);

const Contraoferta: React.FC<PropsCelda> = ({ f, t }) => {
  const p = paso(f, 18, 22);
  const ok = paso(f, 62, 10, rebote);
  return (
    <div style={{ ...llena, justifyContent: "space-between", padding: "18px 22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={texto(t, 18, 600, t.tinta2)}>Tu oferta</div>
        <div style={{ display: "flex", gap: 8 }}>
          {["-5%", "-10%"].map((x, i) => (
            <Chip key={x} t={t} label={x} sel={i === 1 ? paso(f, 12, 8) : 0} tam={16} />
          ))}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ ...titulo(t, 46), fontWeight: 700, letterSpacing: "-0.03em" }}>USD {cuenta(p, 1100, 990).toLocaleString("es-AR")}</span>
        <span style={texto(t, 19, 600, t.tinta2)}>/mes</span>
        <div style={{ marginLeft: "auto", opacity: ok, transform: `scale(${ok})` }}>
          <Estado t={t} de={{ texto: "Aceptada", color: VERDE }} tam={17} icono={<Check size={16} strokeWidth={3} />} />
        </div>
      </div>
    </div>
  );
};

const Publicacion: React.FC<PropsCelda> = ({ f, t }) => {
  const v = interpolate(paso(f, 16, 50), [0, 1], [32, 86]);
  const color = v < 40 ? "#FF8A3D" : v < 80 ? "#A855FF" : VERDE;
  return (
    <div style={{ ...llena, alignItems: "center", justifyContent: "center", gap: 10 }}>
      <Anillo t={t} p={v / 100} tam={110} grosor={11} color={color}>
        <div style={{ ...titulo(t, 30), fontWeight: 800 }}>{Math.round(v)}%</div>
      </Anillo>
      <div style={texto(t, 17, 600, t.tinta2)}>Tu publicación</div>
    </div>
  );
};

const Match: React.FC<PropsCelda> = ({ f, t }) => {
  const e = paso(f, 14, 16, rebote);
  const b = paso(f, 34, 12);
  return (
    <div style={{ ...llena, alignItems: "center", justifyContent: "center", gap: 14, textAlign: "center" }}>
      <div style={{ display: "flex", transform: `scale(${e})` }}>
        <div style={{ width: 92, height: 92, borderRadius: 92, padding: 4, background: GRAD, transform: `translateX(${(1 - e) * -30 + 10}px)` }}>
          <div style={{ width: "100%", height: "100%", borderRadius: 92, background: `center/cover url(${uk("img/palermo-soho.jpg")})`, boxShadow: "0 0 0 3px #fff" }} />
        </div>
        <div style={{ width: 92, height: 92, borderRadius: 92, padding: 4, background: GRAD, transform: `translateX(${(1 - e) * 30 - 10}px)` }}>
          <div style={{ width: "100%", height: "100%", borderRadius: 92, background: "#EDE4FF", boxShadow: "0 0 0 3px #fff", display: "grid", placeItems: "center", ...texto(t, 34, 800, "#A855FF") }}>C</div>
        </div>
      </div>
      <div style={{ ...mayus(t, 28), opacity: b }}>¡Hicieron match!</div>
      <div style={{ ...texto(t, 16, 500, t.tinta2), opacity: b }}>Encontraste tu lugar.</div>
      <div style={{ opacity: paso(f, 46, 10), height: 44, padding: "0 18px", borderRadius: 999, background: t.primario, color: "#fff", display: "flex", alignItems: "center", ...texto(t, 17, 650, "#fff") }}>
        👋 Saludá a Carolina
      </div>
    </div>
  );
};

const Alertas: React.FC<PropsCelda> = ({ f, t }) => (
  <div style={{ ...llena, justifyContent: "space-between" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Bell size={30} strokeWidth={2.2} color={t.tinta} style={{ transform: `rotate(${Math.sin(f / 2) * 14 * pulso(f, 36, 20)}deg)` }} />
      <Toggle t={t} on={paso(f, 30, 10, rebote)} escala={1.1} />
    </div>
    <div>
      <div style={texto(t, 20, 700)}>Alertas de precio</div>
      <div style={texto(t, 16, 500, t.tinta2)}>Si baja, te avisamos</div>
    </div>
  </div>
);

const Acciones: React.FC<PropsCelda> = ({ f, t }) => {
  const toque = pulso(f, 70, 12);
  const brillo = paso(f, 70, 6) * (1 - paso(f, 80, 14));
  return (
    <div style={{ ...llena, alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 26, padding: "12px 26px", borderRadius: 999, background: t.tarjeta, boxShadow: t.sombra }}>
        <div style={{ width: 70, height: 70, borderRadius: 70, background: t.tarjeta2, display: "grid", placeItems: "center" }}>
          <X size={32} strokeWidth={2.6} color={t.tinta} />
        </div>
        <div style={{ width: 56, height: 56, borderRadius: 56, background: "rgba(76,124,255,0.12)", display: "grid", placeItems: "center" }}>
          <Eye size={26} strokeWidth={2.4} color="#4C7CFF" />
        </div>
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: 84,
            background: "linear-gradient(135deg, #FF5ECA, #A855FF)",
            display: "grid",
            placeItems: "center",
            transform: `scale(${1 - toque * 0.14})`,
            boxShadow: `0 0 ${10 + brillo * 30}px rgba(168,85,255,${0.3 + brillo * 0.4})`,
          }}
        >
          <Heart size={38} color="#fff" fill="#fff" />
        </div>
      </div>
    </div>
  );
};

const espejo = true;
export const ACTO_PROPMATCH: Acto = {
  nombre: "PropMatch",
  tema: TEMA_PROPMATCH,
  dur: 150,
  celdas: [
    { ...ubicar("A", espejo), Cmp: Swipe, sinPozo: true, sonidos: [{ en: 82, nombre: "whoosh-short", vol: 0.14 }] },
    { ...ubicar("B", espejo), Cmp: ({ f, t, alto }) => <Marca t={t} f={f} alto={alto} logo={<Isotipo alto={58} />} nombre="PropMatch" bajada="Encontrá tu lugar" /> },
    { ...ubicar("C", espejo), Cmp: Corazon, sonidos: [{ en: 30, nombre: "pop-b", vol: 0.16 }] },
    { ...ubicar("D", espejo), Cmp: Prompt, sonidos: [{ en: 66, nombre: "click", vol: 0.14 }] },
    { ...ubicar("E", espejo), Cmp: Visitas },
    { ...ubicar("F", espejo), Cmp: Operacion },
    { ...ubicar("G", espejo), Cmp: Oferta, pozo: TEMA_PROPMATCH.primario },
    { ...ubicar("H", espejo), Cmp: Barrios, sonidos: [18, 40, 62].map((en) => ({ en, nombre: "tap", vol: 0.1 })) },
    { ...ubicar("I", espejo), Cmp: Contraoferta, sonidos: [{ en: 62, nombre: "check-b", vol: 0.16 }] },
    { ...ubicar("J", espejo), Cmp: Publicacion },
    { ...ubicar("K", espejo), Cmp: Match },
    { ...ubicar("L", espejo), Cmp: Alertas },
    { ...ubicar("M", espejo), Cmp: Acciones },
  ],
};
