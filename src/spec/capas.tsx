import type { ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { alfa, useLayout, useSpec } from "./tema";
import type { Brillo } from "./tipos";

/**
 * Las tres capas de cada escena, como en la timeline de los spec ads de referencia
 * (`S03 V1 - Spend - STAGE / CONTENT / BLOOM / BAKED`):
 * - STAGE: escenario (fondo oscuro + glow de marca, o el plate de Higgsfield).
 * - CONTENT: el héroe (UI, teléfono, tarjetas, texto).
 * - BLOOM: el CONTENT desenfocado y aclarado, sumado en `screen` (el resplandor de lo luminoso).
 * Con `capa: "todo"` salen las tres juntas (BAKED). Con otra capa, solo esa: se exportan por separado y se montan en
 * DaVinci para corregir el glow o el fondo sin volver a renderizar todo.
 */
export const Stage = ({ children }: { children: ReactNode }) => {
  const { capa } = useSpec();
  if (capa !== "todo" && capa !== "stage") return null;
  return <AbsoluteFill>{children}</AbsoluteFill>;
};

export const Content = ({ children, bloom = 0.55 }: { children: ReactNode; bloom?: number }) => {
  const { capa } = useSpec();
  const { u } = useLayout();
  if (capa === "stage") return null;
  const resplandor =
    bloom > 0 ? (
      <AbsoluteFill
        style={{
          filter: `blur(${28 * u}px) brightness(1.6) saturate(1.2)`,
          opacity: bloom,
          mixBlendMode: capa === "todo" ? "screen" : undefined,
          pointerEvents: "none",
        }}
      >
        {children}
      </AbsoluteFill>
    ) : null;
  if (capa === "bloom") return resplandor;
  return (
    <>
      <AbsoluteFill>{children}</AbsoluteFill>
      {capa === "todo" && resplandor}
    </>
  );
};

/** Escenario oscuro con un único glow radial del color de marca que respira despacio. */
export const Escenario = ({ brillo }: { brillo?: Brillo }) => {
  const { spec } = useSpec();
  const { width, height } = useLayout();
  const frame = useCurrentFrame();
  const color = brillo?.color ?? spec.marca.color;
  const i = (brillo?.intensidad ?? 1) * (0.92 + 0.08 * Math.sin(frame / 22));
  const x = (brillo?.x ?? 0.5) * 100;
  const y = (brillo?.y ?? 0.5) * 100;
  const r = Math.max(width, height) * 0.55;
  return (
    <AbsoluteFill style={{ background: spec.marca.fondo }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(${r}px ${r * 0.8}px at ${x}% ${y}%, ${alfa(color, 0.55 * i)} 0%, ${alfa(color, 0.18 * i)} 38%, transparent 72%)`,
        }}
      />
      {spec.marca.color2 && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(${r * 0.6}px ${r * 0.45}px at ${100 - x * 0.6}% ${y + 18}%, ${alfa(spec.marca.color2, 0.18 * i)} 0%, transparent 70%)`,
          }}
        />
      )}
      {/* Viñeta: los bordes se pierden en negro, el ojo va al centro. */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.65) 100%)" }} />
    </AbsoluteFill>
  );
};
