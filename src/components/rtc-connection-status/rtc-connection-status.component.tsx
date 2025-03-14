import { useSafeContext } from "@common/hooks";
import { Ping } from "./ping.component";
import { rtcContext } from "@common/rtc/rtc.context";
import { twMerge } from "tailwind-merge";

export function RtcConnectionStatus() {
  const {
    latency = 0,
    isConnecting,
    isUserConnected,
  } = useSafeContext(rtcContext);

  return (
    <>
      <Ping />
      <span className="sr-only">Ping: {latency}ms</span>
      <span
        className={twMerge(
          "text-sm text-green-500 font-medium leading-[1rem]",
          isConnecting && "text-gray-150"
        )}
      >
        {isUserConnected && "Voice connected"}
        {isConnecting && "Connecting..."}
      </span>
    </>
  );
}
