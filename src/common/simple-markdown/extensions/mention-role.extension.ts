import { Token } from "../simple-markdown";
import { createSimpleMarkdownExtension } from "./create-extension";

export const NAME = "mentionRole";

export interface Mention {
  type: typeof NAME;
  role: string;
  raw: string;
  content: Token;
}
// <@everyone>
export const createMentionExtension = () =>
  createSimpleMarkdownExtension({
    name: NAME,
    level: "inline",
    tokenRegexp: /^<@&!?(.+)>/,
    parse(capture) {
      return {
        type: NAME,
        role: capture[1],
        content: `@${capture[1]}`,
        raw: capture[0],
      };
    },
  });

export const mention = createMentionExtension();
