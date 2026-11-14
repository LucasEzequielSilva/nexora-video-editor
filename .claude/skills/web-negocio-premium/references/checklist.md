# Checklist: probar y publicar

## 1. Servir
```
cd <carpeta-de-la-web>
python -m http.server 8765
```
Abrir `http://localhost:8765/index.html`. (No abrir el archivo con `file://`: algunos navegadores bloquean cosas.)

## 2. Probar (Playwright o a mano)
Ventanas: **390×844** (celular) y **1280×800** (escritorio). Captura de página completa en las dos.

- [ ] Consola sin errores ni 404 (favicon incluido).
- [ ] Hero: título en ≤ 3 líneas en el celular, botón principal visible sin scroll.
- [ ] "Abierto ahora / Cerrado ahora" coincide con la hora del negocio (probar con un horario que cruce la medianoche si hay).
- [ ] **Pedido**: agregar 2 productos, subir y bajar cantidades, ver barra con total correcto, abrir la hoja, enviar sin nombre (avisa), elegir envío sin dirección (avisa), completar y revisar el texto exacto del mensaje de WhatsApp (se puede reemplazar `window.open` por una función que guarde la URL).
- [ ] **Reserva** (si aplica): fecha y hora vacías avisan; el mensaje trae día en texto largo.
- [ ] Un texto con `<b>` en notas llega como texto, sin interpretarse.
- [ ] Cerrar la hoja libera el scroll de la página.
- [ ] Datos faltantes: sacar `categorias`, `horarios` y `direccion` y recargar. Las secciones desaparecen y no queda nada vacío ni con "undefined".
- [ ] Teclado: Tab llega a los botones "+" y "−", Esc cierra la hoja, el foco se ve.
- [ ] Contraste de botón y textos chicos ≥ 4,5:1.

## 3. Datos
- [ ] Ningún texto de ejemplo del template ("Nombre del negocio", "Frase corta…").
- [ ] Precios confirmados con el negocio o marcados como "a confirmar" en la entrega.
- [ ] El link de WhatsApp abre el chat correcto (probar con el número real).

## 4. Publicar
Es una carpeta estática. Cualquiera de estas sirve, de menos a más trabajo:
1. **Netlify Drop / Cloudflare Pages / Vercel**: arrastrar la carpeta o conectar un repo. Dominio propio después.
2. **GitHub Pages**: subir la carpeta a un repo y activar Pages.
3. **Hosting del cliente**: subir los 4 archivos por FTP a la raíz.

Antes de publicar: poner un `<title>` y una `description` reales (el template los toma de `datos.js`), y si hay logo en SVG, sumarlo como favicon (`<link rel="icon" href="logo.svg">`).

## 5. Actualizar después
El dueño (o vos) cambia precios y horarios **solo en `datos.js`** y vuelve a subir ese archivo. Avisar al entregar que ese es el único archivo que se toca.
