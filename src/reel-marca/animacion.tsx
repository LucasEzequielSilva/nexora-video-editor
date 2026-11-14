import React, { useId } from "react";
import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CURVA, RESORTE } from "./movimiento";
import { Agenda, Chat, TAM, Telefono } from "./objetos";
import { Contador, Cursor, Entra, Fondo, Palabras, Pildora, coloresBeat, conAlfa, contraste, textoSobre, useFuentes } from "./primitivas";
import { ALTO_ANIM, ANCHO_ANIM, FPS, type Beat, type Brief, type Marca, type TipoSonido, type Transicion } from "./tema";
import { CLIC_F, DUR_TRANSICION, adelantoDe, duracionAnimF, eventosSonido, inicioBeatF, limitesF, transicionDe } from "./tiempos";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Margen lateral y separación texto–objeto de los beats con objeto. */
const PAD = 140;
const GAP = 110;
const ESCALA_TELEFONO = 0.86;

type Rect = { x: number; y: number; w: number; h: number; r: number };
const RECT_CENTRO: Rect = { x: 360, y: 240, w: 1200, h: 600, r: 32 };

/** Dónde queda el objeto protagonista de un beat: de ahí sale el zoom y desde ahí crece el `expande`. */
const rectObjeto = (b: Beat): Rect => {
  const enLado = (w: number, h: number, r: number, conTexto: boolean, izq: boolean): Rect => ({
    x: !conTexto ? (ANCHO_ANIM - w) / 2 : izq ? PAD : ANCHO_ANIM - PAD - w,
    y: (ALTO_ANIM - h) / 2,
    w,
    h,
    r,
  });
  if (b.tipo === "telefono") {
    const caja = enLado(TAM.telefono.w, TAM.telefono.h, 0, true, b.lado === "izq");
    const w = TAM.telefono.w * ESCALA_TELEFONO;
    const h = TAM.telefono.h * ESCALA_TELEFONO;
    return { x: caja.x + (TAM.telefono.w - w) / 2, y: (ALTO_ANIM - h) / 2, w, h, r: TAM.telefono.radio * ESCALA_TELEFONO };
  }
  if (b.tipo === "chat") return enLado(TAM.chat.w, TAM.chat.h, TAM.chat.radio, Boolean(b.texto), false);
  if (b.tipo === "agenda") return enLado(TAM.agenda.w, TAM.agenda.h, TAM.agenda.radio, Boolean(b.texto), false);
  return RECT_CENTRO;
};

const Centro: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: "0 180px" }}>{children}</AbsoluteFill>
);

/** Texto a un lado y el objeto (teléfono, chat, agenda) al otro. */
const Lado: React.FC<{ texto?: React.ReactNode; objeto: React.ReactNode; textoDer?: boolean }> = ({ texto, objeto, textoDer = false }) => (
  <AbsoluteFill
    style={{
      flexDirection: textoDer ? "row-reverse" : "row",
      alignItems: "center",
      justifyContent: "center",
      gap: GAP,
      padding: `0 ${PAD}px`,
    }}
  >
    {texto ? <div style={{ flex: 1 }}>{texto}</div> : null}
    {objeto}
  </AbsoluteFill>
);

/** Logo tipográfico de respaldo: el nombre se descubre de izquierda a derecha y el punto cae al final. */
const Logotipo: React.FC<{ marca: Marca; color: string; punto: string; revela: number; escalaPunto: number }> = ({
  marca,
  color,
  punto,
  revela,
  escalaPunto,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "baseline",
      fontFamily: marca.fuenteTitulo,
      fontWeight: 900,
      fontSize: 200,
      letterSpacing: -8,
      lineHeight: 1,
      color,
    }}
  >
    <span style={{ display: "inline-block", padding: "0.06em 0.02em", clipPath: `inset(0 ${(1 - revela) * 100}% 0 0)` }}>{marca.nombre}</span>
    <span style={{ width: 46, height: 46, borderRadius: "50%", background: punto, marginLeft: 8, transform: `scale(${escalaPunto})` }} />
  </div>
);

