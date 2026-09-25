"""Mediciones de scripts/verificar.mjs: mezcla renderizada, hoja de fotogramas y cámara.

Uso (lo llama verificar.mjs):
  python scripts/verificar.py audio  <entrada.json> <salida.json>
  python scripts/verificar.py hoja   <entrada.json> <salida.json>
  python scripts/verificar.py camara <entrada.json> <salida.json>

Cada modo escribe { "items": [{ "estado": ok|aviso|error|info, "texto", "t"? }], "datos": {...} }.
Niveles de audio: RMS en la banda que se oye en un celular (200 Hz–4 kHz), en dBFS, ventanas de 100 ms.
"""
import json
import re
import subprocess
import sys

import numpy as np
from scipy import signal

SR = 48000
VENTANA = SR // 10
BANDA = (200, 4000)
PISO = -120.0


def item(estado, texto, t=None):
    d = {"estado": estado, "texto": texto}
    if t is not None:
        d["t"] = round(float(t), 2)
    return d


def decodificar(ruta, canales=1):
    # aresample=async=1: sin los huecos de timestamps del concat (CLAUDE.md §7).
    crudo = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", ruta, "-map", "a:0", "-af", "aresample=async=1", "-ac", str(canales), "-ar", str(SR),
         "-f", "f32le", "-"],
        capture_output=True, check=True,
    ).stdout
    x = np.frombuffer(crudo, np.float32).copy()
    return x.reshape(-1, canales) if canales > 1 else x


def en_banda(x):
    sos = signal.butter(4, BANDA, btype="band", fs=SR, output="sos")
    return signal.sosfiltfilt(sos, x).astype(np.float32)


def niveles(x):
    n = len(x) // VENTANA
    p = np.mean(x[: n * VENTANA].reshape(n, VENTANA).astype(np.float64) ** 2, axis=1)
    return np.maximum(10 * np.log10(p + 1e-12), PISO)


def db_tramo(x, a, b):
    a, b = max(0, int(a * SR)), min(len(x), int(b * SR))
    if b <= a:
        return PISO
    return max(PISO, float(10 * np.log10(np.mean(x[a:b].astype(np.float64) ** 2) + 1e-12)))


