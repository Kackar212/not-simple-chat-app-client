import { HttpMethod, HttpStatus } from "../enums";
import { ErrorType, QueryError, createQuery } from "./query.factory";
import { SESSION_COOKIE_NAME } from "@common/constants";
import { User, UserSchema } from "@common/api/schemas/user.schema";
import {
  InviteServer,
  Server,
  ServerSchema,
  UserServer,
  UserServerSchema,
} from "@common/api/schemas/server.schema";
import { Channel } from "@common/api/schemas/channel.schema";
import {
  Message,
  MessagesResponseWithCursor,
  MessagesResponseWithCursorSchema,
  MessageWithBaseUser,
  PollType,
} from "@common/api/schemas/message.schema";
import { FriendStatus } from "@common/enums/friend-status.enum";
import { Friend } from "./schemas/friend.schema";
import { ChannelType } from "@common/enums/channel-type.enum";
import { DirectMessageChannel } from "./schemas/direct-message-channel.schema";
import { Blacklist, BlacklistSchema } from "./schemas/blacklist.schema";
import {
  CurrentUserProfile,
  CurrentUserProfileSchema,
} from "./schemas/member.schema";
import { UserProfile } from "./schemas/user-profile-with-mutual.schema";
import type { Emoji } from "@common/emojis/emoji.class";
import { CustomEmoji } from "./schemas/emoji.schema";
import { TenorGif } from "@components/gif-picker/gif-picker.types";
import { SpecialStatus } from "@common/enums/special-status.enum";
import { HistoryFile } from "@components/upload/history-file.interface";

export enum ApiAction {
  Update = HttpMethod.Patch,
  Add = HttpMethod.Post,
  Delete = HttpMethod.Delete,
}

const GENERIC_ERROR_MESSAGE =
  "Something went wrong. Try again later! If problem persist, contact us at admin@admin.com.";
const DEFAULT_CONTENT_TYPE = "application/json";

export enum Endpoint {
  Login = "auth/login",
  Register = "auth/register",
  ForgotPassword = "auth/reset-password-request",
  ResetPassword = "auth/reset-password",
  Logout = "auth/logout",
  Account = "auth/account",
  GetUser = "users/me",
  UpdateUser = "users/me",
  UserResetPassword = "users/me/reset-password",
  GetServers = "users/me/servers",
  GetServer = "users/me/servers/[serverId]",
  Emojis = "servers/[serverId]/emojis",
  CreateServer = "servers",
  GetMembers = "servers/[serverId]/members",
  GetServerByInviteId = "servers/[inviteId]",
  DeleteServer = "servers/[serverId]",
  GetChannels = "servers/[serverId]/channels",
  CreateChannel = "servers/[serverId]/channels",
  UpdateMember = "servers/[serverId]/members",
  LeaveServer = "servers/[serverId]/members",
  CreateMessage = "channels/[channelId]/messages",
  GetMessages = "channels/[channelId]/messages",
  DeleteMessage = "channels/messages",
  EditMessage = "channels/messages",
  Reactions = "channels/messages/reactions",
  DeleteAttachment = "channels/attachments/[attachmentId]",
  CreatePoll = "channels/polls",
  PollAnswers = "channels/polls/answers",
  InviteUser = "users/invite",
  AcceptInvite = "servers/[serverId]/members",
  DeclineInvite = "invite/member/decline",
  InviteFriend = "users/me/friends",
  AcceptFriend = "users/me/friends",
  DeclineFriend = "users/me/friends",
  GetFriends = "users/me/friends/[status]",
  DeleteFriend = "users/me/friends",
  Blacklist = "users/me/blacklist",
  GetMutualData = "users/me/mutual",
  GetProfile = "users/[userId]/profile",
  CreateDirectMessageChannel = "direct-message",
  GetDirectMessageChannels = "direct-message",
  GetDirectMessageChannel = "direct-message/[channelId]",
  DirectMessageRequest = "direct-message",
  GetGifCategories = "gifs/categories",
  GetGifs = "gifs/search",
}

const query = createQuery<Endpoint>();

