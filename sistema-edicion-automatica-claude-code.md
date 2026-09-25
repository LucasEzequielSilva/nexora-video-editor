# Editor de vídeo automático con Claude Code

### De las tomas del iPhone al MP4 listo para TikTok — y cómo montarlo tú en una tarde

> Lo que hay aquí es un sistema real, en uso, con un mes de construcción probándolo con material
> real. Tiene **una** pieza publicada y todavía **ninguna métrica**: lo que comparto es el sistema,
> no resultados. Cada regla que verás viene de un fallo que ya pasó, y digo cuál.

---

## 1. Qué es, en tres líneas

Dejo las tomas del móvil en `~/Downloads/`, escribo en Claude Code *"procésalos como un vídeo"*, y
el agente monta las partes, quita los silencios, transcribe, corrige, subtitula, pone zoom y
overlays, renderiza, **verifica con fotogramas**, me entrega el preview y registra la pieza en mi
bóveda de Obsidian. Yo grabo, reviso y publico. Todo corre en local y no cuesta nada al mes.

**Lo que no hace, a propósito:** no decide si una toma es buena (Whisper mide dicción, no mirada
ni energía), no publica, no inventa titulares ni cifras, no corrige la transcripción solo (ninguna
IA sabe cuál de las dos cifras querías decir), no pone música. Eso es criterio, y el criterio es mío.

## 2. La arquitectura: dos capas, dos chats

```
~/Desktop/IA/
├── OBSIDIAN VAULTS/Creación de Contenido/   ← LA BÓVEDA: decide
│   ├── CLAUDE.md        contrato del chat de la bóveda
│   ├── perfil/          quién soy, voz, pilares, prohibiciones
│   ├── raw/             fuentes crudas (inmutables)
│   ├── wiki/            conocimiento destilado con procedencia
│   ├── contenido/       ideas/ → guiones/ → publicado/
│   ├── index.md         catálogo
│   └── log.md           registro cronológico, solo se añade
│
└── canal-render/                            ← LA SALA DE PRODUCCIÓN: produce
    ├── CLAUDE.md        contrato del chat del editor
    ├── raw/<slug>/      tomas originales, una carpeta por pieza
    ├── public/          montaje recortado + transcripción JSON (lo que lee Remotion)
    ├── cortes/          listas de cortes, uniones y props (zoom, overlays, estilo) por pieza
    ├── out/             renders: máster, -subir, -preview
    ├── assets/          biblioteca de recursos (biblioteca.json es la fuente de verdad)
    ├── scripts/         montar · jumpcut · uniones · procesar · corregir · recursos · limpiar
    └── src/             composición de Remotion (subtítulos, zoom, overlays)
```

Dos carpetas y **dos sesiones de Claude Code distintas**, cada una con su `CLAUDE.md`. No es
capricho:

- **Físico.** La bóveda tiene Obsidian Sync: cada MP4 que entrase se subiría a la nube. Y el
  proyecto de render tiene `node_modules`: decenas de miles de archivos que Obsidian indexaría.
- **De diseño.** El criterio vive en un sitio y la ejecución en otro. **La bóveda decide; el
  editor produce.** Si el editor detecta que algo choca con la voz, lo anota en la nota de la pieza
  y no toca el vídeo. Un solo chat que lo sabe todo se satura al mes; dos chats con un contrato cada
  uno, no.

Lo que los une es el **slug**: `contenido/guiones/no-le-tengas-miedo-a-la-ia.md` en la bóveda es
`raw/no-le-tengas-miedo-a-la-ia/` y `out/no-le-tengas-miedo-a-la-ia.mp4` en el render. Una pieza se
rastrea de punta a punta por su nombre.

## 3. Stack y coste

| Pieza | Para qué | Coste |
|---|---|---|
| **Claude Code** | El agente que ejecuta el pipeline y mantiene la bóveda | Suscripción de Claude |
| **ffmpeg** | Montar, cortar silencios, verificar, extraer fotogramas | Gratis |
| **whisper.cpp** (`large-v3-turbo`) | Transcripción en español, palabra por palabra, con confianza | Gratis, local (1,5 GB) |
| **Remotion** (plantilla oficial de TikTok) | Subtítulos animados, zoom, overlays, render | Gratis hasta 3 personas |
| **Obsidian** | La bóveda de conocimiento y decisiones | Gratis |
| Chrome sin cabeza | Capturas de titulares y hojas de contacto con etiquetas | Gratis |

