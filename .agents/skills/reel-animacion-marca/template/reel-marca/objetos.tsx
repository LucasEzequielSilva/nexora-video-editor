import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { mezclar } from "./primitivas";
import { horarioChat, llegadasNotifF } from "./tiempos";
import type { Marca, Mensaje, Notificacion } from "./tema";

/** Teléfono con pantalla de bloqueo: las notificaciones nuevas entran arriba y empujan a las viejas. */
export const Telefono: React.FC<{
  marca: Marca;
  lineas: Notificacion[];
  hora?: string;
  fecha?: string;
}> = ({ marca, lineas, hora = "23:48", fecha = "martes, 11 de noviembre" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = spring({ frame, fps, config: { damping: 20, stiffness: 80 } });
  const llegadas = llegadasNotifF(lineas.length);
  const prog = llegadas.map((t) => spring({ frame: frame - t, fps, config: { damping: 17, stiffness: 130 } }));
  const SLOT = 168;
  const flota = Math.sin(frame / 40) * 8;
  return (
    <div
      style={{
        width: 520,
        height: 1120,
        borderRadius: 92,
        padding: 15,
        background: "#0D0D10",
        boxShadow: "0 70px 130px rgba(10,10,30,0.32), 0 14px 36px rgba(10,10,30,0.22), inset 0 0 0 2px #2A2A31",
        transform: `translateY(${(1 - entra) * 320 + flota}px) rotate(${(1 - entra) * 7 + Math.sin(frame / 90) * 0.8}deg)`,
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
          background: `linear-gradient(165deg, ${marca.acento}, ${mezclar(marca.acento, "#000000", 0.5)})`,
          fontFamily: marca.fuenteTexto,
        }}
      >
        <div style={{ position: "absolute", top: 22, left: "50%", marginLeft: -65, width: 130, height: 38, borderRadius: 20, background: "#000" }} />
        <div style={{ position: "absolute", top: 100, width: "100%", textAlign: "center", fontSize: 30, fontWeight: 500, color: "rgba(255,255,255,0.85)" }}>
          {fecha}
        </div>
        <div style={{ position: "absolute", top: 132, width: "100%", textAlign: "center", fontSize: 176, fontWeight: 500, letterSpacing: -6, color: "#fff", lineHeight: 1 }}>
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
                left: 18,
                right: 18,
                top: 372 + empuje * SLOT - (1 - p) * 70,
                padding: "16px 22px 18px",
                borderRadius: 30,
                background: "rgba(255,255,255,0.9)",
                boxShadow: "0 12px 34px rgba(0,0,0,0.2)",
                opacity: Math.min(1, q * 1.7),
                transform: `scale(${0.94 + 0.06 * q})`,
                filter: q < 1 ? `blur(${(1 - q) * 6}px)` : undefined,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: marca.acento,
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 20,
                    fontWeight: 800,
                  }}
                >
                  {(l.app ?? marca.nombre).charAt(0)}
                </div>
                <div style={{ flex: 1, fontSize: 20, fontWeight: 600, letterSpacing: 1.2, textTransform: "uppercase", color: "#6B6B78" }}>
                  {l.app ?? marca.nombre}
                </div>
                <div style={{ fontSize: 22, color: "#8A8A96" }}>{l.hora ?? "ahora"}</div>
              </div>
              <div style={{ fontSize: 31, fontWeight: 700, color: "#14141C" }}>{l.titulo}</div>
              {l.detalle ? (
                <div style={{ fontSize: 26, color: "#4A4A55", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {l.detalle}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Puntos: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", height: 26 }}>
      {[0, 1, 2].map((k) => (
        <div
          key={k}
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: color,
            transform: `translateY(${-7 * Math.abs(Math.sin(frame / 6 - k * 0.9))}px)`,
            opacity: 0.5 + 0.5 * Math.abs(Math.sin(frame / 6 - k * 0.9)),
          }}
        />
      ))}
    </div>
  );
};

/** Ventana de chat: el cliente escribe en la barra, el negocio responde con "escribiendo…". */
export const Chat: React.FC<{
  marca: Marca;
  mensajes: Mensaje[];
  durF: number;
  oscuro?: boolean;
  estado?: string;
  placeholder?: string;
}> = ({ marca, mensajes, durF, oscuro = false, estado = "en línea", placeholder = "Escribí un mensaje" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { apareceF, tipeoDesdeF } = horarioChat(mensajes, durF);
  const entra = spring({ frame, fps, config: { damping: 20, stiffness: 90 } });
  const q = Math.min(1, Math.max(0, entra));
  const a2 = marca.acento2 ?? marca.acento;

  const col = oscuro
    ? { ventana: "#17171D", borde: "rgba(255,255,255,0.08)", cliente: "#2A2A33", txtCliente: "#F5F5F7", input: "#24242C", txtInput: "#F5F5F7", suave: "rgba(245,245,247,0.55)" }
    : { ventana: "#FFFFFF", borde: "rgba(20,20,40,0.08)", cliente: "#EEF0F5", txtCliente: "#14141C", input: "#F1F2F6", txtInput: "#14141C", suave: "#8A8AA0" };

  let escribiendoCliente = "";
  mensajes.forEach((m, i) => {
    const ini = tipeoDesdeF[i] ?? 0;
    const fin = apareceF[i] ?? 0;
    if (m.de === "cliente" && frame >= ini && frame < fin) {
      const n = Math.floor(((frame - ini) / Math.max(1, fin - ini - 6)) * m.texto.length);
      escribiendoCliente = m.texto.slice(0, Math.min(m.texto.length, Math.max(0, n)));
    }
  });
  const escribiendo = escribiendoCliente.length > 0;
  const enviado = apareceF.some((t) => frame >= t && frame < t + 6);

  return (
    <div
      style={{
        position: "relative",
        width: 900,
        height: 830,
        borderRadius: 48,
        background: col.ventana,
        border: `1px solid ${col.borde}`,
        boxShadow: oscuro ? "0 50px 120px rgba(0,0,0,0.55)" : "0 50px 120px rgba(20,20,60,0.2), 0 8px 24px rgba(20,20,60,0.08)",
        overflow: "hidden",
        fontFamily: marca.fuenteTexto,
        opacity: Math.min(1, q * 1.5),
        transform: `translateY(${(1 - entra) * 70 + Math.sin(frame / 50) * 5}px) scale(${(0.95 + 0.05 * q) * 1.1})`,
        filter: q < 1 ? `blur(${(1 - q) * 12}px)` : undefined,
      }}
    >
      <div style={{ height: 108, display: "flex", alignItems: "center", gap: 20, padding: "0 34px", borderBottom: `1px solid ${col.borde}` }}>
        <div
          style={{
            width: 66,
            height: 66,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${marca.acento}, ${a2})`,
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontFamily: marca.fuenteTitulo,
            fontWeight: 800,
            fontSize: 36,
          }}
        >
          {marca.inicial ?? marca.nombre.charAt(0)}
        </div>
        <div>
          <div style={{ fontSize: 36, fontWeight: 700, color: col.txtCliente, lineHeight: 1.1 }}>{marca.nombre}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 24, color: col.suave }}>
            <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#22C55E" }} />
            {estado}
          </div>
        </div>
      </div>

      <div style={{ padding: "30px 30px 0", display: "flex", flexDirection: "column", gap: 18 }}>
        {mensajes.map((m, i) => {
          const t = apareceF[i] ?? 0;
          const ini = tipeoDesdeF[i] ?? 0;
          const marcaSide = m.de === "marca";
          if (marcaSide && frame >= ini && frame < t) {
            return (
              <div key={`d${i}`} style={{ alignSelf: "flex-end", padding: "26px 34px", borderRadius: 34, borderBottomRightRadius: 10, background: col.cliente }}>
                <Puntos color={col.suave} />
              </div>
            );
          }
          if (frame < t) return null;
          const p = spring({ frame: frame - t, fps, config: { damping: 14, stiffness: 170 } });
          const pq = Math.min(1, Math.max(0, p));
          return (
            <div
              key={`m${i}`}
              style={{
                alignSelf: marcaSide ? "flex-end" : "flex-start",
                maxWidth: 610,
                padding: "20px 30px",
                borderRadius: 34,
                borderBottomRightRadius: marcaSide ? 10 : 34,
                borderBottomLeftRadius: marcaSide ? 34 : 10,
                background: marcaSide ? `linear-gradient(135deg, ${marca.acento}, ${a2})` : col.cliente,
                color: marcaSide ? "#fff" : col.txtCliente,
                fontSize: 32,
                lineHeight: 1.3,
                fontWeight: 500,
                opacity: Math.min(1, pq * 1.6),
                transform: `translateY(${(1 - p) * 26}px) scale(${0.86 + 0.14 * pq})`,
                transformOrigin: marcaSide ? "100% 100%" : "0% 100%",
              }}
            >
              {m.texto}
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          left: 26,
          right: 26,
          bottom: 26,
          height: 86,
          borderRadius: 43,
          background: col.input,
          display: "flex",
          alignItems: "center",
          padding: "0 14px 0 34px",
          gap: 16,
        }}
      >
        <div style={{ flex: 1, fontSize: 32, color: escribiendo ? col.txtInput : col.suave, whiteSpace: "nowrap", overflow: "hidden" }}>
          {escribiendo ? (
            <>
              {escribiendoCliente}
              <span style={{ opacity: frame % 14 < 8 ? 1 : 0 }}>|</span>
            </>
          ) : (
            placeholder
          )}
        </div>
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${marca.acento}, ${a2})`,
            display: "grid",
            placeItems: "center",
            transform: `scale(${enviado ? 0.86 : 1})`,
          }}
        >
          <svg width={28} height={28} viewBox="0 0 24 24">
            <path d="M4 12l16-8-6 16-3-7z" fill="#fff" />
          </svg>
        </div>
      </div>
    </div>
  );
};
