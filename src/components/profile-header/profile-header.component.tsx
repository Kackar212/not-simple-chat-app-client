import { UserStatus } from "@components/user-status/user-status.component";
import OwnerIcon from "/public/assets/icons/owner.svg";
import AlreadyFriendIcon from "/public/assets/icons/already-friend.svg";
import InviteIcon from "/public/assets/icons/invite.svg";
import CancelRequestIcon from "/public/assets/icons/cancel-request.svg";
import FriendPendingIcon from "/public/assets/icons/friend-pending.svg";
import { useMutation } from "@common/api/hooks/use-mutation.hook";
import { getServer, mutations, QueryResponse } from "@common/api";
import { Loader } from "@components/loader/loader.component";
import { Menu } from "@components/menu/menu.component";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "@components/link/link.component";
import { ChatBubbleIcon } from "@components/icons/chat-bubble.icon";
import { Friend } from "@common/api/schemas/friend.schema";
import UnblockUserIcon from "/public/assets/icons/unblock.svg";
import { twMerge } from "tailwind-merge";
import { Updater, useFriends } from "@common/api/hooks/use-friends.hook";
import { useSafeContext } from "@common/hooks";
import { authContext } from "@common/auth/auth.context";
import { useBlacklist } from "@common/api/hooks";
import { UserProfile } from "@common/api/schemas/user-profile-with-mutual.schema";
import { useQueryClient } from "@tanstack/react-query";
import { Avatar } from "@components/avatar/avatar.component";
import { AvatarSize } from "@common/constants";
import { getQueryClient } from "@/app/get-query-client";

interface ProfileHeaderProps {
  user: UserProfile["user"];
  isCurrentUser?: boolean;
  isInvited?: boolean;
  isFriend?: boolean;
  hasFriendRequest?: boolean;
  inModal?: boolean;
  queryKey?: unknown[];
  friend?: Pick<Friend, "privateChannelId"> | null;
  openProfile?: () => void;
  isBlocked?: boolean;
}

