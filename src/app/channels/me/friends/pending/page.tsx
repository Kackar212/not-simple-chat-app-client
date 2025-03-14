import { getFriends } from "@common/api";
import { getCurrentUser, getSessionId } from "@common/auth/auth.utils";
import { FriendStatus } from "@common/enums/friend-status.enum";
import { Avatar } from "@components/avatar/avatar.component";
import { Friends } from "@components/friends/friends.component";
import { redirect } from "next/navigation";

export default async function PendingFriends() {
  return <Friends status={FriendStatus.Pending} />;
}
