import { useSafeContext } from "@common/hooks";
import { chatContext } from "./chat.context";
import { Recipient } from "@components/recipient/recipient.component";
import {
  MutableRefObject,
  useCallback,
  useEffect,
  useInsertionEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Direction, useGetMessages } from "@common/api/hooks";
import { useInfiniteScroll } from "./use-infinite-scroll.hook";
import { useGroupMessages } from "@components/messages/use-group-messages.hook";
import { MessageWithBaseUser } from "@common/api/schemas/message.schema";
import { Recipient as RecipientEntity } from "@common/api/schemas/user.schema";
import { MessageSkeleton } from "@components/skeleton/message-skeleton.component";
import { Messages } from "@components/messages/messages.component";
import { Loader } from "@components/loader/loader.component";
import Loading from "@/app/loading";
import { createPortal } from "react-dom";
import { OnResizeCallback, useResizeDetector } from "react-resize-detector";
import { twMerge } from "tailwind-merge";
import { useOnChatResize } from "./use-on-chat-resize.hook";

interface ScrollContainerProps {
  isBlocked?: boolean;
  queryKey: unknown[];
}

export function ScrollContainer({ isBlocked, queryKey }: ScrollContainerProps) {
  const {
    scrollContainerRef,
    skeletonsRef,
    channelId,
    channelName,
    recipient,
    groupedMessages,
    messages,
    getMessagesQueryResult: {
      data,
      isLoading,
      isFetched,
      hasNextPage,
      hasPreviousPage,
      isFetchingNextPage,
      isFetchingPreviousPage,
      fetchPreviousPage,
      fetchNextPage,
    },
    isScrollable,
  } = useSafeContext(chatContext);

  const firstMessageId = data?.firstMessageId;
  const lastMessageId = data?.lastMessageId;

  const { ref, bottomRef, lastScrollPosition } = useInfiniteScroll({
    hasNextPage,
    hasPreviousPage,
    fetchNextPage,
    fetchPreviousPage,
    afterFetchOnDispatch(direction) {
      let id = firstMessageId;
      if (direction === Direction.Next) {
        id = lastMessageId;
      }

      document.querySelector(`[data-id="${id}"]`)?.scrollIntoView();
    },
  });

  const previousScrollerHeight = useRef(0);

  const scrolledToBottom = useRef(false);
  useEffect(() => {
    if (!scrollContainerRef.current || messages.length === 0) {
      return;
    }

    if (scrolledToBottom.current || !scrollContainerRef.current) {
      return;
    }

    scrollContainerRef.current?.scroll({
      top: 99999,
    });
    scrolledToBottom.current = messages.length > 0;
  }, [messages, scrollContainerRef, channelId, lastScrollPosition]);

  useEffect(() => {
    if (isLoading && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 99999;
    }
  }, [isLoading, scrollContainerRef]);

  const scrollInnerRef = useRef<HTMLDivElement | null>(null);
  useOnChatResize({ scrollInnerRef, scrollerRef: scrollContainerRef });

  return (
    <div
      className="absolute top-0 left-0 bottom-0 overflow-y-scroll right-0 min-w-0 min-h-0 grow shrink basis-auto scrollbar overscroll-contain flex-auto"
      ref={scrollContainerRef as MutableRefObject<HTMLDivElement>}
    >
      <div className="flex flex-col justify-end items-stretch min-h-full min-w-0">
        <div
          className="overflow-hidden min-h-0 min-w-0"
          id="messages"
          ref={scrollInnerRef}
        >
          {isLoading && (
            <div
              className="flex flex-col grow top-0 left-0 size-full bg-black-600 z-20"
              ref={skeletonsRef}
            >
              {Array.from({ length: 10 }).map((_, index) => (
                <MessageSkeleton isEven={index % 2 !== 0} key={index} />
              ))}
            </div>
          )}
          {!isFetchingNextPage && hasNextPage && !isLoading && (
            <div
              className="block h-[8px] w-full pointer-events-none"
              ref={ref}
            ></div>
          )}
          {hasNextPage && !isScrollable && (
            <div
              className="flex flex-col grow top-0 left-0 size-full bg-black-600 z-20"
              ref={skeletonsRef}
            >
              {Array.from({ length: 4 }).map((v, index) => (
                <MessageSkeleton isEven={index % 2 !== 0} key={index} />
              ))}
            </div>
          )}
          {!recipient && !hasNextPage && !isLoading && (
            <div className="px-4 w-full mt-auto">
              <h2 className="text-xl font-semibold text-center px-4 mt-4">
                <span className="w-full py-2">
                  Welcome to channel #{channelName}
                </span>
              </h2>
              <p className="text-center text-gray-150 font-light mb-4">
                This is the start of this channel
              </p>
            </div>
          )}
          {recipient && !hasNextPage && (
            <div className="relative mt-auto">
              <Recipient
                recipient={recipient}
                isBlocked={!!isBlocked}
                queryKey={queryKey}
              />
            </div>
          )}
          {messages.length === 0 && !isLoading && (
            <div className="text-gray-360 flex justify-center items-center">
              <p>There are currently no messages.</p>
            </div>
          )}

          <div
            aria-hidden
            className="w-full flex items-center justify-center mb-2"
          >
            <Loader
              className={twMerge(
                "animate-none hidden",
                hasNextPage && "block",
                isFetchingNextPage && "animate-spin"
              )}
            />
          </div>
          <Messages groupedMessages={groupedMessages} />
          <div
            aria-hidden
            className="w-full flex items-center justify-center mt-2"
          >
            <Loader
              className={twMerge(
                "animate-none hidden",
                hasPreviousPage && "block",
                isFetchingPreviousPage && "animate-spin"
              )}
            />
          </div>
          {!isFetchingPreviousPage && hasPreviousPage && !isLoading && (
            <div
              className="block h-[8px] w-full pointer-events-none"
              ref={bottomRef}
            ></div>
          )}
          <div className="w-full h-4"></div>
        </div>
      </div>
    </div>
  );
}
