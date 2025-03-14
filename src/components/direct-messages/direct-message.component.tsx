import { mutations } from "@common/api";
import { useMutation } from "@common/api/hooks/use-mutation.hook";
import { Link } from "@components/link/link.component";
import CallIcon from "/public/assets/icons/call.svg";
import CancelIcon from "/public/assets/icons/close.svg";
import { useRTC } from "@components/channels/use-rtc.hook";
import { AvatarSize } from "@common/constants";
import { Avatar } from "@components/avatar/avatar.component";
import { Recipient } from "@common/api/schemas/user.schema";
import { MouseEventHandler, useCallback, useState } from "react";
import { Loader } from "@components/loader/loader.component";

interface DirectMessageProps {
  id: number;
  isRequestAccepted: boolean;
  recipient: Recipient;
}

export function DirectMessage({
  id,
  recipient: { avatar, displayName, status },
  isRequestAccepted,
}: DirectMessageProps) {
  const [isMouseOver, setIsMouseOver] = useState(false);

  const { mutate: deleteDirectMessageChannel, isPending } = useMutation({
    mutationFn: mutations.deleteDirectMessageChannel,
  });

  const onMouseOver: MouseEventHandler = ({ type }) => {
    setIsMouseOver(true);
  };

  const onMouseLeave: MouseEventHandler = ({ type }) => {
    setIsMouseOver(false);
  };

  const deleteChannel = useCallback(() => {
    deleteDirectMessageChannel({ channelId: id });
  }, [id, deleteDirectMessageChannel]);

  const { members } = useRTC();

  return (
    <li
      className="m-2 relative rounded-md text-gray-150 hover:bg-gray-260/30 hover:text-white-500"
      onMouseEnter={onMouseOver}
      onMouseLeave={onMouseLeave}
    >
      {isPending && (
        <div className="absolute size-full flex justify-center items-center bg-black-1000/40 rounded-md">
          <Loader />
        </div>
      )}
      <Link
        href={`/channels/me/${id}`}
        prefetch
        className=" flex gap-3 p-3 py-2 pr-7 rounded-md text-inherit items-center aria-[current=page]:bg-gray-240/60 aria-[current=page]:font-[500] aria-[current=page]:text-white-500"
        aria-describedby={`call-text-${id}`}
      >
        <Avatar
          src={avatar}
          size={AvatarSize.LG}
          status={status}
          hiddenStatus={!isRequestAccepted}
        />
        <span>{displayName}</span>
        {!!members[id]?.length && (
          <CallIcon className="text-green-700 size-4" aria-hidden />
        )}
      </Link>
      {isMouseOver && (
        <button
          aria-label={`Delete private chat with ${displayName}`}
          className="absolute top-1/2 -translate-y-1/2 mt-[1px] right-4 z-10 text-white-500"
          onClick={deleteChannel}
        >
          <CancelIcon className="size-4" />
        </button>
      )}
      <span aria-live="polite" className="sr-only">
        {isPending && `Chat with ${displayName} is being deleted`}
      </span>
      <span id={`call-text-${id}`}>
        {!!members[id]?.length && "There is call going on"}
      </span>
    </li>
  );
}
