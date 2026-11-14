import type { Brief } from "../tema";

// Marca ficticia de ejemplo (cafetería de especialidad). Todo el contenido es genérico y verdadero del rubro: no hay cifras inventadas.
// Pensado para GUARDAR: una guía que el lector va a querer tener a mano.
export const ejemploBruma: Brief = {
  slug: "ejemplo-bruma",
  marca: {
    nombre: "Bruma",
    usuario: "bruma.cafe",
    acento: "#E4572E",
    textoAcento: "#1B1410",
    fondo: "#F4EFE6",
    tinta: "#1B1410",
    tintaSuave: "#625850",
    fuente: `"Helvetica Neue", Helvetica, Arial, sans-serif`,
  },
  laminas: [
    { tipo: "portada", titulo: "Cómo pedir un café de especialidad [sin sentirte perdido]", bajada: "Guía de 6 pasos para la próxima vez que mires el menú." },
    { tipo: "punto", titulo: "Empezá por [cómo lo tomás]", texto: "Con leche, solo o frío. Eso define casi todo lo demás." },
    { tipo: "punto", titulo: "Pedí [filtrado] si querés probar el grano", texto: "Es más suave y deja sentir las notas. Con leche se pierden." },
    { tipo: "versus", antes: { etiqueta: "Si decís", texto: "“Un café, normal”" }, despues: { etiqueta: "Mejor decí", texto: "“Un flat white, poca azúcar”" } },
    { tipo: "lista", titulo: "Preguntale al barista [estas 3 cosas]", items: ["¿De dónde es el grano de hoy?", "¿Qué tostado tiene?", "¿Cuál me recomendás para leche?"] },
    { tipo: "cifra", valor: "1 de 3", leyenda: "es lo que podés cambiar para [probar algo nuevo]: grano, método o leche.", fondo: "oscuro" },
    { tipo: "cierre", titulo: "Guardá esto para tu [próximo café]", accion: "Guardalo", pie: "Y mandáselo a quien siempre pide “un café, normal”.", fondo: "acento" },
  ],
  animado: { segPorLamina: 3.2, transicionS: 0.5 },
};
