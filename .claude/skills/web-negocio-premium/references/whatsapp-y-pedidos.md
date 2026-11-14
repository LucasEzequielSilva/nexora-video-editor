# WhatsApp, pedidos y reservas

## Los tres modos (`modo` en `datos.js`)
| Modo | Qué hace | Cuándo |
|---|---|---|
| `pedidos` | Cada ítem con precio tiene "+" / "−". Una barra fija muestra cantidad y total; la hoja pide nombre, entrega (retiro / envío) y notas, y abre WhatsApp con el pedido armado | Comida, panadería, comercio con envío o retiro |
| `reservas` | Botón "Reservar mesa" con nombre, día, hora, personas y notas → WhatsApp | Restaurante de mesa, peluquería, consultorio, canchas |
| `contacto` | Solo "Escribinos por WhatsApp" | Servicios que se presupuestan (arreglos, obras, flete) |

Con `modo: "pedidos"` y sin carta, el template cae solo a un botón de contacto.

## Formato del mensaje
Pedido:
```
Hola, Don Rolo! Quiero hacer un pedido:

• 2 x Napolitana ($29.000)
• 1 x Gaseosa 1,5 L ($4.200)

Total: $33.200
Nombre: Lucía
Entrega: Envío a domicilio - Thames 1840, 3B
Notas: Sin cebolla
```
Reserva: nombre, día en texto largo ("sábado, 5 de diciembre"), hora, personas, notas. Se codifica con `encodeURIComponent` y se abre `https://wa.me/<número>?text=…`.

## Número
Solo dígitos con código de país y sin `+` ni ceros: Argentina celular `549` + área sin 0 + número sin 15 (`5491155550123`). Probar el link con un número real antes de entregar.

## Lo que la web NO hace (decirlo en la entrega)
- No cobra: no hay pasarela. El cobro lo coordina el negocio por WhatsApp (transferencia, Mercado Pago link, efectivo).
- No confirma stock ni horario de entrega: el mensaje es un pedido, no una compra cerrada. La hoja lo avisa.
- No guarda pedidos: si el cliente no manda el mensaje, no queda registro. Para eso haría falta un backend, que está fuera de esta skill.
- Los ítems con `precio: null` se muestran "Consultar" y no se pueden agregar al pedido.

## Entrega y dirección
`entrega` es una lista de opciones (`["Retiro en el local", "Envío a domicilio"]`). El campo de dirección aparece solo si la opción elegida contiene "envío", "domicilio" o "delivery". Si el negocio no tiene envío, dejar solo `["Retiro en el local"]`. Costo de envío: ponerlo en la `descripcion` o en una nota de la carta, no calcularlo en el carrito (zona y precio los define el negocio).

## Horarios y "abierto ahora"
- `horarios`: `{ texto, dias, abre, cierra }` con `dias` 0 = domingo … 6 = sábado.
- Si `cierra` < `abre`, cierra pasada la medianoche (viernes 19:00–01:00 sigue abierto el sábado a las 00:30).
- Se calcula con la hora **del negocio** (`zona`, por defecto `America/Argentina/Buenos_Aires`), no la del celular del visitante. Cambiar `zona` si el negocio está en otro país.
- Sin `horarios`, no aparece ni el estado ni el bloque.
- Feriados y cierres especiales no se modelan: si hace falta, avisarlo en la `descripcion`.
