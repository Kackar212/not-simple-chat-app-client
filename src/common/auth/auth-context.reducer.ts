import { Member, MemberWithoutUser } from "@common/api/schemas/member.schema";
import { User } from "@common/api/schemas/user.schema";
import { AuthAction } from "@common/auth/auth-action.enum";
import { Auth, AuthActions } from "@common/auth/auth.types";
import { ActivityStatus } from "@common/enums/activity-status.enum";
import { SpecialStatus } from "@common/enums/special-status.enum";

const defaultAvatar = String(
  new URL("avatars/default.svg", process.env.NEXT_PUBLIC_API_URL)
);

export const initialUser: User = {
  id: -1,
  username: "unknown",
  avatar: defaultAvatar,
  backgroundColor: "",
  displayName: "unknown",
  status: ActivityStatus.Offline,
  backgroundImage: null,
  description: "",
  createdAt: new Date().toISOString(),
  isInvisible: false,
  specialStatus: null,
};

export const initialMember: Member = {
  id: -1,
  isOwner: false,
  userId: -1,
  isBanned: false,
  isKickedOut: false,
  kickedOutUntil: null,
  kickedOutCount: 0,
  profile: {
    id: -1,
    avatar: defaultAvatar,
    backgroundColor: "",
    displayName: "unknown",
    status: ActivityStatus.Offline,
    backgroundImage: null,
    description: "",
    memberId: -1,
    serverId: -1,
    isInvisible: false,
    specialStatus: null,
  },
  user: initialUser,
};

export function authContextReducer(state: Auth, action: AuthActions): Auth {
  switch (action.type) {
    case AuthAction.SignIn: {
      return {
        isLoggedIn: true,
        ...action.payload,
      };
    }

    case AuthAction.SignOut: {
      return {
        isLoggedIn: false,
        user: initialUser,
        member: initialMember,
        blacklist: [],
        emojis: [],
        pendingFriends: 0,
      };
    }

    case AuthAction.BlockUser: {
      return {
        ...state,
        blacklist: [...state.blacklist, { blocked: action.payload }],
      };
    }

    case AuthAction.UnblockUser: {
      return {
        ...state,
        blacklist: state.blacklist.filter(
          ({ blocked: { id } }) => id !== action.payload.id
        ),
      };
    }

    case AuthAction.AddEmoji: {
      return {
        ...state,
        emojis: [...state.emojis, action.payload],
      };
    }

    case AuthAction.IncrementPendingFriends: {
      return {
        ...state,
        pendingFriends: state.pendingFriends + 1,
      };
    }

    case AuthAction.DecrementPendingFriends: {
      return {
        ...state,
        pendingFriends: state.pendingFriends - 1,
      };
    }

    default: {
      throw new Error(
        `Unknown action, expected one of ${Object.values(AuthAction)}`
      );
    }
  }
}
