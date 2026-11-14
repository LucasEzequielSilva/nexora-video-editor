# Diseño: que parezca del negocio, no una plantilla

## Paleta
- Sacar **un** color de marca del logo o del feed y usarlo plano como `acento` (botones, punto del logo, "+" de la carta).
- `fondo` cálido o neutro claro, `tinta` casi negra (no `#000`), `suave` para texto secundario.
- Nada de degradés de dos tonos, sombras de colores ni brillos.

## Contraste (se mide, no se mira)
- Texto sobre el acento (`textoAcento`): ≥ 4,5:1. Acento claro (amarillo, verde lima) = texto oscuro, no blanco.
- Acento usado **como texto** sobre el fondo claro (la etiqueta del rubro): si no llega a 4,5:1, definir `colorTextoAcento` con una versión más oscura del mismo tono. Medido con la prueba de Don Rolo: blanco sobre `#D93A12` = 4,60 (pasa justo), pero `#D93A12` como texto sobre `#F6F1E9` = 4,09 (**no pasa**): se usó `colorTextoAcento: "#B42E0C"` = 5,60. Un amarillo `#FFC527` sobre fondo claro = 1,43 (nunca sirve como texto; ahí `textoAcento` es la tinta oscura: 10,89). Calcular siempre la razón de luminancia antes de entregar, no a ojo.
- Texto secundario (`suave`) sobre el fondo ≥ 4,5:1.

## Tipografía
- Por defecto, el stack del sistema (Helvetica Neue / Arial): carga instantánea.
- Si el negocio tiene tipografía de marca, sumar **una** familia con `<link>` de Google Fonts y ponerla en `--fuente`. Máximo dos pesos.
- Título en peso 900 con `letter-spacing` negativo, cuerpo en 400/500. Una sola jerarquía clara por pantalla.

## Fotos y logo
- **Foto real o ninguna.** Con `imagenHero` el hero oscurece la foto un 50 % para que el texto se lea; sin foto el hero es tipográfico y queda limpio.
- Fotos de producto: cuadradas, ≤ 150 KB, con `alt` (el template lo pone con el nombre del producto).
- Logo: SVG si existe. Sin logo, el template escribe el nombre con un punto de color; no inventar un isotipo.
- Favicon: el del logo si hay; si no, queda vacío (el template trae `data:,` para no tirar 404).

## Chequeo "¿se ve plantilla o IA?"
Si alguna es sí, se arregla:
- [ ] ¿Hay un degradé violeta/azul, un brillo o partículas?
- [ ] ¿Usa emojis o íconos genéricos como decoración?
- [ ] ¿Tres tarjetas iguales con ícono + título + párrafo?
- [ ] ¿Frases que valen para cualquier negocio ("calidad y pasión")?
- [ ] ¿Una foto de stock que no es de este negocio?
- [ ] ¿Más de un color de acento?
- [ ] ¿Sombras gigantes o bordes redondeados distintos en cada cosa?

## Responsive
Mobile primero (el 90 % entra desde Instagram): una columna, botón "+" de 36 px mínimo, barra del pedido fija abajo con el total, hoja de pedido que sube desde abajo. En escritorio la carta pasa a dos columnas y la hoja se centra.
