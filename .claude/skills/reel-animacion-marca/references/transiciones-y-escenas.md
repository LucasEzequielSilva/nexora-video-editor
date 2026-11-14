# Transiciones y escenas

De `hyperframes-animation` (transiciones y blueprints) cruzado con las referencias mirando cuadro a cuadro (`anatomia.md` §Cómo pasan de una escena a otra).

## Cómo se elige una transición
- **La transición dice cómo se relacionan dos escenas.** Fundido = "esto sigue". Empuje = "siguiente punto". Corte seco = "despertate" o cambio de registro. Zoom = "entramos". Expansión = "esto se convierte en aquello". Se elige por lo que hace el contenido, no por cómo se ve.
- **Una primaria en el 60–70 % de los cortes y 1–2 acentos.** En toda la pieza, 2–3 tipos. Una transición distinta en cada corte es el antipatrón "variedad de más". Los morph (zoom al objeto, expansión del objeto) no cuentan en ese cupo: son continuidad, no efecto.
- **Según el momento**: el primer corte puede ser el más distintivo; entre beats del mismo tramo, la primaria; en el giro, algo distinto ("el cerebro se resetea"); en la prueba, el acento más fuerte; después del clímax, algo suave; en el cierre, lo más lento y simple (fundido, 18–30 cuadros).
- **Velocidades que se tocan**: lo que sale acelera (`CURVA.sale`) y se desenfoca; lo que entra frena (`CURVA.entra`) y el desenfoque se limpia. Las dos se mueven a la vez.
- **Nunca apagar y después entrar**: eso es un corte con un bache vacío. En el kit, el contenido nuevo arranca 4 cuadros antes del corte (`ADELANTO_F`), así el primer texto cae en el pulso mientras sale el viejo.
- **Entre un fondo claro y uno oscuro, nada de fundido**: el fundido pasa por un gris sucio. El kit lo resuelve solo: si los fondos contrastan (≥ 2:1), el fondo nuevo entra con un círculo.
- **Dirección**: "lo que sigue" entra siempre por el mismo lado (de la derecha); el eje cambia solo en el giro.
- **El aterrizaje cae en el pulso**: todas las transiciones del kit terminan justo en el corte, que cae en un tiempo de la música.

## Las transiciones del kit (`transicion` en cada beat: cómo ENTRA)
| Transición | Qué se ve | Motivo | Cuadros | Detalle |
|---|---|---|---|---|
| `fundido` (default) | lo viejo se desenfoca y sigue creciendo; lo nuevo llega desde 0,97 con desenfoque que se limpia | "esto sigue"; cierre | 15 | entre claro y oscuro pasa a círculo desde el centro |
| `empuje` | el beat nuevo entra desde la derecha y lo viejo se va a la izquierda con estela horizontal | "siguiente punto"; **primaria recomendada** | 15 | curva `mueve`; desenfoque direccional de hasta 26 px |
| `zoom` | lo viejo se agranda hacia su objeto (el teléfono) y lo nuevo se abre en círculo desde ese mismo punto | "entramos al objeto" (teléfono → chat) | 16 | morph: no cuenta en el cupo |
| `expande` | el rectángulo del objeto anterior (la ventana del chat) crece hasta ser la pantalla nueva | "esto se convierte en aquello" (chat → pantalla de marca) | 18 | morph: no cuenta en el cupo |
| `corte` | cambio instantáneo en el pulso | golpes del mismo material, cambio de registro | 0 | sin whoosh |

El objeto de cada beat (de dónde sale el zoom, desde dónde crece la expansión) lo calcula `rectObjeto` en `animacion.tsx` con las medidas de `TAM` (`objetos.tsx`). Si se agrega un beat con objeto, sumarlo ahí.

Turnix: `empuje` (frase → teléfono), `zoom` (teléfono → chat), `expande` (chat → "solito."), `empuje` (→ agenda) y `fundido` (→ logo).

