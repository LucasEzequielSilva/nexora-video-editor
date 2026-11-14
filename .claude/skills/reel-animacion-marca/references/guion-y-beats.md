# Guion y beats

## Fórmula (6–10 beats, 20–30 s)
1. **Dolor** (1–2 beats, ~5 s): pregunta o frase que el público dice. "¿Otra vez anotando turnos a mano?", "Es frustrante".
2. **Escena real** (1–2 beats): el problema o el producto en una interfaz creíble (pantalla de bloqueo con notificaciones, chat de WhatsApp).
3. **Giro** (1 beat): una palabra grande y un pie corto sobre fondo de color pleno ("solito. / Sin que toques el celular.").
4. **Prueba** (1 beat): mejor la interfaz con el resultado (la agenda que se llena) que un número suelto. Un número o un precio solo con dato real, o ficticio y marcado.
5. **Resumen** (opcional): 2–4 funciones en una lista. Si se pueden mostrar en la interfaz, mejor.
6. **Cierre de marca** (1 beat, ~4 s): logo + tagline + botón con cursor que hace clic.

El valor (qué gana el espectador) llega a más tardar en el beat 2–3 (≤ ~7 s); el resto es evidencia. Antes de escribir los beats, nombrar el ritmo (`dolor-dolor-SOLUCIÓN-GOLPE-prueba-sostén`) y escribir el concepto (`direccion-creativa.md`).

## Duración en compases
Las duraciones se escriben en **tiempos de música**, no en segundos, para que cada corte caiga en el pulso:
```ts
import { compas } from "../tiempos";
const t = (tiempos: number) => compas(tiempos, 117.5);   // BPM de la cama elegida
{ tipo: "frase", texto: "...", durS: t(6) }
```
Referencia a 117,5 BPM (1 tiempo = 0,51 s = 15,3 cuadros): frase corta 6 tiempos, teléfono 8, chat 12, giro 6, agenda 10, logo 8 → 50 tiempos ≈ 25,5 s (Turnix). Número 6 y lista 8 si se usan.
Si no hay música todavía, usá segundos con `durS: 3.0`. El kit redondea el **acumulado**, no cada beat, así que el error no se arrastra.

## Escribir los textos
- Máximo **7 palabras** por beat. Frases con verbo.
- Marcado dentro del texto (una marca por beat):
  - `[palabra]` → **clave**: en el color de marca, misma letra y peso. Si el color no se lee sobre el fondo (amarillo sobre claro), va con un **marcador** detrás. Lo decide el kit por contraste.
  - `{frase}` → **subrayado a mano**: se traza cuando la frase termina de entrar (con marcador grueso si el color no se lee como trazo fino).
  - La puntuación pegada (`[agenda solo].`) queda afuera de la marca.
- Voseo si el público es argentino ("probalo", "tenés"); neutro si es LATAM general. No mezclar.
- Nada de relleno ("somos líderes"). Beneficio concreto: "Sin que toques el celular".
- El nombre de la marca aparece recién en el beat de solución o en el giro.
- Datos de la interfaz con nombre y apellido, horas y precios creíbles, coherentes entre beats.

## Tipos de beat (`tema.ts`)
| tipo | Campos | Para qué |
|---|---|---|
| `frase` | `texto`, `tamano?` (84) | dolor, beneficio suelto |
| `heroe` | `palabra`, `pie` | el giro: una palabra de 300 px, plana, y un pie. Va bien con `fondo: "acento"`. Una sola línea: si `palabra` tiene más de 8 caracteres el tamaño baja solo (probado con "0% comisión.", 175 px) |
| `telefono` | `texto`, `lineas[{titulo,detalle?,app?,hora?}]`, `hora?`, `fecha?`, `lado?` | pantalla de bloqueo tipo iOS con leve giro 3D; cada notificación nueva entra arriba y empuja a las viejas. `app: "WhatsApp"` pone el ícono real. Máx. 3 |
| `chat` | `texto?`, `mensajes[{de:"cliente"\|"marca",texto}]`, `contacto?`, `hora?` | WhatsApp visto desde el teléfono del cliente: él escribe en la barra y manda (verde, con tildes), el negocio contesta con "escribiendo…" arriba. `contacto` = nombre del negocio. Máx. 4 mensajes de ≤ 2 líneas |
| `agenda` | `texto?`, `mes?`, `dias[]` ("Lun 16"), `turnos[{dia,hora,nombre,detalle?}]`, `desdeHora?` (9), `hastaHora?` (18) | semana de calendario donde los turnos caen uno por uno. 5–8 turnos |
| `numero` | `valor`, `decimales?`, `prefijo?`, `sufijo?`, `etiqueta?`, `leyenda` | prueba con dato real: cuenta y aterriza con un rebote |
| `lista` | `titulo`, `items[]` | 2–4 funciones (chips blancos con tilde) |
| `logo` | `boton?` | siempre el último; logo real si hay `marca.logo`; con `boton` aparece un cursor que hace clic |

Todos aceptan `fondo`: `base` (claro de la marca), `acento` (color de marca lleno, plano; el texto va en tinta o blanco según se lea mejor) u `oscuro` (tinta de la marca casi negra).
**Alternar fondos**: nunca más de tres beats seguidos con el mismo. Cada cambio de fondo es un golpe de atención.

Todos aceptan `transicion` (cómo ENTRA el beat): `fundido` (default), `empuje`, `zoom` (al objeto del beat anterior), `expande` (el objeto anterior crece hasta ser la pantalla) o `corte`. Una primaria en la mayoría de los cortes y los morph donde el objeto lo pide: ver `transiciones-y-escenas.md`.

## Transiciones y movimiento (ya resueltos por el kit)
- Todas las transiciones terminan justo en el corte (el pulso). El contenido nuevo arranca 4 cuadros antes, mientras sale el viejo: no queda bache vacío.
- Entre un fondo claro y uno oscuro el fondo nuevo entra con un círculo, nunca con fundido (que pasa por gris).
- Todo el contenido deriva lentamente (escala 1 → 1,03) para que nada quede quieto.
- Fondos planos, sin manchas ni partículas: el movimiento lo dan los objetos.
- Curvas y resortes de `movimiento.ts`: la interfaz sin rebote, palabras escalonadas cada 4 cuadros que asientan como una cámara, turnos con cadencia que acelera.

## Qué pedirle al usuario si el brief es flojo
"¿Qué dice tu cliente cuando tiene el problema?" (dolor), "¿qué pantalla del producto muestra el resultado?" (prueba) y "¿qué cifra real tenés?". Sin cifra real, no hay beat `numero`: va la interfaz o un `heroe`.
