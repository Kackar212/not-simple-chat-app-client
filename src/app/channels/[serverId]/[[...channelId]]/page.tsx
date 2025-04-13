import Channel from "./channel.component";
import { getQueryClient } from "@/app/get-query-client";
import { Direction } from "@common/api/hooks";
import { getMessages } from "@common/api";
import { QueryKey } from "@common/constants";
import { Suspense } from "react";
import { cookies } from "next/headers";

interface LayoutProps {
  params: Promise<{
    channelId: string[];
    serverId: string;
  }>;
}

export default async function Layout({ params }: LayoutProps) {
  const cookieStore = await cookies();
  const routeParams = await params;
  const channelId = routeParams.channelId?.[0];

  const messages = getMessages({
    channelId: Number(channelId),
    sessionId: cookieStore.get("connect.sid")?.value,
  });

  return <Channel params={routeParams} messages={messages} />;
}
