import { FriendStatus } from "./enums/friend-status.enum";

export const InputType = {
  Text: "text",
  Password: "password",
  Email: "email",
  Radio: "radio",
  Search: "search",
} as const;

export const UPLOAD_ICON_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const SESSION_COOKIE_NAME = "connect.sid";

export const SERVER_LIST_ITEM_SIZE = 68;
export const EmojiScope = {
  Private: "Private",
  Public: "Public",
} as const;

export const QueryKey = {
  Server: (serverId: number) => ["get-server", serverId],
  Messages: (channelId: number) => ["messages", channelId],
  PinnedMessages: (channelId: number) => ["get-pinned-messages", channelId],
  GifCategories: ["gif-categories"],
  Gifs: ["gifs"],
  DirectMessageChannel: (channelId: string | number) => [
    "get-direct-message-channel",
    +channelId,
  ],
  Friends: ["get-friends", undefined],
  FriendsWithoutDM: ["get-friends", undefined, false],
  FriendsByStatus: (status?: FriendStatus) => ["get-friends", status],
} as const;

export const EMOJIS_LIMIT = 50;

export const AvatarSize = {
  XS: {
    size: 16,
    status: 6,
    stroke: 2,
    offset: 0,
  },
  SM: {
    size: 20,
    status: 6,
    stroke: 2,
    offset: 0,
  },
  MD: {
    size: 24,
    status: 8,
    stroke: 3,
    offset: 0,
  },
  LG: {
    size: 32,
    status: 10,
    stroke: 3,
    offset: 0,
  },
  XL: {
    size: 40,
    status: 12,
    stroke: 4,
    offset: 0,
  },
  XXL: {
    size: 44,
    status: 12,
    stroke: 4,
    offset: 0,
  },
  XXXL: {
    size: 48,
    status: 12,
    stroke: 4,
    offset: 0,
  },
  XXXXL: {
    size: 80,
    status: 16,
    stroke: 6,
    offset: 4,
  },
} as const;
