import { useSafeContext } from "@common/hooks";
import { rtcContext } from "@common/rtc";
import { Link } from "@components/link/link.component";
import { RtcConnectionStatus } from "@components/rtc-connection-status/rtc-connection-status.component";
import DisconnectIcon from "/public/assets/icons/disconnect.svg";

export function RtcConnectionBar() {
  const {
    isConnecting,
    isUserConnected,
    server,
    selectedChannel,
    leaveVoiceChannel,
  } = useSafeContext(rtcContext);

  if (!isConnecting && !isUserConnected) {
    return null;
  }

  if (!server || !selectedChannel) {
    return null;
  }

  const callServer =
    server && !server.isGlobalServer ? ` / ${server.name}` : "";
  const callChannelName = selectedChannel?.name.join(", ");

  return (
    <div className="py-3 border-b-[thin] border-b-black-630/75">
      <div className="flex items-center justify-between">
        <div className="flex items-start text-gray-150">
          <div className="flex flex-col font-semibold">
            <div className="grid grid-rows-[1rem] grid-cols-[1rem_1fr] items-center justify-items-center gap-1">
              <RtcConnectionStatus />
            </div>
            <Link
              href={`/channels/${server?.id || "me"}/${selectedChannel.id}`}
              className="hover:underline leading-none"
            >
              <span className="text-xs font-normal text-gray-150">
                {callChannelName}
                {callServer}
              </span>
            </Link>
          </div>
        </div>
        <button
          data-tooltip-id="tooltip"
          data-tooltip-content="Disconnect"
          onClick={leaveVoiceChannel}
          className="hover:bg-gray-240/60 size-[var(--item-size)] grid content-center justify-center rounded-lg text-red-600"
          style={{ "--item-size": "2rem" } as React.CSSProperties}
        >
          <span className="sr-only">Disconnect</span>
          <DisconnectIcon />
        </button>
      </div>
    </div>
  );
}
