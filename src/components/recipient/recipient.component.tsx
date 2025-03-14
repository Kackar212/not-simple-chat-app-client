import { getMutualData, QueryResponse } from "@common/api";
import { Recipient as RecipientEntity } from "@common/api/schemas/user.schema";
import { Avatar } from "@components/avatar/avatar.component";
import { Button } from "@components/button/button.component";
import { twMerge } from "tailwind-merge";
import { DirectMessageChannel } from "@common/api/schemas/direct-message-channel.schema";
import { useBlacklist } from "@common/api/hooks/use-blacklist.hook";
import { useQuery } from "@common/api/hooks/use-query.hook";
import { Updater, useFriends } from "@common/api/hooks/use-friends.hook";
import { useCallback } from "react";
import { AvatarSize } from "@common/constants";

interface RecipientProps {
  recipient: RecipientEntity;
  isBlocked: boolean;
  queryKey: unknown[];
}

export function Recipient({ recipient, isBlocked, queryKey }: RecipientProps) {
  const updater: Updater<QueryResponse<DirectMessageChannel, any>> =
    useCallback((data, { isInvited, isFriend, isPending, isDeleted }) => {
      return {
        ...data,
        data: {
          ...data.data,
          recipient: {
            ...data.data?.recipient,
            isInvited: !isInvited && !isDeleted,
            isFriend,
            hasFriendRequest: isPending && !isDeleted,
          },
        },
      };
    }, []);

  const {
    modifyFriends,
    isPending,
    data: { status },
  } = useFriends({
    queryKey,
    isFriend: recipient.isFriend,
    hasFriendRequest: recipient.hasFriendRequest,
    isBlocked: recipient.isBlocked,
    updater,
  });

  const {
    data: { mutualServers = [], mutualFriends = [] },
  } = useQuery({
    queryKey: ["get-mutual", recipient.id],
    queryFn: () => {
      return getMutualData(recipient.id);
    },
    select(data) {
      return {
        ...data,
        mutualServers: data.data?.mutualServers,
        mutualFriends: data.data?.mutualFriends,
      } as const;
    },
    refetchOnWindowFocus: false,
  });

  const modifyBlacklistMutation = useBlacklist({ queryKey, isBlocked });

  return (
    <section className="py-4 m-4">
      <header className="mb-3">
        <Avatar src={recipient.avatar} size={AvatarSize.XXXXL} />
        <h3 className="text-[2rem] leading-tight font-semibold my-2">
          <span className="sr-only">Recipient name: </span>
          {recipient.displayName}
        </h3>
        <span className="block -mt-2 mb-4">{recipient.username}</span>
      </header>
      <p className="mb-4 text-base">
        This is the beginning of private conversation with{" "}
        <span className="font-semibold">{recipient.username}</span>
      </p>
      <div className="flex flex-col lg:flex-row gap-8 gap-y-2 my-1.5">
        <span className="text-gray-330 flex items-center">
          {mutualServers.length || 0} Mutual servers
          <span className="flex size-1 mx-4 rounded-[50%] bg-black-430"></span>
          {mutualFriends.length || 0} Mutual friends
        </span>
        <div className="flex gap-3">
          {!isBlocked && (
            <Button
              onClick={async () => {
                if (isPending) {
                  return;
                }

                if (recipient.isInvited && !recipient.isFriend) {
                  return;
                }

                modifyFriends(recipient.username);
              }}
              mutationResult={status}
              isLoading={isPending}
              className={twMerge(
                "capitalize text-base leading-none font-[400] items-center gap-2 px-2 bg-green-500 aria-[current=page]:bg-gray-240/60 aria-[current=page]:font-[500] aria-[current=page]:text-white-500 hover:bg-gray-260/30 py-[4px] rounded-[0.25rem] text-white-500 inline-flex w-auto self-center",
                recipient.isFriend && "bg-red-500",
                recipient.isInvited &&
                  !recipient.isFriend &&
                  "p-1 px-2 leading-none bg-blue-500 rounded-[0.25rem] opacity-65 hover:bg-blue-500/100",
                recipient.hasFriendRequest &&
                  !recipient.isInvited &&
                  "bg-red-500"
              )}
            >
              {recipient.isFriend && <span>Remove friend</span>}
              {recipient.hasFriendRequest && !recipient.isInvited && (
                <span>Cancel request</span>
              )}
              {!recipient.isFriend && !recipient.hasFriendRequest && (
                <span>Add friend</span>
              )}
              {recipient.isInvited && !recipient.isFriend && (
                <span>Pending friend request</span>
              )}
            </Button>
          )}
          <Button
            onClick={() => {
              modifyBlacklistMutation.mutate(recipient.username);
            }}
            aria-label={`${isBlocked ? "Unblock" : "Block"} ${
              recipient.username
            }`}
            isLoading={modifyBlacklistMutation.isPending}
            mutationResult={modifyBlacklistMutation.data.status}
            className="capitalize text-base leading-none font-[400] items-center gap-2 px-2 aria-[current=page]:bg-gray-240/60 aria-[current=page]:font-[500] aria-[current=page]:text-white-500 py-[4px] rounded-[0.25rem] bg-gray-240 hover:bg-gray-200/30 text-white-500 inline-flex w-auto self-center"
          >
            {isBlocked ? <span>Unblock</span> : <span>Block</span>}
          </Button>
        </div>
      </div>
    </section>
  );
}
