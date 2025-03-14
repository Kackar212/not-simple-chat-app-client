import Channel from "./channel.component";
import { getQueryClient } from "@/app/get-query-client";
import { Direction } from "@common/api/hooks";
import { getMessages } from "@common/api";
import { QueryKey } from "@common/constants";
import { Suspense } from "react";

interface LayoutProps {
  params: Promise<{
    channelId: string[];
    serverId: string;
  }>;
}

export default async function Layout({ params }: LayoutProps) {
  const routeParams = await params;

  const messages = getMessages({ channelId: Number(routeParams.channelId[0]) });

  return <Channel params={routeParams} messages={messages} />;
}
