import { useVideoConfig } from "remotion";
import { Anillo, Avatar, Fila, Lienzo, Numero, Pill, T, Tile } from "../kit";
import { useLayout } from "../tema";
import type { DatosContactos, Escena } from "../tipos";

/** "Y mirá qué contactos ya tienen match": los mejores matches del CRM, cada uno con su anillo de compatibilidad llenándose. */
export default function Contactos({ escena }: { escena: Escena & { datos: DatosContactos } }) {
  const { fps } = useVideoConfig();
  const { u, vertical } = useLayout();
  const d = escena.datos;
  const f = (s: number) => Math.round(s * fps);
  return (
    <Lienzo brillo={escena.brillo} textos={d.textos} ancho={vertical ? 960 : 980}>
      <Tile claro relleno={32} style={{ display: "flex", flexDirection: "column", gap: 18 * u }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 * u, marginBottom: 6 * u }}>
          <T tam={34} peso={800}>
            {d.titulo}
          </T>
          <Pill acento tam={20}>
            {d.resumen}
          </Pill>
        </div>
        {d.filas.map((r, i) => {
          const at = f(r.atS);
          return (
            <Fila
              key={r.nombre}
              at={at}
              izquierda={<Avatar inicial={r.inicial} color={r.color} tam={70} />}
              titulo={r.nombre}
              detalle={r.detalle}
              derecha={
                <Anillo at={at + 4} dur={f(0.8)} valor={r.match / 100} tam={86} grosor={9} id={`match-${i}`}>
                  <Numero at={at + 4} dur={f(0.8)} valor={r.match} formato={(n) => `${Math.round(n)}%`} tam={22} />
                </Anillo>
              }
            />
          );
        })}
      </Tile>
    </Lienzo>
  );
}
