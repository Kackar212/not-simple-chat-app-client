import { deleteMessage, getMessages } from "@common/api";
import { MessageWithBaseUser as MessageEntity } from "@common/api/schemas/message.schema";
import { Avatar } from "@components/avatar/avatar.component";
import { formatRelative } from "date-fns";
import { MessageContent } from "./message-content.component";
import { MouseEvent, useCallback, useState } from "react";
import { authContext } from "@common/auth/auth.context";
import { useSafeContext } from "@common/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";
import { Loader } from "@components/loader/loader.component";
import { MessageType } from "@common/enums/message-type.enum";
import { MemberProfilePreview } from "@components/member-profile/member-profile-preview.component";
import { Popover } from "@components/popover/popover.component";
import { PopoverTrigger } from "@components/popover/popover-trigger.component";
import { PopoverProvider } from "@components/popover/popover.context";
import { MessageDate } from "./message-date.component";
import { chatContext } from "@components/chat/chat.context";
import { decode } from "html-entities";
import { toast } from "react-toastify";
import { AvatarSize, QueryKey } from "@common/constants";
import { Direction } from "@common/api/hooks";
import PinIcon from "/public/assets/icons/pin.svg";

interface MessageProps extends MessageEntity {
  isSubMessage: boolean;
  withActions?: boolean;
}

