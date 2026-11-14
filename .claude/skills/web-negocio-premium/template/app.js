(() => {
  const N = window.NEGOCIO;
  const $app = document.getElementById("app");
  const fmt = new Intl.NumberFormat(N.locale || "es-AR", { maximumFractionDigits: 0 });
  const plata = (n) => `${N.moneda || "$"}${fmt.format(n)}`;
  const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // El texto de los datos nunca pasa por innerHTML: todo se arma con nodos.
  const h = (tag, attrs = {}, ...hijos) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const c of hijos.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
    return el;
  };

  const c = N.colores || {};
  const root = document.documentElement.style;
  if (c.acento) root.setProperty("--acento", c.acento);
  if (c.fondo) root.setProperty("--fondo", c.fondo);
  if (c.tinta) root.setProperty("--tinta", c.tinta);
  if (c.suave) root.setProperty("--suave", c.suave);
  if (c.superficie) root.setProperty("--superficie", c.superficie);
  if (N.textoAcento) root.setProperty("--texto-acento", N.textoAcento);
  if (N.colorTextoAcento) root.setProperty("--acento-texto", N.colorTextoAcento);

  document.title = `${N.nombre}${N.rubro ? " · " + N.rubro : ""}`;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", N.descripcion || "");

  const wa = (texto) => `https://wa.me/${N.whatsapp}?text=${encodeURIComponent(texto)}`;
  const modo = N.modo || "contacto";
  const cats = (N.categorias || []).filter((x) => x.items && x.items.length);

  // ---------- estado abierto/cerrado (hora del negocio, no la del visitante) ----------
  const estadoAhora = () => {
    const hs = N.horarios || [];
    if (!hs.length) return null;
    const partes = new Intl.DateTimeFormat("en-US", { timeZone: N.zona || undefined, weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
    const get = (t) => partes.find((p) => p.type === t).value;
    const dia = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    const min = (Number(get("hour")) % 24) * 60 + Number(get("minute"));
    const aMin = (s) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3, 5));
    for (const x of hs) {
      const a = aMin(x.abre), z = aMin(x.cierra);
      const hoy = x.dias.includes(dia), ayer = x.dias.includes((dia + 6) % 7);
      if (z > a ? hoy && min >= a && min < z : (hoy && min >= a) || (ayer && min < z)) return { abierto: true, texto: `Abierto ahora · cierra ${x.cierra}` };
    }
    return { abierto: false, texto: "Cerrado ahora" };
  };

  // ---------- carrito ----------
  const carrito = new Map(); // nombre -> { item, n }
  const barraTotal = h("b", {});
  const barraBtn = h("button", { class: "btn", onclick: () => abrirPedido() }, "Ver pedido");
  const barra = h("div", { class: "barra" }, h("div", { class: "wrap" }, barraTotal, barraBtn));
  const refrescos = [];
  const cambiar = (item, d) => {
    const cur = carrito.get(item.nombre) || { item, n: 0 };
    cur.n = Math.max(0, cur.n + d);
    cur.n ? carrito.set(item.nombre, cur) : carrito.delete(item.nombre);
    refrescos.forEach((f) => f());
    const cant = [...carrito.values()].reduce((s, x) => s + x.n, 0);
    const tot = [...carrito.values()].reduce((s, x) => s + x.n * (x.item.precio || 0), 0);
    barra.classList.toggle("ver", cant > 0);
    barraTotal.textContent = `${cant} ${cant === 1 ? "producto" : "productos"} · ${plata(tot)}`;
  };

  const filaItem = (it) => {
    const n = h("span", { class: "n" }, "0");
    const menos = h("button", { class: "menos", type: "button", "aria-label": `Quitar ${it.nombre}`, onclick: () => cambiar(it, -1) }, "−");
    const mas = h("button", { class: "mas", type: "button", "aria-label": `Agregar ${it.nombre}`, onclick: () => cambiar(it, 1) }, "+");
    const ctrl = h("div", { class: "ctrl" }, menos, n, mas);
    const sync = () => {
      const q = (carrito.get(it.nombre) || {}).n || 0;
      n.textContent = q;
      menos.style.visibility = n.style.visibility = q ? "visible" : "hidden";
    };
    refrescos.push(sync); sync();
    const precio = it.precio == null ? "Consultar" : `${it.desde ? "desde " : ""}${plata(it.precio)}`;
    return h("li", { class: "item" },
      h("div", { class: "txt" }, h("b", {}, it.nombre), it.desc ? h("small", {}, it.desc) : null),
      it.foto ? h("img", { src: it.foto, alt: it.nombre, loading: "lazy" }) : null,
      h("div", { class: "der" }, h("span", { class: "precio" }, precio), modo === "pedidos" && it.precio != null ? ctrl : null));
  };

  // ---------- formularios (pedido / reserva) ----------
  const fondoModal = h("div", { class: "fondo-modal", onclick: (e) => e.target === fondoModal && cerrar() });
  const cerrar = () => { fondoModal.classList.remove("ver"); document.body.style.overflow = ""; };
  const abrirHoja = (...nodos) => { fondoModal.replaceChildren(h("div", { class: "hoja", role: "dialog", "aria-modal": "true" }, ...nodos)); fondoModal.classList.add("ver"); document.body.style.overflow = "hidden"; };
  const campo = (etiqueta, el) => h("div", {}, h("label", {}, etiqueta), el);
  const val = (el) => (el.value || "").trim();

  function abrirPedido() {
    const lineas = [...carrito.values()];
    const tot = lineas.reduce((s, x) => s + x.n * x.item.precio, 0);
    const nombre = h("input", { autocomplete: "name", required: true });
    const tipos = N.entrega && N.entrega.length ? N.entrega : ["Retiro"];
    const entrega = h("select", {}, tipos.map((t) => h("option", {}, t)));
    const dir = h("input", { autocomplete: "street-address", placeholder: "Calle, número, piso" });
    const dirCampo = campo("Dirección de entrega", dir);
    const notas = h("textarea", { rows: 2, placeholder: "Aclaraciones (opcional)" });
    const aviso = h("p", { class: "aviso" });
    const pideDir = () => /env[ií]o|domicilio|delivery/i.test(entrega.value);
    const sync = () => (dirCampo.style.display = pideDir() ? "" : "none");
    entrega.addEventListener("change", sync);
    const enviar = () => {
      if (!val(nombre)) return (aviso.textContent = "Poné tu nombre.");
      if (pideDir() && !val(dir)) return (aviso.textContent = "Falta la dirección de entrega.");
      const txt = [
        `Hola, ${N.nombre}! Quiero hacer un pedido:`, "",
        ...lineas.map((x) => `• ${x.n} x ${x.item.nombre} (${plata(x.item.precio * x.n)})`), "",
        `Total: ${plata(tot)}`, `Nombre: ${val(nombre)}`, `Entrega: ${entrega.value}${pideDir() ? " - " + val(dir) : ""}`,
        val(notas) ? `Notas: ${val(notas)}` : null,
      ].filter((x) => x !== null).join("\n");
      window.open(wa(txt), "_blank", "noopener");
    };
    abrirHoja(
      h("h2", {}, "Tu pedido"),
      h("ul", { class: "resumen" }, lineas.map((x) => h("li", {}, h("span", {}, `${x.n} x ${x.item.nombre}`), h("span", {}, plata(x.n * x.item.precio))))),
      h("div", { class: "total" }, h("span", {}, "Total"), h("span", {}, plata(tot))),
      campo("Nombre", nombre), campo("Entrega", entrega), dirCampo, campo("Notas", notas),
      h("button", { class: "btn", type: "button", onclick: enviar }, "Enviar pedido por WhatsApp"),
      aviso, h("p", { class: "aviso" }, "Se abre WhatsApp con el pedido armado. El negocio te confirma por ahí."),
      h("button", { class: "cerrar", type: "button", onclick: cerrar }, "Volver a la carta"));
    sync();
  }

  function abrirReserva() {
    const hoy = new Date().toISOString().slice(0, 10);
    const nombre = h("input", { autocomplete: "name" });
    const fecha = h("input", { type: "date", min: hoy, value: hoy });
    const hora = h("input", { type: "time" });
    const personas = h("input", { type: "number", min: 1, max: 30, value: 2, inputmode: "numeric" });
    const notas = h("textarea", { rows: 2, placeholder: "Aclaraciones (opcional)" });
    const aviso = h("p", { class: "aviso" });
    const enviar = () => {
      if (!val(nombre) || !val(fecha) || !val(hora)) return (aviso.textContent = "Completá nombre, fecha y hora.");
      const f = new Date(val(fecha) + "T00:00").toLocaleDateString(N.locale || "es-AR", { weekday: "long", day: "numeric", month: "long" });
      const txt = [`Hola, ${N.nombre}! Quiero reservar:`, `Nombre: ${val(nombre)}`, `Día: ${f}`, `Hora: ${val(hora)}`, `Personas: ${val(personas)}`, val(notas) ? `Notas: ${val(notas)}` : null].filter(Boolean).join("\n");
      window.open(wa(txt), "_blank", "noopener");
    };
    abrirHoja(h("h2", {}, "Reservar"), campo("Nombre", nombre),
      h("div", { class: "fila" }, campo("Día", fecha), campo("Hora", hora)), campo("Personas", personas), campo("Notas", notas),
      h("button", { class: "btn", type: "button", onclick: enviar }, "Pedir reserva por WhatsApp"), aviso,
      h("p", { class: "aviso" }, "La reserva queda confirmada cuando el negocio te responde."),
      h("button", { class: "cerrar", type: "button", onclick: cerrar }, "Cerrar"));
  }

  // ---------- página ----------
  const logo = N.logo ? h("img", { src: N.logo, alt: N.nombre }) : h("span", {}, N.nombre, h("i", {}, "."));
  const accionPrincipal =
    modo === "reservas" ? h("button", { class: "btn", type: "button", onclick: abrirReserva }, "Reservar mesa")
    : modo === "pedidos" && cats.length ? h("a", { class: "btn", href: "#carta" }, "Ver la carta y pedir")
    : h("a", { class: "btn", href: wa(N.mensajeContacto || "Hola!"), target: "_blank", rel: "noopener" }, "Escribinos por WhatsApp");
  const estado = estadoAhora();
  const hero = h("div", { class: `hero${N.imagenHero ? " con-imagen" : ""}`, style: N.imagenHero ? `background-image:url('${N.imagenHero}')` : null },
    h("div", { class: "wrap" },
      N.rubro ? h("div", { class: "rubro" }, N.rubro) : null,
      h("h1", {}, N.titulo || N.nombre),
      N.descripcion ? h("p", {}, N.descripcion) : null,
      h("div", { class: "acciones" }, accionPrincipal,
        modo !== "contacto" ? h("a", { class: "btn sec", href: wa(N.mensajeContacto || "Hola!"), target: "_blank", rel: "noopener" }, "Consultar") : null),
      estado ? h("div", { class: `estado${estado.abierto ? " abierto" : ""}` }, estado.texto) : null));

  const nav = h("nav", {}, cats.length ? h("a", { href: "#carta" }, "Carta") : null, h("a", { href: "#info" }, "Info"));
  const top = h("header", { class: "top" }, h("div", { class: "wrap" }, h("a", { class: "marca", href: "#" }, logo), nav));

  const carta = cats.length
    ? h("section", { id: "carta" }, h("div", { class: "wrap" }, h("h2", {}, "Carta"),
        cats.length > 1 ? h("div", { class: "cats" }, cats.map((x) => h("a", { href: `#cat-${slug(x.nombre)}` }, x.nombre))) : null,
        cats.map((x) => h("div", { class: "cat", id: `cat-${slug(x.nombre)}` }, h("h3", {}, x.nombre), h("ul", { class: "items" }, x.items.map(filaItem))))))
    : null;

  const bloques = [];
  if (N.direccion) bloques.push(h("div", {}, h("h3", {}, "Dónde"), h("p", {}, N.direccion), N.mapa ? h("p", {}, h("a", { href: N.mapa, target: "_blank", rel: "noopener" }, "Abrir en el mapa")) : null));
  if ((N.horarios || []).length) bloques.push(h("div", {}, h("h3", {}, "Horarios"), h("ul", {}, N.horarios.map((x) => h("li", {}, h("span", {}, x.texto), h("span", {}, `${x.abre}–${x.cierra}`))))));
  const contacto = [h("p", {}, h("a", { href: wa(N.mensajeContacto || "Hola!"), target: "_blank", rel: "noopener" }, "WhatsApp"))];
  if (N.instagram) contacto.push(h("p", {}, h("a", { href: `https://instagram.com/${N.instagram}`, target: "_blank", rel: "noopener" }, "@" + N.instagram)));
  bloques.push(h("div", {}, h("h3", {}, "Contacto"), contacto));
  const info = h("section", { id: "info" }, h("div", { class: "wrap" }, h("h2", {}, "Info"), h("div", { class: "info" }, bloques)));

  const pie = h("footer", {}, h("div", { class: "wrap" }, `© ${new Date().getFullYear()} ${N.nombre}`));

  $app.replaceChildren(top, h("main", {}, hero, carta, info), pie, barra, fondoModal);
  document.addEventListener("keydown", (e) => e.key === "Escape" && cerrar());
})();
