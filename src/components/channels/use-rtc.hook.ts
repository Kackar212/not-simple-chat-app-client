import { ChannelWithoutMessages } from "@common/api/schemas/channel.schema";
import { Server } from "@common/api/schemas/server.schema";
import { User } from "@common/api/schemas/user.schema";
import { authContext } from "@common/auth/auth.context";
import { rtcContext } from "@common/rtc/rtc.context";
import { useSafeContext } from "@common/hooks";
import { socket, SocketEvent } from "@common/socket";
import { useCallback, useEffect, useRef, useState } from "react";
import { mediasoupStorage } from "@common/rtc/mediasoup";
import { playSound, Sound } from "@common/rtc/helpers";

interface UseRtcProps {
  initialMembers?: Record<string, User[]>;
  server: Server;
  channels: ChannelWithoutMessages[];
}

let voiceChannelId: number;
export function useRTC() {
  const {
    auth: { user },
  } = useSafeContext(authContext);

  const {
    selectVoiceChannel: joinVoiceChannel,
    leaveVoiceChannel,
    selectedChannelId,
    isUserConnected,
    setSession,
    isMicrophoneMuted,
    isConnecting,
    members,
    microphone,
    mutedUsers,
  } = useSafeContext(rtcContext);

  const onUserJoinedServer = useCallback(
    async ({
      voiceChannelMembers,
      userToChannel,
    }: {
      voiceChannelMembers: Record<number, Partial<User>[]>;
      userToChannel: Record<string, number>;
    }) => {
      setSession((rtcSession) => ({
        ...rtcSession,
        members: voiceChannelMembers as Record<number, User[]>,
      }));
    },
    [setSession]
  );

  useEffect(() => {
    socket.on(SocketEvent.Members, ({ members: newMembers, channelId }) => {
      setSession((rtcSession) => ({
        ...rtcSession,
        members: { ...rtcSession.members, [channelId]: newMembers },
      }));
    });

    socket.once("userLeftVoiceChannel", ({ username }) => {
      const member = mediasoupStorage.members.get(username);

      if (!member) {
        return;
      }

      playSound(Sound.Leave);

      member.consumer.close();

      document
        .querySelector(`audio[data-id="${member.consumer.id}"]`)
        ?.remove();

      const consumerIndex = mediasoupStorage.consumers.indexOf(member.consumer);

      setSession((rtcSession) => ({
        ...rtcSession,
        mutedUsers: rtcSession.mutedUsers.filter(
          (mutedUser) => mutedUser !== username
        ),
      }));

      mediasoupStorage.consumers.splice(consumerIndex, 1);

      mediasoupStorage.members.delete(username);
    });

    socket.on(SocketEvent.UserJoinedServer, onUserJoinedServer);

    return () => {
      socket.off(SocketEvent.UserJoinedServer, onUserJoinedServer);
      socket.off(SocketEvent.UserLeftVoiceChannel);
      socket.off(SocketEvent.Members);
    };
  }, [isMicrophoneMuted, members, onUserJoinedServer, setSession]);

  return {
    leaveVoiceChannel,
    joinVoiceChannel,
    members,
    userJoinedVoiceChannel: isUserConnected,
    mutedUsers,
  };
}