Máquina: un Mac con chip M (un M5 renderiza a tiempo real: 45 s de vídeo, 45 s de render).
Requisitos: Node, `cmake` (para compilar whisper.cpp), ffmpeg.

## 4. El recorrido de una pieza, paso a paso

### 4.1 Antes de grabar: la bóveda

Una idea nace en `contenido/ideas/`, derivada de la wiki (no del aire), y si avanza pasa a
`contenido/guiones/<slug>.md`. El guion se escribe leyendo antes `perfil/voz-y-estilo.md`. Eso ya
es parte del pipeline: lo que se graba tiene un nombre y un porqué antes de existir.

### 4.2 Entrada

Las partes van a `~/Downloads/`, en orden, sin recortar. El agente las copia a `raw/<slug>/`,
verifica cada copia con `md5 -q` y **solo entonces** mueve los originales a la Papelera. Descargas
queda vacía. Nunca `rm`.

### 4.3 Montaje — una sola pasada

```bash
node scripts/montar.mjs cortes/<slug>.json public/<slug>-bruto.mp4
```

`cortes/<slug>.json` es una lista de `{ archivo, desde, hasta }`. Todo se hace en **una sola pasada
de ffmpeg con el filtro `concat`**: recorte, normalización a 1080x1920/30 fps y unión. Los `.MOV`
del iPhone traen `rotation=90` y ffmpeg los endereza solo.

> **Fallo que lo originó:** codificar cada trozo por separado y pegarlos con `-c copy` arrastraba
> ~21 ms de "priming" de AAC por segmento. Con ocho partes el desfase se acumulaba y los subtítulos
> iban desacompasados. Una sola línea de tiempo lo arregló: sincronía A/V a 3 ms.

### 4.4 Silencios — jump cuts calibrados

```bash
node scripts/jumpcut.mjs public/<slug>-bruto.mp4 public/<slug>.mp4 --dry   # primero mirar
node scripts/jumpcut.mjs public/<slug>-bruto.mp4 public/<slug>.mp4         # luego cortar
```

La lógica cabe en cuatro pasos:

1. `ffmpeg -af silencedetect=noise=-40dB:d=0.6` → lista de silencios.
2. **Fusionar** los silencios separados por menos de 0,35 s.
3. Invertir: los tramos que se conservan, dejando 0,2 s de margen a cada lado.
4. Un solo `filter_complex` con `trim`/`atrim` + `concat`, y opcionalmente `afade` de 30 ms por tramo.

Los cuatro números **salieron de material real**, y cada uno tiene su fallo detrás:

| Parámetro | Valor | Fallo que lo fijó |
|---|---|---|
| `--umbral` | −40 dB | A −30 dB se comía finales de palabra: *"estoy montando este canal"* salió como *"estudio canal"*. Las consonantes suaves caen por debajo de −30 |
| `--minimo` | 0,6 s | La plantilla traía 0,45: con material real sonaba entrecortado |
| `--margen` | 0,2 s | La plantilla traía 0,08: se comía las respiraciones |
| `--fusion` | 0,35 s | Entre dos partes grabadas por separado hay varios silencios pegados con chispazos de ruido. Tratarlos por separado dejaba **rebanadas de 0,4 s de casi-silencio cosidas**: un tartamudeo visible en el segundo 7 |

Entre 9 % y 25 % de recorte es normal. Y la señal de alarma es fácil: si tras cortar aparecen en la
transcripción palabras raras con confianza baja **que antes no estaban**, el recorte se está
comiendo audio.

### 4.5 Verificar el montaje — con datos, no con fe

Tres comprobaciones antes de seguir:

```bash
# 1. Cero tramos congelados
ffmpeg -i public/<slug>.mp4 -vf freezedetect=n=0.003:d=0.3 -an -f null -
# 2. Audio y vídeo miden lo mismo (< 50 ms)
ffprobe -v error -select_streams v:0 -show_entries stream=duration -of csv=p=0 public/<slug>.mp4
ffprobe -v error -select_streams a:0 -show_entries stream=duration -of csv=p=0 public/<slug>.mp4
# 3. Hoja de contacto de las uniones
node scripts/uniones.mjs <slug>
```

