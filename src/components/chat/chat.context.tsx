import { createContext, PropsWithChildren, useState } from "react";
import { useChat } from "./use-chat.hook";

export const chatContext = createContext<ReturnType<typeof useChat> | null>(
  null
);

export function ChatProvider({
  children,
  ...props
}: PropsWithChildren<ReturnType<typeof useChat>>) {
  return <chatContext.Provider value={props}>{children}</chatContext.Provider>;
}
