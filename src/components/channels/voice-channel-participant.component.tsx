import { User } from "@common/api/schemas/user.schema";
import { Avatar } from "@components/avatar/avatar.component";
import { twMerge } from "tailwind-merge";
import MicrophoneMutedIcon from "/public/assets/icons/microphone-muted.svg";
import HeadsetMutedIcon from "/public/assets/icons/headset-muted.svg";
import { rtcContext } from "@common/rtc";
import { useSafeContext } from "@common/hooks";
import { authContext } from "@common/auth/auth.context";
import { MuteParticipantButton } from "./mute-participant-button.component";
import { AvatarSize } from "@common/constants";

interface VoiceChannelParticipant {
  participant: User;
}

export function VoiceChannelParticipant({
  participant,
}: VoiceChannelParticipant) {
  const { isCurrentUserSpeaking, isMicrophoneMuted, isOutputDeviceMuted } =
    useSafeContext(rtcContext);

  const {
    auth: { user: currentUser },
  } = useSafeContext(authContext);

  const isCurrentUser = currentUser.username === participant.username;
  const currentUserHasMutedMicrophone = isCurrentUser && isMicrophoneMuted;
  const currentUserHasMutedOutputDevice = isCurrentUser && isOutputDeviceMuted;
  const isUserSpeaking =
    participant.isSpeaking || (isCurrentUserSpeaking && isCurrentUser);

  return (
    <div
      className="flex justify-between items-center relative"
      key={participant.username}
    >
      <button
        aria-label={`Open ${participant.username} profile preview`}
        className="flex before:rounded-sm p-1 px-2 gap-2 items-center hover:before:bg-gray-260/30 before:absolute before:top-0 before:left-0 before:size-full"
      >
        <Avatar
          src={participant.avatar}
          size={AvatarSize.MD}
          className={twMerge(
            "z-10",
            isUserSpeaking &&
              "outline-2 outline outline-offset-2 outline-green-300"
          )}
        />
        <p className="text-sm z-10" aria-hidden>
          {participant.displayName}
        </p>
      </button>
      <div className="flex gap-1">
        {currentUserHasMutedMicrophone && (
          <div
            className="size-5 justify-items-center items-center text-gray-200"
            data-tooltip-id="tooltip"
            data-tooltip-content="Muted"
          >
            <MicrophoneMutedIcon className="size-full" />
          </div>
        )}
        {currentUserHasMutedOutputDevice && (
          <div
            className="size-5 justify-items-center items-center text-gray-200"
            data-tooltip-id="tooltip"
            data-tooltip-content="Deafened"
          >
            <HeadsetMutedIcon className="size-full" />
          </div>
        )}
        {participant.isSelfMuted && (
          <span
            data-tooltip-id="tooltip"
            data-tooltip-content="User is self muted"
            className="size-5 justify-items-center items-center text-gray-200"
          >
            <span className="sr-only">User is self muted</span>
            <MicrophoneMutedIcon className="size-full" aria-hidden />
          </span>
        )}
      </div>
      <MuteParticipantButton participant={participant} />
    </div>
  );
}
