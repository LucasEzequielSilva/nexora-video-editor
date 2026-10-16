import type { CSSProperties } from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SERIF, SPEC, TINTA, fuenteDe, useLayout, useSpec } from "./tema";
import type { Palabra, TextoCinetico } from "./tipos";

const palabrasDe = (p: Palabra[] | string): Palabra[] =>
  typeof p === "string" ? p.split(/\s+/).filter(Boolean).map((t) => ({ t })) : p;

/**
 * Tipografía cinética de los spec ads: palabra por palabra, entra desenfocada y frenando desde abajo, la palabra clave
 * en color de marca. Una frase corta (2–4 palabras por línea), nunca un párrafo.
 * `hastaS` (relativo a la escena): la frase sale entera acelerando hacia arriba.
 */
export default function Texto({
  texto,
  hastaS,
  style,
  tamanoBase = 96,
}: {
  texto: TextoCinetico;
  hastaS?: number;
  style?: CSSProperties;
  tamanoBase?: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, vertical } = useLayout();
  const { spec } = useSpec();
  const paso = (texto.pasoS ?? SPEC.pasoPalabra) * fps;
  const at = texto.atS * fps;
  const sale = hastaS !== undefined ? hastaS * fps : Infinity;
  const tSale = interpolate(frame, [sale - 8, sale], [0, 1], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (frame < at - 1 || tSale >= 1) return null;
  const alineado = texto.lado === "izquierda" && !vertical ? "flex-start" : texto.lado === "derecha" && !vertical ? "flex-end" : "center";
  let n = 0;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: alineado,
        textAlign: alineado === "center" ? "center" : alineado === "flex-start" ? "left" : "right",
        gap: 6 * u,
        opacity: 1 - tSale,
        transform: `translateY(${-tSale * 40 * u}px)`,
        filter: tSale > 0 ? `blur(${tSale * 12 * u}px)` : undefined,
        ...style,
      }}
    >
      {texto.lineas.map((linea, li) => (
        <div key={li} style={{ display: "flex", flexWrap: "wrap", justifyContent: alineado, gap: `0 ${0.26 * (linea.tamano ?? tamanoBase) * u}px` }}>
          {palabrasDe(linea.palabras).map((p, pi) => {
            const ent = at + paso * n++;
            const t = interpolate(frame, [ent, ent + 12], [0, 1], {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const tam = (linea.tamano ?? tamanoBase) * u;
            return (
              <span
                key={pi}
                style={{
                  display: "inline-block",
                  fontFamily: linea.serif ? SERIF : fuenteDe(spec),
                  fontStyle: linea.serif ? "italic" : "normal",
                  fontWeight: linea.serif ? 400 : 700,
                  fontSize: tam,
                  lineHeight: 1.04,
                  letterSpacing: linea.serif ? "-0.01em" : "-0.035em",
                  color: p.acento ? spec.marca.color : linea.serif ? TINTA.tenue : TINTA.texto,
                  opacity: t,
                  transform: `translateY(${(1 - t) * 0.35 * tam}px)`,
                  filter: t < 0.999 ? `blur(${(1 - t) * 0.12 * tam}px)` : undefined,
                }}
              >
                {p.t}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
