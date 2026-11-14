# Checklist de entrega

**Contenido**
- [ ] Cada beat: una idea, ≤ 7 palabras, una palabra clave `[así]` y, si hace falta, una frase `{subrayada}`.
- [ ] Ninguna cifra ni cliente inventado sin marcar como ficticio / concepto.
- [ ] Marca ajena: "Concepto, no oficial" en el post.
- [ ] El logo final dura ≥ 3 s, trae tagline y (si hay botón) el clic se ve y se oye.

**Imagen** (renderizar el MP4 una vez y sacar cuadros con ffmpeg: `select=eq(n\,N)`)
- [ ] Chequeo "¿se ve IA?" de `diseno.md` en cero: sin degradés de dos tonos, partículas, destellos ni mayúsculas espaciadas; logo real.
- [ ] Un cuadro por beat y **cuatro alrededor de cada corte** (B−8, B−4, B, B+4): sin destellos, sin rayitas sueltas, sin texto cortado.
- [ ] Texto legible: frases ≥ 76 px en 1920x1080 (la pieza final es el 16:9). Si va en la laptop del reel (se ve al 49 %), ≥ 90 px.
- [ ] Interfaz creíble: nombres con apellido, horas coherentes entre beats, fecha y día de la semana que coinciden.
- [ ] Sin palabras cortadas ni puntuación suelta en otra línea.
- [ ] No hay más de tres beats seguidos con el mismo fondo.
- [ ] Cierre (si hay empaque): "Comentá", píldora, cursor y pie completos antes de que termine.

**Movimiento** (`motion.md`, `transiciones-y-escenas.md`)
- [ ] La rúbrica de `motion.md` da todo sí: cada movimiento con porqué, un foco por vez, sin rebote en la interfaz, salidas más cortas que entradas, clic que aprieta y suena en el mismo cuadro.
- [ ] Transiciones: una primaria en la mayoría de los cortes, acentos con motivo, nada de fundido entre claro y oscuro, sin bache vacío en el corte.
- [ ] Vista a velocidad real y cuadro a cuadro: todo texto se lee entero antes de que se vaya.

**Ritmo**
- [ ] Cada corte cae en un tiempo de la música (las duraciones salen de `compas(n, bpm)`).
- [ ] El primer cuadro cae en un tiempo fuerte (`desdeS` medido con librosa).

**Sonido** (medir sobre el MP4 renderizado, ventanas de 100 ms = `sample_rate/10` muestras; ojo: a 48 kHz `n=4410` da 91,9 ms)
- [ ] Cada golpe queda ≥ +3 dB sobre el pico de la música sola (si queda por debajo, no se oye).
- [ ] El fundido de salida llega a silencio antes del cierre.
- [ ] Master: −14 LUFS, pico real ≤ −1.5 dBTP (`audio.md` §Entrega).

**Entrega**
- [ ] MP4 de la animación 16:9 con audio (la pieza final). El reel con laptop solo si se pidió.
- [ ] Texto del post con la palabra clave.
- [ ] Si se regala la skill: carpeta `reel-animacion-marca/` (SKILL.md + references + template) **sin** `references/en-este-repo.md`, que es del proyecto de origen.
- [ ] Decir qué es mockup y qué es real. Si algo no se verificó, decirlo.
