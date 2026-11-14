---
name: carrusel-viral
description: Arma carruseles de Instagram/LinkedIn (1080x1350, 4:5) pensados para que la gente los guarde y los comparta, con un kit Remotion que renderiza cada lámina como PNG. Usala cuando pidan un carrusel, una guía en láminas, "algo para guardar" o un carrusel para una marca o negocio.
---

# carrusel-viral

Un carrusel que funciona hace una sola cosa: **le da al lector algo que quiere tener a mano**. Esta skill lleva de un tema a láminas PNG listas para publicar, con un kit Remotion propio (diseño limpio, un color de marca, sin collage ni plantillas genéricas).

## Antes de escribir una lámina

1. **Una promesa.** Una frase: "Después de esto, el lector sabe ___". Si no entra en una frase, son dos carruseles.
2. **Por qué lo guardaría.** Elegí un disparador y escribilo: guía paso a paso, lista para consultar, comparación "mejor decí / si decís", cifra que sorprende o plantilla. Sin disparador, es un posteo, no un carrusel.
3. **Nada inventado.** Cifras, casos y citas salen del cliente o de algo verificable. Si falta el dato, la lámina no lleva cifra.

## Estructura (7 a 9 láminas)

| # | Tipo | Qué hace |
|---|---|---|
| 1 | `portada` | La promesa, con una `[clave]`. Es el 80 % del resultado: se escribe al final, con 3 variantes. |
| 2–N | `punto` / `lista` / `versus` / `cifra` | Una idea por lámina. Alternar tipos: nunca tres iguales seguidas. |
| última | `cierre` | Una acción sola (guardar o enviar), con el motivo. |

Reglas de texto:
- **Una idea por lámina**, 25 palabras como tope (la portada, menos de 12).
- **Una `[clave]` por lámina**, la palabra que el ojo tiene que leer primero.
- Frases en el idioma del lector (voseo si es rioplatense). Sin relleno: "es importante tener en cuenta" no dice nada.
- Que cada lámina empuje a deslizar: la siguiente tiene que responder algo que esta abre.

Detalle y ejemplos en `references/ganchos-y-estructura.md`. Si te dan un perfil de referencia por capturas, `references/analizar-un-perfil.md`.

## Instalar el kit

```bash
node .claude/skills/carrusel-viral/template/instalar.mjs <proyecto-remotion>
```

Copia `template/carrusel/` a `<proyecto>/src/carrusel/` y avisa cómo registrarlo en el Root (`<CarruselCompositions />`). No pisa nada si ya existe.

## Brief

Copiá `src/carrusel/briefs/ejemplo-bruma.ts` a `briefs/<slug>.ts`, cambiá marca y láminas, y sumalo a `BRIEFS` en `carrusel-root.tsx`. Tipos en `tema.ts`:

- `marca`: `acento` (un color plano), `textoAcento` (contraste ≥ 4,5:1 sobre el acento), `fondo`, `tinta`, `tintaSuave`, `fuente`.
- `laminas`: `portada`, `punto`, `lista`, `cifra`, `versus`, `cierre`. Cada una acepta `fondo: "base" | "acento" | "oscuro"`; alternarlos da ritmo (una lámina oscura o de acento cada 3–4).
- `fuentes` (opcional): archivos en `public/` cargados con `FontFace`.

Cada lámina es una composición `<slug>-<n>`; el video en bucle es `<slug>-animado` (ver la skill `carrusel-animado`).

## Renderizar y revisar

```bash
npx remotion still src/index.ts <slug>-1 out/<slug>-1.png --timeout=120000
```

Una lámina por vez (cada render abre un Chrome). **Mirá cada PNG** antes de entregar. Checklist en `references/checklist.md`.

## Qué no hacer

- Emojis o íconos genéricos como adorno. El kit usa tipografía, color y forma.
- Cifras, testimonios o resultados que el cliente no dio.
- Más de un color de marca. El kit pone marcador si el acento no se lee sobre el fondo (contraste < 3).
- Copiar el diseño de otro perfil: de una referencia se aprende la estructura, no se calca la estética.
