import { BasicUserSchema, UserSchema } from "@common/api/schemas/user.schema";
import { idSchema } from "@common/zod/id.schema";
import { z } from "zod";
import { MemberSchema, ProfileSchema } from "./member.schema";
import { MessageType } from "@common/enums/message-type.enum";
import { AttachmentSchema } from "./attachment.schema";
import { placeholderSchema } from "@common/zod/placeholder.schema";

export const ReactionSchema = z.object({
  id: idSchema.optional(),
  emoji: z.object({ url: z.string().url().optional(), name: z.string() }),
  count: z.number().int(),
  me: z.boolean(),
});

export const EmbedMediaSchema = z.object({
  id: idSchema,
  type: z.enum(["image", "gif", "video"]),
  format: z.string(),
  width: z.number().int(),
  height: z.number().int(),
  url: z.string().url(),
  originalUrl: z.string().url().nullable(),
  placeholder: placeholderSchema.nullable(),
  poster: z.string().nullable(),
  isSpoiler: z.boolean().nullable(),
});

export const EmbedLinkSchema = z.object({
  id: idSchema,
  type: z.literal("link"),
  url: z.string().url(),
  title: z.string(),
  description: z.string(),
  siteName: z.string(),
  image: z.string(),
  originalUrl: z.string().url().nullable(),
});

const EmbedSchema = z.discriminatedUnion("type", [
  EmbedMediaSchema,
  EmbedLinkSchema,
]);

export const PollType = {
  Default: "Poll",
  Quiz: "Quiz",
} as const;

export const AnswerSchema = z.object({
  answer: z.string().min(3).max(300),
  isCorrectAnswer: z.boolean().nullable().optional(),
  id: z.number().int(),
});

export const UserAnswerSchema = z.object({
  userId: z.number().int(),
  pollAnswerId: z.number().int(),
  pollAnswer: AnswerSchema,
});

export const PollSchema = z.object({
  question: z.string().min(3).max(300),
  answers: AnswerSchema.array(),
  id: z.number().int(),
  type: z.nativeEnum(PollType),
  pollUserAnswers: UserAnswerSchema.array(),
});

export const MessageSchema = z.object({
  id: idSchema,
  isDeleted: z.boolean().optional(),
  message: z.string(),
  member: MemberSchema.extend({
    roles: z.array(z.object({ role: z.object({ color: z.string() }) })),
    profile: ProfileSchema,
  }),
  createdAt: z.string().datetime(),
  editedAt: z.string().datetime().nullable(),
  channelId: idSchema,
  memberId: idSchema,
  type: z.nativeEnum(MessageType),
  key: z.string().optional(),
  attachments: AttachmentSchema.array(),
  isPinned: z.boolean(),
  divide: z.boolean().optional(),
  isSystemMessage: z.boolean(),
  reactions: ReactionSchema.array(),
  embeds: z
    .object({ embed: EmbedSchema })
    .transform((val) => val.embed)
    .array(),
  messageReference: z
    .object({
      id: idSchema,
      message: z.string(),
      type: z.nativeEnum(MessageType),
      member: z.object({
        roles: z.array(z.object({ role: z.object({ color: z.string() }) })),
        user: BasicUserSchema,
      }),
    })
    .optional()
    .nullable(),
  poll: PollSchema.nullable(),
});

export const MessageWithBaseUserSchema = MessageSchema.merge(
  z.object({
    member: MemberSchema.merge(
      z.object({
        user: BasicUserSchema,
        roles: z.array(z.object({ role: z.object({ color: z.string() }) })),
        profile: ProfileSchema.nullable(),
      })
    ),
  })
);

export const MessagesResponseWithCursorSchema = z.object({
  messages: MessageWithBaseUserSchema.array(),
  cursor: z.number().int().nullable(),
  hasNextCursor: z.boolean(),
  hasPreviousCursor: z.boolean(),
  previousCursor: z.number().int().nullable(),
});

export type Reaction = z.infer<typeof ReactionSchema>;
export type MessageWithBaseUser = z.infer<typeof MessageWithBaseUserSchema>;
export type MessagesResponseWithCursor = z.infer<
  typeof MessagesResponseWithCursorSchema
>;
export type Message = z.infer<typeof MessageSchema>;
export type MessageEmbed = z.infer<typeof EmbedSchema>;
export type Poll = z.infer<typeof PollSchema>;
export type Answer = z.infer<typeof AnswerSchema>;
export type UserAnswer = z.infer<typeof UserAnswerSchema>;
