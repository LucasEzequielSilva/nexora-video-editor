import type { LucideIcon } from "lucide-react";
import { ClipboardList, CodeXml, LayoutTemplate, PenTool, Target, Terminal } from "lucide-react";

export type TaskId =
  | "relevamiento"
  | "flujo"
  | "alcance"
  | "wireframes"
  | "ui"
  | "prototipo"
  | "login"
  | "panel"
  | "whatsapp"
  | "demo";

export type ChipTone = { bg: string; fg: string };

const TONES = {
  sand: { bg: "#F1EADF", fg: "#7C5E33" },
  slate: { bg: "#E6ECF2", fg: "#43607C" },
  lavender: { bg: "#ECE8F3", fg: "#65528A" },
  rose: { bg: "#F4E8E6", fg: "#8A5249" },
  stone: { bg: "#ECECE8", fg: "#4A4A46" },
} as const satisfies Record<string, ChipTone>;

export type Task = {
  title: string;
  chip: string;
  tone: ChipTone;
  lines: 1 | 2;
  owner: string;
  ownerColor: string;
  date: string;
  done?: boolean;
};

export const TASKS: Record<TaskId, Task> = {
  relevamiento: {
    title: "Relevamiento de requerimientos",
    chip: "Estrategia",
    tone: TONES.sand,
    lines: 2,
    owner: "LC",
    ownerColor: "#111111",
    date: "3 nov",
  },
  flujo: {
    title: "Flujo principal del usuario",
    chip: "UX",
    tone: TONES.slate,
    lines: 2,
    owner: "MR",
    ownerColor: "#5b5b58",
    date: "5 nov",
  },
  alcance: {
    title: "Alcance del MVP",
    chip: "Producto",
    tone: TONES.lavender,
    lines: 1,
    owner: "LC",
    ownerColor: "#111111",
    date: "6 nov",
  },
  wireframes: {
    title: "Wireframes de pantallas clave",
    chip: "UX",
    tone: TONES.slate,
    lines: 2,
    owner: "SG",
    ownerColor: "#8a8a87",
    date: "10 nov",
  },
  ui: { title: "UI en Figma", chip: "UI", tone: TONES.rose, lines: 1, owner: "SG", ownerColor: "#8a8a87", date: "12 nov" },
  prototipo: {
    title: "Prototipo navegable",
    chip: "UI",
    tone: TONES.rose,
    lines: 1,
    owner: "MR",
    ownerColor: "#5b5b58",
    date: "14 nov",
  },
  login: {
    title: "Login y roles de usuario",
    chip: "Backend",
    tone: TONES.stone,
    lines: 1,
    owner: "JP",
    ownerColor: "#2f2f2d",
    date: "18 nov",
  },
  panel: {
    title: "Panel de administración",
    chip: "Frontend",
    tone: TONES.slate,
    lines: 1,
    owner: "JP",
    ownerColor: "#2f2f2d",
    date: "20 nov",
  },
  whatsapp: {
    title: "Integración con WhatsApp",
    chip: "API",
    tone: TONES.sand,
    lines: 1,
    owner: "LC",
    ownerColor: "#111111",
    date: "24 nov",
  },
  demo: {
    title: "Demo funcional 48 hs",
    chip: "Entrega",
    tone: TONES.stone,
    lines: 1,
    owner: "LC",
    ownerColor: "#111111",
    date: "31 oct",
    done: true,
  },
};

export type Stage = { number: string; label: string; icon: LucideIcon; badge: LucideIcon };

export const STAGES: Stage[] = [
  { number: "01", label: "Definición", icon: ClipboardList, badge: Target },
  { number: "02", label: "Diseño", icon: PenTool, badge: LayoutTemplate },
  { number: "03", label: "Desarrollo", icon: CodeXml, badge: Terminal },
];

/** Orden inicial de las tarjetas por columna (Definición, Diseño, Desarrollo, Listo). */
export const INITIAL_COLUMNS: TaskId[][] = [
  ["relevamiento", "flujo", "alcance"],
  ["wireframes", "ui", "prototipo"],
  ["login", "panel", "whatsapp"],
  ["demo"],
];

/** Orden plano en el que las tarjetas entran al tablero (stagger de BoardLayer y laneCount). */
export const ORDER: TaskId[] = INITIAL_COLUMNS.flat();

export const URL_DOMAIN = "portal.nexora.com.ar";
export const URL_PATH = "/tu-proyecto";
