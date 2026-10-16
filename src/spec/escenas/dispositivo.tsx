import { AbsoluteFill, Easing, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import Telefono, { TEL } from "../../pieza/escenas/chat/telefono";
import { Content, Escenario, Stage } from "../capas";
import { TINTA, useLayout } from "../tema";
import Texto from "../texto";
import type { DatosDispositivo, Escena, PantallaTelefono } from "../tipos";

/** Pantalla del teléfono: UI REAL (captura, grabación de pantalla o el chat de WhatsApp del editor). Nunca UI generada. */
const Pantalla = ({ pantalla, fps }: { pantalla: PantallaTelefono; fps: number }) => {
  if (pantalla.tipo === "chat") {
    const s = (x: number) => Math.round(x * fps);
    const t = pantalla.turno;
    return (
      <Telefono
        contacto={pantalla.contacto}
        hora={pantalla.hora}
        marco={TINTA.marcoTelefono}
        mensajes={pantalla.mensajes.map((m) => ({
          de: m.de,
          texto: m.texto,
          at: s(m.atS),
          escribeDesde: m.escribeS !== undefined ? s(m.escribeS) : undefined,
        }))}
        turno={
          t
            ? { etiqueta: t.etiqueta, detalle: t.detalle, confirmado: t.confirmado, at: s(t.atS), confirmaAt: s(t.confirmaS) }
            : { etiqueta: "", detalle: "", confirmado: "", at: Infinity, confirmaAt: Infinity }
        }
      />
    );
  }
  const media =
    pantalla.tipo === "imagen" ? (
      <Img src={staticFile(pantalla.archivo)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    ) : (
      <OffthreadVideo
        src={staticFile(pantalla.archivo)}
        trimBefore={Math.round((pantalla.desdeS ?? 0) * fps)}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    );
  return (
    <div style={{ width: TEL.ancho, height: TEL.alto, borderRadius: 64, background: TINTA.marcoTelefono, padding: 12, boxSizing: "border-box" }}>
      <div style={{ width: "100%", height: "100%", borderRadius: 52, overflow: "hidden", background: "#000" }}>{media}</div>
    </div>
  );
};

/**
 * Teléfono flotando en 3D sobre el escenario: entra subiendo y girando, sigue rotando despacio entre `giro.desde` y
 * `giro.hasta` (nunca quieto) y lleva un reflejo que barre la pantalla. En 16:9 comparte cuadro con el texto cinético;
 * en 9:16 el teléfono va abajo y el texto arriba.
 */
export default function Dispositivo({ escena }: { escena: Escena & { datos: DatosDispositivo } }) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { width, height, u, vertical } = useLayout();
  const d = escena.datos;
  const giro = d.giro ?? { desde: [8, -22, 4], hasta: [4, -10, 1] };
  const k = interpolate(frame, [0, durationInFrames], [0, 1], { easing: Easing.inOut(Easing.sin), extrapolateRight: "clamp" });
  const rot = giro.desde.map((a, i) => a + (giro.hasta[i] - a) * k);
  const ent = interpolate(frame, [0, 24], [0, 1], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateRight: "clamp" });
  const flota = Math.sin(frame / 26) * 8 * u;

  const alto = (vertical ? 0.6 : 0.86) * height;
  const escala = alto / TEL.alto;
  const lado = vertical ? "centro" : (d.lado ?? "derecha");
  const cx = lado === "izquierda" ? width * 0.3 : lado === "derecha" ? width * 0.68 : width / 2;
  const cy = vertical ? height * 0.64 : height / 2;
  const barrido = ((frame % 150) / 150) * 260 - 80;
  const finS = durationInFrames / fps;

  return (
    <>
      <Stage>
        <Escenario brillo={{ x: cx / width, y: cy / height, ...escena.brillo }} />
      </Stage>
      <Content bloom={0.35}>
        <AbsoluteFill style={{ perspective: 1800 * u }}>
          <div
            style={{
              position: "absolute",
              left: cx - (TEL.ancho * escala) / 2,
              top: cy - (TEL.alto * escala) / 2 + (1 - ent) * 220 * u + flota,
              width: TEL.ancho * escala,
              height: TEL.alto * escala,
              transformStyle: "preserve-3d",
              transform: `rotateX(${rot[0] + (1 - ent) * 25}deg) rotateY(${rot[1]}deg) rotateZ(${rot[2]}deg)`,
              opacity: ent,
              filter: `drop-shadow(0 ${40 * u}px ${60 * u}px rgba(0,0,0,0.55))`,
            }}
          >
            <div style={{ transform: `scale(${escala})`, transformOrigin: "0 0", width: TEL.ancho, height: TEL.alto, position: "relative" }}>
              <Pantalla pantalla={d.pantalla} fps={fps} />
              {/* Reflejo que barre el vidrio. */}
              <div
                style={{
                  position: "absolute",
                  inset: 12,
                  borderRadius: 52,
                  overflow: "hidden",
                  pointerEvents: "none",
                  background: `linear-gradient(115deg, transparent ${barrido}%, rgba(255,255,255,0.16) ${barrido + 8}%, transparent ${barrido + 22}%)`,
                }}
              />
            </div>
          </div>
        </AbsoluteFill>
        {(d.textos ?? []).map((tx, i) => {
          const sig = d.textos?.[i + 1];
          const zona = vertical
            ? { left: 60 * u, right: 60 * u, top: height * 0.1 }
            : lado === "derecha"
              ? { left: width * 0.08, width: width * 0.42, top: height * 0.38 }
              : lado === "izquierda"
                ? { right: width * 0.08, width: width * 0.42, top: height * 0.38 }
                : { left: 0, right: 0, top: height * 0.08 };
          return (
            <div key={i} style={{ position: "absolute", ...zona }}>
              <Texto
                texto={{ ...tx, lado: lado === "derecha" ? "izquierda" : lado === "izquierda" ? "derecha" : "centro" }}
                hastaS={sig ? sig.atS : finS + 1}
                tamanoBase={vertical ? 84 : 92}
              />
            </div>
          );
        })}
      </Content>
    </>
  );
}
