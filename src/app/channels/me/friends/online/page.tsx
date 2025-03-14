import { FriendStatus } from "@common/enums/friend-status.enum";
import { Friends } from "@components/friends/friends.component";

export default function ActiveFriends() {
  return <Friends status={FriendStatus.Online} />;
}
