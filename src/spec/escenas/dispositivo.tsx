import { AbsoluteFill, Easing, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import Telefono, { TEL } from "../../pieza/escenas/chat/telefono";
import { Content, Escenario, Stage } from "../capas";
import { TINTA, alfa, fuenteDe, useLayout, useSpec } from "../tema";
import { Navegador, WEB } from "../kit";
import Notificacion from "../notificacion";
import Texto from "../texto";
import type { DatosDispositivo, Escena, PantallaTelefono } from "../tipos";


/** Pantalla del teléfono: UI REAL (captura, grabación de pantalla o el chat de WhatsApp del editor). Nunca UI generada. */
const Pantalla = ({ pantalla, fps, ancho }: { pantalla: PantallaTelefono; fps: number; ancho: number }) => {
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
    pantalla.tipo === "imagen" || pantalla.tipo === "web" ? (
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
    <div style={{ width: ancho, height: TEL.alto, borderRadius: 64, background: TINTA.marcoTelefono, padding: 12, boxSizing: "border-box" }}>
      <div style={{ width: "100%", height: "100%", borderRadius: 52, overflow: "hidden", background: "#000" }}>{media}</div>
    </div>
  );
};


/** Borde de luz con el degradé que se dibuja alrededor del teléfono y queda brillando (la línea del motivo "entra" al celular). */
const Borde = ({ borde, ancho, alto, radio }: { borde: { desdeS: number; hastaS: number }; ancho: number; alto: number; radio: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { spec } = useSpec();
  const p = interpolate(frame, [borde.desdeS * fps, borde.hastaS * fps], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (p <= 0) return null;
  const grad = spec.marca.degradado ?? [spec.marca.color, spec.marca.color];
  return (
    <svg width={ancho} height={alto} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
      <defs>
        <linearGradient id="borde-g" x1="0" y1="0" x2={ancho} y2={alto} gradientUnits="userSpaceOnUse">
          {grad.map((c, i) => (
            <stop key={c + i} offset={i / Math.max(1, grad.length - 1)} stopColor={c} />
          ))}
        </linearGradient>
        <filter id="borde-f" x={-200} y={-200} width={ancho + 400} height={alto + 400} filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation={14} />
        </filter>
      </defs>
      <rect x={2} y={2} width={ancho - 4} height={alto - 4} rx={radio} fill="none" stroke="url(#borde-g)" strokeWidth={14} pathLength={1} strokeDasharray={`${p} 1`} filter="url(#borde-f)" opacity={0.9} />
      <rect x={2} y={2} width={ancho - 4} height={alto - 4} rx={radio} fill="none" stroke="url(#borde-g)" strokeWidth={4} pathLength={1} strokeDasharray={`${p} 1`} />
    </svg>
  );
};

/** Texto dictado que se tipea en vivo (letra por letra, con cursor). */
const Dictado = ({ dictado, cx, cy }: { dictado: { atS: number; texto: string; pasoS?: number }; cx: number; cy: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u } = useLayout();
  const { spec } = useSpec();
  const at = dictado.atS * fps;
  if (frame < at) return null;
  const n = Math.min(dictado.texto.length, Math.floor((frame - at) / ((dictado.pasoS ?? 0.035) * fps)));
  const cursor = Math.floor(frame / 8) % 2 === 0 && n < dictado.texto.length;
  return (
    <div
      style={{
        position: "absolute",
        left: cx - 340 * u,
        top: cy - 40 * u,
        width: 680 * u,
        textAlign: "center",
        fontFamily: fuenteDe(spec),
        fontWeight: 500,
        fontSize: 34 * u,
        lineHeight: 1.3,
        color: TINTA.tenue,
      }}
    >
      “{dictado.texto.slice(0, n)}
      <span style={{ opacity: cursor ? 1 : 0, color: TINTA.texto }}>|</span>”
    </div>
  );
};

/** Onda de voz del dictado: barras con el degradé de marca que respiran con la voz. */
const Onda = ({ onda, cx, cy }: { onda: { atS: number; hastaS: number }; cx: number; cy: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u } = useLayout();
  const { spec } = useSpec();
  const ent = interpolate(frame, [onda.atS * fps, onda.atS * fps + 10, onda.hastaS * fps - 8, onda.hastaS * fps], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (ent <= 0) return null;
  const barras = 32;
  const grad = spec.marca.degradado ?? [spec.marca.color, spec.marca.color];
  return (
    <div style={{ position: "absolute", left: cx - 330 * u, top: cy - 70 * u, width: 660 * u, height: 140 * u, display: "flex", alignItems: "center", gap: 8 * u, opacity: ent }}>
      {Array.from({ length: barras }, (_, i) => {
        const k = Math.abs(Math.sin(frame / 3.1 + i * 0.7) * Math.sin(frame / 7.3 + i * 0.31)) * (0.35 + 0.65 * Math.sin((i / barras) * Math.PI));
        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${12 + 88 * k * ent}%`,
              borderRadius: 99,
              background: `linear-gradient(180deg, ${grad.join(", ")})`,
              boxShadow: `0 0 ${14 * u}px ${alfa(grad[Math.floor((i / barras) * grad.length)] ?? grad[0], 0.6)}`,
            }}
          />
        );
      })}
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
  const { spec } = useSpec();
  const d = escena.datos;
  const giro = d.giro ?? { desde: [8, -22, 4], hasta: [4, -10, 1] };
  const k = interpolate(frame, [0, durationInFrames], [0, 1], { easing: Easing.inOut(Easing.sin), extrapolateRight: "clamp" });
  const rot = giro.desde.map((a, i) => a + (giro.hasta[i] - a) * k);
  const ent = interpolate(frame, [0, 24], [0, 1], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateRight: "clamp" });
  const flota = Math.sin(frame / 26) * 8 * u;

  const p = d.pantalla;
  const web = p.tipo === "web";
  // Tamaño lógico del dispositivo: teléfono (TEL) o ventana de navegador (barra de 56 + captura).
  const anchoTel = web ? WEB.ancho : p.tipo === "imagen" && p.aspecto ? Math.round((TEL.alto - 24) * p.aspecto + 24) : TEL.ancho;
  const altoTel = web ? Math.round(WEB.ancho / (p.aspecto ?? 1.6)) + WEB.barra : TEL.alto;
  const escala = web ? ((vertical ? 0.94 : 0.6) * width) / anchoTel : ((vertical ? 0.6 : 0.86) * height) / TEL.alto;
  const z = d.zoom
    ? interpolate(frame, [d.zoom.desdeS * fps, d.zoom.hastaS * fps], [1, d.zoom.escala], {
        easing: Easing.inOut(Easing.cubic),
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;
  const lado = vertical ? "centro" : (d.lado ?? "derecha");
  const cx = lado === "izquierda" ? width * (web ? 0.37 : 0.3) : lado === "derecha" ? width * (web ? 0.63 : 0.68) : width / 2;
  const cy = vertical ? height * (web ? 0.6 : 0.64) : height / 2;
  const barrido = ((frame % 150) / 150) * 260 - 80;
  const finS = durationInFrames / fps;

  return (
    <>
      <Stage>
        <Escenario brillo={{ x: cx / width, y: cy / height, ...escena.brillo }} />
      </Stage>
      <Content bloom={web ? 0.1 : 0.35}>
        <AbsoluteFill style={{ perspective: 1800 * u }}>
          <div
            style={{
              position: "absolute",
              left: cx - (anchoTel * escala) / 2,
              top: cy - (altoTel * escala) / 2 + (1 - ent) * 220 * u + flota,
              width: anchoTel * escala,
              height: altoTel * escala,
              transformStyle: "preserve-3d",
              transform: `scale(${web ? 1 : z}) rotateX(${rot[0] + (1 - ent) * 25}deg) rotateY(${rot[1]}deg) rotateZ(${rot[2]}deg)`,
              transformOrigin: d.zoom ? `${d.zoom.foco[0] * 100}% ${d.zoom.foco[1] * 100}%` : "50% 50%",
              opacity: ent,
              filter: `drop-shadow(0 ${40 * u}px ${60 * u}px rgba(0,0,0,0.55))`,
            }}
          >
            <div style={{ transform: `scale(${escala})`, transformOrigin: "0 0", width: anchoTel, height: altoTel, position: "relative" }}>
              {p.tipo === "web" ? <Navegador archivo={p.archivo} url={p.url} alto={altoTel} zoom={z} foco={d.zoom?.foco} /> : <Pantalla pantalla={d.pantalla} fps={fps} ancho={anchoTel} />}
              {/* Reflejo que barre el vidrio. */}
              <div
                style={{
                  position: "absolute",
                  inset: web ? 0 : 12,
                  borderRadius: web ? WEB.radio : 52,
                  overflow: "hidden",
                  pointerEvents: "none",
                  background: `linear-gradient(115deg, transparent ${barrido}%, rgba(255,255,255,0.16) ${barrido + 8}%, transparent ${barrido + 22}%)`,
                }}
              />
              {d.borde && <Borde borde={d.borde} ancho={anchoTel} alto={altoTel} radio={web ? WEB.radio : 62} />}
            </div>
          </div>
        </AbsoluteFill>
        {d.dictado && <Dictado dictado={d.dictado} cx={vertical ? width / 2 : lado === "derecha" ? width * 0.29 : width * 0.71} cy={vertical ? height * 0.31 : height * 0.8} />}
        {d.notificacion && <Notificacion n={d.notificacion} icono={spec.marca.icono} />}
        {d.onda && <Onda onda={d.onda} cx={vertical ? width / 2 : lado === "derecha" ? width * 0.29 : width * 0.71} cy={vertical ? height * 0.26 : height * 0.68} />}
        {(d.textos ?? []).map((tx, i) => {
          const sig = d.textos?.[i + 1];
          const zona = vertical
            ? { left: 60 * u, right: 60 * u, top: height * 0.1 }
            : lado === "derecha"
              ? { left: width * 0.05, width: web ? width * 0.27 : width * 0.42, top: height * 0.38 }
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
