import { idSchema } from "@common/zod/id.schema";
import { placeholderSchema } from "@common/zod/placeholder.schema";
import { z } from "zod";

export const AttachmentSchema = z.object({
  id: idSchema,
  name: z.string(),
  type: z.string(),
  extension: z.string(),
  isSpoiler: z.boolean(),
  isVoiceClip: z.boolean(),
  originalName: z.string(),
  size: z.number().int(),
  contentType: z.string(),
  url: z.string().url(),
  width: z.number(),
  height: z.number(),
  poster: z.string().nullable(),
  messageId: z.number(),
  placeholder: placeholderSchema.nullable().optional(),
});

export type Attachment = z.infer<typeof AttachmentSchema>;
