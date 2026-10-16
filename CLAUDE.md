# CLAUDE.md — video-editor

Contrato de este proyecto. Se lee al empezar cada sesión acá adentro.

## 1. Qué hace y qué no

Este editor monta y produce piezas verticales (1080x1920 o 1920x1080 según composición) a partir de
grabaciones reales, usando Remotion. **No decide si una toma es buena** (eso es criterio humano), no
publica, no inventa texto ni cifras que no estén en la transcripción real.

## 2. Dónde está cada cosa

```
video-editor/
├── CLAUDE.md              este archivo
├── PACKS/                 recursos crudos comprados: broll, SFX, presets DaVinci, fuentes
├── assets/biblioteca.json catálogo de PACKS/ — fuente de verdad, ver §6
├── .claude/skills/formato-ganador/  skill /formato-ganador: procedimiento para una pieza nueva en el formato
├── formatos/ganador-talking-head/   EL FORMATO GANADOR (estructura-nexora): README con anatomía, gramática
│                          guion → recursos, reglas, pipeline y checklist + props.template.json + chequeo-formato.mjs
│                          + drops-musica.py. Una pieza nueva de este tipo arranca acá.
├── formatos/spec-ad/      FORMATO SPEC AD (comercial de producto 16:9 + 9:16 estilo Revolut/Spotify/Amazon): README con
│                          roles (Claude director, Remotion UI, Higgsfield plates), estructura, referencias, spec.json y
│                          pipeline. Skill `/spec-ad`. Motor en `src/spec/`, piezas en `public/spec/<slug>/spec.json`.
├── assets/catalogo/       catálogos legibles: brolls.md, musica.md, sonidos.md, iconos.md, fuentes.md, icon-set-prompt.md
├── assets/referencias/    videos de referencia de estilo + estilo-editorial.md
├── cortes/                <slug>.json = qué toma de qué clip va en la pieza (con la frase de cada una)
├── scripts/
│   ├── turno.mjs          corre un trabajo pesado (render, whisper) esperando turno: uno a la vez
│   ├── recortador.mjs     servidor del recorte manual de Lucas (+ recortador.html, trabas.mjs, recortar.mjs)
│   ├── montar.mjs         cortes JSON -> MP4 vertical 1080x1920 (un corte por vez, HDR->SDR)
│   ├── jumpcut.mjs        saca silencios (-40 dB / 0.3 s / margen 0.06 s = ritmo de Lucas), --dry primero
│   ├── transcribir.py     faster-whisper large-v3, frase por frase (literal: deja ver las trabas)
│   ├── corregir.mjs       words.raw.json -> words.json con correcciones.json (global + local)
│   ├── correcciones.json  diccionario global (voseo, "vídeo"->"video", ...)
│   ├── recursos.mjs       CLI de la biblioteca (escanear/listar/buscar/describir/usar)
│   ├── build-reserva-transcript.py  genera src/reserva/transcript.ts (solo el sistema reserva)
│   └── *.whisper.json     salidas crudas de whisper del sistema reserva
├── public/piezas/<slug>/  video.mp4, words.raw.json, words.json, correcciones.json, props.json
├── src/
│   ├── reserva/           sistema horizontal 1920x1080, atado a un solo video — ver §3
│   └── pieza/             sistema vertical genérico 1080x1920, lee public/piezas/<slug>/ — ver §3
└── out/                   renders, montaje bruto (intermedio, se regenera) y out/verif (fotogramas de prueba)
```

## 3. El pipeline hoy — qué es real y qué es manual todavía

Hay dos sistemas. **No fingir automatización que no existe.**

### 3a. Piezas verticales (`src/pieza/`, ej. `estructura-nexora`) — el que se usa para piezas nuevas

1. **Elegir tomas** → `cortes/<slug>.json`. El agente propone (la toma completa **dicha a cámara y fluida**, no la
   leída de la pantalla, aunque sea la última; o la que el equipo aprueba en voz alta: "ahí está"); **Lucas la ajusta
   a mano** con la herramienta de tomas: `npm run tomas -- <slug> [--clips <archivo o carpeta>]` →
   http://localhost:3101 (proxy liviano del crudo, onda, frases de `explorar-tomas.py`, franja de mirada de
   `scripts/mirada.py` y las tomas como bloques que se ajustan, reordenan, agregan o sacan; ▶ Montaje las reproduce
   seguidas). La mirada combina el giro de la cabeza (YuNet) y la posición del iris (MediaPipe Face Landmarker,
   `models/mediapipe/face_landmarker.task`, sobre un recorte de la cara en 1080): una toma buena va arriba de 70 %
   a cámara. Verificar cada borde con `silencedetect` sobre el clip original, no con los tiempos de whisper.
2. `node scripts/montar.mjs cortes/<slug>.json out/<slug>-bruto.mp4`. Después: 1080x1920, audio y
   video a menos de 50 ms, `freezedetect` en cero.
3. `node scripts/jumpcut.mjs out/<slug>-bruto.mp4 public/piezas/<slug>/video.mp4 --uniones cortes/<slug>-uniones.json`
   (siempre `--dry` antes). En `estructura-nexora` recortó 9.4 %; lo normal es 9–25 %.
   El resultado se guarda como `public/piezas/<slug>/video-jc.mp4` (fuente de los recortes manuales).
4. `node scripts/turno.mjs python scripts/transcribir.py public/piezas/<slug>/video-jc.mp4 public/piezas/<slug>/words.raw.json --prompt "<marcas y términos>"`
   (default: `large-v3` local en `models/`, cada frase entre pausas de 0.3 s decodificada por separado; ~4 min para
   66 s en CPU). Decodificar de corrido hace que whisper junte los tropiezos en una sola frase (probado con
   medium, turbo y large-v3). Ojo: la primera palabra de cada frase sale ~0.1–0.2 s antes (margen del corte).
5. `node scripts/corregir.mjs public/piezas/<slug>` → `words.jc.json`. **Leer la transcripción entera**:
   whisper se come palabras en los cortes duros entre tomas (`inserciones` en el
   `correcciones.json` de la pieza, con tiempos verificados) y colapsa tropiezos o estira palabras sobre
   pausas (`tramos`: reemplaza las palabras de un tramo por otras con tiempos medidos sobre la energía) y cambia de errores en cada corrida:
   **no re-transcribir salvo que cambie el montaje**, o se pierden las correcciones.
6. **Recorte manual** (lo hace Lucas): `npm run recortador -- <slug>` abre http://localhost:3100 (video +
   onda + transcripción clickeable; motivo y "porqué" de cada recorte). Panel **"Posibles trabas"**
   (`scripts/trabas.mjs`, también CLI → `trabas.json`): [Ir]/tecla N selecciona el corte sugerido, P lo
   escucha, I/O lo ajusta, [Sacar] lo recorta, [No es traba] queda en `descartadas` (también es señal de
   su criterio). Guarda en
   `cortes/<slug>-recortes.json` con el `contexto` de cada recorte (palabras, vecinas, dB, si era
   silencio): **de ahí se aprende su criterio, leer esos archivos y anotar las reglas en §8**. Después
   `node scripts/recortar.mjs public/piezas/<slug>` (`--dry` primero): genera `video.mp4` y `words.json`
   (palabras remapeadas, sin re-transcribir) y ajusta `durationSeconds`. **Nunca borrar ni "limpiar"
   `cortes/*-recortes.json`: es trabajo de Lucas** (si algo parece de prueba, respaldarlo aparte y
   avisar). Sin recortes, `recortar.mjs` copia `video-jc.mp4` tal cual.
