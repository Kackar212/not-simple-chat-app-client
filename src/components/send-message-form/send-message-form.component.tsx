"use client";

import { ApiError, QueryResponse, getServer, mutations } from "@common/api";
import {
  MessageWithBaseUser as Message,
  MessagesResponseWithCursor,
} from "@common/api/schemas/message.schema";
import { Button } from "@components/button/button.component";
import {
  DEFAULT_MESSAGE_INPUT_NAME,
  MessageInput,
} from "@components/input/message-input.component";
import { MessageUpload } from "@components/upload/message-upload.component";
import { useUpload } from "@components/upload/use-upload.hook";
import {
  FormEventHandler,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FieldError, FormProvider, useForm } from "react-hook-form";
import { getFileSizeWithUnit } from "@common/utils";
import { PaperPlaneIcon } from "@components/icons/paper-plane.icon";
import { twMerge } from "tailwind-merge";
import { Modal } from "@components/modal/modal.component";
import { useModal } from "@components/modal/use-modal.hook";
import { PreviewAttachment } from "@components/attachment/preview-attachment.component";
import { MessageType } from "@common/enums/message-type.enum";
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { socket, SocketEvent } from "@common/socket";
import { authContext } from "@common/auth/auth.context";
import { useSafeContext } from "@common/hooks";
import { chatContext } from "@components/chat/chat.context";
import { PopoverProvider } from "@components/popover/popover.context";
import { PopoverTrigger } from "@components/popover/popover-trigger.component";
import { Popover } from "@components/popover/popover.component";
import { EmojiPicker } from "@components/emoji-picker/emoji-picker.component";
import { useEmojiStyle } from "@common/emojis/use-emoji-style.hook";
import { AvatarSize, QueryKey } from "@common/constants";
import { GifPicker } from "@components/gif-picker/gif-picker.component";
import { MemberProfilePreview } from "@components/member-profile/member-profile-preview.component";
import { VoiceClipPlayer } from "@components/voice-clip-player/voice-clip-player.component";
import { useRecorder } from "@common/hooks/use-recorder.hook";
import { HistoryFile } from "@components/upload/history-file.interface";
import { CreatePoll } from "@components/create-poll-form/create-poll.component";
import { ErrorIcon } from "@components/icons";
import { z } from "zod";
import { createConfig } from "@common/use-form.config";
import { useEditor } from "@components/input/use-editor.hook";
import { Autocomplete } from "@components/autocomplete/autocomplete.component";
import { useQuery } from "@common/api/hooks/use-query.hook";
import { Reply } from "./reply.component";
import { AutocompleteProvider } from "@components/autocomplete/autocomplete.context";
import { AutocompleteListItem } from "@components/autocomplete/autocomplete-list-item.component";
import FolderIcon from "/public/assets/icons/folder.svg";
import MicrophoneIcon from "/public/assets/icons/microphone.svg";
import { FuseResult } from "fuse.js";
import { Server } from "@common/api/schemas/server.schema";
import { Emoji } from "@common/emojis/emoji.class";
import { Avatar } from "@components/avatar/avatar.component";
import { EmojiMemoryStorage } from "@common/emojis/emojis.storage";
import { Member } from "@common/api/schemas/member.schema";
import assert from "assert";
import { getAutocompleteState } from "@common/editor/utils";
import { useAutocomplete } from "./use-autocomplete.hook";
import { Role } from "@common/api/schemas/role.schema";

interface SendMessageFormProps {
  channelId: number;
  channelName: string;
}

const SendMessageSchema = z.object({
  message: z
    .string({ required_error: "is required" })
    .trim()
    .min(1, "Message must be at least 1 character")
    .max(1000, "Message must be at most 1000 characters"),
  messageFiles: z.any(),
});

export type SendMessageSchemaType = z.infer<typeof SendMessageSchema>;

