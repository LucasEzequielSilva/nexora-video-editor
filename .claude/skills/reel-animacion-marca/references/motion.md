# Motion: el oficio del movimiento

Destilado de las skills de animación instaladas (hyperframes-animation, Emil Kowalski, Apple, los 12 principios, animation-systems, to-spring-or-not-to-spring) y de mirar cuadro a cuadro las referencias. Los valores ya están pasados a Remotion; los tokens viven en `template/reel-marca/movimiento.ts`.

## Principios
- **Todo movimiento tiene un porqué**: mostrar jerarquía, confirmar una acción, guiar la mirada o dar continuidad. "Queda lindo" no alcanza; si no tiene porqué, se borra.
- **Continuidad antes que diapositivas.** Las referencias se mueven por un mismo espacio: entran al objeto, la ventana crece hasta ser la pantalla, el teléfono se desliza y queda de ancla. Cada cambio de escena sale del objeto (`transiciones-y-escenas.md`).
- **Un foco por vez.** Lo primero que se mueve es lo más importante; se escalona por importancia, no por orden del código.
- **Lo suave le gana al rebote.** Una interfaz de producto no rebota: arranca rápido y frena largo. El `back.out` o un resorte flojo por defecto es la marca número uno de "video hecho por un agente".
- **Dos velocidades.** La interfaz que se muestra va a velocidad de producto (clic 3 cuadros, burbuja 7, notificación 12). La cámara y las escenas van a velocidad de explicación (12–24 cuadros; el héroe hasta 48). Una interfaz lenta delata la maqueta.
- **Entrar lleva más que salir.** Entra con `CURVA.entra`, sale con `CURVA.sale` y más corto, y por el mismo lado por donde entró.
- **Solapar, no hacer fila.** Lo siguiente arranca antes de que asiente lo anterior. En los cortes, lo que sale y lo que entra se mueven a la vez y sus velocidades se tocan en el corte.
- **Lo que se mueve junto sale de UN progreso** (cursor y botón, valor y barra, notificación que entra y la pila que empuja): misma duración, misma curva.
- **No arrancar en el cuadro 0**: el primer movimiento va a los 3–9 cuadros.
- **Aterrizar y sostener.** Después del pico, ≥ 1 s quieto. Lo que se lee queda quieto mientras se lee.
- **Mejor nada que mal.** Escalar en loop "para dar vida" es el truco barato. La vida la da el objeto: la notificación que llega, el mensaje que entra, el turno que cae.

## Curvas y resortes (`movimiento.ts`)
| Token | Valor | Para qué |
|---|---|---|
| `CURVA.entra` | `Easing.bezier(0.23, 1, 0.32, 1)` | entradas y respuestas de la interfaz (ease-out fuerte) |
| `CURVA.mueve` | `Easing.bezier(0.77, 0, 0.175, 1)` | algo que ya está en pantalla va de A a B: cursor, cámara, empuje, expansión |
| `CURVA.sale` | `Easing.bezier(0.68, 0, 0.77, 0)` | salidas (espejo de `entra`) |
| `CURVA.hoja` | `Easing.bezier(0.32, 0.72, 0, 1)` | paneles que suben |
| `CURVA.revela` | `Easing.bezier(0.16, 1, 0.3, 1)` | revelados grandes con máscara (logo) |
| golpe | `Easing.out(Easing.poly(5))` | la palabra del giro que golpea |
| conteo | `Easing.out(Easing.exp)` | contador |
| `RESORTE.acomoda` | `{ damping: 31.4, stiffness: 247 }` (ζ 1) | llega y queda quieto (~13 cuadros) |
| `RESORTE.cae` | `{ damping: 25.1, stiffness: 247 }` (ζ 0.8) | lo que cae o se lanza: turno, tarjeta |
| `RESORTE.hoja` | `{ damping: 33.5, stiffness: 439 }` (ζ 0.8) | tarjetas chicas, vuelta del botón |
| `RESORTE.pesado` | `{ damping: 21, stiffness: 110 }` (ζ 1) | aterrizaje del logo: cola larga, "premium" |

