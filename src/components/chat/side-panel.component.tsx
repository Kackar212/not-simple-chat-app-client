import { useSafeContext } from "@common/hooks";
import { chatContext } from "./chat.context";
import { Members } from "@components/members/members.component";
import { MemberProfilePreview } from "@components/member-profile/member-profile-preview.component";
import { Server } from "@common/api/schemas/server.schema";
import { Recipient } from "@common/api/schemas/user.schema";
import { useQuery } from "@common/api/hooks/use-query.hook";
import { getMutualData } from "@common/api";
import { useEffect, useMemo } from "react";
import { socket, SocketEvent } from "@common/socket";
import { Sidebar } from "@components/sidebar/sidebar.component";
import { twMerge } from "tailwind-merge";

interface SidePanel {
  server?: Server;
  recipient?: Recipient;
  queryKey: unknown[];
}

export function SidePanel({ server, recipient, queryKey }: SidePanel) {
  const { isSidePanelHidden } = useSafeContext(chatContext);

  if (server && isSidePanelHidden) {
    return <Members users={server.members} server={server} />;
  }

  if (!recipient) {
    return;
  }

  return (
    <Sidebar
      withFooter={false}
      aria-label="Recipient profile"
      className={twMerge("z-[106] right-0", isSidePanelHidden && "hidden")}
    >
      <div className="text-black-700 h-full bg-black-700">
        <MemberProfilePreview
          isStatic
          isProfileOpen={!isSidePanelHidden}
          userId={recipient.id}
          isCurrentUser={false}
        />
      </div>
    </Sidebar>
  );
}
