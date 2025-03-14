import { getMessages } from "@common/api";
import { PropsWithChildren } from "react";
import { cookies } from "next/headers";
import DM from "./dm.component";

interface DirectMessageChannel {
  params: Promise<{
    channelId: string;
  }>;
}

export default async function DirectMessageChannel({
  params,
}: DirectMessageChannel) {
  const cookieStore = await cookies();
  const routeParams = await params;
  const messages = getMessages({
    channelId: Number(routeParams.channelId),
    sessionId: cookieStore.get("connect.sid")?.value,
  });

  return <DM messages={messages} params={params} />;
}
