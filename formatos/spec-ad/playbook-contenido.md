# Playbook: spec ads con Claude (director creativo) + Higgsfield/Katana

> Complemento de README.md (formato técnico): estrategia de contenido y prompt maestro para Nexora.
> Destilado de los 3 videos de referencia (Revolut, Spotify, Amazon — Opus 5.5 + Katana).
> Analizados cuadro por cuadro + audio transcripto + lectura de las timelines de DaVinci Resolve que se ven en pantalla.
> Lo marcado como **[inferido]** es deducción, no algo visible.

---

## 1. Hay DOS piezas en cada video (no confundir)

| Pieza | Qué es | Para qué sirve |
|---|---|---|
| **A. El spec ad** | Comercial de ~20 s, 16:9 + 9:16, de una marca famosa, hecho con IA | Portfolio: demuestra nivel |
| **B. El reel "detrás de escena"** | Celular filmando la pantalla con DaVinci reproduciendo el ad | Es lo que se viraliza y trae leads |

La pieza B es la que nos importa para contenido de Nexora / marca personal. La A es la prueba.

---

## 2. Pieza B — el formato del reel (copiable ya, con tu setup)

- **Plano:** celular en mano o trípode, filmando la laptop/monitor con la timeline de DaVinci y el ad reproduciéndose. Sin cara. El ambiente suma (ventana con ciudad, noche con luces, escritorio prolijo) → "esto lo hizo una persona real en su oficina".
- **Duración:** 21–27 s = el largo del ad. El audio del reel ES el audio del ad (voz + música + SFX). Sin música extra.
- **Texto arriba (hook, fijo todo el video):** `Claude Opus 5.5 🤯🔥` o logos `[Opus] + [Katana] = 🤯`. Nombra la herramienta, no el resultado: la gente quiere saber *cómo*.
- **Texto abajo (CTA, fijo todo el video):** `Prompt below ⬇️` o `Comentá "REVOLUT" y te lo paso`. → comment-to-DM = lead magnet + empuje del algoritmo por comentarios.
- **Lo que vende:** la timeline cargada (muchas capas de colores, SFX con nombres) comunica "esto es pro" sin explicar nada.

### Versión Nexora
- Arriba: `Claude + Higgsfield = 🤯` / `Le hice un comercial a [marca] en 1 tarde`
- Abajo: `Comentá "AD" y te paso el prompt`
- Rotar marcas que la audiencia argentina conoce (Mercado Pago, Ualá, Rappi, Quilmes) **y** clientes reales (Raquel, Maderi).

---

## 3. Pieza A — anatomía del spec ad

### 3.1 Estructura (igual en los 3)

```
0–2 s    APERTURA      logo o elemento de marca aparece (luz, punto, partícula)
2–9 s    PROMESA       VO: frase grande + "one tap" + tríada concreta
9–17 s   BEATS         3–5 momentos de producto, UNA idea por plano (1 línea de VO = 1 escena)
17–20 s  TAGLINE       tipografía cinética, 2–4 palabras ("Everything you love." / "From A to Z.")
20–24 s  END CARD      logo con glow → se apaga a una línea/punto → firma chica
```

### 3.2 Guiones reales (transcriptos)

- **Revolut:** "Your whole money life in one app. Spend, save, and travel with Revolut. And now you can just ask. / See where your money goes. / Freeze a card with your approval. / Get an eSIM for your trip. / Revolut. Now with AIR."
- **Spotify:** "Every song you love, already in your pocket. One tap and you're in. Chill mixes, late-night drives, the new drop everyone's talking about. / Listen to your favorite artists with a single click. / Spotify."
- **Amazon:** "Anything you can think of is one search away. One tap, and it's already on its way, right to your door. / Everything you love. From A to Z. / Amazon."

**Fórmula del copy:**
1. Promesa sensorial y grande ("Every song you love…", "Anything you can think of…")
2. Fricción cero ("One tap", "one search away", "just ask")
3. Tríada concreta (spend/save/travel — chill/late-night/new drop)
4. Feature nueva o diferencial (opcional: "And now you can just ask")
5. Tagline corto + nombre de marca solo

Frases de 2–3 s. Nada de adjetivos vacíos. Verbos.

### 3.3 Lenguaje visual

