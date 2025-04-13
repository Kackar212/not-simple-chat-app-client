"use client";

import { MessageWithBaseUser as MessageEntity } from "@common/api/schemas/message.schema";
import { useSafeContext } from "@common/hooks";
import { authContext } from "@common/auth/auth.context";
import { MessagesGroup } from "./messages-group.component";

interface MessagesProps {
  groupedMessages: MessageEntity[][];
}

export function Messages({ groupedMessages }: MessagesProps) {
  const {
    auth: { blacklist },
  } = useSafeContext(authContext);
  return groupedMessages.map((messages) => (
    <MessagesGroup
      key={messages.map(({ id }) => id).join()}
      messages={messages}
      blacklist={blacklist}
    />
  ));
}
