# Empaque y post

## Empaque: dos caminos
**A. Laptop filmada de verdad (preferido: es lo que da credibilidad).**
1. Renderizar la pantalla: `npx remotion render src/index.ts <slug>-16x9 out/<slug>-16x9.mp4`.
2. Ponerla a pantalla completa en una laptop, brillo al máximo, en un cuarto con poca luz y una luz del color de la marca (lámpara o esfera).
3. Filmar en vertical con el celular, la pantalla en el tercio medio, el teclado abajo, cámara con un leve empuje. Que se vea el teclado y algún reflejo.
4. En la edición: sumar la etiqueta arriba (misma tipografía y píldoras del kit) y, al final, el cierre: renderizar `<slug>-cierre` (1080x1920, 4.5 s) y pegarlo.
5. Si la pantalla sale con moiré o parpadeo, bajar a 30 fps al filmar y alejar un poco la cámara.

**B. Mockup en Remotion (cuando no se puede filmar).** `<slug>-reel` ya trae cuarto, laptop dibujada, etiqueta, deriva de cámara, luz del color de la marca y cierre. Se ve más limpio y menos real: decirlo en la entrega. Mejoras posibles: reflejo de la pantalla en el teclado, ruido de grano, viñeta.

## Etiqueta (arriba, ~8 % desde el borde)
Fórmula: *modelo* + *mi skill* (+ *flujo*). Ejemplos listos en `anatomia.md`. En el brief:
```ts
etiqueta: [[{ t: "Hecho por" }, { t: "Opus 5.5", pill: true }], [{ t: "+" }, { t: "Mi skill", pill: true }]]
```
Escribí el modelo real que se usó. Si se usó otro (Sonnet, etc.), ponelo: la etiqueta es una afirmación.

## Cierre
`cta: { palabra: "SKILL", pie: "y te lo paso" }`. Para otra oferta cambiar la palabra (la que el usuario va a poder entregar). Entre "Comentá" y la píldora hay un cursor azul con caja de selección: es la firma visual del formato.
Si el usuario quiere el **cierre largo** (pila "100% hechos por Opus + Mi skill + Mi flujo creativo"), agregá un beat extra de tipo `lista` con esos tres ítems antes del `logo`; no hace falta código nuevo.

## Post (texto)
```
{Gancho en una línea: lo que se ve, con asombro real.}  ← ej. "Esto lo hizo Opus 5.5 en 20 minutos"
Comentá "{PALABRA}" y te paso {la skill / el prompt} 📩
{Una línea de contexto: marca, para qué sirve.}
#motiongraphics #claude #claudecode #ia #{nicho}
```
Reglas:
- El tiempo que digas tiene que ser **real** (medilo).
- Si la marca es ajena: "Concepto, no oficial".
- La palabra clave es **una sola**, en mayúsculas, la misma que el cierre.
- Prometé solo lo que vas a entregar. Si regalás la skill, mandá esta carpeta tal cual.
- Portada: un cuadro limpio de la animación con la marca (no el cierre).