export function ProfileHeader({
  user,
  isCurrentUser = true,
  isInvited,
  isFriend,
  hasFriendRequest,
  inModal = false,
  queryKey = [],
  friend,
  openProfile,
  isBlocked,
}: ProfileHeaderProps) {
  const queryClient = useQueryClient();
  const [headerWidth, setHeaderWidth] = useState(550);

  const updater: Updater<QueryResponse<any, unknown>> = useCallback(
    (old, { isFriend, isInvited, isPending }) => {
      return {
        ...old,
        data: {
          ...old.data,
          isFriend,
          isInvited,
          hasFriendRequest: isPending,
        },
      };
    },
    []
  );

  const ref = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const onResize = () => {
      setHeaderWidth(
        Math.min(
          ref.current?.clientWidth || 550,
          Math.floor(document.body.clientWidth * (inModal ? 0.91 : 1))
        )
      );
    };

    onResize();

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [inModal]);

  const { modifyFriends, data, isPending } = useFriends({
    queryKey,
    isFriend,
    isBlocked,
    hasFriendRequest,
    updater,
  });

  const { mutate: modifyBlacklist } = useBlacklist({
    queryKey,
    isBlocked: user.isBlocked,
  });

  const { mutate: punishMember } = useMutation({
    mutationFn: mutations.punishMember,
    onSuccess(_data, { isBanned }) {
      queryClient.setQueryData(
        ["get-server", user.serverId],
        (old: Awaited<ReturnType<typeof getServer>>) => {
          if (!isBanned) {
            return;
          }

          if (!old) {
            return old;
          }

          const newMembers = old.data?.members.filter(
            (member) => member.id !== user.memberId
          );

          return {
            ...old,
            data: {
              ...old.data,
              members: newMembers,
            },
          };
        }
      );
    },
  });

  const {
    auth: { member },
  } = useSafeContext(authContext);

  const canPunish = !isCurrentUser && member.isOwner && !!user.serverId;

  const items = useMemo(
    () => [
      {
        label: "Open profile",
        action: openProfile,
      },
      {
        label: user.isBlocked ? "Unblock" : "Block",
        isMutation: true,
        enabled: !isCurrentUser,
        action() {
          modifyBlacklist(user.username);
        },
      },
      {
        label: "Ban",
        isMutation: true,
        enabled: canPunish,
        action() {
          if (!user.serverId) {
            return;
          }

          punishMember({
            memberId: user.memberId,
            isBanned: true,
            serverId: user.serverId,
          });
        },
      },
      {
        label: "Kick",
        isMutation: true,
        enabled: canPunish,
        action() {
          if (!user.serverId) {
            return;
          }

          punishMember({
            memberId: user.memberId,
            isKicked: true,
            serverId: user.serverId,
          });
        },
      },
    ],
    [
      canPunish,
      isCurrentUser,
      modifyBlacklist,
      openProfile,
      punishMember,
      user.isBlocked,
      user.memberId,
      user.serverId,
      user.username,
    ]
  );

  let ariaLabel = "Cancel request";

  if (isFriend && !hasFriendRequest) {
    ariaLabel = "Remove friend";
  }

  if (!isFriend && !hasFriendRequest) {
    ariaLabel = "Add friend";
  }

  const maskId = `border-mask-${inModal ? "profile-" : ""}${user.id}`;
  const headerHeight = inModal ? 150 : 112;

  return (
    <>
      <div ref={ref}>
        <div className="flex gap-2 absolute right-2 top-2">
          {!isCurrentUser && !isInvited && !user.isBlocked && (
            <button
              data-tooltip-id="tooltip"
              data-tooltip-content={ariaLabel}
              aria-label={ariaLabel}
              className="grid content-center justify-center size-8 bg-black-700 rounded-[50%] p-2 text-gray-150 relative"
              onClick={async () => {
                if (isPending) {
                  return;
                }

                modifyFriends(user.username);
              }}
            >
              {isPending && (
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black-800/50 z-10">
                  <Loader />
                </span>
              )}
              {isFriend && !hasFriendRequest && (
                <AlreadyFriendIcon className="size-5" />
              )}
              {!isFriend && !hasFriendRequest && (
                <InviteIcon className="size-5" />
              )}
              {hasFriendRequest && <CancelRequestIcon className="size-5" />}
            </button>
          )}
          {!isCurrentUser && isInvited && !user.isBlocked && (
            <span
              data-tooltip-id="tooltip"
              data-tooltip-content="Pending"
              className="grid content-center justify-center size-7 bg-black-700 text-gray-150"
              style={
                {
                  "--svg-background":
                    "hsl(225 calc( 1 * 6.3%) 12.5% / var(--tw-bg-opacity, 1))",
                } as React.CSSProperties
              }
            >
              <span className="sr-only">Friend request is pending</span>
              <FriendPendingIcon className="size-5" />
            </span>
          )}
          {((inModal && !isCurrentUser) || !inModal) && (
            <Menu
              items={items}
              openButton={{ size: 32 }}
              placement="left-start"
              offset={{ mainAxis: 10 }}
            />
          )}
        </div>
        <svg
          viewBox={`0 0 ${headerWidth} ${headerHeight}`}
          style={{
            width: headerWidth,
            minHeight: headerHeight,
          }}
        >
          <mask id={maskId}>
            <rect fill="white" x="0" y="0" width="100%" height="100%"></rect>
            {inModal ? (
              <circle fill="black" cx="50" cy="151" r="46"></circle>
            ) : (
              <circle fill="black" cx="50" cy="104" r="46"></circle>
            )}
          </mask>
          <foreignObject
            x={0}
            y={0}
            width="100%"
            height="100%"
            mask={`url(#${maskId})`}
            overflow="visible"
          >
            <div
              style={{
                height: headerHeight,
                minHeight: headerHeight,
                background: `${user.backgroundColor} ${
                  user.backgroundImage ? `url(${user.backgroundImage})` : ""
                }`,
              }}
            ></div>
          </foreignObject>
        </svg>
        {/* </div> */}
        <div className={twMerge("h-8", inModal && "h-12")}>
          <button
            aria-label={inModal ? undefined : "Open profile"}
            className={twMerge(
              "absolute left-2 top-16 size-20 z-10",
              inModal && "pointer-events-none",
              inModal && "top-28"
            )}
            onClick={openProfile}
            tabIndex={inModal ? -1 : undefined}
            role={inModal ? "generic" : undefined}
          >
            <div
              className={twMerge(
                "rounded-[50%] h-full relative  before:transition-colors cursor-default before:absolute before:top-0 before:left-0.5 before:size-full before:z-10 before:rounded-[50%]",
                !inModal && "hover:before:bg-black-300/40 cursor-pointer"
              )}
            >
              <Avatar
                size={AvatarSize.XXXXL}
                src={user.avatar}
                status={user.status}
                containerClassName=""
              />
            </div>
          </button>
        </div>
      </div>
      <div className="flex justify-between items-start mx-4 mt-1 gap-1.5">
        <div className=" text-white-0 flex flex-col gap-1 mb-3">
          <span className="flex items-center gap-1 text-lg font-bold leading-8">
            <span
              data-tooltip-id="tooltip"
              data-tooltip-content={user.displayName}
              className="text-ellipsis overflow-hidden whitespace-nowrap"
            >
              {user.displayName}
            </span>
            {user.isOwner && (
              <span className="min-w-6 min-h-6">
                <OwnerIcon aria-hidden />
              </span>
            )}
          </span>
          <span
            className="text-sm inline max-w-full w-fit text-ellipsis overflow-hidden whitespace-nowrap"
            data-tooltip-id="tooltip"
            data-tooltip-content={user.username}
          >
            {user.username}
          </span>
        </div>
        <div className="flex gap-1">
          {user.isBlocked && (
            <button
              data-tooltip-id="tooltip"
              data-tooltip-content="Unblock"
              className="text-white-0 items-center justify-items-center bg-gray-260 px-2 py-1 hover:bg-gray-500 transition-colors rounded-sm"
              onClick={() => modifyBlacklist(user.username)}
            >
              <span className="sr-only">Unblock</span>
              <UnblockUserIcon aria-hidden className="size-6" />
            </button>
          )}
          {friend && friend.privateChannelId !== -1 && (
            <Link
              href={`/channels/me/${friend.privateChannelId}`}
              className="text-white-0 text-sm font-medium  gap-1 flex rounded-sm bg-gray-260 hover:bg-gray-500 transition-colors px-2 py-1 items-center leading-none"
              data-tooltip-id="tooltip"
              data-tooltip-content="Send message"
              data-tooltip-hidden={inModal}
            >
              <ChatBubbleIcon className="fill-current" />
              <span className={twMerge(!inModal && "sr-only")}>
                Send message
              </span>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
