import SimpleMarkdown from "@khanacademy/simple-markdown";
import { Token } from "../simple-markdown";
import { createSimpleMarkdownExtension } from "./create-extension";

export const NAME = "mention";

export interface Mention {
  type: typeof NAME;
  raw: string;
  member: string;
  isNotMember: boolean;
  content: Token;
}

export const createMentionExtension = () =>
  createSimpleMarkdownExtension({
    name: NAME,
    level: "inline",
    tokenRegexp: /^<@&?!?(\d+?)>|^(@(?:everyone|here))/,
    parse(capture) {
      const isRole = capture[0].startsWith("<@&");

      const isStaticMention =
        capture[2] === "@everyone" || capture[2] === "@here";

      const id = Number(capture[1]);

      return {
        type: NAME,
        id,
        isRole,
        isStaticMention,
        raw: capture[0],
      };
    },
  });

export const mention = createMentionExtension();