const LogoVista: React.FC<{ beat: Extract<Beat, { tipo: "logo" }>; brief: Brief }> = ({ beat, brief }) => {
  const marca = brief.marca;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = coloresBeat(marca, beat.fondo);
  const sobreAcento = beat.fondo === "acento";
  const fondoBoton = sobreAcento ? c.tinta : marca.acento;
  const llega = spring({ frame, fps, config: RESORTE.pesado });
  const revela = interpolate(frame, [2, 18], [0, 1], { ...clamp, easing: CURVA.revela });
  const punto = spring({ frame: frame - 14, fps, config: RESORTE.acomoda });
  const tag = interpolate(frame, [18, 32], [0, 1], { ...clamp, easing: CURVA.entra });
  const btn = interpolate(frame, [30, 42], [0, 1], { ...clamp, easing: CURVA.entra });
  // El cursor aparece por corte y llega frenando en arco (x e y con curvas distintas).
  const viajeX = interpolate(frame, [44, CLIC_F - 4], [0, 1], { ...clamp, easing: CURVA.entra });
  const viajeY = interpolate(frame, [44, CLIC_F - 4], [0, 1], { ...clamp, easing: CURVA.mueve });
  // El clic: baja en 3 cuadros desde el cuadro en que suena y vuelve con resorte.
  const baja = interpolate(frame, [CLIC_F, CLIC_F + 3], [0, 1], { ...clamp, easing: Easing.quad });
  const sube = spring({ frame: frame - CLIC_F - 3, fps, config: RESORTE.hoja });
  const presion = frame < CLIC_F ? 0 : Math.max(0, baja - sube);
  const onda = interpolate(frame, [CLIC_F, CLIC_F + 18], [0, 1], { ...clamp, easing: CURVA.entra });
  return (
    <Centro>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <div style={{ transform: `scale(${0.94 + 0.06 * llega})`, opacity: Math.min(1, llega * 2) }}>
          {marca.logo ? (
            <div style={{ clipPath: `inset(0 ${(1 - revela) * 100}% 0 0)` }}>
              <Img src={staticFile(marca.logo)} style={{ height: 210 }} />
            </div>
          ) : (
            <Logotipo
              marca={marca}
              color={c.tinta}
              punto={sobreAcento ? c.tinta : marca.acento}
              revela={revela}
              escalaPunto={Math.max(0, punto)}
            />
          )}
        </div>
        <div style={{ fontFamily: marca.fuenteTexto, fontSize: 54, fontWeight: 500, color: c.suave, opacity: tag, transform: `translateY(${(1 - tag) * 14}px)` }}>
          {marca.tagline}
        </div>
        {beat.boton ? (
          <div style={{ position: "relative", marginTop: 18, opacity: btn, transform: `translateY(${(1 - btn) * 18}px)` }}>
            <div
              style={{
                padding: "26px 60px",
                borderRadius: 999,
                background: fondoBoton,
                color: textoSobre(fondoBoton, marca.tinta),
                fontFamily: marca.fuenteTexto,
                fontWeight: 700,
                fontSize: 44,
                boxShadow: `0 ${2 - presion}px ${4 - 2 * presion}px rgba(0,0,0,0.12), 0 ${12 - 6 * presion}px ${24 - 12 * presion}px rgba(0,0,0,0.08)`,
                transform: `scale(${1 - 0.04 * presion})`,
              }}
            >
              {beat.boton}
            </div>
            {frame >= CLIC_F ? (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 999,
                  border: `3px solid ${conAlfa(c.tinta, 0.45)}`,
                  transform: `scale(${1 + 0.25 * onda})`,
                  opacity: 1 - onda,
                }}
              />
            ) : null}
            {frame >= 44 ? <Cursor x={376 + (1 - viajeX) * 460} y={46 + (1 - viajeY) * 320} escala={1 - 0.1 * presion} /> : null}
          </div>
        ) : null}
      </div>
    </Centro>
  );
};

