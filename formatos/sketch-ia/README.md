# Formato: sketch de película con clon de IA (referencia: Ramiro Cúria)

Lucas (2026-10-14): "es lo que tenemos que replicar con nosotros, nuestros personajes, o con personajes IA… tipo
montajes, jugando al fútbol, luchando tipo UFC y en vez de UFC diga NXR… estilos de películas pero con contenido corto
que llama la atención y comunica el mensaje". Ramiro vende contenido orgánico; **Nexora vende sistemas** (gestión,
agentes de IA): el mensaje es "sistema, no papel, ni planilla, ni cuentas en la cabeza".

Fuente: 7 videos en `D:\Dev\videos\AQ*.mp4`, mapeados plano por plano (cortes con `scdet`, transcripción con
`explorar-tomas.py`, audio medido). Las hojas de planos quedaron en el scratchpad de la sesión del 2026-10-14.

## 1. Mapeo de los 7 videos

| Video | Dur. | Cuadro | Premisa (gag) | Bisagra a la lección | Planos | Dónde da la lección | CTA |
|---|---|---|---|---|---|---|---|
| Ring + patrullero (`AQPpd6y8`) | 127 s | 16:9 | Box contra un "lead de mierda" zombie: cada golpe es una objeción ("¿me pasás más info?", "lo hablo con mi mujer"); le apunta con una pistola y lo arresta la policía | 43.7 s: "Si necesitás pelear contra 20 zombies para cerrar una venta, tu problema no son las ventas" | 20: **17 en los primeros 44 s** (0.8–7 s, mediana 2.5) y 3 de 24–31 s | Esposado en el asiento de atrás del patrullero | CLASE (masterclass 30 min) |
| Restaurante (`AQNoikA7`) | 81 s | 16:9 | Diálogo: él hace del novato ("no sé a qué gurú creerle"), otro personaje IA hace del mentor y describe 3 villanos | 45 s: "Entonces, ¿qué carajo hago?" | 15, plano/contraplano de 3–9 s | El mentor responde en la mesa | Placa negra 9.6 s: "Comentá NICHO" |
| UFC entrevista (`AQM1HKd`) | 103 s | 4:3 | Entrevista después del KO (micrófono "SYK", cartel "RAMA vs GURU"), se cree campeón | 56 s: "¿Danos tu secreto?" | 19; **6 son de la pelea** e interrumpen la entrevista mientras él sigue hablando | En el octágono, al micrófono | YO |
| Caballero (`AQP_2wRB`) | 113 s | 4:3 | Primer vuelo en dragón (gag de la vaca "mooo"), aterriza mal, entra a la posada | 47 s: "A ver, amigos, entendamos una cosa" | 16: 10 de 0.4–3.4 s en el vuelo y 3 de 18–33 s | Monólogo en armadura en la posada | SISTEMA (+ su Notion) |
| Auto + vasos (`AQPa7MOt`) | 63 s | 1:1 | "¡Más lento, más lento!" con una torre de vasos que se cae | 9.8 s: "A ver, amigos, entendamos una cosa" | 9 + placas editoriales (perfil de IG, caso de cliente, bolsas de plata) | Sentado en el auto | YO |
| UFC pesada (`AQNcyJOD`) ⭐ | 72 s | 9:16 | Careo con un gato que lo cachetea | 9.6 s: "Si tu plan es escalar con anuncios, arrancaste mal" | 7, de 5–14 s | Vlog selfie caminando: pasillo → vestuario → estacionamiento, con la bolsa de hielo en la cara | ADS |
| Jesús en el fogón (`AQMpYRYf`) | 88 s | 4:3 | Estilo animación 3D: le confiesa a Jesús que se hizo viral y le llegaron puros pobres | 47 s: "Entonces, ¿qué hago?" | 11, plano/contraplano + **constelaciones que dibujan íconos** ($, torta, persona) | Jesús responde en el fogón | 100 |

## 2. Lo que se repite (las reglas del formato)

