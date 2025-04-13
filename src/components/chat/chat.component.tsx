"use client";

import { SendMessageForm } from "@components/send-message-form/send-message-form.component";
import React, { useEffect } from "react";
import { useChat } from "@components/chat/use-chat.hook";
import { FormProvider, useForm } from "react-hook-form";
import { createConfig } from "@common/use-form.config";
import { z } from "zod";
import { ChannelType } from "@common/enums/channel-type.enum";
import { Recipient as RecipientEntity } from "@common/api/schemas/user.schema";
import { Button } from "@components/button/button.component";
import { useBlacklist } from "@common/api/hooks/use-blacklist.hook";
import { useModal } from "@components/modal/use-modal.hook";
import { Server } from "@common/api/schemas/server.schema";
import { useSafeContext } from "@common/hooks";
import { rtcContext } from "@common/rtc";
import { Modal } from "@components/modal/modal.component";
import { Call } from "./call.component";
import { Header } from "./header.component";
import { ChatProvider } from "./chat.context";
import { SidePanel } from "./side-panel.component";
import { ScrollContainer } from "./scroll-container.component";
import { getMessages } from "@common/api";

interface ChatProps {
  channelId: number;
  channelName: string;
  isBlocked?: boolean;
  isRequestAccepted: boolean;
  channelType: ChannelType;
  recipient?: RecipientEntity;
  server?: Server;
  refetch?: () => void;
  queryKey?: unknown[];
  messages: ReturnType<typeof getMessages>;
}

export const Chat = function Chat({
  channelId,
  channelName,
  isBlocked,
  isRequestAccepted,
  channelType,
  recipient,
  server,
  queryKey = [],
  messages: initialMessages,
}: ChatProps) {
  const {
    mutate,
    isPending,
    data: { status },
  } = useBlacklist({ queryKey, isBlocked });

  const { setSession, isMicrophoneGranted, isInteractionRequired } =
    useSafeContext(rtcContext);

  const microphoneNotGrantedModal = useModal(() => {
    setSession((rtcSession) => ({
      ...rtcSession,
      isMicrophoneGranted: undefined,
    }));
  });

  const interactionRequiredModal = useModal(() => {
    setSession((rtcSession) => ({
      ...rtcSession,
      isInteractionRequired: false,
    }));
  });

  useEffect(() => {
    if (isMicrophoneGranted === false) {
      microphoneNotGrantedModal.open();
    }

    if (isInteractionRequired) {
      interactionRequiredModal.open();
    }
  }, [
    isMicrophoneGranted,
    microphoneNotGrantedModal,
    isInteractionRequired,
    interactionRequiredModal,
  ]);

  const chatContextProps = useChat({
    channelId,
    channelName,
    recipient,
    isRequestAccepted,
    initialMessages,
  });
  const { messages } = chatContextProps;

  return (
    <ChatProvider {...chatContextProps}>
      <section className="flex flex-col grow lg:w-[calc(100%-35rem)] w-full relative bg-black-600">
        <Header channelType={channelType} />
        {recipient && <Call recipient={recipient} channelId={channelId} />}
        <div className="flex size-full relative @container">
          <div className="flex flex-col grow w-full">
            <div className="flex grow relative shrink basis-auto min-w-0 min-h-0 text-white-500 z-[105]">
              <ScrollContainer isBlocked={isBlocked} queryKey={queryKey} />
            </div>
            <div className="flex w-full items-center px-2 pr-3 md:px-4 pb-0.5">
              {isBlocked && recipient && (
                <div className="w-full p-3 px-4 text-white-0 bg-black-700 rounded-md font-medium flex justify-between items-center">
                  You can&apos;t send direct messages to the user you have
                  blocked.
                  <Button
                    className="capitalize bg-black-500 text-white-700 rounded-md p-4 py-1.5 text-sm font-normal hover:bg-black-430 hover:text-white-0 transition-colors duration-150"
                    isLoading={isPending}
                    mutationResult={status}
                    onClick={() => mutate(recipient.username)}
                  >
                    Unblock <span className="sr-only">{channelName}</span>
                  </Button>
                </div>
              )}
              {isRequestAccepted === false && (
                <div className="w-full p-3 px-4 text-white-0 bg-black-700 rounded-md font-medium flex justify-between items-center">
                  {messages.length !== 0 ? (
                    <span>
                      You must accept {channelName} request before you can send
                      any message
                    </span>
                  ) : (
                    <span>
                      {channelName} must accept your request before you can send
                      them any message!
                    </span>
                  )}
                </div>
              )}
              {!isBlocked && isRequestAccepted !== false && (
                <SendMessageForm
                  channelId={+channelId}
                  channelName={channelName}
                />
              )}
            </div>
          </div>
          <SidePanel
            server={server}
            recipient={recipient}
            queryKey={queryKey}
          />
        </div>
        <Modal {...interactionRequiredModal}>
          <section className="max-w-80">
            <h2 className="text-center uppercase font-medium mb-2">
              Interaction required!
            </h2>
            <p className="text-center">
              Browsers require user interaction before they will play audio.
              Just click anywhere.
            </p>
          </section>
        </Modal>
        <Modal {...microphoneNotGrantedModal}>
          <section className="max-w-80">
            <h2 className="text-center uppercase font-medium mb-2">
              Microphone Access is Denied!
            </h2>
            <p className="text-center">
              Go to your settings and enable access to microphone for this site.
            </p>
          </section>
        </Modal>
      </section>
    </ChatProvider>
  );
};
