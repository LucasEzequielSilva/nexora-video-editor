# Formato spec-ad — comercial de producto con Claude (director) + Remotion + Higgsfield

Comercial de producto de ~20 s, 16:9 master + 9:16, en el lenguaje de los spec ads de Revolut / Spotify / Amazon hechos con
"Opus + Katana" (Riccardo Bosso, analizados cuadro por cuadro el 2026-10-16: §3). Sirve para tres cosas:

1. **Portfolio y contenido**: spec ad de una marca conocida + reel "detrás de escena" (§7).
2. **Venta**: llegar a la reunión con un prospecto (ej. clínica Maderi) con su comercial de 20 s ya hecho.
3. **Casos de cliente**: el agente de Raquel mostrado como producto (chat real → turno confirmado).

Todo sale de un archivo: `public/spec/<slug>/spec.json`, que escribe Claude como director creativo. El código no se toca
por pieza (salvo registrar el slug). Demo funcionando: `public/spec/demo-agente-turnos/spec.json`.

---

## 1. Reparto de roles

| Rol | Quién / qué | Regla |
|---|---|---|
| Director creativo, guionista, productor | **Claude** | concepto + motivo, guion de VO, escenas, cue sheet de SFX, prompts de plates, el `spec.json` |
| UI y motion graphics | **Remotion** (`src/spec/`) | la UI es **real** (capturas, grabación de pantalla o el chat de WhatsApp del editor). Nunca UI generada por IA |
| Planos de ambiente / objetos / momentos aspiracionales | **Higgsfield** — Soul Cinema (still) → Seedance 2.5 (video) | sin personas salvo que el plano las pida; **cotizar con `get_cost` y pedir OK antes de cada generación** |
| Remix de una referencia | **Katana** | solo con referencias sobre las que tenemos derechos (piezas propias, presets del catálogo de Katana). **No** se suben los ads de Bosso ni de marcas ajenas como referencia |
| Voz | ElevenLabs o voz propia | dos carriles A/B alternados, una línea por clip |
| Música + SFX | `PACKS/` (stems) + paleta `SFX_FILES` | nada sintetizado; música libre de derechos para lo que sube Nexora |
| Montaje fino (opcional) | DaVinci Resolve | con las capas exportadas (§5) |

## 2. Estructura (igual en los 3 de referencia)

```
0–2 s    APERTURA   punto de luz → destello → logo                         (apertura)
2–9 s    PROMESA    VO: promesa grande + fricción cero + tríada concreta   (dispositivo / plate)
9–17 s   BEATS      3–5 momentos de producto, UNA idea por plano           (dispositivo / tarjetas / plate)
17–20 s  TAGLINE    tipografía cinética, 2–4 palabras                      (frase)
20–23 s  END CARD   logo con glow → se aplasta en una línea → se apaga     (cierre)
```

**Fórmula del guion** (transcriptos reales en §3): promesa sensorial ("Every song you love…") → fricción cero ("one tap",
"just ask") → tríada concreta ("spend, save and travel") → diferencial opcional ("And now you can just ask") → tagline
+ marca sola. Frases de 2–3 s, verbos, nada de adjetivos vacíos. **1 línea de VO = 1 escena.**

## 3. Lo observado en las referencias (2026-10-16)

- **Guiones**: Revolut: "Your whole money life in one app. Spend, save, and travel with Revolut. And now you can just ask. /
  See where your money goes. / Freeze a card with your approval. / Get an eSIM for your trip. / Revolut. Now with AIR."
  Spotify: "Every song you love, already in your pocket. One tap and you're in. Chill mixes, late-night drives, the new
  drop everyone's talking about. / Listen to your favorite artists with a single click. / Spotify." Amazon: "Anything you
  can think of is one search away. One tap, and it's already on its way, right to your door. / Everything you love. From A
  to Z. / Amazon."
- **Imagen**: escenario oscuro + **un** glow radial del color de marca detrás del héroe; UI real flotando (teléfono 3D que
  gira, tarjetas de vidrio); transiciones por desenfoque o porque un elemento se transforma en el siguiente (pill → punto →
  logo); push-ins lentos, nunca quieto; una imagen "aspiracional" en el medio para respirar (Santorini en Revolut).
