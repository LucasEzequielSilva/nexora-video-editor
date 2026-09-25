import { registerRoot } from "remotion";
import WhatsappCta from "../../inserts/whatsapp-cta";
import { InsertPreviewComposition } from "../insert-preview";

const PreviewRoot = () => <InsertPreviewComposition id="whatsapp-cta" Component={WhatsappCta} />;

registerRoot(PreviewRoot);
