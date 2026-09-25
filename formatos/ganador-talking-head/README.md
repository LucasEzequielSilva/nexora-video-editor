# Formato ganador: talking-head vertical

Pieza de referencia: **`estructura-nexora`** (55.3 s, 1080x1920, 30 fps, 1660 cuadros). Lucas la dio por terminada el
2026-09-24: "esto sería un formato ganador... ya tenemos un formato para replicar con distintos otros guiones".
Export: `out/estructura-nexora-v4.mp4`.

Este paquete define **el CÓMO**. **El QUÉ** (texto en pantalla, cifras, nombres, palabra del CTA) sale siempre de
la transcripción real de la pieza nueva. No se inventan datos de Nexora.

- `README.md`: este archivo.
- `props.template.json`: esqueleto de `props.json` con todos los bloques de la ganadora. Toda ancla con palabra trae
  `"n": "<contar>"`: la aparición se cuenta en `words.json`, siempre.
- `chequeo-formato.mjs`: chequea lo que `npm run verificar` no mira (§5.6.7).
- `drops-musica.py`: mide los drops de un tema de música (§4.9).

Antes de arrancar, leer enteros CLAUDE.md §7 (reglas que salieron de fallos) y §8 (dirección de Lucas). Si §8
tiene una nota posterior a este README, manda la nota.

---

## 1. Qué es

Reel vertical de 45–60 s. Una persona habla a cámara y le vende un servicio o sistema al dueño de una PyME. Tiene
cinco actos:

1. Hook de contraste que cae en un negro.
2. Dolor concreto.
3. Solución mostrada.
4. Diferenciación ("no hacemos X").
5. CTA de palabra clave.

La cara lleva la tensión, con una cámara que calibra sobre la cara todo el tiempo y zooms largos entre plano
abierto y retrato. Lo que el guion describe y se puede mostrar pasa a **escenas** a pantalla completa (fondo blanco
con grilla, el que habla recortado delante). Los **b-rolls** cortos ponen la metáfora. **Cada evento visual tiene
su sonido.** En la ganadora, el 52 % del tiempo es escena y el que habla se ve el 91 % del tiempo.

**Usarlo cuando:**
- El guion dura 45–60 s: unas 150–210 palabras a ~3.4 por segundo.
- Vende un servicio o sistema a PyMEs y tiene:
  - un contraste para el hook;
  - dolores con objetos reconocibles (un mensaje, un turno, un presupuesto);
  - partes mostrables de la solución (pasos, una interacción, métricas);
  - un "comentá PALABRA" al final.
- La grabación es talking-head vertical de iPhone, con tomas repetidas para elegir.

**No usarlo para:**
- Piezas horizontales o de más de ~75 s: para eso está `src/reserva/`.
- Guiones de opinión sin nada mostrable. Las escenas quedarían decorativas, y Lucas pidió "motion graphics de
  contexto, no decoración".
- Testimonios, entrevistas de a dos, tutoriales donde la grabación de pantalla es la protagonista.
- La estética editorial (`src/pieza/editorial/`). Es otra familia visual y no se mezcla con esta en escenas contiguas.
- Tomas donde la cara no está en cuadro la mayor parte del tiempo: sin `cara.json` la cámara no calibra.

---

## 2. Anatomía de la pieza ganadora

Los tiempos están en segundos de la pieza final. Todas las anclas de `props.json` resuelven contra `words.json`.

**Cortes de la pieza final.** Salen de `cara.json.cortes` (cuadro / 30 = segundo), filtrados por
`chequeo-formato.mjs` (§5.6.1). En la ganadora:
- 2.10 s: falso positivo de YuNet (una cara de un solo cuadro), no es corte;
- 2.27 y 3.17 s: bordes del negro;
- **sobre la cara, 5**: 6.60, 19.43, 21.60, 44.83 y 46.97 s. Cada uno arranca un zoom;
- tapados por escenas, 11: 9.57, 11.30, 14.43 y 16.13 (`pendientes`), 24.97 y 30.27 (`proceso`), 31.77 y 36.20
  (`chat`), 39.33 y 43.57 (`panel`), 51.47 (`cta`).

`mapa-tiempos.json` no sirve para esto: solo tiene los recortes de Lucas y el negro, no las uniones del jumpcut ni los
cortes entre tomas.

### Cinco actos

| Acto | Tramo | % | Qué pasa | Recursos dominantes |
|---|---|---|---|---|
| 1. Hook + negro | 0.00–3.17 | 6 % | tesis en contraste → golpe → silencio | b-roll corto, zoom a retrato, riser, negro + boom + eco |
| 2. Dolor | 3.17–21.60 | 33 % | consecuencia → pregunta → lista de dolores → "sos vos, siempre" | cara con zooms, escena `pendientes`, escalera de zoom, 2 remates |
| 3. Solución | 21.60–43.65 | 40 % | "instalamos la estructura" → servicio 1 → "no tocás nada" → servicio 2 → "no cambiás nada" → medir | b-roll metafórico, escenas `proceso`, `chat` y `panel` (72 % del acto) |
| 4. Diferenciación | 43.65–51.20 | 14 % | "no hacemos X" ×2 → posicionamiento | tachados de íconos, zoom largo, ícono, 2º drop, b-roll emocional |
| 5. CTA | 51.20–55.32 | 7 % | "comentá PALABRA y te lo enviamos" | escena `cta` hasta el final, fade-out de música |

### Beat por beat

La escala es la de `props.json`: 1.0 es el encuadre base y 1.9 es el retrato, unas 2.1 veces el tamaño real.

En la columna Sonido, lo que va en **negrita** está en `props.sfx` (6 entradas en toda la pieza). El resto lo emiten
solos el código de las escenas y los overlays (§4.8): no se escribe en `props.sfx`.

| # | Tiempo | Guion (transcripción real) | Rol | Imagen / cámara | Sonido |
|---|---|---|---|---|---|
| 1 | 0.00–2.27 | "tu negocio crece pero tu estructura no" | Hook | b-roll `broll-201` 0.13–1.39; vuelve la cara en "estructura"; zoom 1.0→1.9 que aterriza en el fin de "no" | **`riser`**: pico en el fin de "no", corte +40 ms; `corte-broll` del b-roll |
| 2 | 2.27–3.17 | (negro 0.9 s) | Respiro | negro insertado por `recortar.mjs`, sin subtítulo | **`boom-negro`** +20 ms; **cola** de eco/reverb del "no" |
| 3 | 3.17–6.60 | "y llega un día en que crecer te empieza a costar plata en vez de darte" | Consecuencia | vuelve en retrato y abre (`salida`, 0.7 s); deriva; zoom 1.1→1.7 hasta el corte | la música entra en "y", en el drop |
| 4 | 6.60–9.41 | "fíjate cuántas cosas de tu negocio hoy dependen de que vos estés" | Pregunta puente | jump cut + zoom out 1.7→1.0; deriva 1.0→1.2 | — |
| 5 | 9.41–18.09 | "El mensaje que entra a las 11 de la noche, el turno…, el presupuesto…, el video…, ninguna de esas cosas es difícil" | Lista de dolores + frase que los minimiza | escena `pendientes`: 4 tarjetas, cada una en su palabra; pila; remate textual | whooshes; pop + tarjeta por ítem; **`remate-b`** +90 ms del fin de "difícil" |
| 6 | 18.09–21.60 | "todas necesitan que alguien esté, ese alguien sos vos, siempre." | Giro personal | escalera: 1.0→1.15, punch 1.15→1.5 en el corte, 1.5→1.6, 1.6→2.0, 2.0→2.05 | **`zoom-punch`**; **`remate`** +70 ms del fin de "siempre" |
| 7 | 21.60–24.83 | "Nosotros instalamos la estructura para que esas cosas pasen sin vos." | Declaración de la solución | zoom out 2.05→1.0 (0.94 s); `broll-004` ~2 s (un hombre se multiplica en una multitud) | `corte-broll-b` del b-roll |
| 8 | 24.83–30.31 | "Armamos tu contenido, estrategia, guion, grabación, edición y publicación." | Servicio 1: pasos | escena `proceso`: 5 pasos con ícono premium y chip "Publicado" | `tarjeta` por paso; `double-click` en el chip |
| 9 | 30.31–31.69 | "Vos no tocás nada." | Remate de beneficio | zoom 1.0→1.9 que aterriza en el fin de "nada"; se sostiene 1.95 | ninguno: remata la cámara |
| 10 | 31.69–37.72 | "Un sistema en tu WhatsApp que responde al instante, agenda, confirma y recuerda. Conectado a la agenda que ya usás," | Servicio 2: interacción | escena `chat`: teléfono + frases cinéticas + calendario | burbujas, tipeo, `double-click`, `tap` |
| 11 | 37.72–39.27 | "no cambiás nada de lo que tenés." | Anti-fricción | vuelve en retrato y abre; deriva | — |
| 12 | 39.27–43.65 | "Medir. Un panel donde ves qué entró, qué se agendó y qué se perdió." | Medición | escena `panel`: "Medir" + 3 métricas con contador | `tarjeta`; `counter` por métrica |
| 13 | 43.65–44.83 | "No trabajamos con plantillas. Y" | Objeción 1 | zoom 1.0→1.8 hasta el corte; tachado del ícono de plantilla | `pop` + `tachado` |
| 14 | 44.83–46.97 | "no, no vendemos bots ni videos sueltos," | Objeción 2, enumerada | zoom out en el corte; tachado doble: bot + videos | `pop` + `tachado` por ícono |
| 15 | 46.97–51.20 | "instalamos la estructura que tu negocio necesita para seguir creciendo sin depender de vos." | Tesis de cierre | zoom largo 1.0→1.9 (3.27 s); ícono de estructura en "estructura"; `broll-187` ~1 s en la cola | 2º drop de la música (~47.04); `pop-b` del ícono; `corte-broll` del b-roll |
| 16 | 51.20–55.32 | "Si querés ver uno funcionando de verdad, comentá estructura que te lo enviamos por privado." | CTA de palabra clave | escena `cta` hasta el final | `tarjeta`, tipeo, `click`, `cta-cierre`; fade-out de 1.2 s |

### Métricas que definen el ritmo

**Voz y corte**
- 188 palabras en 55.3 s: 3.4 por segundo.
- Del bruto a la pieza se fue el 26 % del tiempo:
  - bruto: 73.2 s;
  - jumpcut: −6.9 s;
  - recortes de Lucas: −11.9 s (−18 %);
  - se sumó 0.9 s de negro.

