import { User } from "@common/api/schemas/user.schema";
import { AvatarSize } from "@common/constants";
import { Avatar } from "@components/avatar/avatar.component";
import { Button } from "@components/button/button.component";
import { useCallback } from "react";

interface InviteFriendProps {
  user: User;
  isPending: boolean;
  onClick: (user: User) => void;
}

export function InviteFriend({ user, isPending, onClick }: InviteFriendProps) {
  const { username, displayName, avatar } = user;
  const invite = useCallback(() => {
    if (isPending) {
      return;
    }

    onClick(user);
  }, [user, onClick, isPending]);

  return (
    <div className="flex gap-2 w-full rounded-md hover:bg-black-450/30 p-2">
      <Avatar src={user.avatar} size={AvatarSize.LG} />
      <div className="flex grow items-center leading-none w-full">
        <span className="min-w-28 h-4 text-gray-150">
          <span className=" text-ellipsis font-light whitespace-nowrap w-full overflow-hidden border-b border-b-transparent block text-left">
            {user.displayName}
          </span>
        </span>
      </div>
      <Button
        className="py-0.5 text-sm px-4 border-green-500 border bg-transparent text-white-0 hover:bg-green-800 hover:border-green-800 transition-colors rounded-[3px]"
        onClick={invite}
        isLoading={isPending}
      >
        Invite <span className="sr-only">{user.username}</span>
      </Button>
    </div>
  );
}
