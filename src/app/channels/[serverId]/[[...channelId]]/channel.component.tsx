"use client";

import { ApiError, getMessages, getServer, QueryResponse } from "@common/api";
import { ChannelType } from "@common/enums/channel-type.enum";
import { Chat } from "@components/chat/chat.component";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSafeContext } from "@common/hooks";
import { authContext } from "@common/auth/auth.context";
import { socket, SocketEvent } from "@common/socket";
import { ActivityStatus } from "@common/enums/activity-status.enum";
import { BaseServer, UserServer } from "@common/api/schemas/server.schema";
import { toast } from "react-toastify";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { NotFound } from "@components/not-found/not-found.component";
import { QueryKey } from "@common/constants";
import Loading from "@/app/loading";

interface ServerPageProps {
  params: {
    serverId: string;
    channelId: string[];
  };
  messages: ReturnType<typeof getMessages>;
}

export default function Channel({ params, messages }: ServerPageProps) {
  const { serverId } = params;
  const channelId = Number(params.channelId[0]);
  console.log(messages);
  const queryClient = useQueryClient();

  const {
    data: {
      data: server,
      status: { isSuccess, isError },
    },
    isLoading,
  } = useSuspenseQuery<Awaited<ReturnType<typeof getServer>>>({
    queryKey: QueryKey.Server(+serverId),
    queryFn: () => getServer({ serverId }),
  });

  const router = useRouter();

  const channel = server?.channels.find((channel) => {
    return channel.id === +channelId;
  });

  const firstTextChannel = server?.channels.find(
    (channel) => channel.type === ChannelType.Text
  );

  const {
    auth: { member },
  } = useSafeContext(authContext);

  useEffect(() => {
    socket.on(SocketEvent.Channel, ({ isDeleted, ...channel }) => {
      queryClient.setQueryData(
        ["get-server", +serverId],
        (old: Awaited<ReturnType<typeof getServer>>) => {
          if (!old.data) {
            return;
          }

          const channels = [...old.data.channels];
          const existingChannelIndex = channels.findIndex(
            ({ id }) => channel.id === id
          );

          if (isDeleted && existingChannelIndex !== -1) {
            channels.splice(existingChannelIndex, 1);
          }

          if (!isDeleted && existingChannelIndex !== -1) {
            const existingChannel = channels[existingChannelIndex];

            channels[existingChannelIndex] = { ...existingChannel, ...channel };
          }

          if (existingChannelIndex === -1) {
            channels.push(channel);
          }

          return {
            ...old,
            data: {
              ...old.data,
              channels,
            },
          };
        }
      );
    });
  }, [queryClient, serverId]);

  useEffect(() => {
    socket.emit(SocketEvent.Status, {
      status: ActivityStatus.Online,
      serverId: +serverId,
      memberId: member.id,
    });

    const onUserPunished = ({
      type,
      serverId,
    }: {
      type: "ban" | "kick";
      serverId: number;
    }) => {
      const servers = queryClient.getQueryData<
        QueryResponse<UserServer[], ApiError>
      >(["get-user-servers"]);

      if (!servers?.data) {
        return;
      }

      if (type === "ban") {
        queryClient.setQueryData(
          ["get-user-servers"],
          (old: QueryResponse<BaseServer[], ApiError>) => {
            if (!old) {
              return old;
            }

            return {
              ...old,
              data: old.data?.filter((server) => server.id !== serverId) || [],
            };
          }
        );
      }

      const server = servers.data.find((server) => server.id === serverId);

      if (!server) {
        return;
      }

      toast.error(
        type === "kick" ? (
          <span>You have been kicked out of {server.name}!.</span>
        ) : (
          "You have been banned!"
        ),
        { closeOnClick: true, autoClose: 5000 }
      );

      router.replace("/channels/me/friends");
    };

    socket.on(SocketEvent.Punished, onUserPunished);

    return () => {
      socket.emit(SocketEvent.Status, {
        status: ActivityStatus.Offline,
        serverId: +serverId,
        memberId: member.id,
      });

      socket.off(SocketEvent.Punished, onUserPunished);
    };
  }, [member.id, queryClient, router, serverId]);

  useEffect(() => {
    if (!isError && !isSuccess) {
      return;
    }

    if (!channelId && firstTextChannel) {
      router.replace(`${serverId}/${firstTextChannel.id}`);
    }
  }, [
    router,
    server,
    channel,
    channelId,
    firstTextChannel,
    serverId,
    isSuccess,
    isError,
  ]);

  if (isLoading) {
    return (
      <Loading className="absolute top-0 left-0 right-0 bottom-0 z-[107] bg-black-600" />
    );
  }

  if (!channel) {
    return <NotFound />;
  }

  const { channels } = server!;

  if (channels.length === 0) {
    return (
      <div className="flex items-center justify-center">
        <h2>No text channels</h2>
        <p>
          Maybe you dont have access to any or there are none in this server.
        </p>
      </div>
    );
  }

  return (
    <Chat
      channelId={channel.id}
      channelName={channel.name.join("")}
      channelType={channel.type}
      server={server}
      isRequestAccepted={true}
    />
  );
}