**Cobertura de pantalla**
- Cara 38.9 %, escenas 51.8 %, b-roll 7.7 %, negro 1.6 %.
- **Entre dos escenas siempre vuelve la cara**, durante 1.4 a 6.6 s.
- Hay 5 escenas de 4.1 a 8.7 s (promedio 5.7) y 3 b-rolls de 1.0 a 2.0 s. Ningún b-roll pasa de 2 s.

**Beats**
- 16 beats, con una mediana de 3.3 s.
- **Los 15 bordes entre beats caen en un cambio de imagen**: jump cut, entrada o salida de escena, o negro.

**Cámara**
- 21 tramos de zoom encadenados: 12 movimientos grandes (uno cada 4.6 s) y 9 derivas.
- El 85 % del tiempo de cara tiene un zoom en movimiento.
- **Los 5 jump cuts sobre la cara son arranques de movimiento de cámara.**

**Densidad**
- 66 eventos visuales, 11.9 cada 10 s. El hueco más largo es de 2.8 s y lo cubre una deriva.
- Unos 59 golpes de SFX, 10.7 cada 10 s.
- La música cubre el 94 % de la pieza.

**Remates**
- Hay remate sonoro solo en los **3 puntos de giro** (hook, lista, "siempre"), entre 20 y 90 ms después de la última palabra.
- Los demás cierres los marca **la cámara aterrizando en retrato**, entre −80 y +150 ms.

### Invariantes (salen de las mediciones)

Los cortes de los puntos 1 y 2 son los de la lista de arriba, que imprime `chequeo-formato.mjs` (§5.6.1).

1. Todo beat arranca con un cambio de imagen.
2. Todo jump cut sobre la cara arranca un movimiento de cámara. Los saltos de escala solo pasan en un corte o
   escondidos en el negro, una escena o un b-roll. El chequeo avisa los dos casos.
3. Los zoom in grandes llegan a 1.7–2.05 en el fin de la idea. Los zoom out salen del retrato con `curva: "salida"`
   en 0.6–0.94 s.
4. La cámara nunca queda quieta más de 2.8 s: siempre hay una deriva o un push-in.
5. Cada contenido va en su capa:
   - **escena** para lo que se puede mostrar;
   - **b-roll** de hasta 2 s, dentro de una toma, para lo metafórico o emocional;
   - **cara** para la tensión, los giros y los remates.
6. Los remates sonoros van solo en los giros. El riser es solo del hook, y los zooms van sin sonido salvo el
   punch (`zoom-punch`).
7. En las escenas, cada elemento entra en la palabra que lo nombra.
8. Los acentos del subtítulo solo sirven en palabras que caen sobre cara o b-roll: las escenas ocultan el subtítulo.

---

## 3. Gramática: cómo mapear un guion nuevo

Primero se clasifica cada línea del guion nuevo en uno de estos tipos. Después se aplica su receta, que en
`props.template.json` está con anclas de ejemplo.

Cómo leer la tabla:
- **"El corte"** es un corte de la lista de §2, sacado de la pieza nueva con el chequeo (§5.6.1). Un ancla "en el
  corte" va en la primera palabra de la toma, con el `offsetMs` que la lleva al cuadro exacto del corte. El chequeo
  imprime, para cada zoom, la distancia al corte más cercano: tiene que dar 0 cuadros.
- **"Primera palabra con contenido"** es la primera que no está en la lista de funcionales de §4.4 (a, al, con, de,
  el, en, es, la, para, que, si, tu, un, y...).
- **`n`**: toda palabra que aparece más de una vez en `words.json` lleva `n` explícito (ver §4.1).

| Tipo de línea | Recurso | Parámetros | En `estructura-nexora` |
|---|---|---|---|
| **Hook**: tesis en contraste, de hasta ~2.5 s, que termina en una palabra seca | b-roll ~1.3 s sobre la primera mitad; cara desde la palabra clave; zoom 1.0→1.9; riser; acento en la palabra clave | b-roll desde la 2ª palabra hasta la palabra clave −100 ms, elegido por tono (§4.6). Zoom desde el arranque de la mitad que remata hasta la última palabra con `fin: true`. Riser con golpe en ese fin y `corte` +40 ms, 0.14 | "tu negocio crece pero tu estructura no" (zoom desde "tu" n2) |
| **Negro** después del hook | `pausas` 0.9 s; `boom-negro`; cola de eco/reverb; la música entra con la primera palabra que vuelve | boom +20 ms, 0.2. Cola −20 ms, vol 1, `largo` según §4.2. Zoom out 1.9→1.0 con `salida` en 0.7 s | "no" → "y llega…" |
| **Consecuencia / dolor general** | solo cara | deriva desde +700 ms; zoom in desde la palabra de costo −100 ms hasta el corte siguiente (1.1→1.7) | "costar plata en vez de darte"; el corte es "fíjate" −30 ms = 6.60 s |
| **Pregunta puente** que anuncia una lista | cara con deriva lenta que sigue debajo de la escena | zoom out en el corte (0.6 s) + deriva 1.0→1.2 | "fíjate cuántas cosas…" |
| **Lista de dolores** concretos + frase que los minimiza | escena `pendientes`: una notificación con logo oficial por ítem (3 a 5); titular serif + clave sans; pila + remate textual; `remate-b` | desde la primera palabra con contenido −300 ms hasta el fin del remate +430 ms. `remate-b` en el fin +90 ms, 0.13. Detalle en §4.5.1 | mensaje / turno / presupuesto / video → "ninguna es difícil" (desde "mensaje", no "El") |
| **Giro personal** ("el problema sos vos") | escalera de zoom con punch en el jump cut; retrato 2.0–2.05 en la palabra final; `remate` | la palabra del punch es la primera de la toma que arranca en el corte: su −200 ms cae en el corte. `zoom-punch` 0.11 en esa ancla; 1.6→2.0 en los 0.5 s previos a la palabra final; `remate` en su fin +70 ms, en el mismo cuadro que el corte siguiente | "ese alguien sos vos, siempre" ("ese" −200 = 19.43 s; "alguien" n2) |
| **Declaración de la solución** ("instalamos X para que…") | zoom out largo desde el retrato + b-roll metafórico ~2 s (escalar / multiplicarse) | zoom out de 0.94 s; b-roll desde el verbo hasta la conjunción +1000 ms; `corte-broll-b` 0.12 | "Nosotros instalamos la estructura…" |
| **Servicio con pasos enumerables** | escena `proceso`: título chico + grande, un paso por palabra, todos con ícono premium o ninguno (§4.7), chip de estado | desde el verbo −250 ms hasta el fin del último paso +250 ms | estrategia → publicación |
| **Beneficio corto** que remata un servicio | cara: zoom 1.0→1.9 que aterriza en el fin de la última palabra; sostener | arranca en el `hasta` de la escena anterior; sostiene 1.9→1.95 durante +500 ms | "Vos no tocás nada" |
| **Servicio demostrable como interacción** | escena `chat`: teléfono + frases cinéticas; cada verbo es un cue | desde la primera palabra con contenido −350 ms hasta el fin +200 ms. Fórmulas en §4.5.1 | sistema de WhatsApp (desde "sistema", no "Un") |
| **Aclaración anti-fricción** | cara: vuelve en retrato al salir la escena y abre; deriva | zoom out 1.9→1.0 con `salida` en 0.6 s desde el `hasta` de la escena | "no cambiás nada…" |
| **Medición / resultado** | escena `panel`: palabra grande que queda de título + una métrica con contador por palabra | desde la palabra −200 ms hasta el fin de la última métrica +350 ms | "Medir… qué entró, qué se agendó, qué se perdió" |
| **Objeción "no hacemos X"** | cara + `strike` con el **ícono** de cada X (nunca la palabra); zoom in hasta el corte y zoom out | ícono en la palabra X (o en el verbo con `strikeDelay` 17); `hasta` +200/+500 ms después del cierre, siempre después de los íconos; zoom 1.0→1.8 desde el `hasta` de la escena anterior hasta el corte que abre la toma siguiente | plantillas; bots + videos (el corte es "no" n5 +10 ms = 44.83 s) |
| **Posicionamiento / tesis de cierre** | zoom largo desde el corte; ícono premium del concepto; drop de música; b-roll emocional ~1 s en la cola | b-roll de ~1.0 s que termina en el `desde` del CTA; empieza en la palabra de la tesis cuyo inicio −400 ms queda más cerca de (`desde` del CTA − 1.0 s). El zoom largo va del corte a esa misma ancla y dura ≥ 3.2 s. Ícono de 380 px, `centroY` 72, 1500 ms | "instalamos la estructura que tu negocio necesita…": CTA 51.20 → objetivo 50.20 → "depender" −400 = 50.24 ("sin" daría 50.08); zoom de 3.27 s; ícono en "estructura" n3 |
| **CTA de palabra clave** | escena `cta` hasta `"fin"`; música con fade-out de 1.2 s | desde la primera palabra con contenido del CTA −350 ms (§4.10); cue `palabra` = fin de "comentá" | "comentá estructura…" (desde "querés", no "Si") |

**Si una línea no encaja en la tabla**, se decide así:
1. ¿Se puede mostrar? → escena. Si ninguna de las 5 sirve, se hace una escena nueva, pero se consulta antes con Lucas.
2. ¿Es metáfora o emoción? → b-roll de hasta 2 s.
3. ¿Es tensión o remate? → cara con zoom a retrato.
4. ¿Nombra un objeto concreto en una frase suelta? → ícono premium con pop.

**Orden de los actos.** No hace falta copiar los 16 beats, pero sí mantener:
- hook → negro → dolor → giro → solución mostrada → diferenciación → tesis → CTA;
- que entre dos escenas vuelva la cara.

### Anclas prestadas entre bloques

Varios bloques toman su ancla de otro. Si el guion nuevo no tiene ese otro bloque, o lo tiene en otro orden, hay que
re-anclar y volver a cerrar la cadena de zooms (§4.3):