La tercera es la más reciente: `jumpcut` deja `cortes/<slug>-uniones.json` (dónde queda cada corte
en la salida, de dónde viene, cuánto silencio se quitó) y `uniones.mjs` compone **una imagen con el
último fotograma antes y el primero después de cada corte**, etiquetados. Dos fotogramas casi
idénticos con un tramo de menos de 0,5 s es la firma del tartamudeo. Se mira una vez, antes de
renderizar. Probado: con `--fusion 0` la hoja enseña el fallo conocido; con `0.35` desaparece.

### 4.6 Transcribir

```bash
node sub.mjs public/<slug>.mp4      # whisper.cpp, large-v3-turbo, español
```

Sale `public/<slug>.json`: una lista de palabras con `text`, `startMs`, `endMs` y `confidence`.
**Es el archivo central del sistema**: de él salen los subtítulos, los tiempos de los zooms y los
momentos de overlay.

> El error nº 1 de quien monta la plantilla de Remotion: viene con el modelo `medium.en`, que es
> solo inglés. Si los subtítulos salen en inglés macarrónico, es eso.

### 4.7 Corregir

```bash
node scripts/corregir.mjs public/<slug>.json     # aplica scripts/correcciones.json
```

`correcciones.json` es un diccionario que crece con la evidencia: `Claudia` → `Claude`,
`Cloud` → `Claude`, `Notebook LM` → `NotebookLM`. Regla: si Whisper se equivoca dos veces en lo
mismo, la pareja entra. Después, el agente **lee la transcripción entera** buscando confianza < 0,6,
cifras, nombres propios y frases que no cuadren.

**Las cifras se escriben con letra** ("veintiocho dólares", no "28 dolares"). En este formato el
número es el gancho, y un subtítulo mal puesto lo rompe. Es el paso que justifica todo lo demás.

### 4.8 Zoom

En `cortes/<slug>-props.json`, en milisegundos, para copiar el tiempo directamente del JSON de la
transcripción: buscas la palabra clave, coges su `startMs`, y ese es tu punch.

```json
"zooms": [
  { "startMs": 0,     "endMs": 94000, "desde": 1.0, "hasta": 1.08, "tipo": "suave" },
  { "startMs": 33900, "endMs": 37200, "hasta": 1.25, "tipo": "punch", "origenY": 38 }
]
```

- Una deriva `suave` en toda la pieza, para que un plano fijo no parezca una foto.
- **Uno o dos `punch`, no más**, en la frase que sostiene el vídeo. Nunca en el hook: ahí ya tienes
  la atención; la pierdes en el medio.
- Por encima de 1,4 se ve el pixelado. Los subtítulos no se escalan con el zoom, a propósito.

### 4.9 Overlays: se cruzan la transcripción y la biblioteca

```json
"overlays": [
  { "startMs": 8500, "endMs": 11300, "tipo": "imagen",
    "archivo": "assets/capturas/titular-france24-openai-incidentes.png",
    "posicion": "arriba-izquierda", "ancho": 540, "rotacion": -4, "entrada": 8 },
  { "startMs": 33900, "endMs": 36000, "tipo": "texto", "texto": "$20/mes", "posicion": "arriba-derecha" },
  { "startMs": 40000, "endMs": 44000, "tipo": "video",
    "archivo": "assets/broll-propio/macbook-nuevo-desembalaje-pantalla-hola.mp4", "posicion": "arriba", "ancho": 560 }
]
```

Tres tipos: `imagen` (tarjeta con borde y sombra), `texto` (píldora) y `video` (ventana muda).
`"marco": false` para logos.

**Cómo se eligen los momentos:** el agente busca en la transcripción cada cosa que existe en la
biblioteca. **Un overlay entra donde el guion nombra algo que hay en la reserva**: un miedo, una
cifra, una herramienta, un término, una noticia. `npm run recursos -- buscar <palabra>` dice si hay
recurso y si ya se usó en otra pieza.

Reglas que salieron de fallos reales:

