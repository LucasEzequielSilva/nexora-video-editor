import type { CSSProperties } from "react";
import { MARCA_PATHS, type Marca } from "./marcas-paths";

const ESTILO: Record<Marca, { fondo: string; glifo: string }> = {
  whatsapp: { fondo: "linear-gradient(180deg, #5CEB7C 0%, #25D366 55%, #1EBE5A 100%)", glifo: "#ffffff" },
  instagram: {
    fondo: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
    glifo: "#ffffff",
  },
  googlecalendar: { fondo: "#ffffff", glifo: "#1A73E8" },
  gmail: { fondo: "#ffffff", glifo: "#EA4335" },
};

type LogoAppProps = {
  marca: Marca;
  size: number;
  style?: CSSProperties;
};

/** Logo oficial de la marca (trazado vectorial de simple-icons) como ícono de app. Nunca reemplazar por íconos genéricos. */
export default function LogoApp({ marca, size, style }: LogoAppProps) {
  const { fondo, glifo } = ESTILO[marca];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.235,
        background: fondo,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.08)",
        flexShrink: 0,
        ...style,
      }}
    >
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24">
        <path d={MARCA_PATHS[marca]} fill={glifo} />
      </svg>
    </div>
  );
}
