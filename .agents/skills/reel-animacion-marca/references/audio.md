# Audio

El audio vive **dentro de la animación** (`AnimacionMarca`): el MP4 `<slug>-16x9` ya sale con música y efectos. El empaque (laptop) no agrega nada: el cierre queda en silencio.

## Lo que se midió en los 11 reels
- Loudness integrado −14.3 a −14.8 LUFS, parejo en todos.
- El **cierre va en silencio** (~4 s finales sin señal por encima de −45 dB).
- Picos entre +0.4 y +1.3 dBFS: saturan. No imitarlos.

## Lo que NO se midió
Género de la música, BPM, cantidad y tipo de golpes. Antes de afirmar algo de eso: `ffmpeg -i <reel> -af ebur128=peak=true -f null -` para nivel y `silencedetect` para el silencio.
Criterio de Lucas sobre otros reels de motion (`assets/referencias/reels-motion-2026-11.md`): música pareja, pocos golpes graves y fuertes, comienzo con tensión casi en silencio.

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
   | clave | evento | efecto del repo (`public/reserva/sfx/`) | volumen | `golpeS` |
   |---|---|---|---|---|
   | `transicion` | corte entre beats | `escena-entra.wav` | 0.47 | 0.506 |
   | `notificacion` | cada notificación del teléfono | `tarjeta.wav` | 0.47 | 0.07 |
   | `burbuja` | cada mensaje del chat | `burbuja.wav` | 0.47 | 0.047 |
   | `numero` | el contador aterriza | `remate.wav` | 0.50 | 0.124 |
   | `remate` | la palabra del beat `heroe` | `remate-b.wav` | 0.50 | 0.122 |
   | `clic` | el clic del cursor | `click.wav` | 0.36 | 0.01 |
   | `logo` | entra el logo | `cta-cierre.wav` | 0.48 | 0.025 |
   `golpeS` = segundo **dentro del archivo** donde cae el golpe (de `assets/catalogo/sonidos.md`); sin él, el archivo empieza en el evento.
   **Mezcla medida (2026-11-11):** los SFX del repo están normalizados a −3 dBFS de pico y la música Quantum a volumen 0.5 da RMS −22,4 dB y pico −11,4 dB. Con SFX a 0.3 los golpes quedaban *debajo* del pico de la música (no se oían). Pero **hay un techo**: con −14 LUFS y −1,5 dBTP el master necesita ~+6 dB de ganancia, así que ningún pico puede pasar de −9,2 dBFS antes del master, solo ~2 dB sobre el pico de la música. Con volúmenes de 0.55–0.7 el limitador del master recortó 4,8 dB y aplastó los golpes. Por eso van a **0.47–0.5** (pico ≈ −9,5 dBFS) y el realce lo da el ducking. Leer siempre el informe de `master.mjs`: si dice "recorta X dB de picos" con X > 3, bajar los SFX (medido: 4,8 dB aplastó todos los golpes; 2,8 dB solo en el golpe del contador pasó sin problema).
   **Ducking automático:** la música baja alrededor de cada golpe (ataque 3 cuadros antes, suelta en 12): −4 dB en transiciones, −6 dB en remate y número, −3 dB en notificaciones, −2,5 dB en burbujas. Con eso cada efecto queda 6–10 dB sobre la música sin subirlo. `audio.duck` (0–1) multiplica la profundidad; `0` lo apaga.
4. **Efectos manuales** (`audio.sfx`): `{ archivo, beat, offsetS?, golpeS?, volumen }` para algo puntual.
5. Las palabras que entran **no llevan sonido** (se vuelve ruido). Sin riser salvo que el usuario lo pida.
6. SFX cortos sin recorte de inicio; la música con `trimBefore` solo si `desdeS` > 0.

## Entrega
Pasar el MP4 por `node scripts/master.mjs <entrada.mp4> <salida.mp4>`: **−14 LUFS integrado, pico real ≤ −1.5 dBTP**, AAC 256k. Verificar sobre el audio **renderizado**, no sobre una simulación.
