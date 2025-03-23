"use client";
import { getQueryClient } from "@/app/get-query-client";
import { acceptInvitation, mutations } from "@common/api";
import { useMutation } from "@common/api/hooks/use-mutation.hook";
import { AvatarSize } from "@common/constants";
import { formatCount, plural } from "@common/utils";
import { Button } from "@components/button/button.component";
import { Redirect } from "@components/redirect/redirect.component";
import { useRedirect } from "@components/redirect/use-redirect.hook";
import { ServerIcon } from "@components/server-icon/server-icon.component";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useCallback } from "react";
import { toast } from "react-toastify";
import { twMerge } from "tailwind-merge";

interface InviteProps {
  serverIcon: string | null;
  serverName: string;
  membersCount: number;
  onlineMembersCount: number;
  offlineMembersCount: number;
  serverId: number;
  channelId: number;
  iconPlaceholder: `data:image/${string};base64,${string}` | null;
}

export function Invite({
  serverIcon,
  serverName,
  membersCount,
  onlineMembersCount,
  offlineMembersCount,
  serverId,
  channelId,
  iconPlaceholder,
}: InviteProps) {
  const queryClient = useQueryClient();

  const { redirect } = useRedirect({
    to: `/channels/${serverId}/${channelId}`,
  });

  const {
    mutateAsync,
    isPending,
    data: { status },
  } = useMutation({
    mutationFn: mutations.acceptInvitation,
    onSuccess({ status }) {
      if (status.isError) {
        return;
      }

      toast.success(`You have become new member of ${serverName}`);

      setTimeout(() => {
        redirect(async () => {
          await queryClient.invalidateQueries({
            queryKey: ["get-user-servers"],
          });
        });
      }, 5000);
    },
  });

  const acceptInvitation = useCallback(async () => {
    await mutateAsync({ serverId });
  }, [mutateAsync, serverId]);

  return (
    <div className="w-full h-full bg-black-700">
      <div className="px-8 py-16 bg-black-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg w-full max-w-md">
        <div
          aria-live="polite"
          className={twMerge(
            "my-2 text-red-500 text-center",
            status.isSuccess && "text-green-500"
          )}
        >
          {status.isError && "Sorry something went wrong! Try again later."}
          {status.isSuccess && `You joined ${serverName} server!`}
        </div>

        <Redirect isRedirecting={status.isSuccess} />
        <div className="text-white-500 flex flex-col items-center mx-auto gap-4">
          <ServerIcon
            server={{
              serverIcon,
              name: serverName,
              id: serverId,
              iconPlaceholder,
            }}
            size={AvatarSize.XXXXL}
          />
          <p>You&apos;ve been invited to join</p>
          <h1>
            <span className="text-[2rem] font-bold">
              <span className="sr-only">Server name: </span>
              {serverName}
            </span>
          </h1>
          <div className="flex flex-col gap-2">
            <div className="text-white text-center">
              {formatCount(membersCount, plural.member)} on this server
            </div>
            <div className="text-green-500 text-center">
              {formatCount(onlineMembersCount, plural.member)} online
            </div>
            <div className="text-gray-150 text-center">
              {formatCount(offlineMembersCount, plural.member)} offline
            </div>
          </div>
          <Button
            className="w-full justify-center"
            isLoading={isPending}
            onClick={acceptInvitation}
          >
            Accept invitation
          </Button>
        </div>
      </div>
    </div>
  );
}