def pico_db(x, a, b, ventana=SR // 40, q=100):
    """Percentil q (100 = máximo) de la potencia en ventanas deslizantes de 25 ms entre a y b s: mide transitorios
    (un pop de 50 ms se diluye en el RMS de 300 ms)."""
    a, b = max(0, int(a * SR)), min(len(x), int(b * SR))
    s = x[a:b].astype(np.float64)
    if len(s) < ventana:
        return PISO
    cs = np.concatenate([[0.0], np.cumsum(s * s)])
    p = (cs[ventana:] - cs[:-ventana]) / ventana
    return max(PISO, float(10 * np.log10(np.percentile(p, q) + 1e-12)))


def tramos(mascara, minimo_s, unir_s=0.0):
    """Rachas de ventanas True de al menos minimo_s: [(inicio_s, fin_s)]. Rachas separadas por huecos de hasta unir_s
    se cuentan como una sola (un SFX que interrumpe una música muda no la parte en dos)."""
    crudas, i, n = [], 0, len(mascara)
    while i < n:
        if mascara[i]:
            j = i
            while j < n and mascara[j]:
                j += 1
            crudas.append([i / 10, j / 10])
            i = j
        else:
            i += 1
    unidas = []
    for r in crudas:
        if unidas and r[0] - unidas[-1][1] <= unir_s + 1e-9:
            unidas[-1][1] = r[1]
        else:
            unidas.append(r)
    return [(a, b) for a, b in unidas if b - a >= minimo_s - 1e-9]


def alinear(mezcla, voz):
    """Desfase (muestras, + = la voz llega tarde en la mezcla) y ganancia de la voz dentro de la mezcla."""
    a, b = signal.resample_poly(mezcla, 1, 6), signal.resample_poly(voz, 1, 6)
    n = min(len(a), len(b))
    c = signal.correlate(a[:n], b[:n], mode="full", method="fft")
    lags = np.arange(-n + 1, n)
    sel = np.abs(lags) < 8000 // 2
    grueso = int(lags[sel][np.argmax(c[sel])]) * 6
    mejor = None
    seg = slice(0, min(len(mezcla), len(voz), SR * 20))
    for lag in range(grueso - 8, grueso + 9):
        m = mezcla[max(0, lag):]
        v = voz[max(0, -lag):]
        k = min(len(m), len(v), seg.stop)
        m, v = m[:k], v[:k]
        g = float(np.dot(m, v) / (np.dot(v, v) + 1e-12))
        e = float(np.mean((m - g * v) ** 2))
        if mejor is None or e < mejor[0]:
            mejor = (e, lag, g)
    return mejor[1], mejor[2]


def desplazar(x, lag, largo):
    """x corrido lag muestras (a la derecha si lag > 0), recortado/rellenado a largo."""
    y = np.zeros(largo, np.float32)
    if lag >= 0:
        k = min(largo - lag, len(x))
        if k > 0:
            y[lag:lag + k] = x[:k]
    else:
        k = min(largo, len(x) + lag)
        if k > 0:
            y[:k] = x[-lag:-lag + k]
    return y


def modo_audio(e):
    items, datos = [], {}
    mez_st = decodificar(e["mezcla"], 2)
    mez = mez_st.mean(axis=1)
    voz_cruda = decodificar(e["video"], 2).mean(axis=1)
    lag, g = alinear(mez, voz_cruda)
    voz = desplazar(voz_cruda * g, lag, len(mez))
    datos["desfase_ms"] = round(lag / SR * 1000, 2)
    datos["ganancia_voz_db"] = round(20 * np.log10(abs(g) + 1e-12), 2)
    if abs(lag) / SR > 0.02:
        items.append(item("aviso", f"la voz de la mezcla está corrida {lag / SR * 1000:.0f} ms respecto de video.mp4"))
    if abs(datos["ganancia_voz_db"]) > 0.5:
        items.append(item("aviso", f"la voz entra a la mezcla con {datos['ganancia_voz_db']:+.1f} dB (se esperaba 0)"))

    mez_b, voz_b = en_banda(mez), en_banda(voz)
    res_b = mez_b - voz_b
    L_mez, L_voz, L_res = niveles(mez_b), niveles(voz_b), niveles(res_b)
    n = len(L_res)
    t = np.arange(n) / 10

    # Ventanas con voz: dentro de una palabra (>= 50 %) y con nivel real.
    en_palabra = np.zeros(n)
    for a, b in e["words"]:
        for i in range(max(0, int(a * 10)), min(n, int(np.ceil(b * 10)))):
            en_palabra[i] += max(0.0, min(b, (i + 1) / 10) - max(a, i / 10)) * 10
    habla = (en_palabra >= 0.5) & (L_voz > -50)
    # Resto de voz que no se canceló: proyección del residuo sobre la voz en las ventanas con voz.
    fugas = []
    for i in np.flatnonzero(habla):
        v = voz_b[i * VENTANA:(i + 1) * VENTANA]
        r = res_b[i * VENTANA:(i + 1) * VENTANA]
        fugas.append(abs(float(np.dot(r, v) / (np.dot(v, v) + 1e-12))))
    fuga_db = float(20 * np.log10(np.median(fugas) + 1e-9)) if fugas else -60.0
    datos["voz_cancelada_db"] = round(-fuga_db, 1)
    items.append(item("info", f"voz alineada (desfase {datos['desfase_ms']} ms, ganancia {datos['ganancia_voz_db']:+.2f} dB); "
                              f"se cancela ~{-fuga_db:.0f} dB al restarla"))

    musica = e.get("musica")
    g_ven, cama_sig = np.zeros(n), None
    if musica:
        ganancia = np.array(musica["ganancia"], np.float64)  # por cuadro de 30 fps, sin el volumen fijo
        g_ven = np.array([ganancia[min(len(ganancia) - 1, i * 3):min(len(ganancia), i * 3 + 3)].mean() if i * 3 < len(ganancia) else 0
                          for i in range(n)])
        desde, fin = musica["desde"], musica["fin"]
        suena = (t >= desde + musica["fadeIn"]) & (t + 0.1 <= fin - musica["fadeOut"]) & (g_ven > 0.05)

        # (a) Música presente.
        umbral = np.where(habla, np.maximum(-60, L_voz + fuga_db + 6), -60)
        muda = suena & (L_res < umbral)
        huecos = tramos(muda, 1.0, unir_s=0.6)
        for a, b in huecos:
            items.append(item("error", f"(a) música muda de {a:.1f} a {b:.1f} s ({b - a:.1f} s) cuando debería sonar", a))
        if not huecos:
            items.append(item("ok", f"(a) la música suena de {desde:.2f} s al final, sin huecos de más de 1 s"))

        # (b) Uniformidad de la cama. Se proyecta el residuo sobre el tema tal como lo pone props (archivo desde inicioS,
        # con el ducking y los fundidos conocidos): mide la música sola, sin los SFX. Nivel = el de la cama sin ducking
        # (lo que suena en las pausas), por ventana de 3 s.
        ventanas = []
        fuente = en_banda(decodificar(musica["archivo"], 2).mean(axis=1)) * musica["volumen"]
        g_muestras = np.repeat(ganancia, SR // 30)[: len(res_b)]
        g_muestras = np.pad(g_muestras, (0, len(res_b) - len(g_muestras)))
        i0 = int(round(desde * SR))
        base = np.zeros(len(res_b), np.float32)
        tema = fuente[int(round(musica["inicioS"] * SR)):]
        k = min(len(base) - i0, len(tema))
        base[i0:i0 + k] = tema[:k]
        # Desfase del tema (priming del AAC, remuestreo): el que mejor correlaciona en los primeros 10 s.
        seg = slice(i0, min(len(res_b), i0 + 10 * SR))
        mejor_lag, mejor_c = 0, -1.0
        for lag in range(-2400, 2401, 24):
            x = desplazar(base, lag, len(base))[seg] * g_muestras[seg]
            c = float(np.dot(res_b[seg], x) / (np.linalg.norm(res_b[seg]) * np.linalg.norm(x) + 1e-12))
            if c > mejor_c:
                mejor_lag, mejor_c = lag, c
        esperada = desplazar(base, mejor_lag, len(base)) * g_muestras
        base = desplazar(base, mejor_lag, len(base))
        datos["musica_desfase_ms"] = round(mejor_lag / SR * 1000, 1)
        datos["musica_correlacion"] = round(mejor_c, 2)
        escalas = np.ones(len(res_b))
        a = desde + musica["fadeIn"]
        while a + 1.5 <= fin - musica["fadeOut"]:
            sa, sb = int(a * SR), min(len(res_b), int((a + 3) * SR))
            x = esperada[sa:sb]
            ex = float(np.dot(x, x))
            if ex > 0:
                escala = float(np.dot(res_b[sa:sb], x) / ex)
                escalas[sa:sb] = max(escala, 1e-4)
                nivel = db_tramo(base, a, a + 3) + 20 * np.log10(max(escala, 1e-4))
                ventanas.append({"t": round(a, 1), "db": round(nivel, 1), "escala_db": round(20 * np.log10(max(escala, 1e-4)), 1)})
            a += 3
        datos["musica_por_ventana"] = ventanas
        if mejor_c >= 0.2:
            # La cama tal como suena en la mezcla (tema × ducking × fundidos × escala medida cada 3 s): restada del
            # residuo deja los SFX solos (en estructura-nexora cancela la música hasta ~−90 dBFS).
            cama_sig = (esperada * escalas).astype(np.float32)
        if mejor_c < 0.2:
            items.append(item("aviso", f"(b) no se pudo seguir el tema dentro de la mezcla (correlación {mejor_c:.2f}): "
                                       "¿cambió musica.archivo o inicioS sin re-renderizar?"))
        elif ventanas:
            for v in ventanas:
                if v["escala_db"] < -10:
                    items.append(item("error", f"(a) la música suena {-v['escala_db']:.0f} dB más baja de lo que dice props "
                                               f"entre {v['t']:.1f} y {v['t'] + 3:.1f} s", v["t"]))
            dbs = [v["db"] for v in ventanas]
            dispersion = max(dbs) - min(dbs)
            alta = max(ventanas, key=lambda v: v["db"])
            baja = min(ventanas, key=lambda v: v["db"])
            texto = (f"(b) cama musical (sin ducking): dispersión {dispersion:.1f} dB entre ventanas de 3 s (más fuerte {alta['db']} "
                     f"dBFS en {alta['t']} s, más baja {baja['db']} dBFS en {baja['t']} s)")
            items.append(item("error" if dispersion > 8 else "aviso" if dispersion > 4 else "ok", texto, baja["t"] if dispersion > 4 else None))

        # (c) Margen de la voz sobre música+SFX mientras habla.
        sel = habla & suena
        if sel.sum() >= 10:
            margen = L_voz[sel] - L_res[sel]
            med = float(np.median(margen))
            datos["margen_voz_db"] = {"mediana": round(med, 1), "p10": round(float(np.percentile(margen, 10)), 1),
                                      "p90": round(float(np.percentile(margen, 90)), 1)}
            texto = (f"(c) música+SFX bajo la voz: mediana {med:.1f} dB (p10 {datos['margen_voz_db']['p10']}, "
                     f"p90 {datos['margen_voz_db']['p90']}); objetivo 9–15 dB")
            items.append(item("ok" if 9 <= med <= 15 else "aviso", texto))
    else:
        items.append(item("info", "la pieza no tiene música (props.musica)"))

    # (d) Enmascaramiento: residuo a menos de 2 dB de la voz mientras habla (sin las colas de palabra a más de 10 dB
    # por debajo de la voz típica: ahí cualquier cama "tapa" y no es lo que se oye como problema).
    voz_tipica = float(np.median(L_voz[habla])) if habla.any() else -30.0
    tapa = habla & (L_voz > voz_tipica - 10) & (L_res > L_voz - 2)
    # Al menos 200 ms: el golpe de un whoosh de transición en una sola ventana de 100 ms no tapa una palabra.
    zonas = tramos(tapa, 0.2)
    datos["enmascaramiento"] = [[a, b] for a, b in zonas]
    if zonas:
        lista = ", ".join(f"{a:.1f}–{b:.1f} s" for a, b in zonas[:12]) + (" …" if len(zonas) > 12 else "")
        items.append(item("aviso", f"(d) {len(zonas)} tramos donde música/SFX tapan la voz (a menos de 2 dB): {lista}", zonas[0][0]))
    else:
        items.append(item("ok", "(d) nada tapa la voz (música+SFX siempre más de 2 dB por debajo)"))

    # (e) Negro del hook: la cola (eco/reverb) tiene que sonar durante el negro.
    negro = e.get("negro")
    if negro:
        a, b = negro["inicio"], negro["fin"]
        tercio = (b - a) / 3
        partes = [db_tramo(res_b, a + k * tercio, a + (k + 1) * tercio) for k in range(3)]
        datos["negro_db_por_tercio"] = [round(p, 1) for p in partes]
        texto = f"(e) negro {a:.2f}–{b:.2f} s: nivel por tercio {', '.join(f'{p:.0f}' for p in partes)} dBFS"
        cola = e.get("cola")
        if not cola:
            items.append(item("error", texto + " — props no tiene la cola/eco del negro (sfx con archivo en la última palabra "
                                               "del hook): solo suena el boom", a))
        elif max(partes) < -60:
            items.append(item("error", texto + " — el negro está mudo: no se oye la cola", a))
        elif partes[2] < -60:
            items.append(item("aviso", texto + " — la cola se apaga antes de que vuelva la imagen", a + 2 * tercio))
        else:
            items.append(item("ok", texto))
        if cola:
            c = en_banda(decodificar(cola["archivo"])) * cola["volumen"]
            i0, i1 = int(a * SR), int(b * SR)
            r = res_b[i0:i1]
            corr, esperado = -1.0, None
            for d in range(-960, 961, 48):  # ±20 ms
                x_full = desplazar(c, int(round(cola["t"] * SR)) + d, len(res_b))
                x = x_full[i0:i1]
                cc = float(np.dot(r, x) / (np.linalg.norm(r) * np.linalg.norm(x) + 1e-12))
                if cc > corr:
                    corr, esperado = cc, x_full
            datos["cola_correlacion"] = round(corr, 2)
            nivel_cola = db_tramo(esperado, a, b)
            if corr < 0.2:
                items.append(item("error", f"(e) la cola ({cola['nombre']}) no aparece en el negro de la mezcla (correlación {corr:.2f})", a))
            else:
                items.append(item("ok", f"(e) la cola ({cola['nombre']}) suena en el negro: {nivel_cola:.0f} dBFS, correlación {corr:.2f}"))
    else:
        items.append(item("info", "(e) la pieza no tiene negro en el hook (props.pausas)"))

    # (f) Pico y sonoridad (informativo: el master normaliza después).
    pico = float(20 * np.log10(np.max(np.abs(mez_st)) + 1e-12))
    datos["pico_dbfs"] = round(pico, 2)
    salida = subprocess.run(["ffmpeg", "-nostats", "-hide_banner", "-i", e["mezcla"], "-af", "ebur128=peak=true", "-f", "null", "-"],
                            capture_output=True, text=True).stderr
    resumen = salida[salida.rfind("Summary:"):]
    m_i = re.search(r"I:\s+(-?[\d.]+) LUFS", resumen)
    m_tp = re.search(r"True peak:\s+Peak:\s+(-?[\d.]+|-inf) dBFS", resumen)
    datos["lufs"] = float(m_i.group(1)) if m_i else None
    datos["true_peak_dbfs"] = float(m_tp.group(1)) if m_tp and m_tp.group(1) != "-inf" else None
    texto = f"(f) pico {pico:.1f} dBFS, true peak {datos['true_peak_dbfs']} dBTP, sonoridad integrada {datos['lufs']} LUFS"
    items.append(item("error" if pico >= 0 else "aviso" if pico > -1 else "ok",
                      texto + (" — satura" if pico >= 0 else " — pasa de −1 dBFS" if pico > -1 else "")))

    # (g) Cada SFX de props y cada entrada de b-roll/escena: ¿se oye? SFX solo = residuo menos la cama tal como suena
    # (cama_sig); se mide su pico de 25 ms (es un transitorio) contra la voz (RMS del tramo) y contra la cama (p90 de sus
    # picos de 25 ms en ±1 s: no depende de si justo cae un golpe de la música dentro del tramo).
    sfx_sig = res_b - cama_sig if cama_sig is not None else res_b
    eventos = []
    for ev in e["eventos"]:
        tt = ev["t"]
        if ev["tipo"] == "sube":  # riser: el golpe es el final
            va, vb = tt - 1.0, tt
        elif ev["tipo"] == "cola":
            va, vb = tt + 0.2, tt + 1.0
        else:
            va, vb = tt - 0.05, tt + 0.25
        sfx_db = pico_db(sfx_sig, va, vb)
        cama = pico_db(cama_sig, tt - 1, tt + 1, q=90) if cama_sig is not None else PISO
        voz_local = db_tramo(voz_b, va, vb)
        voz_ref = voz_local if voz_local > -50 else PISO
        eventos.append({"nombre": ev["nombre"], "t": round(tt, 2), "sfx_db": round(sfx_db, 1), "cama_db": round(cama, 1),
                        "voz_db": round(voz_ref, 1)})
        if sfx_db < cama - 3:
            items.append(item("aviso", f"(g) {ev['nombre']} en {tt:.2f} s queda bajo la cama musical: pico {sfx_db:.0f} dBFS, "
                                       f"la música {cama:.0f}", tt))
        elif sfx_db < voz_ref - 20:
            items.append(item("aviso", f"(g) {ev['nombre']} en {tt:.2f} s casi no se oye: pico {sfx_db:.0f} dBFS, "
                                       f"{voz_ref - sfx_db:.0f} dB bajo la voz", tt))
    datos["eventos"] = eventos
    if eventos and not any(i["texto"].startswith("(g)") for i in items):
        items.append(item("ok", f"(g) los {len(eventos)} SFX/entradas medidos se oyen (ninguno más de 3 dB bajo la música "
                                "ni más de 20 dB bajo la voz)"))
    return {"items": items, "datos": datos}


def modo_hoja(e):
    from PIL import Image, ImageDraw, ImageFont, ImageStat

    items, fichas = [], []
    for s in e["stills"]:
        try:
            im = Image.open(s["archivo"]).convert("RGB")
        except OSError:
            items.append(item("error", f"no se generó el fotograma {s['frame']} ({s['etiqueta']})", s["t"]))
            continue
        luz = ImageStat.Stat(im.convert("L")).mean[0]
        s["luz"] = round(luz, 1)
        if s.get("esperado") == "negro" and luz > 8:
            items.append(item("error", f"{s['etiqueta']} (cuadro {s['frame']}) debería ser negro y tiene luz media {luz:.0f}", s["t"]))
        elif s.get("esperado") == "imagen" and luz < 12:
            items.append(item("error", f"{s['etiqueta']} (cuadro {s['frame']}) está negro (luz media {luz:.0f})", s["t"]))
        elif s.get("esperado") is None and luz < 4:
            items.append(item("aviso", f"{s['etiqueta']} (cuadro {s['frame']}) sale casi negro (luz media {luz:.0f})", s["t"]))
        fichas.append((s, im))
    if not fichas:
        return {"items": items + [item("error", "no hay fotogramas para la hoja")], "datos": {}}

    ancho, alto, pie, cols = 270, 480, 46, 6
    filas = (len(fichas) + cols - 1) // cols
    hoja = Image.new("RGB", (cols * ancho + (cols + 1) * 8, filas * (alto + pie) + (filas + 1) * 8), (24, 24, 24))
    try:
        fuente = ImageFont.truetype("arial.ttf", 15)
        chica = ImageFont.truetype("arial.ttf", 13)
    except OSError:
        fuente = chica = ImageFont.load_default()
    d = ImageDraw.Draw(hoja)
    for k, (s, im) in enumerate(fichas):
        x, y = 8 + (k % cols) * (ancho + 8), 8 + (k // cols) * (alto + pie + 8)
        hoja.paste(im.resize((ancho, alto)), (x, y))
        d.text((x + 4, y + alto + 4), s["etiqueta"][:34], fill=(240, 240, 240), font=fuente)
        d.text((x + 4, y + alto + 24), f"{s['t']:.2f} s · cuadro {s['frame']}", fill=(160, 160, 160), font=chica)
    hoja.save(e["salida"], quality=85)
    if not any(i["estado"] in ("error", "aviso") for i in items):
        items.append(item("ok", f"{len(fichas)} fotogramas: el negro es negro, la imagen vuelve y ninguno sale vacío"))
    return {"items": items, "datos": {"stills": [{k: s[k] for k in ("frame", "t", "etiqueta", "luz")} for s, _ in fichas]}}


def metricas_camara(ruta, ancho_px=1080):
    c = json.load(open(ruta, encoding="utf-8"))["cuadros"]
    ojos = [(q["cara"][0], q["cara"][1]) if q["cara"] else None for q in c]
    xs = np.array([o[0] for o in ojos if o])
    ys = np.array([o[1] for o in ojos if o])
    pasos = []
    for k in range(1, len(c)):
        a, b = ojos[k - 1], ojos[k]
        # Sin cortes de plano: salto de imagen grande o salto de ojos imposible.
        if a and b and c[k]["dif"] < 25 and abs(b[1] - a[1]) < 0.05 and abs(b[0] - a[0]) < 0.05:
            pasos.append(np.hypot(b[0] - a[0], (b[1] - a[1]) * 16 / 9) * ancho_px)
    p = lambda v, q: round(float(np.percentile(v, q)), 4) if len(v) else None
    return {
        "cuadros": len(c), "con_cara": int(len(xs)),
        "ojos_x": {"p5": p(xs, 5), "p50": p(xs, 50), "p95": p(xs, 95)},
        "ojos_y": {"p5": p(ys, 5), "p50": p(ys, 50), "p95": p(ys, 95)},
        "temblor_px": round(float(np.median(pasos)), 2) if pasos else None,
    }


def modo_camara(e):
    items = []
    m = metricas_camara(e["analisis"])
    ref = metricas_camara(e["referencia"]) if e.get("referencia") else None
    # Números de CLAUDE.md §5 si no está el análisis de la referencia.
    ref_y = (ref["ojos_y"]["p95"] - ref["ojos_y"]["p5"]) if ref else 0.035
    ref_temblor = ref["temblor_px"] if ref else 2.0
    if m["con_cara"] < m["cuadros"] * 0.8:
        items.append(item("aviso", f"cara detectada en {m['con_cara']} de {m['cuadros']} cuadros"))
    if m["con_cara"] == 0:
        return {"items": items + [item("error", "no se detectó la cara en el tramo")], "datos": {"pieza": m, "referencia": ref}}
    x50, y50 = m["ojos_x"]["p50"], m["ojos_y"]["p50"]
    disp_y = m["ojos_y"]["p95"] - m["ojos_y"]["p5"]
    disp_x = m["ojos_x"]["p95"] - m["ojos_x"]["p5"]
    obj = e["objetivo"]
    items.append(item("ok" if abs(x50 - obj["x"]) <= 0.02 and abs(y50 - obj["y"]) <= 0.03 else "aviso",
                      f"ojos en x {x50:.3f}, y {y50:.3f} (mediana); objetivo de CAMARA x {obj['x']}, y {obj['y']}"))
    items.append(item("ok" if disp_y <= 2 * ref_y else "aviso",
                      f"dispersión de los ojos (p5–p95): y {disp_y * 100:.1f} %, x {disp_x * 100:.1f} % del cuadro; "
                      f"referencia y {ref_y * 100:.1f} %"))
    temblor = m["temblor_px"]
    items.append(item("ok" if temblor is not None and temblor <= 2 * ref_temblor else "aviso",
                      f"temblor cuadro a cuadro {temblor} px (mediana, en 1080 de ancho); referencia {ref_temblor} px"))
    return {"items": items, "datos": {"pieza": m, "referencia": ref}}


if __name__ == "__main__":
    modo, entrada, salida = sys.argv[1], sys.argv[2], sys.argv[3]
    with open(entrada, encoding="utf-8") as fh:
        e = json.load(fh)
    r = {"audio": modo_audio, "hoja": modo_hoja, "camara": modo_camara}[modo](e)
    with open(salida, "w", encoding="utf-8") as fh:
        json.dump(r, fh, ensure_ascii=False, indent=1)
