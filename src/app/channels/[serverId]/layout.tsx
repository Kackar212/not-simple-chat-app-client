"use client";

import { ApiError, getServer, QueryResponse } from "@common/api";
import {
  isForbidden,
  isNotFound,
  isResponseStatusError,
} from "@common/api/api.utils";
import { CustomEmoji } from "@common/api/schemas/emoji.schema";
import { AuthAction } from "@common/auth/auth-action.enum";
import { authContext } from "@common/auth/auth.context";
import { QueryKey } from "@common/constants";
import { Emoji, EmojiType } from "@common/emojis/emoji.class";
import { EmojiMemoryStorage } from "@common/emojis/emojis.storage";
import { useSafeContext } from "@common/hooks";
import { socket, SocketEvent } from "@common/socket";
import { Channels } from "@components/channels/channels.component";
import { NotFound } from "@components/not-found/not-found.component";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { PropsWithChildren, use, useEffect } from "react";

interface LayoutProps {
  params: Promise<{
    serverId: string;
  }>;
}

export default function Layout({
  children,
  params,
}: PropsWithChildren<LayoutProps>) {
  const { serverId } = use(params);

  const { dispatch } = useSafeContext(authContext);

  const queryClient = useQueryClient();

  useEffect(() => {
    socket.on(SocketEvent.Emoji, (emojiData: CustomEmoji) => {
      const emoji = new Emoji(emojiData, EmojiType.Custom);

      if (!emoji.isLocked(Number(serverId))) {
        EmojiMemoryStorage.set(emoji);
      }

      dispatch({ type: AuthAction.AddEmoji, payload: emojiData });

      queryClient.setQueryData(
        ["get-server-emojis", emojiData.serverId],
        (old: QueryResponse<CustomEmoji[], ApiError>) => {
          if (!old) {
            return old;
          }

          const emojis = old.data || [];

          return {
            ...old,
            data: [...emojis, emoji],
          };
        }
      );
    });

    return () => {
      socket.off(SocketEvent.Emoji);
    };
  }, [dispatch, queryClient, serverId]);

  const isServerIdNumber = !Number.isNaN(Number(serverId));

  const {
    data: { data: server, error },
  } = useSuspenseQuery<Awaited<ReturnType<typeof getServer>>>({
    queryKey: QueryKey.Server(+serverId),
    queryFn: () => getServer({ serverId }),
  });

  if (error && !isResponseStatusError(error)) {
    throw new Error(
      "There is bug in my code, lets fallback to error boundary UI until error is fixed."
    );
  }

  if (isForbidden(error)) {
    return <div>{error.error.message}</div>;
  }

  if (isNotFound(error) || !isServerIdNumber) {
    return <NotFound />;
  }

  return (
    <>
      <Channels server={server} channels={server?.channels} />
      {children}
    </>
  );
}