query.global({
  baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/`,
  options: {
    headers: {
      "content-type": DEFAULT_CONTENT_TYPE,
    },
    credentials: "include",
  },
});

query.createErrorMessageFactory(
  (
    {
      type,
      error,
    }: QueryError<{
      statusCode: number;
      code: ApiErrorCode;
      meta: Record<string, unknown>;
    }>,
    config
  ) => {
    if (type !== ErrorType.ResponseStatus) {
      return GENERIC_ERROR_MESSAGE;
    }

    const endpointMessages = Reflect.get(messages, config.url) || {};

    const errorMessage = Reflect.get(endpointMessages, error.code);

    return errorMessage;
  }
);

query.createSuccessMessageFactory((data, { url, method, successMessage }) => {
  if (successMessage) {
    return successMessage;
  }

  const result = Reflect.get(apiSuccess, url);

  if (typeof result === "string") {
    return result;
  }

  if (typeof result === "undefined") {
    return "";
  }

  const factory = Reflect.get(result, method || HttpMethod.Get);

  if (typeof factory === "function") {
    return factory(data);
  }

  return factory || "";
});

export interface Data {
  message: string;
  data: Data;
  statusCode: HttpStatus;
}

export enum ApiErrorCode {
  EntityAlreadyExists = "ENTITY_ALREADY_EXISTS",
  Forbidden = "FORBIDDEN",
  WrongCredentials = "WRONG_CREDENTIALS",
  BadRequest = "BAD_REQUEST",
  UserBlocked = "USER_BLOCKED",
  Unauthorized = "UNAUTHORIZED",
  NotFound = "NOT_FOUND",
  InvalidToken = "INVALID_TOKEN",
  InactiveAccount = "INACTIVE_ACCOUNT",
  IncorrectOldPassword = "INCORRECT_OLD_PASSWORD",
  InvalidFriendUsername = "INVALID_FRIEND_USERNAME",
  Generic = "GENERIC",
}

export type ApiError = {
  code: ApiErrorCode;
  error: ApiErrorCode;
  message: string;
  key: string;
  statusCode: HttpStatus;
  meta: Record<string, unknown>;
};

const messages = {
  [Endpoint.Login]: {
    [ApiErrorCode.WrongCredentials]: "Wrong username or password!",
    [ApiErrorCode.InactiveAccount]: "You need to activate your account",
  },
  [Endpoint.Register]: {
    [ApiErrorCode.EntityAlreadyExists]:
      "User with this email or username already exists!",
  },
  [Endpoint.CreateChannel]: {
    [ApiErrorCode.EntityAlreadyExists]:
      "Channel with this name already exists!",
  },
  [Endpoint.UserResetPassword]: {
    [ApiErrorCode.IncorrectOldPassword]: "Old password is incorrect",
  },
  [Endpoint.ResetPassword]: {
    [ApiErrorCode.NotFound]: `Link expired or is invalid, go to ${new URL(
      "/auth/forgot-password",
      process.env.NEXT_PUBLIC_APP_URL
    )} for new one`,
  },
  [Endpoint.InviteFriend]: {
    [ApiErrorCode.UserBlocked]:
      "You are blocked by this user or you blocked him!",
    [ApiErrorCode.NotFound]: "You cant invite this user!",
    [ApiErrorCode.EntityAlreadyExists]: "You already invited this user!",
    [ApiErrorCode.InvalidFriendUsername]:
      "You want to be friend with yourself? :(",
  },
  [Endpoint.Emojis]: {
    [ApiErrorCode.EntityAlreadyExists]:
      "Emoji already exists, change name of the new emoji",
  },
};

const apiSuccess = {
  [Endpoint.Login]: "You are logged in!",
  [Endpoint.Register]: "Your account has been created! Check your inbox!",
  [Endpoint.ForgotPassword]: "Check your inbox and follow the link!",
  [Endpoint.ResetPassword]: "Your password has been reset!",
  [Endpoint.UserResetPassword]: "Your password has been reset!",
  [Endpoint.CreateServer]: "You created a new server!",
  [Endpoint.CreateChannel]: "You created a new channel!",
  [Endpoint.InviteFriend]: "You sent friend request to user!",
  [Endpoint.DirectMessageRequest]: {
    [HttpMethod.Patch]: "You accepted private chat request!",
    [HttpMethod.Delete]: "Direct message chat has been deleted",
  },
  [Endpoint.Blacklist]: {
    [HttpMethod.Post]: "You successfuly blocked user!",
    [HttpMethod.Delete]: "You successfully unblocked user!",
  },
  [Endpoint.Emojis]: "You created new emoji",
  [Endpoint.CreatePoll]: "You created a poll",
};

export const signIn = query.create<
  { username: string; password: string },
  CurrentUserProfile,
  ApiError
>((requestData) => {
  return {
    url: Endpoint.Login,
    method: HttpMethod.Post,
    body: JSON.stringify(requestData),
    parse(result) {
      return CurrentUserProfileSchema.parse(result);
    },
  };
});

export const signUp = query.create<
  { email: string; username: string; password: string },
  User,
  ApiError
>((requestData) => {
  return {
    url: Endpoint.Register,
    method: HttpMethod.Post,
    body: JSON.stringify(requestData),
    parse(result) {
      return UserSchema.parse(result);
    },
  };
});

export const forgotPassword = query.create<{ email: string }, {}, ApiError>(
  (data) => {
    return {
      url: Endpoint.ForgotPassword,
      body: JSON.stringify(data),
      method: HttpMethod.Post,
    };
  }
);

export const resetPassword = query.create<
  { newPassword: string; oldPassword?: string; resetPasswordToken?: string },
  {},
  ApiError
>((data) => {
  return {
    url: data.oldPassword ? Endpoint.UserResetPassword : Endpoint.ResetPassword,
    body: JSON.stringify(data),
    method: HttpMethod.Patch,
  };
});

export const logout = query.create<void, {}, ApiError>(() => {
  return {
    url: Endpoint.Logout,
    method: HttpMethod.Post,
  };
});

export const activateAccount = query.create<string, {}, ApiError>(
  (token: string) => {
    return {
      url: Endpoint.Account,
      method: HttpMethod.Patch,
      query: {
        token,
      },
    };
  }
);

export const getUser = query.create<
  { sessionId?: string; serverId?: string },
  CurrentUserProfile,
  ApiError
>(({ sessionId, serverId }) => {
  return {
    url: Endpoint.GetUser,
    cookies: {
      [SESSION_COOKIE_NAME]: sessionId,
    },
    query: {
      serverId,
    },
    parse(result) {
      return CurrentUserProfileSchema.parse(result);
    },
  };
});

export const createServer = query.create<
  {
    name: string;
    description?: string;
    serverIcon?: HistoryFile<{}>;
  },
  UserServer,
  ApiError
>(({ name, serverIcon }) => {
  const formData = new FormData();

  formData.append("name", name);

  if (serverIcon) {
    formData.append("serverIcon", serverIcon.file);
  }

  return {
    url: Endpoint.CreateServer,
    method: HttpMethod.Post,
    body: formData,
    parse(result) {
      return UserServerSchema.parse(result);
    },
  };
});

export const getServer = query.create<
  { serverId: string | number },
  Server,
  ApiError
>(({ serverId }) => {
  return {
    url: Endpoint.GetServer,
    params: {
      serverId,
    },
    parse(result) {
      return ServerSchema.parse(result);
    },
  };
});

export const createEmoji = query.create<
  {
    serverId: number;
    name: string;
    file: File;
    scope?: "Public" | "Private";
  },
  {},
  ApiError
>(({ serverId, file, name, scope = "Public" }) => {
  const formData = new FormData();
  formData.append("emoji", file);
  formData.append("name", name);
  formData.append("scope", scope);

  return {
    url: Endpoint.Emojis,
    params: {
      serverId,
    },
    body: formData,
    method: HttpMethod.Post,
  };
});

export const getServerEmojis = query.create<
  { serverId: number },
  CustomEmoji[],
  ApiError
>(({ serverId }) => ({
  url: Endpoint.Emojis,
  params: {
    serverId,
  },
}));

export const getServerByInviteId = query.create<
  { inviteId: string; sessionId?: string },
  InviteServer,
  ApiError
>(({ inviteId, sessionId }) => {
  return {
    url: Endpoint.GetServerByInviteId,
    params: {
      inviteId,
    },
    cookies: {
      [SESSION_COOKIE_NAME]: sessionId,
    },
  };
});

export const deleteServer = query.create<number, Server, ApiError>(
  (serverId) => ({
    url: Endpoint.DeleteServer,
    params: {
      serverId,
    },
    method: HttpMethod.Delete,
  })
);

export const getUserServers = query.create<
  string | void,
  UserServer[],
  ApiError
>((sessionId) => {
  return {
    url: Endpoint.GetServers,
    cookies: {
      [SESSION_COOKIE_NAME]: sessionId,
    },
    parse(result) {
      return UserServerSchema.array().parse(result);
    },
  };
});

export const leaveServer = query.create<number, Server, ApiError>(
  (serverId: number) => {
    return {
      url: Endpoint.LeaveServer,
      params: {
        serverId,
      },
      method: HttpMethod.Delete,
    };
  }
);

export const punishMember = query.create<
  {
    isBanned?: boolean;
    isKicked?: boolean;
    memberId: number;
    serverId: number;
  },
  Server,
  ApiError
>(({ isBanned, isKicked, memberId, serverId }) => ({
  url: Endpoint.UpdateMember,
  method: HttpMethod.Patch,
  params: {
    serverId,
  },
  body: JSON.stringify({
    memberId,
    isBanned,
    isKicked,
  }),
}));

export const createChannel = query.create<
  { serverId: number; name: string; type: ChannelType },
  Channel,
  ApiError
>(({ serverId, name, type }) => {
  return {
    url: Endpoint.CreateChannel,
    method: HttpMethod.Post,
    params: {
      serverId,
    },
    body: JSON.stringify({ serverId: +serverId, name, type }),
  };
});

export const getChannels = query.create<
  { sessionId?: string; serverId: number },
  [],
  ApiError
>(({ sessionId, serverId }) => {
  return {
    url: Endpoint.GetChannels,
    params: {
      serverId,
    },
    cookies: {
      [SESSION_COOKIE_NAME]: sessionId,
    },
  };
});

export const getMessages = query.create<
  {
    sessionId?: string;
    channelId: number;
    before?: number | null;
    after?: number | null;
    around?: number;
    isPinned?: boolean;
  },
  MessagesResponseWithCursor,
  ApiError
>(({ channelId, after, before, around, isPinned, sessionId }) => {
  return {
    url: Endpoint.GetMessages,
    params: {
      channelId,
    },
    cookies: {
      [SESSION_COOKIE_NAME]: sessionId,
    },
    query: {
      after,
      before,
      around,
      isPinned,
    },
    parse(data) {
      return MessagesResponseWithCursorSchema.parse(data);
    },
  };
});

export const deleteMessage = query.create<number, Message, ApiError>(
  (messageId) => ({
    method: HttpMethod.Delete,
    url: Endpoint.DeleteMessage,
    body: JSON.stringify({
      messageId,
    }),
  })
);

export const editMessage = query.create<
  { messageId: number; message?: string; isPinned?: boolean },
  Message,
  ApiError
>(({ messageId, message, isPinned }) => ({
  method: HttpMethod.Patch,
  url: Endpoint.EditMessage,
  body: JSON.stringify({
    messageId,
    message,
    isPinned,
  }),
}));

export const inviteUser = query.create<
  { serverId: number; username: string },
  {},
  ApiError
>((requestBody) => {
  return {
    url: Endpoint.InviteUser,
    method: HttpMethod.Post,
    body: JSON.stringify(requestBody),
  };
});

export const modifyReactions = query.create<
  | { emoji: Emoji; messageId: number }
  | { emojiName: string; messageId: number },
  {},
  ApiError
>((props) => {
  const hasReactionId = "emojiName" in props;

  return {
    url: Endpoint.Reactions,
    body: JSON.stringify(
      hasReactionId
        ? props
        : {
            emoji: { id: props.emoji.id, name: props.emoji.uniqueName },
            messageId: props.messageId,
          }
    ),
    method: hasReactionId ? HttpMethod.Delete : HttpMethod.Post,
  };
});

export const updateProfile = query.create<
  {
    status?: SpecialStatus | null;
    isInvisible?: boolean;
    profileId: number;
    serverId?: number;
  },
  {},
  ApiError
>((data) => ({
  url: Endpoint.UpdateUser,
  body: JSON.stringify(data),
  method: HttpMethod.Patch,
}));

export const acceptInvitation = query.create<
  { serverId: number },
  {},
  ApiError
>(({ serverId }) => {
  return {
    url: Endpoint.AcceptInvite,
    params: {
      serverId,
    },
    method: HttpMethod.Post,
  };
});

export const declineInvitation = query.create<
  { sessionId?: string; serverId: number },
  {},
  ApiError
>(({ sessionId, serverId }) => {
  return {
    url: Endpoint.DeclineInvite,
    body: JSON.stringify({ serverId }),
    method: HttpMethod.Post,
    cookies: {
      [SESSION_COOKIE_NAME]: sessionId,
    },
  };
});

export const inviteFriend = query.create<string, {}, ApiError>((friendName) => {
  return {
    url: Endpoint.InviteFriend,
    method: HttpMethod.Post,
    body: JSON.stringify({
      friendName,
    }),
  };
});

export const acceptFriend = query.create<string, {}, {}>((friendName) => {
  return {
    url: Endpoint.AcceptFriend,
    body: JSON.stringify({ friendName }),
    method: HttpMethod.Patch,
  };
});

export const getFriends = query.create<
  { status?: FriendStatus; hasDM?: boolean },
  Friend[],
  ApiError
>(({ status, hasDM }) => {
  return {
    url: Endpoint.GetFriends,
    params: {
      status,
    },
    query: {
      hasDM,
    },
  };
});

export const deleteFriend = query.create<string, {}, ApiError>((username) => ({
  url: Endpoint.DeleteFriend,
  method: HttpMethod.Delete,
  body: JSON.stringify({
    username,
  }),
}));

export const modifyBlacklist = query.create<
  { username: string; method: HttpMethod },
  Blacklist,
  ApiError
>(({ username, method }) => ({
  url: Endpoint.Blacklist,
  body: JSON.stringify({
    username,
  }),
  method,
}));

export const getBlacklist = query.create<void, { blocked: User }[], ApiError>(
  () => ({
    url: Endpoint.Blacklist,
  })
);

export const getMutualData = query.create<
  number,
  { mutualFriends: Friend[]; mutualServers: Server[] },
  ApiError
>((mutualWithUserId: number) => ({
  url: Endpoint.GetMutualData,
  query: {
    with: mutualWithUserId,
  },
}));

export const getProfile = query.create<
  { userId?: number; serverId?: number } | void,
  UserProfile,
  ApiError
>(({ userId = "me", serverId } = {}) => ({
  url: Endpoint.GetProfile,
  params: {
    userId,
  },
  query: {
    serverId,
  },
}));

export const createMessage = query.create<
  {
    channelId: number;
    message: string;
    type?: "direct-message" | "message";
    attachments: HistoryFile<{ isSpoiler: boolean }>[];
    messageReference?: MessageWithBaseUser;
  },
  Message,
  ApiError
>((data) => {
  const { attachments, message, channelId } = data;

  const formData = attachments.reduce((formData, attachment) => {
    formData.append(
      `attachments`,
      new Blob([attachment.file], { type: attachment.file.type }),
      `${attachment.customData.isSpoiler ? "__SPOILER__" : ""}${
        attachment.name
      }`
    );

    return formData;
  }, new FormData());
  formData.set("message", message);
  formData.set("channelId", channelId.toString());
  if (data.messageReference) {
    formData.set("replyTo", String(data.messageReference.id));
  }

  return {
    url: Endpoint.CreateMessage,
    method: HttpMethod.Post,
    params: {
      channelId: data.channelId,
    },
    body: formData,
  };
});

export const deleteAttachment = query.create<
  { attachmentId: number; channelId: number },
  {},
  ApiError
>(({ attachmentId, channelId }) => ({
  url: Endpoint.DeleteAttachment,
  params: {
    attachmentId,
  },
  body: JSON.stringify({ channelId }),
  method: HttpMethod.Delete,
}));

export const createDirectMessageChannel = query.create<
  { username: string },
  DirectMessageChannel,
  ApiError
>(({ username }) => {
  return {
    url: Endpoint.CreateDirectMessageChannel,
    method: HttpMethod.Post,
    body: JSON.stringify({ username }),
    successMessage: `Private chat with ${username} has been created!`,
  };
});

export const deleteDirectMessageChannel = query.create<
  { channelId: number },
  DirectMessageChannel,
  ApiError
>(({ channelId }) => {
  return {
    url: Endpoint.CreateDirectMessageChannel,
    method: HttpMethod.Delete,
    body: JSON.stringify({ channelId }),
  };
});

export const getDirectMessageChannels = query.create<
  string | void,
  DirectMessageChannel[],
  ApiError
>((sessionId) => ({
  url: Endpoint.GetDirectMessageChannels,
  cookies: {
    [SESSION_COOKIE_NAME]: sessionId,
  },
}));

export const getDirectMessageChannel = query.create<
  { sessionId?: string; channelId: number },
  DirectMessageChannel,
  ApiError
>(({ sessionId, channelId }) => ({
  url: Endpoint.GetDirectMessageChannel,
  params: {
    channelId,
  },
  cookies: {
    [SESSION_COOKIE_NAME]: sessionId,
  },
}));

export const acceptDirectMessageRequest = query.create<
  { messageId: number; channelId: number },
  DirectMessageChannel,
  ApiError
>((body) => ({
  url: Endpoint.DirectMessageRequest,
  body: JSON.stringify(body),
  method: HttpMethod.Patch,
}));

export const declineDirectMessageRequest = query.create<
  { messageId: number; channelId: number },
  DirectMessageChannel,
  ApiError
>((body) => ({
  url: Endpoint.DirectMessageRequest,
  body: JSON.stringify(body),
  method: HttpMethod.Delete,
}));

export const getGifCategories = query.create<
  void,
  {
    locale: string;
    tags: Array<{
      searchterm: string;
      path: string;
      image: string;
      name: string;
    }>;
  },
  ApiError
>(() => ({
  url: Endpoint.GetGifCategories,
}));

export const getGifs = query.create<
  { searchTerm: string; next: string },
  { next: string; results: TenorGif[] },
  ApiError
>(({ searchTerm, next }) => ({
  url: Endpoint.GetGifs,
  query: {
    q: searchTerm,
    pos: next,
  },
}));

export const createPoll = query.create<
  {
    question: string;
    answers: Array<{ answer: string; isCorrectAnswer?: boolean | null }>;
    channelId: number;
    pollType: (typeof PollType)[keyof typeof PollType];
  },
  {},
  ApiError
>(({ question, answers, channelId, pollType }) => ({
  url: Endpoint.CreatePoll,
  body: JSON.stringify({
    question,
    answers,
    channelId,
    type: pollType,
  }),
  method: HttpMethod.Post,
}));

export const createUserAnswer = query.create<
  {
    answerId: number;
    messageId: number;
  },
  {},
  ApiError
>(({ answerId, messageId }) => ({
  url: Endpoint.PollAnswers,
  body: JSON.stringify({
    answerId,
    messageId,
  }),
  method: HttpMethod.Post,
}));

export const mutations = {
  createServer,
  createEmoji,
  acceptDirectMessageRequest,
  declineDirectMessageRequest,
  acceptFriend,
  acceptInvitation,
  declineInvitation,
  deleteAttachment,
  deleteFriend,
  deleteMessage,
  deleteServer,
  createChannel,
  createDirectMessageChannel,
  deleteDirectMessageChannel,
  createMessage,
  punishMember,
  leaveServer,
  inviteFriend,
  inviteUser,
  editMessage,
  modifyReactions,
  modifyBlacklist,
  signIn,
  signUp,
  activateAccount,
  updateProfile,
  createPoll,
  createUserAnswer,
} as const;

export const queries = {
  getUserServers,
  getBlacklist,
  getChannels,
  getDirectMessageChannel,
  getDirectMessageChannels,
  getFriends,
  getMessages,
  getProfile,
  getServer,
  getServerEmojis,
  getServerByInviteId,
  getMutualData,
  getUser,
  getGifCategories,
  getGifs,
} as const;
