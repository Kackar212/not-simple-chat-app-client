import {
  Descendant,
  Editor,
  Element,
  Node,
  Text,
  createEditor as _createEditor,
} from "slate";
import { SlateNode, slateNodes } from "./slate.nodes";
import { CustomElement } from "./slate";

function isElement(elementOrType: CustomElement | SlateNode | Text) {
  if (typeof elementOrType === "string") {
    return !!slateNodes[elementOrType];
  }

  if ("text" in elementOrType) {
    return false;
  }

  return !!slateNodes[elementOrType.type];
}

export function isInline(elementOrType: CustomElement | SlateNode | Text) {
  if (!isElement(elementOrType)) {
    return false;
  }

  if (Editor.isEditor(elementOrType)) {
    return false;
  }

  if (typeof elementOrType === "string") {
    return slateNodes[elementOrType].isInline;
  }

  if ("text" in elementOrType) {
    return true;
  }

  return slateNodes[elementOrType.type].isInline;
}

export function isVoid(elementOrType: CustomElement | SlateNode) {
  if (!isElement(elementOrType)) {
    return false;
  }

  if (Editor.isEditor(elementOrType)) {
    return false;
  }

  if (typeof elementOrType === "string") {
    return slateNodes[elementOrType].isVoid;
  }

  return slateNodes[elementOrType.type].isVoid;
}

export function isBlock(elementOrType: CustomElement | SlateNode) {
  if (!isElement(elementOrType)) {
    return false;
  }

  if (Editor.isEditor(elementOrType)) {
    return false;
  }

  if (typeof elementOrType === "string") {
    return slateNodes[elementOrType].isBlock;
  }

  return slateNodes[elementOrType.type].isBlock;
}

export function getBlocks(editor: Editor) {
  return editor.children.map((child, index) => [child as Element, [index]]) as [
    Element,
    [number]
  ][];
}

export function createEditor() {
  const editor = _createEditor() as Editor & {
    blocks: () => [Element, [number]][];
  };

  const _isInline = editor.isInline;
  const _isVoid = editor.isVoid;
  const _isBlock = editor.isBlock;

  editor.isInline = (element: CustomElement) => {
    if (isInline(element)) {
      return true;
    }

    return _isInline(element);
  };

  editor.isVoid = (element: CustomElement) => {
    if (isVoid(element)) {
      return true;
    }

    return _isVoid(element);
  };

  editor.isBlock = (element: CustomElement) => {
    if (isBlock(element)) {
      return true;
    }

    return _isBlock(element);
  };

  return editor;
}
