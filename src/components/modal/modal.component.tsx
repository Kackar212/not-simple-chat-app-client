import { ModalProps, ModalRoot } from "./modal-root.component";
import { useLayoutEffect, useRef } from "react";

export function Modal({ children, ...props }: ModalProps) {
  const container = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    container.current = document.body;
  }, []);

  return (
    container.current &&
    props.isOpen && <ModalRoot {...props}>{children}</ModalRoot>
  );
}
