import { idSchema } from "@common/zod/id.schema";
import { z } from "zod";
import { MemberSchema } from "./member.schema";

export const ChannelUserSchema = z.object({
  memberId: idSchema,
  channelId: idSchema,
  member: MemberSchema,
});

export type ChannelUser = z.infer<typeof ChannelUserSchema>;
