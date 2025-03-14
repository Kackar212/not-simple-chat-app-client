import { MessageSchema } from "@common/api/schemas/message.schema";
import { idSchema } from "@common/zod/id.schema";
import { z } from "zod";
import { ChannelUserSchema } from "./channel-user.schema";
import { ChannelType } from "@common/enums/channel-type.enum";

export const ChannelSchema = z.object({
  id: idSchema,
  name: z.string().array(),
  messages: MessageSchema.array(),
  channelUsers: z.array(ChannelUserSchema),
  serverId: idSchema,
  type: z.nativeEnum(ChannelType),
  isPrivate: z.boolean(),
  isDeleted: z.boolean().optional(),
});

export const ChannelWithoutMessages = ChannelSchema.merge(
  z.object({
    messages: z.void(),
  })
);

export type Channel = z.infer<typeof ChannelSchema>;
export type ChannelWithoutMessages = z.infer<typeof ChannelWithoutMessages>;
