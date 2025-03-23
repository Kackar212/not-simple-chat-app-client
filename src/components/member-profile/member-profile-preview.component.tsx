import { ApiError, getProfile, QueryResponse } from "@common/api";
import React, { useCallback, useEffect, useState } from "react";
import { User } from "@common/api/schemas/user.schema";
import { Avatar } from "@components/avatar/avatar.component";
import { ProfileHeader } from "@components/profile-header/profile-header.component";
import { socket, SocketEvent } from "@common/socket";
import { useModal } from "@components/modal/use-modal.hook";
import { MemberProfile } from "./member-profile.component";
import { MemberRoles } from "@components/member/member-roles.component";
import { useGetProfile } from "../member/use-get-profile.hook";
import { twMerge } from "tailwind-merge";
import { Link } from "@components/link/link.component";
import { Friend } from "@components/friend/friend.component";
import { format } from "date-fns";
import { ProfileSkeleton } from "@components/skeleton/profile-skeleton.component";
import { UserProfile } from "@common/api/schemas/user-profile-with-mutual.schema";
import { useQueryClient } from "@tanstack/react-query";
import { ServerIcon } from "@components/server-icon/server-icon.component";
import { plural } from "@common/utils";
import { Mutual } from "./mutual.component";
import { AvatarSize } from "@common/constants";
import { getQueryClient } from "@/app/get-query-client";

interface MemberProfileProps {
  isCurrentUser: boolean;
  isStatic?: boolean;
  serverId?: number;
  userId: number;
  data?: Awaited<ReturnType<typeof getProfile>>["data"];
  isLoading?: boolean;
  isProfileOpen?: boolean;
}

