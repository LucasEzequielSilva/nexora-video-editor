import { Audio, Sequence, staticFile } from "remotion";

export const SFX_FILES = {
  "whoosh-soft": "reserva/sfx/whoosh-soft.wav",
  "whoosh-short": "reserva/sfx/whoosh-short.mp3",
  "whoosh-big": "reserva/sfx/whoosh-big.wav",
  "swoosh-tiny": "reserva/sfx/swoosh-tiny.wav",
  click: "reserva/sfx/click.wav",
  key: "reserva/sfx/key.wav",
  "double-click": "reserva/sfx/double-click.wav",
  pop: "reserva/sfx/pop.wav",
  counter: "reserva/sfx/counter.wav",
  riser: "reserva/sfx/riser.mp3",
  impact: "reserva/sfx/impact.mp3",
  /** Boom - Earth Core Ripper (PACKS/Cine SFX) con delay/reverb: golpe grave sobre el negro que cierra el hook. */
  "boom-negro": "reserva/sfx/boom-negro.wav",
  // Paleta v2 por tipo de evento, audible en celular (out/verif/sfx-paleta-v2.py: capas alineadas por su golpe, fundidos,
  // true peak -3 dBTP; % de energía > 200 Hz en out/verif/sfx-paleta-v2.json). Una familia por tipo, 2-3 variantes.
  /** Transición (serie VS_Short Whoosh, la misma de whoosh-short): entrada/salida de escena y corte a b-roll. */
  "escena-entra": "reserva/sfx/escena-entra.wav",
  "escena-sale": "reserva/sfx/escena-sale.wav",
  "corte-broll": "reserva/sfx/corte-broll.wav",
  "corte-broll-b": "reserva/sfx/corte-broll-b.wav",
  /** Zoom: Riser 1 que sube y se corta en seco al aterrizar el zoom (el golpe es el final); zoom-out es la misma subida al revés. */
  "zoom-in": "reserva/sfx/zoom-in.wav",
  "zoom-in-corto": "reserva/sfx/zoom-in-corto.wav",
  "zoom-out": "reserva/sfx/zoom-out.wav",
  /** Zoom punch (golpe rápido de cámara): Loud Whip. */
  "zoom-punch": "reserva/sfx/zoom-punch.wav",
  /** Aparición con pop (íconos, burbujas de chat): variantes de pop. */
  "pop-b": "reserva/sfx/pop-b.wav",
  burbuja: "reserva/sfx/burbuja.wav",
  /** Entrada de tarjeta/notificación/ítem de UI: serie Swoosh 01 (03 / 04 / 05). */
  tarjeta: "reserva/sfx/tarjeta.wav",
  "tarjeta-b": "reserva/sfx/tarjeta-b.wav",
  "tarjeta-c": "reserva/sfx/tarjeta-c.wav",
  /** Tap seco de UI (SFX2 Mechanical Keyboard Click 17). */
  tap: "reserva/sfx/tap.wav",
  /** Tipeo: variantes de key (Mechanical Keyboard Click 10 / 15). */
  "key-b": "reserva/sfx/key-b.wav",
  "key-soft": "reserva/sfx/key-soft.wav",
  /** Confirmación: variante de double-click (SFX2 Lighter Double Click 01). */
  "check-b": "reserva/sfx/check-b.wav",
  /** Trazo del tachado: marcador sobre papel (trazo corto que remata a mitad de la línea roja). */
  tachado: "reserva/sfx/tachado.wav",
  "tachado-b": "reserva/sfx/tachado-b.wav",
  /** Trazo de la primera pasada (Swoosh 01 - 06). */
  trazo: "reserva/sfx/trazo.wav",
  /** Remate de una idea: transitorio agudo + golpe grave saturado (sus armónicos se oyen en celular). */
  remate: "reserva/sfx/remate.wav",
  "remate-b": "reserva/sfx/remate-b.wav",
  /** Cierre del CTA: check-b + Pop up + sub corto. */
  "cta-cierre": "reserva/sfx/cta-cierre.wav",
  /** Primera pasada, casi todo sub (en celular no se oyen): solo para las previews editoriales. */
  "whoosh-cine": "reserva/sfx/whoosh-cine.wav",
  "golpe-grave": "reserva/sfx/golpe-grave.wav",
  "golpe-seco": "reserva/sfx/golpe-seco.wav",
} as const;

