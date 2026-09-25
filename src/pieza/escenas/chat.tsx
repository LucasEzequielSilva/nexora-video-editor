import { AbsoluteFill, useCurrentFrame } from "remotion";
import KineticLine, { type KineticPart } from "../../reserva/components/kinetic-line";
import Sfx from "../../reserva/components/sfx";
import { ease, lerp, springAt } from "../../reserva/motion";
import { SPRING } from "../../reserva/theme";
import LogoApp from "../marca";
import type { Marca } from "../marcas-paths";
import { Calendario, type Franja, Notificacion } from "./chat/tarjetas";
import Telefono, { type MensajeTel } from "./chat/telefono";
import type { EscenaPreview, EscenaProps } from "./tipos";

type Parte = { texto: string; estilo: "serif" | "sans"; cue?: string; retraso?: number };

/**
 * Chat de WhatsApp que responde solo, agenda, confirma, recuerda y termina en el calendario.
 * Cada elemento entra en su `cue`; `retraso` (frames, puede ser negativo) lo corre respecto de ese cue.
 */
export type Datos = {
  /** Texto cinético arriba: una frase reemplaza a la anterior. Cada línea es una lista de partes. */
  frases: { cue: string; tamano?: number; logo?: Marca; lineas: Parte[][] }[];
  contacto: string;
  hora: string;
  /** `escribe`: frames de "escribiendo…" antes del mensaje. `mudo`: sin SFX (cuando otro golpe cae muy cerca). */
  mensajes: { de: "cliente" | "negocio"; texto: string; cue: string; retraso?: number; escribe?: number; mudo?: boolean }[];
  turno: { etiqueta: string; detalle: string; cue: string; confirmado: string; cueConfirma: string };
  recordatorio: { titulo: string; texto: string; cue: string };
  calendario: { titulo: string; franjas: Franja[]; destino: number; evento: string; cue: string; caeRetraso?: number };
};

export const PREVIEW: EscenaPreview<Datos> = {
  durationInFrames: 188,
  cues: { whatsapp: 24, instante: 60, agenda: 83, confirma: 102, recuerda: 125, calendario: 155 },
  datos: {
    frases: [
      {
        cue: "whatsapp",
        logo: "whatsapp",
        lineas: [[{ texto: "un sistema en tu", estilo: "serif", retraso: -16 }], [{ texto: "WhatsApp", estilo: "sans" }]],
      },
      {
        cue: "instante",
        lineas: [[{ texto: "que responde", estilo: "serif", retraso: -12 }], [{ texto: "al instante", estilo: "sans" }]],
      },
      {
        cue: "agenda",
        tamano: 104,
        lineas: [
          [
            { texto: "Agenda,", estilo: "sans" },
            { texto: "confirma", estilo: "sans", cue: "confirma" },
          ],
          [
            { texto: "y", estilo: "serif", cue: "recuerda", retraso: -4 },
            { texto: "recuerda", estilo: "sans", cue: "recuerda" },
          ],
        ],
      },
      {
        cue: "calendario",
        lineas: [[{ texto: "conectado a la agenda", estilo: "serif", retraso: -5 }], [{ texto: "que ya usás", estilo: "sans", retraso: 12 }]],
      },
    ],
    contacto: "Sofía",
    hora: "23:04",
    mensajes: [
      { de: "cliente", texto: "Hola! ¿Tienen turno el jueves?", cue: "whatsapp", escribe: 14 },
      { de: "negocio", texto: "¡Hola Sofi! Sí, jueves a las 18:00 o 19:30. ¿Cuál te queda mejor?", cue: "instante", escribe: 12 },
      { de: "cliente", texto: "18:00 porfa", cue: "agenda", retraso: -11, mudo: true },
    ],
    turno: { etiqueta: "Turno agendado", detalle: "Jueves · 18:00 hs", cue: "agenda", confirmado: "Confirmado", cueConfirma: "confirma" },
    recordatorio: { titulo: "Recordatorio enviado", texto: "«Sofi, te esperamos mañana a las 18:00»", cue: "recuerda" },
    calendario: {
      titulo: "Jueves",
      franjas: [{ hora: "17:00", evento: "Martina · Color" }, { hora: "18:00" }, { hora: "19:00", evento: "Juan · Corte" }],
      destino: 1,
      evento: "Sofía · Turno",
      cue: "calendario",
      caeRetraso: 10,
    },
  },
};

const FALLBACK: Record<string, number> = {
  whatsapp: 0.13,
  instante: 0.32,
  agenda: 0.44,
  confirma: 0.54,
  recuerda: 0.66,
  calendario: 0.82,
};

const TAMANO = 124;
/** Frames de entrada de la escena (ENTRA en marco.tsx): el tipeo que empieza ahí queda tapado por el whoosh. */
const TAPA_ENTRADA = 14;

