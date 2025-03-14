import { getUser } from "@common/api";
import { getSessionId } from "@common/auth/auth.utils";
import { SESSION_COOKIE_NAME } from "@common/constants";
import { cookies } from "next/headers";
import { NextRequest, NextResponse, URLPattern } from "next/server";

export function getUrlParams(url: string, key: string): string | undefined;
export function getUrlParams(
  url: string,
  key?: undefined
): Record<string, string>;
export function getUrlParams(
  url: string,
  key?: string | undefined
): string | undefined | Record<string, string | undefined> {
  const urlPattern = new URLPattern({
    pathname: "/:channels/:serverId/:channelId",
  });

  if (!url) {
    throw new Error();
  }

  const input = url.split("?")[0];

  const patternResult = urlPattern.exec(input);
  if (patternResult !== null && "pathname" in patternResult) {
    const params = patternResult.pathname.groups;

    if (key) {
      return params[key] as string;
    }

    return params;
  }

  return {};
}

export async function middleware({
  nextUrl: { pathname, origin },
  cookies,
}: NextRequest) {
  const isUserLoggedIn = cookies.get(SESSION_COOKIE_NAME);
  const isLogoutPage = pathname.startsWith("/auth/logout");
  const isResetPassword = pathname.startsWith("/auth/reset-password");

  if (isLogoutPage && !isUserLoggedIn) {
    return NextResponse.redirect(new URL("/auth/login", origin));
  }

  if (isLogoutPage || (isResetPassword && isUserLoggedIn)) {
    return;
  }

  if (pathname.startsWith("/auth/") && isUserLoggedIn) {
    return NextResponse.redirect(new URL("/channels/me/friends", origin));
  }

  if (pathname.startsWith("/channels/") && !isUserLoggedIn) {
    return NextResponse.redirect(new URL("/auth/login", origin));
  }
}

export const config = {
  matcher: ["/((?!chat/api|_next|favicon.ico|socket.io|public).*)"],
};
