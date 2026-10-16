import { Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Check, Lienzo, LogoCanal, Pill, T, Tile, UI, prog, useGrad } from "../kit";
import { alfa, useLayout } from "../tema";
import type { DatosCanales, Escena } from "../tipos";

const FICHA = 280;
const CARD = 350;
const CARD_ALTO = 150;
const GAP = 20;
const PUENTE = 80;

/**
 * "Publicás en todos lados": la ficha ya cargada a la izquierda y los canales (logos oficiales) que se encienden uno
 * por uno a la derecha, unidos por líneas de luz con el degradé. En 9:16 la ficha va arriba y los canales en 2x2.
 */
export default function Canales({ escena }: { escena: Escena & { datos: DatosCanales } }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, vertical } = useLayout();
  const grad = useGrad();
  const d = escena.datos;
  const f = (s: number) => Math.round(s * fps);
  const gridAlto = 2 * CARD_ALTO + GAP;
  const anchoGrid = 2 * CARD + GAP;
  const ancho = vertical ? 960 : FICHA + PUENTE + anchoGrid;

  const tarjetas = (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(2, ${vertical ? "1fr" : `${CARD * u}px`})`, gap: GAP * u, width: vertical ? "100%" : anchoGrid * u }}>
      {d.canales.map((c) => {
        const at = f(c.atS);
        return (
          <Tile key={c.canal} at={at} relleno={20} radio={26} style={{ height: CARD_ALTO * u, display: "flex", alignItems: "center", gap: 18 * u, boxSizing: "border-box" }}>
            <LogoCanal canal={c.canal} tam={76} archivos={d.logos} />
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 * u }}>
              <T tam={25} peso={700} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {c.nombre}
              </T>
              <Pill at={at + f(0.32)} ok tam={18}>
                {c.estado}
              </Pill>
            </div>
            <Check at={at + f(0.32)} tam={46} />
          </Tile>
        );
      })}
    </div>
  );

  const ficha = (
    <Tile claro relleno={16} radio={28} style={{ width: vertical ? "100%" : FICHA * u, display: "flex", flexDirection: vertical ? "row" : "column", gap: 14 * u, alignItems: vertical ? "center" : "stretch", boxSizing: "border-box" }}>
      <div style={{ width: vertical ? 220 * u : "100%", aspectRatio: "4 / 3", borderRadius: 18 * u, overflow: "hidden", flexShrink: 0 }}>
        <Img src={staticFile(d.ficha.foto)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 * u, padding: `0 ${6 * u}px ${vertical ? 0 : 6 * u}px` }}>
        <T tam={24} peso={700} style={{ lineHeight: 1.2 }}>
          {d.ficha.titulo}
        </T>
        <T tam={30} peso={800} acento style={{ lineHeight: 1.1 }}>
          {d.ficha.precio}
        </T>
        <T tam={20} peso={500} color={UI.tenue}>
          {d.ficha.zona}
        </T>
      </div>
    </Tile>
  );

  if (vertical) {
    return (
      <Lienzo brillo={escena.brillo} textos={d.textos} ancho={ancho}>
        <div style={{ display: "flex", flexDirection: "column", gap: 26 * u }}>
          {ficha}
          {tarjetas}
        </div>
      </Lienzo>
    );
  }

  // Líneas de luz de la ficha a cada canal (16:9).
  const x0 = FICHA;
  const y0 = gridAlto / 2;
  const puentes = d.canales.map((c, i) => {
    const col = i % 2;
    const fila = Math.floor(i / 2);
    const x1 = FICHA + PUENTE + col * (CARD + GAP);
    const y1 = fila * (CARD_ALTO + GAP) + CARD_ALTO / 2;
    const p = prog(frame, f(c.atS) - 8, 12);
    const d1 = `M ${x0} ${y0} C ${x0 + PUENTE * 0.6} ${y0}, ${x1 - PUENTE * 0.5} ${y1}, ${x1} ${y1}`;
    return { d: d1, p, key: c.canal };
  });

  return (
    <Lienzo brillo={escena.brillo} textos={d.textos} ancho={ancho}>
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: PUENTE * u, width: ancho * u }}>
        <svg width={ancho * u} height={gridAlto * u} viewBox={`0 0 ${ancho} ${gridAlto}`} style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", overflow: "visible", pointerEvents: "none" }}>
          <defs>
            <linearGradient id="canales-g" x1="0" y1="0" x2="1" y2="0">
              {grad.map((c, i) => (
                <stop key={c + i} offset={i / Math.max(1, grad.length - 1)} stopColor={c} />
              ))}
            </linearGradient>
          </defs>
          {puentes.map((pu) => (
            <g key={pu.key}>
              <path d={pu.d} fill="none" stroke={alfa(grad[1] ?? grad[0], 0.5)} strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray={`${Math.max(0.0001, pu.p)} 1`} style={{ filter: "blur(6px)" }} />
              <path d={pu.d} fill="none" stroke="url(#canales-g)" strokeWidth={3} strokeLinecap="round" pathLength={1} strokeDasharray={`${Math.max(0.0001, pu.p)} 1`} />
            </g>
          ))}
        </svg>
        {ficha}
        {tarjetas}
      </div>
    </Lienzo>
  );
}
