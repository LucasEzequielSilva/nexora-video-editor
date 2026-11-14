import type { Brief } from "../tema";
import { compas } from "../tiempos";

// Duraciones en tiempos de música (117,5 BPM): así cada corte cae en el pulso de la cama.
const t = (tiempos: number): number => compas(tiempos, 117.5);

// Marca ficticia de ejemplo. Paleta sacada del tema (la agenda de papel y el resaltador), no de un default:
// gris frío, tinta y un amarillo que no se lee como texto sobre claro, así que la palabra clave va con marcador.
export const ejemploTurnix: Brief = {
  slug: "ejemplo-turnix",
  marca: {
    nombre: "Turnix",
    tagline: "Tu agenda, por WhatsApp.",
    acento: "#FFC527",
    fondo: "#F2F3F5",
    tinta: "#16181D",
    tintaSuave: "#5F6672",
    fuenteTitulo: `"Satoshi", "Helvetica Neue", Arial, sans-serif`,
    fuenteTexto: `"Satoshi", "Helvetica Neue", Arial, sans-serif`,
  },
  beats: [
    { tipo: "frase", texto: "¿Otra vez anotando turnos {a mano}?", durS: t(6) },
    {
      tipo: "telefono",
      transicion: "empuje",
      texto: "Tus pacientes escriben [a cualquier hora].",
      hora: "06:03",
      fecha: "lunes, 16 de noviembre",
      lineas: [
        { app: "WhatsApp", titulo: "Lucía Gómez", detalle: "¿Tienen turno para mañana?", hora: "23:48" },
        { app: "WhatsApp", titulo: "Martín Ferreyra", detalle: "Quiero reprogramar mi turno", hora: "02:15" },
        { app: "WhatsApp", titulo: "Sofía Benítez", detalle: "¿Cuánto sale un blanqueamiento?", hora: "06:03" },
      ],
      durS: t(8),
    },
    {
      tipo: "chat",
      transicion: "zoom",
      texto: "Turnix los [agenda solo].",
      contacto: "Odontología Ríos",
      hora: "23:48",
      mensajes: [
        { de: "cliente", texto: "Hola, ¿tienen turno para mañana?" },
        { de: "marca", texto: "¡Hola! Mañana tengo 10:30 o 16:00. ¿Cuál preferís?" },
        { de: "cliente", texto: "16:00" },
        { de: "marca", texto: "Listo, te esperamos mañana a las 16:00." },
      ],
      durS: t(12),
      fondo: "oscuro",
    },
    { tipo: "heroe", palabra: "solito.", pie: "Sin que toques el celular.", durS: t(6), fondo: "acento", transicion: "expande" },
    {
      tipo: "agenda",
      transicion: "empuje",
      texto: "Y todo cae en tu [agenda].",
      mes: "Noviembre 2026",
      dias: ["Lun 16", "Mar 17", "Mié 18", "Jue 19", "Vie 20"],
      turnos: [
        { dia: 0, hora: "09:00", nombre: "Martín Ferreyra", detalle: "Control" },
        { dia: 0, hora: "10:30", nombre: "Sofía Benítez", detalle: "Blanqueamiento" },
        { dia: 1, hora: "11:00", nombre: "Diego Álvarez", detalle: "Limpieza" },
        { dia: 2, hora: "09:30", nombre: "Carla Méndez", detalle: "Ortodoncia" },
        { dia: 3, hora: "15:00", nombre: "Paula Sosa", detalle: "Control" },
        { dia: 4, hora: "12:00", nombre: "Juan Pérez", detalle: "Consulta" },
        { dia: 0, hora: "16:00", nombre: "Lucía Gómez", detalle: "Consulta" },
      ],
      durS: t(10),
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
  ],
  // Audio opcional. Rutas dentro de public/. 'auto' sincroniza cada sonido con su evento (burbuja de chat,
  // notificación, turno que cae en la agenda, clic...). 'golpeS' = segundo del archivo donde cae el golpe.
  //
  // audio: {
  //   musica: { archivo: "musica.m4a", volumen: 0.5, desdeS: 8.31 },
  //   auto: {
  //     transicion: { archivo: "sfx/whoosh.wav", volumen: 0.45, golpeS: 0.5 },
  //     burbuja: { archivo: "sfx/burbuja.wav", volumen: 0.45 },
  //     turno: { archivo: "sfx/tap.wav", volumen: 0.3 },
  //   },
  // },
};
