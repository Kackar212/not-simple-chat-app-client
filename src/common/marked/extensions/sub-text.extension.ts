import { Token, TokenizerAndRendererExtension } from "marked";
import { createSimpleMarkdownExtension } from "./create-extension";
import SimpleMarkdown, { SingleASTNode } from "@khanacademy/simple-markdown";

export const NAME = "subText";

export interface SubText {
  type: typeof NAME;
  content: SingleASTNode[];
}

export const createSubTextExtension = () =>
  createSimpleMarkdownExtension<SubText>({
    name: NAME,
    level: "block",
    start: "-#",
    order: SimpleMarkdown.defaultRules.heading.order,
    tokenRegexp: /^ *-# +((?!(-#)+)[^\n]+?) *(?:\n|$)/,
  });

export const subText = createSubTextExtension();
