# PropMatch · "Llegás a quien busca"

**Prompt del comercial · 25.0 s · 16:9 1920x1080 (master) + 9:16 1080x1920 · 30 fps**
Para inmobiliarias y martilleros: los que pagan. Escrito con la estructura de los spec ads de Revolut, Spotify y Amazon
(`formatos/spec-ad/README.md` §3). Pieza de cliente, no un spec ad: PropMatch es el producto. **Nunca se le habla al propietario**: el que paga es la inmobiliaria o el martillero, y el que busca (inquilino o comprador) se conecta con él.

---

## Concepto

El héroe es **PropMatch como CRM de la inmobiliaria**. El diferencial va adentro: la cartera le llega a la gente cuya
búsqueda encaja, y nadie paga por aparecer primero. Estructura:
1. El mundo del martillero: su tablero.
2. "Cargás una vez. Publicás en todos lados."
3. "Y tu propiedad le llega a quien la busca" (el mapa).
4. Tres ejemplos rápidos del CRM.
5. Drop sobre el logo.
6. "Sin pagar por aparecer primero."

**El motivo: una línea de luz con el degradé de marca.** Es la ficha de la propiedad viajando:
- Dibuja el isotipo en el hook.
- Nace de la onda de voz cuando el martillero dicta.
- Se abre en los canales donde se publica.
- Cruza el mapa de Buenos Aires hasta la persona que busca.
- Cierra en el corazón del match y en el logo.

Es el recurso de la sonrisa de Amazon. También es la idea del brief v2 de Lucas: la línea que termina dibujando la casa y
el corazón.

## Estilo

- **Película de producto tipo keynote de Apple.**
  - Escenario casi negro, **#080B1F**, con un glow que deriva despacio en el degradé de marca: **#4C7CFF → #A855FF →
    #FF5ECA → #FF8A3D**.
  - El degradé es el único acento. Nada de otros colores salvo los de la UI real.
- **Tipografía:** SF Pro Display, la del producto.
  - Titulares en 900 mayúsculas apretadas, como en la app ("MODO MARTILLERO", "MIS OPERACIONES").
  - Bajadas en 500.
- **UI real del prototipo PropMatch, tema oscuro.** Teléfono fotorreal de vidrio.
  - Motion blur real en cada movimiento, cámara con ease suave, nunca quieta.
  - Sin dibujos, sin emojis, sin mascotas.
- **Ritmo calmo-enérgico:**
  - Un corte cada 1.5 s más o menos.
  - El plano más corto, de 1 s.
  - Los planos héroe (mapa, logo), sostenidos 2 s.
- **Logo:** isotipo y wordmark oficiales de PropMatch, en blanco y sin efectos encima en el drop.

## Voz en off

**Voz:** argentina rioplatense, natural, cálida y segura. Suena a colega que te ahorra laburo, no a locutor de radio.
Ritmo natural, con voseo.
- **Higgsfield:** `seed_audio` con la voz **"Juan"** de la cuenta (`voice_type: element`). Es español; falta confirmar
  que suene rioplatense.
- **Plan B:** `text2speech_v2` con `variant: elevenlabs` y una voz multilingüe.
- **Grabación:** una línea por archivo, carriles A/B alternados.
- **Pronunciación:** "PropMatch" como se escribe, "prop-match".

| # | Línea | Carril | Entra en |
|---|---|---|---|
| 1 | "Toda tu inmobiliaria, en un solo lugar." | A | 1.4 s |
| 2 | "Cargás una vez." … "Publicás en todos lados." (pausa corta después de "vez.") | B | 3.5 s |
| 3 | "Y ahora, cada propiedad de tu cartera le llega a quien la busca." | A | 7.15 s |
| 4 | "Dictala, y la ficha se arma sola." | B | 11.0 s |
| 5 | "Sabé si tu precio está en rango." | A | 13.2 s |
| 6 | "Y mirá qué contactos ya tienen match." | B | 15.3 s |
| 7 | "PropMatch." … "Sin pagar por aparecer primero." | A | 19.9 s / 21.9 s |

## Lista de planos

Los textos de pantalla salen de las pantallas del prototipo (dark) y del pitch.

