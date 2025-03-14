import { Server } from "@common/api/schemas/server.schema";
import { ProfileBar } from "@components/profile-preview/profile-bar.component";
import { RtcConnectionBar } from "@components/profile-preview/rtc-connection-bar.component";
import { HTMLProps, PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

interface SidebarProps extends HTMLProps<HTMLElement> {
  server?: Server;
  withFooter?: boolean;
}

export function Sidebar({
  children,
  server,
  withFooter = true,
  className,
  ...attrs
}: PropsWithChildren<SidebarProps>) {
  return (
    <aside
      className={twMerge(
        "text-gray-360 overflow-y-hidden overflow-x-visible flex flex-col bg-black-630 w-full h-[calc(100vh-52px)] max-w-[286px] bottom-0 max-h-screen absolute z-[100]",
        withFooter && "lg:static lg:max-w-[286px] lg:h-full",
        !withFooter && "@3xl:static @3xl:max-w-[286px] @3xl:h-full",
        className
      )}
      {...attrs}
    >
      {children}
      {withFooter && (
        <div className="mt-auto px-1 bg-black-660">
          <RtcConnectionBar />
          <ProfileBar server={server} />
        </div>
      )}
    </aside>
  );
}
