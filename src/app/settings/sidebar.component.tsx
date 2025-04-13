import { PropsWithChildren } from "react";
import { Back } from "./[serverId]/back.component";
import { TextLink } from "@components/link/text-link.component";
import ChevronIcon from "/public/assets/icons/chevron.svg";

interface SidebarProps {
  serverId: string;
}

export function Sidebar({
  children,
  serverId,
}: PropsWithChildren<SidebarProps>) {
  return (
    <div className="flex h-full grow justify-end bg-black-660/80">
      <Back />
      <TextLink
        href={`/channels/${serverId}`}
        className="inline-flex items-center text-gray-360 font-medium underline"
      >
        <ChevronIcon className="rotate-90 size-5 mt-0.5" /> Go to server
      </TextLink>
      <nav
        aria-label="Settings navigation"
        className="px-4 pt-14 text-gray-150 font-medium"
      >
        <div className="w-full min-w-36 max-w-3xs h-full">{children}</div>
      </nav>
    </div>
  );
}