## Otras transiciones (si el concepto las pide)
| Transición | Comunica | Cuadros | Cómo en Remotion | ¿Encaja? |
|---|---|---|---|---|
| Dip al color de marca | pausa, cambio de tramo | 14 | lo viejo se apaga, se ve un `AbsoluteFill` del acento, entra lo nuevo | sí, en el giro |
| Barrido de marca | lo nuevo "estaba debajo" | 12–20 | `clipPath: polygon()` diagonal con el acento | sí, una vez |
| Morph de escala en el mismo centro | es lo mismo, transformado (marca → botón) | sale 9–15, entra 14–21, se pisan 3–6 | dos elementos con el mismo `transformOrigin`, el nuevo arriba | sí |
| Card morph | una tarjeta se vuelve la pantalla (notificación → app) | 18–36, con 0,6–1,5 s quieto antes | escala uniforme + radio + fondo con un solo progreso | sí |
| Empuje vertical | lo siguiente está abajo (feed, lista) | 15 | `translateY` | sí |
| Látigo (whip) | velocidad, paso entre planos de interfaz | entra 8, sale 6 | ±760 px con desenfoque direccional | con cuidado |
| Alejarse | "esto vivía dentro de algo más grande" | 15–30 | la cámara sale de 4–12× a 1 con `poly(5)` | sí, como beat |
| Persianas, grilla, reloj, flip 3D, rebote | plantilla | — | — | no |
| Destellos de luz, glitch, aberración, film burn | — | — | — | no: se ve IA |

`@remotion/transitions` (`TransitionSeries`) no está instalado y no conviene para este formato: cada transición acorta el total y corre los cortes siguientes fuera del pulso. El kit solapa los beats a mano para que el corte quede siempre en el golpe.

## Escenas (patrones para armar beats)
Los patrones duran 3–13 s; nuestros beats, 2–5 s. Uno largo se reparte en 2–3 beats seguidos, unidos por corte o morph.

**Ya en el kit**
- *Pantalla de bloqueo que se llena* (`telefono`): el dolor con datos reales (horas, nombres).
- *Chat que se escribe* (`chat`): la marca respondiendo; la versión WhatsApp del "prompt que se escribe y la máquina responde".
- *Agenda que se llena* (`agenda`): el resultado, con cadencia que acelera y un último turno que queda solo.
- *Palabra que golpea* (`heroe`) y *frase* (`frase`).
- *Logo que se arma con clic* (`logo`): marca quieta → botón → cursor que llega frenando → clic.

**Para agregar cuando el concepto lo pida** (tipo nuevo en `tema.ts`, vista en `animacion.tsx`, objeto en `objetos.tsx`)
- **Acumulación** (dolor): un texto grande y "etiquetas" del problema que caen giradas y se apilan hasta tapar el cuadro (LatamCod: "Es frustrante" + "Pagaste $5, $12…"). Después cae la solución en el medio.
- **Ancla que cicla**: el objeto queda fijo (teléfono, tarjeta) y adentro cambia el contenido cada 0,5–1 s (Tu Yapa: café → panadería → pizzería). Muestra versatilidad sin cortar.
- **Tríada de verbos**: tres beats de una palabra con fondos alternados y corte seco ("Escanea." "Sella." "Vuelven."), con un detalle que salta en cada uno. Es el "cómo funciona" en 3 s.
- **Agente trabajando**: disparo → "Confirmando turnos…" → un comprobante que se tilda renglón por renglón. Loops finitos que mueren en el cuadro en que llega el resultado.
- **Causa → efecto**: un mundo con el chat a la izquierda y la agenda a la derecha; la cámara viaja de uno al otro mientras se arma la consecuencia. Máximo dos movimientos de cámara.
- **Alejarse**: arranca pegado a un detalle real y un solo alejamiento que frena revela el todo (el turno → la agenda entera → el consultorio).
- **Demo con cursor**: la interfaz completa desde el primer cuadro; el cursor lleva la mirada y cada clic cambia un estado (2–4 estados).
- **Antes / después**: dos tarjetas que entran de lados opuestos (lo viejo chico, inclinado, apagado; lo nuevo grande), con una pastilla en cada una.
- **Constelación**: el logo de la app suelta tarjetas reales (chats, contactos) unidas por líneas finas (keemfinity). Con cuidado: las órbitas y brillos decorativos se ven IA; solo con datos reales y líneas que unan cosas reales.

## Anti-patrones
- Una transición distinta en cada corte; más de 2–3 tipos en la pieza.
- Fundir todo; fundir entre claro y oscuro.
- Apagar y después entrar (bache vacío en el corte).
- Patrones geométricos repetidos (celdas, persianas, puntos parejos): baratos.
- Cuatro empujes de cámara iguales seguidos: son diapositivas.
- Inventar movimiento en un beat de respiro: ahí la quietud es el contenido.
