import { useVideoConfig } from "remotion";
import { BarraRango, Check, Etiqueta, Lienzo, Numero, Pill, T, Tile, UI, usd } from "../kit";
import { useLayout } from "../tema";
import type { DatosPrecio, Escena } from "../tipos";

/**
 * "Sabé si tu precio está en rango": el tasador rápido del CRM — el precio sugerido cuenta hasta su valor, el rango
 * competitivo se enciende en la barra y el marcador se desliza adentro; cierra con "En rango".
 */
export default function Precio({ escena }: { escena: Escena & { datos: DatosPrecio } }) {
  const { fps } = useVideoConfig();
  const { u, vertical } = useLayout();
  const d = escena.datos;
  const f = (s: number) => Math.round(s * fps);
  const at = f(d.atS);
  return (
    <Lienzo brillo={escena.brillo} textos={d.textos} ancho={vertical ? 960 : 980}>
      <Tile claro relleno={38} style={{ display: "flex", flexDirection: "column", gap: 30 * u }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 * u, flexWrap: "wrap" }}>
          <Etiqueta>Mercado · ¿Cuánto pedir?</Etiqueta>
          <Pill tam={20}>{d.contexto}</Pill>
        </div>
        <div>
          <T tam={24} peso={600} color={UI.tenue}>
            Precio sugerido
          </T>
          <Numero at={at} dur={f(1.1)} valor={d.sugerido} formato={usd} tam={vertical ? 100 : 112} acento style={{ marginTop: 6 * u }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 * u }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <T tam={24} peso={700}>
              Rango competitivo
            </T>
            <T tam={20} peso={500} color={UI.tenue}>
              P25 – P75 · en USD
            </T>
          </div>
          <BarraRango at={at + f(0.35)} dur={f(1.0)} escala={d.escala} rango={d.rango} valor={d.sugerido} etiquetas={[usd(d.rango[0]), usd(d.rango[1])]} />
        </div>
        <div style={{ display: "flex", gap: 14 * u, flexWrap: "wrap", alignItems: "center" }}>
          <Pill at={at + f(1.0)} tam={21}>
            {d.comparables}
          </Pill>
          <Pill at={at + f(1.15)} tam={21}>
            {d.m2}
          </Pill>
          <Pill at={at + f(1.45)} ok tam={21}>
            <Check at={at + f(1.45)} tam={28} />
            En rango
          </Pill>
        </div>
      </Tile>
    </Lienzo>
  );
}