export function SendMessageForm({
  channelId,
  channelName,
}: SendMessageFormProps) {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const isUserTyping = useRef(false);
  let timeout = useRef<number | void>();

  const queryClient = useQueryClient();

  const {
    setMessageReference,
    messageReference,
    scrollContainerRef,
    getMessagesQueryResult: { hasPreviousPage },
    serverId,
  } = useSafeContext(chatContext);

  const { current: scrollContainer } = scrollContainerRef;

  const {
    auth: { member: currentMember, user },
  } = useSafeContext(authContext);

  const sizeLimitModal = useModal(() => {
    clearErrors("messageFiles");
  });

  const useFormResult = useForm<SendMessageSchemaType>(
    createConfig(SendMessageSchema, {
      mode: "onSubmit",
      defaultValues: {
        message: "",
      },
    })
  );

  const {
    setValue,
    watch,
    trigger,
    clearErrors,
    formState: { errors },
    reset,
    handleSubmit,
  } = useFormResult;

  const {
    history: { files, size },
    clearUploadHistory,
    onFilesSelected,
    error,
    setHistory,
    maxFilesSize,
    transformFile,
  } = useUpload<{ isSpoiler: boolean; isVoiceClip?: boolean }>({
    name: "messageFiles",
    onError() {
      sizeLimitModal.open();
    },
    formContext: useFormResult as any,
  });

  const message = watch("message");

  useEffect(() => {
    if (!message) {
      return () => {};
    }

    setTimeout(() => {
      if (timeout.current) {
        window.clearTimeout(timeout.current);
      }

      timeout.current = window.setTimeout(() => {
        socket.emit(SocketEvent.Typing, {
          channelId,
          status: "stopped",
          username: user.username,
        });

        isUserTyping.current = false;
      }, 250);

      if (isUserTyping.current) {
        return;
      }

      isUserTyping.current = true;

      socket.emit(SocketEvent.Typing, {
        channelId,
        status: "typing",
        username: user.username,
      });
    }, 100);
  }, [channelId, currentMember, user.username, isUserTyping, message]);

  useEffect(() => {
    socket.on(SocketEvent.Typing, (usernames) => {
      setTypingUsers(usernames);
    });

    return () => {
      socket.off(SocketEvent.Typing);
    };
  }, []);

  const createNewOptimisticMessage = (
    key: number,
    files: HistoryFile<{ isSpoiler: boolean }>[]
  ): Message => ({
    channelId,
    message,
    embeds: [],
    editedAt: null,
    member: { ...currentMember, roles: [] },
    createdAt: Date.now() as unknown as string,
    memberId: currentMember.id,
    id: 0,
    type: MessageType.Optimistic,
    attachments: files.map((file) => ({
      id: Math.random() * Number.MAX_SAFE_INTEGER,
      type: file.type,
      name: file.name,
      extension: "",
      isSpoiler: file.customData.isSpoiler,
      originalName: file.name,
      size: file.file.size,
      contentType: file.file.type,
      url: file.url,
      width: file.width,
      height: file.height,
      poster: null,
      messageId: 0,
      isVoiceClip: file.name.startsWith("__VOICECLIP__"),
    })),
    isPinned: false,
    key: String(key),
    messageReference,
    isSystemMessage: false,
    reactions: [],
    poll: null,
    mentions: [],
    mentionRoles: [],
    mentionEveryone: false,
  });

  const getMessagesQueryKey = QueryKey.Messages(channelId);

  const { mutate } = useMutation({
    mutationKey: ["create-message", channelId],
    mutationFn: mutations.createMessage,
    scope: { id: "create-message" },
    async onMutate({ attachments }) {
      const previousMessages =
        queryClient.getQueryData<
          InfiniteData<QueryResponse<MessagesResponseWithCursor, ApiError>>
        >(getMessagesQueryKey);

      if (hasPreviousPage || !scrollContainer) {
        return { previousMessages };
      }

      await queryClient.cancelQueries({
        queryKey: getMessagesQueryKey,
      });

      queryClient.setQueryData(
        getMessagesQueryKey,
        (
          old: InfiniteData<QueryResponse<MessagesResponseWithCursor, ApiError>>
        ) => {
          const pages = [...old.pages];
          const firstPage = pages.shift();

          if (!firstPage?.data) {
            return old;
          }

          const optimisticMessage = createNewOptimisticMessage(
            Math.random() * Number.MAX_SAFE_INTEGER,
            attachments
          );

          setMessageReference(undefined);

          if (attachments.length > 1) {
            setHistory({ files: [], size: 0 });
          }

          return {
            ...old,
            pages: [
              {
                ...firstPage,
                data: {
                  ...firstPage.data,
                  messages: [optimisticMessage, ...firstPage.data.messages],
                },
              },
              ...pages,
            ],
          };
        }
      );

      return { previousMessages };
    },
    onSettled(data, _error, _variables, context) {
      if (!data?.error) {
        return;
      }

      queryClient.setQueryData(
        getMessagesQueryKey,
        () => context?.previousMessages
      );
    },
  });

  const onInput: FormEventHandler<HTMLDivElement> = (event) => {
    const { currentTarget } = event;

    setValue(DEFAULT_MESSAGE_INPUT_NAME, currentTarget.textContent || "", {
      shouldValidate: true,
    });
  };

  const formRef = useRef<HTMLFormElement | null>(null);

  const onChange = useCallback(
    (value: string) => {
      setValue("message", value);
    },
    [setValue]
  );

  const {
    setEditor,
    editor,
    searchTerm,
    startIndex,
    cursorPosition,
    type,
    clear,
  } = useEditor({
    formRef,
    channelName,
    onChange,
  });

  const createMessage = useCallback(
    (message: string, attachments = files) => {
      mutate({
        channelId,
        message,
        attachments,
        messageReference,
      });

      setTimeout(async () => {
        reset();
        editor?.dispatch({
          changes: { from: 0, to: editor?.state.doc.length, insert: "" },
        });
      });
    },
    [channelId, editor, files, messageReference, mutate, reset]
  );

  const onSubmit = handleSubmit(async function onSubmit() {
    const isValid = await trigger("message");

    if (!isValid) {
      return;
    }

    createMessage(message);

    clearUploadHistory();
  });

  const messageError = errors.message as FieldError;

  const hasMoreThanThreePeopleTyping = typingUsers.length > 3;
  const firstThreeTypingUsers = typingUsers.slice(0, 3).join(", ");
  const typingText = `${firstThreeTypingUsers}${
    hasMoreThanThreePeopleTyping ? " and more users" : ""
  } ${typingUsers.length === 1 ? "is" : "are"} typing...`;

  const {
    recorder,
    startRecording,
    isRecording,
    recordedAudio,
    clearRecorder,
  } = useRecorder();

  const { data, keys, onSelect, renderItem, getKey } = useAutocomplete({
    serverId,
    editor,
    startIndex,
    cursorPosition,
    type,
  });

  return (
    <div className="w-full relative">
      <Reply />
      <div
        className={twMerge(
          "hidden overflow-hidden relative p-2 pt-6 bg-black-560 border-b border-black-600 rounded-t-md",
          !!files.length && "grid",
          !!messageReference && "rounded-none"
        )}
      >
        <p className="text-sm absolute top-1 px-1.5 text-white-0">
          {getFileSizeWithUnit(size)} / {maxFilesSize} MB
        </p>
        <ul className="flex py-2 gap-2 overflow-auto px-0.5 w-full scrollbar">
          {files.map((file) => (
            <PreviewAttachment key={file.name} {...file} />
          ))}
        </ul>
      </div>
      <span
        className={twMerge(
          "text-red-500 bg-transparent text-sm gap-1 flex-col p-1 flex",
          (error || messageError) && "bg-black-560"
        )}
        aria-hidden
      >
        {error && (
          <span className="flex items-center gap-1">
            <ErrorIcon />
            {error.message}
          </span>
        )}
        {messageError && (
          <span className="flex items-center gap-1">
            <ErrorIcon />
            {messageError.message}
          </span>
        )}
      </span>
      <div className="relative">
        <FormProvider<SendMessageSchemaType> {...useFormResult}>
          <form ref={formRef} onSubmit={onSubmit} className="w-full">
            <div
              className={twMerge(
                "flex bg-black-560 w-full rounded-lg gap-2 items-start relative theme-dark",
                (!!files.length || !!messageReference) && "rounded-t-none",
                (error || messageError) && "rounded-t-none"
              )}
            >
              <MessageUpload
                error={error}
                name="messageFiles"
                onChange={onFilesSelected}
                files={files}
              />
              <AutocompleteProvider<Server["members"][number] | Emoji | Role>
                editor={editor}
                onSelect={onSelect}
                clear={clear}
                data={data}
              >
                <Autocomplete<Server["members"][number] | Emoji | Role>
                  type={type}
                  keys={keys}
                  searchTerm={searchTerm}
                  editor={editor}
                  clear={clear}
                  renderItem={renderItem}
                  getKey={getKey}
                />
                <MessageInput
                  name={DEFAULT_MESSAGE_INPUT_NAME}
                  onInput={onInput}
                  setEditor={setEditor}
                />
              </AutocompleteProvider>
              <Button
                type="submit"
                className={twMerge(
                  "bg-transparent p-0 rounded-none hover:bg-transparent sr-only",
                  (isRecording || recordedAudio) && "-mt-2"
                )}
              >
                <span className="sr-only">Send message</span>
                <PaperPlaneIcon />
              </Button>
            </div>
          </form>
        </FormProvider>
        <div className="flex text-gray-150 absolute top-3 right-2.5 gap-2 z-[1000]">
          <GifPicker onSelect={(gif) => createMessage(gif.itemurl, [])} />
          <EmojiPicker
            onSelect={(emoji) => {
              // editor.ins
              // editor.insertText(` :${emoji.uniqueName}: `);
            }}
          />
          <div
            className={twMerge(
              "flex items-center",
              (isRecording || recordedAudio) && "-mt-1.5"
            )}
          >
            <button
              type="button"
              onClick={startRecording}
              aria-expanded={isRecording || !!recordedAudio}
            >
              <span className="sr-only">Create a voice clip</span>
              <MicrophoneIcon className="size-6" />
            </button>
            <div
              className={twMerge(
                "items-center hidden",
                (isRecording || recordedAudio) && "flex"
              )}
            >
              {(isRecording || !!recordedAudio) && (
                <VoiceClipPlayer
                  recorder={recorder}
                  isRecording={isRecording}
                  blob={recordedAudio}
                  clearRecorder={clearRecorder}
                />
              )}
              <Button
                type="button"
                className="bg-transparent p-0 rounded-none hover:bg-transparent ml-2 aria-disabled:sr-only"
                aria-disabled={!recordedAudio}
                onClick={async () => {
                  if (!recordedAudio) {
                    return;
                  }

                  const file = await transformFile(
                    new File(
                      [recordedAudio],
                      `__VOICECLIP__${user.username}.mp3`,
                      {
                        type: recordedAudio.type,
                      }
                    ),
                    { isSpoiler: false, isVoiceClip: true }
                  );

                  createMessage("", [file]);

                  await clearRecorder();
                }}
              >
                <span className="sr-only">Send voice clip</span>
                <PaperPlaneIcon />
              </Button>
            </div>
          </div>
          <CreatePoll channelId={channelId} />
        </div>
      </div>
      <p
        className="font-normal text-white-500 text-sm mt-0.5 min-h-5 ml-0.5"
        aria-live="polite"
      >
        {typingUsers.length > 0 && typingText}
      </p>
      <Modal
        isOpen={sizeLimitModal.isOpen}
        close={sizeLimitModal.close}
        ref={sizeLimitModal.ref}
      >
        <div className="flex flex-col items-center max-w-96">
          <span className="-mt-2">
            <FolderIcon className="size-20" />
          </span>
          <h2 className="flex gap-2 mt-4 text-2xl font-semibold">
            Sorry, its too big.
          </h2>
          <span className="text-xs">that is what she said</span>
          <p className="mt-4 text-center text-sm">
            This file exceeded size limit, maximum size of single file is{" "}
            <strong>512 KB</strong> and all files together cannot exceed{" "}
            <strong>3 MB</strong>
          </p>
        </div>
      </Modal>
    </div>
  );
}
