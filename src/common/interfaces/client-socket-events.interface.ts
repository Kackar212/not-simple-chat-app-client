import { Message } from "@common/api/schemas/message.schema";
import { ActivityStatus } from "@common/enums/activity-status.enum";
import { RtpCapabilities } from "mediasoup-client/lib/RtpParameters";
import { DtlsParameters, ProducerOptions } from "mediasoup-client/lib/types";

export type ClientSocketEvents = {
  join: (data: { channelId: number }) => void;
  joinPrivateRoom: () => void;
  typing: (data: {
    channelId: number;
    status: string;
    username: string;
  }) => void;
  offer: (data: {
    offer: RTCSessionDescriptionInit;
    channelId: number;
    username: string;
  }) => void;
  candidate: (data: {
    candidate: unknown;
    channelId: number;
    username: string;
  }) => void;
  answer: (data: {
    answer: RTCSessionDescriptionInit;
    username: string;
    channelId: number;
  }) => void;
  joinVoiceChannel: (data: { channelId: number }) => void;
  leaveVoiceChannel: () => void;
  joinServer: (data: { serverId: number }) => void;
  status: (data: {
    status: ActivityStatus;
    serverId?: number;
    memberId?: number;
  }) => void;
  ping: () => void;
  speaking: (data: { speaking: boolean }) => void;
  getRtpCapabilities: (data: { channelId: number }) => void;
  createTransport: (data: {
    channelId: number;
    rtpCapabilities: RtpCapabilities;
    isProducer: boolean;
  }) => void;
  connectTransport: (data: {
    channelId: number;
    dtlsParameters: DtlsParameters;
    isProducer: boolean;
  }) => void;
  produce: (data: {
    channelId: number;
    producerOptions: ProducerOptions;
    isMuted: boolean;
  }) => void;
  consume: (data: {
    channelId: number;
    rtpCapabilities: RtpCapabilities;
  }) => void;
  consumeById: (data: {
    channelId: number;
    rtpCapabilities: RtpCapabilities;
    socketId: string;
  }) => void;
  resumeConsumer: (data: { consumerId: string; channelId: number }) => void;
  resumeProducer: (data: { channelId: number }) => void;
  changeProducerState: (data: {
    isMuted?: boolean;
    channelId?: number;
    paused?: boolean;
  }) => void;
  changeConsumerState: (data: {
    consumerId: string;
    channelId: number;
    paused: boolean;
  }) => void;
  toggleAllConsumers: (data: { muted: boolean; channelId?: number }) => void;
  endVoiceCall: (data: {
    declined?: boolean;
    timeouted?: boolean;
    channelId: number;
  }) => void;
  startVoiceCall: (data: { channelId: number }) => void;
};

export type events<Obj extends ClientSocketEvents> = keyof Obj;
