// ÚNICO archivo que se edita por negocio. Todo lo que aparece en la web sale de acá.
// Regla: nada inventado. Precios, horarios, dirección y teléfono tienen que venir del negocio (Instagram, carta, cliente).
// Lo que no se sabe se borra de acá: la web oculta la sección en vez de mostrar un relleno.
window.NEGOCIO = {
  nombre: "Nombre del negocio",
  rubro: "Rubro · Ciudad",
  titulo: "Frase corta que dice qué hacen",
  descripcion: "Una o dos líneas, con lo que dice el propio negocio.",

  // "pedidos" = carrito + mensaje armado por WhatsApp · "reservas" = formulario de reserva · "contacto" = solo botón
  modo: "pedidos",
  whatsapp: "5491100000000", // solo dígitos, con código de país
  mensajeContacto: "Hola, quería hacer una consulta.",

  moneda: "$",
  locale: "es-AR",
  zona: "America/Argentina/Buenos_Aires",
  entrega: ["Retiro en el local", "Envío a domicilio"], // solo en modo "pedidos"

  // Colores sacados de la marca real (logo, feed). Un solo acento, plano.
  colores: { acento: "#D93A12", fondo: "#F6F1E9", tinta: "#1F1A17", suave: "#6B625A", superficie: "#FFFFFF" },
  textoAcento: "#FFFFFF", // color del texto sobre el acento (debe pasar contraste 4,5:1)
  logo: "", // ruta a un SVG/PNG real; vacío = se escribe el nombre con un punto de color
  imagenHero: "", // foto real del local o de un producto; vacío = hero tipográfico

  instagram: "", // usuario sin @
  direccion: "",
  mapa: "", // link de Google Maps
  horarios: [
    // dias: 0 = domingo … 6 = sábado. Si cierra es menor que abre, cierra pasada la medianoche.
    // { texto: "Lun a Vie", dias: [1, 2, 3, 4, 5], abre: "12:00", cierra: "23:30" },
  ],

  categorias: [
    // { nombre: "Pizzas", items: [{ nombre: "Muzzarella", desc: "Salsa de tomate, muzzarella, orégano", precio: 12000, foto: "" }] },
  ],
};
