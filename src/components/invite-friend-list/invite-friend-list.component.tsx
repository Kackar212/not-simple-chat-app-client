import { queries } from "@common/api";
import { useQuery } from "@common/api/hooks/use-query.hook";
import { User } from "@common/api/schemas/user.schema";
import { AvatarSize, QueryKey } from "@common/constants";
import { Avatar } from "@components/avatar/avatar.component";
import { Button } from "@components/button/button.component";
import { Loader } from "@components/loader/loader.component";
import { MouseEventHandler } from "react";
import { InviteFriend } from "./invite-friend.component";

interface InviteFriendListProps {
  enabled: boolean;
  isPending: boolean;
  onClick: (user: User) => void;
}

export function InviteFriendList({
  enabled,
  onClick,
  isPending,
}: InviteFriendListProps) {
  const {
    data: { data: friends = [] },
    isLoading,
  } = useQuery({
    queryKey: QueryKey.FriendsWithoutDM,
    queryFn: () => queries.getFriends({ hasDM: false }),
    enabled,
    refetchOnWindowFocus: false,
  });

  return (
    <div className="w-full bg-black-600 h-52 max-h-52 pl-3 pr-1 py-2 scrollbar scrollbar-thin overflow-y-scroll">
      <div className="overflow-hidden">
        {isLoading && <Loader />}
        {!isLoading && friends.length === 0 && (
          <p className="text-center text-sm text-gray-150">
            You don&apos;t have any friends that can be invited to private chat
            with you.
          </p>
        )}
        {friends.map(({ id, user }) => (
          <InviteFriend
            key={id}
            isPending={isPending}
            onClick={onClick}
            user={user}
          />
        ))}
      </div>
    </div>
  );
}
