import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Chat, Telefono } from "./objetos";
import { Anillos, Contador, Cursor, Destello, Entra, Fondo, Palabras, Pildora, RelojContext, coloresBeat, conAlfa, useFuentes } from "./primitivas";
import { FPS, SOLAPE_F, type Beat, type Brief, type TipoSonido } from "./tema";
import { CLIC_F, NUMERO_ATERRIZA_F, duracionAnimF, eventosSonido, inicioBeatF, limitesF } from "./tiempos";

const Centro: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: "0 180px" }}>{children}</AbsoluteFill>
);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const textoDegrade = (c1: string, c2: string): React.CSSProperties => ({
  backgroundImage: `linear-gradient(100deg, ${c1}, ${c2})`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
});

const LogoVista: React.FC<{ beat: Extract<Beat, { tipo: "logo" }>; brief: Brief }> = ({ beat, brief }) => {
  const marca = brief.marca;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = coloresBeat(marca, beat.fondo);
  const a2 = marca.acento2 ?? marca.acento;
  const sobreAcento = beat.fondo === "acento";
  const p = spring({ frame, fps, config: { damping: 16, stiffness: 100 } });
  const tag = interpolate(frame, [18, 34], [0, 1], clamp);
  const btn = interpolate(frame, [32, 46], [0, 1], clamp);
  const mover = interpolate(frame, [44, CLIC_F - 4], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const presion = frame >= CLIC_F ? Math.max(0, 1 - (frame - CLIC_F) / 9) : 0;
  const onda = interpolate(frame - CLIC_F, [0, 24], [0, 1], clamp);
  return (
    <Centro>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 36, transform: `scale(${0.85 + 0.15 * p})`, opacity: Math.min(1, p * 1.5) }}>
          <div
            style={{
              position: "relative",
              width: 190,
              height: 190,
              borderRadius: 52,
              background: sobreAcento ? "#fff" : `linear-gradient(135deg, ${marca.acento}, ${a2})`,
              color: sobreAcento ? marca.acento : "#fff",
              display: "grid",
              placeItems: "center",
              fontFamily: marca.fuenteTitulo,
              fontWeight: 900,
              fontSize: 120,
              boxShadow: `0 30px 80px ${conAlfa(marca.acento, 0.4)}`,
            }}
          >
            {marca.inicial ?? marca.nombre.charAt(0)}
            <Destello x={175} y={20} atF={8} color={sobreAcento ? "#fff" : marca.acento} tam={200} />
          </div>
          <div style={{ fontFamily: marca.fuenteTitulo, fontWeight: 900, fontSize: 190, letterSpacing: -7, color: c.tinta }}>{marca.nombre}</div>
        </div>
        <div style={{ fontFamily: marca.fuenteTexto, fontSize: 56, fontWeight: 500, color: c.suave, opacity: tag, transform: `translateY(${(1 - tag) * 16}px)` }}>
          {marca.tagline}
        </div>
        {beat.boton ? (
          <div style={{ position: "relative", marginTop: 14, opacity: btn, transform: `translateY(${(1 - btn) * 20}px)` }}>
            <div
              style={{
                padding: "26px 62px",
                borderRadius: 999,
                background: sobreAcento ? "#fff" : `linear-gradient(135deg, ${marca.acento}, ${a2})`,
                color: sobreAcento ? marca.acento : "#fff",
                fontFamily: marca.fuenteTexto,
                fontWeight: 700,
                fontSize: 46,
                boxShadow: `0 22px 54px ${conAlfa(marca.acento, 0.42)}`,
                transform: `scale(${1 - 0.06 * presion})`,
              }}
            >
              {beat.boton}
            </div>
            {frame >= CLIC_F ? (
              <div
                style={{
                  position: "absolute",
                  left: 388,
                  top: 52,
                  width: 260 * onda,
                  height: 260 * onda,
                  marginLeft: -130 * onda,
                  marginTop: -130 * onda,
                  borderRadius: "50%",
                  border: `4px solid ${sobreAcento ? "#fff" : marca.acento}`,
                  opacity: 0.6 * (1 - onda),
                }}
              />
            ) : null}
            <Cursor x={376 + (1 - mover) * 460} y={46 + (1 - mover) * 320} escala={1 - 0.12 * presion} />
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
        <Palabras texto={beat.texto} marca={marca} fondo={fondo} tamano={beat.tamano ?? 104} />
      </Centro>
    );
  }

  if (beat.tipo === "heroe") {
    const serif = marca.fuenteAcento ?? marca.fuenteTitulo;
    return (
      <Centro>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
          <Entra desde="escala" blur={30} dist={0}>
            <div
              style={{
                fontFamily: serif,
                fontStyle: "italic",
                fontWeight: marca.fuenteAcento ? 400 : 800,
                fontSize: 440,
                lineHeight: 1.05,
                letterSpacing: -13,
                paddingRight: "0.1em",
                ...textoDegrade(c.acento, c.acento2),
              }}
            >
              {beat.palabra}
            </div>
          </Entra>
          <Entra retrasoF={16} dist={26}>
            <div style={{ fontFamily: marca.fuenteTexto, fontSize: 62, fontWeight: 500, color: c.suave }}>{beat.pie}</div>
          </Entra>
        </div>
        <Destello x={1560} y={300} atF={20} color={c.acento} />
      </Centro>
    );
  }

  if (beat.tipo === "numero") {
    return (
      <Centro>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          {beat.etiqueta ? (
            <Entra dist={24}>
              <div style={{ fontFamily: marca.fuenteTexto, fontWeight: 700, fontSize: 34, letterSpacing: 7, textTransform: "uppercase", color: c.suave }}>
                {beat.etiqueta}
              </div>
            </Entra>
          ) : null}
          <div style={{ position: "relative" }}>
            <Contador valor={beat.valor} decimales={beat.decimales} prefijo={beat.prefijo} sufijo={beat.sufijo} marca={marca} fondo={fondo} />
            <Anillos atF={NUMERO_ATERRIZA_F} color={c.acento} />
          </div>
          <div
            style={{
              fontFamily: marca.fuenteTexto,
              fontSize: 54,
              fontWeight: 500,
              color: c.suave,
              opacity: interpolate(frame, [30, 46], [0, 1], clamp),
              transform: `translateY(${(1 - interpolate(frame, [30, 46], [0, 1], clamp)) * 16}px)`,
            }}
          >
            {beat.leyenda}
          </div>
        </div>
      </Centro>
    );
  }

  if (beat.tipo === "lista") {
    return (
      <Centro>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 56 }}>
          <Palabras texto={beat.titulo} marca={marca} fondo={fondo} tamano={88} />
          <div style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "flex-start" }}>
            {beat.items.map((it, i) => (
              <Pildora key={it} texto={it} marca={marca} fondo={fondo} retrasoF={26 + i * 12} />
            ))}
          </div>
        </div>
      </Centro>
    );
  }

  if (beat.tipo === "telefono") {
    const der = (beat.lado ?? "der") === "der";
    return (
      <AbsoluteFill
        style={{ flexDirection: der ? "row" : "row-reverse", alignItems: "flex-start", justifyContent: "center", gap: 150, padding: "0 170px" }}
      >
        <div style={{ flex: 1, alignSelf: "center" }}>
          <Palabras texto={beat.texto} marca={marca} fondo={fondo} tamano={98} align="left" />
        </div>
        <div style={{ marginTop: 90 }}>
          <Telefono marca={marca} lineas={beat.lineas} hora={beat.hora} fecha={beat.fecha} />
        </div>
      </AbsoluteFill>
    );
  }

  if (beat.tipo === "chat") {
    return (
      <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 130, padding: "0 150px" }}>
        {beat.texto ? (
          <div style={{ flex: 1 }}>
            <Palabras texto={beat.texto} marca={marca} fondo={fondo} tamano={90} align="left" />
          </div>
        ) : null}
        <Chat marca={marca} mensajes={beat.mensajes} durF={durF} oscuro={c.oscuro} estado={beat.estado} />
      </AbsoluteFill>
    );
  }

  return <LogoVista beat={beat} brief={brief} />;
};

