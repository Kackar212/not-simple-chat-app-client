import { DirectMessages } from "@components/direct-messages/direct-messages.component";
import { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <DirectMessages />
      {children}
    </>
  );
}
