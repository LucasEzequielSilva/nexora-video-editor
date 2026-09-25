import type { CSSProperties } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import Sfx from "../../reserva/components/sfx";
import { ease, lerp, springAt } from "../../reserva/motion";
import { ACCENT, FONT, PAPER, SHADOW, SPRING } from "../../reserva/theme";
import LogoApp from "../marca";
import type { EscenaPreview, EscenaProps } from "./tipos";

/** Cierre: comentario de Instagram que tipea la palabra clave, respuesta de la cuenta y chip de "enviado por privado". */
export type Datos = {
  cuenta: string;
  usuario: string;
  palabra: string;
  respuesta: string;
  /** Texto del chip final (cue `privado`). */
  enviado: string;
  /** Lo que se dice antes de "comentá" (cue `ver`): serif itálica chica + sans bold grande. Sin gancho (el guion
   *  arranca por el verbo, ej. "Escribime ESTRUCTURA y te muestro..."), el titular muestra el verbo desde el principio. */
  gancho?: { serif: string; sans: string };
  /** Verbo del titular, literal del guion. Default "comentá". */
  verbo?: string;
  /** Baja todo el bloque (px). Sin el recorte del que habla abajo (pip "ninguno"), ~300 lo centra en el alto. */
  bajar?: number;
};

export const PREVIEW: EscenaPreview<Datos> = {
  durationInFrames: 125,
  cues: { ver: 17, comentar: 61, palabra: 68, respuesta: 96, privado: 107 },
  datos: {
    cuenta: "nexora",
    usuario: "tu_negocio",
    palabra: "ESTRUCTURA",
    respuesta: "¡Te lo enviamos por privado!",
    enviado: "Enviado por privado",
    gancho: { serif: "si querés ver uno", sans: "funcionando de verdad" },
  },
};

const IG_AZUL = "#0095F6";
const TIPEO = 18;
const CARD1 = { left: 80, top: 650, width: 920 } as const;
const CARD2 = { left: 180, top: 1030, width: 800 } as const;

/** Entrada desplazándose: slide + fundido + leve desenfoque, asentado en `dur` frames. */
const entra = (frame: number, at: number, desde: { x?: number; y?: number; rot?: number }, dur = 16): CSSProperties => {
  const t = ease(frame, [at, at + dur]);
  return {
    opacity: ease(frame, [at, at + dur * 0.6]),
    transform: `translate(${(1 - t) * (desde.x ?? 0)}px, ${(1 - t) * (desde.y ?? 0)}px) rotate(${(1 - t) * (desde.rot ?? 0)}deg)`,
    filter: t < 0.999 ? `blur(${(1 - t) * 10}px)` : undefined,
  };
};

const Caret = ({ visible, height }: { visible: boolean; height: number }) => (
  <span
    style={{
      display: "inline-block",
      width: 5,
      height,
      marginLeft: 6,
      borderRadius: 3,
      background: IG_AZUL,
      opacity: visible ? 1 : 0,
      verticalAlign: "middle",
    }}
  />
);