| Bloque | Toma su ancla de | Si ese bloque no está |
|---|---|---|
| Deriva de la pregunta puente (`fin`) | 1er ítem de `pendientes` +200 ms | termina en el corte o en la entrada de la escena que venga |
| Beneficio corto (`inicio` del zoom 1.0→1.9) | `hasta` de `proceso` | arranca en el corte de la toma del beneficio, con `escalaInicial` 1.0 |
| Anti-fricción (`inicio` del zoom out 1.9→1.0) | `hasta` de `chat` | sin escena antes no hay retrato escondido: arranca en el corte con `escalaInicial` = `escala` del zoom anterior, o se saltea |
| Objeción (`inicio` del zoom in) | `hasta` de `panel` | arranca en el corte o en el fin del zoom anterior |
| Zoom largo de la tesis (`fin`) y b-roll emocional (`desde`) | la misma ancla | — |
| b-roll emocional (`hasta`) | `desde` del CTA | — |
| `strike` doble (`hasta`) | verbo de la tesis +200 ms | +200 ms de la primera palabra de la frase siguiente |
| `strike` simple (`hasta`) | primera palabra de la toma siguiente +500 ms | igual, con la toma que siga |

---

## 4. Reglas del formato

Los valores salen de la pieza terminada y del código de `src/pieza/` al 2026-09-24. Donde una fuente escrita no
coincide con eso, mandan el código y `props.json` (ver §8.1).

### 4.1 Principios
- **Todo texto en pantalla es literal de `words.json`**: subtítulos, titulares de escena, gancho y palabra del CTA.
  Se ajustan solo mayúsculas y puntuación (§4.5.1).
- Los datos de maqueta (nombres, horas, mensajes, cifras de un panel) son ilustrativos y coherentes con lo que se
  dice, y los confirma Lucas. En la ganadora el panel mostraba 48 / 31 / 6 de ejemplo.
- **Todo se ancla a palabras**: `{ palabra, n, offsetMs, fin }`. `atMs` solo cuando no hay palabra, porque
  `recortar.mjs` no reacomoda esas anclas.
  - `resolverMs` (`src/pieza/anclas.ts`) compara en minúsculas y sin puntuación, pero **con tildes**.
  - Un ancla que no resuelve devuelve `null` y **el elemento desaparece sin error**.
  - **`n` se cuenta siempre.** Sin `n`, el ancla toma la primera aparición. Un `n` equivocado no da error: el
    elemento aparece en otra parte de la pieza, y `npm run verificar` lo da por bueno porque el ancla resuelve.
    Con los `n: 1` de la versión anterior del template, varias anclas de la ganadora caían en otra aparición: el
    ícono de la tesis salía en el hook, el `hasta` del tachado caía antes que sus íconos y un zoom terminaba más de
    40 s antes de empezar.
    El template trae `"n": "<contar>"` y `chequeo-formato.mjs` marca como error lo que quede sin contar y lista todas
    las apariciones de cada palabra repetida sin `n`.
- **Primero recorta Lucas, después se anima.** Hoja de ruta de Lucas del 2026-09-24: "Lucas recorta; todo lo demás
  es automático después del recorte".
- Capas, de abajo hacia arriba (`pieza-composition.tsx`):
  1. video con cámara que calibra;
  2. b-roll;
  3. escenas con el recorte del que habla;
  4. tachados e íconos;
  5. música y SFX;
  6. subtítulos, que se apagan durante las escenas.

### 4.2 Hook (0 a ~3.2 s)
- **Frase**: contraste corto que termina en la palabra que remata. Arranca sin aire, porque Lucas recortó el
  silencio inicial. El tropiezo de después, afuera.
- **Riser**: sube durante toda la frase y se corta en seco en la última palabra. Lucas: "es CLAVE para inicio" y
  "ahí cortás el riser, sino se siente desconectado completamente".
  - Valores: `riser` (`sfx-cine-017`, golpe a 3.94 s del archivo, sube unos 2.2 s), `fin: true`, `corte` +40 ms
    con 2 cuadros de fundido, volumen 0.14.
  - Queda por debajo de la voz sobre las palabras y entre 0 y +6 dB sobre la voz en los huecos.
  - Si el hook dura bastante más de 2.2 s, consultarlo con Lucas. Hay un riser largo, `sfx-cine-024`, que crece 7 s.
    Otros candidatos en Cine SFX: `Riser Intense`, `Sharp Riser`, `ETHERAL DRONE`, `Evolving Sci-fi Drone`,
    `WIND AMBIENT`, `BASS DROP`, `Boom IMPACT`.
- **Negro de 0.9 s** (`pausas`) con `boom-negro` (Earth Core Ripper con delay/reverb) a 0.2, +20 ms.
- **Cola de la última palabra**: se genera con `cola-reverb.py`, parámetros `1.3 <largo> 230 4`.
  - Lleva solo la señal húmeda: eco cada 230 ms, 4 ecos cada vez más opacos, más reverb.
  - Arranca 20 ms antes de la palabra (el `sfx` va con `offsetMs` −20 y el script con `<inicio − 0.02>`).
  - **`largo` = (inicio de la primera palabra después del negro − inicio de la cola) + 0.2 s.** El script le aplica
    0.2 s de fundido al final de `largo`: así el fundido arranca justo cuando vuelve la voz y pisa 0.2 s de la frase
    siguiente, ya bajando. En la ganadora: 3.15 ("y") − 2.07 + 0.2 = **1.28**. Sin esos 0.2 s, la cola se apaga
    antes de que vuelva la imagen.
  - Se guarda en PCM de 16 bits.
  - Lucas: "dale un toque de delay, eco, que siga en la blackscreen un toque más".
  - No: meter los ecos dentro de la reverb y normalizar todo junto. Quedó 10 dB abajo y Lucas dijo "no lo escucho con eco".
- **Zoom obvio** 1.0→1.9 durante la mitad que remata ("cuando dice 'tu estructura' un zoom in obvio").
- **B-roll del hook**: sale 100 ms antes de la palabra clave, con `corte-broll` a 0.2. Se elige por tono (§4.6).
- **Vuelta del negro**:
  - la imagen vuelve en retrato y abre (`salida`, 0.7 s);
  - la música entra en seco (`fadeInMs` 40) con la primera palabra, sobre el drop o un tiempo fuerte.

### 4.3 Cámara y zooms
- **Calibra todo el tiempo** (`CAMARA` en `pieza-composition.tsx`):
  - la cara ocupa 0.26 del ancho y los ojos quedan en (0.5, 0.3);
  - `escalaBase` va de 1.08 a 1.35 y `escalaMax` es 2.4;
  - cada plano entra 7 % más abierto y 2 % más abajo, y se asienta en 10 cuadros;
  - el suavizado (`cara.ts`) es de ±5 cuadros para la posición y ±15 para el ancho, sin cruzar cortes.

  Necesita `cara.json` (YuNet). No rotar para enderezar la cabeza.
- **Recorrido largo**: de 1.0 a retrato (1.9–2.05). Un +6 % o +20 % "no se ve". Nada de golpes secos: "intentalos
  más smooth".
- **Nunca volver en seco**: los zooms `suave` se encadenan (el fin de uno es el inicio del otro, con la misma escala).
  - El zoom out sale del retrato con `curva: "salida"` en 0.6–0.7 s. El que sale después de "siempre" dura 0.94 s.
  - Un salto de escala solo vale escondido en un corte, una escena o un b-roll.
  - Entre dos zooms que no se tocan, la composición vuelve a 1.0 en seco en el cuadro donde termina el primero.
- **Re-encadenar al borrar o reordenar bloques**:
  1. cada zoom que empieza sobre la cara arranca con `escalaInicial` = `escala` del zoom que termina en ese cuadro, o
     en un corte, el negro, una escena o un b-roll que tape el salto;
  2. si queda un hueco entre dos zooms sobre la cara, se cierra con una deriva (+0.10 a +0.20) que empieza en el fin
     del anterior;
  3. los zooms que toman una escena como ancla se re-anclan según la tabla "Anclas prestadas" (§3).

  `chequeo-formato.mjs` lista cada salto de escala y dice si queda tapado. En la ganadora avisa uno solo: 1.0→1.9 al
  salir `chat` (37.70 s), aprobado por Lucas.
- **Dónde va cada zoom**:
  - zoom in hasta retrato en la palabra que remata la idea;
  - zoom out en el corte siguiente o cuando sale una escena;
  - derivas de +0.10 a +0.20 en 1.1–2.7 s durante el habla normal;
  - sostener el retrato +0.03 o +0.05 sobre la palabra clave.
- **Zoom rápido de énfasis**: 1.15→1.5 en unos 0.38 s con `salida`, más `zoom-punch` a 0.11. El tipo `punch` existe
  (`rampa` 12) pero la ganadora usa solo `suave`.

### 4.4 Subtítulos (`captions-vertical.tsx`)
- **Estilo**: Satoshi Black, peso 900, 108 px, `letterSpacing` −0.05em. Alternativa válida: `helvetica-heavy`.
- **Sin fondo**: blanco con `textShadow: 0 3px 22px rgba(0,0,0,.6), 0 2px 5px rgba(0,0,0,.65)`.
- **Posición**: centrados con `centroY` en el 54 % del alto (sobre el pecho), márgenes de 90 px, 2 líneas apretadas
  (`lineHeight` 0.95).
- **Jerarquía**:
  - acento: Instrument Serif itálica, ×1.3;
  - palabras funcionales: ×0.74 (a, al, con, de, del, el, en, es, la, las, lo, los, nos, para, pero, por, que, si,
    su, te, tu, un, una, y, ni).
- **Paginado**:
  - hasta 4 palabras y 26 caracteres por página;
  - se corta en la puntuación o en una pausa de más de 0.35 s;
  - una página no cierra en palabra funcional.
- **Aparición**: cada palabra aparece cuando se dice (6 cuadros, desenfoque 8→0 px, sube 16 px). No: palabras
  futuras atenuadas, porque en gris sobre pared clara no se leen.
- **Acentos**: los propone el editor y los decide Lucas. Van en:
  1. el sustantivo del concepto central ("estructura");
  2. el "vos" del espectador;
  3. las X de las objeciones ("plantillas", "bots"), que caen sobre la cara con su ícono tachado.

  Solo sirven en palabras que caen sobre cara o b-roll. La ganadora tiene 6 en `props.json`: esos 4 más "sistema" y
  "WhatsApp", que caen dentro de la escena `chat` y no se ven. No copiarlos: el chequeo avisa los acentos que no se ven.

### 4.5 Escenas (`src/pieza/escenas/`)
- **Cuándo**: todo lo mostrable (lista, proceso, sistema, métrica, CTA) va como escena a pantalla completa. Lucas:
  "template white con background white, con grid pattern, con un poquito de shadow sutil... que se vaya como
  desplazando".
