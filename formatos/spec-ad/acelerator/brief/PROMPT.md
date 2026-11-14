# Spec ad — Acelerator (Sistema Club) · "Todo en un solo lugar"

Estado: **BRIEF, sin construir, sin gastar créditos.** Espera OK de Lucas (2026-10-16).
Referencias: los 3 reels de "Opus 5.5 + Katana" (Revolut, Spotify, Amazon). El de **Amazon** es el modelo de estructura.

## Concepto
Acelerator (la app de Mati Randazzo, "Sistema Club") es el héroe. Recorrido del cliente en la interfaz real, como el de Amazon
(buscar → carrito → pedido → entrega): **vender → cobrar → ver el negocio crecer**. Cierra con el CTA de Lucas.
Mensaje: *"Un Excel de 15 hojas y tres sistemas. Hoy, todo en un solo lugar."* El spec ad es la prueba; lo que se vende
es el servicio de Lucas (convertir tu método en un software).

## Estilo
- Keynote de producto estilo Apple. Escenario casi negro con un brillo suave a la deriva en **azul Acelerator** (un solo color de acento).
- Una sola tipografía sans (Inter, como la app). UI de vidrio, fotorrealista. Motion blur real en cada movimiento, cámara siempre en movimiento.
- Sin dibujos, sin emojis, sin mascotas. Ritmo: un corte cada ~1.5 s, el plano más corto ~1 s, los héroes ~2 s.
- Logo oficial de Acelerator en blanco, sin brillo ni efectos sobre él (`D:\Dev\randazzo\public\brand\`).
- 60 fps, **9:16 (1080x1920) principal** + 16:9. Animaciones nuevas, no reciclar las de las otras piezas.

## Guion (voz en off, español rioplatense, natural)
1. "Un Excel de quince hojas. Tres sistemas distintos."
2. "Hoy, todo tu negocio, en un solo lugar."
3. "Vendé." · "Cobrá." · "Mirá cómo crece." (pausa corta después de cada verbo)
4. "Casi trescientas personas ya lo usan."
5. "Acelerator." … "Hecho para tu marca."
6. (end card) "Comentá SOFT."

Cifras: solo las que Lucas ya dijo en el video (casi 300 personas, más de 34.000 productos, casi 3.000 ventas). No inventar otras.
Pronunciación: escribir "Acelerator" como "Aselerator" si la voz lo lee mal.

## Beat sheet (~20 s + 2 s de end card)
| t (s) | Imagen / sonido |
|---|---|
| 0.0–1.1 | HOOK: un Excel gigante (celdas, pestañas "Hoja 1…15") cae en 3D y se estrella al centro (punch de cámara, micro-temblor, flare). La cámara lo atraviesa. VO 1a. |
| 1.1–2.4 | Tres ventanas de sistemas distintos se apilan y chocan. VO 1b ("tres sistemas"). |
| 2.4–3.6 | Todo se disuelve en un brillo azul; sale el logo Acelerator con chispas. VO 2. |
| 3.6–5.6 | Celular 3D con la pantalla real **Punto de Venta**; el carrito se arma. "Vendé." |
| 5.6–7.2 | Tarjetas flotando alrededor del celular: Ventas, Egresos, Presupuestos, Listas de precios (capturas reales). |
| 7.2–9.0 | HERO: **"Venta registrada · $1.000"** pasa a primer plano, el tilde se dibuja, anillo de luz. "Cobrá." |
| 9.0–11.0 | Pantalla **Ventas** (KPIs): los números suben (Total, Cobrado, Contribución marginal). "Mirá cómo crece." |
| 11.0–13.5 | Panel con cifras que cuentan: **300 personas · 34.000 productos · 3.000 ventas**. VO 4. |
| 13.5–15.5 | Cámara 3D recorre las listas de precios y el mix de ventas (movimiento lateral con blur). |
| 15.5–18.0 | Texto grande: "De un Excel de 15 hojas…" → "…a un solo lugar." |
| 18.0–20.0 | DROP en el tiempo fuerte: logo Acelerator blanco, centrado, sostenido. VO 5. |
| 20.0–22.0 | End card: marca de Lucas (**@nexorasistem.ar**), "Comentá **SOFT**" ("SOFT" en azul). Cierre con brillo que se apaga. |

## Música y sonido
- Música original en código, ~112 BPM, minimal electrónica; el groove arranca con el golpe del hook; riser hacia el drop del logo; acorde amplio al final.
  **Siempre ≥15 dB bajo la voz.**
- SFX denso y limpio: whoosh en cada corte, golpe en cada aterrizaje, clics de UI, tick de escritura, bajo grave en el drop. Biblioteca de SFX del proyecto (`src/reserva`/`public/sfx`).
- Master -14 LUFS / -1.5 dBTP con `scripts/master.mjs`.

## Assets (para tu OK antes de bajar/copiar nada)
- Capturas reales de Acelerator, cuenta de pruebas: `D:\Dev\randazzo\qa\out\20261014-151730\` (pos-vendido, ventas-mix, precios, compra-formulario). **Falta tu permiso para copiarlas al proyecto.** Se lee "QA1792001868" y "qa-ia": mejor sacar capturas nuevas con productos de nombre real si querés.
- Logo oficial: `D:\Dev\randazzo\public\brand\`.
- Música y SFX: de la biblioteca del proyecto, sin descargas.
- Higgsfield: **$0 en esta versión.** Solo si el 3D del hook o el fondo no salen en Remotion (te aviso el costo antes).

## Preguntas abiertas (necesito tu OK)
1. ¿El héroe es Acelerator (app de Mati) y el CTA tu servicio, como arriba? ¿O querés que el anuncio sea de otra cosa?
2. **Voz**: ¿la tuya grabada, o ElevenLabs? (Si es ElevenLabs, te estimo los créditos antes.)
3. ¿Largo ~20 s + end card está bien, o más corto?
4. ¿Capturas actuales (con "QA…") o nuevas con nombres reales?
5. ¿Algo que evitar? (ej. "nada de Excel en pantalla", "no como la última pieza")

## Orden de trabajo
Brief → tu OK → assets → tu OK → voz → **preview v1 9:16 + contact sheet** → tu feedback (se repite) → finales 9:16 y 16:9, README.
No gasto créditos ni empiezo a construir hasta que digas "dale".
