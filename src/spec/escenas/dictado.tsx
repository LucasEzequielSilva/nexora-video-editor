import { useCurrentFrame, useVideoConfig } from "remotion";
import { Campo, Check, Etiqueta, Lienzo, Pill, T, Tile, UI, gradCss, useGrad } from "../kit";
import { alfa, useLayout } from "../tema";
import type { DatosDictado, Escena } from "../tipos";

/** Orbe de voz (el "AIR" de Revolut): esfera con el degradé, ondas que se expanden y la forma de onda adentro. */
const Orbe = ({ activo }: { activo: boolean }) => {
  const frame = useCurrentFrame();
  const { u } = useLayout();
  const grad = useGrad();
  const tam = 200;
  const pulso = 1 + 0.03 * Math.sin(frame / 5);
  return (
    <div style={{ position: "relative", width: tam * u, height: tam * u, flexShrink: 0 }}>
      {[0, 1].map((i) => {
        const t = ((frame + i * 24) % 48) / 48;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 999,
              border: `${2 * u}px solid ${alfa(grad[1] ?? grad[0], 0.6 * (1 - t) * (activo ? 1 : 0))}`,
              transform: `scale(${1 + t * 0.9})`,
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 999,
          transform: `scale(${pulso})`,
          background: `radial-gradient(circle at 35% 30%, ${alfa(grad[0], 0.95)}, ${alfa(grad[1] ?? grad[0], 0.95)} 45%, ${alfa(grad[2] ?? grad[0], 0.9)} 80%)`,
          boxShadow: `0 0 ${60 * u}px ${alfa(grad[1] ?? grad[0], 0.6)}, 0 ${20 * u}px ${60 * u}px rgba(0,0,0,0.5)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 5 * u,
        }}
      >
        {Array.from({ length: 13 }, (_, i) => {
          const k = activo ? Math.abs(Math.sin(frame / 3.3 + i * 0.8) * Math.sin(frame / 7.1 + i * 0.37)) * (0.3 + 0.7 * Math.sin((i / 12) * Math.PI)) : 0.08;
          return <div key={i} style={{ width: 6 * u, height: (12 + 70 * k) * u, borderRadius: 99, background: "rgba(255,255,255,0.92)" }} />;
        })}
      </div>
    </div>
  );
};

/**
 * "Dictala, y la ficha se arma sola": el martillero habla (orbe + transcripción que se tipea) y los campos de la ficha
 * se completan solos, uno por uno, hasta "Lista".
 */
export default function Dictado({ escena }: { escena: Escena & { datos: DatosDictado } }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, vertical } = useLayout();
  const grad = useGrad();
  const d = escena.datos;
  const f = (s: number) => Math.round(s * fps);
  const at = f(d.atS);
  const n = Math.min(d.transcripcion.length, Math.max(0, Math.floor((frame - at) / 0.85)));
  const hablando = frame >= at && n < d.transcripcion.length;
  const listo = frame >= f(d.listoS);

  const voz = (
    <div style={{ display: "flex", flexDirection: vertical ? "row" : "column", alignItems: "center", gap: 26 * u, width: vertical ? "100%" : 400 * u }}>
      <Orbe activo={hablando} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <Pill acento tam={20}>
          Dictar
        </Pill>
        <T tam={25} peso={500} color={UI.tenue} style={{ marginTop: 14 * u, lineHeight: 1.35, minHeight: 100 * u, textAlign: vertical ? "left" : "left" }}>
          {frame >= at && (
            <>
              “{d.transcripcion.slice(0, n)}
              <span style={{ opacity: hablando && Math.floor(frame / 8) % 2 === 0 ? 1 : 0, color: UI.texto }}>|</span>
              {n >= d.transcripcion.length ? "”" : ""}
            </>
          )}
        </T>
      </div>
    </div>
  );

  const ficha = (
    <Tile claro relleno={30} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 * u, width: vertical ? "100%" : undefined, boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Etiqueta>Ficha</Etiqueta>
        {listo ? (
          <Pill at={f(d.listoS)} ok>
            <Check at={f(d.listoS)} tam={26} />
            Lista
          </Pill>
        ) : (
          <Pill tam={20}>
            <span style={{ width: 10 * u, height: 10 * u, borderRadius: 99, background: gradCss(grad), display: "inline-block", boxShadow: `0 0 ${10 * u}px ${alfa(grad[1] ?? grad[0], 0.8)}` }} />
            Escuchando…
          </Pill>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: `${16 * u}px ${18 * u}px` }}>
        {d.campos.map((c) => (
          <Campo key={c.etiqueta} at={f(c.atS)} etiqueta={c.etiqueta} valor={c.valor} />
        ))}
      </div>
    </Tile>
  );

  return (
    <Lienzo brillo={escena.brillo} textos={d.textos} ancho={vertical ? 960 : 1080}>
      <div style={{ display: "flex", flexDirection: vertical ? "column" : "row", alignItems: vertical ? "stretch" : "center", gap: 40 * u }}>
        {voz}
        {ficha}
      </div>
    </Lienzo>
  );
}
