"use client";

import {
  ApiError,
  createDirectMessageChannel,
  getDirectMessageChannels,
  mutations,
  QueryResponse,
} from "@common/api";
import { socket, SocketEvent } from "@common/socket";
import { Avatar } from "@components/avatar/avatar.component";
import { Button } from "@components/button/button.component";
import { FormField } from "@components/form-field/form-field.component";
import { FormHeader } from "@components/form-header/form-header.component";
import { Form } from "@components/form/form.component";
import { PlusIcon } from "@components/icons";
import { UserGroupIcon } from "@components/icons/user-group.icon";
import { Link } from "@components/link/link.component";
import { Modal } from "@components/modal/modal.component";
import { useModal } from "@components/modal/use-modal.hook";
import { Sidebar } from "@components/sidebar/sidebar.component";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { useRTC } from "@components/channels/use-rtc.hook";
import { DirectMessageChannel } from "@common/api/schemas/direct-message-channel.schema";
import { User } from "@common/api/schemas/user.schema";
import { Loader } from "@components/loader/loader.component";
import { useSidebar } from "@components/sidebar/use-sidebar.hook";
import { useEmojiStyle } from "@common/emojis/use-emoji-style.hook";
import { useSafeContext } from "@common/hooks";
import { authContext } from "@common/auth/auth.context";
import { AvatarSize } from "@common/constants";
import { usePathname } from "next/navigation";
import ChevronIcon from "/public/assets/icons/chevron.svg";
import UserIcon from "/public/assets/icons/user.svg";
import CallIcon from "/public/assets/icons/call.svg";
import CancelIcon from "/public/assets/icons/close.svg";
import { DirectMessage } from "./direct-message.component";
import { toast } from "react-toastify";
import { InviteFriendList } from "@components/invite-friend-list/invite-friend-list.component";
import { z } from "zod";
import { createConfig } from "@common/use-form.config";
import { getQueryClient } from "@/app/get-query-client";

const queryKey = ["get-direct-message-channels"];

const CreateDirectMessageChannelSchema = z
  .object({
    username: z.string(),
  })
  .required();

type CreateDirectMessageChannel = z.infer<
  typeof CreateDirectMessageChannelSchema
>;

