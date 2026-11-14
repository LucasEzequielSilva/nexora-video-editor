import type React from "react";
import { Easing, interpolate } from "remotion";

// Piezas de interfaz para el "UI kit en movimiento" (ref. @dominikmartn, 2026-11-10).
// Todas reciben el tema de la app y valores 0..1 ya calculados: la celda decide cuándo pasa cada cosa.

export type Tema = {
  oscuro: boolean;
  fondo: string;
  pozo: string;
  tarjeta: string;
  tarjeta2: string;
  tinta: string;
  tinta2: string;
  tinta3: string;
  linea: string;
  acento: string;
  sobreAcento: string;
  degrade: string;
  primario: string;
  sobrePrimario: string;
  fuenteTitulo: string;
  fuenteTexto: string;
  pesoTitulo: number;
  radioPozo: number;
  radioTarjeta: number;
  sombra: string;
};

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = Easing.bezier(0.2, 0, 0, 1);
export const rebote = Easing.bezier(0.34, 1.56, 0.64, 1);

/** 0→1 entre `en` y `en + dur` cuadros. */
export const paso = (f: number, en: number, dur = 8, easing = suave) =>
  interpolate(f, [en, en + dur], [0, 1], { ...clamp, easing });

/** Sube y vuelve: 0→1→0 (para un toque o un brillo). */
export const pulso = (f: number, en: number, dur = 10) =>
  interpolate(f, [en, en + dur * 0.4, en + dur], [0, 1, 0], { ...clamp, easing: suave });

export const mezcla = (a: string, b: string, p: number) =>
  p <= 0 ? a : p >= 1 ? b : `color-mix(in oklab, ${b} ${Math.round(p * 100)}%, ${a})`;

export const texto = (t: Tema, tam: number, peso = 500, color?: string): React.CSSProperties => ({
  fontFamily: t.fuenteTexto,
  fontSize: tam,
  fontWeight: peso,
  color: color ?? t.tinta,
  lineHeight: 1.25,
  letterSpacing: "-0.01em",
  fontVariantNumeric: "tabular-nums",
});

export const titulo = (t: Tema, tam: number, color?: string): React.CSSProperties => ({
  fontFamily: t.fuenteTitulo,
  fontSize: tam,
  fontWeight: t.pesoTitulo,
  color: color ?? t.tinta,
  lineHeight: 1.05,
  letterSpacing: "-0.02em",
  fontVariantNumeric: "tabular-nums",
});

export const Tarjeta: React.FC<{ t: Tema; children: React.ReactNode; style?: React.CSSProperties; color?: string }> = ({
  t,
  children,
  style,
  color,
}) => (
  <div style={{ background: color ?? t.tarjeta, borderRadius: t.radioTarjeta, boxShadow: t.sombra, padding: 22, ...style }}>{children}</div>
);

export const Toggle: React.FC<{ t: Tema; on: number; escala?: number }> = ({ t, on, escala = 1 }) => {
  const w = 62 * escala;
  const h = 36 * escala;
  const k = h - 8 * escala;
  return (
    <div style={{ width: w, height: h, borderRadius: h, background: mezcla(t.tarjeta2, t.acento, on), position: "relative", flexShrink: 0 }}>
      <div
        style={{
          position: "absolute",
          top: 4 * escala,
          left: 4 * escala + (w - k - 8 * escala) * on,
          width: k,
          height: k,
          borderRadius: k,
          background: "#fff",
          boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
        }}
      />
    </div>
  );
};

export const Chip: React.FC<{ t: Tema; label: string; sel: number; icono?: React.ReactNode; tam?: number }> = ({ t, label, sel, icono, tam = 24 }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      height: tam * 1.9,
      padding: `0 ${tam * 0.75}px`,
      borderRadius: 999,
      background: mezcla(t.tarjeta, t.acento, sel),
      boxShadow: sel > 0.5 ? "none" : `inset 0 0 0 1.5px ${t.linea}`,
      color: sel > 0.5 ? t.sobreAcento : t.tinta,
      fontFamily: t.fuenteTexto,
      fontWeight: 600,
      fontSize: tam,
      whiteSpace: "nowrap",
      transform: `scale(${1 + Math.sin(sel * Math.PI) * 0.06})`,
    }}
  >
    {icono}
    {label}
  </div>
);

