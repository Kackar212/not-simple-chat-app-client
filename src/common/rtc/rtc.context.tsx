"use client";

import { initialUser } from "@common/auth/auth-context.reducer";
import { useMicrophone } from "@common/hooks/use-microphone/use-microphone.hook";
import { socket } from "@common/socket";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRtcSignaling } from "./use-rtc-signaling.hook";
import { RtcContext } from "./rtc-context.interface";
import { ConnectionStatus } from "./connection-status.enum";
import { Microphone } from "@common/hooks/use-microphone/microphone.interface";
import {
  createConsumer,
  createProducer,
  createTransport,
  getDevice,
  mediasoupStorage,
  TransportType,
} from "./mediasoup";
import { playSound, Sound } from "./helpers";
import { useSafeContext } from "@common/hooks";
import { authContext } from "@common/auth/auth.context";

const defaultContext: RtcContext = {
  isUserConnected: false,
  user: initialUser,
  isConnecting: false,
  isMicrophoneMuted: true,
  isOutputDeviceMuted: false,
  isMicrophoneGranted: true,
  isInteractionRequired: false,
  members: {},
  microphone: {} as Microphone,
  isCurrentUserSpeaking: false,
  mutedUsers: [],
  isCallPending: false,
  async toggleMicrophone() {},
  selectVoiceChannel() {},
  leaveVoiceChannel() {},
  toggleOutputDevice() {},
  setSession() {},
  getConnectionStatus() {
    return ConnectionStatus.Good;
  },
};

interface RtcProviderProps {
  pushToTalkKey: string;
}

export const rtcContext = createContext<RtcContext>(defaultContext);

let timestamp = Date.now();

