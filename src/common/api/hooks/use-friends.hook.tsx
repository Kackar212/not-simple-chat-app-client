import { useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { socket, SocketEvent } from "@common/socket";
import { useMutation } from "./use-mutation.hook";
import { ApiErrorCode, deleteFriend, inviteFriend } from "../api.service";
import { useQuery } from "./use-query.hook";
import { useQueryClient } from "@tanstack/react-query";
import { Friend } from "../schemas/friend.schema";
import { isNotFound, isUserBlocked } from "../api.utils";
import { FriendStatus } from "@common/enums/friend-status.enum";
import { useSafeContext } from "@common/hooks";
import { authContext } from "@common/auth/auth.context";
import { AuthAction } from "@common/auth/auth-action.enum";
import { getQueryClient } from "@/app/get-query-client";

export type Updater<T> = (
  old: T,
  friend: Friend & { isFriend: boolean; isDeleted?: boolean }
) => unknown;

interface UseFriendsProps<T> {
  queryKey: unknown[];
  isFriend?: boolean;
  hasFriendRequest?: boolean;
  isBlocked?: boolean;
  updater: Updater<T>;
  onSuccess?: () => void;
}

const TOAST_ID = "FriendsToast";

export function useFriends<T>({
  queryKey,
  isFriend,
  hasFriendRequest,
  isBlocked,
  updater,
  onSuccess = () => {},
}: UseFriendsProps<T>) {
  const queryClient = useQueryClient();

  const { mutate, isPending, reset, data } = useMutation({
    mutationFn: isFriend || hasFriendRequest ? deleteFriend : inviteFriend,
    onSuccess({ error, status: { isSuccess } }, username) {
      if (isUserBlocked(error)) {
        toast.error(
          isBlocked
            ? "You can't invite blocked user."
            : "User blocked you so you cant invite him.",
          { toastId: TOAST_ID }
        );
      }

      if (!isSuccess) {
        return;
      }

      onSuccess();

      setTimeout(() => {
        reset();
      }, 2500);
    },
  });

  const { dispatch } = useSafeContext(authContext);

  const onFriend = useCallback(
    async (
      friend: Friend & {
        isDeleted?: boolean;
      }
    ) => {
      const { isInvited, isPending, isDeleted, username } = friend;

      const isFriend = !isInvited && !isPending && !isDeleted;

      toast.success(
        <span>
          {isPending && isInvited && !isDeleted && `You invited ${username}`}
          {isFriend && `${username} is your new friend`}
          {isDeleted && `${username} is no longer your friend`}
          {isPending &&
            !isInvited &&
            !isDeleted &&
            `${username} invited you to became his friend`}
        </span>,
        { autoClose: 5000, toastId: TOAST_ID }
      );

      queryClient.setQueryData(queryKey, (old?: any) => {
        if (!old) {
          return old;
        }

        return updater(old, { ...friend, isFriend, isDeleted });
      });

      const shouldDecrementPendingFriends =
        !isPending || (isDeleted && isPending);

      dispatch({
        type: shouldDecrementPendingFriends
          ? AuthAction.DecrementPendingFriends
          : AuthAction.IncrementPendingFriends,
      });
    },
    [queryClient, queryKey, updater, dispatch]
  );

  useEffect(() => {
    socket.on(SocketEvent.Friend, onFriend);

    return () => {
      socket.off(SocketEvent.Friend);
    };
  }, [onFriend]);

  return { modifyFriends: mutate, isPending, reset, data };
}
