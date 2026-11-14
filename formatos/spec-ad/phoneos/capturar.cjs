// Captura la plataforma real (panel en modo demo, datos ficticios) desarmada en piezas para animarlas en Remotion.
// Por escena: fondo (la pantalla con las piezas ocultas), completo (todo visible) y cada pieza con su caja en px CSS.
const fs = require("fs");
const path = require("path");
const { chromium } = require("D:/Dev/os-agent-trendspot/apps/crm-panel/node_modules/@playwright/test");

const BASE = "http://localhost:3100";
const OUT = process.argv[2];
const SOLO = process.argv[3];

const MOVIL = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true };
const ESCRITORIO = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 };

async function contexto(browser, perfil, alto) {
  const ctx = await browser.newContext({
    ...perfil,
    viewport: { width: perfil.viewport.width, height: alto ?? perfil.viewport.height },
    colorScheme: "dark",
    locale: "es-AR",
    timezoneId: "America/Argentina/Buenos_Aires",
  });
  await ctx.addInitScript(() => {
    try { localStorage.setItem("crm.sidebar.fijada", "1"); } catch {}
  });
  const page = await ctx.newPage();
  await page.goto(BASE + "/login");
  await page.locator("input[name=email]").fill("duena@demo.test");
  await page.locator("input[name=password]").fill("demo-video-2026");
  await page.getByRole("button", { name: /^ingresar$/i }).click();
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 60000 });
  return { ctx, page };
}

async function ir(page, ruta) {
  await page.goto(BASE + ruta);
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.addStyleTag({ content: "nextjs-portal{display:none!important} *{caret-color:transparent!important}" });
  // El aviso de "no se pudieron cargar todos los datos" sale solo porque el demo no tiene la base del gestor.
  await page.evaluate(() => {
    const t = [...document.querySelectorAll("p,span,div")].find((e) => e.childElementCount === 0 && e.textContent.trim().startsWith("No se pudieron cargar todos los datos"));
    let el = t;
    while (el && !/border/.test(el.className || "")) el = el.parentElement;
    if (el) el.style.display = "none";
  });
  await page.waitForTimeout(900);
}

/** Marca las piezas con data-cap y devuelve sus cajas. `marcar` corre en el navegador y devuelve elementos. */
async function desarmar(page, escena, marcar, args) {
  const dir = path.join(OUT, escena);
  fs.mkdirSync(dir, { recursive: true });
  await page.evaluate(() => window.scrollTo(0, 0));
  const items = await page.evaluate(
    ({ fuente, args }) => {
      const fn = new Function("args", fuente);
      const els = fn(args);
      return els.map(({ el, id }, i) => {
        el.setAttribute("data-cap", String(i));
        const r = el.getBoundingClientRect();
        return { id, x: r.x + window.scrollX, y: r.y + window.scrollY, w: r.width, h: r.height, texto: el.textContent.trim().replace(/\s+/g, " ").slice(0, 80) };
      });
    },
    { fuente: marcar, args },
  );
  await page.screenshot({ path: path.join(dir, "completo.png"), fullPage: true });
  for (let i = 0; i < items.length; i++) {
    const archivo = `${String(i).padStart(2, "0")}-${items[i].id}.png`;
    await page.locator(`[data-cap="${i}"]`).screenshot({ path: path.join(dir, archivo) });
    items[i].archivo = archivo;
  }
  await page.evaluate(() => document.querySelectorAll("[data-cap]").forEach((e) => (e.style.visibility = "hidden")));
  await page.screenshot({ path: path.join(dir, "fondo.png"), fullPage: true });
  await page.evaluate(() => document.querySelectorAll("[data-cap]").forEach((e) => { e.style.visibility = ""; e.removeAttribute("data-cap"); }));
  const dims = await page.evaluate(() => ({ ancho: document.documentElement.scrollWidth, alto: document.documentElement.scrollHeight }));
  const dpr = await page.evaluate(() => window.devicePixelRatio);
  fs.writeFileSync(path.join(dir, "manifiesto.json"), JSON.stringify({ ...dims, dpr, fondo: "fondo.png", completo: "completo.png", items }, null, 2));
  console.log(escena, items.length, "piezas", dims);
}

