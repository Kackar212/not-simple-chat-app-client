"use client";

import Loading from "@/app/loading";
import { acceptFriend, deleteFriend } from "@common/api";
import { BasicUser } from "@common/api/schemas/user.schema";
import { ActivityStatus } from "@common/enums/activity-status.enum";
import { FriendStatus } from "@common/enums/friend-status.enum";
import { Avatar } from "@components/avatar/avatar.component";
import { Button } from "@components/button/button.component";
import { PlusIcon } from "@components/icons";
import { ChatBubbleIcon } from "@components/icons/chat-bubble.icon";
import { Link } from "@components/link/link.component";
import { Menu } from "@components/menu/menu.component";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useBlacklist } from "@common/api/hooks/use-blacklist.hook";
import { useModal } from "@components/modal/use-modal.hook";
import { MemberProfile } from "@components/member-profile/member-profile.component";
import { twMerge } from "tailwind-merge";
import { AvatarSize } from "@common/constants";
import CancelIcon from "/public/assets/icons/close.svg";

interface FriendProps {
  friend: BasicUser;
  status: FriendStatus | ActivityStatus;
  isInvited: boolean;
  privateChannelId?: number;
  isPending?: boolean;
  showOnlyMenu?: boolean;
}

export function Friend({
  friend,
  isInvited,
  privateChannelId,
  showOnlyMenu = false,
  status = FriendStatus.Pending,
}: FriendProps) {
  const acceptFriendMutation = useMutation({
    mutationFn: acceptFriend,
    onSuccess({ status: { isSuccess } }, username) {
      if (isSuccess) {
        return;
      }

      toast.error(
        `Sorry, you cant accept ${username} invite now. Try again later!`
      );
    },
  });

  const deleteFriendMutation = useMutation({
    mutationFn: deleteFriend,
    onSuccess({ status: { isSuccess } }, username) {
      if (isSuccess) {
        return;
      }

      toast.error(
        `Sorry, you cant accept ${username} invite now. Try again later!`
      );
    },
  });

  const isBlocked = status === FriendStatus.Blocked;
  const modifyBlacklistMutation = useBlacklist({
    queryKey: ["blacklist"],
    isBlocked,
  });

  const { avatar, displayName, username } = friend;
  const isLoading =
    deleteFriendMutation.isPending ||
    acceptFriendMutation.isPending ||
    modifyBlacklistMutation.isPending;

  const router = useRouter();

  const { isOpen, open, close, ref: profileModal } = useModal();

  const items = useMemo(
    () => [
      {
        label: "Send message",
        action: () => router.push(`/channels/me/${privateChannelId}`),
      },
      {
        label: "Open profile",
        action: open,
      },
      {
        label: "Block",
        isMutation: true,
        action: () => modifyBlacklistMutation.mutate(username),
      },
      {
        label: "Remove friend",
        isMutation: true,
        action: () => deleteFriendMutation.mutate(username),
      },
    ],
    [
      deleteFriendMutation,
      modifyBlacklistMutation,
      open,
      privateChannelId,
      router,
      username,
    ]
  );

  const acceptFriendInvitation = useCallback(() => {
    acceptFriendMutation.mutate(username);
  }, [acceptFriendMutation, username]);

  const isPending = status === FriendStatus.Pending;

  return (
    <motion.li
      className={twMerge(
        "relative my-2 cursor-pointer p-2 hover:bg-gray-260/30 rounded-md",
        isLoading && "hover:bg-black-600/100"
      )}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {isLoading && (
        <Loading className="z-10 bg-black-700/50 rounded-md absolute" />
      )}
      <div className="flex justify-between items-center w-full gap-2">
        <div className="flex gap-2 w-full">
          <Avatar
            src={avatar}
            size={AvatarSize.LG}
            status={friend.status}
            hiddenStatus={isBlocked || isPending}
            className="self-center"
          />
          <div className="flex flex-col justify-between text-black-800  leading-none w-full">
            <button
              className="min-w-28 h-4 text-white-500 before:absolute before:top-0 before:left-0 before:size-full"
              onClick={open}
              aria-label="Open profile"
            >
              <span className="font-[500] text-ellipsis whitespace-nowrap w-full overflow-hidden border-b border-b-transparent block text-left">
                {displayName}
              </span>
            </button>
            <span className="text-gray-360 text-sm leading-none">{status}</span>
          </div>
        </div>
        {isBlocked && (
          <div>
            <button
              className="bg-black-500/100 text-white-700 rounded-md p-4 py-1.5 text-sm font-normal hover:bg-black-430 hover:text-white-0 transition-colors duration-150 z-50"
              onClick={() => modifyBlacklistMutation.mutate(friend.username)}
            >
              Unblock
            </button>
          </div>
        )}
        {!isPending && !isBlocked && (
          <div className="flex gap-3">
            {!showOnlyMenu && privateChannelId !== -1 && (
              <Link
                href={`/channels/me/${privateChannelId}`}
                prefetch
                className="bg-black-630/100 hover:bg-black-700 p-1.5 rounded-[50%] z-10"
              >
                <span className="sr-only">Send private message</span>
                <ChatBubbleIcon aria-hidden className="stroke-white-0 size-5" />
              </Link>
            )}
            <Menu items={items} openButton={{ size: 32 }} />
          </div>
        )}
        {isPending && isInvited && (
          <Button
            data-tooltip-id="tooltip"
            data-tooltip-content="Cancel request"
            onClick={() => deleteFriendMutation.mutate(friend.username)}
            className="rounded-[50%] p-0 items-center justify-center bg-black-630/100 min-w-10 size-10"
          >
            <span className="sr-only">Cancel request</span>
            <CancelIcon className="stroke-white-500 scale-90" />
          </Button>
        )}
        {!isInvited && isPending && (
          <div className="flex gap-4 items-center z-10">
            <Button
              className="text-sm bg-green-500/100 p-1 rounded-md"
              isLoading={acceptFriendMutation.isPending}
              onClick={acceptFriendInvitation}
            >
              Accept
            </Button>
            <Button
              className="text-sm bg-red-500 p-1 rounded-md"
              isLoading={deleteFriendMutation.isPending}
              onClick={() => deleteFriendMutation.mutate(friend.username)}
            >
              Decline
            </Button>
          </div>
        )}
      </div>
      <MemberProfile
        close={close}
        isOpen={isOpen}
        modal={profileModal}
        userId={friend.id}
        isCurrentUser={false}
      />
    </motion.li>
  );
}
