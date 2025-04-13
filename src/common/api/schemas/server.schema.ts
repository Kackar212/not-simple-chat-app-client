import {
  ChannelSchema,
  ChannelWithoutMessages,
} from "@common/api/schemas/channel.schema";
import { MemberSchema } from "@common/api/schemas/member.schema";
import { UserSchema } from "@common/api/schemas/user.schema";
import { idSchema } from "@common/zod/id.schema";
import { placeholderSchema } from "@common/zod/placeholder.schema";
import { serverNameSchema } from "@common/zod/server-name.schema";
import { urlSchema } from "@common/zod/url.schema";
import { z } from "zod";
import { RoleSchema } from "./role.schema";

export const BaseServerSchema = z.object({
  id: idSchema,
  name: serverNameSchema,
  serverIcon: urlSchema.nullable(),
  iconPlaceholder: placeholderSchema.nullable(),
  isGlobalServer: z.boolean().optional(),
});

export const ServerSchema = z.object({
  id: idSchema,
  name: serverNameSchema,
  defaultChannel: ChannelWithoutMessages,
  serverIcon: urlSchema.nullable(),
  iconPlaceholder: placeholderSchema.nullable(),
  channels: ChannelWithoutMessages.array(),
  members: MemberSchema.extend({ isInvisible: z.void() }).array(),
  ownerId: z.number().int(),
  member: MemberSchema,
  roles: RoleSchema.array(),
  inviteLink: z.object({
    inviteId: z.string(),
    url: z.string().url(),
    numberOfUses: z.number().int(),
    usesLeft: z.number().int(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    expiration: z.number().int(),
  }),
});

const UserServerChannelSchema = ChannelWithoutMessages.merge(
  z.object({ channelUsers: z.void() })
);

export const UserServerSchema = ServerSchema.merge(
  z.object({
    members: z.void(),
    member: z.void(),
    channels: UserServerChannelSchema.array(),
    defaultChannel: UserServerChannelSchema.optional(),
    inviteLink: z.void(),
    roles: z.void(),
  })
);

export const InviteServerSchema = BaseServerSchema.merge(
  z.object({
    membersCount: z.number().int(),
    onlineMembersCount: z.number().int(),
    offlineMembersCount: z.number().int(),
    defaultChannel: ChannelSchema,
  })
);

export const ChannelWithServerSchema = ChannelSchema.merge(
  z.object({ server: BaseServerSchema })
);

export type UserServer = z.infer<typeof UserServerSchema>;
export type BaseServer = z.infer<typeof BaseServerSchema>;
export type Server = z.infer<typeof ServerSchema>;
export type InviteServer = z.infer<typeof InviteServerSchema>;
export type ChannelWithServer = z.infer<typeof ChannelWithServerSchema>;
