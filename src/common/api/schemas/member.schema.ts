import { UserSchema } from "@common/api/schemas/user.schema";
import { ActivityStatus } from "@common/enums/activity-status.enum";
import { idSchema } from "@common/zod/id.schema";
import { z } from "zod";
import { BlacklistSchema } from "./blacklist.schema";
import { EmojiSchema } from "./emoji.schema";
import { SpecialStatus } from "@common/enums/special-status.enum";

export const ProfileSchema = z.object({
  id: idSchema,
  avatar: z.string(),
  backgroundColor: z.string(),
  backgroundImage: z.string().url().nullable(),
  description: z.string().nullable(),
  displayName: z.string(),
  memberId: z.number().int(),
  serverId: z.number().int().optional(),
  status: z.nativeEnum(ActivityStatus),
  specialStatus: z.nativeEnum(SpecialStatus).nullable(),
  isInvisible: z.boolean(),
});

export const MemberSchema = z.object({
  user: UserSchema,
  userId: idSchema,
  id: idSchema,
  isBanned: z.boolean(),
  isKickedOut: z.boolean(),
  kickedOutCount: z.number().int(),
  kickedOutUntil: z.string().datetime().nullable(),
  serverId: idSchema.optional(),
  isOwner: z.boolean(),
  profile: ProfileSchema,
});

export const MemberWithoutUserSchema = MemberSchema.merge(
  z.object({
    user: z.void(),
    profile: ProfileSchema.merge(z.object({ serverId: idSchema.optional() })),
  })
);

export const CurrentUserProfileSchema = z.object({
  member: MemberSchema,
  user: UserSchema,
  blacklist: BlacklistSchema,
  emojis: EmojiSchema.array(),
  pendingFriends: z.number().int(),
});

export type Profile = z.infer<typeof ProfileSchema>;
export type Member = z.infer<typeof MemberSchema>;
export type MemberWithoutUser = z.infer<typeof MemberWithoutUserSchema>;
export type CurrentUserProfile = z.infer<typeof CurrentUserProfileSchema>;
