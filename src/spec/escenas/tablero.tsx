import { useCurrentFrame, useVideoConfig } from "remotion";
import { BordeLuz, INOUT, Lienzo, Navegador, Numero, Pill, T, Tile, WEB, miles, prog, usd } from "../kit";
import { useLayout } from "../tema";
import type { DatosTablero, Escena, Kpi } from "../tipos";

const formato = (k: Kpi) => (k.formato === "usd" ? usd : k.formato === "usdM" ? (n: number) => `USD ${n.toFixed(2).replace(".", ",")}M` : miles);

/**
 * "Toda tu inmobiliaria, en un solo lugar": la ventana del CRM entra con el borde de luz (establishing shot) y en
 * `kpisS` pasa al fondo desenfocada (profundidad de campo) mientras los KPIs del tablero vienen al frente y cuentan.
 */
export default function Tablero({ escena }: { escena: Escena & { datos: DatosTablero } }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, vertical } = useLayout();
  const d = escena.datos;
  const k = Math.round(d.kpisS * fps);
  const atras = prog(frame, k, 22, INOUT);
  const anchoZona = vertical ? 960 : 1000;
  const escala = anchoZona / WEB.ancho;
  const altoVent = WEB.ancho / 1.6 + WEB.barra;
  const borde = prog(frame, 6, 28, INOUT);
  return (
    <Lienzo brillo={escena.brillo} textos={d.textos} ancho={anchoZona}>
      <div style={{ position: "relative", width: anchoZona * u, height: altoVent * escala * u }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `perspective(${1800 * u}px) rotateY(${-9 + 7 * atras}deg) rotateX(3deg) scale(${1 - 0.08 * atras})`,
            filter: atras > 0.01 ? `blur(${atras * 14 * u}px) brightness(${1 - 0.5 * atras})` : undefined,
            opacity: 1 - 0.25 * atras,
          }}
        >
          <div style={{ transform: `scale(${escala * u})`, transformOrigin: "0 0", width: WEB.ancho, height: altoVent, position: "relative" }}>
            <Navegador archivo={d.ventana} alto={altoVent} />
            <BordeLuz progreso={borde} ancho={WEB.ancho} alto={altoVent} radio={WEB.radio} id="tablero-borde" />
          </div>
        </div>
        {frame >= k && (
          <div
            style={{
              position: "absolute",
              left: vertical ? 30 * u : -20 * u,
              right: vertical ? 30 * u : -20 * u,
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              flexDirection: vertical ? "column" : "row",
              gap: 22 * u,
            }}
          >
            {d.kpis.map((kpi, i) => {
              const at = k + i * 7;
              return (
                <Tile
                  key={kpi.etiqueta}
                  at={at}
                  claro
                  relleno={28}
                  style={{
                    flex: vertical ? undefined : 1,
                    display: "flex",
                    flexDirection: vertical ? "row" : "column",
                    alignItems: vertical ? "center" : "flex-start",
                    justifyContent: "space-between",
                    gap: 14 * u,
                    minHeight: vertical ? undefined : 250 * u,
                  }}
                >
                  <Numero at={at + 6} dur={34} valor={kpi.valor} formato={formato(kpi)} tam={vertical ? 72 : 76} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 * u, alignItems: vertical ? "flex-end" : "flex-start" }}>
                    <T tam={27} peso={700}>
                      {kpi.etiqueta}
                    </T>
                    {kpi.sub && (
                      <Pill at={at + 22} ok tam={19}>
                        {kpi.sub}
                      </Pill>
                    )}
                  </div>
                </Tile>
              );
            })}
          </div>
        )}
      </div>
    </Lienzo>
  );
}