export function RtcProvider({
  children,
  pushToTalkKey,
}: PropsWithChildren<RtcProviderProps>) {
  const {
    auth: { user },
  } = useSafeContext(authContext);

  const [rtcSession, setRtcSession] = useState<RtcContext>({
    ...defaultContext,
    isMicrophoneMuted:
      typeof user.isSelfMuted === "undefined" ? true : user.isSelfMuted,
  });
  const microphone = useMicrophone({});

  const { selectVoiceChannel, leaveVoiceChannel } = useRtcSignaling({
    microphone,
    setRtcSession,
    initialRtcSession: defaultContext,
    isMicrophoneMuted: rtcSession.isMicrophoneMuted,
  });

  const toggleOutputDevice = () => {
    playSound(rtcSession.isOutputDeviceMuted ? Sound.Unmute : Sound.Mute);

    socket.emit("toggleAllConsumers", {
      muted: rtcSession.isOutputDeviceMuted,
      channelId: rtcSession.selectedChannelId,
    });

    setRtcSession((rtcSession) => ({
      ...rtcSession,
      isOutputDeviceMuted: !rtcSession.isOutputDeviceMuted,
    }));
  };

  const getConnectionStatus = () => {
    if (typeof rtcSession.latency === "undefined") {
      return ConnectionStatus.Disconnected;
    }

    if (rtcSession.latency > 50) {
      return ConnectionStatus.Bad;
    }

    if (rtcSession.latency > 30) {
      return ConnectionStatus.Average;
    }

    return ConnectionStatus.Good;
  };

  const toggleMicrophone = useCallback(
    async (force?: boolean) => {
      let isGranted: boolean | undefined = undefined;
      let isMuted: boolean = true;

      try {
        isMuted = await microphone.toggleMutedState(force);
      } catch {
        isGranted = false;
      }

      sessionStorage.setItem("isSelfMuted", String(isMuted));

      if (isMuted) {
        playSound(Sound.Mute);

        if (rtcSession.selectedChannelId) {
          mediasoupStorage.producer?.pause();

          socket.emit("changeProducerState", {
            paused: true,
            channelId: rtcSession.selectedChannelId,
          });
        }
      }

      if (!isMuted) {
        playSound(Sound.Unmute);

        socket.emit("changeProducerState", {
          paused: false,
          channelId: rtcSession.selectedChannelId,
        });
      }

      setRtcSession((rtcSession) => ({
        ...rtcSession,
        isMicrophoneMuted: isMuted,
        isMicrophoneGranted: isGranted,
        isCurrentUserSpeaking: isMuted
          ? false
          : rtcSession.isCurrentUserSpeaking,
      }));
    },
    [microphone, rtcSession.selectedChannelId]
  );

  useEffect(() => {
    socket.on("disconnected", () => {
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
    });

    socket.on("getRtpCapabilities", async ({ rtpCapabilities, channel }) => {
      if (rtcSession.selectedChannelId === channel.id) {
        return;
      }

      setRtcSession((rtcSession) => ({
        ...rtcSession,
        isConnecting: true,
        selectedChannelId: channel.id,
        selectedChannel: channel,
        server: channel.server,
      }));

      const device = getDevice();

      if (!device.loaded) {
        await device.load({ routerRtpCapabilities: rtpCapabilities });
      }

      const [consumeTransport, produceTransport] = await Promise.all([
        createTransport({
          type: TransportType.Consume,
          rtpCapabilities,
          channelId: channel.id,
        }),
        createTransport({
          type: TransportType.Produce,
          rtpCapabilities,
          channelId: channel.id,
          isMuted: rtcSession.isMicrophoneMuted,
        }),
      ]);

      console.log(consumeTransport);

      mediasoupStorage.consumeTransport = consumeTransport;
      mediasoupStorage.produceTransport = produceTransport;

      socket.on("newProducer", async () => {
        socket.emit("consume", { channelId: channel.id, rtpCapabilities });
        socket.emit("changeProducerState", {
          channelId: channel.id,
          paused: microphone.isMuted,
        });

        playSound(Sound.Join);
      });

      const consumer = await createConsumer(channel.id, rtpCapabilities);

      let isInteractionRequired = false;
      if (consumer) {
        const member = mediasoupStorage.members.get(
          consumer.appData.user.username
        );

        try {
          await member?.audio.play();
        } catch {
          isInteractionRequired = true;
        }

        mediasoupStorage.consumers.push(consumer);
      }

      setRtcSession((rtcSession) => ({
        ...rtcSession,
        isUserConnected: true,
        isConnecting: false,
        isInteractionRequired,
      }));

      microphone
        .get()
        .then(async (stream) => {
          setRtcSession((rtcSession) => ({
            ...rtcSession,
            isMicrophoneGranted: true,
          }));

          const producer = await createProducer(stream);

          if (!producer) {
            return;
          }

          socket.emit("changeProducerState", {
            channelId: channel.id,
            paused: microphone.isMuted,
          });

          mediasoupStorage.producer = producer;
        })
        .catch((e) => {
          console.log("PRODUCE ERROR: ", e);
          setRtcSession((rtcSession) => ({
            ...rtcSession,
            isMicrophoneGranted: false,
          }));
        });
    });

    socket.on("changeProducerState", ({ paused, username, channelId }) => {
      const channelMembers = rtcSession.members[channelId] || [];
      const channelMembersCopy = [...channelMembers];
      console.log(channelMembersCopy);
      const selfMutedMemberIndex = channelMembersCopy.findIndex(
        (member) => member.username === username
      );

      channelMembersCopy[selfMutedMemberIndex] = {
        ...channelMembersCopy[selfMutedMemberIndex],
        isSelfMuted: paused,
      };

      setRtcSession((rtcSession) => ({
        ...rtcSession,
        members: {
          ...rtcSession.members,
          [channelId]: channelMembersCopy,
        },
      }));
    });

    const onInteraction = () => {
      [...mediasoupStorage.members.values()].forEach((member) =>
        member.audio.play()
      );
    };

    window.addEventListener("click", onInteraction);

    if (!rtcSession.isUserConnected) {
      return () => {
        window.removeEventListener("click", onInteraction);
        socket.off("disconnected");
        socket.off("getRtpCapabilities");
        socket.off("changeProducerState");
      };
    }

    const onKeyDown = async (ev: KeyboardEvent) => {
      if (
        ev.key.toLowerCase() !== pushToTalkKey ||
        !rtcSession.selectedChannelId ||
        ev.repeat ||
        microphone.isMuted
      ) {
        return;
      }

      mediasoupStorage.producer?.resume();

      socket.emit("resumeProducer", {
        channelId: rtcSession.selectedChannelId,
      });

      setRtcSession((rtcSession) => ({
        ...rtcSession,
        isCurrentUserSpeaking: true,
      }));
    };

    const onKeyUp = async (ev: KeyboardEvent) => {
      if (ev.key.toLowerCase() !== pushToTalkKey) {
        return;
      }

      mediasoupStorage.producer!.pause();
      microphone.mute();

      setRtcSession((rtcSession) => ({
        ...rtcSession,
        isCurrentUserSpeaking: false,
      }));
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const onSpeaking = async ({
      detail: { isSpeaking, remote, username },
    }: CustomEvent<{
      isSpeaking: boolean;
      remote: boolean;
      username: string;
    }>) => {
      console.log("remote user: ", username, " is speakign right now!");
      console.log("EVENT SPEAKING: ", remote, isSpeaking, username);
      const members = { ...rtcSession.members };

      const channelMembers = Object.entries(members).find(
        ([_channelId, users]) => {
          return users.some((user) => user.username === username);
        }
      );

      const [channelId, users] = channelMembers || [];

      if (!channelId || !users) {
        return;
      }

      const userIndex = users.findIndex((user) => user.username === username);
      const usersCopy = [...users];

      usersCopy[userIndex] = { ...users[userIndex], isSpeaking };

      setRtcSession((rtcSession) => ({
        ...rtcSession,
        members: { ...rtcSession.members, [channelId]: [...usersCopy] },
      }));
    };

    document.addEventListener("speaking", onSpeaking);

    const onVoiceActivation = ({
      detail: { isSpeaking },
    }: CustomEvent<{ isSpeaking: boolean }>) => {
      if (microphone.isMuted || !rtcSession.selectedChannelId) {
        return;
      }

      setRtcSession((rtcSession) => ({
        ...rtcSession,
        isCurrentUserSpeaking: isSpeaking,
      }));

      if (isSpeaking) {
        mediasoupStorage.producer?.resume();

        return;
      }

      mediasoupStorage.producer?.pause();
    };

    document.addEventListener("voiceactivation", onVoiceActivation);

    return () => {
      document.removeEventListener("voiceactivation", onVoiceActivation);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("speaking", onSpeaking);
      socket.off("disconnected");
      socket.off("getRtpCapabilities");
    };
  }, [
    microphone,
    pushToTalkKey,
    rtcSession.isMicrophoneMuted,
    rtcSession.isUserConnected,
    rtcSession.members,
    rtcSession.selectedChannelId,
  ]);

  return (
    <rtcContext.Provider
      value={{
        ...rtcSession,
        microphone,
        selectVoiceChannel,
        leaveVoiceChannel,
        toggleMicrophone,
        toggleOutputDevice,
        setSession: setRtcSession,
        getConnectionStatus,
      }}
    >
      {children}
    </rtcContext.Provider>
  );
}
