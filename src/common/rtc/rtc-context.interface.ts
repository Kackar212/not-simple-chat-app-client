import {
  BaseServer,
  ChannelWithServer,
  Server,
} from "@common/api/schemas/server.schema";
import { User } from "@common/api/schemas/user.schema";
import { ChannelWithoutMessages } from "@common/api/schemas/channel.schema";
import { SelectVoiceChannel } from "./types/select-voice-channel.type";
import { Dispatch, SetStateAction } from "react";
import { Microphone } from "@common/hooks/use-microphone/microphone.interface";
import { ConnectionStatus } from "./connection-status.enum";
import { RtpCapabilities } from "mediasoup-client/lib/RtpParameters";
import { Consumer } from "mediasoup-client/lib/Consumer";

export interface RtcContext {
  selectedChannelId?: number;
  isUserConnected: boolean;
  user: User;
  server?: BaseServer;
  isMicrophoneMuted: boolean;
  isConnecting: boolean;
  isOutputDeviceMuted: boolean;
  isInteractionRequired: boolean;
  selectedChannel?: ChannelWithServer;
  latency?: number;
  isMicrophoneGranted?: boolean;
  members: Record<number, User[]>;
  microphone: Microphone;
  rtpCapabilities?: RtpCapabilities;
  isCurrentUserSpeaking: boolean;
  mutedUsers: string[];
  isCallPending: boolean;
  toggleMicrophone: (force?: boolean) => Promise<void>;
  selectVoiceChannel: SelectVoiceChannel;
  leaveVoiceChannel: () => void;
  toggleOutputDevice: () => void;
  setSession: Dispatch<SetStateAction<RtcContext>>;
  getConnectionStatus: () => ConnectionStatus;
}
