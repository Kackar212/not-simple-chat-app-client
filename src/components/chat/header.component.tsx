import { ChannelType } from "@common/enums/channel-type.enum";
import { useSafeContext } from "@common/hooks";
import { rtcContext } from "@common/rtc";
import { Avatar } from "@components/avatar/avatar.component";
import { HashTagIcon } from "@components/icons";
import { SpeakerIcon } from "@components/icons/speaker.icon";
import { twMerge } from "tailwind-merge";
import { chatContext } from "./chat.context";
import { PinnedMessagesPopover } from "./pinned-messages-popover.component";
import { ToggleSidePanelButton } from "./toggle-side-panel-button.component";
import CallIcon from "/public/assets/icons/call.svg";
import MemberListIcon from "/public/assets/icons/member-list.svg";
import UserProfileIcon from "/public/assets/icons/user-profile.svg";
import { toast } from "react-toastify";
import { AvatarSize } from "@common/constants";

interface HeaderProps {
  channelType: ChannelType;
}

export function Header({ channelType }: HeaderProps) {
  const { selectVoiceChannel } = useSafeContext(rtcContext);
  const { channelId, channelName, recipient, isSidePanelHidden } =
    useSafeContext(chatContext);

  const isChatBlocked = recipient?.isBlocked || recipient?.isCurrentUserBlocked;
  const blockedText = recipient?.isBlocked
    ? " - You blocked this user!"
    : " - You are blocked by this user!";

  return (
    <header className="text-white-500 w-full p-3.5 px-4 shadow-header relative z-[102]">
      <div className="fixed top-0 contents">
        <div className="flex justify-between">
          <div className="relative">
            <h1 className="flex items-center gap-2 font-[500]">
              {channelType === ChannelType.Text && <HashTagIcon aria-hidden />}
              {channelType === ChannelType.Voice && (
                <SpeakerIcon className="size-6" />
              )}
              {recipient && (
                <Avatar
                  src={recipient.avatar}
                  size={AvatarSize.MD}
                  status={recipient.status}
                />
              )}
              {channelName}
            </h1>
          </div>
          <div className={twMerge("flex items-center justify-center gap-4")}>
            {recipient && (
              <button
                className="text-gray-150 size-6 items-center justify-items-center"
                data-tooltip-content={`Call ${recipient.displayName}${
                  isChatBlocked ? blockedText : ""
                }`}
                data-tooltip-id="tooltip"
                data-tooltip-place="bottom"
                onClick={() => {
                  if (recipient.isBlocked) {
                    toast.error("You can't call blocked user!", {
                      role: "generic",
                    });

                    return;
                  }

                  if (recipient.isCurrentUserBlocked) {
                    toast.error("You can't call user that blocked you!", {
                      role: "generic",
                    });

                    return;
                  }

                  selectVoiceChannel({ channelId });
                }}
                aria-disabled={isChatBlocked}
              >
                <span className="sr-only">
                  Call {recipient.displayName}${isChatBlocked && blockedText}
                </span>
                <CallIcon className="size-full" />
              </button>
            )}
            <PinnedMessagesPopover />
            {recipient && (
              <ToggleSidePanelButton
                text="Open recipient profile"
                Icon={<UserProfileIcon className="size-full" />}
                tooltip={
                  isSidePanelHidden
                    ? "Show recipient profile"
                    : "Hide recipient profile"
                }
              />
            )}
            {!recipient && (
              <ToggleSidePanelButton
                text="Open members list"
                Icon={<MemberListIcon className="size-full" />}
                tooltip={
                  isSidePanelHidden ? "Show members list" : "Hide members list"
                }
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