- **Encima de la cabeza, no de la cara.** Con encuadre cerrado, el espacio libre es el tercio
  superior: posiciones `arriba-*`, anchos 520–600 (760–780 para tarjetas horizontales).
- **Escalonar**: 450 ms entre uno y otro con entrada de 8 frames. 900 ms se sentía lento; todos a la
  vez es ruido.
- **Las píldoras de texto van a izquierda y derecha; el centro solo cuando la anterior ya se fue.**
  Dos píldoras anchas en posiciones vecinas se tapan.
- **Titulares reales, capturados de medios, registrados con fuente y fecha. Nunca generados.** Un
  titular falso en un canal de especificidad verificable es un autogol.
- Los vídeos de la biblioteca se reproducen desde el segundo 0, así que cada clip se guarda ya
  recortado para que empiece en el momento útil.

### 4.10 Subtítulos y render

```bash
npx remotion render CaptionedVideo out/<slug>.mp4 --props=cortes/<slug>-props.json
```

Subtítulos palabra a palabra, agrupados en páginas de 1,2 s (`createTikTokStyleCaptions` de
`@remotion/captions`). Cinco estilos disponibles; **`sobrio` por defecto**: barra oscura
semitransparente, sin contorno, palabra activa en blanco y el resto atenuado. Se eligió entre cinco
propuestas renderizadas sobre un fotograma real, por coherencia con la voz: si el subtítulo grita
mientras tú explicas con calma, el vídeo dice dos cosas a la vez y gana la que se ve. `bloque`
(palabra activa sobre amarillo) se reserva para cuando la cifra es el gancho. El estilo Hormozi puro
nació para vender; un canal que explica no lo necesita.

Del máster salen `-subir.mp4` (CRF 23, 1080p, faststart) y `-preview.mp4` (720p, CRF 27, el único
que cabe en el chat).

### 4.11 Verificar el render

Antes de entregar, el agente extrae dos o tres fotogramas en los momentos con zoom u overlay y **los
mira**: nada tapa la cara, los subtítulos se leen. La tarjeta que tapaba la cara se cazó así, no en
el código.

### 4.12 Entregar y registrar

El preview llega al chat; el `-subir` espera en `out/`. Y en la bóveda: la nota
`contenido/guiones/<slug>.md` recibe la transcripción como guion con tiempos, notas de producción,
decisiones (qué principio de la wiki se aplicó) y un **historial de versiones** — v1, v2, v3… qué
cambió y por qué. Nunca se pisa una versión. Una fila en `index.md`, una entrada al final de
`log.md`, y cada recurso usado queda marcado (`usado_en`) para no repetir el mismo plano en vídeos
seguidos.

### 4.13 Publicado → aprender → liberar

Cuando la pieza sale, la nota pasa a `estado: publicado`. Esa marca es dos cosas:

1. La señal para pedir métricas, escribir el post-mortem y **subir lo aprendido a la wiki**. Tres
   piezas que confirman un patrón lo vuelven `solido`. Publicar se convierte en conocimiento.
2. La **única** señal que autoriza a `npm run limpiar` a mover tomas e intermedios a la Papelera
   (simula primero, ejecuta después), conservando siempre el máster y la transcripción.

## 5. La biblioteca de recursos

`assets/biblioteca.json` es la fuente de verdad; `npm run recursos -- listar | buscar | añadir |
usar | podar` la opera. Cuatro reglas:

1. **Nombrar por contenido, no por origen.** `saltar-cuerda-azotea-amanecer-silueta.mp4`, nunca
   `IMG_1739.mov`. Esto solo resuelve el 80 % del problema de encontrar algo.
2. **La descripción es obligatoria.** El script no deja añadir sin ella.
3. **Procedencia y licencia siempre.** Propio, generado o descargado; si no es propio, de dónde
   salió y con qué permiso. Lo generado con IA hay que declararlo en algunas plataformas.
4. **Poda.** Seis meses sin usarse y no lo elegirías hoy: fuera.

`listar` muestra el porcentaje de material propio como señal de salud. Empezó en 0 % (todo eran
logos, capturas y titulares) y el primer lote del móvil lo subió al 36 %. Lo generado sirve para lo
que no se puede grabar; lo propio, para todo lo demás.

## 6. Obsidian: por qué una bóveda y no un RAG

