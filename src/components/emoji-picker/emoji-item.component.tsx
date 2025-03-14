import {
  CSSProperties,
  HTMLProps,
  PropsWithChildren,
  useRef,
  useState,
} from "react";
import { useSafeContext } from "@common/hooks";
import { authContext } from "@common/auth/auth.context";
import Image from "next/image";
import PadlockClosedIcon from "/public/assets/icons/padlock-closed.svg";
import { useEmojiStyle } from "@common/emojis/use-emoji-style.hook";
import { useEmojiProperties } from "@common/emojis/use-emoji-properties.hook";
import { Emoji } from "@common/emojis/emoji.class";

interface EmojiItemProps extends HTMLProps<HTMLButtonElement> {
  emoji: Emoji;
}

export function EmojiItem({
  emoji,
  ...attrs
}: PropsWithChildren<EmojiItemProps>) {
  const {
    auth: { member },
  } = useSafeContext(authContext);
  const isLocked = emoji.isLocked(member.serverId);
  const placeholder = emoji.placeholder ? emoji.placeholder : undefined;

  return (
    <button
      key={emoji.uniqueName}
      className="size-12 p-1 rounded-md hover:bg-gray-260 relative"
      data-name={emoji.uniqueName}
      aria-label={emoji.uniqueName.replaceAll(/_/g, " ")}
      aria-disabled={isLocked}
      {...attrs}
      type="button"
    >
      {emoji.isUnicode && (
        <div style={emoji.style} className="size-10 pointer-events-none"></div>
      )}
      {!emoji.isUnicode && (
        <Image
          src={emoji.url}
          alt={emoji.uniqueName}
          className="size-10 pointer-events-none"
          placeholder="blur"
          blurDataURL={placeholder}
          width={40}
          height={40}
        />
      )}
      {isLocked && (
        <div className="flex justify-center items-center absolute top-1 left-1 bg-black-300/60 size-10">
          <PadlockClosedIcon className="size-4" />
        </div>
      )}
    </button>
  );
}
