# Estilo editorial — guía de motion (referencia `estilo-2026-09-23.mp4`)

Fuente: `assets/referencias/estilo-2026-09-23.mp4` (720x1280, 30 fps, 13,3 s). Lucas: "nada que ver en sí, pero
ese estilo tenemos que aprender, asociado a algún video nuestro". El tema (El Padrino) no importa. Lo que se
aprende es lo que pasa **dentro de la tarjeta**. Todo lo de afuera es envoltorio promocional y se excluye (§9).
Armada el 2026-09-24 a partir de 5 análisis verificados (tipografía, movimiento, composición, técnicas, sonido).

**Convenciones**
- `f-NNN`: cuadro a 15 fps de `out/verif/ref-estilo/cuadros/`, t = (NNN−1)/15.
- `fr N`: frame a 30 fps, el mismo número que usa Remotion (t = N/30). fr = 2·(NNN−1).
- "px de tarjeta": la tarjeta mide ≈468x811 px dentro del video. Para pasar a 1080 de ancho se multiplica
  por **≈2,31**.
- Lo que no se puede ver en los cuadros está marcado como *incierto*. Lo que choca con §8 de `CLAUDE.md` está
  marcado como **decide Lucas**.

**Mapa de beats** (7 frases, 6 escenas: B1 y B2 son el mismo plano, unidos por un punch + paneo)

| Beat | fr | Protagonista | Titular (línea 1 / línea 2) |
|---|---|---|---|
| B1 | 0–42 | retrato recortado que sube desde abajo | He never raised his / **voice** (caja de selección) |
| B2 | 43–99 | el mismo retrato, ×1,46 y paneado | Yet the whole / Room went ***silent*** (violeta) |
| B3 | 100–161 | balanza + banda gris en arco | Loyalty was / his only ***currency*** (violeta) |
| B4 | 162–216 | foto apaisada + epígrafe | Family wasn't his / **weakness** |
| B5 | 217–255 | cuadro colgado + figura recortada delante | it was his / **empire** |
| B6 | 256–297 | retrato con marco doble + cruces de registro | They called him / **Godfather** |
| B7 | 298–395 | diario con esquina doblada | History remembers / the name ***Vito Corleone.*** (violeta) |

---

## 1. Qué es este estilo

1. **Titular editorial de 2 líneas que se arma y se corta.** La línea 1 es una bajada en serif fina y la línea 2
   remata en una grotesca pesada. El remate es siempre la última palabra de la frase. No hay cajas, píldoras ni
   fondos detrás del texto (f-019, f-046, f-101, f-124, f-146, f-196).
2. **Una frase = un beat = un protagonista visual.** Los beats duran 1,3–2,1 s; el cierre, 3,3 s. Cada escena
   tiene un solo objeto héroe y mucho aire (fr47–99, 100–161, 162–216, 217–255, 256–297, 298–395).
3. **El texto nunca pisa la imagen.** Va en el espacio vacío. La composición alterna texto centrado y alineado
   a la izquierda, y lo ubica arriba, al medio o abajo según dónde quede el hueco: arriba centrado en f-019, a la
   derecha del sujeto en f-046, a la izquierda de la figura en f-124, abajo centrado en f-146, arriba a la
   izquierda en f-196.
4. **Monocromo más un solo color.** Fondo gris frío, fotos en B/N con trama diagonal y **un** acento violeta
   racionado: 3 de 7 remates y el único objeto en color de la imagen, la rosa (f-019, f-046). Entre f-082 y
   f-180 no hay un solo píxel saturado: B4–B6 son 100 % grises y su remate va en negro.
5. **Nada queda quieto.** Cada escena entra frenando (expo-out), deriva ~1 px/fr y sale acelerando (ease-in).
   El corte cae en el cuadro más rápido y la escena siguiente arranca en la **misma dirección**: hacia abajo en
   fr88→100, hacia arriba en fr204→217.
6. **El desenfoque es la forma de entrar.** Palabras, remates (con estela horizontal) y escenas enteras entran
   desenfocadas y se enfocan. Las salidas nunca llevan blur: el último cuadro antes de cada corte es nítido
   (fr99, 161, 216).
7. **Estética de mesa de diseño con objetos físicos.** Hay una caja de selección con tiradores (f-013→f-019),
   cruces de registro (f-146) y objetos con canto y sombra abajo-derecha: la foto (f-100), el cuadro y la figura
   recortada tipo standee (f-124), el diario (f-184).
8. **El sonido marca la estructura, no decora.** Hay un golpe sub en los cambios grandes, whoosh en los cortes
   y una cama grave desde que termina el hook. Las palabras que aparecen no llevan sonido (§6).

