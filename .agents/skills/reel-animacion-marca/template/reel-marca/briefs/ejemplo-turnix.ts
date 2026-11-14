import type { Brief } from "../tema";
import { compas } from "../tiempos";

// Duraciones en tiempos de música (117,5 BPM): así cada corte cae en el pulso de la cama.
const t = (tiempos: number): number => compas(tiempos, 117.5);

export const ejemploTurnix: Brief = {
  slug: "ejemplo-turnix",
  marca: {
    nombre: "Turnix",
    tagline: "Tu agenda, por WhatsApp.",
    acento: "#7C3AED",
    acento2: "#C026D3",
    fondo: "#F8F6FC",
    tinta: "#17141F",
    tintaSuave: "#6B6580",
    fuenteTitulo: `"Satoshi", "Helvetica Neue", Arial, sans-serif`,
    fuenteTexto: `"Satoshi", "Helvetica Neue", Arial, sans-serif`,
    fuenteAcento: `"Instrument Serif", Georgia, serif`,
  },
  beats: [
    { tipo: "frase", texto: "¿Otra vez [anotando turnos] {a mano}?", durS: t(6) },
    {
      tipo: "telefono",
      texto: "Tus pacientes escriben {a cualquier hora}.",
      hora: "06:03",
      lineas: [
        { app: "WhatsApp", titulo: "Lucía", detalle: "¿Tienen turno para mañana?", hora: "23:48" },
        { app: "WhatsApp", titulo: "Martín", detalle: "Quiero reprogramar mi turno", hora: "02:15" },
        { app: "WhatsApp", titulo: "Sofía", detalle: "¿Cuánto sale un blanqueamiento?", hora: "06:03" },
      ],
      durS: t(8),
    },
    {
      tipo: "chat",
      texto: "Turnix los [agenda solo].",
      mensajes: [
        { de: "cliente", texto: "Hola, ¿tienen turno para mañana?" },
        { de: "marca", texto: "¡Hola! Mañana tengo 10:30 o 16:00. ¿Cuál preferís?" },
        { de: "cliente", texto: "16:00" },
        { de: "marca", texto: "Listo, te esperamos mañana a las 16:00." },
      ],
      durS: t(12),
      fondo: "oscuro",
    },
    { tipo: "heroe", palabra: "solito.", pie: "Y todo cae en tu agenda.", durS: t(6), fondo: "acento" },
    { tipo: "numero", valor: 24, sufijo: " h", etiqueta: "Turnix atiende", leyenda: "aunque tu consultorio esté cerrado", durS: t(6) },
    {
      tipo: "lista",
      titulo: "Todo en un solo lugar",
      items: ["Agenda automática", "Recordatorios", "Cambios y cancelaciones"],
      durS: t(8),
      fondo: "oscuro",
    },
    { tipo: "logo", boton: "Probalo gratis", durS: t(8) },
  ],
  etiqueta: [
    [{ t: "Hecho por" }, { t: "Opus 5.5", pill: true }],
    [{ t: "+" }, { t: "Mi skill", pill: true }],
  ],
  cta: { palabra: "SKILL", pie: "y te lo paso" },
  fuentes: [
    { familia: "Satoshi", archivo: "reserva/fonts/Satoshi-500.woff2", peso: 500 },
    { familia: "Satoshi", archivo: "reserva/fonts/Satoshi-700.woff2", peso: 700 },
    { familia: "Satoshi", archivo: "reserva/fonts/Satoshi-900.woff2", peso: 900 },
    { familia: "Instrument Serif", archivo: "reserva/fonts/InstrumentSerif-italic.woff2", peso: 400, estilo: "italic" },
  ],
  // Audio opcional. Rutas dentro de public/. 'auto' sincroniza cada sonido con su evento (burbuja de chat,
  // notificación, clic...). 'golpeS' = segundo del archivo donde cae el golpe; el kit lo alinea con el evento.
  //
  // audio: {
  //   musica: { archivo: "musica.m4a", volumen: 0.5, desdeS: 8.31 },
  //   auto: {
  //     transicion: { archivo: "sfx/whoosh.wav", volumen: 0.3, golpeS: 0.5 },
  //     burbuja: { archivo: "sfx/burbuja.wav", volumen: 0.5 },
  //   },
  // },
};
