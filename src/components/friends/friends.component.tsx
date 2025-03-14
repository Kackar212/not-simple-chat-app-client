"use client";

import { getFriends } from "@common/api";
import { User } from "@common/api/schemas/user.schema";
import { FriendStatus } from "@common/enums/friend-status.enum";
import { socket, SocketEvent } from "@common/socket";
import { Friend } from "@components/friend/friend.component";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo } from "react";
import { FriendsList } from "./friends-list.component";

interface FriendsProps {
  status?: FriendStatus;
}

export function Friends({ status }: FriendsProps) {
  const queryKey = useMemo(() => ["get-friends", status], [status]);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: ({ pageParam }) => getFriends({ status }),
    select(data) {
      return data.data;
    },
    refetchOnWindowFocus: false,
  });

  const onStatus = useCallback(
    (user: User) => {
      queryClient.setQueryData(
        queryKey,
        (oldData: Awaited<ReturnType<typeof getFriends>>) => {
          const { data = [] } = oldData;
          const friends = [...data];

          const friendIndex = friends.findIndex(
            ({ username, isPending }) =>
              user.username === username && !isPending
          );

          if (friendIndex === -1) {
            return oldData;
          }

          const friend = friends[friendIndex];

          friends[friendIndex] = {
            ...friend,
            user: {
              ...friend.user,
              status: user.status,
            },
          };

          return {
            ...oldData,
            data: friends,
          };
        }
      );
    },
    [queryClient, queryKey]
  );

  useEffect(() => {
    socket.on(SocketEvent.Status, onStatus);

    return () => {
      socket.off(SocketEvent.Status, onStatus);
    };
  }, [onStatus]);

  return (
    <FriendsList
      status={status}
      isLoading={isLoading}
      friendsCount={data?.length}
    >
      {data?.map(({ user, isInvited, privateChannelId }) => (
        <Friend
          privateChannelId={privateChannelId}
          key={user.id}
          friend={user}
          status={user.status}
          isInvited={isInvited}
        />
      ))}
    </FriendsList>
  );
}
