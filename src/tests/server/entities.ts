import { Friend } from "@common/api/schemas/friend.schema";
import { Member } from "@common/api/schemas/member.schema";
import { Server } from "@common/api/schemas/server.schema";
import { Recipient, User } from "@common/api/schemas/user.schema";
import { ActivityStatus } from "@common/enums/activity-status.enum";
import { ChannelType } from "@common/enums/channel-type.enum";
import { FriendStatus } from "@common/enums/friend-status.enum";

export const createChannelEntityMock = (id: number) => ({
  id,
  serverId: id,
  type: ChannelType.Text,
  name: ["general"],
  isPrivate: false,
});

export const createUserServerEntityMock = (
  serverId: number,
  channelId?: number,
  serverIcon: string | null = null
) => ({
  id: serverId,
  name: `server test ${serverId}`,
  serverIcon,
  iconPlaceholder: `data:image/webp;base64,` as const,
  channels: channelId ? [createChannelEntityMock(channelId)] : [],
  ownerId: 1,
  defaultChannel: channelId ? createChannelEntityMock(channelId) : undefined,
});

export const createServerEntityMock = (
  serverId: number,
  channelId?: number,
  server: Partial<Server> = {}
): Server => {
  const channel = {
    ...createChannelEntityMock(channelId || 1),
    channelUsers: [],
  };

  return {
    ...createUserServerEntityMock(serverId, channelId),
    member,
    members: [member],
    defaultChannel: channel,
    channels: [channel],
    ...server,
  };
};

export const createUserEntityMock = (user: Partial<User> = {}) => ({
  status: ActivityStatus.Online,
  id: 1,
  description: "",
  displayName: "testUser",
  username: "testUser",
  avatar: "https://localhost:4000/avatars/default.svg",
  backgroundColor: "#fff",
  backgroundImage: null,
  createdAt: new Date().toISOString(),
  ...user,
});

export const user = createUserEntityMock();

export const createMemberEntityMock = (member: Partial<Member> = {}) => ({
  user,
  userId: user.id,
  id: 1,
  isBanned: false,
  isKickedOut: false,
  kickedOutCount: 0,
  kickedOutUntil: null,
  serverId: 1,
  isOwner: false,
  profile: {
    ...user,
    memberId: 1,
    serverId: 1,
  },
  ...member,
});

export const member = createMemberEntityMock();

export const createRecipientEntityMock = (
  recipient: Partial<Recipient> = {}
): Recipient => ({
  ...createUserEntityMock({
    id: 4,
    username: "Recipient",
    displayName: "Recipient display name",
  }),
  createdAt: new Date().toISOString(),
  isFriend: false,
  isInvited: false,
  hasFriendRequest: false,
  isBlocked: false,
  memberId: 2,
  isCurrentUserBlocked: false,
  ...recipient,
});

export const createFriendEntityMock = (
  friend: Partial<Friend> = {}
): Friend => ({
  friendName: "Friend",
  userId: 1,
  friend: user,
  user: createUserEntityMock({ id: 10 }),
  status: FriendStatus.Online,
  isInvited: false,
  privateChannelId: -1,
  isPending: false,
  ...friend,
});