| Tiempo (s) | Imagen / sonido | UI / fuente |
|---|---|---|
| 0.0 – 1.2 | **HOOK.** Negro. La línea de luz con el degradé entra en látigo desde la izquierda y dibuja de un trazo el isotipo de PropMatch (la P con el corazón). Golpe en 0.35 s: punch de cámara, micro shake y un pulso violeta del glow. La cámara atraviesa el isotipo. | isotipo oficial |
| 1.2 – 3.4 | El teléfono flota inclinado con **MODO MARTILLERO**. Los contadores corren: "Operaciones activas 23 · +4 esta semana", "A cerrar este mes USD 18.4k". Las tarjetas de "Leads de hoy" entran deslizando. VO 1. | 19 · Broker Dashboard |
| 3.4 – 4.6 | **CARGÁS UNA VEZ.** "NUEVA PROPIEDAD": caen las 4 fotos reales (living, cocina, cama, balcón), se tipea el título "Loft luminoso en Palermo Soho", la barra va de 62 % a 100 % y se aprieta "Publicar" justo en "vez". | 17 · New Listing + fotos del prototipo |
| 4.6 – 6.2 | **PUBLICÁS EN TODOS LADOS.** La ficha se despega del teléfono y se abre en 4 tarjetas de vidrio que vuelan a su lugar: "MercadoLibre", "Facebook", "Instagram" y "App PropMatch". Cada una aterriza con un golpe en el beat. La línea de luz las une. | ficha 17 + chips de texto |
| 6.2 – 7.2 | Respiro. Las tres tarjetas de canales se apagan y queda la de PropMatch; la línea sale de ella hacia el fondo. VO "Y ahora,". | — |
| 7.2 – 9.8 | **HÉROE · EL MAPA.** Buenos Aires de noche desde arriba (avenidas iluminadas, el Obelisco en violeta), con push-in lento y parallax. Un pin "USD 1.250 · Palermo Soho" se enciende. La línea viaja por las calles hasta un pin de persona "Tomás · busca 2 amb en Palermo"; en "busca" salta el chip "94 % match" y el pin late. | aérea oscura del prototipo (`baAerialDark`) + pines de la app |
| 10.9 – 12.0 | **EL QUE BUSCA, CONECTADO CON VOS.** Dos tarjetas de vidrio: "Nuevo interesado · Tomás García · 94 % match" y "Pidió visita · Loft Palermo Soho · jueves 18 h". (No se usa la pantalla de interesados del flujo de dueño: la pieza le habla a la inmobiliaria.) | tarjetas |
| 11.0 – 13.2 | **DICTALA.** Botón de micrófono con la onda de voz en el degradé. La línea sale de la onda, el texto dictado aparece ("Loft en Guatemala 4500, dos ambientes, sesenta metros…") y los campos de la ficha se completan solos: título, ubicación, detalles. VO 4. | 17 · New Listing (estado "cargá hablando") |
| 13.2 – 15.3 | **PRECIO CON RESPALDO.** "Tu precio vs. mercado": el marcador se desliza por el rango de 8 comparables (Palermo Hollywood · 2 amb · 38–42 m²) y aterriza con un anillo que se cierra en "rango". | 18 · Property Diagnostic |
| 15.3 – 17.4 | **CONTACTOS CRUZADOS.** "LEADS DE HOY · 5 nuevos compatibles con tu cartera". Tomás G. 94 %, Camila R. 89 % y Joaquín P. se apilan, y la línea los une con "Loft Guatemala 4500 · 14 leads". VO 6, con el golpe en "match". | 19 · Broker Dashboard + 16 |
| 17.4 – 19.8 | **HÉROE · MIS OPERACIONES.** Las columnas del pipeline barren; una tarjeta avanza "Visita → Reserva". La línea se enrosca y dibuja el corazón del isotipo. Riser hacia el drop. | 20 · Broker Pipeline |
| 19.8 – 21.8 | **DROP** en el tiempo fuerte: wordmark de PropMatch en blanco, centrado y sostenido. VO "PropMatch." | logo oficial |
| 21.8 – 25.0 | Placa "Sin pagar por aparecer primero.", con "primero." en el degradé. VO. Letra chica: "Para inmobiliarias y martilleros · www.propmatch.com.ar". La línea se aplasta, se acorta y se apaga. | — |