1. **Un gag absurdo y sin explicación al principio** (9–44 s), con una premisa de película: ring, UFC, dragón,
   restaurante de Wall Street, fogón con Jesús. Es lo único caro y movido del video.
2. **El gag es el dolor del cliente dramatizado**, no un chiste suelto: las objeciones son golpes, los gurús son
   villanos, el viral es un fogón con Jesús.
3. **Una frase bisagra** convierte el gag en la lección. La suya es "**A ver, amigos, entendamos una cosa**" (usada en
   dos videos) o la pregunta del personaje: "¿qué carajo hago?", "danos tu secreto".
4. **La lección sigue en la ficción, en la consecuencia del gag**: esposado en el patrullero, con hielo en la cara en el
   vestuario, en armadura en la posada. Son planos largos de 10–30 s hablando a cámara: **lo barato del video**. No se
   vuelve a un fondo neutro.
5. **Dos modos**: (a) sketch de acción y después monólogo (ring, caballero, pesada, auto); (b) diálogo entre dos
   personajes de punta a punta, donde **el otro personaje dice la objeción del cliente** (restaurante, fogón, entrevista).
6. **La identidad del clon no es perfecta**: entre videos la cara de Ramiro cambia bastante (el de la UFC casi es otra
   persona). Lo que lo sostiene es **la voz y el vestuario** (gorra para atrás y buzo negro) más que la cara exacta.
7. **Humor y lenguaje de la calle** ("salame", "hijo de puta", "estás cagado"): suena a una persona, no a una marca.
8. **Estructura del mensaje**: tesis → analogía o enemigo → consecuencia → prueba propia (cifras reales suyas) →
   CTA de comentario con una palabra clave y un regalo por privado. Duran **63–127 s**: más largos que nuestros reels.
9. **Subtítulos**: una frase por vez, blanco, chico, abajo y centrado (estilo película). Variantes: verde neón grande
   (caballero, auto) y la palabra clave en itálica manuscrita ("cagado"). Placas finales en negro con la clave en verde.
10. **Audio** (medido): todos a −14 LUFS; **en los huecos de la voz nunca hay silencio**: hay ambiente generado
    (público, fuego, ciudad) a 2–15 dB debajo de la voz. Música con pulso marcado casi no se mide bajo la voz; solo
    aparece clara en la placa final del restaurante (~108 BPM). Hay que confirmarlo escuchando.

## 3. Pipeline de producción

| Paso | Herramienta | Notas |
|---|---|---|
| Guion | Claude, con este README | Un gag que dramatice el dolor + bisagra + lección en la consecuencia + CTA. Sin cifras inventadas |
| Personaje | Higgsfield **Soul** (`show_characters`, 5–20 fotos, ~10 min) para una persona; **Elements** (`show_reference_elements`) si hay 2 personajes en el mismo plano | Soul solo sirve con `soul_2` / `soul_cinematic`. Para 2 personajes: Nano Banana Pro, Seedance 2.0 o Kling 3.0 con Elements |
| Voz | `create_voice` (1–3 min de audio limpio) | Ya hay una voz propia en la cuenta: "Juan" |
| Fotograma clave por plano | `generate_image` (`soul_2` o Nano Banana Pro con referencias) | Un still aprobado por plano antes de animar: es lo barato |
| Planos con diálogo | Ruta A: Seedance 2.5 `omni_reference` con imagen + audio de la voz clonada como referencias. Ruta B: generar con audio nativo (Veo 3.1 / Kling 3.0 / Seedance) y después `voice_change` a la voz clonada | Probar las dos en el primer plano y quedarse con la que sincronice mejor |
| Planos de acción | Kling 3.0 / Veo 3.1 / Seedance 2.5 (imagen → video) | Muchos planos cortos (0.5–3 s) |
| Edición | Remotion (este repo) | Subtítulos estilo película, cama de ambiente, SFX, placa final, master −14 LUFS (`master.mjs`) |

