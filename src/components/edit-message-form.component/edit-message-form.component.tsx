import { getQueryClient } from "@/app/get-query-client";
import Loading from "@/app/loading";
import { ApiError, editMessage, QueryResponse } from "@common/api";
import { MessagesResponseWithCursor } from "@common/api/schemas/message.schema";
import { QueryKey } from "@common/constants";
import { SlateNode } from "@common/slate";
import { getPage } from "@common/utils";
import { Button } from "@components/button/button.component";
import { ErrorIcon } from "@components/icons";
import { PaperPlaneIcon } from "@components/icons/paper-plane.icon";
import { MessageInput } from "@components/input/message-input.component";
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Dispatch,
  FormEventHandler,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { FieldError, useFormContext } from "react-hook-form";
import { createEditor } from "slate";
import { withHistory } from "slate-history";
import { withReact } from "slate-react";
import { twMerge } from "tailwind-merge";

interface EditMessageFormProps {
  message: string;
  setIsEdited: Dispatch<SetStateAction<boolean>>;
  messageId: number;
  channelId: number;
}

const EDIT_MESSAGE_INPUT_NAME = "editMessage";

export function EditMessageForm({
  message,
  setIsEdited,
  messageId,
  channelId,
}: EditMessageFormProps) {
  const [editor] = useState(() => withReact(withHistory(createEditor())));
  const formRef = useRef<HTMLFormElement | null>(null);
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: editMessage,
    onSettled(data) {
      const getMessagesQueryKey = QueryKey.Messages(channelId);

      queryClient.setQueryData(
        getMessagesQueryKey,
        (
          old: InfiniteData<QueryResponse<MessagesResponseWithCursor, ApiError>>
        ) => {
          const pages = [...old.pages];

          const [editedMessagePage, editedMessageIndex] = getPage(
            pages,
            messageId
          );

          const editedMessagePageIndex = pages.indexOf(editedMessagePage);

          if (
            !editedMessagePage?.data ||
            editedMessageIndex === -1 ||
            !data?.data?.message
          ) {
            return old;
          }

          const newMessages = [...editedMessagePage.data.messages];

          newMessages[editedMessageIndex] = {
            ...newMessages[editedMessageIndex],
            message: data.data.message,
          };

          pages[editedMessagePageIndex] = {
            ...editedMessagePage,
            data: {
              ...editedMessagePage.data,
              messages: newMessages,
            },
          };

          return {
            ...old,
            pages,
          };
        }
      );
    },
  });

  const {
    setValue,
    watch,
    trigger,
    formState: { errors },
    reset,
    handleSubmit,
  } = useFormContext();

  useEffect(() => {
    const onEscape = (ev: KeyboardEvent) => {
      if (ev.key !== "Escape") {
        return;
      }

      setIsEdited(false);
    };

    window.addEventListener("keydown", onEscape);

    return () => {
      window.removeEventListener("keydown", onEscape);
    };
  }, [setIsEdited]);

  const messageError = errors.editMessage as FieldError;

  const newMessage = watch("editMessage") || message;
  const onInput: FormEventHandler<HTMLDivElement> = (event) => {
    const { currentTarget } = event;

    setValue(EDIT_MESSAGE_INPUT_NAME, currentTarget.textContent || "", {
      shouldValidate: true,
    });
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(async () => {
        await trigger("editMessage");

        await mutateAsync({ messageId, message: newMessage });

        setIsEdited(false);
      })}
      className="grow  mt-2"
    >
      {messageError && (
        <span
          className="text-red-500 bg-black-560 text-sm gap-1 flex flex-col p-1"
          aria-hidden
        >
          {messageError && (
            <span className="flex items-center gap-1">
              <span aria-hidden>
                <ErrorIcon />
              </span>
              <span className="sr-only">Error: </span>
              {messageError.message}
            </span>
          )}
        </span>
      )}
      <div
        className={twMerge(
          "flex w-full rounded-md gap-2 items-start relative",
          messageError && "rounded-t-none"
        )}
      >
        {isPending && <Loading className="bg-black-700/60 z-10" />}
        <MessageInput
          name={EDIT_MESSAGE_INPUT_NAME}
          onInput={onInput}
          editor={editor}
          initialValue={[
            { type: SlateNode.Paragraph, children: [{ text: message }] },
          ]}
          containerClassName="px-4 pr-10"
          formRef={formRef}
        />
        <Button
          type="submit"
          className="bg-transparent px-2.5 py-0 rounded-none hover:bg-transparent absolute right-0 top-2"
        >
          <span className="sr-only">Send message</span>
          <PaperPlaneIcon />
        </Button>
      </div>
      <p className="text-xs mt-1">
        Press escape to{" "}
        <button
          aria-label="Stop editing"
          className="inline text-blue-300 hover:underline"
          onClick={() => {
            setIsEdited(false);
          }}
        >
          cancel
        </button>
      </p>
    </form>
  );
}
