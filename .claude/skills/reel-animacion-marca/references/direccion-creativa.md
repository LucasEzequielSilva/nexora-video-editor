# Dirección creativa

Cómo piensa la pieza un director antes de animar. Sale de las skills de dirección de video instaladas (hyperframes-creative, hyperframes, general-video) cruzadas con las referencias del formato y con lo que funcionó y no funcionó en este kit.

**Actitud.** Llegar como director, no como contratista: el primer plan ya trae el tratamiento completo (historia, mundo, transiciones, sonido, apertura y cierre). Pero el techo lo pone el concepto, no la caja de herramientas: un efecto que vestiría igual a cualquier video es decoración y se saca.

## El proceso (cada paso deja algo que se aprueba o se corrige)
| # | Paso | Qué se hace | Qué sale |
|---|---|---|---|
| 1 | Intención | Pedir solo lo que falta: marca, logo, colores y tipografía, el dolor que resuelve, duración, palabra del cierre. Una pregunta por tema, con la opción recomendada primero. Separar lo respondido de lo inferido (y decir por qué se infirió). Chequeo de que cierre: 8 beats en 20 s con un chat de 4 mensajes no entran. | **"Esta pieza le dice a [público] que [mensaje]."** |
| 2 | Mundo | Cuatro preguntas internas: ¿cómo se ve el tema?, ¿cómo se ve la emoción en un cuadro (urgencia = compresión, alivio = aire)?, ¿qué objetos tiene **solo** esta marca (su interfaz, sus datos reales, su logo)?, ¿cómo se ven todos los otros videos del rubro (para no hacer eso)? | Inventario de objetos reales + el antipatrón a evitar |
| 3 | Concepto | 3 ideas de caminos distintos (el mundo del tema, la emoción, el público, un formato raro: receta, cuenta regresiva, tapa de diario). Tres líneas cada una: idea, cómo se ve ("el turno cae en la agenda al golpe del tema"), gancho. Después recomendar una. Si el usuario dice "armalo", elegir por dentro y avisar qué se eligió. | 3 conceptos + recomendación con su porqué |
| 4 | Spec de diseño | Colores con rol, tipografía, objeto héroe, transiciones, sonido, lo que nunca va (formato abajo). | Spec + un cuadro quieto con paleta y letra |
| 5 | Guion de beats | Ritmo nombrado, tabla de beats, chequeos de historia (abajo). Ver `guion-y-beats.md`. | Tabla de beats |
| 6 | Dirección por beat | Verbo por elemento, transición de salida, capas, sonido (abajo). | Dirección escrita en el brief |
| 7 | Cuadros clave | Cada beat quieto en su momento más visible, **antes de animar todo**: se revisa jerarquía, aire, tamaños. Cambiar acá cuesta segundos; después, renders. | Hoja de contactos, un cuadro por beat |
| 8 | Animar y sonar | El kit, `motion.md`, `transiciones-y-escenas.md`, `audio.md`. | MP4 16:9 con audio |
| 9 | Revisión | Contra la spec, la rúbrica de `motion.md`, el chequeo "¿se ve IA?" de `diseno.md` y `checklist.md`. Recién después, empaque y post. | Informe + MP4 masterizado |

Atajo: si el usuario quiere "la pieza entera y te corrijo", los pasos 3–7 se hacen por dentro y se entrega la pieza con una línea por cada decisión no obvia.

## La historia
- **El gancho habla el idioma del espectador**: lo que gana, lo que evita o lo que entiende. Nada de vocabulario interno ni lista de funciones. Un número solo si carga algo en juego.
- **El valor llega temprano**: a más tardar en el beat 2–3 (≤ ~7 s). Lo demás es evidencia. Chequeo: sin la evidencia, el valor sigue en pie; si sin el valor el video "funciona" igual, era un tour de funciones.
- **Lo visual sale de la marca**: si un objeto podría aparecer igual en el video de otro producto, no salió de la fuente. La interfaz real, los datos reales y el logo real son la materia prima.
- **Datos ficticios coherentes**: el mismo nombre, la misma hora, el mismo turno de un beat al otro. Eso arma una historia; datos sueltos arman una plantilla.
- **El guion se siente más corto que el video**: el silencio entre frases es parte. Leerlo en voz alta.
- La primera frase crea tensión, curiosidad o sorpresa en 3 s (afirmación, pregunta que pica, contraste). "Te presentamos X" se reescribe.

## Ritmo
- Nombrar el ritmo antes de armar, por ejemplo `dolor-dolor-SOLUCIÓN-GOLPE-prueba-sostén`. Sale de la historia: ¿dónde está el pico?, ¿la marca es pausada o urgente?
- Dentro de cada beat: **armado 0–30 %, respiro 30–70 % (una sola animación o ninguna), resolución 70–100 %**.
- Contraste: la escena más lenta dura ~3× la más rápida. No repetir la misma curva, velocidad, dirección y escalonado en todo.
- Después del pico, aterrizar y sostener ≥ 1 s. El logo queda quieto el 40–50 % final de su beat.

