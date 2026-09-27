# Formato anuncio (creativos)

Template visual copiado de la referencia `assets/referencias/anuncio-2026-09-27.mp4` (anuncio de la Biblioteca de
anuncios de Meta: un creador hablando a cámara frente a una ventana con ciudad, 29 s). Lucas (2026-09-27): "copiá este
estilo visual para que nos quede de template, estoy por grabar unos creativos".

Demo en Studio: composición **`anuncio-demo`** (con el material de `empieza-a-romperse`; `public/piezas/anuncio-demo/props.json`).

## 1. Qué tiene el estilo

| Capa | En la referencia | En el editor |
|---|---|---|
| Subtítulo | Chico, blanco, una frase de 1–3 palabras por vez sobre el pecho, que entra entera desenfocada; la palabra clave en serif itálica del mismo tamaño ("tenés una *agencia*") | `subtitulos.estilo: "anuncio"` (+ `acentos`) |
| Titular | Arriba de la cabeza: frase chica blanca + cifra o palabra gigante **azul eléctrico con brillo, entre corchetes** ("[4 A 6]") + bajada en serif itálica ("Clientes nuevos") | overlay `titular` (`arriba`, `grande`, `corchetes`, `abajo`, `abajoEn`, `color` azul/rosa/blanco) |
| Aro | Aro blanco luminoso flotando arriba a la derecha, sobre la cara todo el tiempo | overlay `aro` (`desde`, `hasta` o `"fin"`) |
| Escenas blancas | Blanco limpio; texto negro pesado + serif itálica; palabras gigantes rosa/rojo neón ("30 DÍAS"); letras que se arman; objetos 3D (cerebro, calendario, teléfono, personas); etiquetas negras con borde blanco tipo sticker | escena `frase` con `tema: "limpio"`, estilos `neon` y `etiqueta`, `animar: "letras"`, `objeto` (3D o logo, con `x`/`y`) y `textoY` |
| Capturas | Calendarios llenos de reuniones que pasan rápido con desenfoque, rotulados ("como estos") | escena `capturas` (`imagenes` reales, o el calendario de maqueta si no hay; `etiquetas` en cues) |
| Transiciones | Corte seco cara ↔ escena; el movimiento va adentro de cada escena | entrada/salida de escena de siempre (14/10 cuadros) |
| Sonido | Música de fondo todo el tiempo (el audio no tiene silencios) | `musica` como en el formato ganador |
| Cámara | Plano medio casi quieto, sin zooms grandes | `zooms: []` (la cámara que sigue la cara igual calibra) |

## 2. Cómo grabar para este template

- **Plano medio** (de la cintura para arriba), cámara a la altura de los ojos, laptop en primer plano abajo.
- **Ventana con ciudad de fondo**, idealmente con luz de atardecer (el cielo celeste verdoso es la mitad del look).
- **Aire arriba de la cabeza**: el cuarto superior del cuadro es para el titular.
- **Remera oscura**: el subtítulo es blanco y chico, sobre el pecho.
- **Mirando a la lente, sin leer** (la herramienta de tomas marca el % a cámara; una toma buena va arriba de 70 %).
- Frases cortas con una pausa limpia entre cada una; la cifra del gancho dicha clara ("de 4 a 6 clientes nuevos").
- iPhone: video HDR apagado.

## 3. Receta de props

```json
{
  "subtitulos": { "fuente": "satoshi", "estilo": "anuncio", "acentos": ["<palabra clave>"] },
  "zooms": [],
  "overlays": [
    { "tipo": "aro", "desde": { "palabra": "<primera palabra>" }, "hasta": "fin" },
    { "tipo": "titular", "desde": { "palabra": "<...>" }, "hasta": { "palabra": "<...>" },
      "arriba": "<frase chica literal>", "grande": "<cifra o palabra>", "corchetes": true,
      "abajo": "<bajada literal>", "abajoEn": { "palabra": "<...>" } },
    { "tipo": "escena", "escena": "frase", "tema": "limpio", "pip": "ninguno", "desde": {}, "hasta": {}, "cues": {},
      "datos": { "lineas": [[{ "texto": "<...>", "estilo": "serif", "cue": "a" }],
                            [{ "texto": "<PALABRA>", "estilo": "neon", "cue": "b", "animar": "letras" }],
                            [{ "texto": "<...>", "estilo": "etiqueta", "cue": "c" }]],
                 "objeto": { "archivo": "recursos/objeto-3d-005.glb", "cue": "a", "x": 540, "y": 520, "lado": 460 } } },
    { "tipo": "escena", "escena": "capturas", "tema": "limpio", "pip": "ninguno", "desde": {}, "hasta": {},
      "cues": { "a": {} }, "datos": { "etiquetas": [{ "texto": "<...>", "cue": "a" }] } }
  ]
}
```

Reglas que siguen valiendo: todo el texto en pantalla es literal del guion (se ajustan solo mayúsculas y puntuación),
todo anclado a palabras, escenas y titulares no se pisan (el titular va solo sobre la cara), `chequeo-formato.mjs` y
`npm run verificar` antes de mostrar.
