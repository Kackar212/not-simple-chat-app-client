"use client";

import { getFriends } from "@common/api";
import { InputName } from "@common/enums";
import { createConfig } from "@common/use-form.config";
import { usernameSchema } from "@common/zod";
import { Button } from "@components/button/button.component";
import { FormField } from "@components/form-field/form-field.component";
import { Form } from "@components/form/form.component";
import { UserGroupIcon } from "@components/icons/user-group.icon";
import { Link } from "@components/link/link.component";
import { Modal } from "@components/modal/modal.component";
import { useModal } from "@components/modal/use-modal.hook";
import { PropsWithChildren, use } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import { FormHeader } from "@components/form-header/form-header.component";
import { useFriends } from "@common/api/hooks/use-friends.hook";
import { FriendStatus } from "@common/enums/friend-status.enum";
import UserIcon from "/public/assets/icons/user.svg";
import { useSafeContext } from "@common/hooks";
import { authContext } from "@common/auth/auth.context";

const InviteFriendSchema = z.object({ username: usernameSchema });
type InviteFriend = z.infer<typeof InviteFriendSchema>;

interface FriendsLayoutProps {
  params: Promise<{ status: FriendStatus }>;
}

export default function FriendsLayout({
  children,
  params,
}: PropsWithChildren<FriendsLayoutProps>) {
  const linkClassName =
    "text-sm leading-none font-[400] text-gray-360 w-full flex items-center gap-2 px-2 aria-[current=page]:bg-gray-240/60 aria-[current=page]:font-[500] aria-[current=page]:text-white-500 hover:bg-gray-260/30 py-[4px] rounded-[0.25rem]";
  const { status: friendStatus } = use(params);

  const {
    auth: { pendingFriends },
  } = useSafeContext(authContext);

  const useFormResult = useForm<InviteFriend>(createConfig(InviteFriendSchema));

  const {
    modifyFriends,
    isPending,
    data: { status },
  } = useFriends({
    hasFriendRequest: false,
    isFriend: false,
    isBlocked: false,
    queryKey: ["get-friends", friendStatus],
    updater(oldFriends: Awaited<ReturnType<typeof getFriends>>, updatedFriend) {
      if (!oldFriends?.data) {
        return oldFriends;
      }

      const { username } = updatedFriend;

      const friends = [...oldFriends.data];

      const oldFriendIndex = oldFriends.data.findIndex(
        ({ user }) => user.username === username
      );

      if (oldFriendIndex === -1) {
        friends.push(updatedFriend);
      }

      if (oldFriendIndex !== -1) {
        friends[oldFriendIndex] = updatedFriend;
      }

      if (updatedFriend.isDeleted) {
        friends.splice(oldFriendIndex, 1);
      }

      return {
        ...oldFriends,
        data: friends,
      };
    },
    onSuccess() {
      useFormResult.reset();
    },
  });

  const {
    ref: modal,
    open,
    close,
    isOpen,
  } = useModal(() => {
    useFormResult.reset();
  });

  const submit = useFormResult.handleSubmit(async (data) => {
    modifyFriends(data.username);
  });

  return (
    <div className="flex flex-col flex-grow relative">
      <section className="flex gap-4 p-2.5 shadow-header h-fit w-full text-md text-white-0 font-[600]">
        <header className="inline-flex py-1 pr-4 border-r border-gray-260">
          <h1 className="flex items-center gap-2">
            <UserGroupIcon className="w-6 h-6" /> Friends
          </h1>
        </header>
        <ul className="flex gap-4 items-center">
          <li>
            <Link href="/channels/me/friends" className={linkClassName}>
              All
            </Link>
          </li>
          <li>
            <Link href="/channels/me/friends/online" className={linkClassName}>
              Online
            </Link>
          </li>
          <li>
            <Link href="/channels/me/friends/pending" className={linkClassName}>
              Pending
              {pendingFriends > 0 && (
                <span className="flex justify-center items-center font-medium bg-red-700 text-white-0 text-sm w-[18px] h-[18px] -mb-[1px] rounded-[50%]">
                  {pendingFriends}
                </span>
              )}
            </Link>
          </li>
          <li>
            <Link href="/channels/me/friends/blocked" className={linkClassName}>
              Blocked
            </Link>
          </li>
        </ul>
        <button
          className={twMerge(
            linkClassName,
            "bg-green-700 text-white-0 hover:bg-green-800/100 inline-flex w-auto self-center transition-[background-color]"
          )}
          onClick={open}
        >
          Add friend
        </button>
        <Modal close={close} ref={modal} isOpen={isOpen}>
          <FormProvider {...useFormResult}>
            <Form result={status} onSubmit={submit}>
              <FormHeader Heading="h2">Invite friend</FormHeader>
              <FormField
                name={InputName.Username}
                label="Username"
                Icon={<UserIcon />}
              />
              <Button type="submit" isLoading={isPending}>
                Invite
              </Button>
            </Form>
          </FormProvider>
        </Modal>
      </section>
      {children}
    </div>
  );
}
