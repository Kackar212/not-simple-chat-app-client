import { Avatar } from "@components/avatar/avatar.component";
import { Button } from "@components/button/button.component";
import { Link } from "@components/link/link.component";
import { Modal } from "@components/modal/modal.component";
import { PopoverTrigger } from "@components/popover/popover-trigger.component";
import { Popover } from "@components/popover/popover.component";
import { PopoverProvider } from "@components/popover/popover.context";
import { ProfileHeader } from "@components/profile-header/profile-header.component";
import {
  ApiError,
  deleteServer as deleteServerMutation,
  leaveServer as leaveServerMutation,
  mutations,
  QueryResponse,
} from "@common/api";
import { toast } from "react-toastify";
import { useMutation } from "@common/api/hooks/use-mutation.hook";
import { useSafeContext } from "@common/hooks";
import { authContext } from "@common/auth/auth.context";
import { useRouter } from "next/navigation";
import { BaseServer, Server } from "@common/api/schemas/server.schema";
import { useModal } from "@components/modal/use-modal.hook";
import { useState } from "react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { MemberProfile } from "@components/member-profile/member-profile.component";
import { twMerge } from "tailwind-merge";
import { ServerIcon } from "@components/server-icon/server-icon.component";
import { formatCount, plural } from "@common/utils";
import { AvatarSize } from "@common/constants";
import { ActivityStatus } from "@common/enums/activity-status.enum";
import { Menu } from "@components/menu/menu.component";
import { UserStatus } from "@components/user-status/user-status.component";
import { AuthAction } from "@common/auth/auth-action.enum";
import ChevronIcon from "/public/assets/icons/chevron.svg";
import PencilIcon from "/public/assets/icons/pencil.svg";
import LeaveIcon from "/public/assets/icons/leave.svg";
import TrashBinIcon from "/public/assets/icons/trash-bin.svg";

interface ProfilePreviewPopoverProps {
  server?: Server;
}

