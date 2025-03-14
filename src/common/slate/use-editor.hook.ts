import { useEffect, useRef, useState } from "react";
import { createEditor, Operation } from "slate";
import { withReact } from "slate-react";

export function useEditor() {
  const [slateEditor] = useState(() => withReact(createEditor()));

  useEffect(() => {}, []);

  return slateEditor;
}
