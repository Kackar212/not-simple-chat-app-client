import { ChannelWithoutMessages } from "@common/api/schemas/channel.schema";
import { Server } from "@common/api/schemas/server.schema";

export type SelectVoiceChannel = (data: {
  channelId: number;
  isCall?: string;
}) => void;
