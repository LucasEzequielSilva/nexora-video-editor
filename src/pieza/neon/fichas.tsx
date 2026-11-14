import type { CSSProperties } from "react";
import { AbsoluteFill, Img, spring, staticFile, useCurrentFrame } from "remotion";
import Sfx from "../../reserva/components/sfx";
import { ease, lerp, springAt } from "../../reserva/motion";
import { FPS, SPRING } from "../../reserva/theme";
import LogoApp from "../marca";
import type { Marca } from "../marcas-paths";
import { ajustar, CHIP, conCaja, estiloTipo, PESADA, PRESETS, type Preset, type PresetNeon, rgba, useAnchos, ZONA } from "./tema";
import TextoNeon from "./texto-neon";
import { entrada } from "./titular";

export type FichaNeon = {
  titulo: string;
  /** Ícono premium (ruta en public/). Nunca íconos genéricos ni emojis: si no hay ícono, la ficha va sin. */
  imagen?: string;
  /** Logo oficial de marca (LogoApp). */
  marca?: Marca;
  /** 2–3 acciones cortas. */
  chips?: string[];
  /** Frame local en que entra: la palabra que la nombra. Las fichas van en el orden en que se dicen. */
  en: number;
};

export type FichasProps = {
  /** Título de categoría arriba de la cabeza, en neón (gramática #10 de la referencia). */
  titulo?: string;
  fichas: FichaNeon[];
  /** Frame local en que la lista se junta en una grilla sobre el fondo del preset (gramática #6). */
  grilla?: number;
  /** Costado de la persona donde se apilan. Default izquierda. */
  lado?: "izquierda" | "derecha";
  preset?: PresetNeon;
  /** Borde de arriba de la lista en % del alto. Default 43: debajo del mentón con la cámara que calibra la cara. */
  topPct?: number;
  duracion: number;
  gananciaSfx?: number;
};

type MedidasChip = { cuerpo: number; alto: number; padX: number; gap: number; gapFila: number; arriba: number };

const LISTA = {
  /** Distancia al borde del cuadro (a la izquierda) o al borde de la zona segura (a la derecha). */
  margen: 60,
  anchoMax: 660,
  relleno: 14,
  icono: 84,
  gapIcono: 20,
  titulo: 50,
  gap: 14,
  /** La lista no baja de acá (zona segura: 1548). */
  abajo: 1530,
  chip: { cuerpo: 28, alto: 46, padX: 18, gap: 10, gapFila: 8, arriba: 12 } satisfies MedidasChip,
} as const;

/** La grilla termina en el borde derecho de la zona segura debajo de los botones (920), no en el centro del cuadro. */
const GRILLA = {
  izquierda: 80,
  derecha: ZONA.derechaBajo,
  arriba: 390,
  abajo: 1500,
  gap: 20,
  relleno: 26,
  icono: 96,
  gapIcono: 16,
  tituloMax: 46,
  anchoUnaColumna: 700,
  chip: { cuerpo: 26, alto: 42, padX: 16, gap: 8, gapFila: 8, arriba: 14 } satisfies MedidasChip,
} as const;
const CENTRO_GRILLA = (GRILLA.izquierda + GRILLA.derecha) / 2;

const TITULO = { centroY: 290, max: 84, anchoMax: 900 } as const;

const ENTRADA = { damping: 20, stiffness: 150, mass: 0.9 } as const;
const EMPUJE = { damping: 24, stiffness: 170 } as const;
const SFX_ENTRADA = ["tarjeta", "tarjeta-b", "tarjeta-c"] as const;
const SALE = 8;

const anchoChip = (porPx: number, c: MedidasChip) => Math.ceil(porPx * c.cuerpo + 2 * c.padX + 2);

/** Filas que ocupan los chips con corte greedy (el mismo que hace flex-wrap con anchos fijos) y el ancho de la más larga. */
const empacar = (anchos: number[], max: number, gap: number) => {
  let filas = 0;
  let fila = 0;
  let ancho = 0;
  for (const a of anchos) {
    if (filas === 0 || fila + gap + a > max) {
      filas++;
      fila = a;
    } else fila += gap + a;
    ancho = Math.max(ancho, fila);
  }
  return { filas, ancho: Math.min(ancho, max) };
};

const altoChips = (filas: number, c: MedidasChip) => (filas === 0 ? 0 : c.arriba + filas * c.alto + (filas - 1) * c.gapFila);