export function DirectMessages() {
  const { ref: modal, open, close, isOpen } = useModal();
  const useFormResult = useForm<CreateDirectMessageChannel>(
    createConfig(CreateDirectMessageChannelSchema)
  );
  const queryClient = useQueryClient();
  const {
    auth: { pendingFriends },
  } = useSafeContext(authContext);

  const { data: channels, isLoading } = useQuery({
    queryKey: queryKey,
    queryFn: () => getDirectMessageChannels(),
    select(data) {
      return data.data;
    },
  });

  const {
    mutateAsync,
    isPending,
    data: result,
  } = useMutation({ mutationFn: mutations.createDirectMessageChannel });

  useEffect(() => {
    const onStatus = (user: User) => {
      queryClient.setQueryData(
        queryKey,
        (old: QueryResponse<DirectMessageChannel[], ApiError>) => {
          const channels = old.data || [];
          const updatedChannels = channels.map((channel) => {
            const {
              recipient: { id },
            } = channel;
            if (user.id !== id) {
              return channel;
            }

            return {
              ...channel,
              recipient: {
                ...channel.recipient,
                status: user.status,
              },
            };
          });

          return {
            ...old,
            data: updatedChannels,
          };
        }
      );
    };

    const onDirectMessageChannel = async (channel: DirectMessageChannel) => {
      const { id, isDeleted, recipient } = channel;

      await queryClient.invalidateQueries({
        queryKey: ["get-direct-message-channel", id],
      });

      queryClient.setQueryData(
        queryKey,
        (old: Awaited<ReturnType<typeof getDirectMessageChannels>>) => {
          if (!old) {
            return old;
          }

          if (!old.data) {
            return old;
          }

          if (isDeleted) {
            toast.success(`Chat with ${recipient.username} has been deleted!`);

            return {
              ...old,
              data: old.data.filter(({ id: channelId }) => channelId !== id),
            };
          }

          const item = old.data.find(({ id: channelId }) => channelId === id);

          if (!item) {
            if (!result) {
              toast.success(
                `Chat with ${recipient.username} has been created!`
              );
            }

            return {
              ...old,
              data: [...old.data, channel],
            };
          }

          return {
            ...old,
            data: old.data.map((oldChannel) => {
              if (oldChannel.id === id) {
                return { ...oldChannel, ...channel };
              }

              return oldChannel;
            }),
          };
        }
      );
    };

    socket.on(SocketEvent.DirectMessageChannel, onDirectMessageChannel);
    socket.on(SocketEvent.Status, onStatus);

    return () => {
      socket.off(SocketEvent.DirectMessageChannel, onDirectMessageChannel);
      socket.off(SocketEvent.Status, onStatus);
    };
  }, [queryClient, result]);

  const { shouldDisplaySidebar, toggleSidebar } = useSidebar();

  const { members } = useRTC();

  const { style, properties } = useEmojiStyle({
    row: 1,
    column: 7,
    size: 32,
  });

  const onSubmit = async ({ username }: CreateDirectMessageChannel) => {
    const {
      status: { isSuccess },
    } = await mutateAsync({ username });

    if (isSuccess) {
      useFormResult.reset();
    }
  };

  /**
   * TODO: Remodel this hook to the implementation below, instead of using createProperties
   * const { style, properties: [noMessagesEmoji, messagesExistEmoji] } = useEmojiStyle([{ row: 1, column: 7, size: 32 }, { row: 2, column: 10, size: 24 }]);
   *
   */

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
        <span className="sr-only">Open direct messages list</span>
      </button>
      {shouldDisplaySidebar && (
        <Sidebar className="z-[106]">
          <div className="shadow-header p-2">
            <Link
              href="/channels/me/friends"
              prefetch
              className="flex p-1.5 items-center gap-2 font-bold rounded-[4px] aria-[current=page]:text-white-0 aria-[current=page]:bg-gray-240/60 hover:bg-gray-260/30"
            >
              <span className="flex grow gap-2">
                <UserGroupIcon className="w-6 h-6" />
                Friends
              </span>
              {pendingFriends > 0 && (
                <span className="flex justify-center items-center font-medium bg-red-700 w-[18px] h-[18px] -mb-[1px] text-white-0 text-sm rounded-[50%]">
                  {pendingFriends}
                </span>
              )}
            </Link>
          </div>
          <div className="text-gray-360 flex justify-between px-2">
            <h2 className="uppercase font-bold my-4 text-lg">
              Direct messages
            </h2>
            <button onClick={open}>
              <span className="sr-only">Create direct message</span>
              <span aria-hidden className="*:scale-75">
                <PlusIcon />
              </span>
            </button>
            <Modal ref={modal} close={close} isOpen={isOpen} fullWidth>
              <FormProvider {...useFormResult}>
                <h2 className="p-3 pr-9 leading-6 text-sm font-light shadow-header relative z-10">
                  Create DM with a friend
                </h2>
                <InviteFriendList
                  isPending={isPending}
                  onClick={({ username }) => onSubmit({ username })}
                  enabled={isOpen}
                />
                <Form
                  onSubmit={useFormResult.handleSubmit(onSubmit)}
                  result={result?.status}
                  className="p-4 shadow-footer"
                >
                  <FormHeader Heading="h3">Or invite some stranger.</FormHeader>
                  <FormField
                    name="username"
                    label="Username"
                    Icon={<UserIcon />}
                  />
                  <Button type="submit" isLoading={isPending}>
                    Create DM
                  </Button>
                </Form>
              </FormProvider>
            </Modal>
          </div>
          {isLoading && (
            <div className="flex w-full justify-center">
              <Loader />
            </div>
          )}
          {channels?.length === 0 && !isLoading && (
            <div
              style={properties}
              className="flex flex-col justify-center items-center p-4 m-auto gap-2 font-medium"
            >
              <span style={style.mask} className="size-8 bg-gray-150"></span>
              You do not have any DMs yet.
            </div>
          )}
          <ul>
            {channels?.map(({ id, recipient, isRequestAccepted }) => {
              return (
                <DirectMessage
                  id={id}
                  isRequestAccepted={isRequestAccepted}
                  recipient={recipient}
                  key={id}
                />
              );
            })}
          </ul>
        </Sidebar>
      )}
    </>
  );
}