export const Anillo: React.FC<{
  t: Tema;
  p: number;
  tam: number;
  grosor?: number;
  color?: string;
  pista?: string;
  children?: React.ReactNode;
}> = ({ t, p, tam, grosor = 14, color, pista, children }) => {
  const r = (tam - grosor) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: tam, height: tam, flexShrink: 0 }}>
      <svg width={tam} height={tam} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={tam / 2} cy={tam / 2} r={r} fill="none" stroke={pista ?? t.tarjeta2} strokeWidth={grosor} />
        <circle
          cx={tam / 2}
          cy={tam / 2}
          r={r}
          fill="none"
          stroke={color ?? t.acento}
          strokeWidth={grosor}
          strokeLinecap="round"
          strokeDasharray={`${c * Math.max(0.001, p)} ${c}`}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>{children}</div>
    </div>
  );
};

export const Barras: React.FC<{ t: Tema; valores: number[]; p: number; resaltar?: number; alto: number; ancho?: number }> = ({
  t,
  valores,
  p,
  resaltar,
  alto,
  ancho = 22,
}) => {
  const max = Math.max(...valores);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: alto }}>
      {valores.map((v, i) => {
        const pi = interpolate(p, [i * 0.06, i * 0.06 + 0.55], [0, 1], { ...clamp, easing: suave });
        return (
          <div
            key={i}
            style={{
              width: ancho,
              height: Math.max(ancho, (v / max) * alto * pi),
              borderRadius: ancho,
              background: i === resaltar ? t.degrade : t.tarjeta2,
            }}
          />
        );
      })}
    </div>
  );
};

