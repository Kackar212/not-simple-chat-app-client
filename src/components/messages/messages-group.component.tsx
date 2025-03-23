import React, { useEffect, useLayoutEffect, useState } from "react";
import { MessageWithBaseUser as MessageEntity } from "@common/api/schemas/message.schema";
import { Message } from "@components/message/message.component";
import { Divider } from "@components/chat/divider.component";
import { Blacklist } from "@common/api/schemas/blacklist.schema";
import { twMerge } from "tailwind-merge";
import { useSafeContext } from "@common/hooks";
import { chatContext } from "@components/chat/chat.context";
import CloseIcon from "/public/assets/icons/close.svg";

interface MessagesGroupProps {
  messages: MessageEntity[];
  blacklist: Blacklist;
}

export function MessagesGroup({
  messages: [{ key, ...message }, ...subMessages],
  blacklist,
}: MessagesGroupProps) {
  const isAuthorBlocked = blacklist.some(
    ({ blocked: { id } }) => message.member.userId === id
  );
  const isSystemGroup = message.isSystemMessage;
  const isHidden = isAuthorBlocked && !isSystemGroup;

  const [isGroupHidden, setIsGroupHidden] = useState(false);

  const { scrollContainerRef, setIsScrollable, skeletonsRef } =
    useSafeContext(chatContext);

  useEffect(() => {
    if (!scrollContainerRef.current) {
      return;
    }

    const skeletonsHeight = skeletonsRef.current?.clientHeight || 0;

    const isScrollable =
      scrollContainerRef.current.scrollHeight - skeletonsHeight >
      scrollContainerRef.current.clientHeight;

    const scrollContainer = scrollContainerRef.current;
    const isAtBottom =
      scrollContainer.scrollHeight ===
      scrollContainer.scrollTop + scrollContainer.clientHeight;

    setIsScrollable((prevIsScrollable) => {
      setTimeout(() => {
        if (isScrollable && !prevIsScrollable && !isAtBottom) {
          scrollContainer.scroll({ top: 99999 });
        }
      });

      return isScrollable;
    });
  }, [scrollContainerRef, isGroupHidden, setIsScrollable, skeletonsRef]);

  useEffect(() => {
    setIsGroupHidden(isHidden);
  }, [isHidden]);

  const Details = isHidden ? "details" : "section";

  return (
    <React.Fragment key={String(key || message.id)}>
      {message.divide && <Divider date={message.createdAt} />}
      <Details
        className={twMerge("group mt-4", isAuthorBlocked && "mt-4")}
        onToggle={({ currentTarget }) => {
          const isDetailsElement = currentTarget instanceof HTMLDetailsElement;

          if (!isDetailsElement) {
            return;
          }

          setIsGroupHidden(!currentTarget.open);
        }}
      >
        {isHidden && (
          <summary
            className={twMerge(
              "px-4 flex marker:content-none mb-0 group-open:mb-4 cursor-pointer text-sm hover:underline"
            )}
          >
            <span className="flex items-center">
              <span>
                <CloseIcon className="mr-4 size-4" />
              </span>
              {subMessages.length + 1} blocked messages.&nbsp;
            </span>
            <span className="">
              {isGroupHidden ? "Show messages" : "Hide messages"}
            </span>
          </summary>
        )}
        <Message isSubMessage={false} {...message} />
        {subMessages.map(({ key: subMessageKey, ...subMessage }) => (
          <Message
            key={String(subMessageKey || subMessage.id)}
            isSubMessage={true}
            {...subMessage}
          />
        ))}
      </Details>
    </React.Fragment>
  );
}
