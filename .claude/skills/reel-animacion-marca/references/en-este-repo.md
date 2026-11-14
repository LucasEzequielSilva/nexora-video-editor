# En este repo (`D:\Dev\videos\video-editor`)

Solo aplica acá. La skill funciona sin nada de esto; esto la conecta con lo que ya hay.

## Ya instalado
- Kit en `src/reel-marca/` (copia exacta de `template/reel-marca/`), registrado en `src/Root.tsx`.
- Composiciones de ejemplo: `ejemplo-turnix-16x9`, `ejemplo-turnix-reel`, `ejemplo-turnix-cierre`.
- Si se cambia el kit, cambiarlo **en la skill** (`template/`) y volver a copiar: `cp .claude/skills/reel-animacion-marca/template/reel-marca/*.ts* src/reel-marca/` (no toca `briefs/`). Chequeo: `diff -r --exclude=briefs .claude/skills/reel-animacion-marca/template/reel-marca src/reel-marca` debe dar vacío.
- `src/reel-marca/briefs/ejemplo-turnix.ts` es **distinto** del de la skill: suma el bloque `audio` (música `recursos/musica-068.m4a` desde 8,31 s, ANBR Quantum, 117,5 BPM, y los SFX de `public/reserva/sfx/`, con `tap.wav` para los turnos de la agenda). El de la skill va sin audio para que funcione en cualquier proyecto.
- Versiones del ejemplo: `out/ejemplo-turnix-16x9-master.mp4` es la v1 (violeta con degradés, la que Lucas vio como "muy IA"); `out/ejemplo-turnix-16x9-v2-master.mp4` es la v2 con `references/diseno.md`.

- Reels de referencia: `C:\Users\Lucas\Downloads\videos` (11 de rayyan.pe y 1 de keemfinity).
- `CLAUDE.md` §7–§8 manda sobre la skill si es más nuevo.

## Reglas del repo que valen
- Renders y stills por `node scripts/turno.mjs <comando>` (uno a la vez); mirar el espacio en C: antes de una tanda (`CLAUDE.md` §7).
- Stills con `--timeout=120000`. Verificar en Studio con Playwright antes de pedirle a Lucas que recargue.
- Nombres de archivo en kebab-case, TypeScript estricto, nada de `any`.
- Commits: `feat:` en español, imperativo. Rama feature, no push a main.
- Master del audio: `node scripts/master.mjs <entrada.mp4> <salida.mp4>` (−14 LUFS, TP −1.5 dBTP). Su informe dice "recorta X dB de picos": con X > 3, bajar los SFX (`audio.md`).
- SFX del brief de ejemplo: `public/reserva/sfx/` (golpes medidos en `assets/catalogo/sonidos.md`). Criterio de sonido de Lucas para reels de motion: `assets/referencias/reels-motion-2026-11.md`.
- Anotar cada nota de Lucas sobre este formato en `CLAUDE.md` §8, con fecha, sin que lo pida.

## Qué reusar y qué no (Lucas, 2026-11-11: "los recursos que tengo acá, si es que sirven, pero no creo, porque son saas video motion skill")
Criterio: este formato es **motion de marca en pantalla**, no talking head ni comercial con interfaz real. Según `CLAUDE.md` (sin haber reabierto cada archivo):

| Recurso | ¿Sirve? |
|---|---|
| Satoshi (`public/reserva/fonts/Satoshi-*.woff2`) | Sí: es el default del kit. |
| SFX de `PACKS/SOUND EFFECTS` y música de `PACKS/MÚSICA DE FONDO` (`assets/catalogo/sonidos.md`, `musica.md`) | Sí, con el criterio de `audio.md`. Elegir ganadores (⭐). |
| `npm run recursos` y la biblioteca | Sí, para buscar música/SFX sin adivinar. |
| `scripts/turno.mjs`, `master.mjs` | Sí. |
| `assets/referencias/xzecreative.md`, `reels-motion-2026-11.md` | Sí como contexto: describen el mismo empaque de pantalla filmada. |
| `src/pieza/*` (talking head, escenas, cara, silueta) | No: es otro formato. |
| `src/spec-ad/*` y `formatos/spec-ad/` (UI real capturada, 3D, voz) | No como base. Se puede pedir prestado un objeto 3D (`telefono-3d.tsx`) si un beat lo necesita. |
| `src/motion-ui/*`, `formatos/motion-reel/` (reels sin cara de estudio) | Posible fuente de ideas de beats; no se importan. |
| `npm run verificar` | No: es de piezas con cara. Usar `references/checklist.md` y stills. |

## Música y SFX con el brief
`audio.musica.archivo` y `audio.sfx[].archivo` son rutas dentro de `public/` (para `staticFile`). Copiar el recurso con `node scripts/recursos.mjs usar <id> <slug>` (queda en `public/recursos/`) y usar esa ruta.

