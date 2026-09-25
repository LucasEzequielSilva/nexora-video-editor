import { registerRoot } from "remotion";
import ProcessBoard from "../../inserts/process-board";
import { InsertPreviewComposition } from "../insert-preview";

const PreviewRoot = () => <InsertPreviewComposition id="process-board" Component={ProcessBoard} />;

registerRoot(PreviewRoot);