export function ProfilePreviewPopover({ server }: ProfilePreviewPopoverProps) {
  const {
    auth: { user, member, ...auth },
    dispatch,
  } = useSafeContext(authContext);

  const queryClient = useQueryClient();

  const profile = {
    ...user,
    ...member,
    memberId: member.id,
    isBlocked: false,
    joinedServerAt: user.createdAt,
    roles: [],
    status: member.profile.isInvisible
      ? ActivityStatus.Invisible
      : member.profile.status,
    isInvisible: member.profile.isInvisible,
  };

  const router = useRouter();

  const { close, ref, isOpen, open } = useModal();
  const {
    close: closeProfile,
    ref: profileRef,
    isOpen: isProfileOpen,
    open: openProfile,
  } = useModal();

  const openLeaveServerConfirmModal = async () => {
    open();
  };

  const [isMouseOver, setIsMouseOver] = useState(false);

  const onMouseEnter = () => setIsMouseOver(true);
  const onMouseLeave = () => setIsMouseOver(false);

  const {
    mutateAsync,
    isPending,
    data: { status },
  } = useMutation({
    mutationFn: member.isOwner ? deleteServerMutation : leaveServerMutation,
    async onSuccess({ error }) {
      if (!server) {
        return;
      }

      if (error) {
        toast.error(
          `You could not ${member.isOwner ? "delete" : "leave"} ${server.name}`
        );

        close();

        return;
      }

      toast.success(
        `You ${member.isOwner ? "deleted" : "left"} ${server.name}`
      );

      queryClient.setQueryData(
        ["get-user-servers"],
        (old: QueryResponse<BaseServer[], ApiError>) => {
          if (!old) {
            return old;
          }

          return {
            ...old,
            data:
              old.data?.filter(({ id: serverId }) => server.id !== serverId) ||
              old.data,
          };
        }
      );

      queryClient.invalidateQueries({ queryKey: ["get-user-servers"] });

      setTimeout(async () => {
        router.replace("/channels/me/friends");
      }, 500);
    },
  });

  const formattedDate = format(user.createdAt, "dd MMM, y");
  const joinedServerAt = user.createdAt && format(user.createdAt, "dd MMM, y");

  const { mutate } = useMutation({
    mutationFn: mutations.updateProfile,
    onMutate({ status = null, isInvisible = false }) {
      dispatch({
        type: AuthAction.SignIn,
        payload: {
          ...auth,
          user: {
            ...user,
            status: !status ? ActivityStatus.Online : user.status,
            specialStatus: !status ? status : user.specialStatus,
            isInvisible,
          },
          member: {
            ...member,
            user: {
              ...member.user,
              status: !status ? ActivityStatus.Online : member.user.status,
              specialStatus: !status ? status : member.user.specialStatus,
              isInvisible,
            },
            profile: {
              ...member.profile,
              status: !status ? ActivityStatus.Online : member.profile.status,
              specialStatus: !status ? status : member.profile.specialStatus,
              isInvisible,
            },
          },
        },
      });
    },
  });

  const items = [
    {
      label: (
        <span className="flex leading-none items-center gap-1">
          <UserStatus
            containerClassName="static inline-block mr-1"
            status={ActivityStatus.Online}
            size={12}
          />{" "}
          {ActivityStatus.Online}
        </span>
      ),
      action() {
        mutate({
          status: null,
          profileId: member.profile.id,
          serverId: server?.id,
        });
      },
      checked: profile.status === ActivityStatus.Online,
      role: "menuitemradio",
    },
    {
      label: (
        <span className="flex leading-none items-center gap-1">
          <UserStatus
            containerClassName="static inline-block mr-1"
            status={ActivityStatus.Offline}
            size={12}
          />{" "}
          {ActivityStatus.Invisible}
        </span>
      ),
      action() {
        mutate({
          isInvisible: true,
          profileId: member.profile.id,
          serverId: server?.id,
        });
      },
      checked: profile.isInvisible,
      role: "menuitemradio",
    },
  ];

  const openButtonProps = {
    label: (
      <span className="flex items-center w-full justify-between">
        {profile.status} <ChevronIcon className="-rotate-90" />
      </span>
    ),
    Icon: (
      <UserStatus
        containerClassName="static"
        status={profile.status}
        size={12}
      />
    ),
    isSrOnly: false,
    size: 32,
    className:
      "flex flex-row-reverse hover:bg-black-560 shadow-none font-normal text-base justify-end gap-2 items-center text-white-500 shadow-header rounded-md w-full p-2 py-1",
  };

  const membersCount = server?.members.length || 0;

  return (
    <div className="flex items-start text-white-500 gap-2 bg-black-660">
      <PopoverProvider offset={{ mainAxis: 15 }}>
        <PopoverTrigger
          className="grid grid-cols-[32px_minmax(80px,1fr)] min-w-[120px] items-center justify-start text-left hover:bg-gray-260/30 p-1.5 rounded-md gap-1.5"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          aria-label="Open your profile preview"
        >
          <Avatar src={user.avatar} size={AvatarSize.LG} alt="" />
          <div className="flex flex-col relative" aria-hidden="true">
            <span className="text-sm font-semibold text-white-0 whitespace-nowrap text-ellipsis overflow-hidden top-0 relative w-full">
              {member.profile.displayName}
            </span>
            <span className="text-xs font-thin text-gray-330 whitespace-nowrap text-ellipsis overflow-hidden relative bottom-0 w-full">
              {isMouseOver ? user.username : profile.status}
            </span>
          </div>
        </PopoverTrigger>
        <Popover>
          <section
            className={twMerge(
              "min-w-72 max-w-xs w-1/4 bg-black-800 text-black-800 overflow-auto scrollbar rounded-md border-[1px] border-white-0/15",
              isProfileOpen && "opacity-0"
            )}
            aria-label="Your profile preview"
          >
            <ProfileHeader
              user={profile}
              isCurrentUser
              openProfile={openProfile}
            />
            <div className="flex flex-col bg-black-630 rounded-md p-3 gap-2 mx-4 mt-4 text-white-500">
              <h3 className="text-xs font-semibold">Member since</h3>
              <div className="flex gap-2 items-center">
                <time className="text-xs" dateTime={user.createdAt}>
                  {formattedDate}
                </time>
                {joinedServerAt && (
                  <>
                    <span className="flex size-1 rounded-[50%] bg-white-0"></span>
                    <time className="text-xs" dateTime={user.createdAt}>
                      {joinedServerAt}
                    </time>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1 p-4 my-2 text-white-500">
              <div className="bg-black-630 p-2 mb-1 gap-2 flex flex-col rounded-md">
                <div>
                  <Link
                    href={`/settings/overview`}
                    className="flex gap-2 bg-black-630 items-center p-2 py-1 rounded-md hover:bg-black-560"
                  >
                    <PencilIcon className="size-4" aria-hidden />
                    Edit profile
                  </Link>
                </div>
                <hr className="border-black-500" />
                <div>
                  <Menu
                    placement="right-end"
                    className="rounded-md bg-black-700"
                    tooltip="Set status"
                    offset={{ alignmentAxis: -70, mainAxis: 20 }}
                    items={items}
                    openButton={openButtonProps}
                  />
                </div>
              </div>
              <div className="bg-black-630 p-2 mb-1 gap-2 flex flex-col rounded-md">
                {server && member.isOwner && (
                  <Button
                    onClick={openLeaveServerConfirmModal}
                    className="capitalize text-base items-center w-full flex gap-2 p-2 py-1 text-red-500 bg-black-630 rounded-md hover:bg-black-560"
                  >
                    <TrashBinIcon className="size-4" aria-hidden />
                    <span>
                      Delete <span className="sr-only">{server.name}</span>{" "}
                      server
                    </span>
                  </Button>
                )}
                <hr className="border-black-500" />
                {server && !member.isOwner && (
                  <Button
                    onClick={openLeaveServerConfirmModal}
                    className="capitalize text-base items-center w-full flex gap-2 text-red-500 p-2 py-1 bg-black-630 rounded-md hover:bg-black-560"
                  >
                    <LeaveIcon className="size-4" aria-hidden />
                    <span>
                      Leave <span className="sr-only">{server.name}</span>{" "}
                      server
                    </span>
                  </Button>
                )}

                <Link
                  href={`/auth/logout`}
                  className="flex gap-2 items-center text-red-500 bg-black-630 p-2 py-1 rounded-md hover:bg-black-560"
                >
                  <LeaveIcon className="size-4" aria-hidden />
                  Logout
                </Link>
              </div>
            </div>
          </section>
        </Popover>
      </PopoverProvider>
      {server && (
        <Modal
          ref={ref}
          isOpen={isOpen}
          close={close}
          role="alertdialog"
          className="py-4"
          aria-label="Confirmation"
          aria-describedby="leave-server-description"
        >
          <h2
            id="leave-server-description"
            className="text-xl text-center mt-4"
          >
            Are you sure you want to {member.isOwner ? "delete" : "leave"}{" "}
            {server.name}?
          </h2>
          <section
            aria-label="Server"
            className="flex relative bg-black-660 p-4 gap-2 rounded-md mt-2"
          >
            <ServerIcon
              server={server}
              containerClassName="absolute"
              size={AvatarSize.XL}
            />
            <div className="flex flex-col">
              <span className="leading-5">{server.name}</span>
              <span className="sr-only">
                {formatCount(membersCount, plural.member)}
              </span>
              <span aria-hidden className="leading-5 text-gray-360">
                Members — {membersCount}
              </span>
            </div>
          </section>
          <div className="flex mt-2 gap-2 justify-end">
            <Button
              onClick={close}
              className="px-8 font-semibold capitalize text-white-500 inline-flex w-auto self-center rounded-md"
            >
              No
            </Button>
            <Button
              isLoading={isPending}
              mutationResult={status}
              onClick={() => {
                mutateAsync(server.id);
              }}
              className="bg-red-600 hover:bg-red-700 px-8 font-semibold capitalize text-white-500 inline-flex w-auto self-center rounded-md"
            >
              Yes
            </Button>
          </div>
        </Modal>
      )}
      <MemberProfile
        isOpen={isProfileOpen}
        close={closeProfile}
        modal={profileRef}
        userId={user.id}
        serverId={server?.id}
        isCurrentUser={true}
      />
    </div>
  );
}
