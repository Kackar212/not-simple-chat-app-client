import { CurrentUserProfile } from "@common/api/schemas/member.schema";
import { Server, UserServer } from "@common/api/schemas/server.schema";
import { http, HttpResponse } from "msw";
import {
  createChannelEntityMock,
  createFriendEntityMock,
  createMemberEntityMock,
  createRecipientEntityMock,
  createServerEntityMock,
  createUserServerEntityMock,
  member,
  user,
} from "./entities";
import { ApiErrorCode } from "@common/api";
import { DirectMessageChannel } from "@common/api/schemas/direct-message-channel.schema";
import { Friend } from "@common/api/schemas/friend.schema";

export const handlers = [
  http.get<{ serverId?: string }>(
    "https://localhost:4000/api/users/me",
    ({ request: { url } }) => {
      const { searchParams } = new URL(url);
      const response = {
        user,
        member,
        blacklist: [],
        emojis: [],
        pendingFriends: 0,
      };

      if (searchParams.get("serverId") === "2") {
        response.member = createMemberEntityMock({ isOwner: true });
      }

      return HttpResponse.json<CurrentUserProfile>(response);
    }
  ),
  http.get("https://localhost:4000/api/users/me/servers", () => {
    return HttpResponse.json<UserServer[]>([
      createUserServerEntityMock(1, 1),
      createUserServerEntityMock(2, 2),
      createUserServerEntityMock(3, undefined, "https://placehold.co/48"),
    ]);
  }),
  http.get("https://localhost:4000/api/users/me/servers/1", () => {
    const channel = {
      ...createChannelEntityMock(1),
      channelUsers: [],
    };
    return HttpResponse.json<Server>({
      ...createServerEntityMock(1, 1),
      defaultChannel: channel,
      channels: [channel],
      member,
      members: [member],
    } as const);
  }),
  http.patch<{}, { resetPasswordToken: string }>(
    "https://localhost:4000/api/auth/reset-password",
    async (res) => {
      const body = await res.request.json();

      const shouldThrowError =
        body.resetPasswordToken === "reset_password_token_not_found";

      if (shouldThrowError) {
        return HttpResponse.json(
          { code: ApiErrorCode.NotFound },
          { status: 404 }
        );
      }

      return HttpResponse.json({});
    }
  ),
  http.patch<{}, { oldPassword: string }>(
    "https://localhost:4000/api/users/me/reset-password",
    async (res) => {
      const body = await res.request.json();

      const shouldThrowError = body.oldPassword === "Testerror1!@#";

      if (shouldThrowError) {
        return HttpResponse.json(
          { code: ApiErrorCode.IncorrectOldPassword },
          { status: 400 }
        );
      }

      return HttpResponse.json({});
    }
  ),
  http.post<{}, { username: string }>(
    "https://localhost:4000/api/auth/register",
    async (res) => {
      const body = await res.request.json();

      const shouldThrowError = body.username === "AlreadyExists";

      if (shouldThrowError) {
        return HttpResponse.json(
          { code: ApiErrorCode.EntityAlreadyExists },
          { status: 409 }
        );
      }

      return HttpResponse.json(user);
    }
  ),
  http.get<{ channelId?: string }>(
    "https://localhost:4000/api/direct-message/:channelId?",
    () => {
      return HttpResponse.json<DirectMessageChannel>({
        ...createChannelEntityMock(4),
        isPrivate: true,
        isBlocked: false,
        isRequestAccepted: true,
        recipient: createRecipientEntityMock(),
        createdBy: "test user",
        serverId: undefined,
      });
    }
  ),
  http.get("https://localhost:4000/api/users/me/mutual", () => {
    return HttpResponse.json<{
      mutualServers: Server[];
      mutualFriends: Friend[];
    }>({
      mutualServers: [createServerEntityMock(1, 1), createServerEntityMock(2)],
      mutualFriends: [createFriendEntityMock()],
    });
  }),
  http.delete("https://localhost:4000/api/servers/:serverId", () => {
    return HttpResponse.json({});
  }),
  http.delete("https://localhost:4000/api/servers/:serverId/members", () => {
    return HttpResponse.json({});
  }),
];
