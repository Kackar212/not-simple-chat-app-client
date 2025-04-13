import { Emoji } from "@common/emojis/emoji.class";
import Image from "next/image";
import { CSSProperties, useRef } from "react";

interface HoveredEmojiProps {
  hoveredEmoji: Emoji;
}

export function HoveredEmoji({ hoveredEmoji }: HoveredEmojiProps) {
  const properties = useRef({ "--size": "32px" } as CSSProperties);

  return (
    <div className="py-2 px-2 md:px-4 w-full bg-black-660 flex shadow-[0_0_2px_0_#313338] font-medium text-white-500">
      <span className="sr-only">Hovered emoji: </span>{" "}
      <div
        className="grid grid-cols-[1.5rem_1fr] items-center gap-2 md:gap-4 w-full"
        style={properties.current}
      >
        {hoveredEmoji.isUnicode && (
          <span
            aria-hidden
            style={hoveredEmoji.style}
            className="size-8 block"
          ></span>
        )}
        {!hoveredEmoji.isUnicode && (
          <span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <Image
              src={hoveredEmoji.url}
              alt=""
              className="size-8 block"
              placeholder="blur"
              decoding="sync"
              blurDataURL={hoveredEmoji.placeholder || undefined}
              width={32}
              height={32}
            />
          </span>
        )}
        <span
          aria-live="polite"
          className="overflow-hidden text-ellipsis whitespace-nowrap"
        >
          {hoveredEmoji.serializedNames}
        </span>
      </div>
    </div>
  );
}
