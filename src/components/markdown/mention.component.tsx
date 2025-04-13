import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QueryKey } from "@common/constants";
import { getServer } from "@common/api";
import { useParams } from "next/navigation";
import { PopoverProvider } from "@components/popover/popover.context";
import { PopoverTrigger } from "@components/popover/popover-trigger.component";
import { Popover } from "@components/popover/popover.component";
import { MemberProfilePreview } from "@components/member-profile/member-profile-preview.component";
import { useSafeContext } from "@common/hooks";
import { authContext } from "@common/auth/auth.context";
import { twMerge } from "tailwind-merge";
import { chatContext } from "@components/chat/chat.context";

interface MentionProps {
  id?: number;
  raw: string;
  isRole: boolean;
  isStaticMention: boolean;
}

export function Mention({ id, raw, isRole, isStaticMention }: MentionProps) {
  const { serverId } = useParams();

  const {
    auth: { user },
  } = useSafeContext(authContext);

  const { members, roles } = useSafeContext(chatContext);

  const className = "px-0.5 rounded-xs bg-white-0/8 font-medium";

  if (isStaticMention) {
    return <span className={className}>{raw}</span>;
  }

  const role = roles.find((role) => role.id === id);

  if (!serverId) {
    return raw;
  }

  if (isRole && !role) {
    return raw;
  }

  if (isRole && role) {
    return <span className={className}>{`@${role.name}`}</span>;
  }

  const member = members.find((member) => {
    return member.id === id;
  });

  if (!member) {
    return raw;
  }

  const {
    profile: { displayName },
    userId,
  } = member;

  const isCurrentUser = user.id === userId;

  return (
    <PopoverProvider>
      <PopoverTrigger
        inline
        aria-label={`Open ${member.user.username} profile preview`}
        className={twMerge(
          "cursor-pointer text-(--member-color,rgb(220,220,220))",
          className
        )}
      >
        {`@${displayName}`}
      </PopoverTrigger>{" "}
      <Popover shouldRenderInPortal>
        <MemberProfilePreview
          userId={userId}
          isCurrentUser={isCurrentUser}
          serverId={+serverId}
        />
      </Popover>
    </PopoverProvider>
  );
}
