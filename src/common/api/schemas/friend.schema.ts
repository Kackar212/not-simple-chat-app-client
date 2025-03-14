import { idSchema } from "@common/zod/id.schema";
import { z } from "zod";
import { UserSchema } from "./user.schema";
import { FriendStatus } from "@common/enums/friend-status.enum";
import { usernameSchema } from "@common/zod";

export const FriendSchema = z.object({
  friendName: usernameSchema,
  id: idSchema,
  user: UserSchema,
  username: usernameSchema,
  status: z.nativeEnum(FriendStatus),
  isInvited: z.boolean(),
  privateChannelId: z.number().int(),
  isPending: z.boolean(),
});

export const FriendsWithCursorSchema = z.object({
  friends: FriendSchema.array(),
  cursor: z.number().nullable(),
  hasNextCursor: z.boolean(),
});

export type Friend = z.infer<typeof FriendSchema>;
export type FriendsWithCursor = z.infer<typeof FriendsWithCursorSchema>;
