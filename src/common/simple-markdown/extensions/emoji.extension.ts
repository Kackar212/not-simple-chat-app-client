import {
  createSimpleMarkdownExtension,
  CreateSimpleMarkdownExtensionProps,
} from "./create-extension";
import { Capture } from "@khanacademy/simple-markdown";

export const NAME = "emoji";

export interface Emoji {
  type: typeof NAME;
  emoji: string;
  content: "";
  skinTone?: string;
  raw: string;
}

interface CreateEmojiExtensionProps {
  name?: string;
  emojiRegexp?: RegExp;
  start?: string | string[];
  parse?: CreateSimpleMarkdownExtensionProps<Emoji>["parse"];
  match?: CreateSimpleMarkdownExtensionProps<Emoji>["match"];
}

const defaultEmojiRegexp = /^:([^\s:]+?(?:::skin-tone-\d)?):/;

const defaultParse = (capture: Capture) => {
  const [raw, emoji] = capture;
  const [name, skinTone] = emoji.split("::");

  return {
    type: NAME,
    emoji: name,
    skinTone,
    content: "",
    raw,
  } as const;
};

export const createEmojiExtension = ({
  emojiRegexp = defaultEmojiRegexp,
  name = NAME,
  parse = defaultParse,
  match,
}: CreateEmojiExtensionProps = {}) =>
  createSimpleMarkdownExtension({
    name,
    tokenRegexp: emojiRegexp,
    level: "inline",
    parse,
    match,
  });

export const emoji = createEmojiExtension();
