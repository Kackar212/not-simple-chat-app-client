"use client";

import { rtcContext } from "@common/rtc";
import { useSafeContext } from "@common/hooks";
import MicrophoneMutedIcon from "/public/assets/icons/microphone-muted.svg";
import MicrophoneIcon from "/public/assets/icons/microphone.svg";
import HeadsetIcon from "/public/assets/icons/headset.svg";
import HeadsetMutedIcon from "/public/assets/icons/headset-muted.svg";
import SettingsIcon from "/public/assets/icons/settings.svg";
import { Server } from "@common/api/schemas/server.schema";

import { ProfilePreviewPopover } from "./profile-preview-popover.component";
import { ToggleAudioDeviceButton } from "@components/toggle-audio-device-button/toggle-audio-device-button.component";
import { Link } from "@components/link/link.component";
import { createPortal } from "react-dom";
import { Settings } from "@components/settings/settings.component";
import { useEffect, useState } from "react";
import { layoutContext } from "@common/context/layout.context";
import { authContext } from "@common/auth/auth.context";
import { useQueryClient } from "@tanstack/react-query";
import { socket, SocketEvent } from "@common/socket";
import { Channel } from "@common/api/schemas/channel.schema";
import { DirectMessageChannel } from "@common/api/schemas/direct-message-channel.schema";
import { getQueryClient } from "@/app/get-query-client";

interface ProfilePreviewProps {
  server?: Server;
}

export function ProfileBar({ server }: ProfilePreviewProps) {
  const {
    auth: { user },
  } = useSafeContext(authContext);
  const queryClient = useQueryClient();

  useEffect(() => {
    const onStatus = () => {
      queryClient.invalidateQueries({
        queryKey: ["profile", user.id, server?.id],
      });
    };

    socket.on(SocketEvent.Status, onStatus);

    return () => {
      socket.off(SocketEvent.Status, onStatus);
    };
  }, [user.id, server?.id, queryClient]);

  const { dispatch } = useSafeContext(layoutContext);

  const {
    toggleMicrophone,
    isMicrophoneMuted,
    isOutputDeviceMuted,
    toggleOutputDevice,
  } = useSafeContext(rtcContext);

  return (
    <div className="flex items-center justify-between py-2 gap-1.5">
      <ProfilePreviewPopover server={server} />
      <div
        className="fill-white-0 grid grid-cols-[repeat(3,var(--item-size))] grid-rows-[var(--item-size)] content-center justify-items-center text-gray-150"
        style={{ "--item-size": "2rem" } as React.CSSProperties}
      >
        <ToggleAudioDeviceButton
          isMuted={isMicrophoneMuted}
          MutedIcon={MicrophoneMutedIcon}
          UnmutedIcon={MicrophoneIcon}
          onClick={() => toggleMicrophone()}
        >
          {isMicrophoneMuted ? "Unmute microphone" : "Mute microphone"}
        </ToggleAudioDeviceButton>
        <ToggleAudioDeviceButton
          isMuted={isOutputDeviceMuted}
          MutedIcon={HeadsetMutedIcon}
          UnmutedIcon={HeadsetIcon}
          onClick={toggleOutputDevice}
        >
          {isOutputDeviceMuted ? "Undeafen" : "Deafen"}
        </ToggleAudioDeviceButton>
        <button
          onClick={() => {
            dispatch({ type: "TOGGLE_CHANNELS" });
          }}
          data-tooltip-id="tooltip"
          data-tooltip-content="Settings"
          className="size-[var(--item-size)] hover:bg-gray-260/30 grid content-center justify-center rounded-lg"
        >
          <span className="sr-only">Open user settings</span>
          <SettingsIcon aria-hidden className="size-5" />
        </button>
      </div>
    </div>
  );
}