## Dirección de un beat (lo que se escribe antes de animarlo)
- **Concepto** (1–2 frases): qué siente el espectador.
- **Verbo por elemento**: impacto (GOLPEA, CAE), dirección (DESLIZA, BARRE), revelado (SE DIBUJA, SE LLENA, CUENTA), mecánico (SE TIPEA, ENCAJA). Si no se puede nombrar el verbo, el elemento no está diseñado.
- **Transición de salida** con su motivo, a nivel objeto: "la ventana del chat se expande y se vuelve la pantalla amarilla".
- **Capas**: fondo liso + objeto (la interfaz) + texto. Las capas las pone la interfaz, no el adorno.
- **Sonido**: qué suena y en qué cuadro.

## Composición del cuadro (1920x1080)
- Margen seguro ~100–140 px. El texto nunca pasa de ~1500 px de ancho.
- **Un elemento manda**, a 3–6× el que le sigue (prueba de entrecerrar los ojos).
- **Aire**: 45–60 % del cuadro vacío en los beats de frase. Un solo beat denso (la interfaz más cargada) como excepción.
- Texto y objeto por zonas: texto a un lado, objeto al otro (`Lado` del kit), o texto centrado solo en frases sueltas, giro y cierre.
- Ninguna imagen plana: el objeto lleva perspectiva leve, sombra de una sola luz y deriva.
- Una línea conectora necesita dos puntas reales y una función; si no, es decoración.
- Fondo liso: vale porque el concepto lo justifica (la interfaz real es el protagonista). Las skills de video genéricas piden "fondo nunca vacío, 2–5 adornos con animación ambiente": **en este formato no** (se ve IA, ver `diseno.md`).

## Tipografía en video
- Mínimos: títulos ≥ 64 px, cuerpo ≥ 28 px, etiquetas ≥ 18 px a 1920. Si se va a ver en el feed (reel), títulos ≥ 90 px. Por debajo de 24 px, justificarlo.
- Pesos con contraste fuerte (300 contra 900, no 400 contra 700). Títulos 700–900.
- Interlineado display 0,84–1,1; tracking display −0,02 a −0,05 em (el video come el detalle).
- Sobre oscuro: un poco más de peso aparente y +0,01 em de tracking.
- Palabras por pantalla: hasta 3 al tamaño mayor; 4–6 al siguiente; 7 es el tope.
- Lectura: un beat de 3 s admite ~5 palabras; uno de 4 s, ~7.
- Pares: una familia en dos pesos, o serif + sans, o sans + mono, cada una con un rol (afirmar, datos, atribuir). Nunca dos sans parecidas. La serif itálica de acento es un default de lo generado con IA.
- Fuentes muy repetidas por los modelos (Inter, Poppins, Space Grotesk, Instrument Serif, Fraunces, Playfair…): usarlas solo si son las de la marca.
- Marca real: su tipografía tal cual.

## Color y spec de diseño
- Declarar fondo, tinta y acento antes de animar. Un solo acento, pleno en el foco. Neutros tintados (nada de #000 ni #fff puros en grandes superficies). Claro para comida, salud, chicos; oscuro para tech, cine, finanzas.
- Los fondos alternados del kit (`base` / `acento` / `oscuro`) son **registros** declarados en la spec, no colores sueltos.
- Nada de degradé a pantalla completa (se bandea en H.264).

**Formato de la spec** (va como comentario en el brief o en un `.md` al lado):
```yaml
marca: Turnix
mensaje: "A un consultorio le dice que los turnos se agendan solos por WhatsApp"
colores: { base: "#F2F3F5", tinta: "#16181D", acento: "#FFC527", oscuro: "tinta al 70 %" }
tipografia: { titulo: "Satoshi 700/900", texto: "Satoshi 500", minimo_titulo: 76 }
heroe: "la interfaz: WhatsApp, pantalla de bloqueo, agenda"
transiciones: { primaria: empuje, acentos: [zoom al teléfono, expande del chat], cierre: fundido }
sonido: "una familia: whoosh de aire, pop, tap, clic; música pareja 117,5 BPM"
nunca: [degradés de dos tonos, partículas, destellos, mayúsculas espaciadas, logo inventado]
apuntamos_a: "Clidenta (rayyan.pe): interfaz real, calma, un color"
fracaso_seria: "una plantilla de SaaS violeta con brillos"
```
La spec es la marca, no el layout: estricta en colores, letra y lo que nunca va; libre en tamaños y composición.

## Números
- Nunca inventar cifras, porcentajes ni fechas. Sin dato real, el beat de número no va (o va marcado como ilustrativo).
- Un número clave pide conteo; va grande (≥ 120 px), con `tabular-nums`, y con algo que lo haga tangible (barra, anillo, cambio de fondo).
- Las métricas de un mismo concepto van en el mismo lugar y solo cambia el valor.

## Revisión por cuadro (antes de mostrar)
- **Jerarquía**: un dominante claro.
- **Aire**: el vacío que pide el tipo de beat.
- **Contención**: un solo acento por cuadro.
- **Letra**: mínimos y tracking.
- **Ancla**: texto al costado o centrado según el tipo de beat.
- **Fabricación**: cada número y nombre sale del pedido o está marcado como ficticio.
- Y la historia: ¿el valor llega temprano?, ¿cada beat tiene un porqué que lleva al mensaje?

## Qué no se adopta de las skills de video genéricas
Adornos de fondo con animación ambiente, brillo radial, texto fantasma, grano, rótulos en mayúsculas espaciadas, serif itálica de acento, paletas violeta, neón o cian sobre oscuro, texto al 60–80 % del ancho fuera del beat de giro. Todo eso es justo lo que hacía ver la pieza "muy IA".
