import { ApiError, getMessages, mutations, QueryResponse } from "@common/api";
import { Attachment } from "@common/api/schemas/attachment.schema";
import { MessageType } from "@common/enums/message-type.enum";
import { createConfig } from "@common/use-form.config";
import { MessageAttachment } from "@components/attachment/message-attachment.component";
import { EditMessageForm } from "@components/edit-message-form.component/edit-message-form.component";
import { format, formatRelative } from "date-fns";
import React, {
  Dispatch,
  MouseEvent,
  MouseEventHandler,
  SetStateAction,
  useRef,
} from "react";
import { FormProvider, useForm } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import { MessageActions } from "./message-actions.component";
import { PopoverProvider } from "@components/popover/popover.context";
import { Popover } from "@components/popover/popover.component";
import { useMutation } from "@common/api/hooks/use-mutation.hook";
import { editMessage as editMessageMutation } from "@common/api";
import {
  MessageEmbed,
  MessageWithBaseUser,
  Poll as PollEntity,
  Reaction as ReactionEntity,
} from "@common/api/schemas/message.schema";
import { useSafeContext } from "@common/hooks";
import { authContext } from "@common/auth/auth.context";
import { usePopover } from "@components/popover/use-popover.hook";
import { Link } from "@components/link/link.component";
import { useMarkdown } from "@common/simple-markdown/use-markdown.hook";
import { Reaction } from "./reaction.component";
import { useQueryClient } from "@tanstack/react-query";
import { EmojiPicker } from "@components/emoji-picker/emoji-picker.component";
import { AttachmentType } from "@common/enums/attachment-type.enum";
import { QueryKey } from "@common/constants";
import { chatContext } from "@components/chat/chat.context";
import CancelIcon from "/public/assets/icons/close.svg";
import { Poll } from "@components/poll/poll.component";

