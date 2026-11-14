# Referencia de estilo — @matias_costas (reels de agentes IA)

Pedido de Lucas (2026-09-27): "que aprenda de esa edición: el chico se duplica, quita el fondo, pone íconos por detrás de su cuerpo y queda facha" + "Tactic Sans Black, más una delgada para contrastar, más el gradient".

- **Videos (24 de sus últimos 30):** `C:\Users\Lucas\Videos\Referencias\matias_costas\mc-NN-<código>.mp4` (720x1280). No se copian al repo.
- **Cuadros:** `C:\Users\Lucas\Documents\.vault\life\03 - Resources\Referencias\Matias Costas\frames\mc-NN-*.jpg`. Una hoja por video: 1 cuadro cada 1,5 s, 8 por fila.
- **Transcripts y métricas:** la misma carpeta del vault (`transcripts/`, `meta.json`).
- **Guía de guion:** `02 - Areas/Claude/brain/estilo-matias-costas.md` en el vault.

## Gramática visual

| # | Recurso | Cómo se ve | Dónde verlo | En este editor |
|---|---|---|---|---|
| 1 | **Titular gancho** | 2-3 líneas en el tercio medio-bajo, los primeros ~2 s. Línea 1 blanca; la línea clave en violeta con degradé y glow (rosa/rojo para alertas, verde para plata). Grotesca pesada y ancha | mc-01, 08, 20, 21, 25 | Fuente `tactic-black` (ya existe). Falta el degradé + glow en la línea clave |
| 2 | **Contraste fino** | Lucas pide una fina al lado de la pesada | — | Tactic Sans Thn (pack) o Instrument Serif itálica (ya en uso en `acentos`) |
| 3 | **Subtítulos** | 1-2 palabras por vez, serif itálica fina blanca con sombra suave, centrados abajo del medio | todos | Parecido a `acentos` con Instrument Serif |
| 4 | **Palabra clave en grande** | Cada tanto una palabra o cifra reemplaza al subtítulo en la pesada violeta ("AL DÍA", horarios) o verde neón para plata | mc-20, 21, 26 | Falta: variante "palabra fuerte" |
| 5 | **Precio neón** | Cifra gigante verde con glow fuerte, entra con pop de escala | reel "cuánto cobro" (Descargas) | Falta |
| 6 | **Grilla de íconos que se arma** | Fondo violeta con degradé radial y trama; un ícono neón (rosa/violeta, esquinas redondeadas) entra por cada cosa que nombra | reel "cuánto cobro", mc-21, 27 | `IconoLayer` pone íconos; falta la grilla acumulativa |
| 7 | **Tarjeta con borde que brilla** | Captura o flujo de n8n en tarjeta redondeada, borde naranja o violeta luminoso, sobre el plano o sobre fondo violeta | mc-01, 21, 25, 27 | `escenas/capturas`, `marco`: sumar el borde luminoso |
| 8 | **Pantalla dividida** | Arriba el diagrama en tarjeta; abajo él en una ventana redondeada con glow, todo sobre violeta | mc-01 | Falta |
| 9 | **Logos en círculo** | Logo de la herramienta en círculo blanco, sobre el pecho o centrado en violeta | mc-08, 20, 25, 27 | `IconoLayer` |
| 10 | **Lista que aparece señalando** | Él señala con el dedo y a su lado entran de a uno logo + nombre; título de categoría violeta arriba. Es su video más visto (396 mil) | mc-17 | Falta: lista sincronizada con las palabras |
| 11 | **Recorte + cosas detrás del cuerpo** | Fondo quitado; texto, íconos o logos **entre el fondo y la persona**; a veces duotono violeta | mc-27 (silueta con texto detrás) | `scripts/silueta.py` ya saca `persona.webm` con alfa. Capas: video → íconos/texto → `persona.webm` |
| 12 | **Clon** | Él duplicado en el cuadro | (lo vio Lucas; no quedó en los cuadros muestreados) | Segunda instancia de `persona.webm` desplazada/escalada, con otra opacidad o tinte |
| 13 | **Flash de luz** | Transición con destello blanco o naranja sobreexpuesto (light leak) entre bloques | mc-21, 26, 27 | Falta |
| 14 | **B-roll de stock** | Planos cinematográficos oscuros y cálidos, viñeta fuerte y trama de puntos; los subtítulos siguen encima | mc-08, 21, 25, 26 | `BrollLayer` + viñeta y trama |
| 15 | **Bordes desenfocados** | El plano de él con desenfoque radial en los bordes (look soñado) | mc-01, 20, 21 | `editorial/blur-x.tsx` es lo más cercano |

## Ritmo

- Corte o inserto cada 1-3 s; el plano de él nunca queda solo más de ~4 s.
- El titular vive ~2 s y después entran los subtítulos.
- Los insertos tapan la mitad o la pantalla entera, pero el audio sigue siendo la voz: no hay música que tape.

## Lo que falta construir (orden sugerido)

1. Degradé + glow en la línea clave del titular.
2. Precio neón.
3. Grilla de íconos acumulativa sobre fondo violeta.
4. Capas detrás del cuerpo con `persona.webm` (+ clon).
5. Flash de luz.
6. Lista sincronizada que aparece señalando.
