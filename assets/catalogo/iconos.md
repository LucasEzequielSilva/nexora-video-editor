# Catálogo de íconos e imágenes

Regla de Lucas: **nunca íconos nativos** (lucide, emojis, dibujados a mano). Solo: íconos premium de `PACKS/ICONOS/`,
logos oficiales de marca, o las imágenes de abajo. Si falta un concepto: sumar una fila a
[icon-set-prompt.md](icon-set-prompt.md) y pedírselo a Lucas.

## 1. Íconos premium — `PACKS/ICONOS/` (los genera Lucas)

Todavía no existe la carpeta. Pedidos con [icon-set-prompt.md](icon-set-prompt.md) (2026-09-23): `bot`, `videos`
(urgentes, para el tachado de "no vendemos bots ni videos sueltos"), `estructura`, `crecimiento`, `mensaje-noche`,
`turno`, `presupuesto`, `sistema`, `panel`, `plantilla`, `camara`, `guion`, `edicion`, `publicacion`,
`recordatorio`, `privado`. Cuando lleguen: mirarlos, describir cada uno acá (cómo se ven, fondo transparente o no)
y copiarlos a `public/` con `npm run recursos -- usar`.

## 2. Logos oficiales de marca — `LogoApp` (`src/pieza/marca.tsx`)

Trazados vectoriales de simple-icons (CC0) en `public/iconos/*.svg` y `src/pieza/marcas-paths.ts`, dibujados como
**ícono de app** (cuadrado redondeado con el fondo de la marca y el glifo encima). En `props.json`: overlay
`icono` con `marca`, o dentro de las escenas.

| `marca` | Se ve como | Para |
|---|---|---|
| `whatsapp` | tile verde degradado, glifo blanco | mensajes, chats, clientes que escriben, el sistema de WhatsApp |
| `instagram` | tile con el degradado amarillo-rosa-violeta, glifo blanco | contenido, publicaciones, comentarios, DMs |
| `googlecalendar` | tile blanco, glifo azul | turnos, agenda, confirmar citas |
| `gmail` | tile blanco, glifo rojo | presupuestos, mails sin responder |

Para sumar otra marca: bajar su SVG de simple-icons, regenerar `marcas-paths.ts` y agregarle color en `ESTILO`.

## 3. Imágenes y clips de `public/assets/`

Mirados sobre fondo gris el 2026-09-23. Casi todos vienen del sistema `reserva`.

| Archivo | Qué es | Tamaño | Fondo | Para | Evitar |
|---|---|---|---|---|---|
| `billetes.png` | fajo de billetes de 100 dólares abiertos en abanico, realista | 1358x1158 | transparente | plata, ganancias, costos, "te empieza a costar plata" | piezas donde se hable en pesos (son dólares) |
| `cerebro.png` | cerebro humano 3D realista, rosado | 1536x1024 | transparente | pensar, estrategia, IA, "la cabeza", memoria | — |
| `reloj.png` | reloj de pared blanco con marco negro, marca ~10:00 | 1536x1024 | transparente (con halo gris) | tiempo, horarios, "hace tres semanas", demoras | frases que nombran otra hora (marca las 10) |
| `estrella.png` | estrella negra de 8 puntas (4 largas, 4 cortas), plana | 1081x1081 | transparente | destello/remate gráfico, "brillo" en títulos (se usa 9 veces en `reserva`) | — |
| `circulo_indicador.png` | círculo de trazo punteado negro, plano | 500x456 | transparente | marcar/rodear algo en pantalla, señalar un dato | — |
| `iphone17pro-blue.png` | iPhone 17 Pro de espaldas, azul, realista | 600x1224 | transparente | celular, redes, "desde el teléfono" | — |
| `iphone17pro-orange.png` | ídem, naranja | 600x1224 | transparente | ídem | — |
| `iphone17pro-silver.png` | ídem, plateado | 600x1224 | transparente | ídem | — |
| `iphone_viejo.png` | iPhone de una cámara doble diagonal, blanco, de espaldas | 1024x1536 | transparente | "antes", lo viejo, contraste viejo vs. nuevo | — |
| `grid-mesh.jpg` | grilla blanca con cruces | 1300x1389 | opaco | — | **tiene marca de agua de alamy abajo**: no usar (el fondo de grilla de las escenas es `FondoGrilla`, en código) |
| `bitcoin_volando.mp4` | moneda de bitcoin girando/volando | 1920x1080, 6 s | **chroma verde** (hay que keyearlo) | cripto, inversión, plata digital | usar sin keyear |