- **Escenario oscuro + UN glow del color de marca** detrás del héroe (verde Spotify, azul Revolut, ámbar Amazon). Radial, suave, con bloom.
- **UI real del producto, limpia, flotando** (teléfono 3D que gira, tarjeta metálica, cards de UI sueltas). Pantallas reales: saldo, chat con IA, anillo de gastos, botón "Confirm", check "Approved", carrito "$129 / Add to cart / Order placed".
- **Un motivo que cose todo** (lo mejor de los 3): en Amazon, la línea de luz de la sonrisa aparece al inicio → se convierte en la ruta del delivery sobre un mapa 3D de ciudad → termina subrayando "From A to Z." → cierra como la línea final. **Un objeto que viaja por todas las escenas = sensación de comercial caro.**
- **Transiciones:** desenfoque de profundidad (blur-in/out), whip con whoosh, el elemento de una escena se transforma en el de la siguiente (pill → punto → logo).
- **Tipografía cinética:** palabra por palabra, sans limpia (SF Pro / Inter), blanca, centrada, a veces con una palabra en color de marca ("Now with **AIR.**").
- **Cámara:** push-ins lentos, órbitas cortas al objeto. Nunca estática.
- **Una foto/escena "aspiracional"** en el medio (Santorini en Revolut, escena violeta en Spotify) para respirar entre UIs.

### 3.4 Sonido (lo que más separa amateur de pro)

Visto en las timelines:
- **VO en 2 carriles alternados** (Spotify: `VO L1 (lane A)`, `VO L2 (lane B)`…) — una línea por clip, fácil de re-timear.
- **Música en stems** (`Music 1 - Drums.wav`, `Music 2 - Bass.wav`… Amazon tiene ~7 stems) → se puede cortar/silenciar instrumentos en cada beat.
- **SFX por categorías:** Whooshes, UI & foley, Hits & impacts, Glitch & light.
- **SFX nombrados con su timecode:** `SFX 020 - 4.237 soft_wipe.wav`, `SFX 033 - 5.633 whoosh_deep.wav` → **Claude escribió una cue sheet con el segundo exacto de cada sonido** y el archivo ya dice dónde va. [inferido]

### 3.5 Pipeline de producción (lo que se lee en las timelines)

- **Cada escena exportada en 4 capas** (Revolut): `S03 V1 - Spend - STAGE`, `- CONTENT`, `- BLOOM`, `- BAKED (16x9).mov`
  - STAGE = fondo/escenario · CONTENT = UI/héroe · BLOOM = pasada de glow · BAKED = todo junto
  - Permite corregir el glow o el fondo sin re-generar. [inferido: renderizadas por código que escribió Claude — Remotion/Three.js/HTML — no por IA generativa; la UI es demasiado exacta para ser generada]
- **Escenas numeradas con nombre:** S01 Logo, S02 iPhone tumbles, S03 Island, S04 Showcase, S05 New releases, S06 Listen kinetic type, S07 With a single click, S08 Pill, S09 Lock, S10 End card.
- **Bins de DaVinci:** `01 Scenes 16x9` · `02 Scenes 9x16` · `Graphics (Logos, App icons, Photos)` · `03 Voice-over` · `04 Music stems` · `05 SFX` · `07 Reference`.
- **Montaje final en DaVinci Resolve 21.**

---

## 4. Qué hace cada herramienta (realista)

| Rol | Herramienta | Notas |
|---|---|---|
| Director creativo / guionista / productor | **Claude** | concepto, motivo, VO, lista de escenas, cue sheet de SFX, prompts, código de animación |
| UI y gráficos animados | **Código** (Remotion / HTML+GSAP / Three.js) escrito por Claude | UI **real** del producto, nunca generada por IA |
| Planos de ambiente / 3D / "aspiracionales" | **Higgsfield** (Soul Cinema para fotos, Seedance para video) | mapa de ciudad, living, Santorini, objetos 3D |
| Remix de un video de referencia | **Katana** | Devuelve un MP4 que copia ritmo/estilo de una referencia con tu sujeto. **Ojo: Higgsfield exige derechos sobre la referencia** → no se pueden subir los ads de Bosso como referencia. Usar referencias propias o del catálogo de presets Katana. |
| Voz | ElevenLabs / voz propia | 2 carriles alternados |
| Música + SFX | stock con stems + librería CC0 | nunca sintetizados |
| Montaje | DaVinci Resolve (gratis) | |

