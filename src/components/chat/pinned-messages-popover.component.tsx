import { MessageWithBaseUser } from "@common/api/schemas/message.schema";
import { Loader } from "@components/loader/loader.component";
import { Message } from "@components/message/message.component";
import { PopoverTrigger } from "@components/popover/popover-trigger.component";
import { Popover } from "@components/popover/popover.component";
import { PopoverProvider } from "@components/popover/popover.context";
import { useSafeContext } from "@common/hooks";
import { chatContext } from "./chat.context";
import { MessageSkeleton } from "@components/skeleton/message-skeleton.component";
import PinIcon from "/public/assets/icons/pin.svg";

export function PinnedMessagesPopover() {
  const {
    isGetPinnedMessagesQueryFetching,
    isGetPinnedMessagesQueryLoading,
    pinnedMessages,
    pinnedMessagesPopoverProps,
  } = useSafeContext(chatContext);

  return (
    <PopoverProvider context={pinnedMessagesPopoverProps}>
      <PopoverTrigger
        className="text-gray-150 size-6 items-center justify-items-center"
        data-tooltip-content="Pinned messages"
        data-tooltip-id="tooltip"
        data-tooltip-place="bottom"
      >
        <span className="sr-only">Open pinned messages</span>
        <PinIcon className="size-full" />
      </PopoverTrigger>
      <Popover shouldRenderInPortal>
        <div className="text-gray-100 bg-black-600 min-h-20 py-4 shadow-lg rounded-md w-72 sm:w-[420px] z-[110] border border-white-500 border-opacity-5">
          <div className="border-b border-b-black-560 mb-2 mx-4">
            <p className="flex py-2 gap-3">
              <PinIcon className="size-6" aria-hidden />{" "}
              <span className="text-xl">Pinned messages</span>
            </p>
          </div>
          <div className="px-4 max-h-[500px] scrollbar overflow-auto text-white-500">
            {pinnedMessages.length === 0 &&
              !isGetPinnedMessagesQueryLoading && (
                <div className="flex flex-col justify-center items-center text-sm font-medium text-gray-360">
                  <PinIcon className="size-6" aria-hidden />
                  <p className="max-w-[25ch] text-center">
                    This channel doesn&apos;t have any pinned messages.
                  </p>
                </div>
              )}
            {isGetPinnedMessagesQueryLoading && (
              <>
                <div className="bg-black-600 p-2 mb-2 rounded-md">
                  <MessageSkeleton isEven={false} small />
                </div>
                <div className="bg-black-600 p-2 mb-2 rounded-md">
                  <MessageSkeleton isEven={true} small />
                </div>
                <div className="bg-black-600 p-2 mb-2 rounded-md">
                  <MessageSkeleton isEven={false} small />
                </div>
              </>
            )}
            {pinnedMessages.map((message) => (
              <Message
                key={String(message.id)}
                isSubMessage={false}
                withActions={false}
                {...message}
              />
            ))}
            {isGetPinnedMessagesQueryFetching && (
              <div className="flex justify-center">
                <Loader />
              </div>
            )}
          </div>
        </div>
      </Popover>
    </PopoverProvider>
  );
}
