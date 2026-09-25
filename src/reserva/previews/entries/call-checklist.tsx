import { registerRoot } from "remotion";
import CallChecklist from "../../inserts/call-checklist";
import { InsertPreviewComposition } from "../insert-preview";

const PreviewRoot = () => <InsertPreviewComposition id="call-checklist" Component={CallChecklist} />;

registerRoot(PreviewRoot);