interface MessageContentProps {
  id: number;
  type: MessageType;
  message: string;
  reactions: ReactionEntity[];
  attachments: Attachment[];
  isCurrentUserAuthor: boolean;
  createdAt: string;
  editedAt: string | null;
  embeds: MessageEmbed[];
  isSubMessage?: boolean;
  channelId: number;
  isMouseOver: boolean;
  isEdited: boolean;
  isPinned: boolean;
  setIsEdited: Dispatch<SetStateAction<boolean>>;
  onMouseEnter: MouseEventHandler;
  onMouseLeave: MouseEventHandler;
  deleteMessage: () => void;
  setMessageReference: () => void;
  jumpTo: (e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
  withActions?: boolean;
  poll: PollEntity | null;
}

const inviteRegexp = new RegExp(
  `http(s)?:\/\/${process.env.NEXT_PUBLIC_APP_URL}\/invite\/(?<inviteId>.*)`
);

const EditMessageSchema = z.object({
  editMessage: z
    .string({ required_error: "is required" })
    .min(1, "Message must be at least 1 character")
    .max(1000),
});

type EditMessageFields = z.infer<typeof EditMessageSchema>;

export function MessageContent({
  id,
  type,
  message,
  attachments,
  isCurrentUserAuthor,
  createdAt,
  isSubMessage = false,
  isMouseOver,
  isEdited,
  isPinned,
  setIsEdited,
  channelId,
  onMouseEnter,
  onMouseLeave,
  deleteMessage,
  setMessageReference,
  jumpTo,
  withActions = true,
  reactions,
  editedAt,
  embeds,
  poll,
}: MessageContentProps) {
  const isOptimistic = type === MessageType.Optimistic;
  const queryClient = useQueryClient();

  const useFormResult = useForm<EditMessageFields>(
    createConfig(EditMessageSchema)
  );

  const isEmbedContent =
    embeds.length === 1 &&
    embeds[0].originalUrl === message &&
    (embeds[0].type === "image" ||
      embeds[0].type === "gif" ||
      embeds[0].type === "video");

  const {
    auth: { member },
  } = useSafeContext(authContext);
  const { isRequestAccepted } = useSafeContext(chatContext);

  const { mutate: modifyReactions } = useMutation({
    mutationFn: mutations.modifyReactions,
  });

  const { mutate: editMessage } = useMutation({
    mutationFn: editMessageMutation,
    async onMutate({ isPinned, messageId }) {
      const queryKey = ["get-pinned-messages", channelId];

      queryClient.setQueryData(
        queryKey,
        (
          data?: QueryResponse<{ messages: MessageWithBaseUser[] }, ApiError>
        ) => {
          if (!data) {
            return data;
          }

          const messages = data?.data?.messages || [];
          const newMessages = isPinned
            ? [
                {
                  id,
                  message,
                  createdAt,
                  type,
                  user: member,
                  attachments: [],
                  reactions: [],
                },
                ...messages,
              ]
            : messages.filter((message) => message.id !== messageId);

          return {
            ...data,
            data: {
              ...data?.data,
              messages: newMessages,
            },
          };
        }
      );

      const getMessagesQueryKey = QueryKey.Messages(channelId);

      queryClient.setQueryData(
        getMessagesQueryKey,
        (data: { pages: { data: { messages: MessageWithBaseUser[] } }[] }) => {
          return {
            ...data,
            pages: [...data.pages].map((page) => {
              const messages = page.data.messages.map((message) =>
                message.id === messageId ? { ...message, isPinned } : message
              );

              return {
                ...page,
                data: {
                  messages,
                },
              };
            }),
          };
        }
      );

      queryClient.invalidateQueries({ queryKey });
    },
  });

  const selectedMessageId = useRef<number>();
  const popover = usePopover({
    onOpenChange: (open) => {
      selectedMessageId.current = id;

      setTimeout(open ? onMouseEnter : onMouseLeave);
    },
    placement: "left",
  });

  const parsedMarkdown = useMarkdown(message, {
    type,
    messageId: id,
    channelId,
  });

  const relativeDate = formatRelative(new Date(createdAt), new Date());
  const time = format(createdAt, "HH:mm");
  const formattedEditedAt =
    editedAt && format(new Date(editedAt), "PPPP 'at' p");

  const hasReactions = reactions && reactions.length > 0;

  return (
    <FormProvider {...useFormResult}>
      <div
        className={twMerge(
          "w-full flex flex-col",
          isOptimistic && "text-gray-360"
        )}
      >
        <PopoverProvider context={popover}>
          <div className={twMerge(isSubMessage && "flex items-baseline")}>
            {isSubMessage && (
              <span
                className={twMerge(
                  "-ml-0.5 mr-0.5 absolute top-0 -left-1 lg:left-0 h-full leading-[1.375rem] opacity-0 text-[0.6875rem] w-[42px] lg:w-14 text-gray-300 flex items-center justify-center",
                  isMouseOver && "opacity-100"
                )}
              >
                <time
                  dateTime={createdAt}
                  aria-label={relativeDate}
                  className="leading-[1.375] h-[0.875rem]"
                >
                  {time}
                </time>
              </span>
            )}
            {!isEdited && !isEmbedContent && (
              <div
                className={twMerge(
                  "message-content w-full max-w-screen-sm leading-[1.375rem] min-h-[22px] text-base [text-indent:0] [word-wrap:break-word] box-decoration-clone text-wrap whitespace-break-spaces",
                  !message && "hidden"
                )}
              >
                {parsedMarkdown}
                {formattedEditedAt && (
                  <time
                    className="timestamp edited-timestamp"
                    dateTime={editedAt}
                    aria-label={formattedEditedAt}
                    data-tooltip-id="tooltip"
                    data-tooltip-content={formattedEditedAt}
                  >
                    (edited)
                  </time>
                )}
              </div>
            )}
            {isEdited && (
              <EditMessageForm
                message={message}
                setIsEdited={setIsEdited}
                messageId={id}
                channelId={channelId}
              />
            )}
            {withActions && isRequestAccepted && (
              <MessageActions
                setIsEdited={setIsEdited}
                isEdited={isEdited}
                isMouseOver={isMouseOver || !!popover.isOpen}
                isOptimistic={type === MessageType.Optimistic}
                isCurrentUserAuthor={isCurrentUserAuthor}
                deleteMessage={deleteMessage}
                pinMessage={() => {
                  editMessage({ messageId: id, isPinned: !isPinned });
                }}
                isPinned={isPinned}
                setCommentReference={setMessageReference}
              />
            )}
            {!withActions && (
              <div
                className={twMerge(
                  "flex opacity-0 font-light text-xs items-center absolute -top-2 -right-4 gap-1 has-[:focus-visible]:opacity-100 bg-black-900/5 p-0.5 px-2 rounded-bl-md",
                  !withActions && isMouseOver && "opacity-100"
                )}
              >
                <Link
                  href={`${channelId}/${id}`}
                  data-id={id}
                  className="bg-black-600 rounded-[4px] leading-none p-1 px-2 hover:bg-black-800 transition-colors"
                  onClick={jumpTo}
                >
                  Jump <span className="sr-only">to this message</span>
                </Link>
                <button
                  className="p-1"
                  data-tooltip-content="Unpin message"
                  data-tooltip-id="tooltip"
                  onClick={() =>
                    editMessage({ messageId: id, isPinned: false })
                  }
                >
                  <span className="sr-only">Unpin message</span>
                  <CancelIcon className="rotate-45 size-4" aria-hidden />
                </button>
              </div>
            )}
          </div>
          {attachments.map((attachment) => (
            <MessageAttachment
              key={attachment.id}
              isMessageOptimistic={isOptimistic}
              isCurrentUserAuthor={isCurrentUserAuthor}
              isSubMessage={isSubMessage}
              {...attachment}
            />
          ))}
          {poll && <Poll {...poll} messageId={id} />}
          <div className="flex flex-col">
            {embeds.map((embed, index) => {
              const { type, url, id: embedId } = embed;
              const key = `${id}_${embedId}`;

              switch (type) {
                case "gif": {
                }
                case "image": {
                  const {
                    type,
                    width,
                    height,
                    poster,
                    originalUrl,
                    isSpoiler,
                    placeholder,
                  } = embed;

                  const attachmentType =
                    type === "image"
                      ? AttachmentType.Image
                      : AttachmentType.Gif;

                  return (
                    <MessageAttachment
                      key={key}
                      url={url}
                      isCurrentUserAuthor={isCurrentUserAuthor}
                      isSubMessage={isSubMessage}
                      isSpoiler={!!isSpoiler}
                      isMessageOptimistic={false}
                      id={id}
                      type={attachmentType}
                      width={width}
                      height={height}
                      name={url}
                      originalName={"this embedded"}
                      size={1}
                      originalUrl={originalUrl || url}
                      placeholder={placeholder}
                      poster={poster}
                      isEmbed
                      isVoiceClip={false}
                    />
                  );
                }
                case "link": {
                  const { siteName, title, image, description } = embed;

                  return (
                    <div
                      key={key}
                      className="p-4 gap-6 flex items-start border-l-[5px] border-l-black-700 rounded-[4px] bg-black-630 my-1 max-w-[640px]"
                    >
                      <div className="flex flex-col gap-2 min-w-96">
                        <span className="text-xs">{siteName}</span>
                        <a
                          className="text-blue-300 font-medium"
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {title || url}
                        </a>
                        <p>{description}</p>
                      </div>
                      {image && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          width={80}
                          src={image}
                          alt=""
                          className="rounded-md"
                        />
                      )}
                    </div>
                  );
                }

                case "video": {
                  const { width, height, originalUrl, poster, isSpoiler } =
                    embed;

                  return (
                    <MessageAttachment
                      key={key}
                      url={url}
                      isCurrentUserAuthor={isCurrentUserAuthor}
                      isSubMessage={isSubMessage}
                      isSpoiler={!!isSpoiler}
                      isMessageOptimistic={false}
                      id={id}
                      type={AttachmentType.Video}
                      width={width}
                      height={height}
                      name={url}
                      poster={poster}
                      originalName={"this embedded"}
                      size={1}
                      originalUrl={originalUrl || url}
                      isEmbed
                      isVoiceClip={false}
                    />
                  );
                }

                default:
                  return null;
              }
            })}
          </div>
          {isOptimistic && attachments.length > 0 && (
            <div className="p-4 bg-black-800 my-2 rounded-md border border-white-0 border-opacity-20 text-sm max-w-screen-sm">
              Processing files...
            </div>
          )}
          <Popover className="rounded-md" shouldRenderInPortal>
            <EmojiPicker
              onSelect={(emoji) => {
                const reaction = reactions.find(
                  ({ emoji: { name } }) => emoji.uniqueName === name
                );

                if (reaction && reaction.id) {
                  modifyReactions({
                    emojiName: reaction.emoji.name,
                    messageId: id,
                  });
                }

                if (!reaction || !reaction.id) {
                  modifyReactions({ emoji, messageId: id });
                }

                popover.setIsOpen(false);
              }}
            />
          </Popover>
        </PopoverProvider>
        {hasReactions && (
          <div className="flex gap-1 mt-1">
            {reactions.map(({ id: reactionId, count, emoji, me }) => (
              <Reaction
                key={emoji.name}
                channelId={channelId}
                reactionId={reactionId}
                messageId={id}
                me={me}
                count={count}
                emoji={emoji}
              />
            ))}
          </div>
        )}
      </div>
    </FormProvider>
  );
}
