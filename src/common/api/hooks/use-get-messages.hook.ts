import {
  useInfiniteQuery,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { use, useMemo } from "react";
import { getMessages } from "../api.service";
import { QueryKey } from "@common/constants";

export enum Direction {
  Next = "next",
  Previous = "prev",
}

type PageParam = {
  cursor: number | undefined | null;
  direction: Direction;
};

const MAX_PAGES = 4;

const initialPageParam: PageParam = {
  direction: Direction.Next,
  cursor: undefined,
} as const;

interface UseGetMessagesProps {
  channelId: number;
  initialMessages: ReturnType<typeof getMessages>;
}

export function useGetMessages({
  channelId,
  initialMessages,
}: UseGetMessagesProps) {
  const getMessagesQueryKey = QueryKey.Messages(channelId);
  const messages = use(initialMessages);

  return useInfiniteQuery({
    initialPageParam,
    queryKey: getMessagesQueryKey,
    queryFn: ({ pageParam }) => {
      return getMessages({
        channelId,
        before:
          pageParam.direction === Direction.Next ? pageParam.cursor : undefined,
        after:
          pageParam.direction === Direction.Previous
            ? pageParam.cursor
            : undefined,
      });
    },
    getNextPageParam: (lastPage, _, lastPageParam) => {
      if (!lastPage?.data?.cursor) {
        return;
      }

      return {
        direction: Direction.Next,
        cursor: lastPage.data.cursor,
      } as const;
    },
    getPreviousPageParam: (firstPage, allPages, firstPageParam) => {
      if (!firstPage?.data?.hasPreviousCursor) {
        return;
      }

      return {
        direction: Direction.Previous,
        cursor: firstPage?.data?.previousCursor,
      } as const;
    },
    select({ pages, pageParams }) {
      const messages = pages.flatMap(({ data }) => data?.messages || []);

      return {
        messages,
        pageParams,
        pages,
        direction: pageParams[0].direction,
        firstMessageId: messages.at(0)?.id,
        lastMessageId: messages.at(-1)?.id,
      };
    },
    staleTime: Infinity,
    maxPages: MAX_PAGES,
    initialData: { pageParams: [initialPageParam], pages: [messages] },
  });
}