- **El motivo** (lo mejor de Amazon): la línea de luz de la sonrisa aparece, se vuelve la ruta del envío sobre un mapa 3D,
  subraya "From A to Z." y cierra como una línea que se apaga. Un objeto que viaja por todas las escenas = comercial caro.
- **Timeline** (DaVinci Resolve 21, visto en pantalla): cada escena en 4 capas `S03 V1 - Spend - STAGE / CONTENT / BLOOM /
  BAKED (16x9).mov`; escenas numeradas S01…S12 con nombre; VO en carriles `VO L1 (lane A)`, `VO L2 (lane B)`…; música en
  stems (`Music 1 - Drums.wav`, `Music 2 - Bass.wav`, hasta 7); SFX por categorías (Whooshes, UI & foley, Hits & impacts,
  Glitch & light) **con su timecode en el nombre** (`SFX 020 - 4.237 soft_wipe.wav`); bins `01 Scenes 16x9`,
  `02 Scenes 9x16`, `Graphics`, `Voice-over`, `Music stems`, `SFX`, `Reference`.

## 4. El `spec.json` (tipos en `src/spec/tipos.ts`)

- `marca`: `nombre`, `color` (glow, acentos, línea), `fondo` (casi negro), `color2` opcional, `fuente` (`satoshi` | `helvetica`).
- `escenas[]`: `id` (S01…), `nombre`, `tipo`, `desdeS`/`hastaS` (**contiguas**, sin huecos), `origen` (`codigo` |
  `higgsfield` | `katana`: registro de qué es generado), `brillo` (centro/intensidad del glow), `empuje` (cámara),
  `linea` (tramos del motivo, puntos normalizados 0..1, `puntosVertical` para 9:16, `cola` = cometa), `datos`:

| Tipo | Qué es | `datos` |
|---|---|---|
| `apertura` | punto de luz → destello → logo | `logo` (PNG blanco) o `texto`, `revientaS`, `bajada` |
| `dispositivo` | teléfono 3D girando con UI real + texto al costado (16:9) o arriba (9:16) | `pantalla` (`imagen` / `video` / `chat`), `giro`, `lado`, `textos[]` |
| `tarjetas` | tarjetas de vidrio en escalera con check | `tarjetas[]` (`titulo`, `detalle`, `icono` = logo oficial, `check`, `atS`), `textos[]` |
| `frase` | tagline grande | `textos[]` |
| `plate` | plano de Higgsfield con empuje y texto; sin archivo muestra el prompt pendiente (solo en Studio) | `prompt`, `modelo`, `archivo`, `oscurecer`, `textos[]` |
| `cierre` | end card que se aplasta en una línea y se apaga | `logo`/`texto`, `bajada`, `apagaS` |

- Texto cinético: `{ atS, pasoS, lineas: [{ palabras: "texto" | [{ t, acento }], serif?, tamano? }] }`. Cada texto de una
  escena reemplaza al anterior. `acento` = color de marca (una palabra por frase).
- `voz[]` (`atS`, `carril` A/B, `texto`, `archivo` cuando está grabada), `musica[]` (stems), `sfx[]` (cue sheet:
  `atS` donde cae el **golpe**, `nombre` de la paleta `SFX_FILES` o `archivo`, `categoria`, `nota`), `pendientes[]`.

Escena nueva = archivo en `src/spec/escenas/` + tipo en `tipos.ts` + `registry.ts`.

## 5. Pipeline

0. **Brief** (Cogne/Lucas → Claude): marca, producto, 3 features, público, color, **capturas o grabaciones reales de la UI**
   en `public/spec/<slug>/ui/`. Si es cliente: su OK para mostrar la UI y textos sin datos reales de terceros.
1. **Dirección** (Claude): concepto en una frase + el motivo y cómo evoluciona; guion (§2); escenas; cue sheet; prompts de
   plates. Todo en `public/spec/<slug>/spec.json`. Registrar el slug en `SPECS` de `src/spec/spec-root.tsx`.
