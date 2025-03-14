import {
  BaseServerSchema,
  ServerSchema,
} from "@common/api/schemas/server.schema";
import { UserSchema } from "@common/api/schemas/user.schema";
import { idSchema } from "@common/zod/id.schema";
import { z } from "zod";

export const ServerInvitationSchema = z.object({
  invitation: z.object({
    serverId: idSchema,
    name: z.string(),
    server: BaseServerSchema,
  }),
  type: z.literal("server"),
});

export const FriendInvitationSchema = z.object({
  invitation: z.object({
    friendId: idSchema,
    name: z.string(),
    user: UserSchema,
  }),
  type: z.literal("friend"),
});

export const InvitationSchema = z.array(
  z.union([ServerInvitationSchema, FriendInvitationSchema])
);

export type ServerInvitation = z.infer<typeof ServerInvitationSchema>;
export type FriendInvitation = z.infer<typeof FriendInvitationSchema>;
export type Invitation = z.infer<typeof InvitationSchema>;
