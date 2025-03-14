import { authContext } from "@common/auth/auth.context";
import { ChannelType } from "@common/enums/channel-type.enum";
import { useSafeContext } from "@common/hooks";
import { rtcContext } from "@common/rtc";
import { HashTagIcon } from "@components/icons";
import { SpeakerIcon } from "@components/icons/speaker.icon";
import { ChannelWithoutMessages } from "@common/api/schemas/channel.schema";
import { Server } from "@common/api/schemas/server.schema";
import { User } from "@common/api/schemas/user.schema";
import { MouseEventHandler, useCallback } from "react";
import { VoiceChannelParticipant } from "./voice-channel-participant.component";
import { Link } from "@components/link/link.component";

interface ChannelListItemProps {
  channel: ChannelWithoutMessages;
  server: Server;
  members?: User[];
}

export function ChannelListItem({
  channel,
  server,
  members = [],
}: ChannelListItemProps) {
  const { selectVoiceChannel, isUserConnected, selectedChannelId } =
    useSafeContext(rtcContext);

  const {
    auth: { user: currentUser },
  } = useSafeContext(authContext);

  const isCurrentChannelSelected = selectedChannelId === channel.id;

  const join: MouseEventHandler = useCallback(
    async (e) => {
      if (channel.type !== ChannelType.Voice) {
        return;
      }

      if (isUserConnected && isCurrentChannelSelected) {
        return;
      }

      e.preventDefault();

      selectVoiceChannel({
        channelId: channel.id,
      });
    },
    [
      channel.id,
      channel.type,
      isCurrentChannelSelected,
      isUserConnected,
      selectVoiceChannel,
    ]
  );

  return (
    <li className="flex flex-col justify-center text-white-500">
      <Link
        className="font-[400] text-gray-360 w-full flex items-center gap-2 px-2 aria-[current=page]:bg-gray-240/60 aria-[current=page]:font-[500] aria-[current=page]:text-white-500 hover:bg-gray-260/30 hover:text-gray-150 py-1 rounded-sm"
        href={`/channels/${server.id}/${channel.id}`}
        onClick={join}
      >
        {channel.type === ChannelType.Voice ? (
          <SpeakerIcon width={24} height={24} />
        ) : (
          <HashTagIcon />
        )}{" "}
        {channel.name}
      </Link>
      <div className="flex flex-col pl-4 mt-2 gap-2">
        {members.map((participant) => (
          <VoiceChannelParticipant
            key={participant.username}
            participant={participant}
          />
        ))}
      </div>
    </li>
  );
}
