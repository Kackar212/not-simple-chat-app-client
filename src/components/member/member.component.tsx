import { ActivityStatus } from "@common/enums/activity-status.enum";
import { Avatar } from "@components/avatar/avatar.component";
import { PopoverTrigger } from "@components/popover/popover-trigger.component";
import { Popover } from "@components/popover/popover.component";
import { PopoverProvider } from "@components/popover/popover.context";
import { UserStatus } from "@components/user-status/user-status.component";
import { twMerge } from "tailwind-merge";
import { MemberProfilePreview } from "@components/member-profile/member-profile-preview.component";
import OwnerIcon from "/public/assets/icons/owner.svg";
import { format } from "date-fns";
import { AvatarSize } from "@common/constants";
import { CSSProperties } from "react";

interface MemberProps {
  id: number;
  avatar: string;
  userId: number;
  currentUserId: number;
  isOwner: boolean;
  serverId: number;
  status: ActivityStatus;
  displayName: string;
  isKickedOut: boolean;
  kickedOutUntil: string | null;
  color: string;
  isInvisible?: boolean;
}

export function Member({
  id,
  avatar,
  userId,
  currentUserId,
  isOwner,
  serverId,
  status,
  displayName,
  isKickedOut,
  kickedOutUntil,
  color,
  isInvisible,
}: MemberProps) {
  const isCurrentUser = currentUserId === userId;

  const kickedOutDate =
    kickedOutUntil && format(new Date(kickedOutUntil), "h:m");

  return (
    <PopoverProvider placement="left-start">
      <li
        data-tooltip-content={`User is kicked out until ${kickedOutDate}`}
        data-tooltip-id="tooltip"
        data-tooltip-hidden={!isKickedOut}
        key={id}
        data-key={userId}
        className="flex justify-between text-black-800"
      >
        <PopoverTrigger
          className={twMerge(
            "text-white-500 hover:bg-gray-260/30 w-full p-2 rounded-[4px]",
            status === ActivityStatus.Offline && !isCurrentUser && "opacity-60"
          )}
        >
          <span className="sr-only">
            {isCurrentUser ? "your" : displayName} profile preview
            {kickedOutDate && ` - User is kicked out until ${kickedOutDate}`}
          </span>
          <div aria-hidden className="flex gap-3 items-center font-medium">
            <Avatar
              src={avatar}
              aria-hidden
              size={AvatarSize.LG}
              status={isInvisible ? ActivityStatus.Offline : status}
            />
            <span className="grid grid-cols-[1fr_24px] justify-between items-center gap-1.5">
              <span
                className="text-ellipsis overflow-hidden whitespace-nowrap text-(--member-color,rgb(220,220,220))"
                style={{ "--member-color": color } as CSSProperties}
              >
                {displayName}
              </span>
              {isOwner && (
                <div className="size-6">
                  <OwnerIcon aria-hidden />
                </div>
              )}
            </span>
          </div>
        </PopoverTrigger>
        <Popover>
          <MemberProfilePreview
            isCurrentUser={isCurrentUser}
            userId={userId}
            serverId={serverId}
          />
        </Popover>
      </li>
    </PopoverProvider>
  );
}
