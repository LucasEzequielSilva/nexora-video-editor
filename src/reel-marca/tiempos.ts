import { CIERRE_S, FPS, type Beat, type Brief, type Mensaje, type TipoSonido, type Transicion } from "./tema";

/** Segundos de n tiempos de música a `bpm`. Con duraciones en compases, cada corte cae en el pulso. */
export const compas = (tiempos: number, bpm: number): number => (tiempos * 60) / bpm;

/**
 * Cuadros que dura cada transición; todas terminan justo en el corte (el pulso). Energía media: 15–18 cuadros.
 * Usar una primaria en la mayoría de los cortes (`fundido` o `empuje`) y `zoom`/`expande` como acentos con motivo.
 */
export const DUR_TRANSICION: Record<Transicion, number> = { fundido: 15, corte: 0, empuje: 15, zoom: 16, expande: 18 };
export const transicionDe = (b: Beat): Transicion => b.transicion ?? "fundido";

/**
 * El contenido nuevo arranca este número de cuadros ANTES del corte, mientras sale el viejo:
 * así las dos escenas se mueven a la vez y no queda un bache vacío en el corte. El primer texto cae justo en el pulso.
 */
export const ADELANTO_F = 4;
export const adelantoDe = (b: Beat, i: number): number => (i > 0 && transicionDe(b) !== "corte" ? ADELANTO_F : 0);

/** Límites de cada beat en cuadros. Se redondea el acumulado, no cada beat: el error no se arrastra. */
export const limitesF = (b: Brief): number[] => {
  const out = [0];
  let acc = 0;
  for (const x of b.beats) {
    acc += x.durS;
    out.push(Math.round(acc * FPS));
  }
  return out;
};

export const duracionAnimF = (b: Brief): number => limitesF(b)[b.beats.length] ?? 0;
export const inicioBeatF = (b: Brief, i: number): number => limitesF(b)[i] ?? 0;
export const duracionReelF = (b: Brief): number => duracionAnimF(b) + Math.round(CIERRE_S * FPS);

export const llegadasNotifF = (n: number): number[] => Array.from({ length: n }, (_, i) => 18 + i * 24);

/**
 * Turnos que caen en la agenda con una cadencia que acelera (14, 11, 9, 7, 6, 5… cuadros) y un freno antes del último,
 * que queda solo y se lee como el remate.
 */
export const llegadasTurnosF = (n: number): number[] => {
  const out: number[] = [];
  let t = 16;
  for (let i = 0; i < n; i++) {
    out.push(t);
    const esPenultimo = i === n - 2;
    t += esPenultimo ? 18 : Math.max(5, Math.round(14 * 0.8 ** i));
  }
  return out;
};

export const horarioChat = (
  mensajes: Mensaje[],
  durF: number,
): { apareceF: number[]; tipeoDesdeF: number[] } => {
  const gaps = mensajes.map((m) =>
    m.de === "cliente" ? Math.min(40, Math.max(16, Math.round(m.texto.length * 1.3))) + 12 : 30,
  );
  const total = 14 + gaps.reduce((s, g) => s + g, 0);
  const k = Math.min(1, (durF - 34) / total);
  let t = Math.round(14 * k);
  const apareceF: number[] = [];
  const tipeoDesdeF: number[] = [];
  mensajes.forEach((_, i) => {
    tipeoDesdeF.push(t);
    t += Math.round((gaps[i] ?? 30) * k);
    apareceF.push(t);
  });
  return { apareceF, tipeoDesdeF };
};

/** Cuadro (del contenido) en que aterriza el contador, golpea la palabra del héroe y hace clic el cursor. */
export const NUMERO_ATERRIZA_F = 50;
export const HEROE_GOLPE_F = 9;
export const CLIC_F = 66;

export type EventoSonido = { tipo: TipoSonido; atF: number };

/** Momentos de la animación que llevan sonido: los usa el kit para sincronizar los SFX solos. */
export const eventosSonido = (b: Brief): EventoSonido[] => {
  const lim = limitesF(b);
  const ev: EventoSonido[] = [];
  b.beats.forEach((beat, i) => {
    const ini = lim[i] ?? 0;
    const dur = (lim[i + 1] ?? ini) - ini;
    const c = ini - adelantoDe(beat, i);
    // El beat logo trae su propio sonido en el mismo cuadro: sumarle el whoosh duplica el golpe (pico +4 dB sobre el resto).
    if (i > 0 && transicionDe(beat) !== "corte" && beat.tipo !== "logo") ev.push({ tipo: "transicion", atF: ini });
    if (beat.tipo === "telefono") llegadasNotifF(beat.lineas.length).forEach((t) => ev.push({ tipo: "notificacion", atF: c + t }));
    if (beat.tipo === "chat") horarioChat(beat.mensajes, dur).apareceF.forEach((t) => ev.push({ tipo: "burbuja", atF: c + t }));
    if (beat.tipo === "agenda") llegadasTurnosF(beat.turnos.length).forEach((t) => ev.push({ tipo: "turno", atF: c + t }));
    if (beat.tipo === "numero") ev.push({ tipo: "numero", atF: c + NUMERO_ATERRIZA_F });
    if (beat.tipo === "heroe") ev.push({ tipo: "remate", atF: c + HEROE_GOLPE_F });
    if (beat.tipo === "logo") {
      ev.push({ tipo: "logo", atF: c + 4 });
      if (beat.boton) ev.push({ tipo: "clic", atF: c + CLIC_F });
    }
  });
  return ev;
};
