# Catálogo de fuentes

Muestra de cada familia: [fuentes-muestra.png](fuentes-muestra.png) (renderizada desde los archivos, no de memoria).
Las del pack están en `PACKS/PRESETS DAVINCI RESOLVE (Clase 6)/WINDOWS/WINDOWS/FUENTES/` (ids `fuente-001`…`066` en
`assets/biblioteca.json`). Las que ya carga Remotion están copiadas en `public/reserva/fonts/`.

## Estado según Lucas

| Familia | Estado | Dónde se usa | Clave en `props.json` |
|---|---|---|---|
| **Satoshi** Black 900 | ✅ **aprobada** para subtítulos ("satoshi es buena, trackeamela") | subtítulos, títulos de escena | `subtitulos.fuente: "satoshi"` (default) |
| **Instrument Serif** itálica | ✅ en uso | palabras clave acentuadas en el subtítulo, títulos editoriales de escena | automática en `acentos` |
| **Helvetica Neue** Heavy/Black | ✅ válida según Lucas ("creo que helvetica-neue-5 va") | alternativa de subtítulos | `"helvetica-heavy"` |
| Tactic Sans Black | candidata (en el preview `SubtitulosEstilos`) | — | `"tactic-black"` |
| Bebas Neue | candidata (en el preview `SubtitulosEstilos`) | — | `"bebas"` |

Satoshi e Instrument Serif no vienen del pack: son del sistema `reserva` (`public/reserva/fonts/`).

## Familias del pack

### Bebas Neue (1 archivo: Regular)
Condensada, **solo mayúsculas** (escribe todo en caja alta aunque el texto venga en minúscula), trazo uniforme.
Mucho texto en poco ancho. Sirve para: números grandes, palabras sueltas de impacto, títulos cortos. Evitar: frases
largas y subtítulos de lectura continua (todo en mayúsculas cansa y pierde los acentos de caja).

### Helvetica (clásica, carpeta `helvetica-255`: Regular, Oblique, Bold, BoldOblique, Light, Compressed, Rounded Bold)
Grotesca neutra. Variantes que cambian el carácter:
- **Compressed**: muy condensada y pesada, parecida a Bebas pero con minúsculas. Titulares en columnas angostas.
- **Rounded Bold**: puntas redondeadas, tono más amable/infantil. Evitar en piezas serias.
- **Light**: fina, elegante; solo en tamaños grandes sobre fondo limpio (en video sobre cámara se pierde).

### Helvetica Neue (carpeta `helvetica-neue-5`: UltraLight, Thin, Light, Roman, Italic, Medium, Bold, Heavy, Black + itálicas)
La grotesca neutra con la gama de pesos más completa. **Heavy/Black** son las que sirven para subtítulos (bloque
sólido, se lee sobre video); Medium para textos de UI dentro de escenas; Thin/UltraLight solo como contraste
tipográfico grande sobre fondo blanco (nunca sobre video). Copiadas: `HelveticaNeue-Bold/Heavy/Black.otf`.

### Tactic Sans (carpeta `Tactic.Sans`: 3 anchos × 7 pesos × itálicas)
Sans geométrica con **esquinas cuadradas** (la "o" y la "c" son rectángulos redondeados): aire tecnológico,
deportivo, "tech/gaming". Anchos:
- **Normal** (`TacticSans-*`): el más usable.
- **Extended** (`TacticSansExd-*`) y **ExtraExtended** (`TacticSansExtExd-*`): muy anchas, entran pocas letras por
  línea en vertical (1080 px). Solo para una palabra suelta tipo logo/título.
Pesos: Thn, Lgt, Reg, Med, Bld, Blk, Ult (Ult es la más pesada). Copiadas: `TacticSans-Bold/Black.otf`.

### EuropaGrotesk SH DemiBold (solo en `public/reserva/fonts/`)
Grotesca condensada con espaciado muy cerrado. La usa el sistema `reserva`; no está en el pack.

## Para sumar una fuente a Remotion
Copiar el archivo a `public/reserva/fonts/`, cargarlo en `src/reserva/fonts.ts` y, si va a subtítulos, sumar su
clave en `FUENTES` de `src/pieza/captions-vertical.tsx` y en `FuenteSubtitulo` de `src/pieza/types.ts`.
