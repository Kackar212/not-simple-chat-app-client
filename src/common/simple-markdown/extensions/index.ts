import { emoji, Emoji as _Emoji, NAME as EMOJI } from "./emoji.extension";
import {
  spoiler,
  Spoiler as _Spoiler,
  NAME as SPOILER,
} from "./spoiler.extension";
import {
  subText,
  SubText as _SubText,
  NAME as SUB_TEXT,
} from "./sub-text.extension";
import { code, Code as _Code, NAME as CODE } from "./code.extension";
import { mark, Mark as _Mark, NAME as MARK } from "./mark.extension";
import { url, Url as _Url, NAME as URL } from "./url.extension";
import {
  timestamp,
  Timestamp as _Timestamp,
  NAME as TIMESTAMP,
} from "./timestamp.extension";
import {
  emoticon,
  Emoticon as _Emoticon,
  NAME as EMOTICON,
} from "./emoticon.extension";
import {
  directMessageRequest,
  DirectMessageRequest as _DirectMessageRequest,
  NAME as DIRECT_MESSAGE_REQUEST,
} from "./direct-message-request.extension";
import {
  mention,
  Mention as _Mention,
  NAME as MENTION,
} from "./mention.extension";

export declare namespace MarkdownExtensionToken {
  interface Emoji extends _Emoji {}
  interface Spoiler extends _Spoiler {}
  interface SubText extends _SubText {}
  interface Code extends _Code {}
  interface Mark extends _Mark {}
  interface Url extends _Url {}
  interface Timestamp extends _Timestamp {}
  interface Emoticon extends _Emoticon {}
  interface DirectMessageRequest extends _DirectMessageRequest {}
  interface Mention extends _Mention {}
}

export const CustomTokenType = {
  Emoji: EMOJI,
  Spoiler: SPOILER,
  SubText: SUB_TEXT,
  Code: CODE,
  Mark: MARK,
  Url: URL,
  Timestamp: TIMESTAMP,
  Emoticon: EMOTICON,
  DirectMessageChannel: DIRECT_MESSAGE_REQUEST,
  Mention: MENTION,
} as const;

export {
  emoji,
  spoiler,
  subText,
  code,
  mark,
  url,
  timestamp,
  emoticon,
  directMessageRequest,
  mention,
};
