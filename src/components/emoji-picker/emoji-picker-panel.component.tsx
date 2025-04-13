import { authContext } from "@common/auth/auth.context";
import { Emoji } from "@common/emojis/emoji.class";
import { EmojiMemoryStorage } from "@common/emojis/emojis.storage";
import { useSafeContext } from "@common/hooks";
import { useInfiniteScroll } from "@components/chat/use-infinite-scroll.hook";
import {
  FetchNextPageOptions,
  FetchPreviousPageOptions,
} from "@tanstack/react-query";
import {
  Dispatch,
  MutableRefObject,
  PropsWithChildren,
  SetStateAction,
  SyntheticEvent,
  useCallback,
} from "react";
import { TabPanel } from "react-tabs";
import { twMerge } from "tailwind-merge";
import { EmojiItem } from "./emoji-item.component";

interface EmojiPickerPanelProps {
  onSelect: (emoji: Emoji) => void;
  setHoveredEmoji: Dispatch<SetStateAction<Emoji>>;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  fetchNextPage: (options?: FetchNextPageOptions) => Promise<any>;
  fetchPreviousPage: (options?: FetchPreviousPageOptions) => Promise<any>;
  scrollContainer: MutableRefObject<HTMLDivElement | null>;
}

export function EmojiPickerPanel({
  onSelect,
  setHoveredEmoji,
  hasNextPage,
  hasPreviousPage,
  fetchNextPage,
  fetchPreviousPage,
  scrollContainer,
  children,
}: PropsWithChildren<EmojiPickerPanelProps>) {
  const {
    auth: { member },
  } = useSafeContext(authContext);

  const { bottomRef, ref } = useInfiniteScroll({
    hasNextPage,
    hasPreviousPage,
    fetchNextPage,
    fetchPreviousPage,
    afterFetchOnDispatch() {},
    intersectionOptions: {
      rootMargin: "100px 0px 100px 0px",
      root: scrollContainer.current,
      threshold: [0.5],
    },
  });

  const onEmoji = useCallback(
    ({ target, type }: SyntheticEvent) => {
      const isElement = target instanceof HTMLElement;
      if (!isElement || !target.matches("button[data-name]")) {
        return;
      }

      if (!target.dataset.name) {
        return;
      }

      const emoji = EmojiMemoryStorage.getByName(target.dataset.name);

      if (!emoji) {
        return;
      }

      if (type === "click" && !emoji.isLocked(member.serverId)) {
        onSelect(emoji);

        return;
      }

      setHoveredEmoji(emoji);
    },
    [member.serverId, setHoveredEmoji, onSelect]
  );

  return (
    <div
      className={twMerge(
        "overflow-auto scrollbar scrollbar-thin  scrollbar-hover min-h-[340px] overscroll-contain max-h-[340px] pl-3 pr-1 text-gray-100 w-full"
      )}
      onMouseOver={onEmoji}
      onFocus={onEmoji}
      onClick={onEmoji}
      ref={scrollContainer}
    >
      {hasPreviousPage && (
        <div ref={bottomRef} className="bg-transparent h-0.5 w-full"></div>
      )}
      {children}
      {hasNextPage && (
        <div ref={ref} className="bg-transparent h-2 w-full"></div>
      )}
    </div>
  );
}
