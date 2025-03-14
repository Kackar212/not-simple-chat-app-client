"use client";

import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from "react";
import { AuthProvider } from "@common/auth/auth.context";
import { socket, SocketEvent } from "@common/socket";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RtcProvider } from "@common/rtc";
import { ToastContainer } from "react-toastify";
import { Sound } from "@common/rtc/helpers";
import { useRouter } from "next/navigation";
import { Route } from "@common/route.enum";
import { LayoutProvider } from "@common/context/layout.context";
import { Tooltip } from "react-tooltip";
import { ErrorBoundary } from "./error.boundary";
import { AvatarSize } from "@common/constants";
import { AvatarStatusMask } from "@components/avatar-status-mask/avatar-status-mask.component";
import CallIcon from "/public/assets/icons/call.svg";

socket.once(SocketEvent.Connect, () => {
  sessionStorage.setItem(
    "previousSocketId",
    sessionStorage.getItem("socketId") || socket.id || ""
  );

  sessionStorage.setItem("socketId", socket.id || "");
});

export default function Providers({ children }: PropsWithChildren) {
  const { replace } = useRouter();
  const [queryClient] = useState(() => {
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
        },
      },
    });
  });

  const onUnauthorized = useCallback(
    (data: any) => {
      if (data?.data && data.data.error && data.data.error.statusCode === 401) {
        replace(Route.Logout);
      }

      return data;
    },
    [replace]
  );

  useEffect(() => {
    queryClient.setDefaultOptions({
      queries: {
        select: onUnauthorized,
      },

      mutations: {
        onSettled: onUnauthorized,
      },
    });
  }, [onUnauthorized, queryClient]);

  return (
    <>
      <CallIcon className="absolute -left-full" />
      <svg className="absolute -left-1">
        {Object.values(AvatarSize).map((size, index) => (
          <AvatarStatusMask size={size} key={index} />
        ))}
        <mask
          id="svg-mask-avatar-status-round-80"
          maskContentUnits="objectBoundingBox"
          viewBox="0 0 1 1"
        >
          <circle fill="white" cx="0.5" cy="0.5" r="0.5"></circle>
          <circle fill="black" cx="0.85" cy="0.85" r="0.175"></circle>
          {/* <circle fill="black" cx="56" cy="112" r="46"></circle> */}
        </mask>
        <mask
          id="svg-mask-avatar-status-round-32"
          maskContentUnits="objectBoundingBox"
          viewBox="0 0 1 1"
        >
          <circle fill="white" cx="0.5" cy="0.5" r="0.5"></circle>
          <circle fill="black" cx="0.84375" cy="0.84375" r="0.25"></circle>
        </mask>
      </svg>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RtcProvider pushToTalkKey="v">
              <LayoutProvider>{children}</LayoutProvider>
            </RtcProvider>
          </AuthProvider>
          {/* <ReactQueryDevtools /> */}
        </QueryClientProvider>
      </ErrorBoundary>
      <audio controls={false} src={`/${Sound.Join}.mp3`} id={Sound.Join} />
      <audio controls={false} src={`/${Sound.Leave}.mp3`} id={Sound.Leave} />
      <audio controls={false} src={`/${Sound.Mute}.mp3`} id={Sound.Mute} />
      <audio controls={false} src={`/${Sound.Unmute}.mp3`} id={Sound.Unmute} />
      <div role="status">
        <ToastContainer
          role="generic"
          theme="dark"
          stacked
          limit={5}
          hideProgressBar
          closeButton={false}
          autoClose={10000}
          className="z-[103]"
        />
      </div>
      <Tooltip
        id="tooltip"
        className="tooltip-bg tooltip-rounded tooltip-color font-[600] shadow-xl text-sm z-[1000]"
        offset={12}
        opacity={1}
      />
    </>
  );
}
