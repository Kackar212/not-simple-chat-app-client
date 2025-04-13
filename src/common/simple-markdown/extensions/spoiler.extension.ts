import { createSimpleMarkdownExtension } from "./create-extension";
import { SingleASTNode } from "@khanacademy/simple-markdown";

export const NAME = "spoiler";

export interface Spoiler {
  type: typeof NAME;
  content: SingleASTNode[];
}

export const createSpoilerExtension = () =>
  createSimpleMarkdownExtension<Spoiler>({
    name: NAME,
    level: "inline",
    tokenRegexp: /^\|\|([\s\S]+?)\|\|/,
  } as const);

export const spoiler = createSpoilerExtension();
