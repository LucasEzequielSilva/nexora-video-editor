# Guion y beats

## Fórmula (8–12 beats, 20–30 s)
1. **Dolor** (1–2 beats, ~5 s): pregunta o frase que el público dice. "¿Otra vez anotando turnos a mano?", "Es frustrante".
2. **Escena real** (1–2 beats): el problema o el producto en una pantalla creíble (teléfono con notificaciones, chat).
3. **Giro** (1 beat): una palabra grande y un pie corto sobre fondo de color pleno ("solito. / Y todo cae en tu agenda.").
4. **Prueba** (1 beat): un número que cuenta o un precio. Solo con dato real, o ficticio y marcado.
5. **Resumen** (opcional): 2–4 funciones en una lista.
6. **Cierre de marca** (1 beat, ~4 s): logo + tagline + botón con cursor que hace clic.

## Duración en compases (afinado)
Las duraciones se escriben en **tiempos de música**, no en segundos, para que cada corte caiga en el pulso:
```ts
import { compas } from "../tiempos";
const t = (tiempos: number) => compas(tiempos, 117.5);   // BPM de la cama elegida
{ tipo: "frase", texto: "...", durS: t(6) }
```
Referencia a 117,5 BPM (1 tiempo = 0,51 s = 15,3 cuadros): frase corta 6 tiempos, teléfono 8, chat 12, giro 6, número 6, lista 8, logo 8 → 54 tiempos ≈ 27,6 s.
Si no hay música todavía, usá segundos con `durS: 3.0`. El kit redondea el **acumulado**, no cada beat, así que el error no se arrastra.

## Escribir los textos
- Máximo **7 palabras** por beat. Frases con verbo.
- Marcado dentro del texto:
  - `[palabra]` → **acento**: serif itálica más grande con degradé de la marca (necesita `marca.fuenteAcento`).
  - `{frase}` → **subrayado dibujado a mano** debajo de la frase; se traza cuando termina de entrar.
  - Se pueden combinar en un mismo texto: `"¿Otra vez [anotando turnos] {a mano}?"`. No anidar.
- Una sola palabra clave de acento por beat (dos como máximo).
- Voseo si el público es argentino ("probalo", "tenés"); neutro si es LATAM general. No mezclar.
- Nada de relleno ("somos líderes"). Beneficio concreto: "aunque tu consultorio esté cerrado".
- El nombre de la marca aparece recién en el beat de solución o en el giro.

## Tipos de beat (`tema.ts`)
| tipo | Campos | Para qué |
|---|---|---|
| `frase` | `texto`, `tamano?` (104) | dolor, beneficio suelto |
| `heroe` | `palabra`, `pie` | el giro: una palabra gigante en serif itálica con degradé y un pie. Va bien con `fondo: "acento"` |
| `telefono` | `texto`, `lineas[{titulo,detalle?,app?,hora?}]`, `hora?`, `fecha?`, `lado?` | pantalla de bloqueo; cada notificación nueva entra arriba y empuja a las viejas. Máx. 3 |
| `chat` | `texto?`, `mensajes[{de:"cliente"\|"marca",texto}]`, `estado?` | conversación: el cliente escribe en la barra, el negocio responde con "escribiendo…". Máx. 4 mensajes de ≤ 2 líneas |
| `numero` | `valor`, `decimales?`, `prefijo?`, `sufijo?`, `etiqueta?`, `leyenda` | prueba; cuenta y aterriza con un rebote |
| `lista` | `titulo`, `items[]` | 2–4 funciones |
| `logo` | `boton?` | siempre el último; con `boton` aparece un cursor que hace clic |
Todos aceptan `fondo`: `base`, `acento` (color de marca lleno con degradé, texto blanco) u `oscuro`.
**Alternar fondos**: nunca más de tres beats seguidos con el mismo. Cada cambio de fondo es un golpe de atención.

## Transiciones y movimiento (ya resueltos por el kit)
- El fondo del beat siguiente entra con fundido de 10 cuadros **encima** del anterior, mientras el contenido anterior sale con desenfoque y leve achique; el contenido nuevo arranca justo en el pulso.
- Todo el contenido deriva lentamente (escala 1 → 1,03) para que nada quede quieto.
- Manchas de color y partículas son continuas entre beats (no se reinician en cada corte).
- Entradas con resorte, desenfoque que se afina y palabras escalonadas cada 4 cuadros.

## Qué pedirle al usuario si el brief es flojo
"¿Qué dice tu cliente cuando tiene el problema?" (dolor) y "¿qué cifra real tenés?" (prueba). Sin cifra real, el beat `numero` se reemplaza por una `frase` o un `heroe`.