/** Contenido del beat: frame 0 = inicio nominal. Deriva lenta continua y salida con desenfoque. */
const Contenido: React.FC<{ brief: Brief; beat: Beat; durF: number; ultimo: boolean }> = ({ brief, beat, durF, ultimo }) => {
  const frame = useCurrentFrame();
  const sale = ultimo ? 0 : interpolate(frame, [durF - SOLAPE_F, durF], [0, 1], clamp);
  const deriva = interpolate(frame, [0, durF], [1, 1.03], clamp);
  return (
    <AbsoluteFill
      style={{
        opacity: 1 - sale,
        filter: sale > 0 ? `blur(${sale * 14}px)` : undefined,
        transform: `scale(${deriva * (1 - 0.035 * sale)})`,
      }}
    >
      <BeatVista beat={beat} brief={brief} durF={durF} />
    </AbsoluteFill>
  );
};

/** Capa de un beat: el fondo entra con fundido encima del anterior; el contenido arranca en el pulso. */
const CapaBeat: React.FC<{ brief: Brief; beat: Beat; inicio: number; durF: number; entraF: number; ultimo: boolean }> = ({
  brief,
  beat,
  inicio,
  durF,
  entraF,
  ultimo,
}) => {
  const frame = useCurrentFrame();
  const opFondo = entraF > 0 ? interpolate(frame, [0, entraF], [0, 1], clamp) : 1;
  return (
    <RelojContext.Provider value={inicio - entraF}>
      <AbsoluteFill style={{ opacity: opFondo }}>
        <Fondo marca={brief.marca} fondo={beat.fondo} />
      </AbsoluteFill>
      <Sequence from={entraF} durationInFrames={durF} layout="none">
        <RelojContext.Provider value={inicio}>
          <Contenido brief={brief} beat={beat} durF={durF} ultimo={ultimo} />
        </RelojContext.Provider>
      </Sequence>
    </RelojContext.Provider>
  );
};

const DUCK: Record<TipoSonido, number> = {
  transicion: 0.4,
  notificacion: 0.3,
  burbuja: 0.25,
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
        const entraF = i > 0 ? SOLAPE_F : 0;
        return (
          <Sequence key={i} from={inicio - entraF} durationInFrames={fin - inicio + entraF} layout="none">
            <CapaBeat
              brief={brief}
              beat={beat}
              inicio={inicio}
              durF={fin - inicio}
              entraF={entraF}
              ultimo={i === brief.beats.length - 1}
            />
          </Sequence>
        );
      })}
      <AudioPieza brief={brief} />
    </AbsoluteFill>
  );
};
