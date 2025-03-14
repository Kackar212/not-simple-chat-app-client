import { Modal } from "@components/modal/modal.component";
import { MutableRefObject, PropsWithChildren } from "react";
import { MemberProfileRoot } from "./member-profile-root.component";

interface MemberProfileProps {
  isOpen: boolean;
  close: () => void;
  modal: MutableRefObject<HTMLDialogElement | null>;
  userId: number;
  serverId?: number;
  isCurrentUser?: boolean;
}

export const MemberProfile = function MemberProfile({
  isOpen,
  close,
  modal,
  userId,
  serverId,
  children,
  isCurrentUser = false,
}: PropsWithChildren<MemberProfileProps>) {
  return (
    <Modal
      isOpen={isOpen}
      ref={modal}
      close={close}
      fullWidth
      className="bg-black-800 max-w-[550px] w-11/12 text-black-800 min-h-72"
      srOnlyDismiss
    >
      <MemberProfileRoot
        userId={userId}
        serverId={serverId}
        isOpen={isOpen}
        isCurrentUser={isCurrentUser}
      >
        {children}
      </MemberProfileRoot>
    </Modal>
  );
};