## 2. Tiempos

Todo en frames a 30 fps. Los valores sirven tal cual en Remotion.

| Qué | Valor | Evidencia |
|---|---|---|
| Separación entre palabras de la bajada | **4–6 fr (moda 5 = 0,167 s)** | He 1 · never 6 · raised 11 · his 16 |
| Palabra de la bajada: legible / blur resuelto / color pleno | 6–8 / 5–8 / 16–24 fr (cola larga) | Loyalty fr104→~120; They fr257→~281 |
| Palabras del cierre (B7) | más lentas: 10–13 fr | remembers fr304→~318 |
| Pausa interna (sigue la voz) | 17–25 fr | was→his 22, remembers→the 25, name→Vito 20 |
| Remate **solo** en su línea: llegada | **+7 a +10 fr** después de la última palabra | voice +7, weakness +10, empire +8, Godfather +7 |
| Remate negro: se asienta en | 9–14 fr | weakness fr183→~196; Godfather fr274→~285 |
| Acento violeta **en línea**: llegada | +5–6 fr (cadencia normal) | silent fr77, currency fr141 |
| Acento violeta: color pleno en | 16–20 fr (lavanda → violeta) | silent fr80→96; currency fr143→159 |
| Remate nítido → arranca la salida (hold) | 0–10 fr, típico **~4** | B3: 0 (fr151); B4: ~10 (fr195→205) |
| Remate visible antes del corte | 19–33 fr | silent fr77→99; weakness fr183→216 |
| Salida de escena | **10–12 fr ease-in** | T2 fr88–99; T4 fr204–216 |
| Blur-in de escena entrante | 10–12 fr | fr100→112; fr162→174; fr217→230 |
| Asentamiento de escena | expo-out τ≈10 fr; cola ~0,5–1 px/fr hasta la salida | retrato fr0→40 |
| Asentamiento del cierre | ~48 fr (pull-back 1,28→1,00) | diario fr298→347 |
| Primera palabra del beat siguiente | +1 a +4 fr después del corte | fr99→fr104 'Loyalty'; fr255→fr257 'They' |
| Caja de selección | aparece +7 fr después de 'his'; 35 %→96 % en 9 fr; 100 % en 14 fr | fr23→32→37 |
| Texto contra voz | el texto aparece **0–0,2 s antes** de la palabra hablada | 'He' 0,13 s contra 0,18; 'Loyalty' 3,60 contra 3,63 |
| Beat | 1,3–2,1 s; cierre 3,3 s; un evento estructural cada ~1,9 s | tabla de beats |

**Por beat** (primer cuadro visible, ±1 fr)

| B | Bajada | Remate: entra → asentado | Salida | Corte |
|---|---|---|---|---|
| 1 | He 1 · never 6 · raised 11 · his 16 | caja + voice 23 → 37 | punch ×1,46 fr43 + paneo; fade del título fr44→53 | (mismo plano) |
| 2 | Yet 47 · the 52 · whole 57 · Room 65 · went 71 | silent 77 → ~95 | baja ≈73 px de tarjeta, ease-in fr88–99 | 99→100 |
| 3 | Loyalty 104 · was 109 · his 131 · only 136 | currency 141 → ~158 | push-in 1,00→1,14 fr150–161 | 161→162 |
| 4 | Family 163 · wasn't 168 · his 173 | weakness 183 → ~196 | sube 128 px de tarjeta, fr204–216 | 216→217 |
| 5 | it 218 · was 223 · his 228 | empire 236 → ~245 | izquierda ≈26 px de tarjeta, fr245–255 | 255→256 |
| 6 | They 257 · called 262 · him 267 | Godfather 274 → ~285 | zoom-out 1,00→0,87, fr287–297 | 297→298 |
| 7 | History 299 · remembers 304 · the 329 · name 334 | Vito 354 · Corleone. 360 → ~376 | sin salida | fin fr395 |

**En Nexora**: la cadencia de 5 fr **no se impone**. Cada palabra se ancla a su `start` en `words.json`, porque
whisper ya viene 0,1–0,2 s adelantado, el mismo adelanto que la referencia. De la referencia se toman las
duraciones de entrada, el hold, la salida y el largo del beat.

## 3. Tipografía y color

### Roles

