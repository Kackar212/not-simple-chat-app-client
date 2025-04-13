import { createSimpleMarkdownExtension } from "./create-extension";
import SimpleMarkdown from "@khanacademy/simple-markdown";

export const NAME = "directMessageRequest";

export interface DirectMessageRequest {
  type: typeof NAME;
  requestId: string;
  channelId: number;
  messageId: number;
  content: string;
}

export const createDirectMessageRequestExtension = () =>
  createSimpleMarkdownExtension<DirectMessageRequest>({
    name: NAME,
    level: "inline",
    tokenRegexp: /^\[Request:(?<requestId>.*)\]/i,
    order: SimpleMarkdown.defaultRules.codeBlock.order,
    match(source, state) {
      const match = this.tokenRegexp.exec(source);

      if (!match) {
        return null;
      }

      if (state.requestId !== match[1]) {
        return null;
      }

      return match;
    },
    parse(capture, _, { requestId, channelId, messageId }) {
      const [raw] = capture;

      return {
        type: NAME,
        channelId,
        messageId,
        raw,
        requestId,
        content: raw,
      };
    },
  });

export const directMessageRequest = createDirectMessageRequestExtension();
