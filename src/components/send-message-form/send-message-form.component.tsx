"use client";

import { ApiError, QueryResponse, mutations } from "@common/api";
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
import Image from "next/image";
import {
  FormEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { FieldError, useFormContext } from "react-hook-form";
import { getFileSizeWithUnit } from "@common/utils";
import { ReactEditor, withReact } from "slate-react";
import { withHistory } from "slate-history";
import { PaperPlaneIcon } from "@components/icons/paper-plane.icon";
import { ErrorIcon, PlusIcon } from "@components/icons";
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
import { createEditor } from "@common/slate";
import { PopoverProvider } from "@components/popover/popover.context";
import { PopoverTrigger } from "@components/popover/popover-trigger.component";
import { Popover } from "@components/popover/popover.component";
import { EmojiPicker } from "@components/emoji-picker/emoji-picker.component";
import { useEmojiStyle } from "@common/emojis/use-emoji-style.hook";
import { QueryKey } from "@common/constants";
import { GifPicker } from "@components/gif-picker/gif-picker.component";
import { MemberProfilePreview } from "@components/member-profile/member-profile-preview.component";
import { VoiceClipPlayer } from "@components/voice-clip-player/voice-clip-player.component";
import { useRecorder } from "@common/hooks/use-recorder.hook";
import { HistoryFile } from "@components/upload/history-file.interface";
import FolderIcon from "/public/assets/icons/folder.svg";
import MicrophoneIcon from "/public/assets/icons/microphone.svg";

interface SendMessageFormProps {
  channelId: number;
  channelName: string;
}

function createRecorder(stream: MediaStream) {
  return new MediaRecorder(stream);
}

export function SendMessageForm({
  channelId,
  channelName,
}: SendMessageFormProps) {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [editor] = useState(() => withReact(withHistory(createEditor())));
  const isUserTyping = useRef(false);
  let timeout = useRef<number | void>();

  const queryClient = useQueryClient();

  const {
    messageReference,
    setMessageReference,
    scrollContainerRef,
    getMessagesQueryResult: { hasPreviousPage },
  } = useSafeContext(chatContext);

  const { current: scrollContainer } = scrollContainerRef;

  const {
    auth: { member: currentMember, user },
  } = useSafeContext(authContext);

  const {
    setValue,
    watch,
    trigger,
    clearErrors,
    formState: { errors },
    reset,
    handleSubmit,
  } = useFormContext();

  const sizeLimitModal = useModal(() => {
    clearErrors("messageFiles");
  });

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

        editor.delete({
          at: {
            anchor: editor.start([]),
            focus: editor.end([]),
          },
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

  const clickedFileUrl = useRef<
    | Pick<
        HistoryFile<{ isSpoiler: boolean }>,
        | "url"
        | "isAudio"
        | "isVideo"
        | "isImage"
        | "isOther"
        | "isText"
        | "isGif"
        | "name"
      >
    | undefined
  >();
  const {
    ref: modal,
    isOpen,
    open,
    close,
  } = useModal(() => {
    clickedFileUrl.current = undefined;
  });

  const openEnlargedattachment = (
    file: HistoryFile<{ isSpoiler: boolean }>
  ) => {
    clickedFileUrl.current = file;

    open();
  };

  const formRef = useRef<HTMLFormElement | null>(null);

  const removeReply = useCallback(() => {
    setMessageReference(undefined);
  }, [setMessageReference]);

  const hasMoreThanThreePeopleTyping = typingUsers.length > 3;
  const firstThreeTypingUsers = typingUsers.slice(0, 3).join(", ");
  const typingText = `${firstThreeTypingUsers}${
    hasMoreThanThreePeopleTyping ? " and more users" : ""
  } ${typingUsers.length === 1 ? "is" : "are"} typing...`;

  const [{ row, column, isMouseOver }, setEmoji] = useState({
    row: 2,
    column: 10,
    isMouseOver: false,
  });

  const getRandom = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  const onMouseEnter = () => {
    const row = getRandom(0, 3);
    setEmoji({
      row,
      column: getRandom(0, row === 3 ? 16 : 19),
      isMouseOver: true,
    });
  };

  const onMouseLeave = () => {
    setEmoji({ row, column, isMouseOver: false });
  };

  const { style, properties } = useEmojiStyle({
    row,
    column,
  });

  const {
    recorder,
    startRecording,
    isRecording,
    setRef,
    ref,
    recordedAudio,
    dataUrl,
    clearRecorder,
  } = useRecorder();

  console.log(recordedAudio);

  return (
    <div className="w-full">
      <PopoverProvider>
        {messageReference && (
          <div className="p-2 bg-black-630 rounded-t-md flex justify-between">
            <div className="text-xs text-gray-150 flex items-center">
              Replying to&nbsp;
              <PopoverTrigger
                className="font-medium text-white-500 hover:underline inline"
                aria-label={`See ${messageReference.member.user.displayName} profile preview`}
              >
                <span aria-hidden>
                  {messageReference.member.user.displayName}
                </span>
              </PopoverTrigger>
            </div>
            <button
              data-tooltip-content="Remove reply"
              data-tooltip-id="tooltip"
              onClick={removeReply}
            >
              <PlusIcon className="rotate-45 size-5 text-gray-150" />
              <span className="sr-only">Don&apos;t reply</span>
            </button>
            <Popover>
              <MemberProfilePreview
                isCurrentUser={messageReference.member.userId === user.id}
                userId={messageReference.member.userId}
                serverId={messageReference.member.serverId}
              />
            </Popover>
          </div>
        )}
      </PopoverProvider>
      <form ref={formRef} onSubmit={onSubmit} className="w-full">
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
              <PreviewAttachment
                key={file.name}
                open={openEnlargedattachment}
                {...file}
              />
            ))}
          </ul>
          <Modal ref={modal} close={close} isOpen={isOpen} fullWidth>
            <h2 className="sr-only">
              attachment: {clickedFileUrl.current?.name}
            </h2>
            {clickedFileUrl.current &&
              (clickedFileUrl.current.isOther ||
                clickedFileUrl.current.isText) && (
                <iframe
                  src={clickedFileUrl.current.url}
                  className="w-[90vw] h-[80vh]"
                ></iframe>
              )}
            {clickedFileUrl.current && clickedFileUrl.current.isImage && (
              <Image
                src={clickedFileUrl.current.url}
                width={320}
                height={320}
                className="size-full"
                alt=""
              />
            )}
            {clickedFileUrl.current && clickedFileUrl.current.isVideo && (
              <video
                src={clickedFileUrl.current.url}
                controls
                className="w-fit h-auto"
              ></video>
            )}
          </Modal>
        </div>
        <span
          className={twMerge(
            "hidden text-red-500 bg-black-560 text-sm gap-1 flex-col p-1",
            (error || messageError) && "flex"
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
        <div
          className={twMerge(
            "flex bg-black-560 w-full rounded-lg gap-2 items-start relative",
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
          <MessageInput
            name={DEFAULT_MESSAGE_INPUT_NAME}
            onInput={onInput}
            channelName={channelName}
            editor={editor}
            formRef={formRef}
          />
          <div className="flex text-gray-150 absolute top-3 right-2.5 gap-2">
            <GifPicker onSelect={(gif) => createMessage(gif.itemurl, [])} />
            <PopoverProvider
              offset={{ mainAxis: 15, alignmentAxis: -10 }}
              placement="top-end"
              onOpenChange={() => {
                ReactEditor.focus(editor);
              }}
            >
              <PopoverTrigger
                style={properties}
                type="button"
                className="size-6 flex justify-center items-center"
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
              >
                <div
                  style={style.background}
                  className={twMerge(
                    "size-6 absolute transition-[scale] opacity-0",
                    isMouseOver && "scale-125 opacity-100"
                  )}
                ></div>
                <div
                  style={style.mask}
                  className={twMerge(
                    "size-6 bg-gray-150 absolute transition-[scale] duration-200",
                    isMouseOver && "opacity-0 scale-125"
                  )}
                ></div>
              </PopoverTrigger>
              <Popover>
                <EmojiPicker
                  onSelect={(emoji) => {
                    editor.insertText(` :${emoji.uniqueName}: `);
                  }}
                />
              </Popover>
            </PopoverProvider>
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
        </div>
      </form>
      {typingUsers.length > 0 && (
        <p className="font-normal text-white-500 mt-1 text-sm">{typingText}</p>
      )}
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
            {/* <span style={sizeLimitModalEmoji} className="inline-block size-6">
              <span style={style.emoji}></span>
            </span> */}
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
