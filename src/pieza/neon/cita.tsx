import { AbsoluteFill, useCurrentFrame } from "remotion";
import Sfx from "../../reserva/components/sfx";
import { ease, lerp } from "../../reserva/motion";
import { FONT } from "../../reserva/theme";
import { anchoCentrado, CITA, COMILLAS, estiloTipo, PRESETS, type PresetNeon, rgb, rgba, useAnchos } from "./tema";
import TextoNeon from "./texto-neon";

export type CitaProps = {
  /** La cita literal (sin comillas: las pone la tarjeta). */
  texto: string;
  /** Quién lo dijo (opcional), va abajo con raya. */
  autor?: string;
  preset?: PresetNeon;
  /** Centro vertical de la tarjeta en % del alto. Default 62: debajo de la cara. */
  centroY?: number;
  duracion: number;
  gananciaSfx?: number;
};

const RELLENO = { x: 52, arriba: 80, abajo: 50 } as const;
const BORDE = 4;
const RADIO = 38;
/** Cuerpo de la cita: el más grande (entre estos) que la deja en `RENGLONES_MAX` renglones. */
const CUERPO = { max: 72, min: 46, paso: 2 } as const;
const RENGLONES_MAX = 5;
const INTERLINEA = 1.12;
/** El corte de renglón por palabras desperdicia ancho: se mide contra un poco menos del ancho real. */
const APROVECHA = 0.88;
/** La comilla de Instrument Serif ocupa la franja alta del renglón (≈ 12–45 %): así queda montada sobre el borde de arriba. */
const COMILLA = 250;
const SALE = 8;

/**
 * Tarjeta de cita (gramática #7 de la referencia: tarjeta redondeada con borde que brilla): la frase en Instrument Serif
 * itálica grande, blanca sobre fondo oscuro, con la comilla de apertura en neón y un brillo que recorre el borde.
 */
export default function Cita({ texto, autor, preset = "naranja", centroY = 62, duracion, gananciaSfx = 1 }: CitaProps) {
  const frame = useCurrentFrame();
  const p = PRESETS[preset];
  const anchos = useAnchos([{ texto, tipo: CITA }]);
  if (!anchos) return null;

  const ancho = anchoCentrado((centroY / 100) * 1920 + 260);
  const util = (ancho - 2 * RELLENO.x) * APROVECHA;
  let cuerpo: number = CUERPO.max;
  while (cuerpo > CUERPO.min && Math.ceil((anchos[0] * cuerpo) / util) > RENGLONES_MAX) cuerpo -= CUERPO.paso;

  const entra = ease(frame, [0, 14]);
  const brilla = ease(frame, [6, 22]);
  const textoEntra = ease(frame, [5, 16]);
  const sale = ease(frame, [duracion - SALE, duracion], [1, 0]);
  const visible = Math.min(entra, sale);
  const giro = 40 + frame * 2.4;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 540 - ancho / 2,
          width: ancho,
          top: `${centroY}%`,
          opacity: visible,
          transform: `translateY(calc(-50% + ${(1 - entra) * 60}px)) scale(${lerp(0.94, 1, entra) * lerp(0.97, 1, sale)})`,
          filter: visible < 0.999 ? `blur(${(1 - visible) * 12}px)` : undefined,
        }}
      >
        <div
          style={{
            position: "relative",
            padding: BORDE,
            borderRadius: RADIO,
            background: `conic-gradient(from ${giro}deg, ${rgb(p.base)}, ${rgb(p.tope)} 10%, ${rgb(p.base)} 22%, ${rgba(p.base, 0.45)} 50%, ${rgb(p.base)} 78%, ${rgb(p.base)})`,
            boxShadow: `0 0 ${26 * brilla}px ${rgba(p.brillo, 0.5 * brilla)}, 0 0 ${70 * brilla}px ${rgba(p.brillo, 0.22 * brilla)}, 0 24px 60px rgba(0,0,0,0.45)`,
          }}
        >
          <div
            style={{
              borderRadius: RADIO - BORDE,
              background: "linear-gradient(180deg, rgba(20, 16, 28, 0.94), rgba(10, 8, 16, 0.94))",
              boxShadow: `inset 0 0 ${30 * brilla}px ${rgba(p.brillo, 0.14 * brilla)}`,
              padding: `${RELLENO.arriba}px ${RELLENO.x}px ${RELLENO.abajo}px`,
            }}
          >
            <div
              style={{
                ...estiloTipo(CITA, cuerpo),
                whiteSpace: "normal",
                lineHeight: INTERLINEA,
                textWrap: "pretty",
                color: "#ffffff",
                opacity: textoEntra,
                transform: `translateY(${(1 - textoEntra) * 14}px)`,
              }}
            >
              {texto}
            </div>
            {autor && (
              <div
                style={{
                  marginTop: cuerpo * 0.45,
                  fontFamily: FONT.sans,
                  fontWeight: 700,
                  fontSize: 32,
                  letterSpacing: "0.01em",
                  color: rgb(p.tope),
                  opacity: ease(frame, [10, 20]),
                }}
              >
                — {autor}
              </div>
            )}
          </div>
        </div>
        <TextoNeon
          texto="“"
          tamano={COMILLA}
          preset={preset}
          tipo={COMILLAS}
          encendido={brilla}
          style={{ position: "absolute", left: RELLENO.x - 18, top: -COMILLA * 0.15, opacity: ease(frame, [4, 12]) }}
        />
      </div>
      <Sfx name="tarjeta" at={3} volume={0.09 * gananciaSfx} />
      <Sfx name="pop-b" at={6} volume={0.06 * gananciaSfx} />
    </AbsoluteFill>
  );
}
