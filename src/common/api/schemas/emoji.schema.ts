import { EmojiScope } from "@common/constants";
import { idSchema } from "@common/zod/id.schema";
import { placeholderSchema } from "@common/zod/placeholder.schema";
import { z } from "zod";

export const EmojiSchema = z
  .object({
    id: idSchema,
    scope: z.union([
      z.literal(EmojiScope.Public),
      z.literal(EmojiScope.Private),
    ]),
    url: z.string().url(),
    name: z.string(),
    serverId: idSchema,
    placeholder: placeholderSchema.nullable(),
  })
  .required();

export type CustomEmoji = z.infer<typeof EmojiSchema>;
