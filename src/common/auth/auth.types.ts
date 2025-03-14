import { Blacklist } from "@common/api/schemas/blacklist.schema";
import { CustomEmoji } from "@common/api/schemas/emoji.schema";
import { Member, MemberWithoutUser } from "@common/api/schemas/member.schema";
import { Role } from "@common/api/schemas/role.schema";
import { User } from "@common/api/schemas/user.schema";
import { AuthAction } from "@common/auth/auth-action.enum";
import { Emoji } from "@common/emojis/emoji.class";
import { Dispatch } from "react";

type SignInAction = {
  type: AuthAction.SignIn;
  payload: {
    user: User;
    member: Member;
    blacklist: Blacklist;
    emojis: CustomEmoji[];
    pendingFriends: number;
  };
};
type SignOutAction = { type: AuthAction.SignOut };
type BlockUser = {
  type: AuthAction.BlockUser;
  payload: User;
};
type UnblockUser = {
  type: AuthAction.UnblockUser;
  payload: User;
};
type AddEmoji = {
  type: AuthAction.AddEmoji;
  payload: CustomEmoji;
};
type SetPendingFriends = {
  type: AuthAction.IncrementPendingFriends | AuthAction.DecrementPendingFriends;
};

export type AuthActions =
  | SignInAction
  | SignOutAction
  | BlockUser
  | UnblockUser
  | AddEmoji
  | SetPendingFriends;

export type Auth = {
  isLoggedIn: boolean;
  member: Member;
  user: User;
  blacklist: Blacklist;
  emojis: CustomEmoji[];
  pendingFriends: number;
};

export type AuthContext = {
  auth: Auth;
  dispatch: Dispatch<AuthActions>;
};
