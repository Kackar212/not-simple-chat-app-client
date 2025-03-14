import { User } from "@common/api/schemas/user.schema";
import { authContext } from "@common/auth/auth.context";
import { useSafeContext } from "@common/hooks";
import { rtcContext } from "@common/rtc";
import { Button } from "@components/button/button.component";
import { twMerge } from "tailwind-merge";
import MicrophoneIcon from "/public/assets/icons/microphone.svg";
import MicrophoneMutedIcon from "/public/assets/icons/microphone-muted.svg";
import { mediasoupStorage } from "@common/rtc/mediasoup";
import { socket } from "@common/socket";
import { useCallback } from "react";

interface MuteParticipantButtonProps {
  participant: User;
}

export function MuteParticipantButton({
  participant,
}: MuteParticipantButtonProps) {
  const {
    auth: { user: currentUser },
  } = useSafeContext(authContext);
  const {
    isUserConnected,
    isOutputDeviceMuted,
    mutedUsers,
    selectedChannelId,
    setSession,
  } = useSafeContext(rtcContext);

  const isParticipantMuted = mutedUsers.includes(participant.username);
  const label = isParticipantMuted
    ? `Unmute ${participant.displayName}`
    : `Mute ${participant.displayName}`;

  const shouldDisplayMuteButton =
    participant.username !== currentUser.username &&
    isUserConnected &&
    participant.isSelfMuted !== true &&
    !isOutputDeviceMuted;

  const muteParticipant = useCallback(() => {
    if (!selectedChannelId) {
      return;
    }

    const member = mediasoupStorage.members.get(participant.username);
    const isMuted = mutedUsers.includes(participant.username);

    if (!member) {
      return;
    }

    mediasoupStorage.members.set(participant.username, {
      ...member,
      isMuted,
    });

    setSession((rtcSession) => ({
      ...rtcSession,
      mutedUsers: rtcSession.mutedUsers.filter(
        (username) => participant.username !== username
      ),
    }));

    if (!isMuted) {
      setSession((rtcSession) => ({
        ...rtcSession,
        mutedUsers: [...rtcSession.mutedUsers, participant.username],
      }));
    }

    socket.emit("changeConsumerState", {
      consumerId: member.consumer.id,
      channelId: selectedChannelId,
      paused: !isMuted,
    });
  }, [mutedUsers, participant.username, selectedChannelId, setSession]);

  return (
    shouldDisplayMuteButton && (
      <Button
        data-tooltip-id="tooltip"
        data-tooltip-content={label}
        className={twMerge(
          "size-8 justify-items-center items-center p-0 bg-transparent text-gray-150 hover:bg-gray-260/30 rounded-lg",
          isParticipantMuted && "text-red-500"
        )}
        onClick={muteParticipant}
      >
        <span className="sr-only">{label}</span>
        {isParticipantMuted ? (
          <MicrophoneMutedIcon className="size-full" aria-hidden />
        ) : (
          <MicrophoneIcon className="size-full" aria-hidden />
        )}
      </Button>
    )
  );
}
