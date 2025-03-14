import { Token } from "marked";
import { createSimpleMarkdownExtension } from "./create-extension";

export const NAME = "mark";

export interface Mark {
  type: typeof NAME;
  content: Token;
}

export const createMarkExtension = () =>
  createSimpleMarkdownExtension({
    name: NAME,
    level: "block",
    start: "==",
    tokenRegexp: /^==[^\n](.*[^\n])==/i,
  });

export const mark = createMarkExtension();
