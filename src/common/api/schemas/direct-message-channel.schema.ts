import { DirectMessageSchema } from "@common/api/schemas/direct-message.schema";
import { MessageSchema } from "@common/api/schemas/message.schema";
import { UserSchema } from "@common/api/schemas/user.schema";
import { idSchema } from "@common/zod/id.schema";
import { z } from "zod";
import { ChannelSchema, ChannelWithoutMessages } from "./channel.schema";
import { BaseServerSchema } from "./server.schema";
import { MemberSchema } from "./member.schema";
import { RecipientSchema } from "./user.schema";

export const DirectMessageChannelSchema = ChannelWithoutMessages.extend({
  isBlocked: z.boolean(),
  recipient: RecipientSchema,
  isRequestAccepted: z.boolean(),
  createdBy: z.string(),
  channelUsers: z.void(),
  serverId: z.void(),
  isDeleted: z.boolean().optional(),
});

export type DirectMessageChannel = z.infer<typeof DirectMessageChannelSchema>;
