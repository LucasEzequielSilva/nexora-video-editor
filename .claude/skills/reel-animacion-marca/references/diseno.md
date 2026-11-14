# Diseño: que no parezca hecho con IA

La primera versión del ejemplo (Turnix, 2026-11-11) "se veía muy IA". Se comparó cuadro a cuadro contra los 11 reels de rayyan.pe y uno de keemfinity. Esto es lo que cambió en el kit y por qué.

## Lo que delataba IA
| Teníamos | Las referencias hacen | Regla del kit |
|---|---|---|
| Degradé violeta → fucsia en texto, botones, burbujas, teléfono y logo | Un color de marca plano: el verde de Modo Calle, el de Duolingo, el violeta de Tu Yapa sin degradé | `acento` es un solo color. Nada lleva degradé de dos tonos |
| Fondo con manchas de luz y partículas que flotan | Fondo liso claro: blanco, gris frío o beige | `Fondo` es liso, de un solo color (un degradé suave se bandea al codificar, sobre todo en amarillos y rojos) |
| Palabra clave en serif itálica con degradé | La palabra clave en el color de marca, con la misma letra y el mismo peso | `[x]` = color plano. Si el color no se lee sobre el fondo (contraste < 3), va un marcador detrás |
| Rótulo en mayúsculas espaciadas ("TURNIX ATIENDE") y número gigante con degradé | La prueba es interfaz real (calendario, chat) o un número plano | Sin mayúsculas espaciadas. `numero` plano; mejor un beat de interfaz (`agenda`) |
| Chat genérico con burbujas de degradé y puntitos | WhatsApp de verdad: sus colores, tildes, hora y "escribiendo…" arriba | `Chat` copia WhatsApp, claro u oscuro |
| Teléfono con pantalla de degradé | iPhone con pantalla de bloqueo creíble, inclinado en 3D | `Telefono`: notificaciones tipo iOS con el ícono de la app y leve giro 3D |
| Píldoras con tilde de degradé ("Todo en un solo lugar") | Chips blancos con ícono, sobre datos concretos (precio, dirección) | `lista` solo si hace falta; mejor mostrar la función en la interfaz |
| Logo: inicial en un cuadrado con degradé y destello | El logo real de la marca | `marca.logo` = archivo real. Sin logo: nombre y un punto del color de marca |
| Texto enorme (98–104 px) y palabra de 440 px | Texto mediano con aire (~55–70 px si fuera 1920 de ancho) | Frases 84 px; al costado de un objeto, 76–80 px; palabra del giro, 300 px |

## La paleta
1. **Marca real**: sus colores, su tipografía y su logo, tal cual. Pedilos; si no hay manual, sacalos de la web o del logo.
2. **Marca inventada**: el color sale del tema, no de un default. Turnix (turnos de consultorio): la agenda de papel y el resaltador → gris frío `#F2F3F5`, tinta `#16181D`, amarillo `#FFC527`.
3. **Nunca** violeta → fucsia, índigo con brillos, ni crema + terracota + serif: son los defaults de lo generado con IA.
4. El color de marca no choca con la interfaz que se muestra: si hay WhatsApp (verde), la marca no es verde.
5. El kit decide solo cómo se lee el color: texto blanco o tinta sobre el fondo de acento, y marcador cuando el acento no se lee como letra.

## La interfaz
- El producto se muestra con su interfaz, o con la que usa el cliente (WhatsApp, calendario), y con datos creíbles: nombres con apellido, horas, precios, direcciones.
- Los datos ficticios son coherentes entre beats. En Turnix, Lucía escribe a las 23:48, pide turno en el chat y su turno de las 16:00 cae en la agenda.
- La fecha y el día de la semana coinciden (16 de noviembre de 2026 es lunes).
- Colores de WhatsApp: claro `#EFEAE2` fondo, `#D9FDD3` saliente, `#FFFFFF` entrante; oscuro `#0B141A`, `#005C4B`, `#202C33`; verde `#00A884`; tildes `#53BDEB`.

## El movimiento
Detalle completo (curvas, resortes, tiempos, transiciones) en `motion.md` y `transiciones-y-escenas.md`.
- Una idea de movimiento por beat. Palabras con desenfoque corto (≤ 6 px); los objetos entran y quedan con una deriva lenta.
- La vida la da el objeto (la notificación que llega, el mensaje que entra, el turno que cae), no los adornos: nada de destellos, anillos, partículas ni brillos.

## Chequeo "¿se ve IA?" (antes de mostrar)
- [ ] ¿Hay un degradé de dos colores en texto, botón, burbuja o logo?
- [ ] ¿Hay partículas, manchas de luz, destellos o brillos de adorno?
- [ ] ¿Hay rótulos en mayúsculas espaciadas?
- [ ] ¿La paleta es violeta/índigo, o crema + terracota + serif, sin que la marca lo sea?
- [ ] ¿Algún beat de texto se podría cambiar por la interfaz real del producto?
- [ ] ¿El logo es inventado cuando la marca tiene uno real?

Si alguna da sí, se corrige antes de mostrar.