**Créditos**: la cuenta de Higgsfield tenía 0.5 créditos el 2026-10-14 (plan Plus). La API de `scripts/higgsfield.py` se
cobra aparte, en USD.

## 4. Guiones para Nexora (borradores)

Mensaje común: **tu negocio depende de tu memoria, de un cuaderno y de un Excel; un sistema lo hace solo**. No inventar
cifras: donde dice `[dato real]` va uno que Lucas confirme (ej. los 700 mensajes de la clínica de `consultorio-cierra`).

### A. "NXR Fight Night" — "el hijo de puta usa cuaderno" (modo diálogo, ~70 s)

Idea de Lucas (2026-10-14): "peleo con un random, me entrevistan por el KO y digo algo como 'la verdad que tenía un
condimento especial: el hijo de puta usa cuaderno'… ideas creativas y graciosas que mezclen un poquito de humor negro".
El rival es **un tipo cualquiera, sin disfraz**: el chiste está en lo que se dice de él, no en cómo se ve. Cartel
**NXR FIGHT NIGHT**, micrófono con el logo **NXR**.

| # | Plano | Texto |
|---|---|---|
| 1 | Esquina del rival entre rounds, el entrenador le grita en la cara | Entrenador: "¡Cubrite la izquierda! ¡La izquierda!" — Rival saca un cuadernito Rivadavia del short: "Pará, pará… ¿izquierda con zeta o con ese?" |
| 2–4 | Pelea, cortes rápidos: piña de Lucas, el rival se desploma en cámara lenta, el cuaderno vuela por el octágono | (público, golpe, silencio) |
| 5 | Árbitro contando, el rival en el piso con los ojos en blanco | Árbitro: "…tres, cuatro…" — Rival, balbuceando: "¿En cuánto íbamos?" |
| 6 | Entrevista en el octágono | Periodista: "¡Lucas, qué nocaut, hermano! ¿Cuál fue la clave?" |
| 7 | Lucas, transpirado, serio | "La verdad que vine con un condimento especial…" (pausa) "…el hijo de puta usa cuaderno." |
| 8 | Periodista | "¿Cuaderno?" |
| 9 | Lucas | "Cuaderno, hermano. Turnos en un cuaderno, pagos en un Excel y el resto en la cabeza. Lo estudié tres meses: después de las ocho no contesta un WhatsApp. Sabía que en el segundo round iba a estar pensando en los mensajes que dejó en visto." |
| 10 | Periodista | "¿Y la piña final?" |
| 11 | Lucas | "Ni hizo falta. El árbitro le contó hasta diez y él perdió la cuenta en el cuatro. Las cuentas las lleva en la cabeza." |
| 12 | Inserto: lo sacan en camilla, un médico se inclina | Médico: "¿Tiene alguna alergia?" — Rival: "Está anotado… en el cuaderno… en la hoja de atrás." |
| 13 | Periodista | "¿No te parece un poco cruel?" |
| 14 | Lucas | "Cruel es lo que les hace él a sus clientes. Les contesta a los tres días." |
| 15 | Periodista | "¿Y vos cómo hacés?" |
| 16 | Lucas; le vibra el guante: notificación "Turno confirmado" | "Yo tengo un sistema. Un agente que contesta el WhatsApp, agenda, confirma y recuerda solo. Mirá: ahí entró un turno. Mientras le pegaba a este." |
| 17 | Periodista | "¿Algo para decirle a tu rival?" |
| 18 | Lucas a cámara | "Que se recupere. Y si no se recupera, que alguien les avise a sus clientes… porque él no les va a contestar." |
| 19 | Lucas (CTA) | "Y si vos todavía usás cuaderno, comentá SISTEMA. Antes de que te toque a vos." |