7. `props.json` a mano (`public/piezas/<slug>/props.json`). **Anclar todo a palabras**, no a
   milisegundos: un ancla es `{ "palabra": "día", "n": 1, "offsetMs": -150 }` (n-ésima aparición en
   `words.json`) o `{ "atMs": 24280 }`; así sobrevive a los recortes. Bloques:
   - `subtitulos`: `{ fuente: "satoshi", acentos: ["estructura", { palabra, atMs, color }] }`
   - `sfx`: `[{ nombre, <ancla>, volumen }]` — `nombre` es una clave de `SFX_FILES` (`riser`, `impact`,
     `pop`, `click`, `key`, `whoosh-*`...); el golpe del sonido cae en el ancla.
   - `overlays`: `broll` (`archivo`, `inicioS`, `desde`, `hasta`, `zoom`, `sfx`), `icono` (`imagen` = ícono
     premium de Lucas en public/ **o** `marca` = logo oficial; `en`, `duracionMs`, `tamano`, `centroY`,
     `sfx`), `strike` (`palabras: [{ imagen | text, en: <ancla> }]`, `hasta: <ancla>`, `topPct`, `size`): con
     `imagen` (ícono premium) entra con `pop`, lo cruza una línea roja con `trazo` y queda apagado (preferido,
     ver §8); con `text` tacha la palabra (evitarlo si la palabra ya está en el subtítulo).
   - `overlays` de tipo `escena` (el pedido "estilo Trendspot + pre-call"): `{ tipo: "escena", escena:
     "pendientes"|"proceso"|"chat"|"panel"|"cta"|"cuenta", desde, hasta (ancla o "fin"), cues: { <nombre>: <ancla> },
     datos: {...}, pip: "abajo-izquierda" (default) | "abajo-derecha" | "ninguno", subtitulos: false (default:
     se ocultan durante la escena) }`. `pip` = esquina donde va el que habla **recortado sin fondo**
     (`persona.webm`), delante de la escena.
     Sistema en `src/pieza/escenas/`: `fondo.tsx` (liso blanco o negro según `tema`, sombras suaves + viñeta; la
     grilla se sacó el 2026-09-25), `frase.tsx` (texto en dos voces + objeto 3D o logo), `cuenta.tsx`, `marco.tsx` (transición, `Recorte` sincronizado, whooshes), una escena por archivo con su
     `Datos` y `PREVIEW` (composición `escena-<id>` en Studio, carpeta `piezas/escenas`), `registry.ts`.
     Escena nueva = archivo nuevo + registrarlo en `registry.ts`.
   - **Kit del estilo editorial** (`src/pieza/editorial/`, guía `assets/referencias/estilo-editorial.md`, previews
     en Studio carpeta `piezas/editorial`): `tema.ts` (gris frío, tintas, acento verde, sombras abajo-derecha, B/N
     con trama, tiempos medidos), `fondo-editorial.tsx` (gris liso + cruces de registro fijas, banda/anillo),
     `titular.tsx` (bajada serif + remate Helvetica Neue Bold igualado en ancho, palabras con blur de entrada),
     `caja-seleccion.tsx` (caja con tiradores tipo software de diseño), `objeto-fisico.tsx` (foto, cuadro, marco
     doble, documento, ícono; imagen o video, B/N), `camara-escena.tsx` (entra frenando con blur, deriva, sale
     acelerando sin blur, continuidad de dirección), `blur-x.tsx` (estela horizontal). Todavía no se usa en una
     pieza: es una familia visual distinta de las escenas de grilla blanca.
   - `node scripts/master.mjs <entrada.mp4> <salida.mp4>`: limitador si hace falta + loudnorm lineal de dos pasadas
     (−14 LUFS, TP −1.5 dBTP, AAC 256k) + informe (ver §7).
   - Logos de marca: `LogoApp` (`src/pieza/marca.tsx`), trazados oficiales de simple-icons (CC0) en
     `public/iconos/` y `src/pieza/marcas-paths.ts` (whatsapp, instagram, googlecalendar, gmail). Para sumar
     una marca: bajar su SVG de simple-icons y regenerar `marcas-paths.ts`. **Nunca lucide ni emojis.**
   - `zooms`: `{ tipo: "suave"|"punch", inicio: <ancla>, fin: <ancla>|"fin", escala, escalaInicial?, curva?:
     "in-out"|"salida", rampa?, rampaSalida? }`. Los `suave` se encadenan (fin de uno = inicio del otro, misma
     escala); ver §8 "Zooms grandes". Con `cara.json` el encuadre sigue la cara solo.
   - **Respiros** (Lucas, 2026-09-25: "un toque menos rápido"): en `pausas`, además del negro del hook, entradas con
     `"modo": "congelar"` sostienen el último cuadro en silencio 0.4–0.6 s después de la frase de una escena (y ~1 s
     al final para que termine el CTA); la escena se ancla para salir cuando vuelve la voz (`hasta` = palabra siguiente
     +300 ms). Las inserta `recortar.mjs`.
   - **Voz pareja** (Lucas, 2026-09-25): después de `recortar.mjs` + `cara.py`, `node scripts/nivelar-voz.mjs
     public/piezas/<slug>` (`--dry` para ver) mide la voz entre cortes y nivela los tramos que se desvían más de 2 dB
     (en `empieza-a-romperse` las 4 primeras tomas subieron +13 a +16 dB). Si se vuelve a correr `recortar.mjs`, repetirlo.
   - **Cara y recorte** (una vez por pieza, después de `recortar.mjs`; **si cambia `video.mp4`, se vuelven a correr**):
     - `python scripts/cara.py public/piezas/<slug>` → `cara.json`: ojos y ancho de cara por cuadro (YuNet,
       `models/yunet/`) + los cortes. ~30 s. Es lo que usa la cámara que calibra (§8) y el recorte de las escenas.
     - `node scripts/turno.mjs python scripts/silueta.py public/piezas/<slug>` → `persona.webm` (el que habla
       sin fondo, VP9 con alfa, Robust Video Matting). ~4 min por minuto de video en CPU.
   - Referencias de estilo: `node scripts/turno.mjs python scripts/analizar-camara.py <video> <salida.json>` mide
     cuadro a cuadro dónde queda la cara y cómo se mueve la cámara (sobre el fondo); `python scripts/curvas-camara.py
     <salida.json> <curvas.png>` lo grafica. Sirve para calibrar contra una referencia y para verificar un render.
   Recursos de `PACKS/`: `node scripts/recursos.mjs usar <id> <slug>` los copia a `public/recursos/`.
   **Los b-rolls del pack son verticales (720x1280 / 1080x1920)**: entran a pantalla completa sin
   recortar. Ver `assets/biblioteca.json` para los ya descriptos; describir cada uno al usarlo.
8. Ver en Studio (`npm start`) y verificar con fotogramas:
   `npx remotion still src/index.ts <slug> out/verif/f<N>.png --frame=<N> --timeout=120000`.
   **Antes de mostrarle nada a Lucas: `npm run verificar -- <slug> [--sin-audio] [--sin-studio] [--sin-stills] [--camara]`**
   (`scripts/verificar.mjs` + `verificar.py` + `verificar-stills.mjs`). Revisa: tipos (`tsc`), que toda ancla de
   `props.json` resuelva en `words.json`, archivos y nombres de SFX, reglas de §7 en el código (SFX sin `trimBefore`,
   `volume` que aguanta cuadros negativos, riser solo en el hook), Studio en Chrome headless a 1677x930 y 900x1800
   (usa el de :3000 o levanta uno en :3123), la mezcla renderizada por Remotion (resta la voz de `video.mp4`; en la
   banda de celular: música presente y pareja, margen bajo la voz 9–15 dB, enmascaramiento, cola en el negro, pico/LUFS,
   SFX audibles), fotogramas clave con un solo bundle → `hoja.jpg`, y con `--camara` un tramo de 10 s contra la
   referencia de §5. Los renders van por `turno.mjs` (la mezcla se reutiliza si es más nueva que `src/` y la pieza).
   Salida en `out/verif/<slug>/informe.md` (+ `.json`); sale con 1 si hay ❌. Un ❌/⚠️ se arregla en la pieza o se le
   explica a Lucas, no se esconde.
9. Render final: `npx remotion render src/index.ts <slug> out/<slug>.mp4 --timeout=120000`.

**Hoja de ruta (Lucas, 2026-09-24)**: "primero replicar el método y luego eso, más que nada para que aceleremos
lo principal que son los recortes, y cuando ya quedó, después vos le metés black screen, silencios artificiales,
todo eso". Orden: (1) método replicable — formato `formatos/ganador-talking-head/`, skill `/formato-ganador`,
`npm run verificar`; (2) integrar su editor propio `D:\Dev\intelligent-cut-studio` (React + Vite + Supabase, línea de
tiempo con bloques y recorte) para que **él recorte más rápido** ahí (sale el mismo `cortes/<slug>-recortes.json`),
con `@remotion/player` como vista previa. Reparto: **Lucas recorta; todo lo demás es automático después del
recorte** (negro + silencio del hook con boom y eco vía `pausas`, cámara, zooms, escenas, tachados, SFX, música,
verificación y export).

Lo que **todavía es manual o falta**: elegir tomas, escribir `props.json`, transcribir por toma (hoy
se transcribe el montaje entero y hay que parchear omisiones), SFX y música, conectar la biblioteca
de `PACKS/` a los overlays, y que el editor proponga zooms/overlays solo.

### 3c. Spec ads (`src/spec/`, 2026-10-16)

Comerciales de producto sin grabación: todo sale de `public/spec/<slug>/spec.json` (escenas, motivo, voz, SFX, plates),
que escribe Claude como director creativo. Composiciones `spec-<slug>` (1920x1080) y `spec-<slug>-9x16`, carpeta
`spec-ads` en Studio. Capas sueltas para DaVinci con `--props='{"capa":"stage|content|bloom"}'`. `npm run spec -- <slug>`
chequea el spec y escribe la cue sheet. Procedimiento completo en `formatos/spec-ad/README.md` y la skill `/spec-ad`.
**Lo real**: escenas, cámara, glow, línea de luz, capas, SFX de la paleta, cue sheet, el kit de componentes de UI
(`src/spec/kit.tsx`: Tile, Numero, Anillo, Boton, Pill, Fila, Campo, BarraRango, LogoCanal, Navegador, BordeLuz, Lienzo)
y las escenas de producto (`tablero`, `ficha`, `canales`, `dictado`, `precio`, `contactos`, `mapa`, `heroe`), más
`luces` (plates de luz en screen como transiciones) y `ambiente` (textura bokeh). **Lo manual todavía**: generar los
plates en Higgsfield (con costo aprobado), grabar la voz y elegir la música; sin eso la pieza sale muda y con el escenario
en lugar del plate. Demo: `demo-agente-turnos` (agente de turnos para consultorios; el chat es de ejemplo).

### 3b. Sistema `reserva` (horizontal, un solo video: IMG_7245) — el más viejo

El sistema `src/reserva/` es maduro pero **buena parte del trabajo pesado es manual**:

1. **Transcripción**: se corre whisper a mano, la salida (`scripts/*.whisper.json`) se convierte a
   `src/reserva/transcript.ts` (array `WORDS`, tiempos en segundos del original) con
   `scripts/build-reserva-transcript.py`. **Manual.**
2. **Silencios/cortes**: el array `CUTS` en `src/reserva/timeline.ts` se arma **a mano**, mirando el
   video y eligiendo qué tramos sacar. No hay jump-cut automático todavía (a diferencia del sistema
   de referencia con ffmpeg `silencedetect`). Si se automatiza, documentar acá los defaults que
   funcionaron y por qué.
