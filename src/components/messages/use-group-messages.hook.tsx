import { MessageWithBaseUser } from "@common/api/schemas/message.schema";
import { MessageType } from "@common/enums/message-type.enum";
import { differenceInCalendarDays, differenceInMinutes } from "date-fns";
import { useMemo } from "react";

enum GroupType {
  User,
  System,
  Reply,
}

function isSystemMessage(message: MessageWithBaseUser) {
  return (
    message.isSystemMessage ||
    message.type === MessageType.UserPinnedMessage ||
    message.type === MessageType.ReplyToPinnedMessage
  );
}

function getGroupType(message: MessageWithBaseUser) {
  if (isSystemMessage(message)) {
    return GroupType.System;
  }

  if (message.messageReference) {
    return GroupType.Reply;
  }

  return GroupType.User;
}

export function groupMessages(messages: MessageWithBaseUser[]) {
  let group: { type: GroupType; messages: MessageWithBaseUser[] } = {
    type: GroupType.User,
    messages: [],
  };

  let currentGroupType: GroupType = GroupType.User;
  const reversedMessages = messages.toReversed();

  return reversedMessages.reduce((groupedMessages, message, index) => {
    const previousMessage = reversedMessages[index - 1];
    const nextMessage = reversedMessages[index + 1];

    if (!previousMessage) {
      currentGroupType = getGroupType(message);

      group.type = currentGroupType;
      group.messages.unshift(message);

      groupedMessages.push(group.messages);

      Object.assign(message, {
        divide: true,
      });

      return groupedMessages;
    }

    const diffBetweenMessagesInDays = differenceInCalendarDays(
      message.createdAt,
      previousMessage.createdAt
    );

    const diffBetweenMessagesInMinutes = differenceInMinutes(
      message.createdAt,
      previousMessage.createdAt
    );

    const { messageReference } = message;

    currentGroupType = getGroupType(message);

    const isGroupTypeDifferent = group.type !== currentGroupType;

    if (
      diffBetweenMessagesInDays >= 1 ||
      (diffBetweenMessagesInMinutes >= 15 && !isSystemMessage(message)) ||
      isGroupTypeDifferent ||
      currentGroupType === GroupType.Reply
    ) {
      group.messages = [];
      group.type = currentGroupType;
    }

    if (diffBetweenMessagesInDays >= 1) {
      Object.assign(message, {
        divide: true,
      });
    }

    group.messages.push(message);

    if (
      !groupedMessages.includes(group.messages) &&
      group.messages.length > 0
    ) {
      groupedMessages.push(group.messages);
    }

    return groupedMessages;
  }, [] as MessageWithBaseUser[][]);
}

export function useGroupMessages(messages: MessageWithBaseUser[]) {
  return useMemo(() => groupMessages(messages), [messages]);
}
