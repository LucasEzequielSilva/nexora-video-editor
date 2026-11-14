import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CUADROS, CURVA, RESORTE } from "./movimiento";
import { conAlfa, contraste, mezclar, textoSobre } from "./primitivas";
import { horarioChat, llegadasNotifF, llegadasTurnosF } from "./tiempos";
import type { Marca, Mensaje, Notificacion, Turno } from "./tema";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Medidas de los objetos en px del cuadro 1920x1080: las transiciones las usan para saber dónde está cada uno. */
export const TAM = {
  telefono: { w: 520, h: 1120, radio: 92 },
  chat: { w: 900, h: 760, radio: 36 },
  agenda: { w: 1000, h: 800, radio: 28 },
} as const;

/** Logo de WhatsApp (simple-icons, CC0). */
const WA_GLIFO =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z";

const IconoApp: React.FC<{ app?: string; marca: Marca }> = ({ app, marca }) => {
  const wa = (app ?? "").toLowerCase() === "whatsapp";
  return (
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        flexShrink: 0,
        background: wa ? "#25D366" : marca.acento,
        display: "grid",
        placeItems: "center",
      }}
    >
      {wa ? (
        <svg width={30} height={30} viewBox="0 0 24 24">
          <path d={WA_GLIFO} fill="#FFFFFF" />
        </svg>
      ) : (
        <span style={{ fontSize: 24, fontWeight: 800, color: textoSobre(marca.acento, marca.tinta) }}>{(app ?? marca.nombre).charAt(0)}</span>
      )}
    </div>
  );
};