export default function Cta({ durationInFrames, cues, datos }: EscenaProps<Datos>) {
  const frame = useCurrentFrame();
  const d = durationInFrames;
  const ver = cues.ver ?? Math.round(d * 0.14);
  const comentar = cues.comentar ?? Math.round(d * 0.49);
  const palabra = cues.palabra ?? comentar + 7;
  const respuesta = Math.min(cues.respuesta ?? Math.round(d * 0.77), d - 20);
  const privado = Math.min(cues.privado ?? Math.round(d * 0.86), d - 16);

  const letras = datos.palabra.length;
  const paso = TIPEO / Math.max(1, letras);
  const finTipeo = palabra + TIPEO;
  const publica = Math.min(finTipeo + 3, respuesta - 2);
  const tipeadas = frame < palabra ? 0 : Math.min(letras, Math.floor((frame - palabra) / paso) + 1);
  const publicado = frame >= publica;

  const salidaA = datos.gancho ? ease(frame, [comentar - 10, comentar + 2]) : 1;
  const barrido = ease(frame, [palabra, palabra + 10]);
  const textoB = ease(frame, [palabra + 3, palabra + 13]);

  const flotaGrupo = Math.sin(frame / 30) * 3;
  const flotaTitulo = Math.sin(frame / 36 + 1.2) * 2.5;

  const presion = ease(frame, [publica - 4, publica]) * (1 - ease(frame, [publica, publica + 6]));
  const bump = 1 + 0.018 * Math.sin(ease(frame, [publica, publica + 10]) * Math.PI);
  const publicarOn = ease(frame, [finTipeo - 2, finTipeo + 2]);
  const publicarFuera = ease(frame, [publica + 1, publica + 7]);

  const conector = ease(frame, [respuesta + 2, respuesta + 14]);
  const chipPop = springAt(frame, privado, SPRING.snappy);
  const tilde = ease(frame, [privado + 4, privado + 13]);

  /** Una tecla cada dos letras: ráfaga de tipeo sin volverse un tren de clicks. */
  const teclas = Array.from({ length: Math.ceil(letras / 2) }, (_, k) => k * 2);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", fontFamily: FONT.sans, color: PAPER.ink, transform: `translateY(${datos.bajar ?? 0}px)` }}>
      <Sfx name="tarjeta" at={ver + 6} volume={0.09} />
      {teclas.map((i, k) => (
        <Sfx key={i} name={k % 2 === 0 ? "key" : "key-b"} at={Math.round(palabra + i * paso)} volume={k % 2 === 0 ? 0.16 : 0.35} />
      ))}
      <Sfx name="click" at={publica} volume={0.2} />
      <Sfx name="tarjeta-b" at={respuesta} volume={0.03} />
      <Sfx name="cta-cierre" at={privado} volume={0.038} />

      {/* Titular: primero lo que se dice ("ver uno funcionando de verdad"), después "comentá ESTRUCTURA" */}
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: 220,
          height: 380,
          transform: `translateY(${flotaTitulo}px)`,
        }}
      >
        {datos.gancho && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            opacity: 1 - salidaA,
            transform: `translateY(${-70 * salidaA}px)`,
            filter: salidaA > 0.001 ? `blur(${salidaA * 12}px)` : undefined,
          }}
        >
          <div
            style={{
              fontFamily: FONT.serif,
              fontStyle: "italic",
              fontSize: 74,
              lineHeight: 1.05,
              color: PAPER.inkSoft,
              ...entra(frame, ver, { y: 40 }, 14),
            }}
          >
            {datos.gancho.serif}
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              columnGap: 24,
              maxWidth: 900,
              marginTop: 6,
            }}
          >
            {datos.gancho.sans.split(" ").map((w, i) => (
              <span
                key={i}
                style={{
                  fontWeight: 900,
                  fontSize: 116,
                  lineHeight: 1.02,
                  letterSpacing: "-0.04em",
                  display: "inline-block",
                  ...entra(frame, ver + 4 + i * 3, { y: 50 }, 14),
                }}
              >
                {w}
              </span>
            ))}
          </div>
        </div>
        )}

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontFamily: FONT.serif,
              fontStyle: "italic",
              fontSize: 90,
              lineHeight: 1,
              color: PAPER.inkSoft,
              ...entra(frame, comentar - 3, { y: 50 }, 14),
            }}
          >
            {datos.verbo ?? "comentá"}
          </div>
          <div style={{ position: "relative", marginTop: 22, padding: "10px 26px 14px" }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: PAPER.ink,
                borderRadius: 14,
                transform: `scaleX(${barrido})`,
                transformOrigin: "left center",
                boxShadow: barrido > 0.5 ? "0 18px 40px rgba(0,0,0,0.22)" : undefined,
              }}
            />
            <div
              style={{
                position: "relative",
                fontWeight: 900,
                fontSize: 128,
                lineHeight: 1,
                letterSpacing: "-0.03em",
                color: "#ffffff",
                opacity: textoB,
                transform: `translateY(${(1 - textoB) * 24}px)`,
                filter: textoB < 0.999 ? `blur(${(1 - textoB) * 8}px)` : undefined,
              }}
            >
              {datos.palabra}
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", inset: 0, transform: `translateY(${flotaGrupo}px)` }}>
        {/* Hilo entre el comentario y la respuesta, como en los comentarios de Instagram */}
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
          <path
            d={`M 172 ${CARD2.top - 60} V ${CARD2.top + 52} Q 172 ${CARD2.top + 76} 196 ${CARD2.top + 76}`}
            fill="none"
            stroke="#c4c4bf"
            strokeWidth={4}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - conector}
          />
        </svg>

        {/* Comentario del usuario: se tipea la palabra y se publica */}
        <div
          style={{
            position: "absolute",
            left: CARD1.left,
            top: CARD1.top,
            width: CARD1.width,
            ...entra(frame, Math.max(8, ver - 4), { x: 60, y: 170, rot: 2.5 }, 18),
          }}
        >
          <div
            style={{
              background: PAPER.card,
              borderRadius: 34,
              boxShadow: SHADOW.card,
              transform: `scale(${bump})`,
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "30px 40px" }}>
              <LogoApp marca="instagram" size={64} />
              <span style={{ fontWeight: 700, fontSize: 40, letterSpacing: "-0.02em" }}>Comentarios</span>
              <span style={{ marginLeft: "auto", fontWeight: 500, fontSize: 32, color: PAPER.muted }}>@{datos.cuenta}</span>
            </div>
            <div style={{ height: 1, background: "#ececea" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 24, padding: "32px 40px 36px" }}>
              <div
                style={{
                  width: 104,
                  height: 104,
                  borderRadius: "50%",
                  padding: 4,
                  background: "linear-gradient(45deg, #fdf497, #fd5949 45%, #d6249f 65%, #285AEB)",
                  flexShrink: 0,
                  alignSelf: "flex-start",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    border: "4px solid #fff",
                    background: "linear-gradient(135deg, #efefec, #d6d6d2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: 42,
                    color: PAPER.inkSoft,
                    boxSizing: "border-box",
                  }}
                >
                  {datos.usuario.charAt(0).toUpperCase()}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", fontSize: 34, fontWeight: 700, color: PAPER.inkSoft }}>
                  <span>{datos.usuario}</span>
                  <span style={{ fontWeight: 500, color: PAPER.muted, opacity: ease(frame, [publica, publica + 8]) }}>&nbsp;· ahora</span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 34,
                      color: IG_AZUL,
                      opacity: lerp(0.35, 1, publicarOn) * (1 - publicarFuera),
                      transform: `scale(${1 - 0.08 * presion})`,
                      display: "inline-block",
                    }}
                  >
                    Publicar
                  </span>
                </div>
                <div style={{ height: 70, display: "flex", alignItems: "center", marginTop: 6, whiteSpace: "nowrap" }}>
                  {tipeadas === 0 ? (
                    <>
                      <span style={{ fontSize: 42, fontWeight: 500, color: PAPER.muted }}>Agregá un comentario…</span>
                      <Caret visible={frame >= comentar && Math.floor((frame - comentar) / 8) % 2 === 0} height={48} />
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: 56, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1 }}>
                        {datos.palabra.slice(0, tipeadas)}
                      </span>
                      <Caret visible={!publicado && (tipeadas < letras || Math.floor(frame / 8) % 2 === 0)} height={56} />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: CARD2.left,
            top: CARD2.top,
            width: CARD2.width,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 28,
          }}
        >
          {/* Respuesta de la cuenta */}
          <div
            style={{
              alignSelf: "stretch",
              ...entra(frame, respuesta, { x: 90, y: 40, rot: 1.5 }, 16),
            }}
          >
            <div
              style={{
                background: PAPER.card,
                borderRadius: 30,
                boxShadow: SHADOW.card,
                display: "flex",
                alignItems: "center",
                gap: 24,
                padding: "30px 36px",
              }}
            >
              <div
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: "50%",
                  background: PAPER.ink,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  fontSize: 40,
                  letterSpacing: "-0.04em",
                  flexShrink: 0,
                }}
              >
                {datos.cuenta.charAt(0).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: PAPER.inkSoft }}>
                  {datos.cuenta}
                  <span style={{ fontWeight: 500, color: PAPER.muted }}> · ahora</span>
                </div>
                <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15, marginTop: 4 }}>
                  {datos.respuesta}
                </div>
              </div>
            </div>
          </div>

          {/* Chip final */}
          <div
            style={{
              marginRight: 24,
              ...entra(frame, privado, { x: 70 }, 12),
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "16px 32px 16px 18px",
                borderRadius: 999,
                background: PAPER.ink,
                color: "#fff",
                boxShadow: SHADOW.soft,
                transform: `scale(${lerp(0.82, 1, Math.min(1.05, chipPop))})`,
                transformOrigin: "right center",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: ACCENT.green,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width={30} height={30} viewBox="0 0 24 24">
                  <path
                    d="M5 12.5l4.5 4.5L19 7.5"
                    fill="none"
                    stroke="#fff"
                    strokeWidth={3.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength={1}
                    strokeDasharray={1}
                    strokeDashoffset={1 - tilde}
                  />
                </svg>
              </div>
              <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.01em" }}>{datos.enviado}</span>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}
