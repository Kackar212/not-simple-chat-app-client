import { z } from "zod";
import { UserSchema } from "./user.schema";

export const BlacklistSchema = z
  .object({
    blocked: UserSchema.pick({
      avatar: true,
      displayName: true,
      username: true,
      id: true,
    }),
  })
  .array();

export type Blacklist = z.infer<typeof BlacklistSchema>;
