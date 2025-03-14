"use client";

import { getMessages } from "@common/api";
import { Attachment } from "@common/api/schemas/attachment.schema";
import { ChannelUser } from "@common/api/schemas/channel-user.schema";
import {
  Channel as ChannelType,
  ChannelWithoutMessages,
} from "@common/api/schemas/channel.schema";
import { Member } from "@common/api/schemas/member.schema";
import { Message } from "@common/api/schemas/message.schema";
import { Recipient } from "@common/api/schemas/user.schema";
import { Chat } from "@components/chat/chat.component";
import { HashTagIcon } from "@components/icons";
import { Loader } from "@components/loader/loader.component";
import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from "@tanstack/react-query";
import { notFound } from "next/navigation";
import {
  PropsWithChildren,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface ChannelProps {
  channel: ChannelWithoutMessages;
  channelName: string;
  serverId: number;
  currentMember: Member;
  isBlocked?: boolean;
  isRequestAccepted?: boolean;
  recipient?: Recipient;
}

export function Channel({ children }: PropsWithChildren) {
  return <div className="relative flex flex-grow">{children}</div>;
}
