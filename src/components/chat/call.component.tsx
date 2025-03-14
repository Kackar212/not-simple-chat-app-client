import { useSafeContext } from "@common/hooks";
import { rtcContext } from "@common/rtc";
import { socket, SocketEvent } from "@common/socket";
import { Avatar } from "@components/avatar/avatar.component";
import {
  Fragment,
  MouseEventHandler,
  useCallback,
  useEffect,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import { Recipient } from "@common/api/schemas/user.schema";
import { authContext } from "@common/auth/auth.context";
import { ToggleAudioDeviceButton } from "@components/toggle-audio-device-button/toggle-audio-device-button.component";
import CallIcon from "/public/assets/icons/call.svg";
import DisconnectIcon from "/public/assets/icons/disconnect.svg";
import MicrophoneIcon from "/public/assets/icons/microphone.svg";
import MicrophoneMutedIcon from "/public/assets/icons/microphone-muted.svg";
import { AvatarSize } from "@common/constants";

interface CallProps {
  recipient: Recipient;
  channelId: number;
}

export function Call({ recipient, channelId }: CallProps) {
  const {
    selectVoiceChannel,
    leaveVoiceChannel,
    isCurrentUserSpeaking,
    selectedChannelId,
    toggleMicrophone,
    isMicrophoneMuted,
    members,
  } = useSafeContext(rtcContext);

  const {
    auth: { member },
  } = useSafeContext(authContext);

  const endCall = useCallback(() => {
    leaveVoiceChannel();
  }, [leaveVoiceChannel]);

  if (!members[channelId] || members[channelId].length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-4 bg-black-800">
      <div className="flex gap-4">
        {members[channelId].map(
          ({ id, avatar, displayName, isSelfMuted, isSpeaking }) => (
            <Fragment key={id}>
              <Avatar
                src={avatar}
                alt={displayName}
                size={AvatarSize.XXXXL}
                className={twMerge(
                  "z-10 p-1",
                  isSpeaking && "outline-2 -outline-offset-2 outline-green-300",
                  isCurrentUserSpeaking &&
                    member.userId === id &&
                    "outline-2 -outline-offset-2 outline-green-300"
                )}
              />
              <div className="relative">
                {isMicrophoneMuted && id === member.userId && (
                  <div className="absolute right-0 -bottom-2 rounded-[50%] bg-red-600 border-4 border-black-800 z-10">
                    <MicrophoneMutedIcon className="size-6 text-white-500 p-1" />
                  </div>
                )}
                {isSelfMuted && (
                  <div className="absolute right-0 -bottom-2 rounded-[50%] bg-red-600 border-4 border-black-800 z-10">
                    <MicrophoneMutedIcon className="size-6 text-white-500 p-1" />
                  </div>
                )}
              </div>
            </Fragment>
          )
        )}
      </div>
      <div className="flex gap-4">
        {selectedChannelId && (
          <>
            <ToggleAudioDeviceButton
              isMuted={isMicrophoneMuted}
              MutedIcon={MicrophoneMutedIcon}
              UnmutedIcon={MicrophoneIcon}
              onClick={() => toggleMicrophone()}
              iconSize={7}
              className={twMerge(
                "size-14 rounded-[50%] bg-white-500 text-black-700",
                !isMicrophoneMuted &&
                  "hover:text-black-700 hover:bg-white-500/100",
                isMicrophoneMuted &&
                  "text-red-600 bg-gray-260/30 hover:bg-black-700/60"
              )}
            >
              {isMicrophoneMuted ? "Unmute microphone" : "Mute microphone"}
            </ToggleAudioDeviceButton>
            <button
              className="size-14 rounded-[50%] bg-red-600 text-white-500 flex items-center justify-center"
              onClick={endCall}
            >
              <span className="sr-only">End call</span>
              <DisconnectIcon className="size-7" />
            </button>
          </>
        )}
        {!selectedChannelId && (
          <button
            className="size-14 rounded-[50%] bg-green-600 text-white-500 flex items-center justify-center"
            onClick={() => selectVoiceChannel({ channelId })}
            data-tooltip-content="Join call"
            data-tooltip-id="tooltip"
          >
            <span className="sr-only">Join call</span>
            <CallIcon className="size-7" />
          </button>
        )}
      </div>
    </div>
  );
}