3. **Inserts** (`src/reserva/edit.ts`): escenas full/PiP/overlay ancladas a palabras del transcript
   vía el helper `w(i)` (índice de palabra → segundo). Se eligen a mano, uno por uno.
4. **Resolución de tiempos** (`resolve.ts`, `timeline.ts`): esto sí es automático — una vez que
   `CUTS` y `INSERTS` están definidos, los frames de salida se calculan solos.
5. **Render**: `npx remotion render` por composición (ver scripts en `package.json`).

Esto no tiene jump-cut automático ni diccionario de correcciones: eso solo existe en el sistema
vertical (§3a).

## 4. Estilo visual — la base ya codificada

De `src/reserva/theme.ts` y `motion.ts`:

- **Paleta**: `PAPER` (fondos crema/blanco, tinta casi negra) + `ACCENT` (verde de marca, verde
  WhatsApp, ámbar). Editorial, no saturado.
- **Tipografía**: Satoshi para todo, Instrument Serif para acentos editoriales puntuales.
- **Springs con propósito** (`SPRING` en theme.ts): `soft` (entradas grandes, sin rebote),
  `pop` (elementos que llaman la atención, con rebote), `snappy` (UI rápida). Elegir por intención,
  no por default.
- **Ancla de cara** (`FACE`): el PiP y el zoom usan la posición real de la cara en el frame
  (970, 440 en 1920x1080), no el centro del frame.
- **Timing de transición de escena** (`SCENE_TRANSITION`): 12 frames de entrada, 10 de salida.
  Definido una vez, todo el sistema de inserts lo respeta.

## 5. Referencias de estilo externas

### "A lo Jacob" (@Jacobsklug, X) — técnicas observadas en capturas reales, 2026-09-23

- **Texto kinético grande en profundidad**: la palabra ocupa buena parte del frame y el sujeto la
  tapa parcialmente al pasar delante — no es un subtítulo plano, hay capas (sujeto adelante, texto
  atrás). Para reproducir esto en Remotion: el texto se renderiza en una capa `z-index` menor que el
  video de la persona con fondo transparente/chroma, o se usa una máscara.
- **Tachado retórico** ✅ implementado — `src/reserva/components/strike-text.tsx` (`StrikeText`).
  Palabra en pantalla + línea roja diagonal cruzándola, para mostrar "esto ya no aplica". Efecto de
  dos tiempos: aparece la palabra, después entra el tachado (`strikeDelay`, default 14 frames).
  Preview: carpeta `reserva-components` → `StrikeTextPreview` en Remotion Studio.
- **Inserts de motion graphics reales**, no capturas estáticas — mockups de UI animados a pantalla
  completa para explicar un concepto abstracto antes de volver a cámara.
- **Card de título de sección**: texto negro bold gigante superpuesto a una grabación de pantalla,
  con el presentador reducido a PiP chico en una esquina mientras dura esa sección.
- **Barra de capítulos persistente** ✅ implementado — `src/reserva/components/chapter-bar.tsx`
  (`ChapterBar`). Línea de progreso horizontal abajo del frame con las etapas nombradas del video
  y la etapa activa resaltada (blanco bold + punto con glow); las futuras quedan en gris tenue.
  Recibe `chapters: { label, at }[]` y `totalDurationInFrames`. Pensado como overlay sobre
  video/pantalla (texto blanco con sombra), no sobre fondo `PAPER`.
  Preview: carpeta `reserva-components` → `ChapterBarPreview` en Remotion Studio.

### @juanexplica.ia (Instagram) — referencia de subtítulos e íconos, 2026-09-23

Capturas de Lucas: subtítulo bold blanco con sombra, **centrado sobre el pecho** (~52–58 % del alto),
2 líneas apretadas, tamaños distintos por línea ("Si tenés" más grande que "Una empresa"), a veces en
naranja y con el tracking muy cerrado; y **logos/íconos enormes** (WhatsApp, Excel, papel y lápiz)
centrados sobre las manos, sincronizados con la palabra. Lucas: "ese es el patrón".

### Cámara que calibra sobre la cara — reel de nicho iPhone, 2026-09-23

`assets/referencias/camara-que-sigue-la-cara.mp4` (49.5 s, un pibe hablando a cámara con ranking de iPhones).
Medido con `scripts/analizar-camara.py` (`out/verif/ref-camara/`): 11 planos de ~4.5 s; **ojos clavados** al 27 %
del alto (p5–p95: 25.3–28.8 %) y centrados (48–59 %); **cara siempre del mismo tamaño** (41 % del ancho, ±3 %),
la cámara hace zoom out cuando él se acerca y zoom in cuando se aleja; **cada plano entra ~6 % más abierto y 2 %
más abajo y aterriza en ~0.27 s**; temblor residual ~2 px por cuadro (sigue de cerca, no congela). Transiciones
entre planos con destellos de luz (light leaks) y desenfoque de ~4 cuadros; subtítulo chico blanco centrado con
palabras clave en amarillo. La cámara no rota para enderezar la cabeza. Implementado en `CAMARA` (§8).

### Estilo editorial (template AE "Godfather"), 2026-09-24

`assets/referencias/estilo-2026-09-23.mp4`. Lucas: "nada que ver en sí, pero ese estilo tenemos que aprender,
asociado a algún video nuestro". Guía completa (analizada por dimensión, verificada contra los cuadros):
**`assets/referencias/estilo-editorial.md`**. En corto: titular de 2 líneas (bajada serif fina + remate grotesco
pesado igualado en ancho), una frase = un beat de 1.3–2.1 s con un solo protagonista, el texto nunca pisa la
imagen, monocromo + un solo color de acento, todo entra desenfocado frenando y sale nítido acelerando con
continuidad de dirección, objetos físicos con sombra abajo-derecha, caja de selección tipo software de diseño.
Decisiones de Lucas (2026-09-24): acento **verde Nexora** (el logo de WhatsApp como único objeto a color),
fondo **gris frío liso** con cruces de registro (familia propia, no mezclar con las escenas de grilla blanca en
escenas contiguas), remate en **Helvetica Neue Bold**, zoom suave y apertura con riser (reglas de §8), y en este
estilo **las palabras entran sin sonido: SFX solo en los cambios grandes** (excepción a "todo overlay con SFX").

Quedan tres técnicas de Jacob sin implementar (texto kinético en profundidad, inserts de motion graphics,
card de título de sección) — candidatas para cuando se decida construirlas.

### Spec ads de Revolut / Spotify / Amazon ("Opus 5.5 + Katana", Riccardo Bosso), 2026-10-16

Tres reels que mandó Cogne, analizados cuadro por cuadro + audio transcripto + lectura de las timelines de DaVinci que se
ven en pantalla. Escenario oscuro con un glow de marca, UI real flotando, un motivo que viaja por todas las escenas (la línea
de la sonrisa de Amazon), tagline cinético y end card que se apaga en una línea; escenas exportadas en capas STAGE / CONTENT /
BLOOM / BAKED; VO en dos carriles; SFX con su timecode en el nombre. Detalle en `formatos/spec-ad/README.md` §3. Katana
remixa una referencia **sobre la que hay que tener derechos**: esos ads no se usan como referencia.

## 6. Biblioteca de recursos

`assets/biblioteca.json`, operada con `npm run recursos -- <comando>`:

- `escanear` — agrega archivos nuevos de `PACKS/` (no toca los ya catalogados)
- `listar [categoria]`, `buscar <palabra>`, `describir <id> "<texto>"`, `usar <id> <slug>`

**Catálogo perezoso**: las descripciones se completan cuando un recurso se usa por primera vez, no
todas de entrada. Catálogos legibles en `assets/catalogo/` (b-rolls, música, íconos, fuentes, prompt del icon set).
Pack completo extraído el 2026-09-24 con `scripts/extraer-packs.py` (normaliza los nombres a NFC y no pisa nada):
1250 recursos en categorías `broll-cinematico`, `musica`, `sfx-*`, `icono`, `fuente`, `flare`, `overlay`,
`film-burn`, `transicion`, `flecha`, `fondo`, `letra-animada`, `textura`, `marco-8mm`, `degradado`, `objeto-3d`
(.glb), `lut` (.cube, aplicable con ffmpeg `lut3d`) y `bruto` (crudos de otros creadores para practicar). Los presets
de Premiere/CapCut/DaVinci/AE no se catalogan: no sirven en Remotion. **Nunca renombrar ni mover archivos de `PACKS/`** — el catálogo los referencia por
ruta tal cual están.

## 7. Reglas que salieron de fallos

*(vacío — se completa acá cada vez que algo se corrige de forma no obvia, con el fallo que lo
originó. Ver el sistema de referencia en `sistema-edicion-automatica-claude-code.md` para el
formato.)*