const ESCENAS = {
  async lista(browser) {
    const { ctx, page } = await contexto(browser, MOVIL);
    await ir(page, "/conversaciones");
    await desarmar(page, "lista", `
      return [...document.querySelectorAll('a[href^="/conversaciones/"]')].slice(0, 6).map((el, i) => ({ el: el.closest("li") || el, id: "conv" + i }));
    `);
    await ctx.close();
  },
  async chat(browser) {
    const { ctx, page } = await contexto(browser, MOVIL, 1180);
    await ir(page, "/conversaciones/9a9be364-bd08-4063-8303-fa7c8490d97b");
    await desarmar(page, "chat", `
      const sup = document.querySelector(".chat-surface-flat");
      const out = [];
      [...sup.children].forEach((c, i) => {
        if (c.getBoundingClientRect().height < 2) return;
        if (c.matches(".group")) [...c.children].forEach((h, j) => out.push({ el: h, id: "m" + i + "-" + j }));
        else out.push({ el: c, id: "sep" + i });
      });
      return out;
    `);
    await ctx.close();
  },
  async lead(browser) {
    const { ctx, page } = await contexto(browser, MOVIL, 3300);
    await ir(page, "/leads/b5cb065a-2649-4173-a9e3-7cfa5a611bd3");
    await desarmar(page, "lead", `
      const out = [];
      const fila = (txt, id) => {
        const t = [...document.querySelectorAll("dt,span,p,div")].find((e) => e.childElementCount === 0 && e.textContent.trim() === txt);
        let el = t; while (el && el.parentElement && el.getBoundingClientRect().width < 300) el = el.parentElement;
        if (el) out.push({ el, id });
      };
      fila("Cómo llegó", "como-llego");
      const ols = [...document.querySelectorAll("ol")];
      const cadena = ols.find((o) => /Conversaci/.test(o.textContent) && o.children.length >= 5 && !o.className.includes("border-l"));
      if (cadena) [...cadena.children].forEach((li, i) => out.push({ el: li, id: "traza" + i }));
      const linea = ols.find((o) => o.className.includes("border-l"));
      if (linea) [...linea.children].forEach((li, i) => out.push({ el: li, id: "evento" + i }));
      return out;
    `);
    await ctx.close();
  },
  async cadena(browser) {
    const { ctx, page } = await contexto(browser, MOVIL, 3300);
    await ir(page, "/leads/efc550c5-0c54-4acd-8bd5-5d844844e78c");
    await desarmar(page, "cadena", `
      const out = [];
      const cadena = [...document.querySelectorAll("ol")].find((o) => /Conversaci/.test(o.textContent) && o.children.length >= 5 && !o.className.includes("border-l"));
      if (cadena) [...cadena.children].forEach((li, i) => {
        const ic = li.querySelector("svg");
        out.push({ el: li, id: "traza" + i });
      });
      return out;
    `);
    await ctx.close();
  },
  async turno(browser) {
    const { ctx, page } = await contexto(browser, MOVIL, 2100);
    await ir(page, "/agenda/turnos/b35fa4a4-9e18-4e0d-b497-b59b89d0af32");
    await desarmar(page, "turno", `
      const out = [];
      const bloque = (titulo, id) => {
        const t = [...document.querySelectorAll("h2,h3,p,span,div")].find((e) => e.childElementCount === 0 && e.textContent.trim().toUpperCase() === titulo);
        let el = t?.parentElement; while (el && el.parentElement && el.getBoundingClientRect().height < 60) el = el.parentElement;
        if (el) out.push({ el, id });
      };
      bloque("EQUIPO RESERVADO", "equipo");
      bloque("CIERRE", "cierre");
      const cadena = [...document.querySelectorAll("ol")].find((o) => /Conversaci|CONVERSACI/i.test(o.textContent) && o.children.length >= 5);
      if (cadena) [...cadena.children].forEach((li, i) => out.push({ el: li, id: "eslabon" + i }));
      return out;
    `);
    await ctx.close();
  },
  async pipeline(browser) {
    const { ctx, page } = await contexto(browser, ESCRITORIO);
    await ir(page, "/dashboard");
    await desarmar(page, "pipeline", `
      return [...document.querySelectorAll("[data-tarjeta-id]")].map((el, i) => ({ el, id: (el.getAttribute("data-columna") || "c") + "-" + i }));
    `);
    await ctx.close();
  },
  // --- Escritorio (para el 16:9) ---
  async "chat-esc"(browser) {
    const { ctx, page } = await contexto(browser, ESCRITORIO, 1000);
    await ir(page, "/conversaciones/9a9be364-bd08-4063-8303-fa7c8490d97b");
    await desarmar(page, "chat-esc", `
      const sup = document.querySelector(".chat-surface-flat");
      const out = [];
      [...sup.children].forEach((c, i) => {
        if (c.getBoundingClientRect().height < 2) return;
        if (c.matches(".group")) [...c.children].forEach((h, j) => out.push({ el: h, id: "m" + i + "-" + j }));
        else out.push({ el: c, id: "sep" + i });
      });
      const sofia = [...document.querySelectorAll('a[href^="/conversaciones/"]')].find((a) => /Sofía Quiroga/.test(a.textContent));
      if (sofia) out.push({ el: sofia.closest("li") || sofia, id: "sofia" });
      return out;
    `);
    await ctx.close();
  },
  async "lead-esc"(browser) {
    const { ctx, page } = await contexto(browser, ESCRITORIO, 2100);
    await ir(page, "/leads/b5cb065a-2649-4173-a9e3-7cfa5a611bd3");
    await desarmar(page, "lead-esc", `
      const out = [];
      const t = [...document.querySelectorAll("dt,span,p,div")].find((e) => e.childElementCount === 0 && e.textContent.trim() === "Cómo llegó");
      let el = t; while (el && el.parentElement && el.getBoundingClientRect().width < 500) el = el.parentElement;
      if (el) out.push({ el, id: "como-llego" });
      const ols = [...document.querySelectorAll("ol")];
      const cadena = ols.find((o) => /Conversaci/.test(o.textContent) && o.children.length >= 5 && !o.className.includes("border-l"));
      if (cadena) [...cadena.children].forEach((li, i) => out.push({ el: li, id: "traza" + i }));
      const linea = ols.find((o) => o.className.includes("border-l"));
      if (linea) [...linea.children].forEach((li, i) => out.push({ el: li, id: "evento" + i }));
      return out;
    `);
    await ctx.close();
  },
  async "cadena-esc"(browser) {
    const { ctx, page } = await contexto(browser, ESCRITORIO, 2100);
    await ir(page, "/leads/efc550c5-0c54-4acd-8bd5-5d844844e78c");
    await desarmar(page, "cadena-esc", `
      const cadena = [...document.querySelectorAll("ol")].find((o) => /Conversaci/.test(o.textContent) && o.children.length >= 5 && !o.className.includes("border-l"));
      return cadena ? [...cadena.children].map((li, i) => ({ el: li, id: "traza" + i })) : [];
    `);
    await ctx.close();
  },
  async escritorio(browser) {
    const { ctx, page } = await contexto(browser, ESCRITORIO);
    await ir(page, "/conversaciones/9a9be364-bd08-4063-8303-fa7c8490d97b");
    const dir = path.join(OUT, "escritorio");
    fs.mkdirSync(dir, { recursive: true });
    await page.screenshot({ path: path.join(dir, "chat.png") });
    await ir(page, "/leads?vista=tablero");
    await page.screenshot({ path: path.join(dir, "leads-tablero.png") });
    await ir(page, "/turnos");
    await page.screenshot({ path: path.join(dir, "agenda.png") });
    console.log("escritorio ok");
    await ctx.close();
  },
};

(async () => {
  const browser = await chromium.launch();
  for (const [n, f] of Object.entries(ESCENAS)) {
    if (SOLO && !SOLO.split(",").includes(n)) continue;
    try { await f(browser); } catch (e) { console.log("FALLO", n, e.message.split("\n")[0]); }
  }
  await browser.close();
})();
