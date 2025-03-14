import PingConnection from "/public/assets/icons/ping-connection.svg";
import GoodPingConnection from "/public/assets/icons/good-ping-connection.svg";
import AveragePingConnection from "/public/assets/icons/average-ping-connection.svg";
import BadPingConnection from "/public/assets/icons/bad-ping-connection.svg";
import { useSafeContext } from "@common/hooks";
import { ConnectionStatus, rtcContext } from "@common/rtc";

const tooltipVariant: Record<
  ConnectionStatus,
  "success" | "warning" | "error"
> = {
  [ConnectionStatus.Good]: "success",
  [ConnectionStatus.Average]: "warning",
  [ConnectionStatus.Bad]: "error",
  [ConnectionStatus.Disconnected]: "success",
};

export function Ping() {
  const { getConnectionStatus, latency, isUserConnected } =
    useSafeContext(rtcContext);

  const connectionStatus = getConnectionStatus();

  const props = {
    "aria-hidden": true,
    "data-tooltip-id": "tooltip",
    "data-tooltip-content": latency ? `${latency}ms` : "0ms",
    "data-tooltip-class-name": `${tooltipVariant[connectionStatus]}-tooltip`,
  };

  if (isUserConnected && connectionStatus === ConnectionStatus.Good) {
    return <GoodPingConnection {...props} />;
  }

  if (isUserConnected && connectionStatus === ConnectionStatus.Average) {
    return <AveragePingConnection {...props} />;
  }

  if (isUserConnected && connectionStatus === ConnectionStatus.Bad) {
    return <BadPingConnection {...props} />;
  }

  return <PingConnection {...props} />;
}
