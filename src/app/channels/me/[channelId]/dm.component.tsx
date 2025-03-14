"use client";

import {
  ApiError,
  getDirectMessageChannel,
  getMessages,
  QueryResponse,
} from "@common/api";
import { Chat } from "@components/chat/chat.component";
import { PropsWithChildren, use, useCallback, useEffect, useMemo } from "react";
import { useQuery } from "@common/api/hooks/use-query.hook";
import { socket, SocketEvent } from "@common/socket";
import { DirectMessageChannel as DirectMessageChannelEntity } from "@common/api/schemas/direct-message-channel.schema";
import { User } from "@common/api/schemas/user.schema";
import { QueryKey } from "@common/constants";
import { isNotFound } from "@common/api/api.utils";
import { NotFound } from "@components/not-found/not-found.component";
import { useQueryClient } from "@tanstack/react-query";
import Loading from "./loading";

interface DirectMessageChannel {
  params: Promise<{
    channelId: string;
  }>;
  messages: ReturnType<typeof getMessages>;
}

export default function DM({
  params,
  messages,
}: PropsWithChildren<DirectMessageChannel>) {
  const { channelId } = use(params);
  const m = use(messages);

  const queryClient = useQueryClient();
  const queryKey = useMemo(
    () => QueryKey.DirectMessageChannel(channelId),
    [channelId]
  );

  const {
    data: {
      data,
      status: { isSuccess },
      error,
    },
    refetch,
    isLoading,
  } = useQuery({
    queryKey,
    queryFn: () => getDirectMessageChannel({ channelId: +channelId }),
    refetchOnWindowFocus: false,
  });

  const onStatus = useCallback(
    (user: User) => {
      const recipientId = data?.recipient.id;

      queryClient.setQueryData(
        ["get-direct-message-channel", +channelId],
        (oldData: QueryResponse<DirectMessageChannelEntity, ApiError>) => {
          if (!oldData || user.id !== recipientId) {
            return oldData;
          }

          return {
            ...oldData,
            data: {
              ...oldData.data,
              recipient: {
                ...oldData.data?.recipient,
                status: user.status,
              },
            },
          };
        }
      );
    },
    [channelId, data?.recipient.id, queryClient]
  );

  useEffect(() => {
    socket.on(SocketEvent.Status, onStatus);

    return () => {
      socket.off(SocketEvent.Status, onStatus);
    };
  }, [onStatus]);

  if (isLoading) {
    return <Loading />;
  }

  if (isNotFound(error)) {
    return <NotFound />;
  }

  if (!data) {
    return <NotFound />;
  }

  const { isBlocked, isRequestAccepted, recipient, ...channel } = data;

  return (
    <Chat
      channelId={+channelId}
      channelName={recipient.displayName}
      isBlocked={isBlocked}
      isRequestAccepted={isRequestAccepted}
      channelType={channel.type}
      recipient={recipient}
      refetch={refetch}
      queryKey={queryKey}
      messages={messages}
    />
  );
}