const BeatVista: React.FC<{ beat: Beat; brief: Brief; durF: number }> = ({ beat, brief, durF }) => {
  const marca = brief.marca;
  const fondo = beat.fondo;
  const c = coloresBeat(marca, fondo);
  const frame = useCurrentFrame();

  if (beat.tipo === "frase") {
    return (
      <Centro>
        <Palabras texto={beat.texto} marca={marca} fondo={fondo} tamano={beat.tamano ?? 84} />
      </Centro>
    );
  }

  if (beat.tipo === "heroe") {
    // Golpe: llega desde 1,4 con desenfoque y frena en seco (power4.out), sin rebote. El remate suena en HEROE_GOLPE_F.
    const golpe = interpolate(frame, [4, 18], [0, 1], { ...clamp, easing: Easing.out(Easing.poly(5)) });
    const aparece = interpolate(frame, [4, 7], [0, 1], clamp);
    return (
      <Centro>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
          <div
            style={{
              fontFamily: marca.fuenteTitulo,
              fontWeight: 900,
              fontSize: Math.round(300 * Math.min(1, 8 / Math.max(beat.palabra.length, 1))),
              lineHeight: 1,
              letterSpacing: -12,
              whiteSpace: "nowrap",
              textAlign: "center",
              color: c.tinta,
              opacity: aparece,
              transform: `scale(${1.4 - 0.4 * golpe})`,
              filter: golpe < 1 ? `blur(${(1 - golpe) * 16}px)` : undefined,
            }}
          >
            {beat.palabra}
          </div>
          <Entra retrasoF={16} dist={20}>
            <div style={{ fontFamily: marca.fuenteTexto, fontSize: 56, fontWeight: 500, color: c.suave }}>{beat.pie}</div>
          </Entra>
        </div>
      </Centro>
    );
  }

  if (beat.tipo === "numero") {
    const ley = interpolate(frame, [30, 46], [0, 1], { ...clamp, easing: CURVA.entra });
    return (
      <Centro>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          {beat.etiqueta ? (
            <Entra dist={20}>
              <div style={{ fontFamily: marca.fuenteTexto, fontWeight: 500, fontSize: 46, color: c.suave }}>{beat.etiqueta}</div>
            </Entra>
          ) : null}
          <Contador valor={beat.valor} decimales={beat.decimales} prefijo={beat.prefijo} sufijo={beat.sufijo} marca={marca} fondo={fondo} />
          <div style={{ fontFamily: marca.fuenteTexto, fontSize: 52, fontWeight: 500, color: c.suave, opacity: ley, transform: `translateY(${(1 - ley) * 14}px)` }}>
            {beat.leyenda}
          </div>
        </div>
      </Centro>
    );
  }

  if (beat.tipo === "lista") {
    return (
      <Centro>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 52 }}>
          <Palabras texto={beat.titulo} marca={marca} fondo={fondo} tamano={76} />
          <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "flex-start" }}>
            {beat.items.map((it, i) => (
              <Pildora key={it} texto={it} marca={marca} fondo={fondo} retrasoF={26 + i * 6} />
            ))}
          </div>
        </div>
      </Centro>
    );
  }

  if (beat.tipo === "telefono") {
    const der = (beat.lado ?? "der") === "der";
    return (
      <Lado
        textoDer={!der}
        texto={<Palabras texto={beat.texto} marca={marca} fondo={fondo} tamano={80} align="left" />}
        objeto={
          <div style={{ transform: `scale(${ESCALA_TELEFONO})` }}>
            <Telefono marca={marca} lineas={beat.lineas} hora={beat.hora} fecha={beat.fecha} lado={beat.lado} />
          </div>
        }
      />
    );
  }

  if (beat.tipo === "chat") {
    return (
      <Lado
        texto={beat.texto ? <Palabras texto={beat.texto} marca={marca} fondo={fondo} tamano={76} align="left" /> : undefined}
        objeto={<Chat marca={marca} mensajes={beat.mensajes} durF={durF} oscuro={c.oscuro} contacto={beat.contacto} hora={beat.hora} />}
      />
    );
  }

  if (beat.tipo === "agenda") {
    return (
      <Lado
        texto={beat.texto ? <Palabras texto={beat.texto} marca={marca} fondo={fondo} tamano={76} align="left" /> : undefined}
        objeto={
          <Agenda
            marca={marca}
            dias={beat.dias}
            turnos={beat.turnos}
            mes={beat.mes}
            desdeHora={beat.desdeHora}
            hastaHora={beat.hastaHora}
            oscuro={c.oscuro}
          />
        }
      />
    );
  }

  return <LogoVista beat={beat} brief={brief} />;
};

/** Desenfoque solo horizontal (estela de un movimiento lateral), como filtro SVG. */
const DesenfoqueX: React.FC<{ id: string; px: number }> = ({ id, px }) => (
  <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
    <filter id={id} x="-15%" y="-5%" width="130%" height="110%">
      <feGaussianBlur stdDeviation={`${px} 0`} />
    </filter>
  </svg>
);

/**
 * Contenido del beat. Su cuadro 0 es `adelanto` cuadros antes del corte: entra mientras sale el anterior.
 * Entra según su propia transición y sale según la del beat siguiente (`salida`): lo que sale va con
 * `CURVA.sale` y desenfoque, lo que entra con `CURVA.entra` y el desenfoque se limpia. Las dos velocidades se tocan en el corte.
 */