- **Fondo** (`fondo.tsx`):
  - base `#f4f4f2` con grilla de 96 px y cruces de 9 px;
  - la grilla se desplaza desde el cuadro absoluto, así que no salta entre escenas;
  - 2 sombras curvas, ruido del 6 % y viñeta del 16 %.
  - No: `public/assets/grid-mesh.jpg`, que tiene marca de agua.
- **Transición** (`marco.tsx`):
  - entra en 14 cuadros: sube 90 px, escala de 1.04 a 1 y desenfoque de hasta 14 px;
  - sale en 10 cuadros;
  - `escena-entra` 0.08 y `escena-sale` 0.1, automáticos;
  - si la escena llega al final de la pieza, no tiene salida.
- **Bordes**:
  - `desde`: la primera palabra con contenido de la línea, de 200 a 350 ms antes ("mensaje" −300, "armamos" −250,
    "sistema" −350, "medir" −200, "querés" −350). Así el corte de toma de esa línea cae entre 1 y 8 cuadros después
    del `desde`, dentro de los 14 cuadros de la entrada, que lo tapa. El chequeo lista cada corte y qué lo tapa;
  - `hasta`: de 200 a 430 ms después del fin de la última palabra.
- **Cues**: cada elemento entra en la palabra que lo nombra. Los nombres de cue son libres, salvo `titulo` en
  `proceso` y `ver / comentar / palabra / respuesta / privado` en `cta`, que están fijos en el código. Si falta uno,
  cae en un % de la duración sin avisar. El chequeo marca como error un cue que cae fuera de su escena.
- **Texto en dos voces**: bajada en Instrument Serif itálica chica + clave en sans bold, que entra cuando se dice
  (`claveEn` en cuadros).
- **Movimiento**: todo se mueve. Las entradas llevan desenfoque de 10–12 px y deslizamiento, las tarjetas alternan
  de lado y todo flota con ondas de ±3 a 5 px. Springs según la intención: `soft`, `pop`, `snappy`.
- **El que habla recortado sin fondo**, no en un círculo:
  - sale de `persona.webm`, con `RECORTE` en escala 0.5, ojos en y 1440 y x 250 (abajo-izquierda) u 830
    (abajo-derecha);
  - las escenas no ponen contenido en esa esquina (y ≥ 1320, ~540 px de ancho);
  - `pip`: `abajo-izquierda` (default) | `abajo-derecha` | `ninguno`. `ninguno` es el plan B de Lucas. No hay
    `arriba-derecha` ni `pipFoco` (ver §8.1).
- **Escena nueva**: archivo nuevo en `src/pieza/escenas/` con su `Datos` y su `PREVIEW`, registrado en `registry.ts`.
  Se previsualiza en Studio en `escena-<id>`.

### 4.5.1 Parámetros por escena

**`pendientes`** (lista de dolores)
- **Ítems**: de 3 a 5. Se probó con 4. La lista crece centrada en y 820: con 5 tarjetas llega a y ≈ 1280, al borde de
  la zona del recorte (y ≥ 1320), y con 6 la invade. Si hay más dolores, se parte en dos escenas o se agrupan.
- **Cue de cada ítem**: el sustantivo que lo nombra ("mensaje", "turno", "presupuesto", "video"), no el artículo.
- **`marca`** es obligatoria y solo acepta los 4 logos de `LogoApp`. Mapeo (de `iconos.md` §2):
  - mensajes, chats, clientes que escriben → `whatsapp`;
  - turnos, agenda, citas → `googlecalendar`;
  - presupuestos, mails sin responder → `gmail`;
  - contenido, publicaciones, comentarios, DMs → `instagram`.

  Si un dolor no encaja en ninguna (una factura, el stock), no se fuerza una marca que no corresponde. Se consulta
  con Lucas antes de elegir:
  - sumar la marca real si está en simple-icons (regenerar `marcas-paths.ts`, fila en `iconos.md` §2);
  - cambiar `pendientes` para que acepte un ícono premium (`imagen`), que es una edición de código;
  - o llevar ese dolor a otra línea del guion.
- **Frase de cada ítem**:
  - `serif`: el ítem hasta antes de la clave, en minúscula ("el mensaje que entra a las");
  - `clave`: el complemento concreto con el que termina el ítem, sin la coma del transcript ("11 de la noche",
    "confirmar", "sin responder", "tres semanas");
  - el `remate` cierra con punto aunque en `words.json` lleve coma ("es difícil.");
  - `claveEn` = round((inicio de la 1ª palabra de la clave − inicio del cue) × 30). En la ganadora, los 5 salen de
    esta fórmula: 25, 19, 23, 33 y 20.
- **Maqueta**: `titulo`, `detalle` y `hora` ilustrativos y coherentes con lo dicho ("23:04" para "las 11 de la noche").

**`proceso`** (pasos)
- Título chico + grande, literales ("Armamos tu" / "contenido"). `estadoFinal` derivado de lo dicho ("Publicado").
- Un paso por palabra, cue en esa palabra. Se probó con 5. Las tarjetas alternan de lado cada 180 px desde y 610, y la
  de la izquierda que baja de y 1222 se corre para esquivar el recorte.
- Íconos: todos los pasos con ícono o ninguno (§4.7).

**`chat`** (interacción de WhatsApp)
- **Cues**: cada uno va en la palabra que dispara un elemento del teléfono: `whatsapp` (llega el mensaje del
  cliente), `instante` (llega la respuesta), `agenda` (tarjeta del turno), `confirma` (tilde), `recuerda`
  (notificación), `calendario` (entra el calendario).
- **En las frases cinéticas el cue va en la palabra de la clave sans**, y la bajada serif se adelanta con `retraso`
  negativo. En la ganadora el cue es "instante", no "responde": la respuesta llega cuando dice "al instante".
  Excepción: `calendario` va en el sustantivo que nombra la agenda ("agenda" n2), porque ahí entra el calendario, y
  la clave sans ("que ya usás") se atrasa con `retraso` positivo.
- **`retraso`** (cuadros) = round((inicio de la 1ª palabra de esa parte − inicio del cue) × 30). Ejemplo de la
  ganadora: "un sistema en tu" = (31.92 − 32.46) × 30 = −16.
- **Ajustes a ojo de la ganadora** (la fórmula daba otra cosa):

  | Parte | `retraso` | Fórmula |
  |---|---|---|
  | "que responde" | −12 | −22 con "que", −14 con "responde" |
  | "y" (antes de "recuerda") | −4 | −10 (whisper estiró la "y" a 0.34 s) |
  | "conectado a la agenda" | −5 | −12 |
  | "que ya usás" | +12 | +6 con "que", +11 con "ya" |

  El criterio que los explica (medido, no dicho por Lucas):
  - cada clave sans queda al menos 20 cuadros en pantalla antes de que entre la frase siguiente (en la ganadora, de
    20 a 22; una frase sale 3 cuadros antes de que arranque la otra);
  - entre la bajada y la clave de una misma frase hay al menos 12 cuadros.

  Si la fórmula rompe alguna de las dos, se atrasa la bajada siguiente. No copiar esos números a otra pieza.
- **`escribe`** (cuadros de "escribiendo…") ≈ −`retraso` de la bajada de esa misma frase, así el tipeo arranca con
  la bajada (en la ganadora, 14 y 12). Si el tipeo empieza en los primeros 14 cuadros de la escena no suena: lo tapa
  el whoosh de entrada.
- **`mudo: true`** en el mensaje cuyo golpe cae a unos 11 cuadros o menos de otro. En la ganadora, la elección del
  cliente cae 11 cuadros antes de la tarjeta del turno.
- **`caeRetraso` 10** es el default del código: el turno cae en el calendario 10 cuadros después del cue
  `calendario`. El calendario entra 3 cuadros antes del cue.

**`panel`** (medición)
- `palabra` = la palabra grande que abre y queda de título; una métrica por palabra del guion; `tono` neutro, bueno
  o malo.
- Cifras: reales pedidas a Lucas o claramente ilustrativas. Nunca como resultado real.

**`cta`**
- Cues con nombres fijos (`ver`, `comentar`, `palabra`, `respuesta`, `privado`). El cue `palabra` es el fin de
  "comentá": ahí se empieza a tipear.
- `desde`: §4.10.

### 4.6 B-roll
- **Uso**: son cortes sobre la voz de 1–2 s, dentro de una toma. Lucas: "tenés banda de brolls y no usás ninguno".
- **Qué clip.** Lo que tienen en común los 3 de la ganadora:
  - live action cinematográfico. No CGI ni ilustración: eso descarta, por ejemplo, `broll-153` (render 3D) y
    `broll-188` (ilustración), aunque figuren en el índice como "crecimiento";
  - 1080x1920 (no 720x1280);
  - si hay personas, de espaldas o sin mirar ni hablarle a cámara: el único que le habla al espectador es el que habla;
  - sin texto legible que compita con el subtítulo. `broll-004` tiene carteles en japonés y un "8" y pasó igual.
- **Cuál, según el lugar**:
  - **hook**: por tono, no por la palabra literal. Acompaña al riser: tensión, ambición, noche. En la ganadora,
    `broll-201` desde 3.5 s: skyline de noche con tormenta, indexado como "ambición / gran ciudad", no como
    "crecimiento" (los clips de ese índice son soleados o ilustrados);
  - **declaración de la solución**: la metáfora literal del verbo. `broll-004`: un hombre que se multiplica en una
    multitud;
  - **cola de la tesis**: emocional, tranquilidad o libertad. `broll-187`: una pareja de espaldas hacia montañas.
- **`inicioS`** para cortes de 1–2 s: el segundo en que la acción del concepto ya está en cuadro, mirado en una tira
  de la ventana exacta que se va a usar:

  `ffmpeg -v error -y -ss <inicioS> -t <duración> -i public/recursos/<id>.mp4 -vf "fps=4,scale=180:-1,tile=8x1" -frames:v 1 out/verif/<id>-ventana.jpg`

  El "mejor inicio" del catálogo es genérico y la tira de `out/verif/broll-tiras/` trae un cuadro por plano. En
  `broll-188` el inicio 0 es una colina vacía y el ciclista entra a ~3.6 s: un corte de 1.3 s desde 0 no muestra nada.
  En la ganadora:
  - `broll-201` desde 3.5 s, salteando los cortes cada ~0.4 s del principio (queda uno, a 3.75 s, dentro del corte);
  - `broll-004` desde 1 s, para que la multitud, que aparece a ~2.5 s, entre dentro del corte;
  - `broll-187` desde 0.5 s.
