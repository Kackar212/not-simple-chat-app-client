import { MarkdownExtensionToken } from "@common/simple-markdown/extensions";
import { twMerge } from "tailwind-merge";
import { CSSProperties } from "react";
import { EmojiMemoryStorage } from "@common/emojis/emojis.storage";
import Image from "next/image";

interface EmojiProps {
  token: MarkdownExtensionToken.Emoji;
  isOnlyElement: boolean;
}

const EMOJI_BASE_URL =
  "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/";

export function getEmojiUrl(codePoint: string) {
  return new URL(`${codePoint.toLowerCase()}.svg`, EMOJI_BASE_URL);
}

export function Emoji({ token, isOnlyElement }: EmojiProps) {
  const { emoji, raw } = token;

  const emojiObject = EmojiMemoryStorage.getByName(emoji);

  if (!emojiObject) {
    return raw;
  }

  return (
    <span
      className={twMerge("emoji", isOnlyElement && "size-12")}
      style={
        {
          "--size": isOnlyElement ? "48px" : "24px",
        } as CSSProperties
      }
    >
      <Image
        src={emojiObject.url.toString()}
        alt={emojiObject.uniqueName.replaceAll(/_/g, " ")}
        width={isOnlyElement ? 48 : 24}
        height={isOnlyElement ? 48 : 24}
        loading="lazy"
      />
    </span>
  );
}
