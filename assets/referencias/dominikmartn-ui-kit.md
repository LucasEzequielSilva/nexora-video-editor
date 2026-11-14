# @dominikmartn (X): "UI kit en movimiento" — 2026-11-10

Post "fable 5.2 can actually design." (32 mil vistas, 956 likes). Video de 24 s, 960x720, en bucle. Lucas: "examiná mis
apps … y mostramos un UI kit en movimiento que quede bien".

## Qué es

- **Una grilla bento con unos 30 componentes de una sola app** (una app para dividir gastos): calendario, toggles,
  montos con +/−, chips, radios, buscador que tipea, nota de voz con onda, anillo 2/4, timer 47:10, estrellas, slider,
  acordeón y botón de éxito.
- **Un solo sistema visual:** fondo gris claro, pozos grises redondeados con la tarjeta blanca adentro, un acento verde
  lima → verde, negro para los botones primarios y alguna celda oscura que da contraste.
- **Movimiento:**
  - El bucle sale todo junto (0.4–1.2 s).
  - Las celdas reaparecen en cascada diagonal de arriba-izquierda a abajo-derecha: primero el pozo y después el
    contenido (1.4–2.6 s).
  - Después **cada componente hace su microinteracción por su cuenta y a destiempo**: siempre se está moviendo algo
    (cambia un monto, se prende un toggle, se mueve la selección del calendario, aparece un tooltip, la celda de
    apariencia pasa a oscuro).

## Cómo se aplicó: `src/motion-ui/ui-kit/` (composición `ui-kit-bldrs`, 1080x1350, 22.6 s)

- **Un acto de 5 s por producto, con el mismo esqueleto** de 13 celdas en 4x6 (`grilla.tsx`, `ubicar`). El esqueleto
  se da vuelta en espejo en los actos pares. El color de la app nueva entra en barrido diagonal; no se hace fundido
  porque el cruce claro ↔ oscuro pasa por un gris sucio.
- **Orden de los actos:**
  1. Elevate (oscuro, #FF4E00).
  2. PropMatch (claro, SF Pro, gradiente azul → coral).
  3. Futhub (oscuro, #FF4C00).
  4. bldrs: Builders Club + content-engine.
  5. Cierre: "Diseñado y construido por bldrs." y "Tu app, en 30 días.".

  PropMatch va en el medio para separar los dos naranjas.
- **Piezas genéricas en `piezas.tsx`:** Toggle, Chip, Anillo, Calendario, Burbuja, Tipeo, Estado, Segmentado,
  Slider, Check y Botón. Cada app solo pone datos y tema.
- **Datos de cada app** (sacados de sus repos el 2026-11-10):
  - **PropMatch sin "% de match":** la app lo sacó porque era un número inventado. Se usan las razones del match.
  - **Elevate:** alumnos con nombres inventados, porque los del panel son personas reales.
  - **Builders Club:** sin ranking, chat ni testimonios, porque no hay datos reales.
  - **Futhub:** mezcla la captura publicada (partidos e invitaciones) con el código actual (XP, racha, ranking,
    drills).
- **Sonido:** música musica-076 pareja, un whoosh suave en cada cambio de app, clicks y pops bajos (0.1–0.18) en algunas
  microinteracciones y un remate en el cierre. Master −14 LUFS y limitador a 192 kHz (TP −2.0).
- **Salida:** `out/ui-kit/ui-kit-bldrs-v1-final.mp4`.
