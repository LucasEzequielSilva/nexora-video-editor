import type { ComponentType } from "react";
import type { InsertId } from "../edit";
import CallChecklist from "./call-checklist";
import Demo48 from "./demo-48";
import Outro from "./outro";
import ProcessBoard from "./process-board";
import type { InsertProps } from "./types";
import WhatsappCta from "./whatsapp-cta";
import WhatsappScene from "./whatsapp-scene";

export const INSERT_COMPONENTS: Record<InsertId, ComponentType<InsertProps>> = {
  "whatsapp-scene": WhatsappScene,
  "demo-48": Demo48,
  "call-checklist": CallChecklist,
  "process-board": ProcessBoard,
  "whatsapp-cta": WhatsappCta,
  outro: Outro,
};
