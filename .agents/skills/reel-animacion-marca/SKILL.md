---
name: reel-animacion-marca
description: Arma un reel vertical "hecho por Opus/Codex" — una animación de marca en 16:9 (Remotion) mostrada en una laptop, con etiqueta arriba ("Hecho por Opus 5.5 + mi skill"), cierre "Comentá SKILL" y texto del post. Usar cuando se pida un reel/video de animación de marca, motion de producto, "como los de rayyan.pe / xzecreative", un aviso o comercial de una app/marca hecho con IA, o un reel para regalar una skill por comentario. Funciona en este repo y en cualquier proyecto Remotion.
---

# Reel de animación de marca (formato "hecho con Opus")

Receta medida sobre 11 reels de `rayyan.pe` (21–50 s, 9:16). Se hacen tres capas:

1. **Animación de marca = la pieza final.** 1920x1080 **con música y efectos**, 6–10 beats, una idea por beat, hecha en Remotion. Es donde va el esfuerzo: guion, ritmo, movimiento y sonido.
2. **Empaque** (secundario): la animación vive en la pantalla de una laptop, vertical 1080x1920, con una **etiqueta** arriba que dice con qué se hizo. Lo ideal es filmar una laptop real; el mockup de Remotion es solo respaldo y **no se pule** salvo que se pida.
3. **Cierre** de ~4.5 s en silencio: "Comentá **SKILL** y te lo paso". El post repite la palabra clave.

Hablá en español rioplatense, corto. Todo el texto en pantalla es verdadero o está marcado como concepto.

## Antes de empezar
- Leé `references/anatomia.md` (qué se midió) y `references/guion-y-beats.md` (cómo se escribe). El resto se abre cuando el paso lo pide.
- **En este repo** (`D:\Dev\videos\video-editor`) leé además `AGENTS.md` §7–§8 (mandan sobre esta skill si son más nuevos) y `references/en-este-repo.md`.
- Pedí solo lo que falte: **marca** (nombre, qué hace, para quién), **color** (o dejá que lo elija la marca), **ángulo** (el dolor que resuelve), **duración** (20–40 s) y **palabra clave** del cierre. Si no hay respuesta: duración 30 s, palabra `SKILL`.
- **Marca real ajena** (Yape, Canva, Duolingo…): se puede hacer como *concepto*, pero no como aviso oficial. Poné "Concepto, no oficial" en el post y no inventes cifras (usá solo números públicos que puedas citar). Para clientes de Lucas o productos propios: material real.

## Pasos
| # | Qué | Cómo |
|---|---|---|
| 1 | Instalar el kit (una vez por proyecto) | `node .Codex/skills/reel-animacion-marca/template/instalar.mjs <proyecto>`; registrar `<ReelMarcaCompositions />` en el Root. En este repo ya está. |
| 2 | Escribir el **brief** | Copiar `src/reel-marca/briefs/ejemplo-turnix.ts` a `briefs/<slug>.ts` y sumarlo a `BRIEFS` en `reel-marca-root.tsx`. Guion con la fórmula de `references/guion-y-beats.md`. |
| 3 | Ver y afinar **la animación** | Studio (`npm start`): `<slug>-16x9` (la pieza), `<slug>-reel`, `<slug>-cierre`. Para revisar: renderizar el MP4 una vez y sacar cuadros con ffmpeg (más rápido que un still por beat). Mirar tamaño de texto, cortes, solapes y que nada quede quieto. |
| 4 | Sonido | `references/audio.md`: música con `desdeS` en un tiempo fuerte, duraciones en `compas(n, bpm)` y `audio.auto` para que los efectos salgan sincronizados solos. |
| 5 | **Empaque** (solo si se pide) | Ver `references/empaque-y-post.md`. Real = renderizar `<slug>-16x9`, reproducirlo en una laptop y filmarlo; sumar etiqueta y `<slug>-cierre`. Mockup = `<slug>-reel`. |
| 6 | Texto del post | `references/empaque-y-post.md` §Post: gancho, palabra clave, hashtags. |
| 7 | Verificar y entregar | `references/checklist.md`. Render final, nivel −14 LUFS y pico ≤ −1.5 dBTP. |

## Reglas que no se rompen
- **Un beat = una idea.** Máximo 7 palabras por beat; la palabra clave va entre `[corchetes]` (serif itálica con degradé) y la frase a subrayar entre `{llaves}` (subrayado dibujado a mano).
- **Nada inventado**: cifras, clientes y resultados salen del pedido o son ficticios y marcados. Un número del contador es ilustrativo salvo que el usuario lo confirme.
- **Un solo color de acento** por marca; los beats pueden alternar fondo `base` / `acento` / `oscuro`, nunca más de tres seguidos iguales.
- **Tiene que entenderse sin sonido**: la etiqueta de arriba y el texto de la animación cuentan la historia.
- El **cierre** es siempre: etiqueta → animación completa → cierre en silencio. No cortes el logo final antes de 3 s.
- Íconos: logos oficiales o formas propias, nunca emojis como ícono de producto.
- No digas que el reel es "100 % hecho por Opus" si no lo es: la etiqueta describe lo que se hizo de verdad.

## Cuando falta algo
Si un beat necesita algo que el kit no tiene (mascota 3D, mapa, gráfico), agregá un tipo nuevo en `tema.ts` (`Beat`) y su vista en `animacion.tsx`; no metas JSX suelto en el brief. Si no sabés cómo funciona una librería (three, etc.), decilo y proponé la alternativa simple.