export const Calendario: React.FC<{
  t: Tema;
  mes: string;
  dias: number;
  inicio: number;
  sel: number;
  selAntes: number;
  cambio: number;
  marcados?: number[];
  hoy?: number;
  tam?: number;
}> = ({ t, mes, dias, inicio, sel, selAntes, cambio, marcados = [], hoy, tam = 21 }) => {
  const celda = tam * 2.05;
  const pos = (d: number) => {
    const i = d - 1 + inicio;
    return { x: (i % 7) * celda, y: Math.floor(i / 7) * celda };
  };
  const a = pos(selAntes);
  const b = pos(sel);
  const x = a.x + (b.x - a.x) * cambio;
  const y = a.y + (b.y - a.y) * cambio;
  const estiramiento = Math.sin(cambio * Math.PI) * 0.18;
  return (
    <div>
      <div style={{ ...texto(t, tam * 1.05, 650), marginBottom: tam * 0.7, display: "flex", justifyContent: "space-between" }}>
        <span>{mes}</span>
        <span style={{ color: t.tinta3, letterSpacing: 6 }}>‹ ›</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(7, ${celda}px)`, marginBottom: tam * 0.25 }}>
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
          <div key={i} style={{ ...texto(t, tam * 0.72, 600, t.tinta3), textAlign: "center" }}>
            {d}
          </div>
        ))}
      </div>
      <div style={{ position: "relative", width: celda * 7, height: Math.ceil((dias + inicio) / 7) * celda }}>
        <div
          style={{
            position: "absolute",
            left: x + celda * 0.08,
            top: y + celda * 0.08,
            width: celda * 0.84,
            height: celda * 0.84,
            borderRadius: celda,
            background: t.degrade,
            transform: `scale(${1 + estiramiento}, ${1 - estiramiento * 0.6})`,
          }}
        />
        {Array.from({ length: dias }, (_, i) => {
          const d = i + 1;
          const p = pos(d);
          const enSel = Math.abs(p.x - x) < celda * 0.4 && Math.abs(p.y - y) < celda * 0.4;
          return (
            <div
              key={d}
              style={{
                position: "absolute",
                left: p.x,
                top: p.y,
                width: celda,
                height: celda,
                display: "grid",
                placeItems: "center",
                ...texto(t, tam * 0.92, enSel ? 700 : 500, enSel ? t.sobreAcento : d === hoy ? t.tinta : t.tinta2),
              }}
            >
              {d}
              {marcados.includes(d) && !enSel ? (
                <div style={{ position: "absolute", bottom: celda * 0.12, width: 5, height: 5, borderRadius: 5, background: t.acento }} />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Burbuja: React.FC<{ t: Tema; propio?: boolean; p: number; children: React.ReactNode; tam?: number }> = ({
  t,
  propio,
  p,
  children,
  tam = 22,
}) => (
  <div
    style={{
      alignSelf: propio ? "flex-end" : "flex-start",
      maxWidth: "88%",
      padding: `${tam * 0.55}px ${tam * 0.8}px`,
      borderRadius: tam * 1.1,
      borderBottomRightRadius: propio ? tam * 0.3 : tam * 1.1,
      borderBottomLeftRadius: propio ? tam * 1.1 : tam * 0.3,
      background: propio ? t.primario : t.tarjeta2,
      color: propio ? t.sobrePrimario : t.tinta,
      fontFamily: t.fuenteTexto,
      fontSize: tam,
      fontWeight: 500,
      lineHeight: 1.3,
      opacity: p,
      transform: `translateY(${(1 - p) * 14}px) scale(${0.92 + 0.08 * p})`,
      transformOrigin: propio ? "100% 100%" : "0% 100%",
    }}
  >
    {children}
  </div>
);

export const Escribiendo: React.FC<{ t: Tema; f: number; p: number }> = ({ t, f, p }) => (
  <div
    style={{
      alignSelf: "flex-start",
      display: "flex",
      gap: 6,
      padding: "14px 18px",
      borderRadius: 22,
      borderBottomLeftRadius: 6,
      background: t.tarjeta2,
      opacity: p,
    }}
  >
    {[0, 1, 2].map((i) => (
      <div key={i} style={{ width: 9, height: 9, borderRadius: 9, background: t.tinta3, transform: `translateY(${Math.sin(f / 4 - i * 0.9) * 3}px)` }} />
    ))}
  </div>
);

export const Estrellas: React.FC<{ t: Tema; n: number; tam?: number }> = ({ t, n, tam = 30 }) => (
  <div style={{ display: "flex", gap: tam * 0.2 }}>
    {[0, 1, 2, 3, 4].map((i) => {
      const lleno = interpolate(n, [i, i + 1], [0, 1], clamp);
      return (
        <svg key={i} width={tam} height={tam} viewBox="0 0 24 24" style={{ transform: `scale(${1 + Math.sin(lleno * Math.PI) * 0.25})` }}>
          <path
            d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"
            fill={mezcla(t.tarjeta2, t.acento, lleno)}
            strokeLinejoin="round"
          />
        </svg>
      );
    })}
  </div>
);

export const Slider: React.FC<{ t: Tema; v: number; ancho: number }> = ({ t, v, ancho }) => (
  <div style={{ position: "relative", width: ancho, height: 28 }}>
    <div style={{ position: "absolute", top: 11, left: 0, right: 0, height: 6, borderRadius: 6, background: t.tarjeta2 }} />
    <div style={{ position: "absolute", top: 11, left: 0, width: ancho * v, height: 6, borderRadius: 6, background: t.degrade }} />
    <div
      style={{
        position: "absolute",
        top: 0,
        left: ancho * v - 14,
        width: 28,
        height: 28,
        borderRadius: 28,
        background: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      }}
    />
  </div>
);

export const Check: React.FC<{ t: Tema; on: number; tam?: number; color?: string }> = ({ t, on, tam = 30, color }) => (
  <div
    style={{
      width: tam,
      height: tam,
      borderRadius: tam,
      flexShrink: 0,
      background: mezcla(t.tarjeta2, color ?? t.acento, on),
      display: "grid",
      placeItems: "center",
      transform: `scale(${1 + Math.sin(on * Math.PI) * 0.2})`,
    }}
  >
    <svg width={tam * 0.55} height={tam * 0.55} viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12.5l4.5 4.5L19 7.5"
        stroke={t.sobreAcento}
        strokeWidth={3.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={22}
        strokeDashoffset={22 * (1 - on)}
      />
    </svg>
  </div>
);

export const Avatar: React.FC<{ t: Tema; ini: string; color: string; tam?: number; foto?: string; borde?: string }> = ({
  t,
  ini,
  color,
  tam = 44,
  foto,
  borde,
}) => (
  <div
    style={{
      width: tam,
      height: tam,
      borderRadius: tam,
      flexShrink: 0,
      background: foto ? `center/cover url(${foto})` : color,
      display: "grid",
      placeItems: "center",
      boxShadow: borde ? `0 0 0 3px ${borde}` : undefined,
      ...texto(t, tam * 0.4, 700, "#fff"),
    }}
  >
    {foto ? null : ini}
  </div>
);

export const Segmentado: React.FC<{ t: Tema; opciones: string[]; idx: number; tam?: number; ancho: number }> = ({ t, opciones, idx, tam = 21, ancho }) => {
  const w = (ancho - 8) / opciones.length;
  return (
    <div style={{ position: "relative", width: ancho, height: tam * 2.3, borderRadius: 999, background: t.tarjeta2, padding: 4 }}>
      <div
        style={{
          position: "absolute",
          top: 4,
          bottom: 4,
          left: 4 + w * idx,
          width: w,
          borderRadius: 999,
          background: t.tarjeta,
          boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
        }}
      />
      <div style={{ position: "relative", display: "flex", height: "100%" }}>
        {opciones.map((o, i) => (
          <div
            key={o}
            style={{
              width: w,
              display: "grid",
              placeItems: "center",
              ...texto(t, tam, 600, Math.abs(idx - i) < 0.5 ? t.tinta : t.tinta3),
            }}
          >
            {o}
          </div>
        ))}
      </div>
    </div>
  );
};

/** Texto que se escribe letra por letra, con cursor. */
export const Tipeo: React.FC<{ t: Tema; f: number; desde: number; texto: string; cps?: number; style?: React.CSSProperties }> = ({
  t,
  f,
  desde,
  texto: s,
  cps = 1.4,
  style,
}) => {
  const n = Math.max(0, Math.min(s.length, Math.floor((f - desde) / cps)));
  const visible = n < s.length || Math.floor(f / 15) % 2 === 0;
  return (
    <span style={style}>
      {s.slice(0, n)}
      <span style={{ display: "inline-block", width: 2, height: "1em", marginLeft: 2, verticalAlign: "-0.12em", background: t.acento, opacity: visible ? 1 : 0 }} />
    </span>
  );
};

/** Número que cuenta de `de` a `a`. */
export const cuenta = (p: number, de: number, a: number) => Math.round(de + (a - de) * p);

export const pesos = (n: number) => `$${n.toLocaleString("es-AR")}`;

/** Píldora de estado con tinte (Pendiente, Pagado, Confirmada…). Cruza de un estado a otro con `p`. */
export const Estado: React.FC<{
  t: Tema;
  de: { texto: string; color: string };
  a?: { texto: string; color: string };
  p?: number;
  tam?: number;
  icono?: React.ReactNode;
}> = ({ t, de, a, p = 0, tam = 18, icono }) => {
  const s = a && p >= 0.5 ? a : de;
  const color = a ? mezcla(de.color, a.color, p) : de.color;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: tam * 1.75,
        padding: `0 ${tam * 0.65}px`,
        borderRadius: 999,
        background: `color-mix(in oklab, ${color} 16%, transparent)`,
        color,
        fontFamily: t.fuenteTexto,
        fontWeight: 650,
        fontSize: tam,
        whiteSpace: "nowrap",
        transform: `scale(${1 + Math.sin(p * Math.PI) * 0.1})`,
      }}
    >
      {icono}
      {s.texto}
    </div>
  );
};

/** Celda de marca: logo, nombre y qué es. */
export const Marca: React.FC<{ t: Tema; f: number; logo: React.ReactNode; nombre: string; bajada: string; alto: number }> = ({
  t,
  f,
  logo,
  nombre,
  bajada,
  alto,
}) => {
  const e = paso(f, 4, 14, rebote);
  return (
    <div style={{ position: "absolute", inset: 0, padding: 22, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ transform: `scale(${0.6 + 0.4 * e}) rotate(${(1 - e) * -12}deg)`, transformOrigin: "0% 0%", height: alto * 0.36, display: "flex", alignItems: "flex-start" }}>
        {logo}
      </div>
      <div>
        <div style={{ ...titulo(t, 30), letterSpacing: "-0.02em" }}>{nombre}</div>
        <div style={{ ...texto(t, 18, 500, t.tinta2), marginTop: 4 }}>{bajada}</div>
      </div>
    </div>
  );
};

/** Botón que se hunde al tocarlo. */
export const Boton: React.FC<{ t: Tema; label: React.ReactNode; toque: number; style?: React.CSSProperties; secundario?: boolean; tam?: number }> = ({
  t,
  label,
  toque,
  style,
  secundario,
  tam = 22,
}) => (
  <div
    style={{
      height: tam * 2.3,
      padding: `0 ${tam}px`,
      borderRadius: 999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      background: secundario ? t.tarjeta2 : t.primario,
      color: secundario ? t.tinta : t.sobrePrimario,
      fontFamily: t.fuenteTexto,
      fontWeight: 650,
      fontSize: tam,
      whiteSpace: "nowrap",
      transform: `scale(${1 - toque * 0.06})`,
      filter: toque > 0 ? `brightness(${1 - toque * 0.12})` : undefined,
      ...style,
    }}
  >
    {label}
  </div>
);
