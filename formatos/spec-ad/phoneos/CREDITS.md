# Créditos y licencias — spec ad PhoneOS

| Recurso | Uso | Fuente | Licencia |
|---|---|---|---|
| `public/spec-ad/phoneos/iphone-17-pro.glb` | iPhone 3D del gancho (16:9) | "iPhone 17 Pro" de Ranguel — https://sketchfab.com/3d-models/iphone-17-pro-4541aa8a28324b33a2baaf81d263aaec | CC BY 4.0: **va el crédito** en el texto del post ("Modelo 3D: iPhone 17 Pro de Ranguel, CC BY 4.0") |
| `public/spec-ad/phoneos/real/**` | Capturas de la interfaz | Panel `apps/crm-panel` de `os-agent-trendspot` en modo demo (datos ficticios) | Propio (Lucas / Nexora) |
| `public/spec-ad/phoneos/audio/quantum-*.m4a` | Cama musical | ANBR – Quantum (PACKS/MÚSICA DE FONDO/PACK MÚSICA V2, `musica-068`) | Biblioteca libre (según catálogo) |
| SFX | Efectos | `public/reserva/sfx/` (biblioteca del proyecto) | Biblioteca del proyecto |
| `public/spec-ad/phoneos/audio/vo/vo-*.mp3` | Voz en off del 16:9 (15 líneas) | **Voz preset "Maya"** de Higgsfield (`voice_type: preset`, id `b0f766b7-8703-4bd1-b973-f857c36837b6`), generada con `text2speech_v2` + `variant: "elevenlabs"` (2026-10-17). Antes: preset "Juan" ("la voz es cualquiera") y la voz de Lucas clonada ("Lucas Silva", element `616c4d22-8107-4be8-9308-67a7d5263dbb`, tomas en `scratchpad/voz-lucas/final/`), que no le gustó: pidió "una voz de mujer, algo genérico normal". Se probaron Maya, Marisol y Gia; Maya, por narradora neutra y con un ritmo parecido | Generada (Higgsfield) |

## Guion de la voz (una línea por archivo)

00 ¿Vos tenés un local de iPhone? · 01 Te escriben por WhatsApp, y nadie contesta. · 02 Y el que tarda, pierde la venta. ·
03 Te presento Phone OS, de Nexora. · 04 Una inteligencia artificial que atiende tu WhatsApp, y un panel donde ves todo. ·
05 Una clienta quiere canjear su iPhone 13 Pro, y el asistente le responde solo. · 06 Le cotiza el canje en dólares, ·
07 y le agenda la visita al local. · 08 Vos sabés de dónde llegó cada cliente. · 09 Y lo va moviendo de etapa, solo. ·
10 Todos tus clientes, ordenados en un tablero. · 11 Y cada venta queda trazada: del primer mensaje, hasta el equipo que salió del stock. ·
12 Contesta primero. Vende con stock real. · 13 Phone OS. Para locales de iPhone. · 14 Comentá la palabra Phone, y te lo muestro funcionando.

"IA" se leía "idea" y "IMEI" sonaba a "email": por eso "inteligencia artificial" y "el equipo que salió del stock".
Las voces de ElevenLabs ponen el acento de "tú" en el voseo ("¿Tienes…?", "Sabes"), así que se fuerza con "Vos": "¿Vos tenés…?", "Vos sabés…".
En "cotiza", whisper oye "cotice" en todas las tomas de Maya: es el seseo y queda. Cada toma se verifica con whisper `medium`
(`palabras.py`, tiempos por palabra) y, si falla, se generan dos tomas más y se elige. El clon arrastra el ruido de sala de la
muestra: `silencedetect` a −40 dB no encuentra las pausas; los cortes dentro de una línea salen de los tiempos de whisper.
Si cambia el nombre o la palabra del CTA, se regeneran solo las líneas 03, 13 y 14 (~0,3 créditos cada una).