- **Resorte o curva**: resorte para lo físico (un objeto que cae, se lanza, se inclina); curva fija para el sistema que "habla" (notificación, burbuja, cambio de estado, corte, cámara, texto); lineal para el tiempo (barra de progreso, deriva). Cada tecla de un tipeo, sin animación.
- En Remotion ζ = damping / (2·√(stiffness·mass)). **El `spring()` sin `config` (damping 10, stiffness 100) da ζ 0,5: rebota un 16 %.** Nunca dejarlo sin config. Con ζ < 0,8 la interfaz parece de juguete.
- Conversión desde `response`/`bounce` (SwiftUI, Motion), con mass 1: ζ = 1 − bounce; stiffness = (2π/response)²; damping = 4π·ζ/response.
- GSAP → Remotion: power1 = `quad`, power2 = `cubic`, power3 = `poly(4)`, power4 = `poly(5)`, expo = `exp`, sine = `sin`, circ = `circle`, `back.out(k)` = `Easing.out(Easing.back(k))`.
- Usar al menos 3 curvas en la pieza, y no más de 2 movimientos con la misma curva por beat.

## Tiempos (a 30 fps)
| Movimiento | Cuadros | Nota |
|---|---|---|
| Clic: el botón baja | 2–4 | desde el cuadro en que suena |
| Botón vuelve | 9–15 | resorte `hoja` |
| Chip, burbuja de chat | 6–8 | curva `entra` |
| Notificación que entra y empuja la pila | 10–14 | un solo progreso |
| Cambio de estado | 5–8 | |
| Palabra (cada una) | 10–11 | escalonadas cada 4 cuadros |
| Turno que cae | 6–10 | resorte `cae` |
| Trazo (subrayado, ✓, marcador) | 9–24 | |
| Cursor viajando | 12–30 | llega frenando |
| Entrada de escena / transición | 12–18 | energía media |
| Contador | 36–75 | con < 24 se ve un flash |
| Morph de contenedor (tarjeta → pantalla) | 18–36 | |
| Push de cámara 1,05→1,15 | 60–90 | se lee "producto" |
| Escalonado entre ítems de un grupo | 1–2 | total ≤ 15 cuadros |
| Escalonado entre líneas | 4 | |
| Estado de pantalla sostenido | 30–45 | |
| Permanencia final | ≥ 30 | ideal 45–60 |

Lo chico es más rápido que lo grande; lo que se repite (siete turnos, cuatro burbujas) va más chico y más corto que lo que aparece una vez.

## Coreografía
- **Orden**: escena y cámara → protagonista → texto → detalles → CTA. El contexto va antes de la interacción (la marca antes del clic, la etiqueta antes del pico del contador).
- **Acorde, no arpegio**: lo que dice lo mismo termina junto (una cifra y su barra).
- **Un verbo por beat**, nunca dos remates a la vez.
- **Cadencia que acelera** para "se llena solo": holds que se multiplican por ~0,8 (de 14 a 5 cuadros) y un freno antes del último, que queda solo y es el remate (`llegadasTurnosF`).
- **Contenido interno** de un contenedor: entra 6–12 cuadros después de que el contenedor asienta.
- **Hold**: estado de pantalla 1–1,5 s; ítems intermedios 0,5–1 s; el último, claramente más largo.

## Recetas por elemento
**Texto**
- *Palabra por palabra* (`Palabras`): cada palabra en 10 cuadros con `entra`, escalonadas cada 4. Se desliza un poco en x (60 px la primera, 12 la última) y 14 en y, con desenfoque ≤ 6 px: se lee como una cámara que asienta.
- *Golpe* (beat `heroe`): desde escala 1,4 con desenfoque 16 → 0 en 14 cuadros con `poly(5)`; el remate suena cuando frena (cuadro 9). Sin rebote.
- *Énfasis*: marcador que crece en x desde la izquierda, subrayado a mano por trazo, o color de marca. Uno por beat.
- *Palabra que cambia en su lugar*: corte seco, sin rollo ni desenfoque.
- *Pregunta del usuario*: tipeada letra por letra en un campo, con el cursor fijo mientras escribe y parpadeando en las pausas.

