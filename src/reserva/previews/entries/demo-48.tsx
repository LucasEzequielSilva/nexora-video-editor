import { registerRoot } from "remotion";
import Demo48 from "../../inserts/demo-48";
import { InsertPreviewComposition } from "../insert-preview";

const PreviewRoot = () => <InsertPreviewComposition id="demo-48" Component={Demo48} />;

registerRoot(PreviewRoot);