| Rol | Referencia | Tamaño relativo | Nuestra fuente (`public/reserva/fonts`) |
|---|---|---|---|
| Bajada (línea 1) | serif regular tipo Times, apóstrofo curvo (B1–B6) | 38–64 % del ancho | `InstrumentSerif-normal` (más condensada y display que Times: validar) |
| Remate solo | grotesca Bold tipo Helvetica, negra, redonda, en minúscula | **ancho = 0,92–1,05× la línea 1** (bloque justificado); alto de x 1,2× (empire) a 3,6× (voice) | `HelveticaNeue-Bold` (la más fiel) o `Satoshi-900` (la aprobada). **Decide Lucas** |
| Línea 2 con acento | sans Medium/Bold casi del cuerpo de la bajada (1,0–1,2×) que termina en el acento; 1,3–1,85× más ancha que la línea 1 | hasta 75 % del ancho | `Satoshi-500/700` + acento |
| Acento (B2/B3) | grotesca Heavy itálica, violeta | igual que su línea | `Satoshi-900` o `HelveticaNeue-Heavy` con `skewX(-11deg)` (no hay archivo itálico) |
| Cierre invertido (B7) | bajada en sans Regular y acento en **serif Bold Italic** violeta | ≈1,2× | `Satoshi-400` + `InstrumentSerif-italic` (no tiene Bold: va a quedar más liviano) |
| Tercer nivel (B4) | epígrafe serif + cita serif **recta** chica de 4 líneas, centrada (≈2,4 % del ancho de cuerpo) | — | `InstrumentSerif-normal`, ~26 px |

Evidencia de anchos (línea 1 / remate, en px de tarjeta): f-021 219/202 (caja 236); f-101 213/214; f-126 184/179;
f-146 300/315. Con acento: fr95 229/290; fr155 180/333; f-196 220/351.

### Medidas a 1080x1920

- Bajada: font-size ≈ **70–110 px**.
- Remate solo: font-size calculado para que su ancho iguale el de la línea 1 (±8 %). Da ≈110–160 px, y
  ≈220–245 px en un remate de hook tipo 'voice'.
- Interlineado ≈1,0 del cuerpo del remate. Entre el descendente de arriba y la mayúscula de abajo quedan
  ≈25–35 px de aire (10–15 px de tarjeta: fr290 628→639). Las líneas no se tocan.
- Ancho del bloque: 40–76 % del cuadro. Alineado a la izquierda desde x≈110–180 px, o centrado.
- Zonas verticales de la referencia: arriba 9–34 % (B1, B3, B4, B7), al medio 54–66 % (B2, B5), abajo 73–85 %
  (B6).
- Mayúsculas: tipo oración. El remate va en minúscula salvo nombres propios, y solo el cierre lleva punto
  (f-196).
- Sombra del texto: casi imperceptible, un oscurecimiento ≤4 % en 3–5 px hacia abajo (f-101, f-146). Usar
  `0 3px 6px rgba(0,0,0,.08)` o ninguna. El halo claro de 1 px alrededor de las letras es nitidez o compresión:
  **no** copiarlo.

### Color

