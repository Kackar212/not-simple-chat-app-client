import { getQueryClient } from "@/app/get-query-client";
import { ApiError, QueryResponse } from "@common/api";
import {
  MessagesResponseWithCursor,
  MessageWithBaseUserSchema,
} from "@common/api/schemas/message.schema";
import { User } from "@common/api/schemas/user.schema";
import { QueryKey } from "@common/constants";
import { MessageType } from "@common/enums/message-type.enum";
import { ServerSocketEvents } from "@common/interfaces/server-socket.events.interface";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

interface UseOnMessageProps {
  user: User;
}

export function useOnMessage({ user }: UseOnMessageProps) {
  const queryClient = useQueryClient();

  const getMessagesWithout = useCallback(
    (
      deletedMessageId: number,
      old: InfiniteData<QueryResponse<MessagesResponseWithCursor, ApiError>>
    ) => {
      return {
        ...old,
        pages: old.pages.map((page) => {
          return {
            ...page,
            data: {
              ...page.data,
              messages: page.data?.messages.filter(
                (message) => message.id !== deletedMessageId
              ),
            },
          };
        }),
      };
    },
    []
  );

  return useCallback<ServerSocketEvents["message"]>(
    async (message) => {
      const queryKey = QueryKey.Messages(message.channelId);
      const pinnedMessagesQueryKey = QueryKey.PinnedMessages(message.channelId);

      queryClient.setQueryData(
        pinnedMessagesQueryKey,
        (oldData?: QueryResponse<MessagesResponseWithCursor, ApiError>) => {
          if (!oldData?.data) {
            return oldData;
          }

          const messages = [...oldData.data.messages];

          if (message.isPinned) {
            messages.push(message);
          }

          if (!message.isPinned) {
            const index = messages.findIndex(({ id }) => message.id === id);

            messages.splice(index, 1);
          }

          return {
            ...oldData,
            data: {
              ...oldData.data,
              messages,
            },
          };
        }
      );

      queryClient.setQueryData(
        queryKey,
        (
          old?: InfiniteData<
            QueryResponse<MessagesResponseWithCursor, ApiError>
          >
        ) => {
          if (!old) {
            return old;
          }

          const pages = [...old.pages];
          const newMessage = MessageWithBaseUserSchema.parse(message);

          const pageIndex = pages.findIndex(({ data }) =>
            data?.messages.find((message) => message.id === newMessage.id)
          );
          const page = pages[pageIndex];

          if (newMessage.isDeleted) {
            return getMessagesWithout(newMessage.id, old);
          }

          if (page && page.data) {
            pages[pageIndex] = {
              ...page,
              data: {
                ...page.data,
                messages: page.data.messages.map((message) => {
                  if (newMessage.id === message.id) {
                    return { ...message, ...newMessage };
                  }

                  return message;
                }),
              },
            };

            return {
              ...old,
              pages,
            };
          }

          const firstPage = pages.shift();

          if (!firstPage?.data) {
            return old;
          }

          const isMessageSentByDifferentUser =
            user.id !== newMessage.member.user.id;

          if (
            isMessageSentByDifferentUser ||
            newMessage.type === MessageType.ReplyToPinnedMessage ||
            newMessage.isSystemMessage ||
            newMessage.poll
          ) {
            const optimisticMessages = firstPage.data.messages.filter(
              (message) => message.type === MessageType.Optimistic
            );
            const normalMessages = firstPage.data.messages.filter(
              (message) => message.type !== MessageType.Optimistic
            );

            const updatedPage = {
              ...firstPage,
              data: {
                messages: [
                  ...optimisticMessages,
                  newMessage,
                  ...normalMessages,
                ],
              },
            };

            return {
              ...old,
              pages: [updatedPage, ...pages],
            };
          }

          if (!isMessageSentByDifferentUser) {
            const updatedMessages = firstPage.data?.messages.map((message) => {
              if (message.type !== MessageType.Optimistic) {
                return message;
              }

              return { ...message, ...newMessage };
            });

            return {
              ...old,
              pages: [
                {
                  ...firstPage,
                  data: { messages: updatedMessages },
                },
                ...pages,
              ],
            };
          }
        }
      );
    },
    [getMessagesWithout, queryClient, user.id]
  );
}