## El gusto de Lucas para piezas de motion (citas de `CLAUDE.md` §8 y referencias)
- **Que no parezca IA** (2026-11-11): "se ve muy IA lo único". Color plano, fondo liso, interfaz real, logo real.
- **La pieza es la animación** (2026-11-11): "no me hagas el fondo, enfocate en la pieza final"; "mejoralo dale", "finetunealo".
- **Que piense como estudio** (2026-11-11): "aprende como si fuera un motion graphic skill, dirección creativa, todo lo necesario".
- **Interfaz real** (2026-10-16): "no parece la plataforma ni siquiera se ve, tiene que parecer la plataforma real". Con la interfaz capturada: "espectacular".
- **Dopamínico pero legible** (2026-10-16/17): pidió "dopamínico como estos" y al verlo: "está buenísimo pero es RAPIDÍSIMO, no se llega a ver". Resuelto: la pieza entra de golpe, queda quieta con deriva y dura lo que tarda en leerse.
- **Aire para el motion** (2026-09-25): "un toque menos rápido… para que se pueda apreciar todo mejor el motion".
- **Menos texto** (2026-09-28): "mucho texto = mucha carga cognitiva, falta más visual".
- **Rotar** (2026-09-28): "siento que es muy larga… después tenés que rotar". Relevos de 2–4 s.
- **Sobrio antes que efectista** (2026-09-29): "más sobrio, o sea el anterior estaba bien" (contra degradés, brillos y film burn). Lo fuerte va solo en el gancho.
- **Sonido** (2026-09-23): "los efectos de sonido la están rompiendo" (= están buenísimos, quiere más, coherentes); el golpe cierra la idea ("sino se siente desconectado"); música "uniforme, simétrico" y "más chill" con auriculares.
- **Movimientos amplios** (2026-09-23): "los zoom in o zoom out son muy cortos… da más dopamina el movimiento".
- **Íconos propios** (2026-09-23): "íconos custom y no esos nativos".
- **Primero la pieza entera** (2026-09-25): "devolveme la pieza final para ver qué onda y te voy corrigiendo".

Tensiones abiertas: brillos sobre negro (aprobados en `phoneos-real`, pero ahora delatan IA en este formato); cuántos SFX (la skill eligió: objetos con sonido, palabras en silencio; Lucas no lo confirmó); riser al arrancar (los videos con cara lo llevan siempre; en motion se mide arranque casi en silencio).

## Técnicas del repo para portar al kit (reescribirlas adentro del kit, no importar archivos)
| Técnica | Dónde | Valores clave | Para qué beat |
|---|---|---|---|
| Pieza de interfaz aislada que aterriza | `src/spec-ad/phoneos/composition-169.tsx` (`Elemento`) | resorte {13, 160, 0.8}, rotateX +28°→0, escala 0,55→1, blur 10→0 | prueba con interfaz real |
| Látigo con desenfoque direccional | ídem (`Toma`) | entra 8 cuadros desde +760 px, sale 6; blur SVG hasta 46 px | paso entre planos de interfaz |
| Golpe al detalle | `composition-real.tsx` (`Hook`) | zoom 1→2,3 en 10 cuadros + temblor que se apaga | gancho |
| Tarjeta que salta de columna | `composition-169.tsx` (`Pipeline`) | 24–28 cuadros in-out; se levanta y gira 3° | "lo mueve solo" |
| Cámara por keyframes | `spec-ad/phoneos/real-ui.tsx` (`kf`) | bezier(0.65, 0, 0.35, 1) | todos |
| Celular con la captura real y scroll | `real-ui.tsx` | `PiezaEntra` back(1.4) 9 cuadros | chat real de un producto |
| Captura desarmada en piezas | `formatos/spec-ad/phoneos/capturar.cjs` | Playwright, móvil 390 px DPR 3 | interfaz real del cliente (no copiar sus credenciales de demo) |
| Zoom settle | `src/motion-ui/zoom-settle.tsx` | bezier(0.23,1,0.32,1) y (0.6,0,0.2,1) | presentación o cierre |
| Bento con barrido circular | `src/motion-ui/ui-kit/` | cascada (col+fila)·2,6 cuadros; cambio claro↔oscuro con círculo de 18 cuadros | "todo lo que hace" |
| Asentamiento editorial | `src/pieza/editorial/` | entrada exponencial τ≈10 cuadros, deriva 0,75 px/cuadro, salida 11 acelerando | frases |
| Chat → montaje | `src/motion-ui/chat-montaje-bldrs.tsx` | zoom ×2,4 en 26 cuadros al remate; montaje que acelera | formato chat → montaje |

No portar el look de `bldrs-estudio-motion` (partículas, arcoíris) ni de `aviso-elevate` (degradés, estrella): son anteriores a "muy IA".

## Al terminar un reel
Registrar en `CLAUDE.md` §8 (notas por pieza) el slug, la marca y lo que Lucas ajustó; y, si cambió el formato, la regla general.
