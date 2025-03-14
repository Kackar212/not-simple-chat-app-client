import { Token } from "marked";
import { createSimpleMarkdownExtension } from "./create-extension";
import SimpleMarkdown from "@khanacademy/simple-markdown";

export const NAME = "codeBlock";

export interface Code {
  type: typeof NAME;
  lang: string;
  content: string;
  raw: string;
}

export const createCodeExtension = () =>
  createSimpleMarkdownExtension<Code>({
    name: NAME,
    level: "block",
    start: "```",
    tokenRegexp: /^```(?:([a-z0-9_+\-.#]+?)\n)?\n*([^\n][^]*?)\n*```/i,
    order: SimpleMarkdown.defaultRules.codeBlock.order,
    parse(capture) {
      const [raw, lang, text] = capture;

      return {
        type: NAME,
        lang,
        raw,
        content: text,
      };
    },
  });

export const code = createCodeExtension();
