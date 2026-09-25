import { registerRoot } from "remotion";
import Outro from "../../inserts/outro";
import { InsertPreviewComposition } from "../insert-preview";

const PreviewRoot = () => <InsertPreviewComposition id="outro" Component={Outro} />;

registerRoot(PreviewRoot);