**Interfaz**
- *Notificación*: entra desde arriba (origen en el borde superior) en 12 cuadros con `entra`; el mismo progreso empuja las de abajo.
- *Burbuja*: 7 cuadros con `entra`, desde la esquina de la cola, escala 0,9 → 1. "Escribiendo…" desaparece en el cuadro exacto en que aterriza la respuesta.
- *Tipeo humano*: teclas de 2–6 cuadros, pausas de 9–18; un error con su borrado lo vuelve creíble.
- *Turno que cae*: resorte `cae`, escala 1,06 → 1, baja 16 px. El último lleva un pulso de énfasis (1 → 1,05 → 1 en 14 cuadros).
- *Contador*: valor y escala (0,6 → 1) con la misma curva y duración; sin rebote; el sufijo entra al final; la etiqueta, antes de la mitad.
- *Pieza de interfaz aislada*: una sola pieza real, grande, que aterriza con resorte (rotateX +28° → 0, escala 0,55 → 1, desenfoque 10 → 0) y queda con deriva lenta.

**Cursor y clic**
- Aparece por corte (no por fundido), fuera de lugar, y llega frenando en arco: x con `entra`, y con `mueve`.
- La punta cae dentro del botón, un poco corrida del centro, sin tapar el texto.
- Clic 0–9 cuadros después de llegar. Botón y cursor bajan en el mismo cuadro (botón a 0,96, cursor a 0,9) en 3 cuadros, y vuelven con resorte. El sonido cae en ese cuadro.
- Un solo anillo, con la forma del botón, que crece a 1,25× y se apaga en 18 cuadros.
- Después del clic, ≥ 1 s de escena.

**Logo**
- Se arma: el nombre se descubre de izquierda a derecha (`revela`, 16 cuadros), el punto o el isotipo cae al final, el conjunto aterriza con `pesado`. Después, quieto.
- El clímax es el clic: la cámara no compite.

**Cámara**
- Un solo "mundo" que se mueve; escala y traslación con la misma curva (`mueve`).
- Push de 1,05 a 1,15 en 2–3 s para "producto"; 1,5–2× solo para enfocar un detalle, y nunca más del 88 % del cuadro.
- Deriva de 2–8 px en x y 1–4 en y, en un solo sentido (nada de oscilar).
- La cámara nunca va con resorte ("el mundo colgando de un hilo").

## Profundidad sin adornos
- Dos o tres capas que siguen a la cámara a 0,5 / 0,8 / 1,0 de su movimiento (paralaje).
- Una sola luz: todas las sombras para el mismo lado; el objeto héroe con `0 25px 50px rgba(0,0,0,.35)`.
- Desenfoque de campo solo en el fondo (≤ 8 px). Lo que se lee, nítido.
- Para materializar algo, animar desenfoque y escala juntos, no solo opacidad.

## Los 12 principios en nuestros beats
| Principio | Ejemplo |
|---|---|
| Aplastar y estirar (0,95–1,05) | el turno llega apenas estirado y asienta |
| Anticipación | el cursor retrocede 4 px antes de ir al botón |
| Puesta en escena | llega la notificación clave y lo demás se queda quieto |
| Pose a pose / directo | `interpolate` entre cuadros clave para lo que cae en el pulso; `spring` para lo físico |
| Continuación y superposición | la burbuja frena y la hora y las tildes entran 2 cuadros después |
| Entrar y salir despacio | entra con `entra`, sale con `sale` |
| Arcos | el cursor: x e y con curvas distintas |
| Acción secundaria | las tildes se ponen azules cuando la burbuja ya asentó |
| Timing | todas las burbujas duran lo mismo |
| Exageración | con la cámara (un push sobre el turno), no deformando la interfaz |
| Dibujo sólido | una sola luz y sombras coherentes |
| Atractivo | una familia de curvas y una de sonidos; un solo momento de deleite (el logo) |

