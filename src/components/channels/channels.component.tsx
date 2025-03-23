"use client";

import { ApiError, createChannel, QueryResponse } from "@common/api";
import { ChannelWithoutMessages } from "@common/api/schemas/channel.schema";
import { Server } from "@common/api/schemas/server.schema";
import { ChannelType } from "@common/enums/channel-type.enum";
import { socket, SocketEvent } from "@common/socket";
import { createConfig } from "@common/use-form.config";
import { Button } from "@components/button/button.component";
import { FormField } from "@components/form-field/form-field.component";
import { FormRadioField } from "@components/form-field/form-radio-field.component";
import { FormHeader } from "@components/form-header/form-header.component";
import { Form } from "@components/form/form.component";
import { Modal } from "@components/modal/modal.component";
import { useModal } from "@components/modal/use-modal.hook";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { useRTC } from "./use-rtc.hook";
import { useSafeContext } from "@common/hooks";
import { authContext } from "@common/auth/auth.context";
import { ChannelListItem } from "./channel-list-item.component";
import { Sidebar } from "@components/sidebar/sidebar.component";
import { twMerge } from "tailwind-merge";
import { useSidebar } from "@components/sidebar/use-sidebar.hook";
import { Menu } from "@components/menu/menu.component";
import { CreateEmojiForm } from "./create-emoji-form.component";
import { formatCount, plural } from "@common/utils";
import PlusIcon from "/public/assets/icons/plus.svg";
import HashTagIcon from "/public/assets/icons/hash.svg";
import SpeakerIcon from "/public/assets/icons/speaker.svg";
import ChevronIcon from "/public/assets/icons/chevron.svg";
import EmojiIcon from "/public/assets/icons/emoji.svg";

interface ChannelsListProps {
  channels?: ChannelWithoutMessages[];
  server?: Server;
}

const CreateChannelSchema = z
  .object({
    channelName: z.string().min(3).max(46),
    channelType: z.nativeEnum(ChannelType),
  })
  .required();

const CreateEmojiSchema = z
  .object({
    scope: z.union([z.literal("Public"), z.literal("Private")]),
    name: z
      .string()
      .regex(
        /^[A-Za-z]\w*$/i,
        "must start with letter and must contains only numbers, letters and underscores"
      )
      .min(3, "must be at least 3 characters long")
      .max(28, "must be at most 28 characters long"),
    emoji: z
      .instanceof(File, { message: "You need to upload file!" })
      .refine(
        (file) => file.size / 1024 < 256,
        "File size must be less or equal to 256kb"
      ),
  })
  .required();