export type SfxName = keyof typeof SFX_FILES;

/**
 * Segundo donde cada SFX tiene su golpe perceptible. <Sfx at> alinea ese golpe con el frame `at`.
 * whoosh-soft: pico 0.70s | whoosh-short: 0.54s | whoosh-big: 1.09s | riser: 3.94s | pop: 0.20s | impact: 0.11s
 * Paleta v2: impulsos = ataque (-6 dB del máximo), whooshes = pico, zoom-in = final (corte), zoom-out/tachado = arranque.
 */
export const SFX_HIT_SECONDS: Record<SfxName, number> = {
  "whoosh-soft": 0.7,
  "whoosh-short": 0.54,
  "whoosh-big": 1.09,
  "swoosh-tiny": 0.05,
  click: 0.01,
  key: 0.035,
  "double-click": 0.1,
  pop: 0.2,
  counter: 0.02,
  riser: 3.94,
  impact: 0.11,
  "boom-negro": 0.02,
  "escena-entra": 0.506,
  "escena-sale": 0.51,
  "corte-broll": 0.511,
  "corte-broll-b": 0.497,
  "zoom-in": 1.2,
  "zoom-in-corto": 0.5,
  "zoom-out": 0,
  "zoom-punch": 0.119,
  "pop-b": 0.035,
  burbuja: 0.047,
  tarjeta: 0.07,
  "tarjeta-b": 0.067,
  "tarjeta-c": 0.058,
  tap: 0.01,
  "key-b": 0.015,
  "key-soft": 0.02,
  "check-b": 0.015,
  tachado: 0,
  "tachado-b": 0,
  trazo: 0.055,
  remate: 0.124,
  "remate-b": 0.122,
  "cta-cierre": 0.025,
  "whoosh-cine": 0.26,
  "golpe-grave": 0.022,
  "golpe-seco": 0.072,
};

type SfxProps = {
  name: SfxName;
  /** Frame (relativo al contenedor) donde debe sonar el golpe del efecto. */
  at: number;
  volume?: number;
  /** Duración máxima en frames (para cortar efectos largos como counter). */
  maxFrames?: number;
  /** Frame (relativo al contenedor) donde el efecto se corta en seco, con 2 frames de fundido para que no haga click. */
  cutAt?: number;
};

const FADE_CORTE = 2;

export default function Sfx({ name, at, volume = 0.3, maxFrames, cutAt }: SfxProps) {
  const lead = Math.round(SFX_HIT_SECONDS[name] * 30);
  // Si el golpe cae antes de que el sonido pueda arrancar, la Sequence empieza en un cuadro negativo en vez de usar
  // trimBefore: con trimBefore Remotion ignora showInTimeline, el SFX aparece en la línea de tiempo con un comienzo
  // negativo y en una ventana angosta su onda mide <= 0 px y Studio se cae ("createImageData: source width is zero").
  const start = at - lead;
  const duracion = cutAt !== undefined ? Math.max(1, cutAt - start) : maxFrames;
  return (
    <Sequence from={start} durationInFrames={duracion} layout="none" name={`sfx:${name}`} showInTimeline={false}>
      <Audio
        src={staticFile(SFX_FILES[name])}
        showInTimeline={false}
        // El `f` del volumen cuenta desde que el audio empieza a sonar (cuadro 0 del contenedor si la Sequence arranca
        // en negativo), no desde el comienzo de la Sequence: se corrige para que el fundido del corte caiga en su lugar.
        volume={
          cutAt === undefined || duracion === undefined
            ? volume
            : (f) => volume * Math.min(1, Math.max(0, (duracion - (f + Math.max(0, -start))) / FADE_CORTE))
        }
      />
    </Sequence>
  );
}
