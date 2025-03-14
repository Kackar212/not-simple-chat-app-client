import { ChannelWithoutMessages } from "@common/api/schemas/channel.schema";
import { DirectMessageChannel } from "@common/api/schemas/direct-message-channel.schema";
import { CustomEmoji } from "@common/api/schemas/emoji.schema";
import { Friend } from "@common/api/schemas/friend.schema";
import { Member } from "@common/api/schemas/member.schema";
import { Message } from "@common/api/schemas/message.schema";
import { ChannelWithServer } from "@common/api/schemas/server.schema";
import { User } from "@common/api/schemas/user.schema";
import {
  RtpCapabilities,
  RtpParameters,
} from "mediasoup-client/lib/RtpParameters";
import { TransportOptions } from "mediasoup-client/lib/Transport";

export interface ServerSocketEvents {
  join: (data: { channelId: number; socketId: string }) => void;
  message: (message: Message) => void;
  channel: (channel: ChannelWithoutMessages) => void;
  joinPrivateRoom: () => void;
  status: (user: User) => void;
  friend: (data: Friend & { isDeleted?: boolean }) => void;
  directMessageChannel: (channel: DirectMessageChannel) => void;
  block: (blocked: User) => void;
  unblock: (unblockedUser: User) => void;
  member: (member: Member) => void;
  typing: (typingUsers: string[]) => void;
  offer: (data: {
    offer: RTCSessionDescriptionInit;
    channelId: number;
    answerTo: string;
  }) => void;
  candidate: (data: {
    candidate: RTCIceCandidate;
    candidateFrom: string;
    channelId: number;
  }) => void;
  answer: (data: {
    answer: RTCSessionDescriptionInit;
    answerFrom: string;
    channelId: number;
  }) => void;
  userJoinedVoiceChannel: (data: {
    channelId: number;
    socketId: string;
    newMember: User;
    members: User[];
  }) => void;
  userLeftVoiceChannel: (data: { username: string }) => void;
  userJoinedServer: (data: {
    voiceChannelMembers: Record<number, Partial<User>[]>;
    userToChannel: Record<string, number>;
  }) => void;
  members: (data: { members: User[]; channelId: number }) => void;
  rtcDisconnect: () => void;
  connected: () => void;
  pong: (data: { id: number; latency?: number }) => void;
  speaking: (data: { speaking: boolean }) => void;
  getRtpCapabilities: (data: {
    rtpCapabilities: RtpCapabilities;
    channel: ChannelWithServer;
  }) => void;
  createConsumeTransport: (data: { params: TransportOptions }) => void;
  createProduceTransport: (data: { params: TransportOptions }) => void;
  transportConnected: (data: { success: boolean }) => void;
  produce: (producerId: string) => void;
  consume: (data: {
    rtpParameters: RtpParameters;
    id: string;
    kind: "audio" | "video";
    producerId: string;
    user: User;
    resumeConsumer: boolean;
  }) => void;
  newProducer: (socketId: string) => void;
  disconnected: () => void;
  rejoin: (data: {
    socketId: string;
    serverId: number;
    channelId: number;
  }) => void;
  changeProducerState: (data: {
    paused: boolean;
    username: string;
    channelId: number;
  }) => void;
  voiceCallEnded: (message: Message) => void;
  punished: (data: { type: "ban" | "kick"; serverId: number }) => void;
  reaction: (reaction: {
    id: number;
    emojiId: number | null;
    emojiName: string;
    emoji: {
      name: string;
      url: string;
    } | null;
    messageId: number;
    memberId: number;
    count: number;
  }) => void;
  emoji: (emoji: CustomEmoji) => void;
}