| Rol | Hex | Evidencia |
|---|---|---|
| Fondo de tarjeta | #D2D6DC → #E2E7EB (lo que varía es la luz del envoltorio). Propuesta: **#DCE0E5** | píxeles medidos; f-064 |
| Tinta del remate | #0A0A0E – #0E1015 | núcleo #000–#090810, f-101, f-146 |
| Tinta de la bajada | plena en B2/B3 (f-046); **gris oscuro ≈#3A3E42** en B4–B6 (f-124, f-146, se ve a ojo) | luma del trazo 50–64 contra 30–35 del remate |
| Acento, relleno | #5F256A – #7E4186; valor de trabajo **#65296F** | silent, currency, Vito (f-046, f-079, f-198) |
| Acento, arranque | lavanda ≈#CDAFDA | silent fr80 |
| Caja de selección | el mismo violeta (#511F5D – #76277F) | f-019 |
| Único color de la imagen (rosa) | #470F47 – #541353 | f-019, f-046 |
| Grises de apoyo | banda #A3A6AA–#AAAEB1; anillo #CED3D7–#D2D7DA | f-064; f-100 |

Reglas del acento:
- Solo en las **últimas palabras**, en la misma línea que el texto, en 2–3 remates por pieza.
- Si el remate va solo en su línea, va en negro.
- El acento **repite el color del único objeto en color de la imagen**.

**Para Nexora (decide Lucas)**: el objeto en color natural de nuestras piezas es el logo de WhatsApp (`LogoApp`),
así que el acento coherente sería el verde (`ACCENT.greenDark` #15803D para texto sobre gris claro), con el logo
como "la rosa". El violeta ciruela es la marca del template, no la nuestra.

## 4. Movimiento y transiciones

Curvas en Remotion: expo-out `p = 1 - Math.exp(-f / 10)`, `Easing.out(Easing.cubic)` o
`Easing.bezier(0.16, 1, 0.3, 1)`. Para ease-in: `Easing.in(Easing.exp)` o `Easing.in(Easing.cubic)`.

| # | Movimiento | Cómo | Duración | Evidencia |
|---|---|---|---|---|
| M1 | **Revelado de palabra** | opacidad 0→1; blur mayormente horizontal ~10→0 px; color de gris claro a tinta. Ya está en su posición final: el bloque no se re-centra. Corrimiento propio ≤12 px a 1080 (la dirección no es concluyente) | opacidad ~8 fr, blur 6–14, color 16–24 | 'Loyalty' fr104–108 aparece a la izquierda del centro; 'his' fr131 en el extremo |
| M2 | **Entrada del remate** | palabra entera; translateX desde la derecha +35–75 px a 1080 → 0; blur solo horizontal fuerte; ease-out. 'Vito' sube desde abajo | 9–14 fr en negro; 16–20 fr en violeta | weakness fr183–197 (25–32 px de tarjeta); empire fr237–245; Vito fr356 |
| M3 | **Caja de selección que revela** | la caja crece anclada arriba a la izquierda (proporción fija ≈2,4:1) y la palabra, ya en su tamaño final, se ve solo dentro de ella; desenfoque por letra de izquierda a derecha | 14 fr (96 % a los 9) | fr23→37; f-013→f-019 |
| M4 | **Asentamiento / deriva** | expo-out; la escena nunca queda quieta | τ≈10 fr; cola hasta la salida | retrato fr0→40: −52, −26, −18… ~1 px |
| M5 | **Salida** | traslación de 5–16 % del cuadro (≈100–300 px a 1920) o escala +14 % / −13 %; ease-in; último cuadro nítido | 10–12 fr | T2 +1…+23 px/fr; T4 −1…−50 px/fr |
| M6 | **Corte con continuidad de dirección** | la entrante sigue en la misma dirección a ~la mitad de velocidad y frena. En cortes verticales o de escala: blur de **toda** la escena (incluido lo fijo) σ≈25–30 px a 1080 → 0 | blur 10–12 fr | T4 50 → ~21 px/fr (fr217→219); arco borroso fr101–111 |
| M7 | **Punch + paneo** (B1→B2) | escala ×1,46 en **1 cuadro** con blur horizontal, después paneo a la izquierda que desacelera ≈37 % del ancho; el texto viaja con la cámara y el viejo se funde | punch 1 fr; paneo ~45 fr; fade ~9 fr | fr42→43; fr43→89; fr44→53 |
| M8 | **Push-in de escena** | 0,84 → 1,00 → 1,03, centrado, ease-out | ~24 fr hasta 1,00 | B4 fr162→186 |
| M9 | **Pull-back de cierre** | 1,28 → 1,00 → 0,98, expo-out largo, sin salida | ~48 fr | B7 fr298→347→370 |
| M10 | **Parallax por capas** (todo en la misma dirección) | fondo decorativo fijo (0×); texto 0,4–0,8× la imagen; recorte en primer plano ≈1,9–2×. Las capas convergen en un contacto | la de la escena | arco fijo fr101–162; B5: cuadro 120, texto 50, figura 250 px de tarjeta; la mano toca el cuadro fr245 |
| M11 | **Vaivén del objeto** | rotación −1° → +4,5° → ~+1°, medio ciclo | ~1,6 s | balanza f-056→f-080 |
| M12 | **Cascada de texto secundario** | línea por línea con blur | una línea cada ~4–10 fr | cita B4 fr164→194; diario f-151→f-171 |

Secuencia de cortes de la referencia: **abajo → push-in → arriba → izquierda → pull-back**. Nunca repite dos
veces seguidas la misma dirección.

Parallax texto/imagen: es fuerte al entrar B1 (título 20 px contra retrato 47) y en B5, débil en B3/B6
(0,85–1,5×) y nulo en B2, donde el texto viaja con el paneo. El texto **vive dentro de la capa de cámara de su
escena**, no es un overlay fijo.

**Choque con §8**: el punch de 1 cuadro (M7) contradice "zooms suaves, nada de golpes secos". Versión Nexora:
6–8 fr con blur horizontal, o saltearlo. **Decide Lucas.**

## 5. Técnicas firma

Solo están instalados `@remotion/cli` y `@remotion/player`: no hay `layout-utils`, `transitions` ni
`motion-blur`. Se pueden reusar `ease`, `lerp` y `springAt` (`src/reserva/motion.ts`), `caraEn`
(`src/pieza/cara.ts`) y `Recorte` (`src/pieza/escenas/marco.tsx`).

### T1. Lockup de titular (bajada + remate igualado en ancho) — f-021, f-101, f-146

- Cada palabra es un `<span inline-block>` anclado a `{ palabra, n }`.
- Bajada = M1. Remate = M2.
- Para igualar el ancho: medir con canvas `measureText` **después** de cargar la fuente (`delayRender` hasta
  `document.fonts.load(...)`) y `fontSize = fontSizeBase * anchoLinea1 / anchoRemate`, con un tope para que el
  remate no pase el 75 % del ancho.
- El bloque va dentro del contenedor que mueve la escena (M4/M5), así viaja con la cámara.

### T2. Estela horizontal (blur direccional) — f-093, f-119, f-138

En CSS el blur no es direccional: usar un filtro SVG por palabra.

```tsx
<svg width={0} height={0} style={{ position: "absolute" }}>
  <filter id={id} x="-50%" y="-20%" width="200%" height="140%">
    <feGaussianBlur stdDeviation={`${sx} ${sx * 0.15}`} />
  </filter>
</svg>
<span style={{ filter: sx > 0.1 ? `url(#${id})` : undefined }}>…</span>
```

- `sx` de ~28 → 0 px en 10–14 fr.
- La región del filtro va agrandada porque la default recorta el blur (§7, misma lección que con las sombras).

### T3. Caja de selección — f-013→f-019

- Un contenedor `overflow: hidden`, anclado arriba a la izquierda, cuyo tamaño es `s ×` la caja final, con s de
  0,35 a 1 en 14 fr ease-out. Adentro va la palabra en su tamaño final: el contenedor hace de máscara.
- En una capa escalada con `transform-origin: top left` van un `<rect>` con `strokeDasharray` (guiones cortos,
  trazo ≈4 px a 1080) y 4 cuadrados rellenos en las esquinas (≈25–32 px finales). Así los tiradores crecen con
  la caja.
- Blur por letra de izquierda a derecha, escalonado ~2 fr, ~6 fr cada letra.
- Uso: una vez por pieza, en la palabra clave del hook.

### T4. Corte en movimiento con continuidad de dirección — fr88→104, fr204→221

Reemplaza el fundido de `MarcoEscena` (hoy: opacidad + blur + 90 px en 14 fr de entrada y 10 de salida).

```ts
const sal = interpolate(f, [dur - 11, dur], [0, 1], { easing: Easing.in(Easing.exp), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const ent = 1 - Math.exp(-f / 10);
// dirSalida de la escena A === dirEntrada de la escena B: 'abajo' | 'arriba' | 'izquierda' | 'push' | 'pull'
// traslación: offsetEntrada * (1 - ent) + amplitudSalida * sal; blur de entrada solo en abajo/arriba/push
```

- Opacidad 1 desde el cuadro 0: sin fundido.
- El corte cae en el último frame de la salida.
- Guardar la dirección en los `datos` para que la escena siguiente la herede.

### T5. Punch + paneo que libera medio cuadro — f-022→f-046

- Sobre el talking head: en la palabra clave, la escala sube a ~1,4 (versión suave de 6–8 fr, ver §4) anclada a
  la cara (`caraEn`). Después, un paneo lateral con expo-out de ~45 fr deja la cara contra un borde.
- En la mitad que queda libre entra un lockup T1. El texto anterior viaja con la cámara y se funde en 8 fr.
- En la referencia la cara termina cortada a la mitad (nariz a 5–10 % del ancho, f-042). Con la regla de seguir
  la cara, probablemente conviene dejarla en ~20–30 %. **Decide Lucas.**
- Encaja con los `zooms` actuales como un tipo nuevo, `"punch-paneo"`.

### T6. Recorte delante de su propio cuadro (persona.webm) — f-110→f-128, f-124

- Arriba va un cuadro colgado: una captura real de Nexora o un cuadro congelado de la pieza, con canto oscuro de
  4–5 px y sombra pesada abajo-derecha.
- Delante va `persona.webm` (`<OffthreadVideo transparent muted>`) con z-index mayor. La cabeza o el hombro pisan
  ~20–45 px del borde del cuadro.
- Al entrar suben los dos con expo-out, pero la persona recorre ≈1,9× más: ≈520 contra 270 px en ~32 fr.
- Sombra direccional del recorte: `drop-shadow(18px 22px 30px rgba(20,24,28,.35))`, en lugar de la centrada de
  `Recorte` (`0 30px 50px`).
- La referencia es de cuerpo entero y la mano tapa el borde (fr240→254). Nuestro recorte es plano medio: sangra
  por abajo como el retrato de B1 (f-019), con **borde duro** en vez de `FUNDIDO_ABAJO`.
- La mano delante del cuadro no se puede fingir.

### T7. Objeto físico con sombra direccional — f-100, f-124, f-146, f-184

- Foto-tarjeta: radio 6–8 px, sin borde.
- Cuadro: línea oscura de 4–5 px, esquinas rectas.
- Marco doble: línea de 4–5 px + filete claro de ~9 px + línea de 4–5 px.
- Documento: esquina superior izquierda doblada (clipPath + triángulo con gradiente) y canto `inset 0 -6px 0
  #c9ccd0`.
- Sombra **siempre abajo-derecha**, nunca arriba ni a la izquierda:
  - pesada: `drop-shadow(14px 18px 22px rgba(20,24,28,.45)) drop-shadow(30px 40px 70px rgba(20,24,28,.18))`
  - suave (marco doble): `drop-shadow(8px 10px 18px rgba(0,0,0,.15))`
  - ajustar mirando stills
- Tratamiento de imagen: `grayscale(1) contrast(1.2–1.3)` + trama
  `repeating-linear-gradient(45deg, rgba(0,0,0,.15) 0 1.5px, transparent 1.5px 5px)` en `multiply`. Sin probar.

### T8. Fondo editorial con marcas de registro — f-064, f-100, f-146

- Gris frío liso, sin grilla ni viñeta.
- Opcional, detrás del héroe y **fijo** (no se mueve con la escena): una banda en arco de gris medio de ~150 px de
  grosor (f-064) o un anillo tenue de ~200 px (f-100).
- 2 cruces "+" finas de ~2 px y ~180 px, en esquinas opuestas (≈(918,211) y (108,1747)), con los brazos que se
  desvanecen en las puntas. Estas **sí** viajan con la capa.

### T9. Un solo color en la imagen — f-019, f-046

Todo en B/N salvo **un** elemento que repite el acento. En Nexora: el logo de WhatsApp a color sobre un panel o
foto desaturados.

## 6. Sonido

Sale de medir el WAV decodificado (el AAC de Instagram), no de escucharlo.

| t (s) | fr | Evento | En pantalla |
|---|---|---|---|
| 0,285 | 9 | golpe sub (el video arranca en su swell; **no hay riser**) | el retrato sube, 'He' |
| 1,615 | 48 | golpe sub (swell desde 1,36) | punch + paneo desde fr42, se asienta; 'Yet' |
| 2,74–2,90 | 82–87 | **silencio literal**: todo lo que no es voz a cero, solo se oye la 's' | entra 'silent' |
| 2,9 → fin | 87 → | entra la **cama** grave estéreo (76/114 Hz), 10–20 dB bajo la voz | desde la bajada de B2 |
| 3,02–3,66 | 91–110 | whoosh descendente (6,5 → 3 kHz) | la escena baja fr88–99 |
| 3,285 | 99 | golpe sub, en el corte | corte a B3 |
| 5,32–5,64 | 160–169 | whoosh sube-baja, **sin golpe** | corte a B4 |
| 7,28–7,40 | 218–222 | swish corto ascendente | corte a B5 |
| 8,585 | 258 | golpe sub | corte a B6 |
| 10,06–10,24 / 10,195 | 302–307 / 306 | swish + golpe sub (pico −0,3 dBFS) | el diario se asienta, 'History' |
| 13,1 | 393 | final sin golpe ni fundido: termina con la voz | diario quieto |

- **Los 5 golpes son el mismo sample** (correlación 0,94–0,99): swell de ~0,25 s, cuerpo en 40–60 Hz y cola
  estéreo de ~0,5 s. Siempre coinciden con un evento de cámara o de escena.
- Las palabras que aparecen **no llevan SFX**: durante la voz sola el side está en cero digital (0,84–1,28 s).
- Voz mono, seca, 34 palabras en 12,9 s (~2,6 palabras/s).
- Master: **−14,1 LUFS integrado, LRA 2,0 LU, true peak −0,3 dBTP**. Todo pega contra un techo de ~−1 dBFS.
- *Incierto*: el grave de 2,25–2,65 s, los micro-eventos agudos de 11,04–11,76 s y el brillo de 12,1 s
  ('Corleone.'). No se sabe si la voz es humana o TTS.

Equivalentes en `SFX_FILES`:
- `golpe-grave`: tiene cola pero no swell. `golpe-seco`: no tiene ni swell ni cola. Para el golpe estructural
  hay que armar un sample de ~0,75 s (swell + golpe-grave) y validarlo a oído.
- `whoosh-cine` para los cortes con blur; `swoosh-tiny` o `tarjeta` para los cortes menores.
- `cama-escena` (58 Hz, 12 s: en piezas largas hay que encadenarla).

Choques con §8 (**decide Lucas**):
- Apertura: §8 dice que el riser es CLAVE al inicio; la referencia abre con un golpe. Lo que sí coincide: tensión
  → hueco de silencio → golpe en el corte. El patrón "riser → corte en 'no' → negro + boom" de Lucas ya es la
  versión Nexora del silencio literal + golpe (fr82→99).
- §8 pide "cada evento visual lleva su sonido"; la referencia no sonoriza las palabras. Propuesta de
  jerarquía: golpe para lo estructural, whoosh para las transiciones y nada para las palabras que aparecen.
- Hoy no hay paso de loudness en el pipeline. Hace falta uno post-render: `loudnorm` de dos pasadas con I=−14 y
  TP=−1, verificado con `ebur128`.

## 7. Cómo aplicarlo a Nexora

Regla base: los **subtítulos grandes centrados de §8 siguen mandando sobre el talking head**. El lockup editorial
es para las escenas y para el momento del punch + paneo, cuando la cara se corre y deja lugar. Todo texto sale de
la transcripción real.

| Momento | Técnica | Detalle |
|---|---|---|
| **Hook** ("tu negocio crece pero tu estructura no") | T3 + zoom suave de §8 | Caja de selección en el acento sobre "estructura" dentro del subtítulo, mientras entra el zoom con seguimiento de cara. Riser durante la frase, corte en "no" → negro + boom (§8). Es el único uso de T3 en la pieza |
| **Paso de cara a escena** | T5 → T4 | Punch suave + paneo que deja la cara en un borde; el lockup T1 entra en la mitad libre; después corte en movimiento a la escena |
| **Dolor** ("el mensaje que entra a las 11 de la noche") | T7 + T9 + T1 | Foto-tarjeta B/N (b-roll del catálogo que **no** contradiga la hora: `broll-220` quedó descartado por el reloj de 5:55) con el logo de WhatsApp a color como único color. Titular "el mensaje que entra / a las 11 de la noche" con acento en "11 de la noche" |
| **Lista de servicios** | T4 encadenado + T1 con remate solo | Un beat por servicio, cada uno con un protagonista (`LogoApp` o ícono premium, nunca lucide). Direcciones rotando abajo → push → arriba → izquierda. Si la voz los dice en menos de 1,3 s cada uno, una sola escena con cascada (M12) en vez de cortes |
| **Afirmación de dashboard** | T7 (documento o foto-tarjeta) + M9 o M8 + M12 | El `panel` tratado como objeto con canto y sombra abajo-derecha: entra con pull-back 1,28→1,0 y las filas se escriben en cascada. Cifras **solo si están en la transcripción** (§1) |
| **CTA** ("comentá ESTRUCTURA") | cierre tipo B7 | Pull-back lento sin salida, bajada en sans regular "Comentá" y acento "ESTRUCTURA" (acá sí se puede repetir T3 como callback del hook). Sin golpe final: termina seco con la voz. Nada del CTA del envoltorio |

**Qué combinar y qué no con las escenas de grilla blanca (Trendspot)**
- **Se combina**: el lenguaje de movimiento (T4, M1, M2, M4, M5) y el lockup T1 sirven en las dos familias.
  Conviene reemplazar el fundido de `MarcoEscena` en las dos.
- **Una familia por pieza**: fondo blanco con grilla que se desplaza y mockups a color (Trendspot), **o** gris
  frío liso, B/N y un color (editorial). Si se mezclan en la misma pieza, nunca en escenas contiguas.
- **No mezclar con el look editorial**:
  - la grilla que se desplaza (la referencia tiene el fondo fijo, T8);
  - varios íconos 3D a color o varios logos a la vez (rompe la regla de un solo color);
  - `SHADOW.card`, que es centrada y simétrica (acá la sombra va siempre abajo-derecha);
  - el PiP redondo: la referencia usa recortes que sangran por un borde (f-019, f-046) o un marco (f-146).
- Los subtítulos ya se ocultan durante las escenas (default `subtitulos: false`): mantenerlo, para no tener dos
  sistemas de texto a la vez.

## 8. Componentes a construir

En orden de prioridad:

| # | Nombre | Qué hace | Props | Esfuerzo |
|---|---|---|---|---|
| 1 | `escenas/titular.tsx` (+ `registry.ts`) | Lockup T1 con M1/M2 y el ancho igualado | `lineas: { palabras: { text, rol: "bajada"\|"bajadaSans"\|"remate"\|"acento", en: Ancla }[] }[]`, `alineacion: "izquierda"\|"centro"`, `zona: "arriba"\|"medio"\|"abajo"`, `igualarAncho`, `colorAcento` | M |
| 2 | `BlurX` (util) | Filtro SVG de blur direccional por id (T2) | `id`, `sx`, `sy?` | S |
| 3 | `CamaraEscena` (reemplaza el fundido de `MarcoEscena`) | Entrada expo-out, salida ease-in y continuidad de dirección + blur-in (T4) | `dirEntrada`, `dirSalida`, `amplitud`, `blurIn: boolean`, `llegaAlFinal` | M |
| 4 | `CajaSeleccion` | Caja-máscara con tiradores que revela una palabra (T3) | `en: Ancla`, `color`, `escalaInicial = 0.35`, `duracion = 14` | S–M |
| 5 | `ObjetoFisico` | Foto-tarjeta, cuadro, marco doble o documento doblado, con sombra direccional y trama B/N (T7) | `tipo`, `src`, `sombra: "pesada"\|"suave"`, `tratamiento: "bn-trama"\|"color"`, `entrada: { escala?, dir? }` | M |
| 6 | `FondoEditorial` | Gris frío liso + cruces de registro + banda o anillo fijo (T8) | `marcas: ("cruces"\|"banda"\|"anillo")[]`, `color` | S |
| 7 | zoom `"punch-paneo"` en `zooms` | Punch suave + paneo expo-out anclado a la cara (T5) | `inicio`, `escala`, `dir`, `recorrido`, `durPunch` | M–L (convive con el seguimiento de cara) |
| 8 | `escenas/recorte-cuadro.tsx` | persona.webm delante de su cuadro con parallax 1,9× (T6) | `cuadro: { src, x, y, ancho }`, `solape`, `datos` del titular | M |
| 9 | `scripts/master.mjs` | Loudnorm de dos pasadas post-render (I −14, TP −1) + informe `ebur128` | `entrada`, `salida` | S |
| 10 | SFX `golpe-estructural` | Swell de 0,25 s + golpe con cola estéreo de 0,5 s, validado a oído | — | S |

Verificación de cada componente con stills (`npx remotion still … --frame=N --timeout=120000`, con `turno.mjs`
si es un render): en la entrada +4, +8 y +18 de cada palabra; en el cuadro anterior al corte, el corte, +6 y +12.

## 9. Qué NO copiar

- **El envoltorio**:
  - pared gris con franjas de luz diagonales y sombra de palmera, que también cruzan la tarjeta (f-010, f-146);
  - pedestal oscuro con la captura del timeline de After Effects (su pantalla cambia entre f-110, f-128 y f-129);
  - CTA "Comment 'Vito' for free / Project File" y badge "Ae";
  - borde claro, esquinas redondeadas y proporción ≈0,58 de la tarjeta. Nuestro lienzo es el 1080x1920 entero.
- **La iconografía de El Padrino**: retratos, rosa, balanza, diario "BREAKING NEWS / THE GODFATHER". No inventar un
  diario ni citas: el documento es un informe o panel real de Nexora, y el texto sale de la transcripción.
- **El violeta ciruela** como color de Nexora (ver §3).
- **Artefactos del template o de la exportación**:
  - el cambio de la bajada a sans en el corte de zoom de B1 (f-024);
  - "Room" con mayúscula (fr95) contra "his" en minúscula en la misma posición;
  - el halo claro de nitidez;
  - la aberración cromática y el rayado dentro del violeta (probablemente compresión).
- **Tal cual, sin pasar por Lucas**: el punch de 1 cuadro, la cara cortada a la mitad por el borde (f-042) y el
  golpe en el frame 0 en lugar del riser.

---

**Decisiones de Lucas (2026-09-24)**
1. Color de acento: **verde Nexora**, con el logo de WhatsApp como único objeto a color de la imagen (no el
   violeta de la referencia).
2. Fondo: **gris frío liso** con cruces de registro fijas (familia visual propia, distinta de las escenas
   Trendspot de grilla blanca; no mezclarlas en escenas contiguas).
3. Fuente del remate: **Helvetica Neue Bold** (bajada en Instrument Serif; validarla en la primera prueba).
4. Zoom: **suave** (regla de §8 de CLAUDE.md: nunca golpes secos), no el punch de 1 cuadro.
5. Apertura: **con riser** (regla de §8), no con golpe.
6. Sonido: **solo en cambios grandes** (golpe grave + whoosh en los cambios de escena); las palabras entran en
   silencio.