**Costos:** cada generación de Higgsfield gasta créditos sin tope automático → Claude cotiza primero (`get_cost`) y se aprueba antes de generar.

---

## 5. El flujo, paso a paso

1. **Brief (vos → Claude):** marca, producto, 3 features, público, duración, color de marca, capturas de la UI real.
2. **Claude entrega el paquete de dirección:**
   - concepto en 1 frase + **el motivo que viaja** por todas las escenas
   - guion VO (fórmula 3.2), una línea por escena, con duración
   - lista de escenas S01–S10: qué se ve, cámara, transición de entrada/salida, capas STAGE/CONTENT/BLOOM
   - cue sheet de SFX con timecodes y categoría
   - mapa de música (qué stem entra/sale en cada beat)
   - prompts de Higgsfield solo para los planos que no son UI
3. **Style frames:** 2–3 cuadros fijos para aprobar el look ANTES de animar (más barato que re-animar).
4. **Producción:** UI animada por código; planos de ambiente en Higgsfield; VO.
5. **Montaje** en DaVinci con los bins de 3.5. Exportar 16:9 + 9:16.
6. **Grabar la pieza B** (reel detrás de escena) con el ad reproduciéndose en la timeline.

---

## 6. Prompt maestro (pegar en Claude)

```
Sos director creativo de comerciales de producto tipo Apple/Revolut/Spotify.
Vamos a hacer un spec ad de ~20 s (16:9 master + 9:16) para: [MARCA / PRODUCTO].

Contexto:
- Qué hace el producto: [...]
- 3 features a mostrar: [1] [2] [3]
- Público: [...]
- Color de marca / tipografía: [...]
- Adjunto capturas reales de la UI (usar SOLO estas pantallas, no inventar UI).

Reglas de estilo:
- Escenario oscuro, un glow radial del color de marca detrás del héroe, bloom suave.
- Un único motivo visual que viaje por todas las escenas y cierre en el end card.
- Una idea por plano. Push-ins lentos, transiciones por desenfoque o transformación de un elemento en otro.
- Tipografía cinética corta (2–4 palabras) para el tagline.
- Estructura: apertura con logo (0–2 s) → promesa (2–9) → 3–5 beats de producto (9–17) → tagline (17–20) → end card (20–24).

Entregame, en este orden:
1. Concepto en una frase + el motivo que viaja y cómo evoluciona escena a escena.
2. Guion de VO: promesa sensorial → fricción cero ("un toque") → tríada concreta → diferencial → tagline + marca. Una línea por escena, con segundos. En español rioplatense neutro.
3. Tabla de escenas S01…Sn: tiempo in/out, qué se ve, cámara, transición, capas (STAGE / CONTENT / BLOOM), si es código o Higgsfield.
4. Cue sheet de SFX: timecode exacto (s.ms), nombre de archivo tipo "SFX 012 - 4.237 soft_wipe.wav", categoría (whoosh / UI & foley / hit / glitch & light).
5. Mapa de música por stems: qué stem entra/sale en cada beat.
6. Prompts de Higgsfield SOLO para planos que no son UI (ambientes, objetos 3D), sin personas salvo que haga falta.
7. Lista de style frames a aprobar antes de animar.
```

---

## 7. Cómo lo usamos en Nexora (propuesta)

1. **Contenido:** 1 spec ad por semana de una marca conocida en Argentina + su reel detrás de escena. Formato probado, cero cara, con tu setup.
2. **Venta:** antes de la reunión con **Maderi**, llevarles un spec ad de 20 s de su clínica (turnos por WhatsApp con el agente → recordatorio → paciente atendido). Llegar con el comercial hecho cambia la conversación.
3. **Caso Raquel:** el mismo formato para mostrar el agente: chat de WhatsApp real → turno agendado → "Tu consultorio atiende solo. 24/7."
4. **Servicio vendible:** "Comercial de producto con IA" como upsell para clientes que ya tienen web/agente.
5. **PropMatch:** el brief v2 de Lucas ya aplica esto (línea de luz que dibuja la casa y el corazón = el recurso de Amazon).

### Cuidados
- Spec ads de marcas ajenas: aclarar "spec / no oficial" en el caption. No usar para vender en nombre de la marca.
- Para clientes: UI siempre real, nunca inventada.
- Katana: solo con referencias que tengamos derecho a usar.
