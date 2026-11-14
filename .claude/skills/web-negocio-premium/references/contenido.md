# Contenido: de dónde sale cada dato

## Datos mínimos
Sin estos no se publica (se piden, no se inventan):
1. **Nombre** del negocio y qué es (rubro + barrio o ciudad).
2. **WhatsApp** con código de país, solo dígitos (`5491155550123`). Es lo único que hace funcionar la web: confirmarlo siempre.
3. **Qué vende y a cuánto**: carta o lista de servicios con precios.
4. **Cómo se atiende**: retiro, envío, reserva de mesa o turno.

Útiles pero opcionales (si faltan, la sección no aparece): horarios, dirección y link al mapa, Instagram, logo, fotos.

## De dónde sacarlos
| Dato | Fuente | Ojo |
|---|---|---|
| Rubro, barrio, frase | Bio de Instagram | La bio suele tener emojis y hashtags: quedarse con el texto |
| Dirección, horarios | Bio, destacadas, "Cómo llegar" | Los horarios cambian: marcarlos "a confirmar" si son de un posteo viejo |
| Carta y precios | Destacada "Carta" o "Menú", posteos fijados | Suelen ser imágenes: leerlas con la vista y **confirmar los precios con el dueño**, porque se desactualizan |
| Colores y logo | Foto de perfil y feed | Un color de marca; el logo real como SVG o PNG |
| WhatsApp | Botón de contacto o bio | Verificar que sea de ventas, no personal |

## Carta en foto
1. Transcribir producto, descripción y precio tal cual, sin "mejorar" el texto.
2. Un precio ilegible o dudoso = `precio: null` y avisarlo en la entrega.
3. Agrupar en categorías como están en la carta original (no reordenar por gusto).
4. Productos "a elección" o con variantes: un ítem por variante con su precio, o `desde: true` si solo se sabe el mínimo.
5. Nunca redondear ni "actualizar" precios por inflación: es el dueño quien los cambia.

## Textos
- **`titulo`**: lo que hacen, concreto, en una línea ("Pizza al molde, hecha al momento."). Sin superlativos vacíos ("la mejor", "únicos") ni "bienvenidos".
- **`descripcion`**: una o dos líneas con **hechos del negocio** (masa de 48 horas, horno a leña, envíos en el barrio). Si el negocio no dijo un diferencial, no se inventa uno: la descripción queda corta.
- **Descripciones de producto**: lo que dice la carta. Sin adjetivos nuevos.
- Voseo y tono del negocio; si el negocio habla formal, formal.
- Cifras ("48 horas", "desde 1998") solo si el negocio las dijo.

## Qué NO va
Reseñas o testimonios inventados, "+1000 clientes felices", premios, certificaciones, fotos de stock presentadas como del local, precios "de ejemplo".
