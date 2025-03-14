import { Tokens } from "marked";
import { createSimpleMarkdownExtension } from "./create-extension";
import SimpleMarkdown from "@khanacademy/simple-markdown";

export const NAME = "url";

export interface Url {
  type: typeof NAME;
  content: string;
  target: string;
  title: string;
}

export const createUrlExtension = () =>
  createSimpleMarkdownExtension({
    name: NAME,
    level: "inline",
    start: ["http://", "https://", "www.", "steam://"],
    tokenRegexp: /^((https?:\/\/|steam:\/\/|www\.)[^\s<]+[^<.,:;"')\]\s])/,
    order: SimpleMarkdown.defaultRules.text.order - 1,
    parse(capture) {
      const [_raw, url] = capture;

      return {
        content: url,
        target: url,
        title: "",
      };
    },
  });

export const url = createUrlExtension();
