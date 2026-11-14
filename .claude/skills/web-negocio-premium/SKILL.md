---
name: web-negocio-premium
description: Arma la web de un negocio local (gastronomía, estética, salud, servicios, comercio) a partir de su Instagram, carta o datos del dueño. Sitio estático sin build, con logo, carta o servicios con precios reales, horarios con "abierto ahora", y pedidos o reservas que llegan armados por WhatsApp. Usar cuando se pida "la web de este negocio", "una página para este Instagram", "carta digital con pedidos por WhatsApp", "web para reservas", o cuando un negocio local no tenga sitio y se quiera dejar algo publicable en una tarde. Funciona en cualquier proyecto o carpeta vacía.
---

# Web de negocio con pedidos por WhatsApp

Una web que el dueño puede publicar hoy: abre rápido en el celular, muestra lo que vende con sus precios reales y le manda el pedido o la reserva **ya armada** por WhatsApp. No hay backend, ni base de datos, ni pasarela de pago.

Hablá en español rioplatense, corto. **Nada inventado**: cada precio, horario, dirección y teléfono sale del negocio. Lo que no se sabe se pregunta o se deja afuera (la web oculta la sección vacía, no pone relleno).

## Qué entrega
Una carpeta con `index.html`, `estilos.css`, `app.js` y `datos.js`. **Solo `datos.js` cambia por negocio**; el resto es el template y no se toca salvo que el negocio pida algo que el template no hace. Se publica en cualquier hosting estático.

## Referencias (leer según el paso)
| Archivo | Qué tiene |
|---|---|
| `references/contenido.md` | de dónde sacar cada dato, datos mínimos, cómo leer una carta en foto, cómo escribir el título |
| `references/diseno.md` | paleta desde el logo, contraste, tipografía, fotos, chequeo "¿se ve plantilla/IA?" |
| `references/whatsapp-y-pedidos.md` | los tres modos, formato del mensaje, qué no hace, horarios y zona |
| `references/checklist.md` | prueba con Playwright, accesibilidad, publicación |

## Proceso
| # | Paso | Cómo | Sale |
|---|---|---|---|
| 1 | Datos | Pedir lo que falte (`contenido.md`): nombre, rubro y ciudad, **WhatsApp**, carta o servicios con precios, horarios, dirección, Instagram, logo y fotos reales si hay. Si el pedido trae solo un Instagram, leerlo (bio, destacadas, carta en fotos) y listar lo que no se pudo confirmar. | Lista de datos + lo que falta |
| 2 | Modo | `pedidos` (carrito → WhatsApp), `reservas` (formulario → WhatsApp) o `contacto` (solo botón). Gastronomía con delivery o retiro = pedidos; restaurante de mesa, peluquería, consultorio = reservas; el resto, contacto. | Modo elegido |
| 3 | Marca | Colores del logo o del feed, un solo acento plano; chequear contraste (`diseno.md`). Sin logo: el nombre con un punto de color. Sin foto real: hero tipográfico. | `colores`, `textoAcento` |
| 4 | Armar | Copiar `template/` a la carpeta de salida y editar **solo `datos.js`**. Poner el `<title>` y el favicon real si hay logo. | Carpeta con la web |
| 5 | Probar | Servir la carpeta (`python -m http.server`) y seguir `checklist.md`: celular 390 px y escritorio 1280 px, flujo de pedido o reserva completo, consola en cero, datos faltantes. | Capturas y mensajes de WhatsApp verificados |
| 6 | Entrega | Decir qué es real, qué falta confirmar (precios leídos de una foto, horarios) y cómo publicar. No decir que "cobra" ni que "confirma stock": no lo hace. | Resumen corto |

## Reglas que no se rompen
- **Nada inventado.** Precio que no está confirmado: `precio: null` (muestra "Consultar") y se avisa. Reseñas, cantidades de clientes, premios y fotos "de ejemplo" no van.
- **Un solo acento, plano.** Sin degradés violeta, brillos, emojis como íconos ni tres tarjetas iguales con ícono. Ver `diseno.md`.
- **Fotos reales o ninguna.** Sin foto, la carta es tipográfica (queda mejor que una foto de stock que no es de ese negocio).
- **El texto del negocio nunca va por `innerHTML`.** El template ya arma todo con nodos; no lo cambies.
- **El pedido es un mensaje, no una venta cerrada.** La web lo dice (“el negocio te confirma por ahí”) y el negocio sigue confirmando disponibilidad y cobro.
- **Tiene que andar con el teléfono de gama baja y 4G**: sin librerías, sin fuentes pesadas, sin build.

## Checklist de salida
- [ ] `datos.js` sin textos de ejemplo ni datos inventados.
- [ ] Probado en 390 px y 1280 px, consola sin errores.
- [ ] Un pedido o una reserva de prueba armó el mensaje correcto (texto, total, nombre, entrega).
- [ ] Contraste del botón principal y del texto chico ≥ 4,5:1.
- [ ] Dicho en la entrega: qué se confirmó con el negocio, qué no, y cómo publicarlo.
