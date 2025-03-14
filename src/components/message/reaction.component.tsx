import { ApiError, mutations, QueryResponse } from "@common/api";
import { useMutation } from "@common/api/hooks/use-mutation.hook";
import { useQuery } from "@common/api/hooks/use-query.hook";
import { MessagesResponseWithCursor } from "@common/api/schemas/message.schema";
import { authContext } from "@common/auth/auth.context";
import { EmojiMemoryStorage } from "@common/emojis/emojis.storage";
import { useSafeContext } from "@common/hooks";
import { plural } from "@common/utils";
import { Loader } from "@components/loader/loader.component";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

interface ReactionProps {
  count: number;
  emoji: { name: string; url?: string };
  me: boolean;
  reactionId?: number;
  messageId: number;
  channelId: number;
}

export function Reaction({
  reactionId,
  count,
  emoji,
  me,
  messageId,
  channelId,
}: ReactionProps) {
  const previousCount = useRef(count);
  const beforeChange = previousCount.current;

  useEffect(() => {
    previousCount.current = count;
  }, [count]);

  const { mutate: modifyReactions } = useMutation({
    mutationFn: mutations.modifyReactions,
  });

  const [emojiObject] = useState(() =>
    EmojiMemoryStorage.getByName(emoji.name)
  );

  const onClick = useCallback(() => {
    if (me && reactionId) {
      modifyReactions({ emojiName: emoji.name, messageId });
    }

    if (!me && emojiObject) {
      modifyReactions({ emoji: emojiObject, messageId });
    }
  }, [me, reactionId, emojiObject, messageId, emoji, modifyReactions]);

  return (
    <button
      key={emoji.name}
      className={twMerge(
        "overflow-hidden h-7 border border-transparent relative bg-black-630/100 py-[3px] px-1.5 font-medium flex rounded-[4px] gap-1.5 items-center transition-[background-color,border-color] ease-in-out",
        me &&
          "border-[hsl(234.935_85.556%_64.706%/1)] bg-[hsl(234.935_85.556%_64.706%/0.15)]"
      )}
      aria-pressed={me}
      aria-disabled={false}
      aria-label={`${emoji.name}, ${count} ${plural.reaction(count)}.`}
      onClick={onClick}
      style={{ "--size": "20px" } as CSSProperties}
    >
      {!emoji.url && (
        <span
          style={emojiObject?.style}
          className="block size-5"
          aria-hidden
        ></span>
      )}
      {emoji.url && (
        <Image
          src={emoji.url}
          className="size-5"
          width={20}
          height={20}
          alt=""
        />
      )}
      <span
        aria-hidden
        className={twMerge(
          "leading-none flex flex-col gap-[3px] -translate-y-[0px]",
          !me && "transition-transform -translate-y-[10px]",
          me && "transition-transform translate-y-[10px]"
        )}
        onTransitionEnd={() => {
          previousCount.current = count;
        }}
      >
        {me && <span>{count}</span>}
        <span>{beforeChange < 1000 ? beforeChange : "999+"}</span>
        {!me && <span>{count}</span>}
      </span>
    </button>
  );
}
