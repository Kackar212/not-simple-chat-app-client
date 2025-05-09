"use client";

import { getDirectMessageChannel, getMessages, getServer } from "@common/api";
import { Direction } from "@common/api/hooks";
import { QueryKey } from "@common/constants";
import { isString } from "@common/utils";
import { ServerList } from "@components/server-list/server-list.component";
import { usePrefetchQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { PropsWithChildren, useEffect } from "react";

export default function ChatLayout({ children }: PropsWithChildren) {
  // const queryClient = useQueryClient();

  // const params = useParams<{
  //   channelId?: string | string[];
  //   serverId?: string;
  // }>();
  // const serverId = params.serverId ? Number(params.serverId) : -1;
  // const isChannelIdOptional = Array.isArray(params.channelId);
  // let channelId = params.channelId ? Number(params.channelId) : -1;

  // if (params.channelId && isChannelIdOptional) {
  //   channelId = Number(params.channelId[0]);
  // }

  // usePrefetchQuery({
  //   queryKey: QueryKey.Server(serverId),
  //   queryFn: serverId ? () => getServer({ serverId }) : () => ({}),
  // });

  // usePrefetchQuery({
  //   queryKey: QueryKey.DirectMessageChannel(channelId),
  //   queryFn: () => getDirectMessageChannel({ channelId: channelId }),
  // });

  // useEffect(() => {
  //   async function prefetchDirectMessageChannel() {
  //     if (isChannelIdOptional || !channelId) {
  //       return;
  //     }

  //     // await queryClient.prefetchQuery({
  //     //   queryKey: QueryKey.DirectMessageChannel(channelId),
  //     //   queryFn: () => getDirectMessageChannel({ channelId: +channelId }),
  //     // });
  //   }

  //   prefetchDirectMessageChannel();
  // }, [channelId, serverId, isChannelIdOptional, queryClient]);

  return (
    <>
      <ServerList />
      <div className="flex w-full relative">{children}</div>
    </>
  );
}