export function Message(message: MessageProps) {
  const {
    id,
    type,
    member,
    attachments,
    createdAt,
    message: content,
    channelId,
    isSubMessage,
    isPinned,
    withActions = true,
    messageReference,
    reactions,
    editedAt,
    embeds,
    poll,
  } = message;

  const { openPinnedMessages, setMessageReference } =
    useSafeContext(chatContext);

  const { serverId, user, profile } = member;

  const { displayName, avatar, username } = { ...user, ...profile };

  const deleteMessageMutation = useMutation({
    mutationKey: ["delete-message", id],
    mutationFn: deleteMessage,
    onSuccess({ status: { isSuccess } }) {
      if (!isSuccess) {
        toast.error("You cant delete this message!");

        return;
      }

      if (!setIsHidden) {
        return;
      }

      setIsHidden(true);
    },
  });

  const [isEdited, setIsEdited] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isMouseOver, setIsMouseOver] = useState(false);

  const {
    auth: { user: currentUser, blacklist },
  } = useSafeContext(authContext);

  const messageCreatedAt = formatRelative(createdAt, new Date());
  const isCurrentUserAuthor = currentUser.username === username;

  const reply = useCallback(() => {
    setMessageReference(message);
  }, [message, setMessageReference]);

  const popover = (
    <PopoverProvider>
      <PopoverTrigger className="text-sm text-white-500 hover:underline leading-[1.25rem] font-medium">
        {displayName}
      </PopoverTrigger>{" "}
      <Popover>
        <MemberProfilePreview
          userId={user.id}
          isCurrentUser={isCurrentUserAuthor}
          serverId={serverId}
        />
      </Popover>
    </PopoverProvider>
  );

  const onMouseEnter = useCallback(() => {
    setIsMouseOver(true);
  }, []);

  const onMouseLeave = useCallback(() => {
    setIsMouseOver(false);
  }, []);

  const queryClient = useQueryClient();

  const jumpTo = useCallback(
    async (e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
      e.preventDefault();

      const { currentTarget } = e;

      const id = Number(currentTarget.dataset.id);

      if (Number.isNaN(id)) {
        throw new Error(
          "data-id with message id does not exists on clicked element!"
        );
      }

      const message = document.querySelector(`main .message[data-id="${id}"]`);

      if (message) {
        message.scrollIntoView({ block: "center" });

        return;
      }

      const { data } = await getMessages({
        channelId,
        around: id,
      });

      queryClient.setQueryData(QueryKey.Messages(channelId), (old) => {
        return {
          pageParams: [
            {
              direction: Direction.Next,
              cursor: undefined,
              around: true,
            } as const,
          ],
          pages: [
            {
              data,
              status: {
                isError: false,
                isSuccess: true,
                errorMessage: "",
                successMessage: "",
              },
              error: null,
            },
          ],
        };
      });

      setTimeout(() => {
        document
          .querySelector(`main .message[data-id="${id}"]`)
          ?.scrollIntoView({ block: "center" });
      }, 50);
    },
    [channelId, queryClient]
  );

  if (
    type === MessageType.UserStartedVoiceCall ||
    type === MessageType.VoiceCallEnded
  ) {
    return (
      <div
        className="flex items-center text-gray-150 text-sm min-h-[26px] ml-6 mr-2"
        data-id={id}
      >
        <div className="size-6 mr-2 text-gray-150">
          <svg viewBox="0 0 80 80" width={24} height={24}>
            <rect
              mask="url(#call-system-message)"
              className="size-full fill-green-600"
            ></rect>
          </svg>
        </div>
        <div className="text-gray-360">
          <span className="text-black-800">
            {popover}
            <span className="text-gray-360"> {content}</span>
          </span>
          <time
            dateTime={createdAt}
            className="ml-2 text-xs text-gray-300 lowercase first-letter:capitalize"
          >
            <span>{messageCreatedAt}</span>
          </time>
        </div>
      </div>
    );
  }

  if (
    type === MessageType.ReplyToPinnedMessage ||
    type === MessageType.UserPinnedMessage
  ) {
    return (
      <div
        className="flex items-center text-gray-150 text-sm min-h-[26px] ml-6 mr-2 first"
        data-id={id}
      >
        <PinIcon aria-hidden className="size-4 mr-4" />
        <span className="sr-only">User</span>
        <div className="text-gray-360">
          <span className="text-black-800">{popover}</span> pinned a{" "}
          <span className="sr-only">message</span>
          <button className="font-semibold text-white-500 hover:underline">
            <span className="sr-only">go to message</span>
            <span aria-hidden>message. </span>
          </button>{" "}
          <span aria-hidden>See all </span>
          <button className="mr-2 hover:underline" onClick={openPinnedMessages}>
            <span className="font-semibold text-white-500">
              <span className="sr-only">See all</span>
              pinned messages
            </span>
          </button>
          <time
            dateTime={createdAt}
            className="text-xs text-gray-300 lowercase first-letter:capitalize"
          >
            <span>{messageCreatedAt}</span>
          </time>
        </div>
      </div>
    );
  }

  const isReferenceAuthorBlocked = blacklist.some(
    ({ blocked: { id } }) => messageReference?.member.user.id === id
  );

  return (
    !isHidden && (
      <>
        <motion.div
          data-id={id}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, height: 0 }}
          onPointerEnter={onMouseEnter}
          onPointerLeave={onMouseLeave}
          className={twMerge(
            "relative px-1.5 lg:px-4 py-0.5 message hover:bg-black-900/5",
            isEdited && "bg-black-630/50 rounded-md py-3 my-1",
            !withActions && "py-2 items-center"
          )}
        >
          {deleteMessageMutation.isPending && (
            <div className="flex bg-black-700/60 absolute size-full z-10 justify-center items-center">
              <Loader />
            </div>
          )}
          {messageReference && (
            <div className="relative mb-[2px] flex flex-col *:hover:border-white-500 text-gray-150 *:hover:text-white-500">
              <button
                data-id={messageReference.id}
                className="before:absolute before:size-full before:z-50 before:left-0 before:top-0"
                onClick={jumpTo}
              >
                <span className="sr-only">Jump to this comment</span>
              </button>
              <div className="absolute left-[1.125rem] top-3 border-t-2 border-l-2 border-gray-260 rounded-tl-md w-8 h-3 transition-colors"></div>
              <div className="flex items-center text-inherit gap-1 text-xs py-1 pb-0.5 pl-14 w-full rounded-md transition-colors">
                <div
                  className={twMerge(
                    isReferenceAuthorBlocked &&
                      "rounded-[50%] bg-black-700 size-5"
                  )}
                >
                  {!isReferenceAuthorBlocked && (
                    <Avatar
                      src={messageReference.member.user.avatar}
                      size={AvatarSize.SM}
                    />
                  )}
                </div>
                <span
                  className="font-medium whitespace-nowrap"
                  style={{
                    color: messageReference.member.roles[0]?.role.color,
                  }}
                >
                  {messageReference.member.user.displayName}
                </span>
                <span className="ml-1 relative h-4 w-full">
                  <span className="whitespace-nowrap block top-0 w-full overflow-hidden text-ellipsis">
                    {isReferenceAuthorBlocked
                      ? "Blocked message"
                      : decode(messageReference.message)}
                  </span>
                </span>
              </div>
            </div>
          )}
          <div
            className={twMerge(
              "relative",
              isSubMessage && "pl-[38px] lg:pl-[56px]"
            )}
          >
            {!isSubMessage && (
              <div
                className="flex gap-1.5 lg:gap-4 relative"
                data-message-id={id}
              >
                <Avatar
                  src={avatar}
                  size={AvatarSize.XL}
                  className="size-8 lg:size-10"
                  containerClassName="block absolute top-0.5"
                />
                <div className="flex flex-col w-full pl-[38px] lg:pl-[56px]">
                  <div className="@md:gap-1 flex flex-col-reverse @md:flex-row items-baseline text-black-800 mb-0.5">
                    {popover}
                    <MessageDate date={createdAt} />
                  </div>
                  <MessageContent
                    channelId={channelId}
                    id={id}
                    type={type}
                    message={content}
                    createdAt={createdAt}
                    attachments={attachments}
                    isCurrentUserAuthor={isCurrentUserAuthor}
                    isMouseOver={isMouseOver}
                    isEdited={isEdited}
                    isPinned={isPinned}
                    editedAt={editedAt}
                    setIsEdited={setIsEdited}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    deleteMessage={() => {
                      deleteMessageMutation.mutate(id);
                    }}
                    setMessageReference={reply}
                    withActions={withActions}
                    reactions={reactions}
                    embeds={embeds}
                    jumpTo={jumpTo}
                    poll={poll}
                  />
                </div>
              </div>
            )}
            {isSubMessage && (
              <MessageContent
                channelId={channelId}
                id={id}
                type={type}
                message={content}
                editedAt={editedAt}
                attachments={attachments}
                isCurrentUserAuthor={isCurrentUserAuthor}
                createdAt={createdAt}
                isSubMessage={true}
                isMouseOver={isMouseOver}
                isEdited={isEdited}
                isPinned={isPinned}
                setIsEdited={setIsEdited}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                deleteMessage={() => {
                  deleteMessageMutation.mutate(id);
                }}
                setMessageReference={reply}
                withActions={withActions}
                reactions={reactions}
                embeds={embeds}
                jumpTo={jumpTo}
                poll={poll}
              />
            )}
          </div>
        </motion.div>
      </>
    )
  );
}
