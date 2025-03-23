import {
  ApiError,
  QueryResponse,
  createMessage,
  getMessages,
} from "@common/api";
import { useGetMessages } from "@common/api/hooks";
import { useQuery } from "@common/api/hooks/use-query.hook";
import {
  Message,
  MessagesResponseWithCursor,
  MessageWithBaseUser,
  MessageWithBaseUserSchema,
  UserAnswer,
} from "@common/api/schemas/message.schema";
import { Recipient } from "@common/api/schemas/user.schema";
import { authContext } from "@common/auth/auth.context";
import { QueryKey } from "@common/constants";
import { MessageType } from "@common/enums/message-type.enum";
import { useSafeContext } from "@common/hooks";
import { socket, SocketEvent } from "@common/socket";
import { useGroupMessages } from "@components/messages/use-group-messages.hook";
import { usePopover } from "@components/popover/use-popover.hook";
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  useCallback,
  useEffect,
  useInsertionEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useOnReaction } from "./use-on-reaction.hook";
import { useOnMessage } from "./use-on-message.hook";
import { getQueryClient } from "@/app/get-query-client";
import { ServerSocketEvents } from "@common/interfaces/server-socket.events.interface";

interface UseChatProps {
  channelId: number;
  channelName: string;
  isRequestAccepted: boolean;
  recipient?: Recipient;
  initialMessages: ReturnType<typeof getMessages>;
}

export function useChat({
  channelId,
  channelName,
  isRequestAccepted,
  recipient,
  initialMessages,
}: UseChatProps) {
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const skeletonsRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();

  const {
    auth: { user },
  } = useSafeContext(authContext);

  const [isScrollable, setIsScrollable] = useState(true);

  const onReaction = useOnReaction({ channelId });
  const onMessage = useOnMessage({ user });

  useEffect(() => {
    socket.on(SocketEvent.Reaction, onReaction);

    return () => {
      socket.off(SocketEvent.Reaction);
    };
  }, [onReaction]);

  useEffect(() => {
    if (isScrollable) {
      return;
    }

    scrollContainerRef.current?.scroll({ top: 99999 });
  }, [isScrollable]);

  const [messageReference, setMessageReference] = useState<
    MessageWithBaseUser | undefined
  >(undefined);

  const getMessagesQueryResult = useGetMessages({ channelId, initialMessages });

  const { messages } = getMessagesQueryResult.data || {
    messages: [] as MessageWithBaseUser[],
  };

  const groupedMessages = useGroupMessages(messages);

  const popoverProps = usePopover({
    placement: "bottom-end",
    offset: { mainAxis: 20, crossAxis: 12 },
  });

  const {
    data: { pinnedMessages = [] },
    isLoading: isGetPinnedMessagesQueryLoading,
    isRefetching: isGetPinnedMessagesQueryFetching,
  } = useQuery({
    queryKey: QueryKey.PinnedMessages(channelId),
    queryFn: () => getMessages({ channelId, isPinned: true }),
    enabled: popoverProps.isOpen,
    select: ({ data }) => {
      return {
        pinnedMessages: data?.messages,
      };
    },
  });

  const openPinnedMessages = useCallback(() => {
    const {
      refs: {
        domReference: { current: pinnedMessagesTrigger },
      },
    } = popoverProps;

    const isHTMLElement = pinnedMessagesTrigger instanceof HTMLElement;

    if (!isHTMLElement) {
      return;
    }

    pinnedMessagesTrigger.click();
  }, [popoverProps]);

  const onPollAnswer: ServerSocketEvents["pollAnswer"] = useCallback(
    (answer) => {
      queryClient.setQueryData(
        QueryKey.Messages(channelId),
        (
          data: InfiniteData<
            QueryResponse<MessagesResponseWithCursor, ApiError>
          >
        ) => {
          if (!data) {
            return data;
          }

          const pages = data.pages.map((page) => {
            return {
              ...page,
              data: {
                ...page.data,
                messages: page.data?.messages.map((message) => {
                  if (message.id !== answer.messageId) {
                    return message;
                  }

                  const userAnswers = message.poll?.pollUserAnswers || [];

                  return {
                    ...message,
                    poll: {
                      ...message.poll,
                      pollUserAnswers: [...userAnswers, answer],
                    },
                  };
                }),
              },
            };
          });

          return {
            ...data,
            pages,
          };
        }
      );
    },
    [channelId, queryClient]
  );

  useEffect(() => {
    socket.emit("join", { channelId });

    socket.on(SocketEvent.Message, onMessage);
    socket.on(SocketEvent.PollAnswer, onPollAnswer);

    return () => {
      socket.off(SocketEvent.Message, onMessage);
      socket.off(SocketEvent.PollAnswer, onPollAnswer);
      socket.off("connect");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId]);

  const [isSidePanelHidden, setIsSidePanelHidden] = useState(true);
  const toggleSidePanel = useCallback(() => {
    setIsSidePanelHidden((isHidden) => !isHidden);
  }, []);

  return {
    channelId,
    channelName,
    recipient,
    pinnedMessagesPopoverProps: popoverProps,
    pinnedMessages,
    isGetPinnedMessagesQueryFetching,
    isGetPinnedMessagesQueryLoading,
    messageReference,
    isSidePanelHidden,
    isScrollable,
    scrollContainerRef,
    openPinnedMessages,
    setMessageReference,
    toggleSidePanel,
    setIsScrollable,
    isRequestAccepted,
    groupedMessages,
    messages,
    skeletonsRef,
    getMessagesQueryResult: {
      ...getMessagesQueryResult,
      hasNextPage: getMessagesQueryResult.isLoading
        ? true
        : getMessagesQueryResult.hasNextPage,
    },
  };
}
