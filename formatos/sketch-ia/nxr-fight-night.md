# NXR Fight Night — producción

Guion: `README.md` §4.A. Lucas (2026-10-14): "esa idea es espectacular, con IA y si es con mi voz, con mi cara, con mi
acento que parezca natural".

## Decisión: la voz se graba, no se clona

Para que suene natural y con acento rioplatense, **Lucas graba sus líneas actuadas** y los demás personajes los graban
amigos (o Cogne). Con ese audio el modelo de video mueve la boca (Seedance 2.0 con `audio_references`). La voz clonada
queda de respaldo: un clon o un TTS pierde el acento, las pausas y la respiración de "recién peleé". El periodista
**no aparece en cámara** (como en la entrevista de Ramiro: solo se ve el micrófono), así que su voz es solo audio.

## 1. Qué grabar (audio)

Celular a 15–20 cm de la boca, en una pieza chica con ropa o cortinas (sin eco), sin música ni ventilador. Cada línea
**3 veces**, con 2 s de silencio antes y después. Nombrar los archivos con el código (ej. `L03-a.m4a`).

**Lucas** (recién termina la pelea: agitado, contento, canchero; no leer, decirlo):

| Código | Línea |
|---|---|
| L01 | "La verdad que vine con un condimento especial…" (pausa larga, serio) "…el hijo de puta usa cuaderno." |
| L02 | "Cuaderno, hermano. Turnos en un cuaderno, pagos en un Excel y el resto en la cabeza." |
| L03 | "Lo estudié tres meses: después de las ocho no contesta un WhatsApp. Sabía que en el segundo round iba a estar pensando en los mensajes que dejó en visto." |
| L04 | "Ni hizo falta. El árbitro le contó hasta diez y él perdió la cuenta en el cuatro. Las cuentas las lleva en la cabeza." |
| L05 | "Cruel es lo que les hace él a sus clientes. Les contesta a los tres días." |
| L06 | "Yo tengo un sistema. Un agente que contesta el WhatsApp, agenda, confirma y recuerda solo." |
| L07 | (mirando el guante, sorprendido) "Mirá: ahí entró un turno. Mientras le pegaba a este." |
| L08 | "Que se recupere. Y si no se recupera, que alguien les avise a sus clientes… porque él no les va a contestar." |
| L09 | (a cámara) "Y si vos todavía usás cuaderno, comentá SISTEMA. Antes de que te toque a vos." |

**Periodista** (fuera de cámara, eufórico, tipo transmisión):

| Código | Línea |
|---|---|
| P01 | "¡Lucas, qué nocaut, hermano! ¿Cuál fue la clave?" |
| P02 | "¿Cuaderno?" |
| P03 | "¿Y la piña final?" |
| P04 | "¿No te parece un poco cruel?" |
| P05 | "¿Y vos cómo hacés?" |
| P06 | "¿Algo para decirle a tu rival?" |

**Rival** (un tipo cualquiera; aturdido, perdido):

| Código | Línea |
|---|---|
| R01 | (apurado, sacando el cuaderno) "Pará, pará… ¿izquierda con zeta o con ese?" |
| R02 | (en el piso, balbuceando) "¿En cuánto íbamos?" |
| R03 | (en la camilla, débil) "Está anotado… en el cuaderno… en la hoja de atrás." |

**Otros**: entrenador del rival E01 "¡Cubrite la izquierda! ¡La izquierda!" (gritando en la cara); árbitro A01 "…tres,
cuatro…"; médico M01 "¿Tiene alguna alergia?".

## 2. Qué fotos mandar (la cara)

- **Lucas: 10–15 fotos** de la cara, con luz de día y sin anteojos: frente, tres cuartos de los dos lados, perfil, serio
  y sonriendo, y alguna de cuerpo entero. Distintos días y ropa ayudan a que el modelo aprenda la cara y no la foto.
- **Rival**: personaje IA (un random genérico, sin parecido a nadie real), salvo que quieran que sea uno de ustedes.

Con las fotos se arma un **Element** de Higgsfield (sirve con varios personajes en el mismo plano y con Seedance 2.0 /
Kling 3.0). Si las caras no salen bien, se entrena un **Soul** (5–20 fotos, ~10 min) para los fotogramas de Lucas solo.

## 3. Planos (9:16)

Primero un fotograma clave por plano (Nano Banana Pro, 2 créditos) y, una vez aprobado, se anima. Los prompts van en
inglés.

