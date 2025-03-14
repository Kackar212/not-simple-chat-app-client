import { mutations } from "../api.service";
import { useMutation } from "./use-mutation.hook";
import { toast } from "react-toastify";
import { QueryResponse } from "../query.factory";
import { useCallback } from "react";
import { HttpMethod } from "@common/enums";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryClient } from "@/app/get-query-client";

interface UseBlacklistProps {
  isBlocked?: boolean;
  queryKey: unknown[];
}

export function useBlacklist({ queryKey, isBlocked }: UseBlacklistProps) {
  const method = isBlocked ? HttpMethod.Delete : HttpMethod.Post;
  const queryClient = useQueryClient();

  const modifyBlacklist = useCallback(
    (username: string) => {
      return mutations.modifyBlacklist({
        username,
        method,
      });
    },
    [method]
  );

  const modifyBlacklistMutation = useMutation({
    mutationKey: ["blacklist"],
    mutationFn: modifyBlacklist,
    onSuccess({ status: { isSuccess, isError } }) {
      const isUnblocked = method === HttpMethod.Delete;
      const messageOnSuccess = isUnblocked ? "User unblocked" : "User blocked";
      const messageOnError = `You cannot currently ${
        isUnblocked ? "unblock" : "block"
      } this user!`;

      setTimeout(() => {
        modifyBlacklistMutation.reset();
      }, 2500);

      if (isSuccess) {
        toast.success(messageOnSuccess);

        queryClient.setQueryData(queryKey, (old: QueryResponse<any, any>) => {
          return {
            ...old,
            data: {
              ...old.data,
              blocked: {
                ...old.data.blocked,
              },
              user: {
                ...old.data.user,
                isBlocked: !isBlocked,
              },
              isBlocked: !isBlocked,
              recipient: {
                ...old.data.recipient,
                isBlocked: !isBlocked,
              },
            },
          };
        });
      }

      if (isError) {
        toast.error(messageOnError);
      }
    },
  });

  return modifyBlacklistMutation;
}