const Contenido: React.FC<{ brief: Brief; beat: Beat; durF: number; adelanto: number; salida: Transicion | null }> = ({
  brief,
  beat,
  durF,
  adelanto,
  salida,
}) => {
  const frame = useCurrentFrame();
  const id = `bx${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const entrada = transicionDe(beat);
  const fin = durF + adelanto;
  const d = salida ? DUR_TRANSICION[salida] : 0;
  const lineal = d > 0 ? interpolate(frame, [fin - d, fin], [0, 1], clamp) : 0;
  const acelera = d > 0 ? interpolate(frame, [fin - d, fin], [0, 1], { ...clamp, easing: CURVA.sale }) : 0;
  const llega = interpolate(frame, [0, 14], [0, 1], { ...clamp, easing: CURVA.entra });
  const conTransicion = adelanto > 0;

  let escala = interpolate(frame, [0, fin], [1, 1.03], clamp);
  let x = 0;
  let opacidad = 1;
  let desenfoque = 0;
  let desenfoqueX = 0;
  if (conTransicion && entrada === "fundido") {
    escala *= 0.97 + 0.03 * llega;
    desenfoque += (1 - llega) * 8;
  }
  if (conTransicion && entrada === "zoom") {
    escala *= 1.1 - 0.1 * llega;
    desenfoque += (1 - llega) * 8;
  }
  if (conTransicion && entrada === "empuje") {
    x += (1 - llega) * 160;
    desenfoqueX += (1 - llega) * 18;
  }
  if (salida === "fundido") {
    opacidad *= 1 - lineal;
    desenfoque += lineal * 10;
    escala *= 1 + 0.03 * lineal;
  }
  if (salida === "empuje") {
    // Se va con el mismo recorrido y la misma curva que la capa que entra: los dos bordes viajan juntos.
    const empuja = d > 0 ? interpolate(frame, [fin - d, fin], [0, 1], { ...clamp, easing: CURVA.mueve }) : 0;
    x -= empuja * ANCHO_ANIM;
    desenfoqueX += acelera * 26;
  }
  if (salida === "zoom") {
    escala *= 1 + 1.5 * acelera;
    desenfoque += acelera * 12;
    opacidad *= interpolate(acelera, [0.55, 1], [1, 0], clamp);
  }
  if (salida === "expande") escala *= 1 - 0.04 * lineal;

  const foco = rectObjeto(beat);
  const filtros = [desenfoqueX > 0.3 ? `url(#${id})` : "", desenfoque > 0.3 ? `blur(${desenfoque}px)` : ""].filter(Boolean).join(" ");
  return (
    <>
      {desenfoqueX > 0.3 ? <DesenfoqueX id={id} px={desenfoqueX} /> : null}
      <AbsoluteFill
        style={{
          opacity: opacidad,
          filter: filtros || undefined,
          transform: `translateX(${x}px) scale(${escala})`,
          transformOrigin: salida === "zoom" ? `${foco.x + foco.w / 2}px ${foco.y + foco.h / 2}px` : "50% 50%",
        }}
      >
        <BeatVista beat={beat} brief={brief} durF={durF} />
      </AbsoluteFill>
    </>
  );
};

/** Capa de un beat: el fondo nuevo entra encima del anterior según la transición y el contenido arranca un poco antes del corte. */
const CapaBeat: React.FC<{
  brief: Brief;
  beat: Beat;
  durF: number;
  entraF: number;
  adelanto: number;
  salida: Transicion | null;
  previo: Rect | null;
  fondoPrevio: string | null;
}> = ({ brief, beat, durF, entraF, adelanto, salida, previo, fondoPrevio }) => {
  const frame = useCurrentFrame();
  const t = transicionDe(beat);
  const { bg } = coloresBeat(brief.marca, beat.fondo);
  const lineal = entraF > 0 ? interpolate(frame, [0, entraF], [0, 1], clamp) : 1;
  const curva = entraF > 0 ? interpolate(frame, [0, entraF], [0, 1], { ...clamp, easing: CURVA.mueve }) : 1;
  const circulo = (cx: number, cy: number): string => {
    const r = Math.hypot(Math.max(cx, ANCHO_ANIM - cx), Math.max(cy, ALTO_ANIM - cy)) * curva;
    return `circle(${r}px at ${cx}px ${cy}px)`;
  };
  // Entre un fondo claro y uno oscuro el fundido pasa por un gris sucio: ahí el fondo nuevo entra con un círculo.
  const choca = fondoPrevio !== null && contraste(fondoPrevio, bg) >= 2;
  const capa: React.CSSProperties = {};
  if (t === "fundido") {
    if (choca && curva < 1) capa.clipPath = circulo(ANCHO_ANIM / 2, ALTO_ANIM / 2);
    else if (!choca) capa.opacity = lineal;
  }
  if (t === "zoom" && curva < 1) {
    const f = previo ?? RECT_CENTRO;
    capa.clipPath = circulo(f.x + f.w / 2, f.y + f.h / 2);
  }
  if (t === "empuje") capa.transform = `translateX(${(1 - curva) * ANCHO_ANIM}px)`;
  if (t === "expande" && previo && curva < 1) {
    const q = 1 - curva;
    capa.clipPath = `inset(${previo.y * q}px ${(ANCHO_ANIM - previo.x - previo.w) * q}px ${(ALTO_ANIM - previo.y - previo.h) * q}px ${previo.x * q}px round ${previo.r * q}px)`;
  }
  return (
    <AbsoluteFill style={capa}>
      <Fondo marca={brief.marca} fondo={beat.fondo} />
      <Sequence from={entraF - adelanto} durationInFrames={durF + adelanto} layout="none">
        <Contenido brief={brief} beat={beat} durF={durF} adelanto={adelanto} salida={salida} />
      </Sequence>
    </AbsoluteFill>
  );
};

const DUCK: Record<TipoSonido, number> = {
  transicion: 0.4,
  notificacion: 0.3,
  burbuja: 0.25,
  turno: 0.15,
  numero: 0.5,
  remate: 0.5,
  clic: 0.3,
  logo: 0.45,
};

/** Ataque de 3 cuadros antes del golpe, sostén de 3 y suelta en 12. */
const envolvente = (d: number): number => (d < -3 ? 0 : d < 0 ? (d + 3) / 3 : d < 3 ? 1 : d < 15 ? 1 - (d - 3) / 12 : 0);

const AudioPieza: React.FC<{ brief: Brief }> = ({ brief }) => {
  const total = duracionAnimF(brief);
  const musica = brief.audio?.musica;
  const auto = brief.audio?.auto ?? {};
  const profundidad = brief.audio?.duck ?? 1;
  const golpes = eventosSonido(brief).filter((e) => auto[e.tipo]);
  const bajada = (f: number): number => golpes.reduce((v, e) => v * (1 - DUCK[e.tipo] * profundidad * envolvente(f - e.atF)), 1);
  return (
    <>
      {musica ? (
        <Audio
          src={staticFile(musica.archivo)}
          trimBefore={musica.desdeS ? Math.round(musica.desdeS * FPS) : undefined}
          volume={(f) => musica.volumen * interpolate(f, [0, 8, total - 42, total - 4], [0, 1, 1, 0], clamp) * bajada(f)}
        />
      ) : null}
      {eventosSonido(brief).map((e, i) => {
        const cfg = auto[e.tipo];
        if (!cfg) return null;
        const desde = Math.max(0, e.atF - Math.round((cfg.golpeS ?? 0) * FPS));
        return (
          <Sequence key={`a${i}`} from={desde} layout="none">
            <Audio src={staticFile(cfg.archivo)} volume={cfg.volumen} />
          </Sequence>
        );
      })}
      {(brief.audio?.sfx ?? []).map((s, i) => {
        const desde = Math.max(0, inicioBeatF(brief, s.beat) + Math.round(((s.offsetS ?? 0) - (s.golpeS ?? 0)) * FPS));
        return (
          <Sequence key={`s${i}`} from={desde} layout="none">
            <Audio src={staticFile(s.archivo)} volume={s.volumen} />
          </Sequence>
        );
      })}
    </>
  );
};

export const AnimacionMarca: React.FC<{ brief: Brief }> = ({ brief }) => {
  useFuentes(brief.fuentes);
  const lim = limitesF(brief);
  return (
    <AbsoluteFill style={{ background: brief.marca.fondo }}>
      {brief.beats.map((beat, i) => {
        const inicio = lim[i] ?? 0;
        const fin = lim[i + 1] ?? inicio;
        const entraF = i > 0 ? DUR_TRANSICION[transicionDe(beat)] : 0;
        const siguiente = brief.beats[i + 1];
        const anterior = i > 0 ? brief.beats[i - 1] : undefined;
        return (
          <Sequence key={i} from={inicio - entraF} durationInFrames={fin - inicio + entraF} layout="none">
            <CapaBeat
              brief={brief}
              beat={beat}
              durF={fin - inicio}
              entraF={entraF}
              adelanto={adelantoDe(beat, i)}
              salida={siguiente ? transicionDe(siguiente) : null}
              previo={anterior ? rectObjeto(anterior) : null}
              fondoPrevio={anterior ? coloresBeat(brief.marca, anterior.fondo).bg : null}
            />
          </Sequence>
        );
      })}
      <AudioPieza brief={brief} />
    </AbsoluteFill>
  );
};