export function MemberProfilePreview({
  isCurrentUser,
  serverId,
  userId,
  isStatic = false,
  isProfileOpen = true,
}: MemberProfileProps) {
  const [showMore, setShowMore] = useState(false);
  const queryClient = useQueryClient();

  const { open, isOpen, close, ref: modal } = useModal();

  const { data, queryKey, isLoading } = useGetProfile({
    serverId,
    userId,
    isOpen: isProfileOpen,
  });

  const onStatus = useCallback(
    function onStatus(user: User) {
      queryClient.setQueryData(
        queryKey,
        (data: QueryResponse<UserProfile, ApiError>) => {
          if (!data) {
            return data;
          }

          if (user.id !== userId) {
            return {
              ...data,
              data: {
                ...data.data,
                mutualFriends: data.data?.mutualFriends.map((friend) => {
                  const {
                    user: { id },
                  } = friend;

                  if (user.id !== id) {
                    return friend;
                  }

                  return {
                    ...friend,
                    user: { ...friend.user, status: user.status },
                  };
                }),
              },
            };
          }

          return {
            ...data,
            data: {
              ...data.data,
              user: {
                ...data.data?.user,
                status: user.status,
              },
            },
          };
        }
      );
    },
    [queryClient, queryKey, userId]
  );

  useEffect(() => {
    socket.on(SocketEvent.Status, onStatus);

    return () => {
      socket.off(SocketEvent.Status, onStatus);
    };
  }, [onStatus]);

  const openFullProfile = () => {
    open();
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!data) {
    return null;
  }

  const {
    mutualServers,
    mutualFriends,
    user,
    isFriend,
    isInvited,
    hasFriendRequest,
    friend,
  } = data;

  const serversCount = mutualServers.length;
  const friendsCount = mutualFriends.length;
  const hasMutualFriends = friendsCount > 0;
  const hasMutualServers = serversCount > 0;

  const profileHeaderProps = {
    user,
    isCurrentUser: isCurrentUser,
    isFriend,
    isInvited,
    hasFriendRequest,
    queryKey,
    friend,
    openProfile: open,
  };

  const profile = (
    <MemberProfile
      close={close}
      isOpen={isOpen}
      modal={modal}
      userId={userId}
      serverId={serverId}
      isCurrentUser={isCurrentUser}
    >
      <ProfileHeader {...profileHeaderProps} inModal={true} />
    </MemberProfile>
  );

  const formattedDate = format(user.createdAt, "dd MMM, y");
  const hasMutualData = hasMutualFriends || hasMutualServers;

  const joinedServerAt =
    user.joinedServerAt && format(user.joinedServerAt, "dd MMM, y");

  if (isOpen && !isStatic) {
    return profile;
  }

  return (
    <>
      <div
        className={twMerge(
          "bg-black-800/100 text-inherit relative overflow-auto pb-4 scrollbar rounded-md max-w-[286px]",
          isStatic && "rounded-none bg-black-700 h-full"
        )}
      >
        <ProfileHeader {...profileHeaderProps} inModal={false} />
        {!!user.description && (
          <div className="px-4 text-sm text-white-500">
            <p
              className={twMerge(
                "max-h-12 overflow-hidden text-ellipsis py-2",
                showMore && "max-h-fit"
              )}
            >
              {user.description}
            </p>
            <button
              className="mt-1 underline"
              onClick={() => setShowMore((showMore) => !showMore)}
            >
              More
            </button>
          </div>
        )}
        <div className="px-4 text-white-500">
          {!isStatic && hasMutualData && (
            <div className="flex flex-col text-sm">
              <h2 className="text-xs my-1 font-semibold">Mutual</h2>
              <div className="flex items-center gap-2">
                {friendsCount > 0 && (
                  <button
                    className="flex items-center hover:underline"
                    onClick={openFullProfile}
                  >
                    {mutualFriends
                      .slice(0, hasMutualServers ? 1 : 3)
                      .map(({ user: { id, avatar } }, index) => (
                        <div
                          key={id}
                          style={
                            {
                              "--tw-translate-x": `-${index * 0.375}rem`,
                            } as React.CSSProperties
                          }
                          className="translate-x-0"
                        >
                          <Avatar
                            src={avatar}
                            size={AvatarSize.XS}
                            className="border-2 border-black-800 last-of-type:mr-1"
                          />
                        </div>
                      ))}
                    <span>
                      {friendsCount} mutual {plural.friend(friendsCount)}
                    </span>
                  </button>
                )}
                {hasMutualFriends && hasMutualServers && (
                  <span className="flex size-1 rounded-[50%] bg-white-0"></span>
                )}
                {serversCount > 0 && (
                  <button
                    className="flex items-center hover:underline"
                    onClick={openFullProfile}
                  >
                    {mutualServers
                      .slice(0, hasMutualFriends ? 0 : 3)
                      .map((server, index) => (
                        <div
                          key={server.id}
                          style={
                            {
                              "--tw-translate-x": `-${index * 0.375}rem`,
                            } as React.CSSProperties
                          }
                          className="translate-x-0"
                        >
                          <ServerIcon
                            server={server}
                            size={AvatarSize.XS}
                            className="border-2 border-black-800"
                          />
                        </div>
                      ))}
                    <span>
                      {serversCount} mutual {plural.server(serversCount)}
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}
          {!isStatic && (
            <>
              <div className="flex flex-col bg-black-800 rounded-md gap-1 mt-4">
                <h3 className="text-xs font-semibold">Member since</h3>
                <span className="text-sm">{joinedServerAt}</span>
              </div>
              <MemberRoles roles={user.roles} />
            </>
          )}
          {isStatic && (
            <div className="mt-3 text-white-500">
              <div className="flex flex-col bg-black-800 rounded-md p-3 gap-2">
                <h3 className="text-xs font-semibold">Member since</h3>
                <span className="text-sm">{formattedDate}</span>
              </div>
              {hasMutualServers && (
                <div className="mt-3 rounded-md p-3 bg-black-800 font-semibold">
                  <h3 className="mb-4 text-xs">
                    <span className="sr-only">
                      You have {serversCount} mutual{" "}
                      {plural.server(serversCount)} with this user
                    </span>
                    <span aria-hidden>Mutual servers — {serversCount}</span>
                  </h3>
                  {mutualServers.map(
                    ({
                      id,
                      serverIcon,
                      name,
                      iconPlaceholder,
                      members: [{ profile }],
                      channels: [channel],
                    }) => (
                      <Mutual
                        key={id}
                        id={id}
                        src={serverIcon}
                        name={name}
                        iconPlaceholder={iconPlaceholder}
                        displayName={profile.displayName}
                        channelId={channel.id}
                      />
                    )
                  )}
                </div>
              )}
              {hasMutualFriends && (
                <div className="mt-3 rounded-md p-3 bg-black-800 font-semibold">
                  <h3 className="mb-4 text-xs">
                    <span className="sr-only">
                      You have {friendsCount} mutual{" "}
                      {plural.friend(friendsCount)} with this user.
                    </span>
                    <span aria-hidden>Mutual friends — {friendsCount}</span>
                  </h3>
                  <ul>
                    {mutualFriends.map((friend) => {
                      return (
                        <Friend
                          friend={friend.user}
                          status={friend.user.status}
                          isInvited={friend.isInvited}
                          key={friend.friendName}
                          privateChannelId={friend.privateChannelId}
                          showOnlyMenu={true}
                        />
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {profile}
    </>
  );
}
