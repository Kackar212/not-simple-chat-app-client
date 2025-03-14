import { getQueryClient } from "@/app/get-query-client";
import { ApiError, QueryResponse } from "@common/api";
import { MessagesResponseWithCursor } from "@common/api/schemas/message.schema";
import { QueryKey } from "@common/constants";
import { ServerSocketEvents } from "@common/interfaces/server-socket.events.interface";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

interface UseOnReactionProps {
  channelId: number;
}

export function useOnReaction({ channelId }: UseOnReactionProps) {
  const queryClient = useQueryClient();

  return useCallback<ServerSocketEvents["reaction"]>(
    ({ emojiName, emoji, id: reactionId, messageId, count }) => {
      const getMessagesQueryKey = QueryKey.Messages(channelId);

      queryClient.setQueryData(
        getMessagesQueryKey,
        (
          oldMessages: InfiniteData<
            QueryResponse<MessagesResponseWithCursor, ApiError>
          >
        ) => {
          const pageIndex = oldMessages.pages.findIndex(
            (page) =>
              !!page.data?.messages.find((message) => message.id === messageId)
          );
          const pages = [...oldMessages.pages];
          const page = pages[pageIndex];

          if (!page.data) {
            return oldMessages;
          }

          const newMessages = page.data.messages.map((message) => {
            if (message.id !== messageId) {
              return message;
            }

            const { reactions } = message;

            const reactionAlreadyExists =
              reactions.length > 0 &&
              reactions.some((reaction) => reaction.emoji.name === emojiName);

            const newReactions = reactions
              .map((reaction) => {
                const isMutatedReaction = reaction.emoji.name === emojiName;

                if (!isMutatedReaction) {
                  return reaction;
                }

                if (reaction.me) {
                  return {
                    ...reaction,
                    count,
                    me: false,
                    id: undefined,
                  };
                }

                return {
                  ...reaction,
                  count,
                  me: true,
                  id: reactionId,
                };
              })
              .filter(({ count }) => count > 0);

            if (!reactionAlreadyExists) {
              newReactions.push({
                count,
                emoji: emoji ? emoji : { name: emojiName },
                me: true,
                id: reactionId,
              });
            }

            return {
              ...message,
              reactions: newReactions,
            };
          });

          pages[pageIndex] = {
            ...page,
            data: {
              ...page.data,
              messages: newMessages,
            },
          };

          return {
            ...oldMessages,
            pages,
          };
        }
      );
    },
    [channelId, queryClient]
  );
}