export default function Chat({ durationInFrames, cues, datos }: EscenaProps<Datos>) {
  const frame = useCurrentFrame();
  const cue = (nombre: string) => cues[nombre] ?? Math.round((FALLBACK[nombre] ?? 0.5) * durationInFrames);

  const parteAt = (fraseCue: string, p: Parte) => cue(p.cue ?? fraseCue) + (p.retraso ?? 0);
  const inicios = datos.frases.map((f) => Math.min(...f.lineas.flat().map((p) => parteAt(f.cue, p))));

  const mensajes: (MensajeTel & { mudo?: boolean })[] = datos.mensajes.map((m) => {
    const at = cue(m.cue) + (m.retraso ?? 0);
    return { de: m.de, texto: m.texto, at, escribeDesde: m.escribe ? at - m.escribe : undefined, mudo: m.mudo };
  });
  const turnoAt = cue(datos.turno.cue);
  const confirmaAt = cue(datos.turno.cueConfirma);
  const recuerdaAt = cue(datos.recordatorio.cue);
  const calAt = cue(datos.calendario.cue);
  const caeAt = calAt + (datos.calendario.caeRetraso ?? 10);

  const telIn = springAt(frame, 3, SPRING.soft);
  const telT = ease(frame, [3, 18]);
  const corre = springAt(frame, calAt - 9, SPRING.soft);
  const flota = (fase: number, amp: number, vel = 38) => Math.sin(frame / vel + fase) * amp;

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 80, top: 188, width: 920, transform: `translateY(${flota(0.5, 3, 46)}px)` }}>
        {datos.frases.map((f, i) => {
          const inicio = inicios[i];
          const siguiente = inicios[i + 1];
          const saleDesde = siguiente === undefined ? Infinity : siguiente - 3;
          if (frame < inicio - 1 || frame > saleDesde + 9) return null;
          const sale = siguiente === undefined ? 0 : ease(frame, [saleDesde, saleDesde + 9]);
          const tamano = f.tamano ?? TAMANO;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                opacity: 1 - sale,
                transform: `translateY(${-50 * sale}px)`,
                filter: sale > 0 ? `blur(${sale * 10}px)` : undefined,
              }}
            >
              {f.lineas.map((linea, j) => {
                const partes: KineticPart[] = linea.map((p) => ({
                  text: p.texto,
                  font: p.estilo,
                  at: parteAt(f.cue, p),
                  size: p.estilo === "serif" ? Math.round(tamano * 0.56) : tamano,
                }));
                const ultima = j === f.lineas.length - 1;
                const logoAt = partes[partes.length - 1].at;
                const logo = springAt(frame, logoAt + 2, SPRING.pop);
                return (
                  <div key={j} style={{ display: "flex", alignItems: "center", gap: 26, marginTop: j === 0 ? 0 : 4 }}>
                    <KineticLine parts={partes} size={tamano} align="left" />
                    {ultima && f.logo && frame >= logoAt + 2 && (
                      <LogoApp
                        marca={f.logo}
                        size={Math.round(tamano * 0.88)}
                        style={{
                          opacity: ease(frame, [logoAt + 2, logoAt + 7]),
                          transform: `translateX(${(1 - logo) * 40}px) scale(${0.4 + 0.6 * logo}) rotate(${lerp(-14, 0, logo)}deg)`,
                          boxShadow: "0 2px 4px rgba(0,0,0,0.08), 0 14px 30px rgba(37,211,102,0.30)",
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          left: 390,
          top: 468,
          opacity: telT,
          transform: `translate(${30 * corre}px, ${(1 - telIn) * 260 + flota(0, 5)}px) rotate(${lerp(4, 0, telIn)}deg) scale(${lerp(1, 0.86, corre)})`,
          transformOrigin: "100% 40%",
          filter: telT < 1 ? `blur(${(1 - telT) * 10}px)` : corre > 0.01 ? `blur(${1.2 * corre}px)` : undefined,
        }}
      >
        <Telefono
          contacto={datos.contacto}
          hora={datos.hora}
          mensajes={mensajes}
          turno={{ ...datos.turno, at: turnoAt, confirmaAt }}
        />
        {corre > 0.01 && (
          <div style={{ position: "absolute", inset: 0, borderRadius: 64, background: `rgba(250,250,248,${0.26 * corre})` }} />
        )}
        <div style={{ position: "absolute", left: -56, top: 22, transform: `translateY(${flota(1.3, 3, 30)}px)` }}>
          <Notificacion titulo={datos.recordatorio.titulo} texto={datos.recordatorio.texto} at={recuerdaAt} saleAt={calAt - 4} />
        </div>
      </div>

      <div style={{ position: "absolute", left: 62, top: 796, transform: `translateY(${flota(2.1, 4, 34)}px)` }}>
        <Calendario
          titulo={datos.calendario.titulo}
          franjas={datos.calendario.franjas}
          destino={datos.calendario.destino}
          evento={datos.calendario.evento}
          at={calAt - 3}
          caeAt={caeAt}
        />
      </div>

      {mensajes.map((m, i) => (m.mudo ? null : <Sfx key={i} name="burbuja" at={m.at} volume={0.045} />))}
      {mensajes.flatMap((m, i) => {
        const desde = m.escribeDesde;
        if (desde === undefined || desde < TAPA_ENTRADA) return [];
        return [0, 1, 2].map((k) => (
          <Sfx key={`e${i}-${k}`} name={k % 2 === 0 ? "key-soft" : "key-b"} at={desde + 1 + 4 * k} volume={k % 2 === 0 ? 0.2 : 0.3} />
        ));
      })}
      <Sfx name="tarjeta" at={turnoAt} volume={0.065} />
      <Sfx name="double-click" at={confirmaAt} volume={0.22} />
      <Sfx name="tarjeta-b" at={recuerdaAt} volume={0.045} />
      <Sfx name="tarjeta-c" at={calAt - 3} volume={0.11} />
      <Sfx name="tap" at={caeAt} volume={0.25} />
    </AbsoluteFill>
  );
}
