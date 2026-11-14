# Product video — PhoneOS (os-agent-trendspot) · "Contestá primero. Vendé con stock real."

Estado: **BRIEF, sin construir, sin gastar créditos.** Espera OK de Lucas (2026-10-16).
Producto: repo `LucasEzequielSilva/os-agent-trendspot` (privado). Plantilla: `../../PROMPT-TEMPLATE.md`. Estructura de referencia: reel de **Amazon** (recorrido del cliente por la interfaz).
Reemplaza como pieza principal al brief de `../acelerator/` (queda como alternativa).

## El producto (de la propuesta comercial del repo, 2026-10-02)
Plataforma integral white-label para minoristas de iPhone, 3 módulos:
1. **Agente de WhatsApp 24/7**: español rioplatense, cotizador determinístico de Plan Canje (el LLM nunca calcula plata), nunca inventa precios ni stock, reserva la unidad al agendar el turno.
2. **Panel CRM y agenda**: tomar el chat con un clic, pipeline Consulta → Cotizado → Visita agendada → En local → Cerrado, turnos con cupos, recordatorio y liberación de stock si el cliente desiste.
3. **Stock por IMEI y caja bimonetaria** (USD/ARS, dólar blue, recargo por transferencia).

Dolor que resuelve: el cliente le compra al primero que contesta (15 min de demora = venta perdida), canjes cotizados a ojo, promesas sin stock real.
Marca visible: **TrendSpot** (logo blanco, negro `#000`, acento verde `#22c55e`, Space Grotesk + Inter, paneles de vidrio) y "Nexora" como proveedor (logo blanco).
Nombre comercial del producto: la propuesta dice **"PhoneOS"** / "Nexora para celulares" → **confirmar cuál va en el video**.

## Concepto
Hero: **el agente de WhatsApp + el panel**. Recorrido igual al de Amazon (buscar → carrito → pedido → entrega), pero el de un cliente de iPhone:
**consulta → precio y stock reales → cotiza el canje → turno reservado → vendido y entregado**. Todo contra stock real.
Mensaje: *"El que contesta primero, vende. Y vende lo que realmente tiene."*

## Diferencial que dijo Lucas (2026-10-16) — **a confirmar antes de ponerlo en pantalla**
*"El asistente IA va desplazando la fase del lead por etapas; esas etapas nutren la campaña de Meta, que te trae mejores leads como dueño del negocio, porque entiende qué lead vino de pauta y cuál te pagó."*
- Lo que **sí** está en el repo: etapas del lead movidas por hechos del sistema (nuevo → en charla → calificado → turno agendado → … → vendido) y el campo `origen` del lead (web, ficha, y de qué anuncio vino).
- Lo que **no encontré**: el envío de esas etapas a Meta (Conversions API / eventos de conversión). `F01` dice que la atribución/ROI de anuncios queda **fuera de alcance**; la propuesta comercial tampoco lo menciona.
- **No voy a decir en el video algo que el producto no hace.** Opciones: (a) ya existe y me pasás dónde (o lo construimos antes), (b) va como "próximamente", (c) lo mostramos como el cierre del recorrido solo si está construido.
- Si se confirma, el beat nuevo es **"La pauta aprende"**: la tarjeta del lead sube de etapa en el kanban y un pulso verde viaja al panel de Meta; las etapas se vuelven eventos (Consulta → Cotizado → Visita → **Pagó**) y el costo por lead real baja. Texto: *"Meta aprende de tus ventas, no de tus clics."* (frase a validar; **sin cifras** de mejora).
- Cambia el guion: el 7 pasa a "Cada etapa le enseña a Meta quién compra de verdad." y el CTA se corre al 8.

## Estilo
- Keynote de producto estilo Apple. Escenario **negro puro** con un brillo suave a la deriva en **verde TrendSpot** (único acento).
- Paneles de vidrio como los del panel (`rgba(255,255,255,0.03)`, blur, borde fino), tarjetas redondeadas, chips redondos.
- Space Grotesk para títulos, Inter para texto. UI fotorrealista, motion blur real, cámara siempre en movimiento.
- Sin dibujos, sin emojis, sin mascotas. Un corte cada ~1.5 s; plano más corto ~1 s; héroes ~2 s.
- Logo de TrendSpot en blanco, sin brillo ni efectos. 60 fps, **9:16 principal** + 16:9.

## Guion (voz en off, rioplatense, natural)
1. "Treinta consultas por día. Quince minutos para contestar."
2. "Y el cliente ya le compró al otro."
3. "Ahora, contesta en segundos." (pausa)
4. "Precio y stock, siempre reales."
5. "Cotiza tu usado al instante."
6. "Reserva el equipo y agenda la visita."
7. "Vos solo atendés al que entra por la puerta."
8. "[Nombre del producto]." … "Para minoristas de iPhone." (end card: CTA)

Solo claims que están en la propuesta del repo. Cifras: **"30 a 60 consultas diarias"** y **"demora de 15 minutos"** vienen de ahí; usar tal cual. **No inventar** conversiones, % de aumento ni nombres de clientes.

