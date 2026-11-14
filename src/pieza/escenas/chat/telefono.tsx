import type { CSSProperties, ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { ease, springAt } from "../../../reserva/motion";
import { ACCENT, FONT, PAPER, SHADOW, SPRING } from "../../../reserva/theme";

export const TEL = { ancho: 580, alto: 1010 } as const;

const CHAT_BG = "#EFEAE2";
const LEIDO = "#53BDEB";
const WA_TEXTO = "#111B21";
const WA_TENUE = "#667781";

export type MensajeTel = { de: "cliente" | "negocio"; texto: string; at: number; escribeDesde?: number };
export type TurnoTel = { etiqueta: string; detalle: string; confirmado: string; at: number; confirmaAt: number };

type TelefonoProps = {
  contacto: string;
  hora: string;
  mensajes: MensajeTel[];
  turno: TurnoTel;
  /** Color del marco del teléfono. Default: blanco (escenas claras). Los spec ads (`src/spec/`) lo usan oscuro. */
  marco?: string;
};

/** `piso`: opacidad del primer frame, para que no quede un hueco al reemplazar a "escribiendo…". */
const entrada = (frame: number, at: number, origen: string, piso = 0): CSSProperties => {
  const s = springAt(frame, at, SPRING.pop);
  const t = ease(frame, [at, at + 8]);
  return {
    opacity: piso + (1 - piso) * t,
    transform: `translateY(${(1 - t) * 18}px) scale(${0.62 + 0.38 * s})`,
    transformOrigin: origen,
    filter: t < 1 ? `blur(${(1 - t) * 6}px)` : undefined,
  };
};

export const DobleTilde = ({ color, size = 30 }: { color: string; size?: number }) => (
  <svg width={size} height={size * 0.62} viewBox="0 0 32 20" style={{ display: "block" }}>
    <path d="M2 10.5 L7.5 16 L18 4" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12.5 15.5 L13 16 L24.5 4" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Burbuja = ({ de, at, children, pie }: { de: MensajeTel["de"]; at: number; children: ReactNode; pie?: ReactNode }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const entra = de === "cliente";
  return (
    <div
      style={{
        alignSelf: entra ? "flex-start" : "flex-end",
        maxWidth: 440,
        background: entra ? "#ffffff" : ACCENT.whatsappBubble,
        borderRadius: 24,
        borderTopLeftRadius: entra ? 6 : 24,
        borderTopRightRadius: entra ? 24 : 6,
        padding: pie ? "14px 20px 10px" : "14px 20px 16px",
        boxShadow: "0 1px 1.5px rgba(11,20,26,0.13)",
        fontFamily: FONT.sans,
        fontWeight: 500,
        fontSize: 33,
        lineHeight: 1.26,
        letterSpacing: "-0.012em",
        color: WA_TEXTO,
        ...entrada(frame, at, entra ? "0% 0%" : "100% 0%", 0.45),
      }}
    >
      {children}
      {pie && <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>{pie}</div>}
    </div>
  );
};

const Escribiendo = ({ desde, hasta, de }: { desde: number; hasta: number; de: MensajeTel["de"] }) => {
  const frame = useCurrentFrame();
  if (frame < desde || frame >= hasta) return null;
  const entra = de === "cliente";
  return (
    <div
      style={{
        alignSelf: entra ? "flex-start" : "flex-end",
        background: entra ? "#ffffff" : ACCENT.whatsappBubble,
        borderRadius: 24,
        borderTopLeftRadius: entra ? 6 : 24,
        borderTopRightRadius: entra ? 24 : 6,
        padding: "20px 24px",
        display: "flex",
        gap: 8,
        boxShadow: "0 1px 1.5px rgba(11,20,26,0.13)",
        ...entrada(frame, desde, entra ? "0% 0%" : "100% 0%"),
      }}
    >
      {[0, 1, 2].map((i) => {
        const fase = Math.max(0, Math.sin((frame - desde) / 3 - i * 0.9));
        return (
          <div
            key={i}
            style={{
              width: 12,
              height: 12,
              borderRadius: 99,
              background: "#8696A0",
              opacity: 0.45 + 0.55 * fase,
              transform: `translateY(${-fase * 5}px)`,
            }}
          />
        );
      })}
    </div>
  );
};

const TarjetaTurno = ({ turno }: { turno: TurnoTel }) => {
  const frame = useCurrentFrame();
  if (frame < turno.at) return null;
  const conf = springAt(frame, turno.confirmaAt, SPRING.pop);
  const confT = ease(frame, [turno.confirmaAt, turno.confirmaAt + 6]);
  const leido = ease(frame, [turno.confirmaAt, turno.confirmaAt + 5]);
  return (
    <div
      style={{
        alignSelf: "flex-end",
        width: 430,
        background: ACCENT.whatsappBubble,
        borderRadius: 24,
        borderTopRightRadius: 6,
        padding: 10,
        boxShadow: "0 1px 1.5px rgba(11,20,26,0.13)",
        ...entrada(frame, turno.at, "100% 0%"),
      }}
    >
      <div
        style={{
          position: "relative",
          background: "#ffffff",
          borderRadius: 18,
          padding: "20px 22px 22px 30px",
          overflow: "hidden",
          boxShadow: `inset 0 0 0 ${2 * confT}px ${ACCENT.green}`,
        }}
      >
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 8, background: ACCENT.whatsapp }} />
        <div
          style={{
            fontFamily: FONT.sans,
            fontWeight: 700,
            fontSize: 30,
            letterSpacing: "0.02em",
            color: ACCENT.greenDark,
          }}
        >
          {turno.etiqueta}
        </div>
        <div
          style={{
            fontFamily: FONT.sans,
            fontWeight: 700,
            fontSize: 44,
            letterSpacing: "-0.03em",
            color: WA_TEXTO,
            marginTop: 6,
          }}
        >
          {turno.detalle}
        </div>
        {frame >= turno.confirmaAt && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              marginTop: 14,
              padding: "8px 18px 8px 12px",
              borderRadius: 99,
              background: ACCENT.green,
              color: "#ffffff",
              fontFamily: FONT.sans,
              fontWeight: 700,
              fontSize: 30,
              letterSpacing: "-0.01em",
              opacity: confT,
              transform: `scale(${0.5 + 0.5 * conf})`,
              transformOrigin: "0% 50%",
              boxShadow: "0 6px 16px rgba(21,128,61,0.28)",
            }}
          >
            <svg width={30} height={30} viewBox="0 0 24 24">
              <path d="M5 12.5 L10 17.5 L19.5 7" fill="none" stroke="#fff" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {turno.confirmado}
          </div>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 8px 2px", position: "relative", height: 26 }}>
        <div style={{ position: "absolute", right: 8, top: 8, opacity: 1 - leido }}>
          <DobleTilde color={WA_TENUE} />
        </div>
        <div style={{ position: "absolute", right: 8, top: 8, opacity: leido }}>
          <DobleTilde color={LEIDO} />
        </div>
      </div>
    </div>
  );
};

