---
name: reel-animacion-marca
description: Motion graphics y dirección creativa para animaciones de marca 16:9 con música y efectos (Remotion), al estilo de los reels "hecho por Opus + mi skill" de rayyan.pe, y si se pide, el reel vertical con laptop, etiqueta y cierre "Comentá SKILL". Usar cuando se pida un video de animación de marca, motion de producto o de una app, "como los de rayyan.pe / xzecreative", un aviso o comercial hecho con IA que no parezca hecho con IA, dirección creativa de un motion, o un reel para regalar una skill por comentario. Funciona en cualquier proyecto Remotion.
---

# Animación de marca con dirección creativa

Se trabaja como un estudio de motion: primero la idea y el mundo, después el movimiento. La pieza final es la **animación 16:9 con audio** (1920x1080, 20–30 s, 6–10 beats de una idea cada uno). El empaque en laptop y el cierre "Comentá SKILL" son opcionales.

Hablá en español rioplatense, corto. Todo el texto en pantalla es verdadero o está marcado como concepto.

## Cómo piensa esta skill
- **Concepto antes que efectos.** Una idea que solo esta marca puede contar, con sus objetos reales (su interfaz, sus datos, su logo).
- **Continuidad, no diapositivas.** Las buenas piezas se mueven por un mismo espacio: entran al teléfono, la ventana crece hasta ser la pantalla, el objeto queda de ancla. Cada transición tiene un motivo.
- **Que no parezca IA.** Un color de marca plano, fondos lisos, interfaz real, nada de degradés de dos tonos, brillos, partículas ni rebotes de juguete.
- **El movimiento es de producto.** La interfaz va rápida y sin rebote, la cámara y las escenas más lentas, y todo con las mismas curvas.
- **El sonido es coreografía.** Cada evento visible suena en su cuadro, con una familia coherente sobre una música pareja.

## Referencias (leer según el paso)
| Archivo | Qué tiene |
|---|---|
| `references/direccion-creativa.md` | proceso, historia, ritmo, composición, tipografía, spec de diseño, revisión |
| `references/anatomia.md` | lo medido en las referencias, incluido cómo transicionan cuadro a cuadro |
| `references/guion-y-beats.md` | el brief: fórmula, compases, marcado de texto, tipos de beat |
| `references/diseno.md` | que no parezca IA: paleta, interfaz, chequeo |
| `references/motion.md` | curvas, resortes, tiempos, coreografía, recetas por elemento, rúbrica, vocabulario |
| `references/transiciones-y-escenas.md` | cómo elegir transiciones, las del kit y patrones de escena para sumar |
| `references/audio.md` | música, SFX automáticos, ducking, diseño sonoro, master |
| `references/empaque-y-post.md` | laptop, etiqueta, cierre y texto del post |
| `references/checklist.md` | verificación antes de entregar |
| `references/en-este-repo.md` | solo si existe: conecta la skill con el proyecto donde está instalada |

El `CLAUDE.md` del proyecto manda sobre esta skill si es más nuevo.

## Proceso
| # | Paso | Cómo | Sale |
|---|---|---|---|
| 1 | Intención | Pedir solo lo que falte: marca y qué hace, **logo** (SVG o PNG), **colores y tipografía**, el dolor que resuelve, duración (20–40 s), palabra del cierre. Si no hay respuesta: 25–30 s, palabra `SKILL`. | "Esta pieza le dice a [público] que [mensaje]" |
| 2 | Mundo y concepto | `direccion-creativa.md` §Proceso: objetos que solo esta marca tiene, el antipatrón del rubro, 3 conceptos y una recomendación. Si piden "armalo", se elige por dentro y se avisa. | Concepto elegido |
| 3 | Spec | Colores con rol, letra, objeto héroe, transiciones (una primaria + acentos con motivo), sonido, lo que nunca va. Marca inventada: la paleta sale del tema (`diseno.md`). | Spec en el brief |
| 4 | Brief y beats | Instalar el kit si falta (`node .claude/skills/reel-animacion-marca/template/instalar.mjs <proyecto>` + `<ReelMarcaCompositions />` en el Root). Copiar `briefs/ejemplo-turnix.ts` a `briefs/<slug>.ts` y sumarlo a `BRIEFS`. Ritmo nombrado, valor a más tardar en el beat 2–3, datos coherentes entre beats (`guion-y-beats.md`). | Brief con dirección por beat |
| 5 | Cuadros clave | Un cuadro por beat en su momento más visible, antes de pulir el movimiento: jerarquía, aire, tamaños (`npx remotion still … --frame=N`). | Hoja de contactos |
| 6 | Movimiento | El kit ya trae curvas y resortes (`movimiento.ts`) y las transiciones; afinar con `motion.md` y `transiciones-y-escenas.md`. Si un beat necesita algo nuevo, tipo en `tema.ts`, vista en `animacion.tsx`, objeto en `objetos.tsx`. | MP4 de prueba |
| 7 | Sonido | `audio.md`: música con `desdeS` en un tiempo fuerte, duraciones en `compas(n, bpm)`, `audio.auto` para los SFX. | Mezcla |
| 8 | Revisión | Cuadros por beat y alrededor de cada corte, rúbrica de `motion.md`, chequeo "¿se ve IA?", master (`checklist.md`). | MP4 masterizado |
| 9 | Empaque y post | Solo si se pide (`empaque-y-post.md`). | Reel + texto |

## Reglas que no se rompen
- **Un beat = una idea**, máximo 7 palabras. Clave entre `[corchetes]` (color de marca plano, o marcador si el color no se lee) y frase a subrayar entre `{llaves}`. Una marca por beat.
- **Interfaz real y logo real** (`marca.logo`) siempre que existan. Si se copia una interfaz conocida (WhatsApp, iOS), fiel en colores y detalles.
- **Nada inventado**: cifras, clientes y resultados salen del pedido o son ficticios y marcados.
- **Transiciones con motivo**: una primaria en la mayoría de los cortes, acentos solo donde el objeto lo pide; nunca fundido entre claro y oscuro; nunca un bache vacío en el corte.
- **Sin rebote en la interfaz** (ζ ≥ 0,8) y nunca `spring()` sin `config`.
- **Fondos alternados** (`base` / `acento` / `oscuro`), nunca más de tres beats seguidos con el mismo.
- **Tiene que entenderse sin sonido**, y lo que hay que leer queda quieto mientras se lee.
- El cierre del reel es siempre: etiqueta → animación completa → cierre en silencio. El logo final dura ≥ 3 s.
- No digas que algo es "100 % hecho por Opus" si no lo es.

## Regalar la skill
Se manda la carpeta `reel-animacion-marca/` **sin** `references/en-este-repo.md` (es del proyecto de origen). Quien la recibe la pone en `.claude/skills/` de su proyecto (o en `~/.claude/skills/` para todos) y corre el paso 4. Música, SFX y fuentes no van incluidos: cada uno usa los suyos.

## Checklist de salida
- [ ] Concepto y spec escritos; el valor llega a más tardar en el beat 2–3.
- [ ] MP4 16:9 con audio, masterizado (−14 LUFS, ≤ −1.5 dBTP).
- [ ] Rúbrica de `motion.md` y chequeo "¿se ve IA?" de `diseno.md` en cero.
- [ ] Cuadros revisados: uno por beat y cuatro alrededor de cada corte.
- [ ] Qué es real y qué es ficticio, dicho en la entrega.