**Remates de repuesto** (humor negro, para cambiar o sumar):
- Médico: "¿Algún familiar a quien avisar?" — Rival: "Mi secretaria." — "¿Cómo se llama?" — "…Soy yo."
- Lucas: "En el pesaje no sabía cuánto pesaba. Lo tenía anotado en un papelito y se le mojó."
- Lucas: "Lo tuve contra la reja tres minutos. No se defendía: estaba pasando turnos a mano."
- Periodista: "Dicen que lo vas a ir a visitar al hospital." — Lucas: "Sí, si me confirma el horario. Le escribí el martes."
- Lucas: "El velorio lo organiza él. Así que no sé si va a ir alguien: la fecha la tiene en el cuaderno."
- Lucas: "Su esquina le tiró la toalla. La anotó como ingreso."
- Lucas: "Le encontré la debilidad en el round uno: cada vez que le sonaba el celular, bajaba la guardia."
- Entrenador del rival, entre rounds: "¿Cuántos rounds quedan?" — Rival: "Dejame que lo calculo… ¿alguien tiene una birome?"

### B. "Mi Pyme FC" — el dueño que juega de todo (modo sketch + monólogo, ~70 s)

| # | Plano | Texto |
|---|---|---|
| 1–6 | Estadio lleno, relator. **El mismo tipo (el clon) está en todas las posiciones**: ataja, corre de nueve, grita de DT, lleva el agua; en el banco hay un cuaderno y una planilla impresa | Relator: "¡Ataca el rival… y el arquero de Mi Pyme FC es el mismo que el nueve! ¡Y el técnico! ¡Y el aguatero!" |
| 7 | Gol en contra; se tira al pasto, muerto | (silbato, público) |
| 8–11 | Vestuario, sentado con una toalla, después caminando hacia la salida (vlog selfie como la pesada) | "A ver, entendamos una cosa. Si en tu negocio vos contestás el WhatsApp, agendás, cobrás, anotás en el Excel y encima hacés el trabajo… jugás de arquero, de nueve y de técnico al mismo tiempo. Así no se gana un partido. Un equipo gana porque cada uno tiene su puesto. En tu negocio eso es un sistema: un agente que contesta y agenda a cualquier hora, recordatorios que salen solos y un panel donde ves todo sin preguntarle a nadie. Vos volvés a jugar de lo tuyo." |
| 12 | Saliendo al estacionamiento del estadio | "Comentá EQUIPO y te mando cómo lo armamos." |

### C. "Terapia de pareja" — el dueño y su Excel (modo diálogo, ~70 s)

Consultorio de terapeuta, plano/contraplano. **El Excel es un personaje**: un señor con traje verde cuadriculado.

| # | Quién | Texto |
|---|---|---|
| 1 | Terapeuta | "¿Qué los trae por acá?" |
| 2 | Dueño | "Llevamos ocho años juntos y ya no nos entendemos." |
| 3 | Excel | "Él no me cuida. Me llena de celdas, no me actualiza y después se queja de que no le doy los números." |
| 4 | Dueño | "¡Es que a la noche no tengo tiempo de cargarte!" |
| 5 | Excel, ofendido | "¿Y el cuaderno? ¿Le contaste del cuaderno?" |
| 6 | Dueño, mirando al piso | "…Fue una vez." |
| 7 | Terapeuta, a cámara (bisagra) | "Esto lo veo todas las semanas. El problema no es él ni la planilla: le piden a una planilla que haga de sistema." |
| 8 | Terapeuta | "Un sistema contesta los mensajes, agenda, recuerda y te muestra los números sin que cargues nada a la noche." |
| 9 | Excel, aliviado | "¿O sea que puedo jubilarme?" |
| 10 | Placa final | "Comentá SISTEMA y te mando cómo lo armamos." |

## 5. Decisiones abiertas (Lucas)

- Protagonistas: ¿ustedes clonados (Lucas, Cogne…) o personajes IA? Los guiones sirven para los dos.
- Cuadro: Ramiro sube en horizontal (look de película); nuestros reels van en 9:16.
- CTA y regalo por privado de cada video (Ramiro usa "SISTEMA"; conviene una palabra propia).
- Recargar créditos de Higgsfield antes de generar.
