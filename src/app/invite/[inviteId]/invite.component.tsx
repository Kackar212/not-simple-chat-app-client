"use client";
import { getQueryClient } from "@/app/get-query-client";
import { acceptInvitation } from "@common/api";
import { AvatarSize } from "@common/constants";
import { Button } from "@components/button/button.component";
import { useRedirect } from "@components/redirect/use-redirect.hook";
import { ServerIcon } from "@components/server-icon/server-icon.component";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";

interface InviteProps {
  serverIcon: string | null;
  serverName: string;
  membersCount: number;
  serverId: number;
  channelId: number;
}

export function Invite({
  serverIcon,
  serverName,
  membersCount,
  serverId,
  channelId,
}: InviteProps) {
  const queryClient = useQueryClient();

  const { redirect } = useRedirect({
    to: `/channels/${serverId}/${channelId}`,
  });

  const { mutateAsync, isPending, data } = useMutation({
    mutationFn: acceptInvitation,
  });

  return (
    <div className="w-full h-full bg-black-700">
      {data &&
        data.status.isError &&
        "Sorry something went wrong! Try again later."}
      <div className="px-32 py-16 bg-black-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg">
        <div className="text-white-500 flex flex-col items-center min-w-72 gap-4">
          <ServerIcon
            server={{
              serverIcon,
              name: serverName,
              id: serverId,
              iconPlaceholder: null,
            }}
            size={AvatarSize.XXXL}
          />
          <p>You&apos;ve been invited to join</p>
          <h1>
            <span className="text-[2rem] font-bold">{serverName}</span>
          </h1>
          <div>{membersCount} Members</div>
          <Button
            className="w-full justify-center"
            isLoading={isPending}
            onClick={async () => {
              await mutateAsync({ serverId });

              redirect(async () => {
                await queryClient.invalidateQueries({
                  queryKey: ["get-user-servers"],
                });
              });
            }}
          >
            Accept invite
          </Button>
        </div>
      </div>
    </div>
  );
}