| Regla | Fallo que la originó |
|---|---|
| Montar un corte por vez (un solo decodificador 4K abierto) y concatenar los intermedios | 17 decodificadores HEVC 4K juntos con 2.6 GB de RAM libre: `Decode error rate 0.93`. El mismo montaje con 16 había pasado de casualidad |
| Audio intermedio en PCM y AAC una sola vez al final | El sistema de referencia sufrió ~21 ms de desfase por segmento al codificar AAC por trozos |
| Los clips de iPhone son HDR HLG de 10 bits: tone map a SDR BT.709 al montar | Sin conversión la piel salía pálida y apagada (comparado en un fotograma) |
| No elegir una toma solo por los tiempos de Whisper: transcribir el montaje y leerlo entero | La toma elegida de "No trabajamos con plantillas" no decía eso: Whisper había colapsado los tiempos y sobraba un "Tu negocio" suelto |
| La transcripción **exploratoria** de clips crudos largos (para elegir tomas) va con `scripts/explorar-tomas.py` (archivo entero, VAD, **sin** `condition_on_previous_text`, `small`): ~2 min para 8 min de clip. La fina (`transcribir.py`, `large-v3`) se hace después sobre el montaje, que es mucho más corto | `IMG_3524.MOV` (8 min, pieza 2026-09-25) con `transcribir.py` (`medium`, frase por frase, condicionando cada frase con la anterior) tardó 45 min y salió casi todo "..." y "¡SUSCRÍBETE!": una frase degenerada contaminaba a las siguientes |
| Transcripción por frases con `large-v3` (default de `transcribir.py`); `small` solo para explorar | `small` escribió "Númenos" y "Conectaba la agenda". Su "lleve un día" duplicado NO era un invento: era la traba real ("y llega un di… y llega un día") que los modelos grandes de corrido escondían |
| Correr los pipelines con `set -o pipefail`, sin `\| tail` que tape el exit code | La descarga de `large-v3-turbo` falló con WinError 1314 (symlinks sin privilegio en Windows) y el pipe devolvió éxito |
| Modelos de Whisper: usar los ya cacheados (`small`, `medium`); para bajar otro hace falta `local_dir` (sin symlinks) | Mismo WinError 1314 al bajar `large-v3-turbo` al caché de Hugging Face |
| No borrar ni "limpiar" `cortes/*-recortes.json`; si parece de prueba, respaldarlo aparte y preguntar | Borré ese archivo creyendo que era mi prueba; eran clicks de Lucas en la herramienta (los 4 recortes sacaban "y llega un" del hook). Se repuso desde el registro de la sesión y después se respaldó como `.prueba.json` |
| Elegir el `inicioS` de un b-roll mirando al menos 3 fotogramas del clip, no solo el del medio | Varios clips del pack tienen cortes internos: `broll-030` mostraba una ventana de camión con una TV en el segundo 1 en vez del cruce de Shibuya (que está a ~5 s) |
| No usar un b-roll que contradiga lo que se dice | `broll-220` tiene un reloj digital marcando 5:55 y la frase era "las 11 de la noche": se descartó |
| Las trabas se buscan en el AUDIO (energía cada 20 ms: voz / silencio / reinicio), no en el texto: whisper las limpia. Cuando whisper colapsa un tropiezo, se corrige con `tramos` en el `correcciones.json` de la pieza (palabras con los tiempos medidos) | Lucas oyó "y llega un di… y llega un día" y whisper escribió un solo "y llega un día" con "un" de 1.06 s. El detector (`scripts/trabas.mjs`) lo encontró por el silencio dentro de la palabra |
| Al fusionar señales de repetición, el corte sugerido termina antes del reinicio más temprano | La sugerencia unía "y llega" + "llega un" y se comía el "y" del segundo intento |
| **Audio sin huecos**: después de `concat` va `aresample=async=1:first_pts=0`, y toda decodificación para análisis (whisper, trabas, recortar) usa `-af aresample=async=1` | El `concat` con video dejaba saltos de ~16 ms en los timestamps del audio en cada unión del jumpcut (9 en total, 0.13 s). El reproductor los respeta pero decodificar a PCM los pega: whisper, la onda del recortador y los análisis quedaban corridos hasta 0.13 s. Lucas marcó sus cortes sobre esa onda corrida y varios bordes se comían palabras ("noche", "ese", "Un", "Medir", "El") |
| Para diagnosticar desfases, comparar la decodificación completa contra `-ss` por correlación, y contar muestras por cuadro vs. pts (`ffprobe -show_entries frame=pts_time,nb_samples`); los paquetes pueden no mostrar el hueco | El análisis por paquetes decía "0 huecos" y había 9 |
| `corregir.mjs`: si el reemplazo tiene la misma cantidad de palabras, cada una conserva su tiempo | "que se perdió" → "qué se perdió" repartía el tramo en partes iguales y "perdió" quedaba en una zona sin voz: el recorte la sacaba del subtítulo |
| `recortar.mjs` decide si una palabra se fue mirando su **isla de voz más grande** dentro del tramo de whisper, no el tramo entero | El tramo de "estés" llegaba hasta el arranque del "dale" y la palabra se borraba del subtítulo aunque seguía sonando |
| El recortador lleva **control de versión**: una página abierta con datos viejos no puede guardar (409, "recargá") | Al corregir el archivo de cortes del lado del servidor, la página vieja de Lucas lo iba a pisar; también tiraba el servidor pidiendo bytes de un video que ya había cambiado de tamaño (ahora responde 416) |
| Todo video que genera el pipeline sale a **30 fps constantes** (`fps=30` después del concat), **keyframe cada 30 frames y sin B-frames** (`-g 30 -bf 0`) | El concat del jumpcut perdió un fotograma (29.77 s) y dejó keyframes cada 3–7 s con B-frames: el compositor de Remotion tiró "No frame found at position" al renderizar el PiP, y el Studio reproduce peor |
| `calculateMetadata` lee `props.json`/`words.json` con `cache: "no-store"` | El Studio usó un `props.json` cacheado del esquema viejo y tiró `Cannot read properties of undefined (reading 'offsetMs')` |
| Trabajos pesados (render de Remotion, whisper) siempre con `node scripts/turno.mjs <comando>`: corren de a uno | La PC queda con ~1 GB de RAM libre (Studio + Chrome + Meet); dos renders a la vez la ahogan |
| Sombras desenfocadas en SVG: `filterUnits="userSpaceOnUse"` con región grande y lienzo más grande que el cuadro | La región default del filtro recortaba el blur y dejaba bordes rectos visibles al rotar |
| `-/filter_complex <archivo>` en vez de `-filter_complex_script` | ffmpeg 8.1 marca `-filter_complex_script` como deprecado |
| Leer valores de `ffprobe` con `-of default=nw=1:nk=1`, no con `csv=p=0` | `csv` devuelve `arib-std-b67,` con coma final: la comparación exacta fallaba y ningún clip se pasaba a SDR. Se notó porque el log no decía "(HDR -> SDR)": los scripts deben loguear qué decidieron |
| Whisper se come palabras en los cortes duros entre tomas y cambia de errores en cada corrida: leer la transcripción entera y parchear con `inserciones` (tiempos verificados en una ventana corta) | Faltaban "negocio" (54.4 s) y "estructura" (27.4 s) aunque estaban en el audio |
| Los stills/renders con `OffthreadVideo` llevan `--timeout=120000` | El primer fotograma tardó más de 28 s y `delayRender` expiró |
| Master: si con la ganancia fija los picos pasan el techo, `master.mjs` pone un **limitador antes de loudnorm** (techo = TP objetivo − 1.5 dB − ganancia) y re-mide, así loudnorm queda **lineal**; AAC a **256k** | Sin limitador, la v4 salió en modo dinámico (loudnorm comprimiendo en vivo: bombea y rompe lo parejo de la música) con pico −1.0. Con limitador y 0.5–0.8 dB de margen el AAC hizo rebotar los picos limitados hasta 0.0 dBTP (medido: el WAV daba −1.7). Con 1.5 dB y 256k: lineal, −14.0 LUFS, −2.1 dBTP |
| Render de la pieza: `--concurrency=1 --offthreadvideo-cache-size-in-bytes=300000000` (y por `turno.mjs`) | Con `--concurrency=2` Chrome se quedó sin memoria (`ERR_INSUFFICIENT_RESOURCES`): la pieza abre `video.mp4` y `persona.webm` con alfa a la vez y la PC tiene ~2 GB libres con Studio y el navegador abiertos |
| Separar íconos de una lámina: un modelo de rembg por vez, y unir `u2net` + `isnet` (`scripts/recortar-iconos.py`) | Los dos modelos cargados juntos tiraron `ArrayMemoryError`. Solo `u2net` se comía las formas blancas sobre gris (el sobre de "privado" desapareció, el avión de "publicación" quedó roto); solo `isnet` dejaba interiores semitransparentes (el papel del presupuesto) |
| Los workflows largos pueden morir sin avisar: si uno no notifica, mirar su `journal.jsonl` (agentes iniciados vs terminados y la hora del último archivo) y retomarlo con `resumeFromRunId`, **revisando antes si su contexto quedó viejo** | El catálogo de b-rolls y el diseño sonoro se frenaron a las 23:05 sin notificar; se notó casi dos horas después. El de sonido no se retomó tal cual: su última etapa iba a devolver una lista de SFX que pisaba la música, el eco y los tachados agregados mientras tanto |
| Después de tocar audio o la composición, abrir Studio con Playwright (`localhost:3000/<slug>`) y mirar que no haya error **antes** de pedirle a Lucas que recargue. Los audios que genera el pipeline se escriben en PCM de 16 bits (el más compatible) | Lucas tuvo que mandar el mismo error de Studio tres veces: se "arregló" dos veces sin reproducirlo (primero se culpó a los SFX, después al WAV de coma flotante de la cola del "no"). La causa real era `trimBefore` (fila de abajo) |
| **SFX cortos: sin `trimBefore`** (la `Sequence` arranca en un cuadro negativo); **audios largos (música): con `trimBefore`**. El `f` de una función de `volume` cuenta desde que el audio **empieza a sonar en la pieza**, no desde el comienzo de su `Sequence`: con arranque negativo hay que sumarle `-start` (así está en `sfx.tsx`). Verificar Studio con Playwright en una ventana **angosta y alta** (ej. 900x1800) y en la de Lucas (1677x930) | La música con arranque negativo quedó muda 8 s de más (medido: −240 dB entre 4 y 9 s) porque su volumen usaba `f` como si contara desde la Sequence. Lucas: "arranca mucho después del black screen y ni se escucha" |
| (misma regla, origen) Con `trimBefore`, Remotion descarta `showInTimeline={false}` | Con `trimBefore` (aunque valga 0) Remotion envuelve el audio en su propia Sequence y descarta el `showInTimeline={false}`: los SFX recortados aparecían en la línea de tiempo con comienzo negativo y, en la ventana de Lucas, su onda medía ≤ 0 px y Studio se caía ("createImageData: source width is zero"). La primera verificación con Playwright usó una ventana donde esas filas no se veían y dio falso OK |
| Una función de `volume` en `<Audio>` tiene que aguantar cuadros negativos (acotar todo índice a un array) | La música con `trimBefore` de 249 cuadros hizo que Studio pidiera el volumen del cuadro −249: el índice del ducking salió del array y Studio tiró "returned NaN for frame -249". El render no lo mostró |
| La mezcla se verifica sobre el audio **renderizado por Remotion**, no sobre una simulación propia | La primera pasada de diseño sonoro midió con un mezclador en Python que suponía cambios que no estaban en el código: la mezcla verificada no era la que se iba a renderizar |
| `cara.py`: corte = **pico de un cuadro** en la diferencia de imagen (> 3× la mediana de sus vecinos) o salto de cara brusco **contra el movimiento local**; que la cara aparezca o desaparezca no es corte; detecciones sueltas lejos de sus vecinas se descartan. `cara.ts` rellena los cuadros sin cara dentro de un plano (interpola o sostiene) | En `cuenta-juntos` (se mueve mucho, cámara en mano que panea al pizarrón) salieron 29 "cortes" para 6 reales, un falso positivo de YuNet en y=1728 hizo que la cámara mostrara el pecho al final del hook, y sin cara la cámara volvía al centro y mostraba la pared. Verificado contra `estructura-nexora`: mismos cortes salvo uno falso |
| El zoom del hook se **sostiene dentro del negro** (tramo `suave` 1.9→1.9 desde el fin de la última palabra hasta que vuelve la imagen) | En `cuenta-juntos` el zoom terminaba en el fin de "juntos" y el cuadro siguiente, todavía con imagen, salía a 1.0: Lucas lo vio en Studio ("pasa de esto a esto super brusco"). El chequeo lo daba "tapado (corte)" porque el negro empezaba 1 cuadro después |
| El negro del hook (`pausas`) va **en el corte de toma** de `video-jc.mp4` (ffmpeg `select=gt(scene,0.1)`), no en el fin de la última palabra: `offsetMs` = corte − fin de la palabra − 10 ms | En `cuenta-juntos` el negro entraba en el fin de "juntos" (2.33 s) y la toma cambiaba en 2.40 s: después del negro quedaba 1 cuadro de la toma anterior (él sentado y girado) antes de la toma nueva. Lucas: "sigue haciendo brusco" |
| Sin cara detectada, la cámara **sostiene la última cara** (o la primera que viene), también en planos enteros sin cara (`cara.ts`) | Studio mostró un cuadro de imagen donde `cara.py` ya veía el negro (cuadro 71 de `cuenta-juntos`): sin cara, el encuadre caía al centro con el zoom del retrato y mostraba la pared. Lucas: "sigue haciendo brusco" |
| Si `verificar` da "900x1800: la composición no terminó de cargar en 60 s" y hay un objeto 3D en los primeros cuadros, medir la carga aparte (una ventana, 40 s, errores de consola) antes de darlo por roto | En `cuenta-juntos` (billetes 3D en el cuadro 0) el chequeo falló dos veces: la primera ventana seguía cargando el `.glb` de 17 MB con WebGL por software mientras abría la segunda. Medido aparte: 2–4 s por ventana y 0 errores en 40 s |
| Objetos 3D (`.glb`) con `useLoader` de R3F dentro de `ThreeCanvas` (Suspense), nunca con carga propia en `useEffect` + `setState` | Al renderizar, `ThreeCanvas` solo dibuja cuando cambia el cuadro: con la carga propia el modelo llegaba después y el fotograma salía vacío (con `angle` y con `swangle`). El entorno (`RoomEnvironment`) se arma antes del primer dibujo, si no los materiales metálicos salen negros |
| Los stills/renders de Remotion se escriben relativos al cwd del shell, que puede haber quedado en otra carpeta: usar rutas absolutas en `out/` | Seis stills de verificación de la v4 de PropMatch aparecieron en `public/spec/.../vo-arg/out/` porque el shell había quedado en esa carpeta |
| `generate_audio_batch` de Higgsfield: de a 3–4 trabajos; 6 a la vez hizo fallar 3 ("failed" sin motivo) | Voces de la v1 de PropMatch |
| Los presets de voz de Higgsfield cuyo preview está en inglés hablan un español con acento marcado: clonar siempre desde una muestra en español (`audio_references`) | Voz "Amanda" en la v2 de PropMatch: "es una poronga" |
| Para detectar caras usar YuNet (`models/yunet/`, OpenCV), no el cascade LBP de skimage | El LBP no encontró la cara con anteojos de la referencia en varios cuadros y dio falsos positivos; YuNet la encontró en 1473 de 1484 con confianza ~0.94 |
| Todo texto de una línea con `textOverflow: ellipsis` se verifica con un **still a resolución completa** en 16:9 **y** 9:16 antes del render final (la hoja de contactos lo tapa): si el ancho de la columna de texto queda por debajo del nombre más largo, ensanchar la tarjeta, no achicar la fuente | En la v4 de PropMatch, las tarjetas de canales (350 px, columna de texto ≈152 px) recortaban "Mercado Li…" y "App PropM…" en 16:9; en la hoja de contactos no se notaba y en 9:16 (tarjetas de 470 px) nunca pasó. Se ensancharon a 390 px (ficha 280→260) |

