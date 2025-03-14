"use client";

import {
  CSSProperties,
  PropsWithChildren,
  createContext,
  createRef,
  useEffect,
  useReducer,
  useRef,
} from "react";
import { Auth, AuthContext } from "@common/auth/auth.types";
import {
  authContextReducer,
  initialMember,
  initialUser,
} from "@common/auth/auth-context.reducer";
import { socket, SocketEvent } from "@common/socket";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useQuery } from "@common/api/hooks/use-query.hook";
import { ApiErrorCode, ErrorType, getUser } from "@common/api";
import { AuthAction } from "./auth-action.enum";
import { Route } from "@common/route.enum";
import Loading from "@/app/loading";
import { User } from "@common/api/schemas/user.schema";
import { CurrentUserProfile } from "@common/api/schemas/member.schema";
import { ActivityStatus } from "@common/enums/activity-status.enum";
import {
  isNotFound,
  isResponseStatusError,
  isUnauthorized,
} from "@common/api/api.utils";
import { CustomEmoji } from "@common/api/schemas/emoji.schema";
import { useEmojiStyle } from "@common/emojis/use-emoji-style.hook";
import { EmojiMemoryStorage } from "@common/emojis/emojis.storage";
import { Emoji, EmojiType } from "@common/emojis/emoji.class";
import { EmojiScope } from "@common/constants";
import { NotFound } from "@components/not-found/not-found.component";

const authContextInitialState = {
  isLoggedIn: false,
  user: initialUser,
  member: initialMember,
  blacklist: [] as { blocked: User }[],
  emojis: [] as CustomEmoji[],
  pendingFriends: 0,
} as const;

export const authContext = createContext<AuthContext>({
  auth: authContextInitialState,
  dispatch: () => undefined,
});

interface AuthProviderProps {
  auth?: Auth;
}

/**
 *
 *
 * TODO: Maybe instead of doing all of this on client-side it would be better to initialize auth value on server and on client only update member if user navigates anywhere. Or on server load only simple user and then always on client load member.
 *
 */

export function AuthProvider({
  children,
  auth: authInitialState = authContextInitialState,
}: PropsWithChildren<AuthProviderProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const ignore = useRef(false);

  const { serverId } = useParams<{ serverId: string | undefined }>();

  const {
    refetch,
    data: { error },
  } = useQuery({
    queryKey: ["me", Number(serverId || -1)],
    queryFn: () => {
      return getUser({ serverId });
    },
    enabled: false,
    select: (data) => ({
      ...data,
      user: data.data?.user,
      member: data.data?.member,
    }),
  });

  const isAuthPage = pathname.startsWith("/auth/");

  useEffect(() => {
    ignore.current = false;

    async function setAuthData() {
      if (ignore.current) {
        return;
      }

      const data = await refetch();

      const { data: auth } = data;

      if (!auth) {
        return;
      }

      const { error, data: payload } = auth;

      if (isAuthPage) {
        return;
      }

      if (error && error.type !== ErrorType.ResponseStatus) {
        return;
      }

      if (isNotFound(error)) {
        return router.replace(Route.Home);
      }

      if (isUnauthorized(error) && !isAuthPage) {
        return router.replace(Route.Login);
      }

      if (!payload) {
        return router.replace(Route.Logout);
      }

      dispatch({ type: AuthAction.SignIn, payload });
    }

    setAuthData();

    return () => {
      if (ignore.current === true) {
        getUser.abortController.abort();
      }

      ignore.current = true;
    };
  }, [refetch, router, serverId, isAuthPage]);

  const [auth, dispatch] = useReducer(authContextReducer, authInitialState);

  useEffect(() => {
    auth.emojis.forEach((emojiData) => {
      const isPrivate = emojiData.scope === EmojiScope.Private;

      if (isPrivate && !serverId) {
        EmojiMemoryStorage.delete(emojiData.name);

        return;
      }

      if (isPrivate && emojiData.serverId !== Number(serverId)) {
        EmojiMemoryStorage.delete(emojiData.name);

        return;
      }

      EmojiMemoryStorage.set(new Emoji(emojiData, EmojiType.Custom));
    });
  }, [auth.emojis, serverId]);

  useEffect(() => {
    socket.on(SocketEvent.Block, (blockedUser) => {
      dispatch({ type: AuthAction.BlockUser, payload: blockedUser });
    });

    socket.on(SocketEvent.Unblock, (unblockedUser) => {
      dispatch({ type: AuthAction.UnblockUser, payload: unblockedUser });
    });

    return () => {
      socket.off(SocketEvent.Block);
      socket.off(SocketEvent.Unblock);
    };
  }, [dispatch]);

  useEffect(() => {
    const { member } = auth;

    const onVisibilityChange = () => {
      socket.emit("status", {
        status: document.hidden
          ? ActivityStatus.Offline
          : ActivityStatus.Online,
        serverId: member.serverId,
        memberId: member.id,
      });
    };

    window.addEventListener("visibilitychange", onVisibilityChange);

    socket.on(SocketEvent.JoinPrivateRoom, () => {
      socket.emit(SocketEvent.Status, {
        status: ActivityStatus.Online,
      });
    });

    socket.emit(SocketEvent.JoinPrivateRoom);

    return () => {
      window.removeEventListener("visibilitychange", onVisibilityChange);

      socket.off(SocketEvent.JoinPrivateRoom);
    };
  }, [auth]);

  useEffect(() => {
    if (!auth.isLoggedIn) {
      return;
    }

    let ignore = false;

    socket.on("disconnect", () => {
      if (process.env.NODE_ENV !== "production") {
        return;
      }

      if (!ignore) {
        router.replace(Route.Logout);
      }
    });

    socket.connect();

    return () => {
      ignore = true;

      socket.disconnect();
      socket.off("disconnect");
    };
  }, [router, auth.isLoggedIn]);

  const { style, properties } = useEmojiStyle({ column: 2, size: 48 });

  if (error && error.type !== ErrorType.ResponseStatus) {
    return (
      <div
        style={properties}
        className="flex justify-center items-center flex-col size-full text-white-500"
      >
        <span style={style.mask} className="size-12 flex bg-gray-150"></span>
        <h1 className="text-xl mt-4">Sorry, something went wrong!</h1>
        <p className="text-lg text-center w-full">
          Maybe our app is down or there is some problem with it, contact our
          admin at admin@admin.com
        </p>
      </div>
    );
  }

  if (isNotFound(error)) {
    return <NotFound />;
  }

  return (
    <authContext.Provider value={{ auth, dispatch }}>
      {!auth.isLoggedIn && !pathname.startsWith("/auth") && (
        <Loading className="fixed size-full bg-black-600 z-[999]" />
      )}
      {children}
    </authContext.Provider>
  );
}