- **Tratamiento** (`BrollLayer`):
  - fundido de 6 cuadros y push-in de 1.02 a `zoom` (default 1.1);
  - velo negro al 22 %, siempre mudo;
  - SFX de corte en el cuadro 4, alternando `corte-broll` y `corte-broll-b`.
- **Coherencia**: nunca un b-roll que contradiga la frase. `broll-220` mostraba un reloj a las 5:55 contra "las 11
  de la noche".
- **Biblioteca**: al usar un b-roll, describirlo en la biblioteca si todavía no está descripto.

### 4.7 Íconos y tachados
- **Qué íconos**: solo íconos premium de `PACKS/ICONOS/` (`icono-001` a `016`, tabla en §8) o logos oficiales con
  `LogoApp`: `whatsapp`, `instagram`, `googlecalendar`, `gmail`. Nunca lucide, emojis ni íconos dibujados.
- **Si falta el ícono de un concepto**:
  - vale un **sustituto por cercanía semántica** que no contradiga el concepto. En la ganadora el paso "Estrategia"
    usó `icono-003` (crecimiento: barras que suben) y Lucas aprobó la pieza. Se anota en la tabla de §8 y se le avisa
    a Lucas al mostrarle la pieza;
  - en paralelo se pide el ícono propio: fila en `assets/catalogo/icon-set-prompt.md` y pedido concreto a Lucas. El
    trabajo no se frena esperándolo;
  - si no hay ninguno cercano: en `proceso`, todos los pasos sin ícono (cada paso muestra su número, "01", en serif
    itálica sobre un tile gris). No se probó mezclar pasos con número y pasos con ícono 3D: evitarlo. Un ícono suelto
    o un tachado sin ícono no se pone.
- **Ícono suelto**:
  - entra 2 cuadros antes de la palabra con spring `pop` (escala 0.4→1, −10°→0);
  - flota ±6 px, tiene sombra y sale en 8 cuadros;
  - `pop-b` a 0.055, automático;
  - en la ganadora: 380 px, `centroY` 72, 1500 ms.
- **Tachado**: va **sobre el ícono del concepto, nunca sobre la palabra**. Lucas: "en vez de tachar palabras que se
  repiten... podemos tachar íconos".
  - íconos de 380 px al 70 % del alto; pop a 0.2;
  - a los `strikeDelay` cuadros (14 por defecto) entra la línea roja `#E5484D` a −20°, en 8 cuadros, con
    `tachado` / `tachado-b` a 0.04;
  - después el ícono se apaga a gris;
  - el `hasta` tiene que caer después del último ícono + `strikeDelay` + 8 cuadros. `npm run verificar` no revisa
    esto en los strikes; el chequeo del formato sí.

### 4.8 Sonido (SFX)
- **Cada evento visual lleva su sonido**, con una familia coherente por tipo de evento, por debajo de la voz y
  audible en un celular (contenido por arriba de 200 Hz).
- Lucas: "los efectos de sonido la están rompiendo". Quiere decir que están buenísimos: **más SFX, no menos**.
- **El golpe va en el cierre de la idea**, siguiendo la estructura de la frase. Nunca a ritmo fijo y nunca rematando
  en la frase siguiente.
- `<Sfx>` alinea el golpe perceptible del archivo (`SFX_HIT_SECONDS`) con el ancla. Sin volumen explícito, suena a 0.3.
- **En `props.sfx` van solo 6 entradas**: los 3 del hook, los 2 remates de los giros y el `zoom-punch`. Todo lo demás
  lo emite el código de las escenas y los overlays: escribirlo también en `props.sfx` lo duplica. Dentro de las
  escenas, el sonido se controla con los cues y, en `chat`, con `mudo` y `escribe`.

| Evento | SFX | Volumen | Lo pone |
|---|---|---|---|
| Hook: riser / boom sobre el negro / cola de la palabra | `riser` / `boom-negro` / `archivo` de la cola | 0.14 / 0.2 / 1 | `props.sfx` |
| Remate de un giro | `remate` / `remate-b` | 0.1 / 0.13 | `props.sfx` |
| Zoom rápido del giro | `zoom-punch` | 0.11 | `props.sfx` |
| Entrada / salida de escena | `escena-entra` / `escena-sale` | 0.08 / 0.1 | código (`marco.tsx`) |
| Corte a b-roll | `corte-broll`, `corte-broll-b` | 0.11–0.2 | el overlay `broll` (`sfx`, `volumenSfx`) |
| Ícono suelto | `pop-b` | 0.055 | código (`overlays.tsx`) |
| Ícono tachado / trazo | `pop` / `tachado`, `tachado-b` | 0.2 / 0.04 | código (`overlays.tsx`) |
| Notificación de `pendientes` / pila | `pop` si cae en la entrada, si no `tarjeta`, `-b`, `-c` rotando / `tarjeta-c` | 0.2 o 0.075 / 0.15 | código (`pendientes.tsx`) |
| Paso de `proceso` / chip de estado | `tarjeta`, `-b`, `-c` / `double-click` | 0.045 / 0.2 | código (`proceso.tsx`) |
| `chat`: burbuja / tipeo | `burbuja` / `key-soft`, `key-b` | 0.045 / 0.2, 0.3 | código (`chat.tsx`), con `mudo` y `escribe` |
| `chat`: turno / confirma / recordatorio / calendario / cae | `tarjeta` / `double-click` / `tarjeta-b` / `tarjeta-c` / `tap` | 0.065 / 0.22 / 0.045 / 0.11 / 0.25 | código (`chat.tsx`) |
| `panel`: panel / métrica / frase | `tarjeta` / `counter` / `pop` | 0.09 / 0.16 / 0.2 | código (`panel.tsx`) |
| `cta`: tarjeta / tipeo / publicar / respuesta / cierre | `tarjeta` / `key`, `key-b` / `click` / `tarjeta-b` / `cta-cierre` | 0.09 / 0.16, 0.35 / 0.2 / 0.03 / 0.038 | código (`cta.tsx`) |

- **Vetados en este formato**:
  - `zoom-in`, `zoom-in-corto` y `zoom-out`: nada tipo riser en los zooms. Lucas: "se vuelve a reproducir varias
    veces el rise... de manera rara".
  - `whoosh-cine`, `golpe-grave` y `golpe-seco`: son casi todo sub y en un celular desaparecen.
- **En la escena**: los primeros 14 cuadros no llevan tipeo ni tarjeta, porque los tapa el whoosh de entrada. Si
  dos golpes caen pegados, se silencia el menos importante (`mudo`).
- **Técnico**:
  - los SFX cortos van sin `trimBefore`;
  - los audios que genera el pipeline se escriben en PCM de 16 bits;
  - la mezcla se mide sobre el render real de Remotion (`npm run verificar`).

### 4.9 Música
- **Cama instrumental** desde la primera palabra después del negro hasta el final. Lucas: "falta música instrumental
  de fondo post blackscreen".
- **Mezcla**:
  - `volumen` ~0.13 y `bajoVoz` 0.7 (−3 dB), unos 12 dB debajo de la voz;
  - `fadeInMs` 40 y `fadeOutMs` 1200;
  - `bajoVoz` y `fadeInMs` van siempre explícitos, porque los defaults del tipo (0.4 / 150) no son los del formato.
  - No: ducking de −7.5 dB, que hacía subir y bajar la música con cada frase.
- **Drops**: `musica.md` no trae sus tiempos. Se miden con
  `python formatos/ganador-talking-head/drops-musica.py "<tema>"`, que lista los saltos fuertes de energía (graves y
  banda de celular) y la distancia entre cada par. Mide números, no escucha: el drop lo confirma Lucas.
  - El **1er drop** va en la vuelta del negro: es el `drop1_s` de `nivelar-musica.py`, y la música arranca con la
    primera palabra.
  - El **2º drop** cae solo, en (vuelta del negro) + (drop2 − drop1). No se puede mover sin mover el primero.
- **Elección**, en este orden (Lucas decide a oído):
  1. **Derechos**: libre o de biblioteca, antes que "sin confirmar", antes que comercial. Si es comercial, avisar el
     riesgo de mute. Los dos ganadores figuran "sin confirmar" en `musica.md`. METAMORPHOSIS es phonk comercial según
     CLAUDE.md §8 y Lucas lo eligió igual. De Echo Sax End no se sabe: preguntarle.
  2. **Largo**: desde el 1er drop tiene que quedar al menos (duración de la pieza − vuelta del negro) de tema.
  3. **2º drop**: preferir el tema cuyo (drop2 − drop1) ≈ (corte de la tesis − vuelta del negro), ±0.3 s. Si ninguno
     encaja, el 2º drop se resigna: queda donde caiga y se le avisa a Lucas.
  4. **Preferir los "ganador"** y, entre temas parecidos, el que Lucas ya aprobó.

  Los dos ganadores, medidos el 2026-09-24:

  | Tema | Drops | Distancia | Encaje en la ganadora |
  |---|---|---|---|
  | `METAMORPHOSIS ganador.mp3` (musica-056), 142.8 s | 11.0, 54.9, 98.7 s | 43.9 s (11.0→54.9) | vuelta del negro 3.15 s ("y"), corte de la tesis 46.97 s: 43.82 s. El 2º drop cayó en 47.04 s, 0.07 s después del corte ("cae solo", CLAUDE.md §8) |
  | `Echo Sax End ganador.mp3` (musica-022), 77.2 s | 38.7 s (+27 dB en la banda de celular, casi nada en graves), 66.7 s | 28.0 s | no usado. Desde 38.7 s quedan 38.5 s de tema: no alcanza para una pieza de 55 s si arranca ahí |

- **La cama es uniforme**: "tiene que ser uniforme, simétrico". Si el tema tiene más de 8 dB de dinámica, se nivela
  con `nivelar-musica.py`, que trabaja en la banda de 200 Hz a 4 kHz. En la ganadora quedó ±0.5 dB.
  - Argumentos: `<tema> <drop1_s> <largo_s> <salida.m4a> <referencia_s>`. `largo_s` ≥ duración de la pieza − vuelta
    del negro, redondeado para arriba. `referencia_s` = segundos desde el drop hasta el momento que Lucas marca como
    "así se tiene que escuchar". Sin marca de Lucas, proponer un tramo pleno después del 1er drop y confirmarlo a oído.
  - Ganadora, exacto:
    `python scripts/nivelar-musica.py "PACKS/MÚSICA DE FONDO/METAMORPHOSIS ganador.mp3" 11.053 54 public/recursos/musica-056-nivelada.m4a 12.85`.
    `12.85` es el segundo 16 de la pieza (16 − 3.15), el que marcó Lucas: "la música se tiene que escuchar como en el
    segundo 16". En `props.json`: `inicioS` 0, `volumen` 0.129.
  - No: igualar por energía total. En el phonk el 808 se lleva todo y así "ni se escucha".
