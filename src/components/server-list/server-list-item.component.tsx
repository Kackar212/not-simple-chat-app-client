import { UserServer } from "@common/api/schemas/server.schema";
import { AvatarSize } from "@common/constants";
import { Link } from "@components/link/link.component";
import { ServerIcon } from "@components/server-icon/server-icon.component";

interface ServerListItemProps extends UserServer {
  currentServerId?: string;
  size?: (typeof AvatarSize)[keyof typeof AvatarSize];
}

export function ServerListItem({
  id,
  serverIcon,
  name,
  defaultChannel,
  currentServerId,
  iconPlaceholder,
  size = AvatarSize.XXXL,
}: ServerListItemProps) {
  const isCurrentServer = Number(currentServerId) === id;

  return (
    <li className="relative p-[3px]">
      <Link
        prefetch
        href={`/channels/${id}`}
        optionalPathSegments={[defaultChannel?.id]}
        data-tooltip-id="tooltip"
        data-tooltip-content={name}
        data-tooltip-place="right"
        className={`${
          isCurrentServer && "current-server"
        } transition-[border-radius] duration-300 aria-[current=page]:text-white-500 aria-[current=page]:rounded-[30%] aria-[current=page]:after:h-10 after:hidden after:w-2 after:bg-white-0 aria-[current=page]:after:flex after:absolute after:-left-[6px] md:after:-left-[13px] after:rounded-md after:-translate-x-1/2 size-6 md:size-12 flex items-center justify-center hover:after:flex hover:after:absolute hover:after:w-2 hover:after:h-1/2`}
      >
        <ServerIcon
          server={{ serverIcon, name, id, iconPlaceholder }}
          alt={`Go to ${name} server`}
          size={size}
          className="rounded-[50%] hover:rounded-[30%] transition-[border-radius] duration-300 size-6 md:size-12"
          rounded={false}
        />
      </Link>
    </li>
  );
}
