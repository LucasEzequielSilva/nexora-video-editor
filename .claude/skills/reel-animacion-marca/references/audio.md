# Audio

El audio vive **dentro de la animación** (`AnimacionMarca`): el MP4 `<slug>-16x9` ya sale con música y efectos. El empaque (laptop) no agrega nada: el cierre queda en silencio.

## Lo que se midió en los 11 reels
- Loudness integrado −14.3 a −14.8 LUFS, parejo en todos.
- El **cierre va en silencio** (~4 s finales sin señal por encima de −45 dB).
- Picos entre +0.4 y +1.3 dBFS: saturan. No imitarlos.

## Lo que NO se midió
Género de la música, BPM, cantidad y tipo de golpes. Antes de afirmar algo de eso: `ffmpeg -i <reel> -af ebur128=peak=true -f null -` para nivel y `silencedetect` para el silencio.
Lo que funcionó en otros reels de motion: música pareja, pocos golpes graves y fuertes, comienzo con tensión casi en silencio.

## Receta
1. **Música**: cama instrumental pareja (dinámica < 8 dB), derechos libres o de biblioteca.
   ```ts
   audio: { musica: { archivo: "recursos/musica-068.m4a", volumen: 0.5, desdeS: 8.31 } }
   ```
   - `desdeS` = segundo del tema donde cae un **tiempo fuerte**; así el primer cuadro de la pieza es un golpe de música.
   - Hay fundido de entrada (8 cuadros) y de salida (~1,3 s antes del final). El `volumen` es un punto de partida: se ajusta midiendo el render.
2. **Sincronizar los cortes con el pulso**: medir los tiempos fuertes del tema y escribir las duraciones en tiempos (`compas(n, bpm)`, ver `guion-y-beats.md`).
   ```py
   # librosa: beats y bombos (python -I)
   y, sr = librosa.load("tema.wav", sr=22050)
   tempo, beats = librosa.beat.beat_track(y=y, sr=sr, start_bpm=117.5, tightness=300, units="time")
   ```
   Quantum (ANBR, 117,5 BPM): tiempos fuertes en 8,313 s + k × 0,5106 s.
3. **Efectos automáticos** (`audio.auto`): el kit calcula el momento de cada evento y alinea el golpe del sonido con él.
   | clave | evento | efecto de ejemplo | volumen | `golpeS` |
   |---|---|---|---|---|
   | `transicion` | corte entre beats | `escena-entra.wav` | 0.47 | 0.506 |
   | `notificacion` | cada notificación del teléfono | `tarjeta.wav` | 0.47 | 0.07 |
   | `burbuja` | cada mensaje del chat | `burbuja.wav` | 0.47 | 0.047 |
   | `turno` | cada turno que cae en la agenda | `tap.wav` | 0.30 | 0.01 |
   | `numero` | el contador aterriza | `remate.wav` | 0.50 | 0.124 |
   | `remate` | la palabra del beat `heroe` | `remate-b.wav` | 0.50 | 0.122 |
   | `clic` | el clic del cursor | `click.wav` | 0.36 | 0.01 |
   | `logo` | entra el logo | `cta-cierre.wav` | 0.48 | 0.025 |
   Los archivos de la tabla son del proyecto donde nació la skill: usá los tuyos con el mismo carácter (whoosh corto, pop, tap, click) y normalizalos a −3 dBFS de pico para que valgan estos volúmenes.
   `golpeS` = segundo **dentro del archivo** donde cae el golpe (medido sobre la onda); sin él, el archivo empieza en el evento.
   **Mezcla medida (2026-11-11):** los SFX de ejemplo están normalizados a −3 dBFS de pico y la música Quantum a volumen 0.5 da RMS −22,4 dB y pico −11,4 dB. Con SFX a 0.3 los golpes quedaban *debajo* del pico de la música (no se oían). Pero **hay un techo**: con −14 LUFS y −1,5 dBTP el master necesita ~+6 dB de ganancia, así que ningún pico puede pasar de −9,2 dBFS antes del master, solo ~2 dB sobre el pico de la música. Con volúmenes de 0.55–0.7 el limitador del master recortó 4,8 dB y aplastó los golpes. Por eso van a **0.47–0.5** (pico ≈ −9,5 dBFS) y el realce lo da el ducking. Mirar siempre cuánto recorta el limitador del master: si recorta más de 3 dB, bajar los SFX (medido: 4,8 dB aplastó todos los golpes; 2,8 dB solo en el golpe del contador pasó sin problema).
   **Los `turno` son textura, no golpes:** 7 ticks seguidos a 0.30 no suben el pico de banda completa (quedan al nivel de la música), pero en la banda de 2–8 kHz, la que se oye en un celular, quedan 6–13 dB sobre el hueco entre ticks (medido en la v2 de Turnix). Medirlos ahí, no por pico. Subirlos más los vuelve ruido.
   **Ducking automático:** la música baja alrededor de cada golpe (ataque 3 cuadros antes, suelta en 12): −4 dB en transiciones, −6 dB en remate y número, −3 dB en notificaciones, −2,5 dB en burbujas, −1,4 dB en turnos. Con eso cada efecto queda 6–10 dB sobre la música sin subirlo. `audio.duck` (0–1) multiplica la profundidad; `0` lo apaga.