- **Técnico**: la música lleva `trimBefore` y no arranca con la `Sequence` en negativo. Así quedó muda 8 s de más:
  "arranca mucho después del black screen y ni se escucha".

### 4.10 CTA
- **Escena `cta`**: va desde **la primera palabra con contenido del CTA −350 ms** hasta `"fin"`, sin salida. El
  recorte del que habla queda hasta el último cuadro.
  - En la ganadora es "querés" −350 = 51.20 s. "Si" es funcional y no cuenta, igual que "El" en `pendientes` y "Un"
    en `chat`.
  - La entrada de la escena (14 cuadros) tapa el corte de toma del CTA: en la ganadora, el corte de 51.47 s cae 8
    cuadros después del `desde`. El chequeo lo lista.
- **Secuencia**:
  1. gancho literal (serif + sans);
  2. tarjeta de comentario de Instagram (`tarjeta` 0.09);
  3. la palabra clave se tipea desde el fin de "comentá";
  4. "Publicar" con `click` 0.2;
  5. respuesta de la cuenta (`tarjeta-b`);
  6. chip "enviado" con `cta-cierre`.
- **Antes del CTA**: la tesis de cierre (zoom largo + ícono + b-roll emocional) entrega sin corte. El `hasta` del
  b-roll es el `desde` del CTA.

### 4.11 Corte (criterio de Lucas, de sus 21 recortes)
- **Ritmo casi sin aire**: entre frases deja de 0.02 a 0.12 s (mediana 0.06 s).
- **Qué se va siempre**:
  - el tropiezo: el intento fallido **y** la pausa que le sigue;
  - las voces fuera de cámara ("dale", "graba");
  - las frases leídas, aunque estén en el guion. Prefiere naturalidad a completitud.
- **El porqué está en la nota** del recorte, no en el chip de motivo. Si no hay nota, se le pregunta.
- **Nunca borrar ni "limpiar" `cortes/<slug>-recortes.json`.**
- **Bordes con voz a los dos lados**: `recortar.mjs` los avisa y se revisan con él.

### 4.12 Técnica de proceso
- **Trabajos pesados** (whisper, `silueta.py`, renders) siempre por `node scripts/turno.mjs`, de a uno.
- **Render**: `--concurrency=1 --offthreadvideo-cache-size-in-bytes=300000000 --timeout=120000`.
- **Videos intermedios**: 30 fps constantes, `-g 30 -bf 0`.
- **Si cambia `video.mp4`**: se vuelven a correr `cara.py` y `silueta.py`.
- **Studio**: después de tocar audio o composición, `npm run verificar -- <slug>` lo abre en Chrome headless en
  1677x930 y 900x1800 antes de pedirle a Lucas que recargue.

---

## 5. Pipeline paso a paso

Todo corre desde `D:/Dev/videos/video-editor` en Git Bash.

- Etiquetas: **[auto]** = script, **[editor]** = decide el agente, **[Lucas]** = criterio humano, **[compuerta]** =
  si falla, no se sigue.
- Las cadenas de comandos van con `set -o pipefail` y sin `| tail`.

**0. Arranque [editor]**
1. Leer CLAUDE.md §7 y §8 y este README.
2. `mkdir -p public/piezas/<slug>`.
3. Registrar el slug en `PIEZAS` de `src/pieza/pieza-root.tsx`
   (`const PIEZAS = ["estructura-nexora", "<slug>"] as const;`). Es la única edición de código por pieza.
4. Los MOV crudos no se mueven ni se renombran.

**1. Tomas [editor propone, Lucas decide]**
1. [auto] Transcripción exploratoria por clip:
   `node scripts/turno.mjs python scripts/transcribir.py "<base>/<clip>.MOV" out/transcripciones/<clip>.json --modelo medium --prompt "Nexora, WhatsApp, <términos>"`
   Tarda ~1.25 × la duración del audio.
2. [editor] Escribir `cortes/<slug>.json` en el orden del guion:
   `{ "base": "<carpeta>", "cortes": [{ "archivo", "desde", "hasta", "nota" }] }`
   - Se elige la última toma completa, o la que el equipo aprueba en voz alta ("ahí está").
   - La `nota` lleva la frase literal y el porqué de la elección.
3. [compuerta] Verificar cada borde sobre el clip original. `desde` y `hasta` tienen que caer en silencio:
   `ffmpeg -hide_banner -ss <desde-1> -t <largo+2> -i "<base>/<clip>" -vn -af silencedetect=noise=-40dB:d=0.2 -f null - 2>&1 | grep silence_`
   Además, leer entera la transcripción de cada toma: whisper colapsa tiempos.
4. [Lucas] Aprueba tomas y orden.

**2. Montaje y jumpcut [auto]**
1. `node scripts/montar.mjs cortes/<slug>.json out/<slug>-bruto.mp4`.
   [compuerta]
   - El log dice `(HDR -> SDR)` en cada clip de iPhone.
   - `ffprobe` da 1080x1920, 30/1, y audio y video a menos de 50 ms.
   - `freezedetect` da 0.
2. `node scripts/jumpcut.mjs out/<slug>-bruto.mp4 public/piezas/<slug>/video-jc.mp4 --dry`. Lo normal es recortar
   entre 9 y 25 %.
3. `node scripts/jumpcut.mjs out/<slug>-bruto.mp4 public/piezas/<slug>/video-jc.mp4 --uniones cortes/<slug>-uniones.json`.
   Defaults: −40 dB, mínimo 0.3 s, margen 0.06 s. `video-jc.mp4` no se toca más.
   [compuerta] `ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate,avg_frame_rate,has_b_frames -of default=nw=1 public/piezas/<slug>/video-jc.mp4`
   tiene que dar `30/1`, `30/1` y `has_b_frames=0`.

**3. Transcripción y corrección**
1. [auto] `node scripts/turno.mjs python scripts/transcribir.py public/piezas/<slug>/video-jc.mp4 public/piezas/<slug>/words.raw.json --prompt "Nexora, WhatsApp, <términos>"`
   Usa large-v3, frase por frase. Tarda ~4 min por 66 s.
2. [auto] `node scripts/corregir.mjs public/piezas/<slug>` genera `words.jc.json`.
3. [auto] `node scripts/trabas.mjs public/piezas/<slug>` genera `trabas.json`.
4. [editor] Leer la transcripción entera contra el audio y corregir en `public/piezas/<slug>/correcciones.json`:
   - `reemplazos`: si tienen la misma cantidad de palabras, conservan los tiempos.
   - **Voseo**: usás, tocás, cambiás, **fijate**. El diccionario global (`scripts/correcciones.json`) ya corrige
     usás, tocás y cambiás, pero no "fíjate", que es la forma de tuteo que escribe whisper. En la ganadora quedó
     "fíjate" en el subtítulo por omisión. La forma del formato es **"fijate"**, como el resto del diccionario y
     como escribe Lucas. Mientras no esté en el diccionario global, va en el de la pieza: `["fíjate", "fijate"]`.
     Después, las anclas usan "fijate".
   - `inserciones`: palabras que whisper se comió en un corte duro, con tiempos medidos.
   - `tramos`: tropiezos que whisper colapsó, con tiempos sobre la energía cada 20 ms.

   Después se vuelve a correr `corregir.mjs`. **No re-transcribir salvo que cambie el montaje.**

**4. Recorte manual y aplicación**
1. [Lucas] `npm run recortador -- <slug>` abre http://localhost:3100 y guarda `cortes/<slug>-recortes.json`. Más
   adelante esto va a pasar a `D:\Dev\intelligent-cut-studio`, que genera el mismo archivo.
2. [editor] Leer las notas y el `contexto` de cada recorte y anotar en §8 las reglas nuevas. Si un recorte no tiene
   nota, preguntar.
3. [editor] Copiar `props.template.json` a `public/piezas/<slug>/props.json` y completar **solo `pausas`**. `tras` se
   resuelve contra `words.jc.json`, y su `n` se cuenta ahí.
4. [auto] `node scripts/recortar.mjs public/piezas/<slug> --dry`. Revisar la línea `+ negro 0.9s en …` y los avisos
   `⚠ … voz sonando a los dos lados`; esos avisos se revisan **con Lucas**.
5. [auto] `node scripts/recortar.mjs public/piezas/<slug>`. Genera:
   - `video.mp4`;
   - `words.json` remapeado;
   - `mapa-tiempos.json`;
   - `durationSeconds` actualizado.

   Con `--palabras` solo remapea, sin recodificar.

**5. Cara y silueta [auto]** (se rehacen cada vez que cambia `video.mp4`)
1. `python scripts/cara.py public/piezas/<slug>` genera `cara.json` en ~30 s.
   [compuerta] La cara tiene que aparecer en casi todos los cuadros.
   Los falsos positivos de un solo cuadro (en la ganadora, el cuadro 63: ojos en y=1375 y 566 px de ancho contra ~325
   alrededor) aparecen como cortes en `cara.json.cortes`. `cara.py` no los filtra; el chequeo del formato los marca.
2. `node scripts/turno.mjs python scripts/silueta.py public/piezas/<slug>` genera `persona.webm`. Tarda ~4 min por
   minuto de video.

Si después cambian los recortes o las `pausas`, se repiten 4.4 a 5.2, en orden.

**6. props.json [editor arma, Lucas aprueba en Studio]**
1. **Cortes y beats**. Correr `node formatos/ganador-talking-head/chequeo-formato.mjs public/piezas/<slug>`. Con el
   template recién copiado da ✖ por los placeholders, pero su sección 2 ya lista los cortes:
   - cada corte de `cara.json.cortes` con su segundo (cuadro / 30);
   - descarta los falsos positivos de YuNet;
   - marca los que caen en el negro, bajo una escena o un b-roll, y los que quedan sobre la cara. Las escenas y los
     b-rolls cuentan a medida que se cargan: volver a correrlo en cada paso.

   Con esa lista y los tiempos de `words.json`, clasificar cada línea del guion con la gramática (§3) y escribir la
   lista de beats.
