---
name: spec-ad
description: Direct and produce a ~20 s product commercial (16:9 + 9:16) in the spec-ad format — dark stage, brand glow, real UI floating in 3D, a light-line motif, kinetic tagline, end card — with Claude as creative director, Remotion for UI/motion and Higgsfield (Soul Cinema / Seedance / Katana) only for ambient plates. Use when Cogne or Lucas asks for a "spec ad", "comercial", "ad de producto", "estilo Revolut/Spotify/Amazon", "como los de Katana", a commercial for a client (Raquel, Maderi…) or a prospect, or passes UI screenshots and a brand to turn into an ad.
---

# Spec ad — commercial in the Opus + Katana language

Full format: `formatos/spec-ad/README.md` (roles §1, structure §2, observed references §3, `spec.json` §4, pipeline §5,
rules §6, the behind-the-scenes reel §7). Engine: `src/spec/` (types in `tipos.ts`). Working demo:
`public/spec/demo-agente-turnos/spec.json`. Talk in rioplatense Spanish, short.

## 1. Brief (ask only what is missing)
Brand + product, the 3 features to show, audience, brand color, **real UI**: screenshots / screen recordings
(`public/spec/<slug>/ui/`) or the conversation for the WhatsApp chat. Whether it is `spec` (third-party brand, portfolio)
or `cliente` (needs the client's OK; no real patient/customer data). Slug in kebab-case.

## 2. Direction (you are the creative director — decide, don't offer menus)
1. Concept in one sentence + **the motif** that travels (appears in the opening, returns in the main beat, closes on the
   tagline/end card). Write how it evolves scene by scene.
2. VO script with the formula (README §2): sensory promise → zero friction → concrete triad → differentiator → tagline +
   brand. One line = one scene, 2–3 s each, lanes A/B alternating.
3. Scenes S01…Sn (contiguous `desdeS`/`hastaS`, one idea per shot, 2–5 s beats), choosing types from README §4; mark
   `origen` honestly (`codigo` / `higgsfield` / `katana`).
4. SFX cue sheet: every visual event gets its sound from `SFX_FILES` (whoosh on scene entry, `burbuja`/`tarjeta` for UI,
   `check-b` on checks, `remate`/`cta-cierre` on logo and tagline, `trazo` on the line); `atS` = where the hit lands.
5. Plate prompts (English, environment only, "no people, no text") for every `plate` scene, with model.
6. Write `public/spec/<slug>/spec.json`, add the slug to `SPECS` in `src/spec/spec-root.tsx`.

## 3. Gates
| Step | Command | Gate |
|---|---|---|
| Check + cue sheet | `npm run spec -- <slug>` | 0 ✖; read `out/spec/<slug>/cue-sheet.md` |
| Types | `npx tsc --noEmit` | clean |
| Style frames | `npx remotion still src/index.ts spec-<slug> out/verif/spec/f<N>.png --frame=<N>` (opening, main beat, tagline; also `-9x16`) | look at them; the line never crosses text; nothing clipped in 9:16 |
| Draft | `npx remotion render src/index.ts spec-<slug> out/<slug>-draft.mp4 --scale=0.5` (+ `-9x16`) + contact sheet (`ffmpeg … fps=2,scale=480:-1,tile=4x6`) | read the whole sheet before showing anyone |
| Final | render via `node scripts/turno.mjs`, then `node scripts/master.mjs` | −14 LUFS |

## 4. Higgsfield (MCP `higgs`) — money rules
- Plates only: environments, objects, aspirational moments. **Never generate UI.**
- Still with `soul_cinematic` (check every image for people: it adds them despite the prompt) → video with `seedance_2_5`
  for the scene length + 0.5 s.
- **Before every paid job: quote with `get_cost: true`, show the cost, wait for an explicit OK.** Check `balance` first.
  Write model and cost into the spec next to the prompt.
- Katana only with a reference we have rights to (our own pieces, Katana catalog presets). Never upload Bosso's ads or a
  third-party brand's ad as reference.
- Save to `public/spec/<slug>/plates/`, set `archivo` in the spec, re-run the gates.

## 5. Notes
Lucas's or Cogne's notes on a spec ad go to `CLAUDE.md` §8 at the moment they are given (dated, their words). If a note
changes the format, also update `formatos/spec-ad/README.md`. A non-obvious failure goes to §7 with its cause.
