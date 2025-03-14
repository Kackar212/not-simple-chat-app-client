import { MarkedExtensionToken } from "@common/marked/extensions";
import { Tokens } from "marked";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { CSSProperties } from "react";
import { useSafeContext } from "@common/hooks";
import { authContext } from "@common/auth/auth.context";
import { EmojiMemoryStorage } from "@common/emojis/emojis.storage";

interface MarkedEmojiProps {
  token: MarkedExtensionToken.Emoji;
  isOnlyElement: boolean;
}

const EMOJI_BASE_URL =
  "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/";

export function getEmojiUrl(codePoint: string) {
  return new URL(`${codePoint.toLowerCase()}.svg`, EMOJI_BASE_URL);
}

export function Emoji({ token, isOnlyElement }: MarkedEmojiProps) {
  const hasEmoji = (
    token: Tokens.Generic
  ): token is MarkedExtensionToken.Emoji => "emoji" in token;

  const {
    auth: { member },
  } = useSafeContext(authContext);

  const { emoji, raw } = token;

  const emojiObject = EmojiMemoryStorage.getByName(emoji);

  if (!emojiObject) {
    return raw;
  }

  return (
    <span
      className={twMerge("emoji size-[1.375rem]", isOnlyElement && "size-12")}
      style={
        {
          "--size": isOnlyElement ? "48px" : "22px",
        } as CSSProperties
      }
    >
      <Image
        src={emojiObject.url.toString()}
        alt={emojiObject.uniqueName.replaceAll(/_/g, " ")}
        width={isOnlyElement ? 48 : 22}
        height={isOnlyElement ? 48 : 22}
        loading="lazy"
      />
    </span>
  );
}
