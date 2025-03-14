import {
  Dispatch,
  MouseEventHandler,
  SetStateAction,
  useMemo,
  useRef,
} from "react";
import { twMerge } from "tailwind-merge";
import { PopoverTrigger } from "@components/popover/popover-trigger.component";
import { Menu } from "@components/menu/menu.component";
import { Item } from "@components/menu/item.interface";
import EmojiIcon from "/public/assets/icons/emoji.svg";
import PinIcon from "/public/assets/icons/pin.svg";
import ReplyIcon from "/public/assets/icons/reply.svg";
import PencilIcon from "/public/assets/icons/pencil.svg";
import TrashIcon from "/public/assets/icons/trash-bin.svg";

interface MessageActionsProps {
  setIsEdited: Dispatch<SetStateAction<boolean>>;
  isEdited: boolean;
  isMouseOver: boolean;
  isOptimistic: boolean;
  isPinned: boolean;
  isCurrentUserAuthor: boolean;
  deleteMessage: () => void;
  pinMessage: () => void;
  setCommentReference: () => void;
}

export function MessageActions({
  setIsEdited,
  isEdited,
  isMouseOver,
  isOptimistic,
  isPinned,
  isCurrentUserAuthor,
  deleteMessage,
  pinMessage,
  setCommentReference,
}: MessageActionsProps) {
  const menuItems = useMemo<Item[]>(
    () => [
      {
        action: setCommentReference,
        label: (
          <span className="flex items-center gap-1">
            <ReplyIcon className="size-5" />
            Reply
          </span>
        ),
      },
      {
        action: pinMessage,
        label: (
          <span className="flex items-center gap-1">
            <PinIcon className="size-5" />
            {isPinned ? "Unpin" : "Pin"}
          </span>
        ),
      },
      {
        label: "Ban author",
        action() {},
        isMutation: true,
      },
    ],
    [pinMessage, setCommentReference, isPinned]
  );

  return (
    <div
      className={twMerge(
        `absolute opacity-0 -z-[1] right-12 -top-0 -translate-y-full flex items-stretch rounded-[4px] shadow-[0_0_0_1px_rgba(255,255,255,0.05)] focus-within:z-[999] focus-within:opacity-100 bg-black-630 text-gray-150`,
        isMouseOver && "opacity-100 z-[999]",
        isEdited &&
          "opacity-0 -z-[1] focus-within:-z-[1] focus-within:opacity-0",
        isOptimistic && "hidden"
      )}
      tabIndex={isEdited ? -1 : undefined}
    >
      <PopoverTrigger
        className="p-1 size-8 hover:bg-gray-260/30 hover:scale-110 transition-[background-color,scale] flex justify-center items-center"
        data-tooltip-content="Add reaction"
        data-tooltip-id="tooltip"
      >
        <span className="sr-only">Add reaction</span>
        <EmojiIcon aria-hidden className="size-5" />
      </PopoverTrigger>
      <button
        className="p-1 size-8 hover:bg-gray-260/30 hover:scale-110 transition-[background-color,scale] flex justify-center items-center"
        data-tooltip-content="Reply"
        data-tooltip-id="tooltip"
        onClick={setCommentReference}
      >
        <span className="sr-only">Reply</span>
        <ReplyIcon className="size-5" />
      </button>
      <button
        className="p-1 size-8 hover:bg-gray-260/30 hover:scale-110 transition-[background-color,scale] flex justify-center items-center"
        data-tooltip-content={`${isPinned ? "Unpin" : "Pin"} message`}
        data-tooltip-id="tooltip"
        onClick={pinMessage}
      >
        <span className="sr-only">{isPinned ? "Unpin" : "Pin"} message</span>
        <PinIcon aria-hidden className="size-5" />
      </button>
      {isCurrentUserAuthor && (
        <>
          <button
            className="p-1 size-8 hover:bg-gray-260/30 hover:scale-110 transition-[background-color,scale] flex justify-center items-center"
            data-tooltip-content="Edit"
            data-tooltip-id="tooltip"
            onClick={() => {
              setIsEdited(true);
            }}
          >
            <span className="sr-only">Edit message</span>
            <PencilIcon className="size-5" />
          </button>
          <button
            className="p-1 size-8 hover:bg-gray-260/30 hover:scale-110 transition-[background-color,scale] text-red-500 flex justify-center items-center"
            data-tooltip-content="Delete"
            data-tooltip-id="tooltip"
            onClick={deleteMessage}
          >
            <span className="sr-only">Delete message</span>
            <TrashIcon className="size-5" />
          </button>
        </>
      )}
      <Menu
        items={menuItems}
        openButton={{
          className: "rounded-none rounded-se-md rounded-ee-md bg-transparent",
          size: 32,
        }}
      />
    </div>
  );
}