type CreateChannelSchemaType = z.infer<typeof CreateChannelSchema>;
type CreateEmojiSchema = z.infer<typeof CreateEmojiSchema>;
export function Channels({ channels = [], server }: ChannelsListProps) {
  const useFormResult = useForm<CreateChannelSchemaType>(
    createConfig(CreateChannelSchema, {
      defaultValues: { channelType: ChannelType.Text },
    })
  );

  const {
    auth: { user },
  } = useSafeContext(authContext);

  const isCurrentUserOwner = server?.ownerId === user.id;

  const queryClient = useQueryClient();

  const {
    mutateAsync,
    isPending,
    reset: resetMutation,
    data,
  } = useMutation({ mutationFn: createChannel });

  const {
    ref: modal,
    close,
    open,
    isOpen,
  } = useModal(() => {
    resetMutation();
  });

  useEffect(() => {
    if (server?.id) {
      socket.emit(SocketEvent.JoinServer, { serverId: server.id });
    }
  }, [server?.id]);

  const channelType = useFormResult.watch("channelType");

  const textChannels = channels.filter(({ type }) => type === ChannelType.Text);
  const voiceChannels = channels.filter(
    ({ type }) => type === ChannelType.Voice
  );

  const { members } = useRTC();

  const { shouldDisplaySidebar, toggleSidebar } = useSidebar();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onSubmit = useCallback(
    useFormResult.handleSubmit(async (data) => {
      if (isPending || !server?.id) {
        return;
      }

      const { data: newChannel } = await mutateAsync({
        name: data.channelName,
        serverId: server.id,
        type: data.channelType,
      });

      if (!newChannel) {
        return;
      }

      queryClient.setQueryData(
        ["get-server", server.id],
        (old: QueryResponse<Server, ApiError>) => {
          const { data } = old;

          if (!data) {
            return old;
          }

          return {
            ...old,
            data: {
              ...old.data,
              channels: [...data.channels, newChannel],
            },
          };
        }
      );

      useFormResult.reset();
    }),
    [mutateAsync, isPending, queryClient, useFormResult.reset, server?.id]
  );

  const {
    ref: createEmojiModalRef,
    isOpen: isCreateEmojiModalOpen,
    close: closeCreateEmojiModal,
    open: openCreateEmojiModal,
  } = useModal();

  const items = useMemo(
    () => [
      {
        label: (
          <span className="flex justify-between w-full items-center">
            Create emoji
            <EmojiIcon className="size-5" />
          </span>
        ),
        action() {
          openCreateEmojiModal();
        },
      },
      {
        label: isCurrentUserOwner ? "Delete server" : "Leave server",
      },
    ],
    [isCurrentUserOwner, openCreateEmojiModal]
  );

  const createEmojiUseFormResult = useForm<CreateEmojiSchema>(
    createConfig(CreateEmojiSchema, {
      mode: "onChange",
      defaultValues: {
        scope: "Public",
        name: "",
      },
    })
  );

  return (
    <>
      <button
        className="fixed bottom-4 left-2 md:left-4 z-[101] size-6 md:size-12 text-green-500 flex items-center justify-center bg-black-600 rounded-[50%] hover:rounded-[25%] hover:bg-green-500 hover:text-white-500 transition-[color,background,border-radius] duration-300"
        aria-expanded={shouldDisplaySidebar}
        onClick={toggleSidebar}
      >
        <ChevronIcon
          className={twMerge(
            "size-3 md:size-6 -rotate-90",
            shouldDisplaySidebar && "rotate-90"
          )}
        />
        <span className="sr-only">Channels</span>
      </button>
      {shouldDisplaySidebar && (
        <Sidebar server={server} className="z-[106]">
          <div className="relative">
            {server && (
              <Menu
                items={items}
                placement="bottom"
                absolute
                fullWidth
                openButton={{
                  className:
                    "flex justify-between items-center text-white-500 font-semibold text-left shadow-header rounded-none w-full h-[52px] px-3",
                  label: server.name,
                  isSrOnly: false,
                  Icon: <ChevronIcon className="size-5" />,
                }}
              />
            )}
          </div>
          <header className="flex justify-between items-center text-gray-360 px-4 pt-4">
            <h2 className="uppercase text-xs font-semibold my-4">
              <span aria-hidden>Channels - {channels.length} / 50</span>
              <span className="sr-only">
                {formatCount(channels.length, plural.channel)}
              </span>
            </h2>
            <button
              onClick={open}
              className="hover:bg-green-600 hover:text-white-0 p-1 rounded-[50%] transition-[background-color,color] duration-300"
            >
              <span className="sr-only">Create channel</span>
              <span aria-hidden>
                <PlusIcon className="size-5" />
              </span>
            </button>
            <Modal ref={modal} close={close} isOpen={isOpen}>
              <FormProvider {...useFormResult}>
                <Form
                  result={data?.status}
                  onSubmit={onSubmit}
                  className="flex flex-col gap-2"
                >
                  <FormHeader Heading="h2">Create new channel</FormHeader>
                  <fieldset className="w-full">
                    <legend className="uppercase text-xs font-bold text-gray-360 mb-1">
                      Channel Type
                    </legend>
                    <FormRadioField
                      value="Text"
                      name="channelType"
                      id="channel-type-text"
                      label="Text"
                      Icon={<HashTagIcon />}
                      description="You can chat with others"
                    />
                    <FormRadioField
                      value="Voice"
                      name="channelType"
                      id="channel-type-voice"
                      label="Voice"
                      Icon={<SpeakerIcon />}
                      description="You can talk with others"
                    />
                  </fieldset>
                  <FormField
                    name="channelName"
                    label="Channel name"
                    Icon={
                      channelType === ChannelType.Voice ? (
                        <SpeakerIcon width={16} height={16} />
                      ) : (
                        <HashTagIcon width={16} height={16} />
                      )
                    }
                  />
                  <Button type="submit">Create</Button>
                </Form>
              </FormProvider>
            </Modal>
          </header>
          <div className="max-h-screen overflow-auto scrollbar">
            <h3 className="m-4 mt-0 mb-2 text-gray-360 uppercase font-medium text-xs flex gap-1 items-center">
              Text channels
            </h3>
            <ul className="px-3 flex flex-col gap-1r">
              {server &&
                textChannels.map((channel) => (
                  <ChannelListItem
                    key={channel.name.join("")}
                    channel={channel}
                    server={server}
                    members={members[channel.id]}
                  />
                ))}
            </ul>
            {voiceChannels.length > 0 && (
              <h3 className="m-4 text-gray-360 uppercase font-medium text-xs flex gap-1 items-center">
                Voice channels
              </h3>
            )}
            <ul className="px-3 flex flex-col gap-1">
              {server &&
                voiceChannels.map((channel) => (
                  <ChannelListItem
                    key={channel.name.join("")}
                    channel={channel}
                    server={server}
                    members={members[channel.id]}
                  />
                ))}
            </ul>
          </div>
        </Sidebar>
      )}
      <Modal
        ref={createEmojiModalRef}
        isOpen={isCreateEmojiModalOpen}
        close={closeCreateEmojiModal}
        className="[&>div>div]:pb-4"
      >
        <FormProvider {...createEmojiUseFormResult}>
          <CreateEmojiForm serverName={server?.name} serverId={server?.id} />
        </FormProvider>
      </Modal>
    </>
  );
}
