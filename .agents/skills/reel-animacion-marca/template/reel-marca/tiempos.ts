import { CIERRE_S, FPS, type Brief, type Mensaje, type TipoSonido } from "./tema";

/** Segundos de n tiempos de música a `bpm`. Con duraciones en compases, cada corte cae en el pulso. */
export const compas = (tiempos: number, bpm: number): number => (tiempos * 60) / bpm;

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

export const NUMERO_ATERRIZA_F = 50;
export const CLIC_F = 66;

export type EventoSonido = { tipo: TipoSonido; atF: number };

/** Momentos de la animación que llevan sonido: los usa el kit para sincronizar los SFX solos. */
export const eventosSonido = (b: Brief): EventoSonido[] => {
  const lim = limitesF(b);
  const ev: EventoSonido[] = [];
  b.beats.forEach((beat, i) => {
    const ini = lim[i] ?? 0;
    const dur = (lim[i + 1] ?? ini) - ini;
    if (i > 0) ev.push({ tipo: "transicion", atF: ini });
    if (beat.tipo === "telefono") llegadasNotifF(beat.lineas.length).forEach((t) => ev.push({ tipo: "notificacion", atF: ini + t }));
    if (beat.tipo === "chat") horarioChat(beat.mensajes, dur).apareceF.forEach((t) => ev.push({ tipo: "burbuja", atF: ini + t }));
    if (beat.tipo === "numero") ev.push({ tipo: "numero", atF: ini + NUMERO_ATERRIZA_F });
    if (beat.tipo === "heroe") ev.push({ tipo: "remate", atF: ini + 8 });
    if (beat.tipo === "logo") {
      ev.push({ tipo: "logo", atF: ini + 4 });
      if (beat.boton) ev.push({ tipo: "clic", atF: ini + CLIC_F });
    }
  });
  return ev;
};
