import type { FC } from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile } from "remotion";
import Cifra from "./cifra";
import Cita from "./cita";
import Fichas, { type FichaNeon } from "./fichas";
import { ajustar, conCaja, estiloTipo, FINA, type FuenteFina, PESADA, type PresetNeon, SOMBRA_TEXTO, useAnchos } from "./tema";
import TextoNeon from "./texto-neon";
import TitularNeon from "./titular";

/**
 * Previews de la familia neón sobre un cuadro real (estructura-nexora, el mismo que usan los previews de escenas), para
 * ver el glow sobre la piel. TODO EL TEXTO DE ACÁ ES DE EJEMPLO: en una pieza va literal de la transcripción.
 */
const VIDEO = "piezas/estructura-nexora/video.mp4";
const CUADRO = 750;
/**
 * El encuadre que le da la cámara de la pieza (CAMARA en pieza-composition.tsx) a ese cuadro: en cara.json los ojos están
 * en (486, 719) y la cara mide 241 px → escala 0.26 × 1080 / 241 = 1.165 y los ojos al 30 % del alto. Sin esto la cara
 * queda más baja que en una pieza real y los overlays parecen pisarla.
 */
const ENCUADRE = "translate(-27px, -261px) scale(1.165)";

const Fondo = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <AbsoluteFill style={{ transform: ENCUADRE, transformOrigin: "0 0" }}>
      <OffthreadVideo src={staticFile(VIDEO)} trimBefore={CUADRO} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </AbsoluteFill>
  </AbsoluteFill>
);

const Ejemplo = ({ nota }: { nota: string }) => (
  <div
    style={{
      position: "absolute",
      left: 24,
      top: 24,
      fontFamily: "monospace",
      fontSize: 24,
      color: "#ffffff",
      background: "rgba(0,0,0,0.6)",
      padding: "6px 12px",
      borderRadius: 8,
    }}
  >
    {`EJEMPLO · ${nota}`}
  </div>
);

const DURACION_TITULAR = 75;

export function TitularNeonPreview() {
  return (
    <AbsoluteFill>
      <Fondo />
      <TitularNeon fina="así se automatiza un consultorio" pesada="con IA" duracion={DURACION_TITULAR} />
      <Ejemplo nota="titular-neon · naranja · fina light" />
    </AbsoluteFill>
  );
}

const MUESTRAS: { preset: PresetNeon; fina: FuenteFina }[] = [
  { preset: "naranja", fina: "light" },
  { preset: "violeta", fina: "thin" },
  { preset: "azul", fina: "serif" },
  { preset: "alerta", fina: "light" },
  { preset: "plata", fina: "light" },
];

/** Los cinco presets y las tres finas, uno debajo del otro, para compararlos sobre la piel y la pared. */
export function PresetsNeonPreview() {
  const anchos = useAnchos(MUESTRAS.map((m) => ({ texto: m.preset, tipo: PESADA })));
  if (!anchos) return null;
  return (
    <AbsoluteFill>
      <Fondo />
      {MUESTRAS.map((m, i) => (
        <div
          key={m.preset}
          style={{ position: "absolute", left: 0, right: 0, top: 330 + i * 265, transform: "translateY(-50%)", display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          <div style={{ ...estiloTipo(FINA[m.fina], m.fina === "serif" ? 60 : 46), color: "#ffffff", textShadow: SOMBRA_TEXTO, marginBottom: 10 }}>
            {conCaja(FINA[m.fina], `fina ${m.fina}`)}
          </div>
          <TextoNeon texto={m.preset} tamano={Math.min(130, ajustar(anchos[i], 900, 130))} preset={m.preset} />
        </div>
      ))}
      <Ejemplo nota="presets" />
    </AbsoluteFill>
  );
}

const FLUJOS: FichaNeon[] = [
  { titulo: "Agenda", imagen: "recursos/icono-015.png", chips: ["agenda el turno", "confirma"], en: 12 },
  { titulo: "Cancelación", marca: "whatsapp", chips: ["libera el turno", "avisa"], en: 50 },
  { titulo: "Urgencia", chips: ["deriva a la doctora"], en: 88 },
];
const DURACION_FICHAS = 150;

export function FichasNeonPreview() {
  return (
    <AbsoluteFill>
      <Fondo />
      <Fichas titulo="flujos del consultorio" fichas={FLUJOS} duracion={DURACION_FICHAS} />
      <Ejemplo nota="fichas · lista" />
    </AbsoluteFill>
  );
}

const RUBROS: FichaNeon[] = [
  { titulo: "Consultorio", imagen: "recursos/icono-015.png", chips: ["agenda turnos", "confirma", "recordatorios"], en: 10 },
  { titulo: "Inmobiliaria", chips: ["filtra consultas", "agenda visitas"], en: 40 },
  { titulo: "Restaurante", chips: ["toma reservas", "responde el menú"], en: 70 },
  { titulo: "Logística", chips: ["estado del envío", "reclamos"], en: 100 },
  { titulo: "Estética", chips: ["agenda", "recordatorios", "reprograma"], en: 130 },
  { titulo: "E-commerce", chips: ["stock", "seguimiento", "cambios"], en: 160 },
];
const GRILLA = 195;
const DURACION_GRILLA = 270;

export function FichasGrillaNeonPreview() {
  return (
    <AbsoluteFill>
      <Fondo />
      <Fichas titulo="un agente por rubro" fichas={RUBROS} grilla={GRILLA} preset="violeta" duracion={DURACION_GRILLA} />
      <Ejemplo nota="fichas · 6 rubros → grilla (violeta)" />
    </AbsoluteFill>
  );
}

const TRAMO_CIFRA = 70;

export function CifraNeonPreview() {
  return (
    <AbsoluteFill>
      <Fondo />
      <Sequence durationInFrames={TRAMO_CIFRA} name="casi 300">
        <Cifra arriba="casi" valor="300" etiqueta="etiqueta de ejemplo" duracion={TRAMO_CIFRA} />
      </Sequence>
      <Sequence from={TRAMO_CIFRA} durationInFrames={TRAMO_CIFRA} name="+34.000 plata">
        <Cifra valor="+34.000" etiqueta="etiqueta de ejemplo" preset="plata" duracion={TRAMO_CIFRA} />
      </Sequence>
      <Ejemplo nota="cifra · naranja y plata" />
    </AbsoluteFill>
  );
}

const DURACION_CITA = 120;

export function CitaNeonPreview() {
  return (
    <AbsoluteFill>
      <Fondo />
      <Cita
        texto="Esta es una cita de ejemplo: en la pieza va la frase literal de la transcripción."
        autor="autor de ejemplo"
        duracion={DURACION_CITA}
      />
      <Ejemplo nota="cita · naranja" />
    </AbsoluteFill>
  );
}

export const PREVIEWS_NEON: { id: string; component: FC; durationInFrames: number }[] = [
  { id: "neon-titular", component: TitularNeonPreview, durationInFrames: DURACION_TITULAR },
  { id: "neon-presets", component: PresetsNeonPreview, durationInFrames: 30 },
  { id: "neon-fichas", component: FichasNeonPreview, durationInFrames: DURACION_FICHAS },
  { id: "neon-fichas-grilla", component: FichasGrillaNeonPreview, durationInFrames: DURACION_GRILLA },
  { id: "neon-cifra", component: CifraNeonPreview, durationInFrames: 2 * TRAMO_CIFRA },
  { id: "neon-cita", component: CitaNeonPreview, durationInFrames: DURACION_CITA },
];