const Chips = ({ chips, anchos, c, ancho, p, style }: { chips: string[]; anchos: number[]; c: MedidasChip; ancho: number; p: Preset; style?: CSSProperties }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: `${c.gapFila}px ${c.gap}px`, width: ancho, marginTop: c.arriba, ...style }}>
    {chips.map((chip, i) => (
      <div
        key={i}
        style={{
          ...estiloTipo(CHIP, c.cuerpo),
          width: anchos[i],
          height: c.alto,
          borderRadius: c.alto / 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          background: rgba(p.base, 0.26),
          boxShadow: `inset 0 0 0 1.5px ${rgba(p.tope, 0.5)}`,
        }}
      >
        {conCaja(CHIP, chip)}
      </div>
    ))}
  </div>
);

const Icono = ({ ficha, lado, p }: { ficha: FichaNeon; lado: number; p: Preset }) => {
  if (ficha.marca) return <LogoApp marca={ficha.marca} size={lado} />;
  if (!ficha.imagen) return null;
  return (
    <div
      style={{
        width: lado,
        height: lado,
        flexShrink: 0,
        borderRadius: lado * 0.26,
        background: "linear-gradient(160deg, rgba(44, 38, 64, 0.95), rgba(16, 12, 26, 0.95))",
        boxShadow: `inset 0 0 0 1.5px ${rgba(p.tope, 0.45)}, 0 0 ${lado * 0.2}px ${rgba(p.brillo, 0.35)}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Img src={staticFile(ficha.imagen)} style={{ width: lado * 0.82, height: lado * 0.82, objectFit: "contain" }} />
    </div>
  );
};

const conIcono = (f: FichaNeon) => Boolean(f.marca || f.imagen);

/**
 * Fichas de lista (gramáticas #10 y #6 de la referencia): cada ficha (ícono + título + chips) entra al costado de la
 * persona cuando se nombra y se apilan; si no entran todas abiertas, las anteriores se cierran (quedan ícono + título) y
 * solo la última muestra sus chips. Con `grilla`, la lista se va y aparecen todas en una grilla sobre el fondo del preset.
 */
export default function Fichas({ titulo, fichas, grilla, lado = "izquierda", preset = "naranja", topPct = 43, duracion, gananciaSfx = 1 }: FichasProps) {
  const frame = useCurrentFrame();
  const p = PRESETS[preset];
  const n = fichas.length;
  const chipsDe = (f: FichaNeon) => f.chips ?? [];
  const anchos = useAnchos([
    { texto: titulo ?? "", tipo: PESADA },
    ...fichas.map((f) => ({ texto: f.titulo, tipo: PESADA })),
    ...fichas.flatMap((f) => chipsDe(f).map((texto) => ({ texto, tipo: CHIP }))),
  ]);
  if (!anchos || n === 0) return null;

  // ---------- medidas (estáticas) ----------
  const anchoTitulo = anchos[0];
  let k = 1 + n;
  const medidas = fichas.map((f, i) => {
    const chipsPx = chipsDe(f).map(() => anchos[k++]);
    const porPx = anchos[1 + i];
    const icono = conIcono(f);

    const L = LISTA;
    const textoMax = L.anchoMax - 2 * L.relleno - (icono ? L.icono + L.gapIcono : 0);
    const tamL = ajustar(porPx, textoMax, L.titulo);
    const cabecera = 2 * L.relleno + (icono ? L.icono + L.gapIcono : 0) + Math.ceil(porPx * tamL) + 2;
    const chipsL = chipsPx.map((a) => anchoChip(a, L.chip));
    const pqL = empacar(chipsL, L.anchoMax - 2 * L.relleno, L.chip.gap);
    const compacto = 2 * L.relleno + L.icono;

    return {
      tamL,
      chipsL,
      compacto,
      expandido: compacto + altoChips(pqL.filas, L.chip),
      anchoCompacto: cabecera,
      anchoExpandido: Math.max(cabecera, 2 * L.relleno + pqL.ancho),
      chipsPx,
      porPx,
    };
  });

  const top = (topPct / 100) * 1920;
  const disponible = LISTA.abajo - top;
  const alturaLista = (hs: number[]) => hs.reduce((s, h) => s + h, 0) + (n - 1) * LISTA.gap;
  const colapsar = alturaLista(medidas.map((m) => m.expandido)) > disponible;
  const alturaFinal = colapsar ? alturaLista(medidas.map((m, i) => (i < n - 1 ? m.compacto : m.expandido))) : alturaLista(medidas.map((m) => m.expandido));
  const escalaLista = Math.min(1, disponible / alturaFinal);

  const columnas = n >= 4 ? 2 : 1;
  const filasG = Math.ceil(n / columnas);
  const anchoCelda = columnas === 2 ? (GRILLA.derecha - GRILLA.izquierda - GRILLA.gap) / 2 : GRILLA.anchoUnaColumna;
  const interior = anchoCelda - 2 * GRILLA.relleno;
  const celdas = fichas.map((f, i) => {
    const m = medidas[i];
    const tam = ajustar(m.porPx, interior, GRILLA.tituloMax);
    const chips = m.chipsPx.map((a) => anchoChip(a, GRILLA.chip));
    const pq = empacar(chips, interior, GRILLA.chip.gap);
    const alto = 2 * GRILLA.relleno + (conIcono(f) ? GRILLA.icono + GRILLA.gapIcono : 0) + tam + altoChips(pq.filas, GRILLA.chip);
    return { tam, chips, alto };
  });
  /** Cada fila toma el alto de su celda más alta (no el de toda la grilla): sin ícono, la fila queda más baja. */
  const altosFila = Array.from({ length: filasG }, (_, f) => Math.max(...celdas.slice(f * columnas, (f + 1) * columnas).map((c) => c.alto)));
  const yFila = altosFila.map((_, f) => altosFila.slice(0, f).reduce((s, h) => s + h + GRILLA.gap, 0));
  const altoGrilla = altosFila.reduce((s, h) => s + h, 0) + (filasG - 1) * GRILLA.gap;
  const escalaGrilla = Math.min(1, (GRILLA.abajo - GRILLA.arriba) / altoGrilla);
  /** Con aire de sobra la grilla queda más cerca del título que del borde de abajo (35 % del aire arriba). */
  const topGrilla = GRILLA.arriba + (GRILLA.abajo - GRILLA.arriba - altoGrilla * escalaGrilla) * 0.35;
  const posCelda = (i: number) => {
    const fila = Math.floor(i / columnas);
    const col = i % columnas;
    const enFila = Math.min(columnas, n - fila * columnas);
    const anchoFila = enFila * anchoCelda + (enFila - 1) * GRILLA.gap;
    const x0 = CENTRO_GRILLA - anchoFila / 2;
    return { x: x0 + col * (anchoCelda + GRILLA.gap), y: yFila[fila], alto: altosFila[fila] };
  };

  // ---------- tiempo ----------
  const izquierda = lado === "izquierda";
  const dir = izquierda ? -1 : 1;
  const sale = ease(frame, [duracion - SALE, duracion], [1, 0]);
  const fondo = grilla === undefined ? 0 : ease(frame, [grilla, grilla + 12]);
  const salidaLista = grilla === undefined ? 0 : ease(frame, [grilla, grilla + 8]);
  const entraCelda = (i: number) => (grilla ?? 0) + 6 + i * 3;

  let y = 0;
  const tarjetas = fichas.map((f, i) => {
    const m = medidas[i];
    const siguiente = fichas[i + 1]?.en;
    const colapso = colapsar && siguiente !== undefined ? spring({ frame: frame - siguiente, fps: FPS, config: EMPUJE }) : 0;
    const h = lerp(m.expandido, m.compacto, colapso);
    const top0 = y;
    if (frame >= f.en - 1) y += h + LISTA.gap;
    return { f, m, colapso, h, top: top0, w: lerp(m.anchoExpandido, m.anchoCompacto, colapso), siguiente };
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: sale, filter: sale < 0.999 ? `blur(${(1 - sale) * 10}px)` : undefined }}>
      {fondo > 0 && (
        <>
          <AbsoluteFill
            style={{
              opacity: fondo,
              background: `radial-gradient(120% 75% at 50% 42%, ${rgba(p.base, 0.5)} 0%, ${rgba(p.base, 0.18)} 45%, rgba(0, 0, 0, 0) 80%), rgba(9, 7, 15, 0.9)`,
            }}
          />
          <AbsoluteFill
            style={{
              opacity: fondo * 0.6,
              backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.09) 1.3px, transparent 1.8px)",
              backgroundSize: "15px 15px",
            }}
          />
        </>
      )}

      {salidaLista < 1 && (
        <div
          style={{
            position: "absolute",
            top,
            ...(izquierda ? { left: LISTA.margen } : { right: 1080 - ZONA.derechaBajo }),
            transform: `translateX(${dir * 60 * salidaLista}px) scale(${escalaLista})`,
            transformOrigin: izquierda ? "0 0" : "100% 0",
            opacity: 1 - salidaLista,
            filter: salidaLista > 0.001 ? `blur(${salidaLista * 10}px)` : undefined,
          }}
        >
          {tarjetas.map(({ f, m, colapso, h, top: yCard, w, siguiente }, i) => {
            if (frame < f.en - 1) return null;
            const e = spring({ frame: frame - f.en, fps: FPS, config: ENTRADA });
            const aparece = ease(frame, [f.en, f.en + 8]);
            const nitidez = ease(frame, [f.en, f.en + 12]);
            const activo = aparece * (siguiente === undefined ? 1 : 1 - ease(frame, [siguiente, siguiente + 10]));
            const icono = conIcono(f);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: yCard,
                  ...(izquierda ? { left: 0 } : { right: 0 }),
                  width: w,
                  height: h,
                  boxSizing: "border-box",
                  padding: LISTA.relleno,
                  borderRadius: 28,
                  overflow: "hidden",
                  background: "rgba(12, 10, 18, 0.74)",
                  boxShadow: `inset 0 0 0 1.5px ${rgba(p.tope, 0.14 + 0.5 * activo)}, 0 10px 30px rgba(0, 0, 0, 0.35), 0 0 ${26 * activo}px ${rgba(p.brillo, 0.5 * activo)}`,
                  opacity: aparece,
                  transform: `translateX(${(1 - e) * dir * 90}px)`,
                  filter: nitidez < 0.999 ? `blur(${(1 - nitidez) * 10}px)` : undefined,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: LISTA.gapIcono, height: LISTA.icono }}>
                  {icono && <Icono ficha={f} lado={LISTA.icono} p={p} />}
                  <div style={{ ...estiloTipo(PESADA, m.tamL), color: "#ffffff" }}>{conCaja(PESADA, f.titulo)}</div>
                </div>
                {m.chipsL.length > 0 && (
                  <Chips
                    chips={f.chips ?? []}
                    anchos={m.chipsL}
                    c={LISTA.chip}
                    ancho={LISTA.anchoMax - 2 * LISTA.relleno}
                    p={p}
                    style={{ opacity: 1 - colapso }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {fondo > 0 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: topGrilla,
            width: 1080,
            transform: `scale(${escalaGrilla})`,
            transformOrigin: `${CENTRO_GRILLA}px 0`,
          }}
        >
          {fichas.map((f, i) => {
            const at = entraCelda(i);
            if (frame < at - 1) return null;
            const c = celdas[i];
            const pos = posCelda(i);
            const pop = springAt(frame, at, SPRING.pop);
            const nitidez = ease(frame, [at, at + 8]);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: pos.x,
                  top: pos.y,
                  width: anchoCelda,
                  height: pos.alto,
                  boxSizing: "border-box",
                  padding: GRILLA.relleno,
                  borderRadius: 32,
                  overflow: "hidden",
                  background: "linear-gradient(180deg, rgba(22, 17, 34, 0.9), rgba(12, 9, 20, 0.9))",
                  boxShadow: `inset 0 0 0 2px ${rgba(p.base, 0.75)}, inset 0 0 18px ${rgba(p.brillo, 0.12)}, 0 0 22px ${rgba(p.brillo, 0.4)}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  opacity: ease(frame, [at, at + 6]),
                  transform: `scale(${lerp(0.8, 1, pop)})`,
                  filter: nitidez < 0.999 ? `blur(${(1 - nitidez) * 10}px)` : undefined,
                }}
              >
                {conIcono(f) && (
                  <div style={{ marginBottom: GRILLA.gapIcono }}>
                    <Icono ficha={f} lado={GRILLA.icono} p={p} />
                  </div>
                )}
                <div style={{ ...estiloTipo(PESADA, c.tam), color: "#ffffff" }}>{conCaja(PESADA, f.titulo)}</div>
                {c.chips.length > 0 && <Chips chips={f.chips ?? []} anchos={c.chips} c={GRILLA.chip} ancho={interior} p={p} />}
              </div>
            );
          })}
        </div>
      )}

      {titulo && (
        <TextoNeon
          texto={titulo}
          tamano={ajustar(anchoTitulo, TITULO.anchoMax, TITULO.max)}
          preset={preset}
          encendido={ease(frame, [2, 14])}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: TITULO.centroY,
            justifyContent: "center",
            ...entrada(frame, 0, 9),
            translate: `${(CENTRO_GRILLA - 540) * fondo}px -50%`,
          }}
        />
      )}

      {titulo && <Sfx name="pop-b" at={2} volume={0.1 * gananciaSfx} />}
      {fichas.map((f, i) => (
        <Sfx key={`f${i}`} name={SFX_ENTRADA[i % SFX_ENTRADA.length]} at={f.en + 2} volume={0.075 * gananciaSfx} />
      ))}
      {grilla !== undefined && (
        <>
          <Sfx name="tarjeta-c" at={grilla + 1} volume={0.12 * gananciaSfx} />
          {fichas.map((_, i) => (
            <Sfx key={`g${i}`} name="pop-b" at={entraCelda(i)} volume={0.045 * gananciaSfx} />
          ))}
        </>
      )}
    </AbsoluteFill>
  );
}
