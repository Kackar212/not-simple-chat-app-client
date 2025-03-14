import { BaseEditor, Element, Text } from "slate";
import { ReactEditor } from "slate-react";
import { HistoryEditor } from "slate-history";
import { SlateNode } from "./slate.nodes";

type CustomElement = { type: SlateNode; children: Array<Text | CustomElement> };

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Node: Editor | CustomElement | Text;
  }

  interface RenderLeafProps {
    children: any;
    leaf: { [key: string]: any };
    text: Text;
    attributes: {
      "data-slate-leaf": true;
    };
  }

  export interface BaseElement {
    type: SlateNode;
  }

  type Descendant = CustomElement | Text;
}
