import { Invite } from "@/app/invite/[inviteId]/invite.component";
import { getServerByInviteId } from "@common/api";
import { getSessionId } from "@common/auth/auth.utils";
import { Avatar } from "@components/avatar/avatar.component";
import { Button } from "@components/button/button.component";
import Image from "next/image";
import { notFound } from "next/navigation";

interface InvitePageProps {
  params: Promise<{
    inviteId: string;
  }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { inviteId } = await params;
  const { data } = await getServerByInviteId({
    inviteId,
    sessionId: await getSessionId(),
  });

  if (!data) {
    notFound();
  }

  const {
    id,
    serverIcon,
    iconPlaceholder,
    name: serverName,
    membersCount,
    onlineMembersCount,
    offlineMembersCount,
    defaultChannel,
  } = data;

  return (
    <Invite
      serverIcon={serverIcon}
      serverName={serverName}
      membersCount={membersCount}
      onlineMembersCount={onlineMembersCount}
      offlineMembersCount={offlineMembersCount}
      serverId={id}
      channelId={defaultChannel.id}
      iconPlaceholder={iconPlaceholder}
    />
  );
}