export default function Telefono({ contacto, hora, mensajes, turno, marco = PAPER.card }: TelefonoProps) {
  const frame = useCurrentFrame();
  const clienteEscribe = mensajes.some(
    (m) => m.de === "cliente" && m.escribeDesde !== undefined && frame >= m.escribeDesde && frame < m.at,
  );

  return (
    <div
      style={{
        width: TEL.ancho,
        height: TEL.alto,
        borderRadius: 64,
        background: marco,
        boxShadow: SHADOW.lifted,
        padding: 12,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 52,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          background: CHAT_BG,
          border: "1px solid rgba(0,0,0,0.06)",
          boxSizing: "border-box",
        }}
      >
        <div style={{ background: "#ffffff", padding: "18px 34px 0", boxShadow: "0 1px 0 rgba(0,0,0,0.06)" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontFamily: FONT.sans,
              fontWeight: 700,
              fontSize: 30,
              color: WA_TEXTO,
            }}
          >
            <span>{hora}</span>
            <div style={{ width: 120, height: 34, borderRadius: 99, background: PAPER.ink }} />
            <div style={{ width: 44, height: 22, borderRadius: 6, border: `2.5px solid ${WA_TEXTO}`, padding: 3, boxSizing: "border-box" }}>
              <div style={{ width: "72%", height: "100%", borderRadius: 2, background: WA_TEXTO }} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "20px 0 20px" }}>
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: 99,
                background: "linear-gradient(160deg, #F4B18A 0%, #E07A5F 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: FONT.sans,
                fontWeight: 700,
                fontSize: 36,
                color: "#ffffff",
                flexShrink: 0,
              }}
            >
              {contacto.slice(0, 1)}
            </div>
            <div>
              <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 38, color: WA_TEXTO, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                {contacto}
              </div>
              <div
                style={{
                  fontFamily: FONT.sans,
                  fontWeight: 500,
                  fontSize: 30,
                  lineHeight: 1.2,
                  color: clienteEscribe ? ACCENT.greenDark : WA_TENUE,
                }}
              >
                {clienteEscribe ? "escribiendo…" : "en línea"}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            padding: "26px 22px",
            backgroundImage: "radial-gradient(rgba(84,72,50,0.10) 1.6px, transparent 1.8px)",
            backgroundSize: "30px 30px",
          }}
        >
          {mensajes.map((m, i) => (
            <div key={i} style={{ display: "contents" }}>
              {m.escribeDesde !== undefined && <Escribiendo desde={m.escribeDesde} hasta={m.at} de={m.de} />}
              <Burbuja
                de={m.de}
                at={m.at}
                pie={m.de === "negocio" ? <DobleTilde color={frame >= turno.confirmaAt ? LEIDO : WA_TENUE} /> : undefined}
              >
                {m.texto}
              </Burbuja>
            </div>
          ))}
          <TarjetaTurno turno={turno} />
        </div>

        <div style={{ padding: "12px 18px 22px", background: CHAT_BG }}>
          <div
            style={{
              height: 76,
              borderRadius: 99,
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              padding: "0 30px",
              fontFamily: FONT.sans,
              fontWeight: 500,
              fontSize: 30,
              color: "#8696A0",
              boxShadow: "0 1px 1px rgba(11,20,26,0.08)",
            }}
          >
            Mensaje
          </div>
        </div>
      </div>
    </div>
  );
}