/** Pantalla de bloqueo: las notificaciones nuevas entran arriba y empujan a las viejas. */
export const Telefono: React.FC<{
  marca: Marca;
  lineas: Notificacion[];
  hora?: string;
  fecha?: string;
  lado?: "izq" | "der";
}> = ({ marca, lineas, hora = "23:48", fecha = "lunes, 16 de noviembre", lado = "der" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = spring({ frame, fps, config: { damping: 20, stiffness: 80 } });
  const llegadas = llegadasNotifF(lineas.length);
  // El sistema "habla": curva fija, sin resorte. Un solo progreso mueve la que entra y empuja la pila.
  const prog = llegadas.map((t) => interpolate(frame - t, [0, 12], [0, 1], { ...clamp, easing: CURVA.entra }));
  const SLOT = 118;
  const giro = lado === "der" ? -1 : 1;
  const flota = Math.sin(frame / 40) * 6;
  const papel = contraste(marca.acento, "#FFFFFF") >= 4.5 ? marca.acento : marca.tinta;
  return (
    <div
      style={{
        width: TAM.telefono.w,
        height: TAM.telefono.h,
        borderRadius: TAM.telefono.radio,
        padding: 14,
        background: "#1B1C20",
        boxShadow: "0 60px 110px rgba(10,12,20,0.28), 0 12px 30px rgba(10,12,20,0.18), inset 0 0 0 2px #34353B",
        transform: `perspective(2400px) translateY(${(1 - entra) * 300 + flota}px) rotateY(${giro * 12 * entra}deg) rotateX(${4 * entra}deg) rotateZ(${(1 - entra) * 8 + giro * 3 * entra}deg)`,
        opacity: Math.min(1, entra * 2),
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: 78,
          overflow: "hidden",
          background: `linear-gradient(180deg, ${mezclar(papel, "#FFFFFF", 0.14)} 0%, ${papel} 50%, ${mezclar(papel, "#000000", 0.3)} 100%)`,
          fontFamily: marca.fuenteTexto,
        }}
      >
        <div style={{ position: "absolute", top: 22, left: "50%", marginLeft: -65, width: 130, height: 38, borderRadius: 20, background: "#000" }} />
        <div style={{ position: "absolute", top: 98, width: "100%", textAlign: "center", fontSize: 28, fontWeight: 500, color: "rgba(255,255,255,0.86)" }}>
          {fecha}
        </div>
        <div
          style={{
            position: "absolute",
            top: 128,
            width: "100%",
            textAlign: "center",
            fontSize: 168,
            fontWeight: 600,
            letterSpacing: -5,
            color: "#FFFFFF",
            lineHeight: 1,
          }}
        >
          {hora}
        </div>
        {lineas.map((l, i) => {
          const p = prog[i] ?? 0;
          const q = Math.min(1, Math.max(0, p));
          const empuje = prog.slice(i + 1).reduce((s, v) => s + Math.min(1.06, v), 0);
          return (
            <div
              key={`${l.titulo}-${i}`}
              style={{
                position: "absolute",
                left: 16,
                right: 16,
                top: 350 + empuje * SLOT - (1 - p) * 60,
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
                padding: "18px 20px",
                borderRadius: 28,
                background: "rgba(246,246,248,0.9)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                opacity: Math.min(1, q * 1.7),
                transform: `scale(${0.94 + 0.06 * q})`,
                transformOrigin: "50% 0%",
                filter: q < 1 ? `blur(${(1 - q) * 5}px)` : undefined,
              }}
            >
              <IconoApp app={l.app} marca={marca} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                  <span style={{ fontSize: 27, fontWeight: 700, color: "#111114", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {l.titulo}
                  </span>
                  <span style={{ fontSize: 21, color: "#7A7A80", flexShrink: 0 }}>{l.hora ?? "ahora"}</span>
                </div>
                {l.detalle ? (
                  <div style={{ fontSize: 24, color: "#3A3A3F", marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {l.detalle}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
        <div style={{ position: "absolute", bottom: 14, left: "50%", marginLeft: -80, width: 160, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.8)" }} />
      </div>
    </div>
  );
};

const WA = {
  oscuro: { fondo: "#0B141A", barra: "#202C33", campo: "#2A3942", entrante: "#202C33", saliente: "#005C4B", texto: "#E9EDEF", suave: "#8696A0" },
  claro: { fondo: "#EFEAE2", barra: "#F0F2F5", campo: "#FFFFFF", entrante: "#FFFFFF", saliente: "#D9FDD3", texto: "#111B21", suave: "#667781" },
} as const;
const WA_VERDE = "#00A884";
const WA_LEIDO = "#53BDEB";

const Tildes: React.FC = () => (
  <svg width={24} height={15} viewBox="0 0 24 15">
    <path d="M1.5 8l3.8 3.8L13 3.2" fill="none" stroke={WA_LEIDO} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.6 11.2l.6.6L16.9 3.2" fill="none" stroke={WA_LEIDO} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Chat de WhatsApp visto desde el teléfono del cliente: él escribe en la barra y el negocio contesta ("escribiendo…" arriba). */
export const Chat: React.FC<{
  marca: Marca;
  mensajes: Mensaje[];
  durF: number;
  oscuro?: boolean;
  contacto?: string;
  hora?: string;
}> = ({ marca, mensajes, durF, oscuro = false, contacto, hora = "23:48" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { apareceF, tipeoDesdeF } = horarioChat(mensajes, durF);
  const entra = spring({ frame, fps, config: { damping: 20, stiffness: 90 } });
  const q = Math.min(1, Math.max(0, entra));
  const col = oscuro ? WA.oscuro : WA.claro;
  const nombre = contacto ?? marca.nombre;
  const avatar = contacto ? "#6B7B86" : marca.acento;

  let tipeo = "";
  let negocioEscribe = false;
  for (let i = 0; i < mensajes.length; i++) {
    const m = mensajes[i];
    const ini = tipeoDesdeF[i] ?? 0;
    const fin = apareceF[i] ?? 0;
    if (!m || frame < ini || frame >= fin) continue;
    if (m.de === "cliente") {
      const n = Math.floor(((frame - ini) / Math.max(1, fin - ini - 6)) * m.texto.length);
      tipeo = m.texto.slice(0, Math.min(m.texto.length, Math.max(0, n)));
    } else {
      negocioEscribe = true;
    }
  }
  const enviado = mensajes.some((m, i) => m.de === "cliente" && frame >= (apareceF[i] ?? 0) && frame < (apareceF[i] ?? 0) + 6);

  return (
    <div
      style={{
        width: TAM.chat.w,
        height: TAM.chat.h,
        borderRadius: TAM.chat.radio,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        background: col.fondo,
        border: oscuro ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
        boxShadow: oscuro ? "0 40px 100px rgba(0,0,0,0.5)" : "0 2px 4px rgba(0,0,0,0.06), 0 30px 60px rgba(20,22,30,0.14)",
        fontFamily: marca.fuenteTexto,
        opacity: Math.min(1, q * 1.5),
        transform: `translateY(${(1 - entra) * 60 + Math.sin(frame / 50) * 4}px) scale(${0.95 + 0.05 * q})`,
        filter: q < 1 ? `blur(${(1 - q) * 8}px)` : undefined,
      }}
    >
      <div style={{ height: 104, flexShrink: 0, display: "flex", alignItems: "center", gap: 18, padding: "0 28px", background: col.barra }}>
        <svg width={20} height={34} viewBox="0 0 12 20">
          <path d="M10 2L2 10l8 8" fill="none" stroke={col.texto} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div
          style={{
            width: 62,
            height: 62,
            borderRadius: "50%",
            background: avatar,
            color: textoSobre(avatar, marca.tinta),
            display: "grid",
            placeItems: "center",
            fontSize: 30,
            fontWeight: 700,
          }}
        >
          {nombre.charAt(0)}
        </div>
        <div>
          <div style={{ fontSize: 32, fontWeight: 600, color: col.texto, lineHeight: 1.15 }}>{nombre}</div>
          <div style={{ fontSize: 22, color: negocioEscribe ? WA_VERDE : col.suave }}>{negocioEscribe ? "escribiendo…" : "en línea"}</div>
        </div>
      </div>

      <div style={{ flex: 1, padding: "20px 26px 0", display: "flex", flexDirection: "column", gap: 10 }}>
        <div
          style={{
            alignSelf: "center",
            marginBottom: 6,
            padding: "6px 16px",
            borderRadius: 10,
            background: oscuro ? "#182229" : "#FFFFFF",
            boxShadow: oscuro ? "none" : "0 1px 0.5px rgba(11,20,26,0.13)",
            color: col.suave,
            fontSize: 20,
            fontWeight: 500,
          }}
        >
          Hoy
        </div>
        {mensajes.map((m, i) => {
          const t = apareceF[i] ?? 0;
          if (frame < t) return null;
          const p = interpolate(frame - t, [0, CUADROS.burbuja], [0, 1], { ...clamp, easing: CURVA.entra });
          const pq = p;
          const mio = m.de === "cliente";
          return (
            <div
              key={`m${i}`}
              style={{
                alignSelf: mio ? "flex-end" : "flex-start",
                maxWidth: 620,
                padding: "12px 18px 8px",
                borderRadius: 18,
                borderTopRightRadius: mio ? 4 : 18,
                borderTopLeftRadius: mio ? 18 : 4,
                background: mio ? col.saliente : col.entrante,
                color: col.texto,
                fontSize: 30,
                lineHeight: 1.32,
                boxShadow: "0 1px 0.5px rgba(11,20,26,0.13)",
                opacity: Math.min(1, pq * 1.6),
                transform: `translateY(${(1 - p) * 16}px) scale(${0.9 + 0.1 * pq})`,
                transformOrigin: mio ? "100% 0%" : "0% 0%",
              }}
            >
              {m.texto}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 2,
                  fontSize: 19,
                  color: mio ? conAlfa(col.texto, 0.6) : col.suave,
                }}
              >
                {hora}
                {mio ? <Tildes /> : null}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ height: 104, flexShrink: 0, display: "flex", alignItems: "center", gap: 14, padding: "0 20px", background: col.barra }}>
        <div
          style={{
            flex: 1,
            height: 68,
            borderRadius: 34,
            background: col.campo,
            display: "flex",
            alignItems: "center",
            padding: "0 28px",
            fontSize: 28,
            color: tipeo ? col.texto : col.suave,
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          {tipeo ? (
            <>
              {tipeo}
              <span style={{ opacity: frame % 14 < 8 ? 1 : 0, color: WA_VERDE }}>|</span>
            </>
          ) : (
            "Mensaje"
          )}
        </div>
        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: "50%",
            background: WA_VERDE,
            display: "grid",
            placeItems: "center",
            transform: `scale(${enviado ? 0.86 : 1})`,
          }}
        >
          <svg width={30} height={30} viewBox="0 0 24 24">
            {tipeo ? (
              <path d="M3 20.5l18-8.5L3 3.5 3 10l12 2-12 2z" fill="#FFFFFF" />
            ) : (
              <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 006 6.92V21h2v-3.08A7 7 0 0019 11z" fill="#FFFFFF" />
            )}
          </svg>
        </div>
      </div>
    </div>
  );
};

/** Semana de calendario: los turnos caen uno por uno en su día y hora. */
export const Agenda: React.FC<{
  marca: Marca;
  dias: string[];
  turnos: Turno[];
  mes?: string;
  desdeHora?: number;
  hastaHora?: number;
  oscuro?: boolean;
}> = ({ marca, dias, turnos, mes = "", desdeHora = 9, hastaHora = 18, oscuro = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = spring({ frame, fps, config: { damping: 20, stiffness: 90 } });
  const q = Math.min(1, Math.max(0, entra));
  const W = TAM.agenda.w;
  const H = TAM.agenda.h;
  const CAB = 88;
  const DIAS = 86;
  const GUIA = 76;
  const top0 = CAB + DIAS;
  const filas = Math.max(1, hastaHora - desdeHora);
  const altoFila = (H - top0 - 12) / filas;
  const anchoCol = (W - GUIA) / Math.max(1, dias.length);
  const fondo = oscuro ? "#1A1D23" : "#FFFFFF";
  const tinta = oscuro ? "#F3F4F6" : marca.tinta;
  const suave = oscuro ? "rgba(243,244,246,0.55)" : marca.tintaSuave;
  const linea = oscuro ? "rgba(255,255,255,0.07)" : conAlfa(marca.tinta, 0.08);
  const bloque = mezclar(marca.acento, fondo, oscuro ? 0.45 : 0.7);
  const borde = mezclar(marca.acento, marca.tinta, 0.15);
  const textoBloque = textoSobre(bloque, marca.tinta);
  const llegadas = llegadasTurnosF(turnos.length);

  return (
    <div
      style={{
        position: "relative",
        width: W,
        height: H,
        borderRadius: TAM.agenda.radio,
        overflow: "hidden",
        background: fondo,
        border: oscuro ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.05)",
        boxShadow: oscuro ? "0 40px 100px rgba(0,0,0,0.5)" : "0 2px 4px rgba(0,0,0,0.06), 0 30px 60px rgba(20,22,30,0.12)",
        fontFamily: marca.fuenteTexto,
        opacity: Math.min(1, q * 1.5),
        transform: `translateY(${(1 - entra) * 60 + Math.sin(frame / 50) * 4}px) scale(${0.95 + 0.05 * q})`,
        filter: q < 1 ? `blur(${(1 - q) * 8}px)` : undefined,
      }}
    >
      <div
        style={{
          height: CAB,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 30px 0 34px",
          borderBottom: `1px solid ${linea}`,
        }}
      >
        <span style={{ fontSize: 32, fontWeight: 700, color: tinta }}>{mes}</span>
        <span style={{ fontSize: 20, fontWeight: 600, color: tinta, padding: "8px 20px", borderRadius: 999, border: `1.5px solid ${linea}` }}>Semana</span>
      </div>
      <div style={{ position: "absolute", top: CAB, left: GUIA, right: 0, height: DIAS, display: "flex" }}>
        {dias.map((d) => {
          const [nom, num] = d.split(" ");
          return (
            <div key={d} style={{ width: anchoCol, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
              <span style={{ fontSize: 20, fontWeight: 500, color: suave }}>{nom}</span>
              <span style={{ fontSize: 34, fontWeight: 700, color: tinta, lineHeight: 1.1 }}>{num}</span>
            </div>
          );
        })}
      </div>
      {Array.from({ length: filas }, (_, h) => (
        <React.Fragment key={`h${h}`}>
          <div style={{ position: "absolute", left: GUIA, right: 0, top: top0 + h * altoFila, height: 1, background: linea }} />
          <div style={{ position: "absolute", left: 0, width: GUIA - 14, top: top0 + h * altoFila - 11, textAlign: "right", fontSize: 18, color: suave }}>
            {`${desdeHora + h}:00`}
          </div>
        </React.Fragment>
      ))}
      {dias.map((d, k) => (
        <div key={`v${d}`} style={{ position: "absolute", top: top0, bottom: 0, left: GUIA + k * anchoCol, width: 1, background: linea }} />
      ))}
      {turnos.map((t, i) => {
        const inicio = llegadas[i] ?? 0;
        if (frame < inicio) return null;
        const p = spring({ frame: frame - inicio, fps, config: RESORTE.cae });
        const pq = Math.min(1, Math.max(0, p));
        // El último turno (el que se agendó en el chat) queda solo y lleva un pulso de énfasis al aterrizar.
        const enfasis = i === turnos.length - 1 ? interpolate(frame - inicio, [10, 14, 24], [0, 1, 0], clamp) : 0;
        const [hh, mm] = t.hora.split(":").map(Number);
        const y = top0 + ((hh ?? desdeHora) - desdeHora + (mm ?? 0) / 60) * altoFila + 3;
        return (
          <div
            key={`t${i}`}
            style={{
              position: "absolute",
              left: GUIA + t.dia * anchoCol + 6,
              width: anchoCol - 12,
              top: y,
              height: altoFila * 0.92 - 4,
              borderRadius: 10,
              background: bloque,
              borderLeft: `5px solid ${borde}`,
              padding: "7px 8px 0 10px",
              overflow: "hidden",
              opacity: Math.min(1, pq * 1.6),
              transform: `translateY(${(1 - p) * -16}px) scale(${(1.06 - 0.06 * pq) * (1 + 0.05 * enfasis)})`,
              boxShadow: enfasis > 0 ? `0 0 0 ${3 * enfasis}px ${conAlfa(borde, 0.5)}` : undefined,
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.2, color: textoBloque, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {t.nombre}
            </div>
            <div
              style={{
                fontSize: 16,
                lineHeight: 1.25,
                color: conAlfa(textoBloque, 0.7),
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {t.detalle ? `${t.hora} ${t.detalle}` : t.hora}
            </div>
          </div>
        );
      })}
    </div>
  );
};