La bóveda es la **memoria compilada** del canal. El conocimiento no se re-descubre en cada
pregunta: se compila una vez y se mantiene al día. Cada fuente nueva se integra en las páginas que ya
existen.

- `perfil/` — quién eres, tu voz, tus pilares, tus prohibiciones. Se lee **antes** de escribir una
  línea de guion. Tu contexto personal sensible es contexto interno, nunca material publicable.
- `raw/` — fuentes crudas. **Sagrado**: se lee, jamás se edita ni se mueve.
- `wiki/` — una página por fuente, y páginas de conceptos (hooks, retención), entidades, audiencia
  y síntesis (lo que hoy creemos que funciona). **Toda afirmación lleva procedencia**; una hipótesis
  sin evidencia se marca como tal; las contradicciones se documentan bajo `## Tensiones`, no se
  eligen en silencio.
- `contenido/` — `ideas/ → guiones/ → publicado/`, mismo slug de punta a punta.
- `index.md` y `log.md` — catálogo y registro. Se actualizan **en la misma pasada** que el cambio
  que los motiva, nunca "después". El log es append-only y es lo que permite que dos chats trabajen
  sin pisarse: cada uno lee las últimas cinco entradas al empezar.

El chat del editor solo escribe tres cosas en la bóveda: la nota de la pieza, su fila en el índice
y el log. `perfil/`, `wiki/` y `raw/` son del otro chat.

## 7. Las reglas que salieron de fallos

Esto es lo que de verdad vale la pena copiar. No las reglas: la costumbre de escribirlas.

| Regla | Fallo que la originó |
|---|---|
| Copiar, verificar con md5, y solo entonces mover a la Papelera. Nunca `rm` | Confianza, no un fallo: es la única operación irreversible del sistema |
| Montaje en una sola pasada de ffmpeg | 21 ms de desfase por segmento acumulados en ocho partes |
| Umbral −40 dB, no −30 | "estoy montando este canal" → "estudio canal" |
| Fusionar silencios pegados | Rebanadas de 0,4 s cosidas: tartamudeo en el segundo 7 |
| `freezedetect` = 0 y A/V < 50 ms antes de seguir | El tartamudeo anterior se detectó así, con datos, no de oído |
| Hoja de contacto de las uniones | La verificación por fotogramas se hacía a mano; ahora la hace el script |
| Leer la transcripción entera; cifras con letra | "28 dolares" en un vídeo donde el número era el gancho |
| Diccionario de correcciones | "Claude" salía como "Claudia" o "Cloud" en cuatro sitios de un mismo vídeo |
| Overlays encima de la cabeza, 520–600 px | La primera tarjeta tapó la cara |
| Escalonar 450 ms, entrada 8 | 900 ms se sentía lento; simultáneos era ruido |
| Píldoras a los lados, nunca dos en el centro | Dos píldoras vecinas se solaparon |
| Titulares reales con fuente y fecha | Ninguno: es una regla preventiva, y de las pocas |
| Verificar el render con fotogramas | La tarjeta sobre la cara: el render era "correcto" para el código |
| Fechas en hora local, no UTC | El primer recurso del día se fechaba el día anterior; la Papelera se nombró con el día siguiente |
| Un fallo del agente se dice, se corrige y se anota en la guía | Un `read` mal escrito truncó 26 descripciones a una palabra. Se reparó y quedó escrito |

## 8. El CLAUDE.md como contrato

Lo que hace que esto funcione con un agente no es el código: es el **contrato**. Cada carpeta tiene
un `CLAUDE.md` que se lee al empezar la sesión y que dice qué hace el agente, qué no hace, dónde está
cada cosa, cuál es el flujo y **de qué fallo viene cada regla**. Cuando algo sale mal, se edita ahí.

Esqueleto del `CLAUDE.md` del editor, por si quieres partir de él:

```
1. Qué haces y qué no          ← "no decides si una toma es buena", "no publicas", "no inventas"
2. Dónde está cada cosa        ← el mapa de carpetas y la regla del slug
3. El pipeline, paso a paso    ← 13 pasos con los defaults calibrados y su porqué
4. Subtítulos, estilo, overlays ← el estilo por defecto y las reglas que salieron de fallos
5. La biblioteca de recursos   ← las cuatro reglas
6. La bóveda: qué se toca      ← solo la nota de la pieza, el índice y el log
7. Limpieza                    ← estado: publicado como única señal
8. Cómo trabajas conmigo       ← diagnostica antes de arreglar; verifica con fotogramas;
                                  un fallo se dice, se corrige y se anota
```

