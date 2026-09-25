---
name: formato-ganador
description: Produce a new vertical talking-head reel in Lucas's "formato ganador" (the approved estructura-nexora format) from raw clips and a script, end to end. Use when Lucas asks for a new reel/pieza/video "en el formato ganador", "como el de estructura", "replicá el formato", or passes new clips/guion for this kind of piece. Also use to resume a piece mid-pipeline.
---

# Formato ganador — pieza nueva

The format is documented in full in `formatos/ganador-talking-head/README.md` (anatomy, script → resources grammar, rules
with exact values, pipeline with commands and gates, delivery checklist). This skill is the operating procedure: follow
it in order and open the README section each step points to. Talk to Lucas in rioplatense Spanish, short.

## Before anything
1. Read `CLAUDE.md` §7 (failure rules) and §8 (Lucas's direction) — they override the README when they are newer.
2. Read README §1–§4 once. Get from Lucas (ask only what is missing): the folder with the raw clips, the script or what
   the piece has to say, the `<slug>` (kebab-case), and any resource he already picked (files with "ganador" in the name
   are his favorites).
3. Register the slug in `PIEZAS` of `src/pieza/pieza-root.tsx` (the only code edit per piece).

## Pipeline (README §5, numbered steps 0–8 — every [compuerta] must pass before moving on)
| Paso | Quién | README §5, paso |
|---|---|---|
| 1. Tomas: propose `cortes/<slug>.json` (last complete take or the one approved out loud), borders verified with silencedetect | editor propone → **Lucas aprueba** | 1 |
| 2. `montar.mjs` + `jumpcut.mjs` (`--dry` first) | auto | 2 |
| 3. `transcribir.py` (large-v3 phrase by phrase) + `corregir.mjs` + `trabas.mjs`; read the whole transcript, fix in the piece's `correcciones.json` | auto + editor | 3 |
| 4. **Manual cut**: Lucas cuts takes/stumbles (`npm run recortador -- <slug>` today; his own editor `D:\Dev\intelligent-cut-studio` later). Then `pausas` for the hook black, `recortar.mjs` (`--dry` first) | **Lucas** → auto | 4 |
| 5. `cara.py` + `silueta.py` (redo whenever `video.mp4` changes) | auto | 5 |
| 6. Build `props.json` from `props.template.json` with the grammar (§3): hook, music (`drops-musica.py` + `nivelar-musica.py`), zoom chains, scenes, b-roll/strike/icon, remates, subtitles; echo tail with `cola-reverb.py`; `chequeo-formato.mjs` → **0 ✖** | editor | 6 |
| 7. `npm run verificar -- <slug>` → no ❌; look at `out/verif/<slug>/hoja.jpg` | auto + editor | 7 |
| 8. Show Lucas (Studio) → notes → fix → re-run 6.7 + 7 | **Lucas** | 7.4 |
| 9. Export: render via `turno.mjs`, `master.mjs`, light copy < 30 MB, send it with SendUserFile | auto | 8 |

Everything after Lucas's cut is on you: black + silence after the hook with boom and echo, camera, zooms, scenes,
strikes, SFX, music, verification, export. Do not ask him for things the format already decides.

## Rules that are easy to break (details in README §4 and CLAUDE.md §7)
- Anchor everything to words with an explicit `n` (count it in `words.json`); never raw milliseconds.
- Never invent text, figures, clients or results: all on-screen text comes from the transcript. Mock-up numbers in scenes are illustrative and Lucas must see them.
- The riser is only for the hook. Zooms never get riser-type sounds.
- Big zooms (open 1.0 ↔ portrait ~2.0), chained, never snapping back; the camera calibrates on the face all the time.
- Icons: only premium ones from `PACKS/ICONOS/` or official logos (`LogoApp`), never lucide/emoji. Missing icon → add a row to `assets/catalogo/icon-set-prompt.md` and ask Lucas.
- Strike the concept's icon, not a word already in the subtitle.
- Music: rights first (commercial tracks can be muted by Instagram — say it), leveled and uniform, ~12 dB under the voice, first drop on the return from the black.
- Pick resources from the catalogs in `assets/catalogo/` (never guess what a b-roll or SFX contains).
- Short SFX without `trimBefore`; heavy jobs only through `node scripts/turno.mjs`; after touching audio or the composition, `npm run verificar` (it checks Studio in Lucas's window size) before asking him to reload.

## Lucas's notes
Every note he gives goes to `CLAUDE.md` §8 **at the moment he gives it**, dated, with his words, without being asked
(general rule or per-piece note). If it contradicts an old note, fix the old one. A non-obvious failure goes to §7 with
the failure that caused it. If the note changes the format itself, also update `formatos/ganador-talking-head/README.md`.

## Closing
Send the light copy, note the version in §8, append the day's log to the Obsidian vault
(`C:/Users/Lucas/Documents/.vault/life/02 - Areas/Claude/sessions/YYYY-MM-DD.md`).