| # | Plano | Audio | Modelo | Prompt del fotograma (borrador) |
|---|---|---|---|---|
| 1 | Esquina del rival entre rounds: el entrenador le grita en la cara, él saca un cuadernito del short | E01 + R01 | Seedance 2.0 + audio | Vertical smartphone-style shot inside an MMA cage corner between rounds, a sweaty average-looking fighter on a stool pulls a small spiral school notebook out of his shorts while his coach yells in his face, arena crowd and bright overhead lights, "NXR" logo on the canvas, realistic broadcast look |
| 2 | Piña de Lucas, cámara lenta | — (golpe en edición) | Kling 3.0 | <<<Lucas>>> throws a clean right hook in an MMA cage, slow motion, sweat spray, arena lights, NXR branding on the cage, broadcast camera |
| 3 | El rival cae, el cuaderno vuela por el octágono | — | Kling 3.0 | The opponent collapses face-first in slow motion, a small notebook flies out and its pages scatter across the canvas, crowd on its feet |
| 4 | Árbitro contando, rival en el piso con los ojos en blanco | A01 + R02 | Seedance 2.0 + audio | Low angle on the canvas, knocked-out fighter lying on his back with dazed half-closed eyes, referee kneeling and counting with his fingers, notebook pages around him |
| 5 | Entrevista: Lucas transpirado con el micrófono NXR | L01–L09 (+ P fuera de cámara) | Seedance 2.0 + audio, 3–4 tomas de 10–15 s | <<<Lucas>>> shirtless and sweaty in the octagon right after winning, a hand holds a black microphone with an "NXR" flag into frame, cage and packed arena behind him, warm broadcast lighting, post-fight interview |
| 6 | Camilla: el rival con collar cervical, el médico se inclina | M01 + R03 | Seedance 2.0 + audio | Backstage corridor, the opponent strapped to a stretcher with a neck brace, a medic leaning over him asking a question, fluorescent lights |
| 7 | Cortes de la pelea para tapar la entrevista (como hace Ramiro) | — | Kling 3.0, 2 tomas | Wide broadcast shots of <<<Lucas>>> dominating the fight, clinch against the cage, crowd reactions |

La notificación "Turno confirmado" en el guante se hace en Remotion (overlay), no con IA: se lee mejor y es gratis.

## 4. Presupuesto (créditos de Higgsfield, consultados el 2026-10-14)

| Qué | Costo unitario | Cantidad (con reintentos) | Total |
|---|---|---|---|
| Fotograma Nano Banana Pro 2k | 2 | ~25 | ~50 |
| Seedance 2.0 720p 8 s, `fast` / `std` | 20 / 36 | ~14 | ~280–500 |
| Kling 3.0 pro 5 s | 12.5 | ~10 | ~125 |
| **Total estimado** | | | **~450–700** |

Seedance 2.5 `omni_reference` sale mucho más caro (56 créditos por 8 s en 720p, 128 en 1080p): solo si 2.0 no
sincroniza bien. **Saldo al 2026-10-14: 0.5 créditos.**

**Antes de gastar todo**, una prueba de un plano: el 5 con L01, para ver si la boca sigue bien el audio rioplatense.

## 5. Por la API (lo que se usa, 2026-10-14)

Lucas no tiene créditos en la app: cargó plata en la **API** (se cobra en USD, ver el consumo en la consola). Endpoint:
`bytedance/seedance-2.0/reference-to-video` con `scripts/higgsfield.py` — `image_urls` 1–9 fotos de Lucas (no hay
Elements ni Soul acá: la cara sale de las fotos de referencia), `audio_urls` 1–3 audios (2–15 s c/u, 15 s en total; el
audio solo no alcanza, hace falta al menos una imagen), `duration` 4–15, `aspect_ratio` `9:16`, `resolution` `720p`.
La doc no dice que haga lip sync: es justo lo que mide la prueba.

La credencial está en `C:\Users\Lucas\.hf-key` (fuera del repo). La API probada el 2026-10-15: tiene Seedance 2.0/2.5
(reference-to-video, image-to-video, video-edit) y Kling 3.0 (pro/std/turbo), pero **no Nano Banana Pro**: los fotogramas
de la app no se replican; reference-to-video toma las fotos directo.

```
HF_KEY_FILE="C:/Users/Lucas/.hf-key" python scripts/higgsfield.py bytedance/seedance-2.0/reference-to-video cuerpo.json out/ia/nxr-p5-l01.mp4 \
  --subir "image_urls[]=<foto1>" ... --subir "audio_urls[]=<L01.m4a>"
```