4. **Efectos manuales** (`audio.sfx`): `{ archivo, beat, offsetS?, golpeS?, volumen }` para algo puntual.
5. Las palabras que entran **no llevan sonido** (se vuelve ruido). Sin riser salvo que el usuario lo pida.
6. SFX cortos sin recorte de inicio; la música con `trimBefore` solo si `desdeS` > 0.

## Diseño sonoro (criterio)
- **Causalidad**: tiene que entenderse qué causó cada sonido, y su carácter sigue la física de la acción (un clic es corto y seco; un golpe de cierre, de espectro completo).
- **Un evento, un sonido, en su cuadro**: se alinea el golpe del archivo (`golpeS`), no su inicio. El mismo tipo de evento lleva el mismo sonido en toda la pieza; lo que se repite es textura, no golpe.
- **Familias** (una por tipo de evento): clic y tap secos en la banda de presencia (2–5 kHz); burbuja y notificación, pop corto; turno que cae, tap; corte entre beats, whoosh de aire; logo, el único golpe completo.
- **Utilidad**: sonido solo donde hay peso. Nada en cada palabra ni en cada tecla. Guardar los golpes fuertes para 2 o 3 momentos (giro, logo, revelación).
- **Lo que se oye en un celular** está arriba de ~200 Hz: el sub va solo como capa, nunca solo.
- **La música vuelve despacio** después de cada golpe; si salta apenas termina, suena a máquina. Los fundidos se piensan en dB (exponenciales), no lineales.
- **Si hay voz en off**: bajo la voz va un recorte de bandas en la música (−6 dB en ~400 Hz, −3 dB en 1–1,6 kHz) en vez de bajar todo; la música queda ≥ 15 dB debajo de la voz.
- **Arranque con tensión** (opcional): casi en silencio 2–3 s y la música entra de golpe en el remate.
- **Medir antes de arreglar**: LUFS integrado con `ebur128`, pico por evento en ventanas de 100 ms y, para ticks agudos, energía en 2–8 kHz. Verificar sobre el render, nunca contra una simulación.

## Entrega
Masterizar a **−14 LUFS integrado, pico real ≤ −1.5 dBTP**, AAC 256k: si los picos pasan el techo, un limitador antes; después `loudnorm` de ffmpeg en dos pasadas, lineal (primera pasada para medir, segunda con `measured_*` y `linear=true`). El instalador del kit deja `scripts/master.mjs` (solo node + ffmpeg) que hace todo eso e imprime el informe: `node scripts/master.mjs render.mp4 final.mp4`. Si el proyecto tiene su propio script de master, usar ese (ver `en-este-repo.md`). Verificar sobre el audio **renderizado**, no sobre una simulación.

- **Dos golpes en el mismo cuadro se suman** (medido 2026-11-12): el beat `logo` llevaba el whoosh de transición y el sonido del logo en el mismo cuadro y el pico subía de −8 a −4,3 dBFS (el limitador recortaba 5,2 dB). El kit ya no pone whoosh en el `logo`. Si sumás un evento nuevo, no lo pongas en el mismo cuadro que otro: corré uno 2–4 cuadros.
