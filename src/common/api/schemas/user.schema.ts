import { ActivityStatus } from "@common/enums/activity-status.enum";
import { usernameSchema } from "@common/zod";
import { displayNameSchema } from "@common/zod/display-name.schema";
import { idSchema } from "@common/zod/id.schema";
import { z } from "zod";
import { BlacklistSchema } from "./blacklist.schema";
import { SpecialStatus } from "@common/enums/special-status.enum";

export const UserSchema = z.object({
  id: idSchema,
  username: usernameSchema,
  avatar: z.string().url(),
  status: z.nativeEnum(ActivityStatus),
  backgroundColor: z.string(),
  backgroundImage: z.string().url().nullable(),
  displayName: displayNameSchema,
  createdAt: z.string(),
  description: z.string(),
  isInvisible: z.boolean().optional(),
  specialStatus: z.nativeEnum(SpecialStatus).nullable(),
  isSpeaking: z.boolean().optional(),
  isSelfMuted: z.boolean().optional(),
});

export const BasicUserSchema = z.object({
  id: idSchema,
  username: usernameSchema,
  avatar: z.string().url(),
  displayName: displayNameSchema,
  status: z.nativeEnum(ActivityStatus).optional(),
});

export const RecipientSchema = UserSchema.merge(
  z.object({
    createdAt: z.string(),
    isFriend: z.boolean(),
    isInvited: z.boolean(),
    hasFriendRequest: z.boolean(),
    isBlocked: z.boolean(),
    memberId: idSchema,
    isCurrentUserBlocked: z.boolean(),
  })
);

export type User = z.infer<typeof UserSchema>;
export type BasicUser = z.infer<typeof BasicUserSchema>;
export type Recipient = z.infer<typeof RecipientSchema>;