## 8. Dirección creativa de Lucas

Lucas hace de **director creativo**: mira la pieza en Remotion Studio y va marcando qué le gusta y
qué no. **Cada nota se anota acá en el momento en que la da, sin que lo pida**, con fecha. Es lo que
hace que el editor "aprenda" su estilo entre sesiones: antes de editar una pieza nueva, leer esta
sección entera y aplicarla.

Dos cajones:
- **Reglas generales**: valen para todas las piezas. Si además cambian el estilo base, reflejarlas
  en §4.
- **Notas por pieza**: solo para ese video.

Formato de cada entrada: `- (AAAA-MM-DD) regla o nota — contexto/porqué si Lucas lo dio`. Citar
las palabras de Lucas cuando sea posible: el tono importa. Si una nota nueva contradice una vieja,
se corrige la vieja (no se acumulan las dos).

### Reglas generales

- (2026-09-23) **Overlays SFX**: el tachado con su efecto de sonido gustó ("tachaste y le pusiste un
  buen efecto de sonido"). Todo overlay entra con un SFX corto, como el `pop` del tachado.
- (2026-09-23) **Efectos de sonido para ambientación**: "necesito que uses efectos de sonido para
  ambientación". El video no puede ir solo con voz: hay que acompañarlo con SFX de `PACKS/SOUND EFFECTS`
  (whooshes, hits, clicks, cine), sutiles y anclados a lo que pasa en pantalla (overlays, énfasis,
  transiciones), no a un ritmo fijo. Pendiente confirmar con Lucas si además quiere una capa de
  ambiente continua bajo la voz.
- (2026-09-23) **El SFX sigue la estructura de la frase, no un tiempo suelto**: "tu negocio crece pero tu
  estructura no, y ahí cortás el riser, sino se siente desconectado completamente". El riser del hook
  **sube durante la frase del hook y se corta en seco exactamente al terminar su última palabra** (en
  `estructura-nexora`: pico y corte en el fin de "no", `fin: true` + `corte`). Nunca dejar que un efecto
  remate en la frase siguiente. Antes de ubicar cualquier SFX, preguntarse: ¿qué frase acompaña, dónde
  termina esa idea? El golpe va en el cierre de la idea. Mezcla: el riser va por debajo de la voz
  (medido: +0 a +6 dB sobre la voz en los huecos, nunca encima de las palabras).
- (2026-09-23) **Mapa de recursos, nunca adivinar**: "tenés que mapear los b-rolls, dejar un md descriptivo en
  sounds, en b-rolls, en todo, en íconos, en todo, pa' saber y no adivinar dónde poner cada uno y no inventar
  bullshit". Los catálogos viven en `assets/catalogo/` (b-rolls, sonidos, íconos, fuentes): qué es cada
  recurso, cómo se ve/suena, cortes internos, desde qué segundo sirve, para qué conceptos sirve y qué evitar.
  **Antes de elegir un recurso, leer el catálogo; si un recurso no está descripto, describirlo mirándolo
  (varios cuadros) o escuchándolo antes de usarlo.**
- (2026-09-24) **Música instrumental de fondo después del negro**: "falta música instrumental de fondo post
  blackscreen". El hook va con riser + negro + boom; **cuando vuelve la imagen entra una cama instrumental** que
  sigue hasta el final, por debajo de la voz (la referencia de estilo también mete "una cama grave desde que
  termina el hook"). Música de `PACKS/MÚSICA DE FONDO/` (pack completo descargado el 2026-09-24), elegida con
  `assets/catalogo/musica.md` (mediciones reales: BPM, dinámica, brillo, cuándo arranca; derechos por nombre).
  Criterio: para piezas que sube Nexora, **temas libres o de biblioteca**, no comerciales (Instagram/TikTok pueden
  silenciar el audio); cama **pareja** (dinámica < 8 dB) para que no compita con la voz; entra en un **tiempo
  fuerte** justo cuando vuelve la imagen; **ducking** automático con las palabras (`src/pieza/musica.tsx`). En
  `estructura-nexora`: primero ANBR – Quantum desde 8.31 s; Lucas pidió probar **METAMORPHOSIS** (2026-09-24,
  "probá esa música de fondo a ver qué tal"): phonk comercial (riesgo de mute avisado), con el drop de 11.05 s en la
  vuelta de la imagen; su segundo drop (54.94 s) cae solo en el corte de "instalamos la estructura" (47.04 s de la
  pieza). Ganancia compensada ×0.41 (sus partes plenas son 8.8 dB más fuertes que Quantum). Si un tema tiene drops,
  **alinear los drops con los cortes clave**, no solo el comienzo. Nivel: se mide en la banda que se oye en un
  celular (200 Hz–4 kHz), no por energía total — el phonk tiene casi todo en el sub (808) y, igualado por energía,
  "ni se escucha". **La cama tiene que ser uniforme**: "se escucha fuerte al principio y después lo normalizás y
  luego lo subís... la música se tiene que escuchar como en el segundo 16", "en el 10 y el 30 ya está más fuerte,
  tiene que ser uniforme, simétrico". Un tema con drops y breaks (22 dB de dinámica) se usa **nivelado**:
  `python scripts/nivelar-musica.py <tema> <inicio_s> <largo_s> <salida.m4a> <referencia_s>` lo lleva al volumen del
  momento que Lucas marca (en la banda de celular, curva suave de 1.5 s, topes +12/−24 dB): quedó ±0.5 dB. Y el
  ducking bajo la voz es suave (`bajoVoz` 0.7 = −3 dB): con −7.5 dB la música subía y bajaba con cada frase. Queda
  ~12 dB debajo de la voz mientras habla.
- (2026-09-25) **Primero la pieza entera, después sus correcciones**: "transcribilo, entendé de qué va y devolveme
  la pieza final para ver qué onda y te voy corrigiendo". Cuando Lucas lo pide así, el editor **elige las tomas y
  hace el recorte de trabas él mismo** con el criterio aprendido de Lucas (ver "Criterio de corte" abajo; el archivo
  de recortes se marca como hecho por el editor), arma todo el formato y entrega la pieza terminada. Lucas corrige
  sobre la pieza, no por pasos.
- (2026-09-24) **"ganador" = elegido por Lucas**: renombra el archivo en `PACKS/` agregándole "ganador" ("le cambié
  el nombre al audio, le puse 'ganador' para identificarlo"). Ganadores hasta ahora: `METAMORPHOSIS ganador.mp3`
  (musica-056) y `Echo Sax End ganador.mp3` (musica-022). `npm run recursos -- escanear` detecta el renombre
  (misma categoría, extensión y duración) y conserva id, descripción y usos; el catálogo los marca con ⭐. Al
  elegir recursos, **preferir los ganadores**.
- (2026-09-24) **Nada de sonidos tipo riser en los zooms**: "después de la black screen se vuelve a reproducir
  varias veces el rise, o algún especie de rise, pero de manera rara". La pasada v2 de sonido le puso a cada zoom
  un riser que sube y corta (y uno al revés en cada zoom out, a veces los dos en el mismo cuadro). **El riser es
  del hook y de nada más.** Los zooms suaves van sin sonido o, si hace falta, con un whoosh corto de aire; el zoom
  rápido ("ese alguien") puede llevar el látigo (`zoom-punch`).
- (2026-09-23) **Más SFX, coherentes**: "los efectos de sonido la están rompiendo, tenemos que agregar más de
  forma coherente, ya sea que descargue más o que usemos lo que tenemos". **"La están rompiendo" = están
  buenísimos** (lunfardo): quiere MÁS SFX, no menos; una primera pasada lo leyó al revés y bajó los volúmenes.
  Tienen que oírse en el parlante de un celular (contenido > 200 Hz; el sub solo como capa). El diseño sonoro es parte central
  del estilo: cada evento visual (transición, entrada de tarjeta, zoom, tachado, tipeo, remate) lleva su sonido,
  con una familia coherente por tipo de evento (no un pop distinto cada vez) y siempre por debajo de la voz.
- (2026-09-23) **Golpe negro al cerrar el hook**: "cuando termina el hook que dice 'no', black screen y
  sonido grave, que tenga delay/reverb pa' que se extienda con el black screen, y ahí boom tipo 'Boom - Earth
  Core Ripper'". Patrón: riser que sube → corte en seco en la última palabra del hook → **pantalla negra**
  (un respiro, sin voz) con un **boom grave** (`PACKS/SOUND EFFECTS/SFX PACK 2/Cine SFX/Boom - Earth Core
  Ripper.wav`) procesado con delay/reverb para que la cola se estire sobre el negro → vuelve la imagen con
  la frase siguiente. Y la **voz también**: "ese 'no' corta muy cortito, le agregaría reverb hasta que termina
  la blackscreen" (2026-09-23), y al escucharlo: "ahí va, ese 'no' dale un toque de delay, eco, que siga en la
  blackscreen un toque más". La última palabra del hook lleva su propia cola (solo la señal húmeda, la voz seca
  no se toca): **eco que repite la palabra cada ~230 ms, cada vez más bajo y más opaco, + reverb**, y que llegue
  hasta el final del negro sin pisar la frase siguiente:
  `python scripts/cola-reverb.py <video.mp4> <inicio_palabra> <fin_palabra> <salida.wav> <rt60> <largo> <eco_ms> <ecos>`
  y en `props.json` un `sfx` con `archivo` anclado a la palabra (en `estructura-nexora`: `1.3 1.28 230 4` →
  `no-eco.wav`; el último eco cae a ~3.0 s y la cola se apaga en 3.17 s, cuando vuelve la imagen).
- (2026-09-23) **Zooms grandes, de recorrido largo, con "cámara" que sigue la cara** — el motion es dopamina.
  Lucas, en orden: "cuando dice 'tu estructura' un zoom in obvio; intentalos más smooth... que se mueva la
  'cámara' siguiendo la mirada, eso re hookea por dopamina motion"; "los zoom in o zoom out son muy cortos,
  yo quiero que sea más zoom"; "cuando está por decir 'siempre', que haga zoom tipo retrato full face"; y
  sobre un zoom out que volvía en seco: "que el zoom sea mucho más de entrada, que venga desde la face corte
  retrato, así el recorrido es más largo tanto de un zoom in como de un zoom out, porque da más dopamina el
  movimiento". Reglas:
  - **Rango**: plano abierto (1.0) ↔ **retrato a cara completa (~1.9–2.05)**. Un +6 % o un +20 % no se ve:
    es "muy corto".
  - **Nunca volver en seco**: cada zoom in termina en retrato y el zoom out siguiente **sale desde el
    retrato** con `curva: "salida"` (ease-out cúbico, ~0.6 s), así se ve todo el recorrido. Los `suave` se
    encadenan (fin de uno = inicio del otro, misma escala); un salto de escala solo vale justo en un jump cut.
  - **Dónde**: zoom in hasta retrato en la palabra que remata la idea ("no" del hook, "siempre", "nada",
    "plantillas", "necesita"); zoom out largo en el corte siguiente o cuando sale una escena.
  - **Cámara que calibra TODO el tiempo** (no solo con zoom), constantes en `CAMARA` de `pieza-composition.tsx`:
    con `cara.json` (de `scripts/cara.py`), cada cuadro la escala base lleva la cara a un tamaño fijo (0.26 del
    ancho; la escala sale del ancho real de la cara, así compensa cuando se acerca o se aleja) y los ojos a un
    punto fijo (centro, 30 % del alto), siguiendo la cara con poca inercia (±5 cuadros, ±15 para el tamaño, sin
    cruzar cortes). Cada plano nuevo entra 7 % más abierto y 2 % más abajo y aterriza en 10 cuadros. Los zooms de
    `props.json` se multiplican sobre esa base (1 = encuadre base, ~2 = retrato). Verificado en un render
    (2026-09-23): ojos x 0.50 ±0.01, y ≈0.30 (baja a 0.25 donde la toma no deja margen), temblor 1.7 px/cuadro
    (referencia 1.9).
  - **Referencia de cámara (2026-09-23)**: `assets/referencias/camara-que-sigue-la-cara.mp4` (reel de nicho
    iPhone, 49.5 s). Lucas: "fijate esa forma de calibrar constantemente en base al movimiento de la cara, eso
    tenemos que hacer, genera una dopamina tipo re contra hookea, te re retiene; si llegamos a replicarlo,
    golazo". La cámara virtual sigue la cara **todo el tiempo** (no solo durante los zooms): los ojos quedan
    clavados en el mismo lugar de la pantalla aunque el que habla se mueva. Medición cuadro a cuadro con
    `scripts/analizar-camara.py` (YuNet + movimiento del fondo): ver los números en §5.
- (2026-09-23) **El riser es CLAVE para el inicio**: "Copia de Riser" (`sfx-cine-017`, `PACKS/SOUND
  EFFECTS/SFX PACK 2/Cine SFX`, 5.02 s) "es CLAVE para inicio, darle suspenso". Todo video abre con un
  riser que sube durante la frase del hook y se corta al terminarla (ver la nota de arriba). Lucas pidió además explorar otros del pack ("fijate otras pero este
  es buen ejemplo"): candidatos en la misma carpeta: `Riser Intense`, `Sharp Riser`, drones
  (`ETHERAL DRONE`, `Evolving Sci-fi Drone`), `WIND AMBIENT`, `BASS DROP`, `Boom IMPACT`.
- (2026-09-23) **No tachar palabras que ya dice el subtítulo: tachar íconos**: "esta parte queda rara, en vez
  de tachar palabras que se repiten, como ves ahí, podemos tachar íconos de bot y de videos". El tachado de
  texto duplicaba el subtítulo ("ni videos sueltos" arriba, "bots videos sueltos" tachado abajo). Regla: el
  tachado retórico va sobre **la imagen del concepto** (ícono premium/logo), no sobre la palabra, que ya está
  en el subtítulo. Implementado: `strike` con `imagen` (íconos de 380 px al 70 % del alto, línea roja que cruza
  por el medio, ícono desaturado después del trazo). En `estructura-nexora`: `bot.png` y `videos.png`.
- (2026-09-23) **El que habla recortado sin fondo encima de las escenas, no en un círculo**: "no me cierra el
  temita del círculo, podés dejarlo al chabón superpuesto y su background tipo transparent que se superponga
  a eso que hiciste?" y "sacándole el fondo como hace CapCut con remove background, pa' superponerlo tanto en
  video como en imagen, en este caso el motion video". `scripts/silueta.py` saca el fondo (Robust Video
  Matting) → `persona.webm` con alfa; las escenas lo muestran como recorte encima del motion graphic. Plan B
  de Lucas si no quedaba bien: sin PiP, que aparezca cuando termina la animación. **Reemplazada el 2026-09-25**
  (ver "Escenas solas, rotando blanco y negro"): desde `cuenta-juntos` las escenas van con `pip: "ninguno"`.
- (2026-09-23) **Motion graphics de contexto, no exagerados**: faltan superposiciones gráficas que
  *contextualicen* lo que se dice (no decoración), sutiles. Un video no puede tener solo el tachado.
- (2026-09-23) **Subtítulos SIN background** ("tiene que ir sin background"). La barra oscura
  semitransparente estaba mal (era Satoshi 700, 66 px, `rgba(10,10,10,.62)`, radio 22). Sin caja hay
  que cuidar la legibilidad con sombra, y **las palabras no dichas no se muestran atenuadas** (en gris
  sobre pared clara no se leen): cada palabra aparece cuando se dice.
- (2026-09-23) **Patrón de subtítulos = @juanexplica.ia** (capturas que mandó Lucas): "así deberías
  hacer los subtítulos para mí, porque sino muy chiquito me parece, onda es válido el tamaño no mal
  pero también variar sizes y luego fijate **centrado, ese es el patrón**". Es decir: **grandes,
  centrados en pantalla (sobre el pecho, ~54 % del alto, no abajo), 2 líneas, apretados, blanco con
  sombra, y con tamaños que varían** dentro del mismo subtítulo (palabra clave grande, palabras
  funcionales chicas). El tamaño chico solo es válido como variación, no como base.
- (2026-09-23) **Usar los b-rolls de `PACKS/`**: "tenés banda de brolls y no usás ninguno bro". Hay 332
  clips cinematográficos: tienen que aparecer en la edición (cutaways sobre la voz), no quedarse sin
  usar. Al usar uno, describirlo en la biblioteca.
- (2026-09-23) **Íconos/logos grandes como motion graphic de contexto** (visto en juanexplica.ia):
  cuando dice "mensajes de WhatsApp" entra el logo de WhatsApp grande, centrado sobre las manos;
  "Excel" → logo de Excel; "papel y lápiz" → ícono. Entran con pop y con su sonido ("sound effects
  moments"): cada aparición lleva un SFX.
- (2026-09-23) **Trabas del que habla**: "hay partes donde se traba... los subtítulos están bien, pero hay
  partes que se traba que no las contempla". Whisper limpia los tropiezos (repeticiones, arranques en
  falso) y el subtítulo muestra el texto prolijo mientras el audio tropieza. Lucas quiere **verlos y
  recortarlos él a mano** ("para terminar de corregir y, a partir de esa corrección, ya te quede
  pulido para que le pongas las animaciones que faltan"). Orden de trabajo: **primero Lucas recorta,
  después se animan**. La transcripción tiene que ser lo más literal posible (con muletillas y
  repeticiones) para que las trabas se vean en el recortador.
- (2026-09-23) **Escenas estilo Trendspot + pre-call (reserva)**: "falta un poco más de lo que tiene el
  video de Trendspot: tipo un template white con background white, con grid pattern, con un poquito de
  shadow sutil, beautiful, para que no quede full white el background, velado, y que se vaya como
  desplazando. Que entren los íconos transicionándose o desplazándose". Y: "estaba bueno cuando hablás
  de algo que quizás podés maquetar como un dashboard, como lo hiciste en el video de la pre-call".
  Regla: cuando el guion describe algo mostrable (un panel, un chat, un proceso, una lista de
  pendientes), va una **escena** a pantalla completa con los elementos entrando con movimiento. Los b-rolls
  e íconos sueltos siguen, pero no alcanzan solos. (La grilla y el PiP de esta nota se sacaron el 2026-09-25:
  ver la nota siguiente.)
- (2026-09-25) **Escenas solas, rotando blanco y negro, sin grilla**: "ya dejaría de superponer al chabón, dejaría
  el motion solo pero tenés que aprenderlo a hacerlo piola, para mí ir rotando de white screen a black screen +
  texts + icons si es que aplica. Y eliminá la grilla, o sea dejalo con un poco de shadow y eso inner pero nada
  eso". Reglas: (1) las escenas **no llevan al que habla recortado** (`pip: "ninguno"`); (2) las escenas **alternan
  fondo blanco y fondo negro** a lo largo de la pieza (`tema`), con texto (serif + sans) e íconos premium cuando
  aplica; (3) el fondo es **liso**: solo sombra suave y viñeta interior, **sin grilla ni cruces**. "Hacerlo piola"
  = la escena tiene que sostenerse sola sin la cara: composición centrada, texto grande, movimiento cuidado.
- (2026-09-25) **Íconos: no el estilo Airbnb; objetos 3D del pack**: "y los íconos y eso de objetos 3D usá otros del
  pack, no me convence tanto el airbnb style que te mandé". Los íconos de `PACKS/ICONOS/` (`icono-001`–`016`, los
  generados con su imagen de estilo) quedan en pausa. En su lugar: **objetos 3D de `PACKS/OBJETOS 3D/`** (`.glb`:
  billetera, paca de billetes, lupa, cofre, archivos, diamante...) renderizados con `src/pieza/objeto-3d.tsx`
  (three.js, giran despacio), o logos oficiales (`LogoApp`). Si no hay objeto que aplique, sin ícono.
- (2026-09-26) **Tomas a cámara, no leyendo**: "pusiste partes donde está mirando la pantalla y leyendo, pero no
  necesariamente mirando a la cámara y hablándolo fluido". En `empieza-a-romperse` el editor eligió por texto
  (última toma completa) y varias eran lecturas del guion en la pantalla. Criterio: la toma buena es la que dice la
  frase **mirando a cámara y fluida**, aunque no sea la última; una lectura (mirada fuera de cámara, ritmo de
  lectura) se descarta aunque esté completa. Lucas quiere ajustar él las tomas a mano: "tenemos que armar la tool
  para recorte, ajuste manual".
- (2026-09-25) **Voz pareja entre tomas**: "al principio no se pone bien el micro, entonces tenés que ajustarle los
  decibeles a la voz al principio". En `empieza-a-romperse` las 4 primeras tomas estaban 13 dB más bajas (−36 contra
  −23 dB de mediana): el micro se acomodó recién después del primer minuto de grabación. Medir el nivel de voz por
  toma y nivelar las que se desvíen antes de armar la mezcla.
- (2026-09-25) **Un toque menos rápido, que el motion se aprecie**: "tenés que hacer un toque menos rápido o algo
  para que se pueda apreciar todo mejor el motion y esas cosas". El ritmo casi sin aire del corte (0.02–0.12 s) vale
  para la cara; donde hay escena o motion, dar **respiros**: sostener la escena unos 0.4–0.6 s después de que termina
  su frase, antes de que vuelva la voz.
- (2026-09-25) **Rotar b-rolls**: "y rotá brolls papá". Más b-rolls a lo largo de la pieza, alternando con cara y
  escenas (cara → b-roll → escena → cara...), no uno solo en el hook. **Y no repetir los de piezas anteriores**:
  "no rotaste el broll del inicio del video anterior" (`cuenta-juntos` abría con el mismo `broll-201` que
  `estructura-nexora`, ya publicado). Antes de elegir, mirar qué b-rolls usaron las piezas anteriores (`usos` en
  `assets/biblioteca.json` o los `props.json`) y no repetirlos.
- (2026-09-23) **Íconos custom/premium, NUNCA los nativos** (lucide dibujados a mano): "estaría bueno
  ponerle íconos custom y no esos nativos... cuando hables de WhatsApp, te pases un ícono de WhatsApp HD
  y no uses ese que hiciste a mano, y así con todo". Lucas va a ir sumando íconos premium a
  `PACKS/ICONOS/`: usar esos. Si falta uno: logo oficial de la marca en HD (SVG vectorial) o no poner
  ícono; nunca armarlo con lucide. Pedirle a Lucas los que falten, con lista concreta.
  Cómo se consiguen (2026-09-23, "armame la prompt para que arme un icon set, yo le adjunto el style y vos le
  describís cada uno"): el editor escribe el prompt (inglés, bloque STYLE fijo + un SUBJECT por ícono) y el
  nombre de archivo de cada uno; Lucas lo genera con su imagen de estilo y los deja en `PACKS/ICONOS/`. Prompt
  vigente: `assets/catalogo/icon-set-prompt.md`. Si falta un ícono nuevo, sumarle una fila ahí y pedírselo.
- (2026-09-23) **Criterio de corte de Lucas** (aprendido de sus 21 recortes en `estructura-nexora`,
  `cortes/estructura-nexora-recortes.json`, medido sobre la energía del audio):
  - **Ritmo casi sin aire**: entre frases deja **0.02–0.12 s** de pausa (mediana ~0.06 s). El jumpcut viejo
    (−40 dB / 0.6 s / margen 0.2 s) dejaba ~0.4 s y Lucas los recortó uno por uno. Nuevo default de
    `jumpcut.mjs`: mínimo 0.3 s y margen 0.06 s (a validar en la próxima pieza).
  - **Tropiezo** ("se traba y luego vuelve a repetir"): afuera el intento fallido **y** la pausa que le sigue.
  - **Voces fuera de cámara / indicaciones de rodaje** ("dale", "graba"): siempre afuera.
  - **Frases leídas** ("está leyendo", "lee la pantalla"): afuera aunque estén en el guion. Prefiere
    naturalidad a completitud. En esta pieza se fueron "Números, no sensaciones" y "Cada sistema se arma
    sobre cómo funciona tu negocio".
  - No usa los chips de motivo (todo quedó "silencio"): el porqué está en la **nota**. Cuando no hay nota,
    preguntarle.
  - Sus bordes a veces se comen el principio o el final de una palabra vecina (arrastrar sobre la onda es
    impreciso): `recortar.mjs` ahora avisa los bordes con voz a los dos lados; revisarlos con él.
- (2026-09-23) **Palabras clave acentuadas**: "tiene que haber una forma de acentuar palabras clave".
  Existe: `subtitulos.acentos` en `props.json` (un string acentúa todas sus apariciones; `{palabra,
  atMs, color}` una sola). El acento va en Instrument Serif itálica, 1.2x, como en `reserva`. Elegir
  qué palabras acentuar es criterio de Lucas: proponer, no imponer.
- (2026-09-23) **Fuente de subtítulos = Satoshi** ("satoshi es buena, trackeamela como good prompt",
  "probemos por satoshi a ver si banca"). Es la aprobada: es el default (`fuente: "satoshi"`, Black
  900). También válida según Lucas: **Helvetica Neue** de `PACKS/.../FUENTES/helvetica-neue-5` ("creo
  que helvetica-neue-5 va"). Preview `SubtitulosEstilos` en Studio compara Satoshi, Helvetica Neue
  Heavy, Tactic Sans Black y Bebas Neue (copiadas a `public/reserva/fonts/`). "Probemos" = validar en
  la pieza real que aguante en todos los planos; Lucas la va puliendo.
- (2026-09-23) **El recorte lo quiere poder hacer él a mano, y que el editor aprenda el porqué**:
  "falta recortar correctamente el video... para que yo pueda recortar manualmente y a partir de ahí
  aprendas el porqué". El jumpcut automático no alcanza como criterio de corte. Ver herramienta de
  recorte (§3a) y guardar el motivo de cada recorte que él marque.

- (2026-10-16) **Spec ads: UN componente grande por beat, nunca la pantalla entera chiquita** (Cogne, sobre la v2 de
  PropMatch: "apenas se puede apreciar el producto, va rapidísimo, necesitamos que se pueda ver mejor, más zoom y
  transiciones y efectos profesionales como el video de Amazon, Spotify, Revolut"). Es lo que hacen las referencias:
  cada beat muestra un tile de vidrio con UN dato (número que cuenta, anillo que se llena, botón que se aprieta → tilde),
  2–4 s por beat, cámara que empuja despacio. En el editor: kit `src/spec/kit.tsx` + escenas `tablero`, `ficha`,
  `canales`, `dictado`, `precio`, `contactos`. La ventana entera solo como establishing shot y después pasa al fondo
  desenfocada.
- (2026-10-16) **La imagen acompaña a la voz, siempre**: "no mostrés pavadas que no tengan que ver con lo que habla la
  voz". Cada escena se ancla a su línea de VO (los textos en pantalla son las mismas palabras); si una línea no tiene
  imagen propia, no va escena. Los cortes dentro de una frase caen en la palabra (medir con whisper `word_timestamps`).
- (2026-10-16) **Menos SFX en los spec ads**: "sin tanta saturación de sound effects". Solo los momentos clave (hook,
  corte grande, el golpe del match, el drop del logo, el cierre): ~12–20 en 30 s, a 0.15–0.35. Distinto del formato
  talking-head, donde Lucas pide más.
- (2026-10-16) **Voz en off femenina, argentina o latina neutra, fluida**: las voces preset en inglés hablando español
  son "una poronga". Lo que funcionó: generar con Seedance 2.5 un video con una locutora argentina diciendo frases del
  guion (prompt con "native Rioplatense Spanish accent"), extraer el audio y clonarlo con `seed_audio`
  (`audio_references`); una línea por archivo, verificar cada una con whisper. Cogne eligió esa muestra sobre las
  presets de ElevenLabs/MiniMax.
- (2026-10-16) **Tarjetas con amor y logos reales**: "no las hagas berreta simple, ponele amor, ponele el logo de fb,
  de MercadoLibre, del que aplique". Logos oficiales de simple-icons (`LogoApp`, ahora también `facebook`) y, para
  Mercado Libre (no está en simple-icons), el PNG oficial de su web (`public/spec/<slug>/logos/`). Tiles de vidrio
  con relleno, borde fino, sombra larga y entrada desde la profundidad; nunca una caja plana.

### Notas por pieza

**estructura-nexora** (reel vertical de Nexora, equipo hablando a cámara, 16 tomas montadas):
- (2026-09-23) v1 vista en Studio: el único overlay era el tachado de "bots / videos sueltos". Pidió
  gráficos de contexto sutiles y cambiar el estilo de subtítulos.
- (2026-09-24) **TERMINADA y declarada FORMATO GANADOR**: "ahora este video quedó finalizado, esto sería un formato
  ganador, seguiremos desarrollando más formatos pero acá ya tenemos un formato para replicar con distintos otros
  guiones". Export final: `out/estructura-nexora-v4b.mp4` (master lineal: −14.0 LUFS, −2.1 dBTP; la `v4` salió con loudnorm dinámico). El formato replicable está en
  **`formatos/ganador-talking-head/`** (README con anatomía, gramática guion → recursos, reglas, pipeline y
  checklist, + `props.template.json`). **Para una pieza nueva de este tipo, arrancar por ahí.**

**cuenta-juntos** (objeción de precio "Es caro, me dicen… hagamos la cuenta juntos", `R3/IMG_3524.MOV`, 8 tomas, 26 s;
pizarrón + cámara en mano):
- (2026-09-25) v1 armada entera por el editor (Lucas: "devolveme la pieza final para ver qué onda y te voy corrigiendo").
  Tomas: la última completa o la aprobada en voz alta ("está muy bien", "perfecto"). Sin recortes de trabas (no había).
  Escena nueva `cuenta` (contador 1→2→5, "× lo que te deja un turno", barras relativas contra "lo que cuesta el
  soporte", sin montos). Pendiente que Lucas decida: si quiere ver el pizarrón (el face-lock lo recorta) y un b-roll de
  canilla (no hay en el pack). El pizarrón dice "Licencia (mensual) 50 mil $": no se usó la cifra (el guion dice
  "soporte" y fuera de cámara hablaron de 180 / 200 dólares).
- (2026-09-25) v2/v3 con sus notas (escenas solas blanco/negro, 3D, b-rolls rotando: ver reglas generales). Lucas:
  "me encanta". Hook: "quitale el broll del inicio y sustituilo por un ícono relacionado superpuesto nomás" → paca de
  billetes 3D sobre la cara en "es caro, me dicen" (el diamante se veía como un bol blanco: descartado).
  **Export v3**: `out/cuenta-juntos-v3-master.mp4` (master lineal −13.7 LUFS, −2.1 dBTP, 22 MB, 26.4 s). Quedaron
  sin arreglar dos ⚠️ de mezcla: el riser roza el fin de "juntos" y el whoosh de entrada de escenas queda bajo la
  música (la voz de esta grabación es ~10 dB más fuerte: música a 0.36).

**empieza-a-romperse** ("El día que tu negocio empieza a andar bien es el día que empieza a romperse",
`Downloads/IMG_3525.MOV`, 14 tomas, 49.5 s):
- (2026-09-25) v1 armada entera por el editor con las reglas nuevas (escenas solas blanco/negro, 3D y logos, b-rolls
  065/340/122 sin repetir). A confirmar con Lucas: "un consultorio que **llena** la agenda" (whisper oía "lleva/llega").
  La escena `cta` ahora acepta `verbo` ("escribime") y gancho opcional, porque acá el verbo va antes que el gancho.

## 9. Cómo trabajar conmigo

- **Diagnosticar antes de arreglar.** Si algo se ve mal, buscar la causa (frames, tiempos, el JSON
  de transcript) antes de tocar código.
- **Un fallo se dice, se corrige y se anota** en §7. Sin dramatizar.
- Este proyecto no tiene `.claude/stack.md` propio — el stack lo define el `package.json`
  (Remotion + TypeScript). El stack default de `D:\Dev\CLAUDE.md` (Next.js/Supabase/etc.) **no
  aplica acá**.