2. **Chequeo + cue sheet**: `npm run spec -- <slug>` → `out/spec/<slug>/cue-sheet.md` (escenas, VO por carril, SFX con
   timecode en el nombre, stems, plates, pendientes). Tiene que dar 0 ✖.
3. **Style frames** antes de animar: `npx remotion still src/index.ts spec-<slug> out/verif/spec/f<N>.png --frame=<N>` en
   2–3 momentos clave (apertura, beat principal, tagline). Se aprueba el look acá, no después de renderizar todo.
4. **Plates** (Higgsfield, MCP `higgs`): para cada `plate` → still con `soul_cinematic` (sin personas: revisar cada imagen)
   → video con `seedance_2_5` del largo de la escena + 0.5 s. **Antes de cada job: `get_cost`, mostrar el costo y esperar
   OK.** Bajar a `public/spec/<slug>/plates/` y poner `archivo` en el spec. Katana solo si hay una referencia propia.
5. **Voz y música**: grabar las líneas de `voz[]` (una por archivo, carriles A/B) en `public/spec/<slug>/vo/`; elegir un tema
   con stems de `PACKS/` (catálogo `assets/catalogo/musica.md`), drop en el tagline.
6. **Borrador**: `npx remotion render src/index.ts spec-<slug> out/<slug>-draft.mp4 --scale=0.5` (+ `-9x16`) y hoja de
   cuadros: `ffmpeg -i out/<slug>-draft.mp4 -vf "fps=2,scale=480:-1,tile=4x6" out/verif/spec/hoja_%d.jpg`. Mirarla entera.
7. **Final**: render 16:9 y 9:16 por `turno.mjs`, `node scripts/master.mjs` (−14 LUFS).
8. **Capas para DaVinci** (opcional, para corregir glow/fondo sin re-renderizar): mismo comando con
   `--props='{"capa":"stage"}'`, `"content"` y `"bloom"` (para alfa: `--codec=prores --prores-profile=4444
   --pixel-format=yuva444p10le --image-format=png`). Nombrar `S0N V1 - <nombre> - STAGE (16x9).mov` como en la referencia.

## 6. Reglas

- **UI real siempre.** Capturas/grabaciones del producto o el chat del editor con textos aprobados. Lo generado por IA es
  solo ambiente, objetos y momentos aspiracionales.
- **Una idea por plano**, 2–5 s por beat. Si una escena pasa 8 s, partirla (el chequeo avisa).
- **Un solo glow por escena, un solo color de acento**, una palabra acentuada por frase.
- **El motivo viaja**: aparece en la apertura, vuelve en el beat principal y cierra en el tagline/end card. No en todas las
  escenas: si molesta al texto, se saca de esa escena.
- **SFX**: cada evento visual lleva su sonido (entrada de escena = whoosh, burbuja/tarjeta = UI, check = check, logo y
  tagline = golpe, línea = trazo); el golpe cae en `atS`. Mismas reglas de mezcla que el formato ganador (CLAUDE.md §7–§8).
- **Higgsfield cuesta créditos sin tope automático**: cotizar y pedir OK antes de cada generación; anotar costo y modelo en
  el spec.
- **Marcas ajenas**: el caption dice "spec / no oficial"; nunca se usa para vender en nombre de la marca. Los logos ajenos no
  van en piezas de cliente.

## 7. El reel "detrás de escena" (lo que se publica)

Celular filmando la pantalla con el ad corriendo en Remotion Studio o DaVinci (la timeline cargada vende "esto es pro" sin
explicar nada). Sin cara. 20–27 s = el largo del ad; el audio del reel es el del ad. Texto fijo arriba = la herramienta, no
el resultado (`Claude + Higgsfield = 🤯`, `Le hice un comercial a <marca> en una tarde`); texto fijo abajo = comment-to-DM
(`Comentá "AD" y te paso el prompt`). Ambiente real de fondo (oficina, ventana, noche).
