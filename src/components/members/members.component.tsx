"use client";

import { inviteUser, mutations, queries, QueryResponse } from "@common/api";
import { Member as MemberEntity } from "@common/api/schemas/member.schema";
import { Server } from "@common/api/schemas/server.schema";
import { authContext } from "@common/auth/auth.context";
import { AvatarSize, InputType, QueryKey } from "@common/constants";
import { InputName } from "@common/enums";
import { useSafeContext } from "@common/hooks";
import { socket, SocketEvent } from "@common/socket";
import { Button } from "@components/button/button.component";
import { FormField } from "@components/form-field/form-field.component";
import { FormHeader } from "@components/form-header/form-header.component";
import { Form } from "@components/form/form.component";
import { PlusIcon } from "@components/icons";
import { Member } from "@components/member/member.component";
import { Modal } from "@components/modal/modal.component";
import { useModal } from "@components/modal/use-modal.hook";
import { Sidebar } from "@components/sidebar/sidebar.component";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import UserIcon from "/public/assets/icons/user.svg";
import { useQuery } from "@common/api/hooks/use-query.hook";
import { FriendStatus } from "@common/enums/friend-status.enum";
import { Avatar } from "@components/avatar/avatar.component";
import { Loader } from "@components/loader/loader.component";
import { z } from "zod";
import { createConfig } from "@common/use-form.config";
import { formatCount, plural } from "@common/utils";
import { getQueryClient } from "@/app/get-query-client";

interface MembersProps {
  users: Array<MemberEntity>;
  server: Server;
}

const InviteUserSchema = z
  .object({
    username: z.string(),
  })
  .required();

type InviteUser = z.infer<typeof InviteUserSchema>;

export function Members({ users, server }: MembersProps) {
  const { id: serverId } = server;
  const { ref: modal, isOpen, open, close } = useModal();
  const { mutateAsync: invite, ...inviteResult } = useMutation({
    mutationFn: mutations.inviteUser,
    onSuccess({ status: { isSuccess } }) {
      if (!isSuccess) {
        return;
      }

      inviteForm.reset();
      setTimeout(() => {
        inviteResult.reset();
      });
    },
  });
  const queryClient = useQueryClient();

  const inviteForm = useForm<InviteUser>(createConfig(InviteUserSchema));
  const {
    auth: { user: currentUser },
  } = useSafeContext(authContext);

  const inviteUser = async ({ username }: { username: string }) => {
    await invite({ username, serverId });
  };

  const onSubmit = inviteForm.handleSubmit(inviteUser);

  const {
    data: { data: friends = [] },
    isLoading,
  } = useQuery({
    queryKey: QueryKey.Friends,
    queryFn: () => queries.getFriends({}),
    enabled: isOpen,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const queryKey = ["get-server", serverId];
    socket.on(SocketEvent.Status, (user) => {
      queryClient.setQueryData(queryKey, (old: QueryResponse<Server, any>) => {
        const newMembers = old.data?.members.map((member) => {
          if (member.userId === user.id) {
            return {
              ...member,
              user: {
                ...member.user,
                ...user,
              },
            };
          }

          return member;
        });

        return {
          ...old,
          data: {
            ...old.data,
            members: newMembers,
          },
        };
      });

      queryClient.invalidateQueries({ queryKey });
    });

    // TODO: Instead of refetching whole server update members.
    socket.on(SocketEvent.Member, (newMember) => {
      queryClient.invalidateQueries({
        queryKey,
      });
    });

    return () => {
      socket.off(SocketEvent.Member);
      socket.off(SocketEvent.Status);
    };
  });

  return (
    <Sidebar withFooter={false} className="z-[106] right-0">
      <div className="p-4">
        <header className="flex gap-2 justify-between items-center">
          <h2 className="uppercase text-xs font-semibold my-4">
            <span aria-hidden>Members — {users.length} / 50</span>
            <span className="sr-only">
              Members list, {formatCount(users.length, plural.member)} out of 50
              possible
            </span>
          </h2>
          <button
            aria-label="Invite user"
            className="hover:bg-green-500 hover:text-gray-100 p-1 rounded-[50%] transition-[background-color,color] duration-300"
            onClick={open}
          >
            <PlusIcon className="size-5" />
          </button>
        </header>
        <ul className="flex flex-col gap-4">
          {users
            .filter(({ profile }) => profile)
            .map(
              ({ id, user, profile, isOwner, kickedOutUntil, isKickedOut }) => (
                <Member
                  key={id}
                  id={id}
                  userId={user.id}
                  username={user.username}
                  isKickedOut={isKickedOut}
                  kickedOutUntil={kickedOutUntil}
                  avatar={profile.avatar}
                  currentUserId={currentUser.id}
                  isOwner={isOwner}
                  serverId={serverId}
                  status={profile.status}
                  displayName={profile.displayName}
                />
              )
            )}
        </ul>
        <Modal
          close={close}
          ref={modal}
          isOpen={isOpen}
          fullWidth
          className="w-11/12 max-w-md"
        >
          <section className="bg-black-600">
            <header className="bg-black-600 py-3 px-3 shadow-header">
              <h2 className="text-sm text-white-500 font-medium">
                Invite friend or stranger to {server.name}
              </h2>
            </header>
            <div className="w-full bg-black-600 max-h-52 pl-3 py-2 mt-1 scrollbar scrollbar-thin overflow-auto">
              <div className="overflow-hidden" style={{ height: "500px" }}>
                {isLoading && <Loader />}
                {friends.map(
                  ({ user, status, isInvited, privateChannelId }) => (
                    <div
                      className="flex gap-2 w-full rounded-md hover:bg-black-450/30 p-2"
                      key={user.id}
                    >
                      <Avatar src={user.avatar} size={AvatarSize.LG} />
                      <div className="flex grow items-center leading-none w-full">
                        <span className="min-w-28 h-4 text-gray-150">
                          <span className=" text-ellipsis font-light whitespace-nowrap w-full overflow-hidden border-b border-b-transparent block text-left">
                            {user.displayName}
                          </span>
                        </span>
                      </div>
                      <Button
                        className="py-0.5 text-sm px-4 border-green-500 border bg-transparent text-white-0 hover:bg-green-800 hover:border-green-800 transition-colors rounded-[3px]"
                        onClick={() => {
                          inviteUser({ username: user.username });
                        }}
                        isLoading={inviteResult.isPending}
                      >
                        Invite{" "}
                        <span className="sr-only">{user.displayName}</span>
                      </Button>
                    </div>
                  )
                )}
              </div>
            </div>
            <div className="bg-black-630 shadow-footer">
              <FormProvider {...inviteForm}>
                <Form
                  result={inviteResult.data?.status}
                  onSubmit={onSubmit}
                  className="w-full p-4"
                >
                  <FormField
                    name={InputName.Username}
                    type={InputType.Text}
                    label="Stranger username"
                    Icon={<UserIcon />}
                  />
                  <Button type="submit" isLoading={inviteResult.isPending}>
                    Invite
                  </Button>
                </Form>
                <div className="p-4">
                  <FormField
                    label={
                      <span>
                        <span aria-hidden>Or </span>
                        <span>copy invite link and send it directly</span>
                      </span>
                    }
                    copy
                    value={server.inviteLink.url}
                    name="inviteUrl"
                  />
                </div>
              </FormProvider>
            </div>
          </section>
        </Modal>
      </div>
    </Sidebar>
  );
}
