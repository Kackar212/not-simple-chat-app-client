import { z } from "zod";
import { FriendSchema } from "./friend.schema";
import { MemberSchema } from "./member.schema";
import { RoleSchema } from "./role.schema";
import { ServerSchema } from "./server.schema";
import { UserSchema } from "./user.schema";
import { idSchema } from "@common/zod/id.schema";

export const UserProfileSchema = z.object({
  friend: z.object({ privateChannelId: idSchema }).optional(),
  hasFriendRequest: z.boolean(),
  isFriend: z.boolean(),
  isInvited: z.boolean(),
  mutualFriends: FriendSchema.array(),
  mutualServers: ServerSchema.array(),
  user: UserSchema.merge(
    z.object({
      roles: RoleSchema.array().optional(),
      joinedServerAt: z.string().datetime(),
      isBlocked: z.boolean(),
      memberId: idSchema,
      serverId: idSchema.optional(),
      isOwner: z.boolean(),
    })
  ),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
