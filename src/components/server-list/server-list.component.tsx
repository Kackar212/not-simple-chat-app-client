"use client";

import { getUserServers } from "@common/api";
import { createConfig } from "@common/use-form.config";
import { PlusIcon } from "@components/icons";
import { Modal } from "@components/modal/modal.component";
import { useModal } from "@components/modal/use-modal.hook";
import { PropsWithChildren, useEffect, useLayoutEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { useParams, usePathname } from "next/navigation";
import { ServerListItem } from "@components/server-list/server-list-item.component";
import { serverNameSchema } from "@common/zod/server-name.schema";
import { UserServer } from "@common/api/schemas/server.schema";
import { Link } from "@components/link/link.component";
import { CreateServerForm } from "@components/create-server-form/create-server-form.component";
import { useSafeContext } from "@common/hooks";
import { authContext } from "@common/auth/auth.context";
import { useQuery } from "@common/api/hooks/use-query.hook";
import { Loader } from "@components/loader/loader.component";
import { layoutContext } from "@common/context/layout.context";
import { twMerge } from "tailwind-merge";
import { Icon } from "@components/icon/icon.component";
import { AvatarSize } from "@common/constants";

const CreateServerSchema = z
  .object({
    name: serverNameSchema,
    serverIcon: z.unknown().refine((file) => {
      if (file instanceof File) {
        return file.size / 1024 < 256;
      }

      return true;
    }, "File size must be less or equal to 256kb"),
  })
  .required();

type CreateServerSchemaType = z.infer<typeof CreateServerSchema>;

export function ServerList({ children }: PropsWithChildren) {
  const { ref: modal, open, close, isOpen } = useModal();
  const {
    auth: { pendingFriends, isLoggedIn },
  } = useSafeContext(authContext);
  const [isMounted, setIsMounted] = useState(false);
  const { isSidebarOpen } = useSafeContext(layoutContext);
  const [isMobile, setIsMobile] = useState(false);

  useLayoutEffect(() => {
    const query = matchMedia("(width <= 768px)");

    const onChange = ({ matches }: MediaQueryListEvent) => {
      setIsMobile(matches);
    };

    query.addEventListener("change", onChange);

    setIsMobile(query.matches);

    return () => {
      query.removeEventListener("change", onChange);
    };
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["get-user-servers"],
    queryFn: () => getUserServers(),
    enabled: isLoggedIn,
  });
  const { data: servers = [] } = data;

  const { serverId } = useParams<{ serverId: string }>() || {};

  const useFormData = useForm<CreateServerSchemaType>(
    createConfig(CreateServerSchema)
  );

  const [isMouseOver, setIsMouseOver] = useState(false);

  const isFriendsPage = usePathname().startsWith("/channels/me");
  const friendsPageLinkActiveClassNames =
    "aria-[current=page]:after:flex aria-[current=page]:text-white-500 aria-[current=page]:bg-green-500 aria-[current=page]:rounded-[25%]";

  const onMouseOver = () => {
    setIsMouseOver(true);
  };
  const onMouseOut = () => {
    setIsMouseOver(false);
  };

  const size = isMobile ? 24 : 48;

  return (
    <>
      <div className="overflow-hidden bg-black-700 min-h-screen flex flex-col items-center py-4 min-w-10 md:min-w-20 z-[100]">
        <div className="pb-4 relative">
          <Icon
            width={size}
            height={size}
            badgeCount={pendingFriends}
            shape={isMouseOver || isFriendsPage ? "squircle" : "circle"}
          >
            <Link
              href="/channels/me/friends"
              onMouseEnter={onMouseOver}
              onMouseLeave={onMouseOut}
              prefetch
              data-tooltip-id="tooltip"
              data-tooltip-content="Direct messages"
              className={twMerge(
                "after:hidden after:absolute after:w-2 after:h-full after:-left-4 after:rounded-md after:bg-white after:-translate-x-1/2 size-6 md:size-12 text-green-500 flex items-center justify-center bg-black-600 rounded-[50%] hover:rounded-[25%] hover:bg-green-500 hover:text-white-500 transition-[color,background,border-radius] duration-300",
                friendsPageLinkActiveClassNames,
                isFriendsPage &&
                  "after:flex rounded-[25%] text-white-500 bg-green-500"
              )}
              aria-label="Friends"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden={true}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="size-3 md:size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                />
              </svg>
            </Link>
          </Icon>
        </div>
        <div className="before:block after:m-auto before:m-auto after:block before:h-[1px] after:h-[1px] before:bg-black-300 after:bg-black-300 before:w-3/4 after:w-3/4 before:mb-4 after:mt-4">
          {servers.length > 0 && (
            <nav
              aria-label="Your servers"
              className="overflow-auto scrollbar scrollbar-thin w-full mb-4"
            >
              <div className="max-h-[calc(100vh-4rem-4*48px-2px)]">
                <ul className="flex flex-col items-center gap-4">
                  {isLoading && (
                    <li>
                      <Loader className="left-0 right-0 bottom-0 top-0" />
                      <span className="sr-only">Loading servers</span>
                    </li>
                  )}
                  {servers.map((server) => (
                    <ServerListItem
                      {...server}
                      key={server.id}
                      currentServerId={serverId}
                      size={isMobile ? AvatarSize.MD : AvatarSize.XXXL}
                    />
                  ))}
                </ul>
              </div>
            </nav>
          )}
          <div className="px-2 md:px-4">
            <button
              aria-label="Create server"
              data-tooltip-id="tooltip"
              data-tooltip-content="Create server"
              onClick={open}
              className="size-6 md:size-12 p-[3px] text-green-500 flex items-center justify-center bg-black-600 rounded-[50%] hover:rounded-[25%] hover:bg-green-500 hover:text-white-500 transition-[color,background,border-radius] duration-300"
            >
              <span aria-hidden={true}>
                <PlusIcon className="size-3 md:size-6" />
              </span>
            </button>
          </div>
        </div>
        <Modal ref={modal} close={close} isOpen={isOpen}>
          <FormProvider {...useFormData}>
            <CreateServerForm close={close} />
          </FormProvider>
        </Modal>
      </div>
    </>
  );
}