2. Completar el template en este orden:
   1. hook: zooms, riser, boom y cola;
   2. `musica`;
   3. cadena de zooms del cuerpo;
   4. escenas;
   5. b-roll / strike / icono;
   6. remates;
   7. `subtitulos`.

   Cada `"n": "<contar>"` se reemplaza por la aparición contada en `words.json` (se puede borrar si la palabra
   aparece una sola vez). Borrar los bloques que el guion no pida y **re-encadenar**: tabla "Anclas prestadas" (§3)
   y reglas de §4.3.
3. **Cola del hook**: `python scripts/cola-reverb.py public/piezas/<slug>/video.mp4 <inicio−0.02> <fin> public/piezas/<slug>/cola-<palabra>.wav 1.3 <largo> 230 4`.
   `largo` = (inicio de la primera palabra después del negro − (inicio de la palabra − 0.02)) + 0.2 (§4.2). En la
   ganadora: `video.mp4 2.07 2.27 … cola-no.wav 1.3 1.28 230 4`.
4. **Música**: `python formatos/ganador-talking-head/drops-musica.py "<tema>"` para elegir (§4.9), y después
   `python scripts/nivelar-musica.py "<tema>" <drop1_s> <largo_s> public/recursos/<id>-nivelada.m4a <referencia_s>`.
   En la ganadora: `"PACKS/MÚSICA DE FONDO/METAMORPHOSIS ganador.mp3" 11.053 54 public/recursos/musica-056-nivelada.m4a 12.85`.
5. **Recursos**: `npm run recursos -- usar <id> <slug>` para cada b-roll, ícono o tema, y `describir` lo que no esté
   descripto.
6. **Íconos que faltan**: sustituto por cercanía semántica si hay uno (§4.7) y, en paralelo, una fila en
   `assets/catalogo/icon-set-prompt.md` y un pedido concreto a Lucas. Cuando lleguen:
   `node scripts/turno.mjs python scripts/recortar-iconos.py <lamina.png> PACKS/ICONOS "<nombres>"`,
   después `npm run recursos -- escanear` y `usar`.
7. [compuerta] **Chequeo del formato**: `node formatos/ganador-talking-head/chequeo-formato.mjs public/piezas/<slug>`
   tiene que dar **0 ✖**, con cada ⚠ revisado. Sale con 1 si hay algún ✖. Mira lo que `npm run verificar` no mira:
   1. **anclas**: placeholders y `n` sin completar; palabras repetidas sin `n` explícito, con todas sus apariciones y
      su segundo; rangos invertidos de zooms, escenas y b-rolls; `hasta` de un strike antes de sus íconos o que corta
      el trazo; cues fuera de su escena;
   2. **cortes**: la lista de 6.1. Avisa el jump cut sobre la cara que no arranca un zoom (invariante 2);
   3. **zooms**: para cada uno, el corte más cercano a su inicio (tiene que dar 0 cuadros si arranca en un corte) y
      cada salto de escala, tapado o a la vista;
   4. **acentos** que no se ven, porque todas sus apariciones caen bajo escenas;
   5. **pausas**: dónde cae el negro según `words.jc.json` (`recortar.mjs`) y según `words.json` (`verificar.mjs`),
      comparado con el negro real de `mapa-tiempos.json`.

   En la ganadora da `0 ✖ · 8 ⚠`, todos conocidos: 5 anclas sin `n` que igual caen bien ("instalamos", "negocio",
   "estructura", "para"), el salto de escala al salir `chat` y los 2 acentos que no se ven.

**7. Verificación (antes de mostrarle a Lucas)**
1. [compuerta] `npm run verificar -- <slug>`. Flags: `--sin-audio`, `--sin-studio`, `--sin-stills`, `--camara`. Tarda
   ~10 min por el render de la mezcla, que va por `turno.mjs` y se reutiliza si es más nueva que `src/` y la pieza.
   Deja el informe en `out/verif/<slug>/informe.md` (y `.json`) y sale con 1 si hay algún ❌. Revisa:
   - tipos (`tsc --noEmit`);
   - anclas: que resuelvan en `words.json` y caigan dentro de la pieza, y rangos invertidos de zooms, escenas y
     b-rolls (no de strikes: eso lo ve el chequeo del formato);
   - archivos de `props.json` y nombres de SFX;
   - reglas de código de CLAUDE.md §7: SFX sin `trimBefore`, `volume` que aguanta cuadros negativos, riser solo en
     el hook;
   - Studio en Chrome headless, en 1677x930 y 900x1800 (usa el de :3000 o levanta uno en :3123): sin errores en la
     página ni en la consola. Reemplaza la revisión manual con Playwright;
   - la mezcla renderizada por Remotion, en la banda de celular: música presente y pareja, margen de 9 a 15 dB bajo
     la voz, enmascaramiento, cola sonando en el negro, pico y LUFS, SFX audibles;
   - fotogramas clave con un solo bundle → `hoja.jpg`: fin del hook, mitad del negro, primer cuadro después, mitad
     de cada escena y b-roll, íconos, tachados y último cuadro;
   - con `--camara`: renderiza el tramo de cara sola más largo (hasta 10 s), corre `analizar-camara.py` y compara
     ojos (objetivo x 0.5, y 0.3), dispersión y temblor contra la referencia de CLAUDE.md §5.

   Referencia de la ganadora: "⚠️ 1 con avisos". Margen de 12.5 dB bajo la voz, 4 tramos cortos de enmascaramiento,
   2 SFX de tachado que no sobresalen de la cama; ojos en 0.500 / 0.299, temblor 3.96 px contra 3.33 de la
   referencia. Un ⚠️ se arregla en la pieza o se le explica a Lucas: no se esconde.
2. **Mirar `out/verif/<slug>/hoja.jpg`**:
   - el subtítulo es legible y no tapa la cara;
   - no hay bordes negros;
   - el texto de las escenas no está cortado;
   - los íconos tienen fondo transparente;
   - el b-roll no contradice la frase.

   Para un cuadro que la hoja no trae (el pico de cada zoom, un cue de escena +10), con el segundo que imprime el
   chequeo × 30: `node scripts/turno.mjs npx remotion still src/index.ts <slug> out/verif/<slug>-f<N>.png --frame=<N> --timeout=120000`.
3. **Curvas de cámara** (opcional, después de `--camara`):
   `python scripts/curvas-camara.py out/verif/<slug>/camara-analisis.json out/verif/<slug>/camara-curvas.png`.
   `verificar` no mide el ancho de la cara: el criterio de "cara ≈ 0.26 del ancho fuera de los zooms" se mira en
   las curvas. Para un video cualquiera, sin `verificar`:
   `node scripts/turno.mjs python scripts/analizar-camara.py <video.mp4> <salida.json>` y después
   `python scripts/curvas-camara.py <salida.json> <salida.png>`.
4. [Lucas] Mira y da notas.
   - Cada nota va a §8 **en el momento**, con fecha y sus palabras.
   - Después de corregir, se repiten el chequeo del formato y `npm run verificar` (con `--sin-audio` si no se tocó
     sonido).
   - Después de tocar `props.json`, Lucas tiene que recargar Studio.

**8. Export**
1. **Render**: `node scripts/turno.mjs npx remotion render src/index.ts <slug> out/<slug>-v<N>-crudo.mp4 --timeout=120000 --concurrency=1 --offthreadvideo-cache-size-in-bytes=300000000 --log=error`
   Tarda 7–10 min para 55 s.
2. **Master**: `node scripts/master.mjs out/<slug>-v<N>-crudo.mp4 out/<slug>-v<N>.mp4`, con loudnorm en dos pasadas.
   [compuerta] I −14 ±0.5 LUFS, TP ≤ −1.5 dBTP, `modo: lineal` y audio a 48 kHz. Si aparece un `AVISO … no el
   lineal`, buscar el SFX saturado.
3. **Copia liviana**: `ffmpeg -v error -y -i out/<slug>-v<N>.mp4 -c:v libx264 -preset slow -crf 24 -maxrate 4M -bufsize 8M -pix_fmt yuv420p -c:a copy -movflags +faststart out/<slug>-v<N>-para-mostrar.mp4`.
   Tiene que pesar menos de 30 MB. Para piezas de más de 55 s, `-maxrate 3M`.
4. **Cierre**:
   - mandarle la copia liviana a Lucas;
   - anotar en §8 la versión y qué cambió;
   - anotar en §7 los fallos no obvios;
   - escribir el log del día en el vault.

---

## 6. Checklist de entrega

**Contenido**
- [ ] Todo texto en pantalla sale de `words.json`: no hay cifras, clientes, resultados ni promesas que no se digan.
- [ ] Los datos de maqueta son ilustrativos y Lucas los vio.
- [ ] Ningún b-roll contradice la frase. Es live action, 1080x1920, y su `inicioS` se eligió mirando la ventana exacta
      del corte. Quedó descripto en la biblioteca.
- [ ] Los íconos son premium o logos oficiales. Nada de lucide ni emojis. Los sustitutos se le avisaron a Lucas.
- [ ] La música la eligió Lucas. Si es comercial, se avisó el riesgo.

**Corte**
- [ ] Las tomas las aprobó Lucas, con los bordes verificados con `silencedetect`.
- [ ] `cortes/<slug>-recortes.json` está intacto y aplicado, y los avisos de bordes con voz se revisaron con Lucas.
- [ ] No quedan trabas, voces fuera de cámara ni frases leídas. Las pausas entre frases son de 0.02–0.12 s.
- [ ] La transcripción se leyó entera, con las correcciones en el `correcciones.json` de la pieza y el voseo correcto
      (incluido "fijate").

**Hook y apertura**
- [ ] Hay un zoom obvio 1.0→~1.9 durante la frase del hook.
- [ ] El riser sube con la frase y se corta en seco en el fin de la última palabra.
- [ ] Hay un negro de 0.9 s con `boom-negro` y la cola de la última palabra, que se apaga cuando vuelve la voz.
- [ ] La música entra con la primera palabra después del negro, en el drop.

**Imagen**
- [ ] `cara.json` y `persona.webm` son posteriores al último `video.mp4`, y la cámara medida da los ojos en (0.50, 0.30).
- [ ] Los zooms van encadenados: retrato en los remates y zoom out desde el retrato con `salida`. Nada vuelve en seco.
- [ ] Cada jump cut sobre la cara arranca un movimiento, y ningún hueco de más de 2.8 s queda sin evento.
- [ ] Las escenas van en lo que se puede mostrar, con el recorte del que habla (no en un círculo) y cada elemento en
      su palabra.
- [ ] Los tachados van sobre íconos, no sobre palabras.
- [ ] Se revisó `hoja.jpg` y los cuadros puntuales que hicieron falta.

