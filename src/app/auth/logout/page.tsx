"use client";

import { ErrorType, logout } from "@common/api";
import { useMutation } from "@common/api/hooks/use-mutation.hook";
import { authContext } from "@common/auth/auth.context";
import { ActivityStatus } from "@common/enums/activity-status.enum";
import { useSafeContext } from "@common/hooks";
import { Route } from "@common/route.enum";
import { socket, SocketEvent } from "@common/socket";
import { Redirect } from "@components/redirect/redirect.component";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Logout() {
  const {
    mutateAsync: signOut,
    isPending,
    isSuccess,
    data: { status, error },
  } = useMutation({
    mutationFn: logout,
  });

  const {
    auth: { member },
  } = useSafeContext(authContext);

  const { refresh, replace } = useRouter();

  useEffect(() => {
    if (error?.type === ErrorType.Fetch) {
      replace("/not-found");

      return;
    }

    if (status.isSuccess || status.isError) {
      return;
    }

    async function signOutUser() {
      try {
        await signOut();

        socket.emit(SocketEvent.Status, {
          status: ActivityStatus.Offline,
          serverId: member.serverId,
          memberId: member.id,
        });

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } finally {
        replace(Route.Login);
      }
    }

    signOutUser();

    return () => {
      logout.abortController.abort();
    };
  }, [isSuccess, member.id, member.serverId, replace, signOut, error, status]);

  return (
    <div className="text-white-500 flex size-full justify-center items-center">
      <span role="alert">
        {isSuccess && <span>You logged out successfuly!</span>}
      </span>
      <Redirect isRedirecting={isPending} />
    </div>
  );
}
