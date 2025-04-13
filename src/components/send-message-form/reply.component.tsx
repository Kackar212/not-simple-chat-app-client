import { Message } from "@common/api/schemas/message.schema";
import { authContext } from "@common/auth/auth.context";
import { useSafeContext } from "@common/hooks";
import { chatContext } from "@components/chat/chat.context";
import { MemberProfilePreview } from "@components/member-profile/member-profile-preview.component";
import { PopoverTrigger } from "@components/popover/popover-trigger.component";
import { Popover } from "@components/popover/popover.component";
import { PopoverProvider } from "@components/popover/popover.context";
import { useCallback } from "react";
import CloseIcon from "/public/assets/icons/close.svg";

export function Reply() {
  const { setMessageReference, messageReference } = useSafeContext(chatContext);
  const {
    auth: { user },
  } = useSafeContext(authContext);

  const removeReply = useCallback(() => {
    setMessageReference(undefined);
  }, [setMessageReference]);

  return (
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
            <CloseIcon className="size-5 text-gray-150" />
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
  );
}
