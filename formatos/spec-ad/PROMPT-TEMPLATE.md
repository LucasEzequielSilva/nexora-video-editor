# Spec ad — plantilla reutilizable (Claude + Higgsfield + Remotion)

Basada en los prompts de los reels "Opus 5.5 + Katana" (Revolut / Spotify / Amazon) que pasó Lucas el 2026-10-16.
Instanciada en: `acelerator/brief/PROMPT.md`. Para otra marca o proyecto: copiar este archivo, completar los corchetes y seguir el orden de trabajo.

---

Armame un spec ad para **[MARCA / PRODUCTO]**.

- Referencia (opcional): [ruta o link], o "ninguna, usar el estilo Amazon/Spotify/Revolut"
- Idea / mensaje: [1–2 líneas, o "proponeme 3 ideas"]
- Guion: [mis líneas, o "escribilo vos"]
- Voz: [la mía grabada / ElevenLabs / "mostrame opciones"]
- Largo: [~20 s] + end card
- Evitar: [ej. "nada de Excel", "no como la última pieza"]

**PASO 1: no construyas todavía.** Escribí el brief completo en `formatos/spec-ad/[marca]/brief/PROMPT.md` (concepto, beat sheet con tiempos, guion, voz, música, plan de SFX, lista de assets, preguntas abiertas) y esperá mi OK.

## Reglas fijas

**Imagen**
- Marca real: logos oficiales, capturas reales del producto, datos verificados. Nada de placeholders dibujados.
- Estilo: keynote tipo Apple, escenario casi negro con un brillo suave a la deriva del color de la marca (un solo acento), UI de vidrio, motion blur real, texto cinético, cámara siempre en movimiento. Sin cartoon, sin emojis, sin mascotas.
- Ritmo: un corte cada ~1.5 s, plano más corto ~1 s, héroes ~2 s.
- Estructura tipo Amazon: **recorrido del cliente por la interfaz** (buscar → carrito → pedido → entrega), no pantallas sueltas.
- Animaciones nuevas en cada anuncio; no reciclar las del anterior.
- 60 fps, 9:16 principal y 16:9.
- Fotos: solo reales y con licencia; pedir permiso antes de bajar nada y registrar fuente y licencia en `assets_in/CREDITS.md`.

**Higgsfield / Katana**
- Primero Remotion. Higgsfield solo para lo que ahí no sale (fondos 3D, cámara, objetos).
- Katana: antes de usarlo, revisar `get_preset_instructions` (catálogo) y que el preset sirva para la tarea. A 2026-10-16 todos los presets son de producto.
- Estimar costo y **pedir OK antes de gastar créditos**. Cuenta del conector: plan Plus con ~0.5 créditos; la cuenta de la API key (`HF_KEY_FILE`) es aparte.

**Voz**
- Estimar créditos antes; 2 tomas en una llamada; deletrear la marca para que se pronuncie bien.
- Guion en frases claras: se tiene que entender cada palabra en el parlante de un celular.
- Re-temporizar la imagen a la voz, no al revés.

**Música y sonido**
- Música original en código, ≥15 dB bajo la voz mientras hay palabras, sin limitador aplastando la voz.
- SFX solo de la biblioteca del proyecto: whoosh en cada corte, golpe en cada aterrizaje, sonido en cada movimiento de producto y en el logo.
- Master -14 LUFS / -1.5 dBTP con `scripts/master.mjs`.

**Cierre**
- End card de ~2 s con la marca de Lucas (@nexorasistem.ar) y el CTA ("Comentá SOFT").

## Orden de trabajo
1. Brief → OK de Lucas
2. Lista de assets → OK antes de copiar/descargar nada
3. Opciones de voz → Lucas elige
4. **Preview v1 (9:16) + contact sheet** → feedback, se repite hasta aprobar
5. Finales 9:16 y 16:9, README

## Nunca
- Empezar a construir o gastar créditos antes de que Lucas diga "dale".
- Inventar cifras o claims: solo los datos que dio Lucas.
- Copiar material de otro repo/cuenta sin su permiso.
