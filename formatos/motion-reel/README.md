# Formato: motion reel (sin cara, todo motion graphics)

Video de marca o de servicio armado solo con UI animada, texto cinético y música. No hay grabación ni voz.
Primera pieza: **bldrs-estudio-motion** (2026-11-10), reel del estudio de bldrs al estilo del reel de kree8.studio.

- Código: `src/bldrs-estudio-motion/` (composición `bldrs-estudio-motion`, carpeta "bldrs" en Studio)
- Assets: `public/bldrs-estudio-motion/` (audio, fuentes, imágenes, sfx)
- Salida: `out/bldrs-estudio-motion.mp4` + hoja de cuadros `out/bldrs-estudio-motion-hoja.png`
- Referencia: reel de kree8 (`https://kree8.b-cdn.net/KREE8%20MOTION%20part%202K_20-01-26%20v3_3.mp4`), §5 de CLAUDE.md

Una pieza nueva de este tipo arranca copiando esa carpeta con otro nombre (nunca editando la original).

## Clip de UI para Instagram: "zoom settle" (2026-11-10)

Lucas: el motion del reel de @itschatto "para contenido instagram", no para la web. Componente reutilizable
`src/motion-ui/zoom-settle.tsx` (carpeta "motion-ui" en Studio), 1080x1350 (feed 4:5), 30 fps, 8 s, en loop: la tarjeta
entra grande, sube, se asienta mientras el contenido cae en cascada, queda con la banda de pantallas en movimiento y
sale espejando la entrada. Los tiempos son los de `/design` motion.md §10. Una marca nueva = otro objeto de datos como
`ELEVATE` (textos, pantallas, colores, fuentes) + su `<Composition>` en `motion-ui-root.tsx`. Render liviano con
`--public-dir=out/motion-ui/public-render` (copiar ahí solo las imágenes y SFX que usa).
Primera: `zoom-settle-elevate` → `out/motion-ui/zoom-settle-elevate-v2.mp4`.

## Anatomía (la de bldrs-estudio-motion, 1920x1080, 30 fps, 59.5 s)

Música DivKid – Parisian Funk (`musica-076`) desde 22.616 s, 124 BPM: un golpe cada ~14.5 cuadros. **Todos los cortes
caen en un golpe** (`BEATS` en `tema.ts`).

| Bloque | Escenas | Duración | Qué pasa |
|---|---|---|---|
| Hook | `chat1` | 7.7 s | El cliente escribe el pedido en un chat |
| Marca | `marca` | 1.9 s | Golpe de marca |
| Armado | `armado` | 5.7 s | Se arma el producto en pantalla |
| Entrega | `chat2` | 6.3 s | Respuesta / entrega en el chat |
| Logo | `logo` | 3.6 s | Trazo del logo (la música para en el trazo) |
| Problema | `saleMal`, `dolor1–3` | 4 × 1.9 s | Texto cinético: lo que sale mal con otros |
| Giro | `reves`, `funciona` | 2 × 1.9 s | El revés: cómo funciona con nosotros |
| Servicios | `apps`, `webs`, `sistemas`, `agentes` | 4 × 2.4 s | Una tarjeta por servicio |
| Prueba | `tablero` | 3.4 s | Tablero de trabajo con cursores |
| Cierre | `rompimos`, `seleccion`, `garantia`, `cierre` | ~10 s | Garantía y CTA |

Ritmo: texto cinético de 4 golpes (~1.9 s), servicios de 5 golpes (~2.4 s), chats y armado largos (5–8 s) para
que se lean.

## Lo que Lucas ya dijo de reels parecidos (phoneos-169, §8)

- **Dopamínico** = cada plano aísla UNA pieza de la interfaz, gigante, sobre negro con brillo (no la pantalla
  entera), objetos que llegan y se clavan con golpe de cámara, texto cinético grande entre planos, logo de remate.
- **Pero que se lea**: con cortes cada 1–1.5 s dijo "está buenísimo pero es RAPIDÍSIMO, no se llega a ver" y pidió
  ~20 s más. Cada plano tiene que durar lo que tarda en leerse; la pieza entra de golpe y después queda quieta con
  deriva lenta.
- Si lleva voz: preset "Maya" de Higgsfield (`text2speech_v2` + `elevenlabs`), con voseo forzado ("Vos sabés…").
  Rechazó la voz "Juan" y su propia voz clonada.

## Reglas técnicas que ya se aprendieron

- Renders con `--public-dir=out/<slug>/public-render` (solo los assets de la pieza, 21 MB) en vez de `public/`
  (2.4 GB): cada render copia el public entero a `%TEMP%` y llena el C:.
- Renders siempre por `node scripts/turno.mjs` (la PC queda con ~1 GB de RAM libre).
- Master a −14 LUFS. Los clicks de UI meten picos entre muestras: `master.mjs` dejó TP −0.5, así que el final usa un
  limitador sobremuestreado (192 kHz) para quedar en TP ≤ −1.5.
- Cada elemento que entra lleva su SFX (regla general de §8). Volúmenes y momentos en `sonido.tsx` (`GOLPES`).

## Cómo se nutre la calidad (el circuito)

1. **Referencias**: cada reel que te guste va a `assets/referencias/` con una entrada en §5 de CLAUDE.md: qué se
   midió (duración media de plano, cortes por golpe, paleta, transiciones, tipografía) y qué técnica se copia.
2. **Notas de Lucas**: cada cosa que marcás al verlo se anota en §8 (notas por pieza y, si vale para todos los
   reels, en reglas generales). La pieza siguiente arranca leyendo eso.
3. **Lo que funcionó se sube acá**: cuando una pieza queda aprobada, su anatomía y sus reglas pasan a este README
   (como pasó con `ganador-talking-head`).

## Chequeo antes de mostrarlo

- [ ] Cada corte cae en un golpe de la música
- [ ] Todo texto se puede leer entero antes de que se vaya (mirarlo a velocidad real, no solo en la hoja)
- [ ] Cada entrada tiene su SFX y ninguno tapa la música
- [ ] Hoja de cuadros revisada: nada cortado en los bordes, nada en blanco
- [ ] −14 LUFS y TP ≤ −1.5 dBTP medidos sobre el mp4 final
- [ ] Datos, nombres y precios confirmados por Lucas (nada inventado)

### Historia informativa (1080x1920), 2026-11-10

Lucas: "formato historia que sirva de información y mantenga estética". `src/motion-ui/historia.tsx` (composición
`historia-elevate`): portada → una tarjeta por función (label numerado, título con acento, una línea de texto, la captura
real; `sangrado: true` para capturas horizontales que tienen que salir por el borde para leerse) → cierre con CTA y URL.
Cada tarjeta entra y sale con el zoom settle; 4.5–5 s por tarjeta para que se lea. Texto entre y≈250 y y≈1670 (zonas
seguras de la historia). Salida: `out/motion-ui/historia-elevate-v2.mp4` (32.5 s).
