"use client";

import { authContext } from "@common/auth/auth.context";
import { FriendStatus } from "@common/enums/friend-status.enum";
import { useSafeContext } from "@common/hooks";
import { Friend } from "@components/friend/friend.component";
import { FriendsList } from "@components/friends/friends-list.component";

export default function BlockedUsers() {
  const {
    auth: { blacklist },
  } = useSafeContext(authContext);

  return (
    <FriendsList
      status={FriendStatus.Blocked}
      friendsCount={blacklist.length}
      isLoading={false}
    >
      {blacklist.map(({ blocked }) => {
        return (
          <Friend
            key={blocked.username}
            friend={blocked}
            status={FriendStatus.Blocked}
            isInvited={false}
          />
        );
      })}
    </FriendsList>
  );
}
