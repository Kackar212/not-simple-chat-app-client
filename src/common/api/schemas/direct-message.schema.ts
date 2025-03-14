import { UserSchema } from "@common/api/schemas/user.schema";
import { idSchema } from "@common/zod/id.schema";
import { z } from "zod";

export const DirectMessageSchema = z.object({
  id: idSchema,
  message: z.string(),
  user: UserSchema,
  createdAt: z.string(),
  channelId: idSchema,
  userId: idSchema,
});

export type DirectMessage = z.infer<typeof DirectMessageSchema>;
