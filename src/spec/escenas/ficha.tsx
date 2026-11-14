import { Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Anillo, Boton, Campo, Etiqueta, Lienzo, Numero, Pill, T, Tile, UI, desdeProfundidad, usd } from "../kit";
import { useLayout } from "../tema";
import type { DatosFicha, Escena } from "../tipos";

/**
 * "Cargás una vez": la ficha de la propiedad se arma a la vista — caen las fotos reales, se tipea el título, aterrizan
 * precio/ambientes/superficie/zona, el índice de calidad se llena y el botón se aprieta en "vez" → "Publicada".
 */
export default function Ficha({ escena }: { escena: Escena & { datos: DatosFicha } }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, vertical } = useLayout();
  const d = escena.datos;
  const f = (s: number) => Math.round(s * fps);
  return (
    <Lienzo brillo={escena.brillo} textos={d.textos} ancho={vertical ? 960 : 1020}>
      <Tile claro relleno={34} style={{ display: "flex", flexDirection: "column", gap: 22 * u }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Etiqueta>Nueva propiedad</Etiqueta>
          <Pill at={f(0.15)} ok>
            Disponible
          </Pill>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 * u }}>
          {d.fotos.map((foto, i) => {
            const at = f(0.12 + i * 0.11);
            return frame >= at ? (
              <div key={foto} style={{ ...desdeProfundidad(frame, at, u, 14, 34), aspectRatio: "4 / 3", borderRadius: 18 * u, overflow: "hidden", background: "rgba(255,255,255,0.05)" }}>
                <Img src={staticFile(foto)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
            ) : (
              <div key={foto} style={{ aspectRatio: "4 / 3", borderRadius: 18 * u, border: `${1 * u}px dashed ${UI.borde}` }} />
            );
          })}
        </div>
        <Campo at={f(0.55)} etiqueta="Título" valor={d.titulo} tipea />
        <div style={{ display: "grid", gridTemplateColumns: vertical ? "1fr 1fr" : "1.25fr 1fr 1fr 1fr", gap: 16 * u }}>
          <Campo at={f(1.05)} etiqueta="Precio" valor={usd(d.precio)} />
          <Campo at={f(1.2)} etiqueta="Ambientes" valor={d.ambientes} />
          <Campo at={f(1.35)} etiqueta="Superficie" valor={d.superficie} />
          <Campo at={f(1.5)} etiqueta="Zona" valor={d.zona} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 * u, flexWrap: "wrap", marginTop: 4 * u }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 * u }}>
            <Anillo at={f(0.6)} dur={f(1.3)} tam={96} grosor={10} id="ficha-calidad">
              <Numero at={f(0.6)} dur={f(1.3)} valor={100} formato={(n) => `${Math.round(n)}%`} tam={26} />
            </Anillo>
            <div>
              <T tam={24} peso={700}>
                Calidad de ficha
              </T>
              <T tam={20} peso={500} color={UI.tenue}>
                Lista para publicar
              </T>
            </div>
          </div>
          <Boton at={f(0.3)} presionaS={d.presionaS} etiqueta={d.boton} despues={d.botonDespues} alto={84} tam={27} />
        </div>
      </Tile>
    </Lienzo>
  );
}
