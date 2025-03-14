import { Tokens, TokenizerAndRendererExtension } from "marked";
import {
  createSimpleMarkdownExtension,
  CreateSimpleMarkdownExtensionProps,
} from "./create-extension";
import { Capture, ParseFunction } from "@khanacademy/simple-markdown";
import { asciiRegexp } from "@common/emojis";
import { EmojiMemoryStorage } from "@common/emojis/emojis.storage";

export const NAME = "emoticon";

export interface Emoticon {
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
  parse?: CreateSimpleMarkdownExtensionProps<Emoticon>["parse"];
  match?: CreateSimpleMarkdownExtensionProps<Emoticon>["match"];
}

const defaultEmojiRegexp = asciiRegexp;

const defaultParse = (capture: Capture) => {
  const [raw, emoticon] = capture;
  const emoji = EmojiMemoryStorage.getByAscii(emoticon);

  return {
    type: NAME,
    emoji: emoji?.uniqueName || "",
    skinTone: "",
    content: "",
    raw,
  } as const;
};

export const createEmojiExtension = ({
  emojiRegexp = defaultEmojiRegexp,
  start = "",
  name = NAME,
  parse = defaultParse,
  match,
}: CreateEmojiExtensionProps = {}) =>
  createSimpleMarkdownExtension({
    name,
    start,
    tokenRegexp: emojiRegexp,
    level: "inline",
    parse,
    match,
  });

export const emoticon = createEmojiExtension();