Tres principios que se repiten en los dos contratos:

- **Diagnosticar antes de arreglar.** Cuando algo se ve mal, buscar la causa con datos (silencios,
  duraciones, `freezedetect`, fotogramas) y explicarla. No parchear a ciegas.
- **Verificar con fotogramas, no con fe.** El agente mira lo que produjo antes de decir "listo".
- **Un fallo se dice, se corrige y se anota** para que no se repita. Sin dramatizar.

## 9. Cómo replicarlo en una tarde

1. **Remotion.** `npx create-video@latest` y elige la plantilla TikTok. Cambia `whisper-config.mjs`
   a un modelo sin `.en` (`large-v3-turbo`) y el idioma a `es`. Instala `cmake` antes de compilar.
2. **`jumpcut.mjs`.** Los cuatro pasos de §4.4 son 150 líneas de Node que llaman a ffmpeg. Pídele
   a Claude Code que lo escriba a partir de esta sección; empieza siempre con `--dry`.
3. **`montar.mjs`.** Una lista de cortes → un `filter_complex` con `trim`+`concat`. Una sola pasada.
4. **La composición.** La plantilla ya trae subtítulos. Añade un `ZoomedVideo` con `interpolate()`
   sobre el frame y un `Overlays` con `<Sequence>` por overlay. Los props se validan con `zod`.
5. **La biblioteca.** Un JSON y un script con `añadir` que obligue a descripción y licencia.
6. **La bóveda.** Crea las carpetas de §2 en Obsidian, escribe `perfil/voz-y-estilo.md` primero
   (es la barrera contra el guion genérico) y el `CLAUDE.md` de §8.
7. **Los dos contratos.** Escribe el `CLAUDE.md` de cada carpeta con lo que sabes hoy. Cortos. Se
   completan con cada fallo.
8. **Graba con material imperfecto a propósito.** Cada fallo que encuentres así queda arreglado
   para siempre, y su regla escrita.

Un prompt razonable para empezar, con este documento en la carpeta:

> *Lee `sistema-edicion-automatica-claude-code.md`. Quiero replicar ese sistema para mi canal.
> Empieza por el paso 1 de la sección 9 y no pases al siguiente hasta que el anterior funcione con
> un vídeo real mío. Cada regla que rompas o cambies, dímela.*

## 10. Límites y lo que sigue

- **El vídeo publicado es el eslabón más débil.** Una pieza fuera, cero métricas. El sistema aprende
  de los post-mortems, y todavía no hay ninguno. Con cero vídeos publicados, automatizar es la tarea
  que se siente productiva sin serlo; por eso se construyó probando con material real y no en
  abstracto.
- Whisper tiende a omitir las muletillas. Un detector de "eh" sobre la transcripción mediría mal un problema
  que, en mis tres transcripciones reales, no existe (cero). Se descartó.
- Pendiente: alinear guion ↔ tiempos de Whisper (palabras del guion, tiempos del audio) cuando
  grabe la primera pieza leyendo un guion; y propuestas automáticas de `bloque` y punch, calibradas
  contra retención real, después de tres piezas publicadas.

## 11. Créditos

Tres ideas vinieron de fuera: los fundidos de 30 ms por corte y mirar un fotograma en cada unión en
vez de fiarse solo de las métricas (del kit abierto `video-use`, de browser-use, y de posts de la
comunidad de Imperio Agéntico sobre Claude + Remotion), y el aviso, también de la comunidad, de medir
"cuántas salen de más por vídeo" antes de fiarse de cualquier disparador automático. El resto salió
de un mes de fallos propios, que es de donde salen las reglas que sirven.

---

*Sistema construido entre el 26 de agosto y el 19 de septiembre de 2026 con Claude Code (Opus),
ffmpeg, whisper.cpp, Remotion y Obsidian. Si lo montas y encuentras un fallo que yo no encontré,
me interesa más que el elogio.*
