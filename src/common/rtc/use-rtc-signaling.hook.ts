import { ChannelWithoutMessages } from "@common/api/schemas/channel.schema";
import { Server } from "@common/api/schemas/server.schema";
import { Microphone } from "@common/hooks/use-microphone/microphone.interface";
import { socket, SocketEvent } from "@common/socket";
import { Dispatch, SetStateAction, useCallback, useEffect } from "react";
import { SelectVoiceChannel } from "./types/select-voice-channel.type";
import { RtcContext } from "./rtc-context.interface";
import { Device } from "mediasoup-client";
import { Producer, TransportOptions } from "mediasoup-client/lib/types";
import {
  createConsumer,
  createProducer,
  createTransport,
  getDevice,
  mediasoupStorage,
  TransportType,
} from "./mediasoup";
import { playSound, Sound } from "./helpers";

interface UseRtcSignalingProps {
  setRtcSession: Dispatch<SetStateAction<RtcContext>>;
  selectedChannelId?: number;
  microphone: Microphone;
  initialRtcSession: RtcContext;
  isMicrophoneMuted: boolean;
}

let timestamp: number;

export function useRtcSignaling({
  setRtcSession,
  selectedChannelId,
  microphone,
  isMicrophoneMuted,
}: UseRtcSignalingProps) {
  useEffect(() => {
    socket.on("rejoin", ({ channelId, socketId }) => {
      const previousSocketId = sessionStorage.getItem("previousSocketId");

      if (!previousSocketId) {
        return;
      }

      if (previousSocketId !== socketId) {
        return;
      }

      socket.emit(SocketEvent.JoinVoiceChannel, { channelId });
    });

    return () => {
      socket.off("rejoin");
    };
  }, []);

  const selectVoiceChannel: SelectVoiceChannel = useCallback(
    async ({ channelId }) => {
      if (selectedChannelId === channelId) {
        return;
      }

      if (selectedChannelId) {
        mediasoupStorage.destroy();
        microphone.stop();

        setRtcSession((rtcSession) => ({
          ...rtcSession,
          isConnecting: false,
          isUserConnected: false,
          mutedUsers: [],
          selectedChannelId: undefined,
          selectedChannel: undefined,
          server: undefined,
        }));

        document
          .querySelectorAll("audio.sr-only[data-id]")
          .forEach((audio) => audio.remove());
      }

      socket.emit(SocketEvent.JoinVoiceChannel, {
        channelId,
      });

      socket.once("connected", () => {
        playSound(Sound.Join);

        timestamp = Date.now();

        socket.emit("ping");
      });

      socket.off("pong").on("pong", () => {
        const latency = Date.now() - timestamp;

        setRtcSession((rtcSession) => ({
          ...rtcSession,
          isUserConnected: true,
          isConnecting: false,
          latency,
        }));

        setTimeout(() => {
          timestamp = Date.now();

          socket.emit("ping");
        }, 3000);
      });
    },
    [microphone, selectedChannelId, setRtcSession]
  );

  const leaveVoiceChannel = useCallback(() => {
    playSound(Sound.Leave);

    microphone.stop();

    mediasoupStorage.destroy();

    setRtcSession((rtcSession) => ({
      ...rtcSession,
      isUserConnected: false,
      selectedChannelId: undefined,
      isConnecting: false,
    }));

    socket.emit("leaveVoiceChannel");
    socket.off("pong");
  }, [microphone, setRtcSession]);

  return { selectVoiceChannel, leaveVoiceChannel };
}
