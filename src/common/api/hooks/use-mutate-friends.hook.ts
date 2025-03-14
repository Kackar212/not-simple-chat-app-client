import { ApiError, deleteFriend, inviteFriend } from "../api.service";
import { QueryResponse } from "../query.factory";
import { Friend } from "../schemas/friend.schema";
import { useMutation } from "./use-mutation.hook";

export function useMutateFriends(props: { action: "add" | "remove" }) {
  const mutationFn = props.action === "add" ? inviteFriend : deleteFriend;
  return useMutation({
    mutationFn,
  });
}
