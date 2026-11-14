# En este repo (`D:\Dev\videos\video-editor`)

Solo aplica acá. La skill funciona sin nada de esto; esto la conecta con lo que ya hay.

## Ya instalado
- Kit en `src/reel-marca/` (copia exacta de `template/reel-marca/`), registrado en `src/Root.tsx`.
- Composiciones de ejemplo: `ejemplo-turnix-16x9`, `ejemplo-turnix-reel`, `ejemplo-turnix-cierre`.
- Si se cambia el kit, cambiarlo **en la skill** (`template/`) y volver a copiar: `cp .claude/skills/reel-animacion-marca/template/reel-marca/*.ts* src/reel-marca/` (no toca `briefs/`). Chequeo: `diff -r --exclude=briefs .claude/skills/reel-animacion-marca/template/reel-marca src/reel-marca` debe dar vacío.
- `src/reel-marca/briefs/ejemplo-turnix.ts` es **distinto** del de la skill: suma el bloque `audio` (música `recursos/musica-068.m4a` desde 8,31 s, ANBR Quantum, 117,5 BPM, y los SFX de `public/reserva/sfx/`). El de la skill va sin audio para que funcione en cualquier proyecto.

## Reglas del repo que valen
- Renders y stills por `node scripts/turno.mjs <comando>` (uno a la vez); mirar el espacio en C: antes de una tanda (`CLAUDE.md` §7).
- Stills con `--timeout=120000`. Verificar en Studio con Playwright antes de pedirle a Lucas que recargue.
- Nombres de archivo en kebab-case, TypeScript estricto, nada de `any`.
- Commits: `feat:` en español, imperativo. Rama feature, no push a main.
- Master del audio: `node scripts/master.mjs <entrada.mp4> <salida.mp4>` (−14 LUFS, TP −1.5 dBTP).
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

## Al terminar un reel
Registrar en `CLAUDE.md` §8 (notas por pieza) el slug, la marca y lo que Lucas ajustó; y, si cambió el formato, la regla general.