## Beat sheet (~20 s + 2 s de end card)
| t (s) | Imagen / sonido |
|---|---|
| 0.0–1.1 | HOOK: una ráfaga de notificaciones de WhatsApp cae en 3D y se estrella al centro (punch de cámara, micro-temblor, flare verde). La cámara las atraviesa. VO 1a. |
| 1.1–2.6 | Un reloj marca 15:00 min mientras un mensaje queda sin contestar; en el fondo, otro local contesta. VO 1b + 2. |
| 2.6–3.8 | Todo se apaga a negro; nace el brillo verde y el logo TrendSpot con chispas. VO 3. |
| 3.8–5.8 | Celular 3D con el chat real: el cliente escribe "¿Tenés iPhone 15?"; el agente responde con precio y stock. "Precio y stock, siempre reales." |
| 5.8–7.6 | Tarjetas flotando alrededor del celular: modelo, batería, color, precio en USD/ARS (datos de la demo). |
| 7.6–9.6 | HERO: **cotización del canje**: el usado entra, el valor de toma y la diferencia se calculan y cuentan hacia arriba. "Cotiza tu usado al instante." |
| 9.6–11.6 | Agenda: el turno se reserva y la unidad queda **apartada** (el contador de stock baja en vivo). "Reserva el equipo…" |
| 11.6–13.6 | Panel CRM: el kanban Consulta → Cotizado → Visita → En local → Cerrado; la tarjeta viaja de columna. |
| 13.6–15.6 | Stock por IMEI: lista de unidades con estado y batería; una pasa a "Vendida". |
| 15.6–17.6 | Texto grande: "Contesta primero." → "Vende lo que tiene." |
| 17.6–19.6 | DROP en el tiempo fuerte: logo del producto (blanco, centrado, sostenido). VO 8. |
| 19.6–21.6 | End card: marca de Lucas (**@nexorasistem.ar**), "Comentá **[PALABRA]**" (la palabra clave la defino con vos; "SOFT" es la del otro video). |

## Música y sonido
- Música original en código, ~112 BPM, minimal electrónica; el groove arranca con el golpe del hook; riser hacia el drop; acorde amplio al final. **≥15 dB bajo la voz.**
- SFX denso y limpio: whoosh en cada corte, golpe en cada aterrizaje, clic de UI, tick de escritura, bajo grave en el drop (biblioteca del proyecto).
- Master -14 LUFS / -1.5 dBTP con `scripts/master.mjs`.

## Assets
- **Capturas del panel con datos de demo**: `docs/crm-panel/capturas/` del repo (hay ~44: `escritorio-` y `celular-camino-feliz-01…22`: inicio, stock, precios, agenda, turno con aviso, conversación). Son del **modo demo**, no de datos reales. **No usar nada de MBCELL real** (973 ventas, saldos, clientes).
- Logo TrendSpot: `docs/marca/trendspot/logo.png` (blanco, transparente). Logo Nexora: `docs/marca/nexora/logo-blanco.png`.
- Chat de WhatsApp: **se arma como UI en Remotion** (no hay capturas reales de chats de clientes; no usar conversaciones reales).
- Música y SFX: de la biblioteca del proyecto, sin descargas.
- Higgsfield: **$0 por ahora**; solo si el hook 3D no sale en Remotion (te aviso el costo antes).
- Para traer las capturas y logos necesito clonar o descargar el repo (privado, es tuyo): **dime OK** y lo hago con `gh`, solo de `docs/`.

## Método: componentes hardcodeados + Higgsfield/Katana + Claude como director creativo (pedido de Lucas, 2026-10-16)
La explicación del producto es un **prototipo en motion**, no capturas pegadas:
- **Hardcodeo los componentes de la UI** como React/Remotion (en `src/pieza/spec-ad/phoneos/`), con los datos de la demo y el estilo de TrendSpot:
  `ChatWhatsApp` (burbujas, escribiendo, ticks), `TarjetaPrecio`, `CotizadorCanje` (números que cuentan), `TurnoReservado` (stock que baja),
  `KanbanPipeline` (tarjeta que viaja), `ListaIMEI` (unidad que pasa a vendida), `Celular3D`/`Marco` (mockup con borde brillante), `TextoCinetico`.
  Ventaja: cada pieza se anima a mano y se reutiliza en otros videos (otro rubro = otros datos), sin depender de capturas ni de cuentas reales.
- **Higgsfield/Katana solo para lo generativo**: el plano 3D del hook (ráfaga de notificaciones o celular que gira), fondos con brillo a la deriva, render del iPhone, tomas de producto. Cada plano se pide con costo estimado y OK antes.
  Katana: solo si un preset de producto encaja (hoy el catálogo es de producto).
- **Claude = director creativo**: escribo el brief y el beat sheet, defino cada plano (cámara, movimiento, luz, ritmo), re-temporizo a la voz, reviso con contact sheet cada iteración y te presento v1, v2… hasta que apruebes. Vos decidís; yo propongo y construyo.
- Cada componente se prueba en Studio (`localhost:3000`) antes de pedirte que mires.

## Preguntas abiertas (necesito tu OK)
1. **Nombre del producto en el video**: ¿"PhoneOS", "Nexora para celulares" u otro? ¿Va con marca TrendSpot o neutro (white-label)?
2. ¿Va dirigido a **dueños de locales de iPhone** (como la propuesta)? ¿Y el CTA lleva a vos/Nahuel?
3. **Palabra clave del CTA** (la de comentar).
4. **Voz**: ¿la tuya o ElevenLabs? (te estimo créditos antes).
5. ¿Largo ~20 s + end card? ¿Algo que evitar?
6. ¿Puedo usar capturas del modo demo del panel y el logo de TrendSpot? (Sebastián es el dueño de la marca.)

## Orden de trabajo
Brief → tu OK → assets → tu OK → voz → **preview v1 9:16 + contact sheet** → feedback (se repite) → finales 9:16 y 16:9, README.
No gasto créditos ni empiezo a construir hasta que digas "dale".