**Subtítulos**
- [ ] Satoshi Black sin fondo, al 54 % del alto, con jerarquía de tamaños y cada palabra apareciendo cuando se dice.
- [ ] Lucas aprobó los acentos, y ninguno cae solo bajo escenas.
- [ ] `words.json` coincide con el audio después del recorte.

**Sonido**
- [ ] `props.sfx` tiene solo el hook, los remates de los giros y el `zoom-punch`. No hay nada tipo riser fuera del
      hook ni SFX vetados.
- [ ] Hay remates sonoros solo en los giros, 20–90 ms después del fin de la idea.
- [ ] La mezcla de `npm run verificar` queda entre 9 y 15 dB bajo la voz y la cama es pareja.
- [ ] El 1er drop cae en la vuelta del negro, el 2º donde lo pone el tema (en el corte de la tesis si el tema encaja),
      y el fade-out es de 1.2 s.

**Técnico y entrega**
- [ ] `chequeo-formato.mjs` da 0 ✖ y cada ⚠ se revisó.
- [ ] `npm run verificar` no da ❌, y cada ⚠️ se arregló o se le explicó a Lucas.
- [ ] El master da −14 LUFS ±0.5, TP ≤ −1.5 dBTP, modo lineal y 48 kHz. La copia liviana pesa menos de 30 MB.
- [ ] Las notas de Lucas están en §8 con fecha, los fallos en §7 y el log del día en el vault.

---

## 7. Qué se decide por pieza

| Decisión | Quién | Cómo |
|---|---|---|
| Tomas y orden | editor propone, Lucas decide | última toma completa o la aprobada en voz alta; bordes con `silencedetect` |
| Recortes | Lucas | recortador; el editor aprende de las notas |
| Mapa de beats | editor | gramática de §3 con los cortes del chequeo. Se pueden usar de 0 a 5 escenas (la ganadora usó las 5). Si algo mostrable no encaja, se propone una escena nueva y **se consulta antes de construirla** |
| Música | Lucas a oído | el editor propone con §4.9: derechos, largo desde el drop, (drop2 − drop1) contra (corte de la tesis − vuelta del negro), medido con `drops-musica.py`. Por pieza se deciden el 1er drop, la referencia de nivel y si se nivela (dinámica > 8 dB) |
| Riser | editor, y Lucas si hay duda | `riser` si el hook dura unos 2.2 s; si es más largo, consultar (`sfx-cine-024` u otros de Cine SFX) |
| Íconos | editor lista, Lucas genera | cruzar los conceptos (pasos, tachados, tesis) contra `icono-001`–`016`. Si falta uno: sustituto por cercanía semántica (avisándole a Lucas) y, en paralelo, fila en `icon-set-prompt.md` y pedido concreto. Sin sustituto posible, `proceso` va sin íconos en todos los pasos (§4.7) |
| B-rolls | editor | unos 3 (hook por tono, solución por la metáfora del verbo, cola de la tesis emocional), live action y 1080x1920, con el catálogo y la tira de la ventana exacta (§4.6) |
| Acentos | editor propone, Lucas decide | sustantivo del concepto + "vos" + las X de las objeciones; solo sobre cara o b-roll |
| Datos de maqueta | editor propone, Lucas confirma | nombres ficticios, horas coherentes con lo que se dice, cifras del panel reales o claramente de ejemplo |
| Palabra del CTA | el guion | literal, en mayúsculas |
| `pip` y fuente | editor | `abajo-izquierda` y `satoshi` por defecto |

---

## 8. Referencias

**La pieza terminada**
- `out/estructura-nexora-v4.mp4`: master. También están `-v4-crudo.mp4` y `-v4-para-mostrar.mp4`.
- `public/piezas/estructura-nexora/`:
  - `props.json`, `words.json`, `words.jc.json`, `correcciones.json`;
  - `cara.json`, `mapa-tiempos.json`, `persona.webm`, `cola-no.wav`.
- `cortes/estructura-nexora.json` (17 tomas) y `cortes/estructura-nexora-recortes.json` (21 recortes de Lucas).
- `out/verif/estructura-nexora/informe.md`: la salida de `npm run verificar` sobre la ganadora.

**Catálogos** (`assets/catalogo/`)
- `brolls.md`: 393 clips, con índice por concepto, planos, "mejor inicio" y qué evitar. Tiras en `out/verif/broll-tiras/<id>.jpg`.
- `sonidos.md`, `musica.md` (BPM, dinámica, derechos; "ganador" marcado; sin drops: §4.9), `iconos.md`, `fuentes.md`.
- `icon-set-prompt.md`: el prompt del icon set.
- La fuente de verdad es `assets/biblioteca.json`.

**Íconos premium** (`PACKS/ICONOS/`, se copian a `public/recursos/<id>.png`)

| id | concepto | id | concepto |
|---|---|---|---|
| icono-001 | bot | icono-009 | plantilla |
| icono-002 | cámara (grabación) | icono-010 | presupuesto |
| icono-003 | crecimiento; también "estrategia" (sustituto aprobado en la ganadora) | icono-011 | privado (sobre con candado) |
| icono-004 | edición | icono-012 | publicación |
| icono-005 | estructura (bloques) | icono-013 | recordatorio (campana) |
| icono-006 | guion | icono-014 | sistema (engranajes) |
| icono-007 | mensaje de noche | icono-015 | turno (calendario) |
| icono-008 | panel | icono-016 | videos sueltos |

**Código**
- `src/pieza/pieza-root.tsx`: `PIEZAS`.
- `src/pieza/pieza-composition.tsx`: `CAMARA`, capas y cómo se combinan los zooms (entre dos zooms la escala vuelve a 1).
- `src/pieza/types.ts` (esquema de `props.json`), `anclas.ts`, `cara.ts`, `captions-vertical.tsx`, `overlays.tsx`,
  `musica.tsx`.
- `src/pieza/escenas/`: `fondo.tsx`, `marco.tsx`, `registry.ts`, `tipos.ts` y las 5 escenas, con `Datos` y `PREVIEW`.
- `src/reserva/components/sfx.tsx`: `SFX_FILES` y `SFX_HIT_SECONDS`.

**Scripts**
- Del formato (`formatos/ganador-talking-head/`): `chequeo-formato.mjs`, `drops-musica.py`.
- Del proyecto (`scripts/`):
  - `montar.mjs`, `jumpcut.mjs`, `transcribir.py`, `corregir.mjs`, `trabas.mjs`, `recortador.mjs`, `recortar.mjs`;
  - `cara.py`, `silueta.py`, `cola-reverb.py`, `nivelar-musica.py`, `recortar-iconos.py`, `tiras-broll.py`;
  - `verificar.mjs` (`npm run verificar`), `verificar.py`, `verificar-stills.mjs`;
  - `analizar-camara.py`, `curvas-camara.py`, `master.mjs`, `turno.mjs`, `recursos.mjs`.

**Contrato**: CLAUDE.md §3a (pipeline), §7 (fallos) y §8 (dirección de Lucas y nota de la pieza).

### 8.1 Fuentes que no coinciden

En todos los casos mandan el código y `props.json`.

1. **Acento del subtítulo**: el código usa ×1.3 (`SCALE_ACCENT`); CLAUDE.md §8 dice 1.2x.
2. **Tamaño del ícono tachado**: 380 px (`TAM_ICONO_TACHADO`); el comentario de `StrikeOverlay` en `types.ts` dice
   "Default 300".
3. **SFX del trazo del tachado**: `tachado` / `tachado-b` (`overlays.tsx`); CLAUDE.md §3a dice `trazo`.
4. **Cola del "no"**: `props.json` usa `cola-no.wav`; CLAUDE.md §8 nombra `no-eco.wav`. `no-eco*.wav` y
   `no-reverb.wav` son pruebas anteriores.
5. **`master.mjs`**: la constante está en −1.5 dBTP, pero el comentario de cabecera dice −1 y CLAUDE.md §3a dice
   "pendiente".
6. **`iconos.md` §1** dice que `PACKS/ICONOS/` no existe; ya están `icono-001`–`016` en la biblioteca.
7. **`musica.md`**:
   - marca METAMORPHOSIS con derechos "sin confirmar", pero CLAUDE.md y la biblioteca dicen comercial;
   - todavía lista ANBR Quantum como usado, aunque se reemplazó;
   - no trae los tiempos de los drops: se miden con `drops-musica.py` (§4.9).
8. **Defaults de `MusicaConfig`**: `bajoVoz` 0.4 y `fadeInMs` 150 no son los del formato (0.7 y 40).
9. **`verificar.mjs` existe** (`npm run verificar`), aunque la versión anterior de este README decía que no. Resuelve
   `pausas.tras` contra `words.json`, mientras que `recortar.mjs` lo resuelve contra `words.jc.json`, que es lo que
   define el negro. Si un recorte de Lucas se lleva una aparición anterior de la palabra, el `n` deja de coincidir y
   `verificar` mide el negro en otro lugar (o da la pausa como sin resolver). En la ganadora coinciden. El chequeo del
   formato muestra las dos resoluciones contra el negro real de `mapa-tiempos.json`. Arreglarlo en `verificar.mjs`
   queda pendiente.
10. **B-rolls contra el catálogo**: `broll-201` usa `inicioS` 3.5 (el catálogo dice 3.75) y `broll-187` usa 0.5 (el
    catálogo dice 2 y pide evitar el primer segundo, con brazos tapando el cuadro). Lucas los aprobó así. En una pieza
    nueva manda la ventana mirada (§4.6). CLAUDE.md §8 habla de 332 b-rolls y el catálogo tiene 393.
11. **`pip`**: el código acepta `abajo-izquierda`, `abajo-derecha` o `ninguno` (`PosicionPip` en
    `src/pieza/escenas/tipos.ts`), y CLAUDE.md §3a en disco dice lo mismo. Si una copia vieja del contrato (por
    ejemplo, un contexto cargado al arrancar la sesión) menciona `arriba-derecha` o `pipFoco`, no existen.
12. **"fíjate"**: la ganadora dejó la forma de tuteo en el subtítulo; el formato usa "fijate" (§5, paso 3.4). El
    diccionario global todavía no lo corrige.
13. **Margen de la mezcla**: la versión anterior de este README daba 14.8 dB para la ganadora, medido con otro script;
    `npm run verificar` mide 12.5 dB (mediana, con otras ventanas y otra máscara de habla). El objetivo es el de
    `verificar`: 9–15 dB.
