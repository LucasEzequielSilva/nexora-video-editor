import { registerRoot } from "remotion";
import WhatsappScene from "../../inserts/whatsapp-scene";
import { InsertPreviewComposition } from "../insert-preview";

const PreviewRoot = () => <InsertPreviewComposition id="whatsapp-scene" Component={WhatsappScene} />;

registerRoot(PreviewRoot);
