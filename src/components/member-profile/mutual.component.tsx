import { createURL } from "@common/api";
import { AvatarSize } from "@common/constants";
import { Avatar } from "@components/avatar/avatar.component";
import { Link } from "@components/link/link.component";
import { ServerIcon } from "@components/server-icon/server-icon.component";

interface MutualProps {
  channelId?: number;
  id?: number | string;
  src: string | null;
  name: string;
  displayName: string;
  iconPlaceholder?: `data:image/${string};base64,${string}` | null;
}

export function Mutual({
  id = "me",
  channelId,
  src,
  name,
  displayName,
  iconPlaceholder = null,
}: MutualProps) {
  const href = createURL({
    endpoint: "/channels/[id]/[channelId]",
    base: window.location.origin,
    params: { id, channelId },
  });

  return (
    <Link
      href={`/channels/${id}`}
      optionalPathSegments={[channelId === -1 ? undefined : channelId]}
      className="flex gap-2 hover:bg-gray-260/30 rounded-[4px] p-1"
      aria-label={`Go to ${name} ${id === "me" ? "private channel" : "server"}`}
    >
      <ServerIcon
        server={{ name, iconPlaceholder, serverIcon: src, id: +id }}
        size={AvatarSize.XL}
        className="rounded-xl hover:rounded-xl"
      />
      <div className="flex flex-col justify-center gap-1">
        <span className="text-white-500 font-medium leading-5">{name}</span>
        {displayName && (
          <span className="text-xs text-gray-150">{displayName}</span>
        )}
      </div>
    </Link>
  );
}