## Música

Original o de biblioteca **libre de derechos y con stems**: Higgsfield no genera música, solo voz. Electrónica pop mínima,
unos 115 BPM, tonalidad menor que resuelve a mayor en el drop.
- El groove arranca con el golpe del isotipo.
- Hay un respiro en "Y ahora,".
- Riser hacia el logo y un acorde abierto en el drop que se queda sonando hasta el final.
- La música va al menos 15 dB debajo de la voz.

## Diseño sonoro

Denso y limpio:
- Un whoosh en cada corte y un golpe en cada aterrizaje.
- Clicks y taps de UI suaves, y un tick por letra en el título tipeado.
- Un "swoosh" eléctrico cuando la línea de luz viaja.
- Un ping por cada pin del mapa y un pulso grave en el match.
- Un golpe de bajo grande en el drop del logo.

Paleta del editor (`SFX_FILES`): `trazo`, `escena-entra`, `tarjeta`/`-b`/`-c`, `burbuja`, `check-b`, `key-soft`, `tap`,
`remate`, `cta-cierre`. Master a −14 LUFS / −1.5 dBTP.

## Qué es generado y qué es real

| Elemento | Origen | Costo Higgsfield (cotizado el 2026-10-16) |
|---|---|---|
| Todas las pantallas, tarjetas, pines, texto, isotipo y línea | **Remotion, con la UI del prototipo** | 0 |
| Mapa de Buenos Aires (7.2–9.8 s) | **Opción A:** `baAerialDark` del prototipo con push-in y parallax en código | 0 |
|  | **Opción B:** `seedance_2_5` con esa imagen como `start_image`, 4 s, sin audio | 28 créditos en 720p · 64 en 1080p |
| Voz en off (7 líneas) | `seed_audio`, voz "Juan" | 0.3 por línea ≈ 2.1, más reintentos ≈ 3 |
| Música | pack de música (`PACKS/`) | 0 |

Saldo actual de Higgsfield: **0.5 créditos**. Alcanza para una línea de voz de prueba; para la voz completa hacen falta
unos 3, y para el mapa generado 28 más.

Prompt del plano (opción B, inglés, con `baAerialDark` como `start_image`):

> Slow cinematic aerial push-in over Buenos Aires at night, seen from high above at a 45° angle; glowing avenue grid,
> the Obelisco softly lit in violet, Río de la Plata on the right; gentle parallax between rooftops and streets; deep
> indigo and violet palette, warm streetlights; smooth eased camera, no shake; no people, no text, no logos.

## Reglas

- **Lo que se afirma sale del pitch** ("PropMatch para inmobiliarias"): cargar hablando, una carga para varios canales
  (MercadoLibre, Facebook, Instagram y la app), campañas por WhatsApp, precio con comparables, contactos cruzados con la
  cartera y la cartera de un vistazo. Nada más:
  - Nada de "vendé el doble", porcentajes de resultados ni "IA que vende por vos".
  - No se nombra a ningún portal ni competidor: "sin pagar por aparecer primero" alcanza.
- **Todos los montos y nombres son los del prototipo e ilustrativos:**
  - Personas: Diego Vázquez, Tomás García, Camila Ruiz, Joaquín Pérez.
  - Propiedades: USD 1.250, Guatemala 4500, Honduras 5100.
- **Logos de canales:** los nombres van como texto en tarjetas. Los logos oficiales de MercadoLibre, Facebook e Instagram
  solo entran si Lucas confirma que esas integraciones están activas.
- **UI siempre real** (prototipo / CRM). Lo generado en Higgsfield es solo el mapa.

## Pendientes antes de producir

- [ ] Lucas: ¿la UI que va es la del prototipo oscuro o la del CRM web real (tema claro, `propmatch-crm`)? El pitch dice
      "funciona en la app y en la web".
- [ ] Lucas: ¿están activas las publicaciones a MercadoLibre, Facebook e Instagram (para los logos) y la carga por voz?
- [ ] Cargar créditos en Higgsfield (mínimo ~3 para la voz; ~31 si el mapa va generado en 720p).
- [ ] Probar 1 línea de voz con "Juan" y confirmar el acento antes de generar las 7.
- [ ] Elegir el tema con stems del pack.