## Anti-patrones (los que delatan agente o plantilla)
- Rebote por defecto; la misma curva, velocidad, dirección y escalonado en todo; la misma entrada para todas las frases.
- Respirar o escalar en loop para "dar vida"; zoom ambiente en todas las escenas.
- Fundido en una cascada, o entradas en fila.
- Rebote en datos (contador, valor) y resorte en la cámara.
- Desvanecer la escena entera antes de entrar la siguiente (deja un bache vacío en el corte).
- Clic con el cursor todavía en movimiento, botón que se hunde solo, cursor que se teletransporta.
- Etiqueta chiquita bajo una cifra enorme.
- Animar `width`, `height`, `top`, `left` o `fontSize`; dos lugares del código escribiendo el mismo `transform`.
- Lo que se ve IA: degradé dentro de la letra, halos y brillos, partículas, glitch, letras que se decodifican, texto extruido, órbitas y constelaciones decorativas, visualizadores de audio (ver `diseno.md`).

## Rúbrica (todas tienen que dar sí)
1. ¿Cada movimiento tiene un porqué que se pueda nombrar?
2. ¿Hay un solo foco moviéndose fuerte a la vez?
3. ¿Las entradas usan `entra` (ninguna ease-in) y las salidas son más cortas?
4. ¿Ningún elemento nace de escala 0 (salvo un punto o un isotipo que se arma)?
5. ¿Lo que entra por un lado sale por el mismo?
6. ¿Los elementos del mismo tipo tienen el mismo timing?
7. ¿Ningún resorte de interfaz baja de ζ 0,8?
8. ¿Los escalonados de un grupo son de 1–2 cuadros?
9. ¿Las deformaciones quedan entre 0,95 y 1,05?
10. ¿El clic aprieta y suena en el mismo cuadro?
11. ¿Cada sonido tiene una causa visible?
12. ¿Lo que hay que leer queda quieto mientras se lee?
13. ¿Cada corte tiene un motivo y no hay bache vacío en el corte?
14. ¿Se miró cuadro a cuadro y a velocidad real, con ojos frescos?

## Vocabulario
| Español | Inglés | Qué es |
|---|---|---|
| entrada / salida | enter / exit | lo que hace al aparecer o irse |
| fundido | fade | cambio de opacidad |
| fundido cruzado | crossfade | uno se va y otro llega en el mismo lugar |
| revelado con máscara | mask reveal | se descubre a través de un recorte |
| iris | iris | se abre desde un círculo |
| cascada | stagger | uno tras otro, con poco retraso |
| curva | easing | cómo cambia la velocidad |
| resorte | spring | movimiento por física, no por duración |
| pasada | overshoot | se pasa del destino y vuelve |
| asentarse | settle | los cuadros finales hasta quedar quieto |
| anticipación | anticipation | amague en la dirección contraria |
| continuación | follow-through | partes que siguen y asientan después |
| elemento compartido | shared element | una pieza viaja y se convierte en otra |
| transformación | morph | una forma se convierte en otra |
| transición con dirección | direction-aware | avanzar va hacia un lado; volver, hacia el otro |
| paralaje | parallax | capas que se mueven a distinta velocidad |
| deriva | drift | movimiento lento y continuo en un sentido |
| contador | number ticker | dígitos que suben hasta el valor |
| desenfoque de movimiento | motion blur | estela que muestra la velocidad |
| corte por coincidencia | match cut | corte entre planos con la misma forma o posición |
| barrido | whip pan | paneo tan rápido que el desenfoque tapa el corte |
| empuje | push | lo nuevo entra y empuja a lo viejo hacia el otro lado |
| golpe | slam | entrada que frena en seco al pulso |
| ancla | anchor | elemento que queda fijo mientras cambia lo demás |
