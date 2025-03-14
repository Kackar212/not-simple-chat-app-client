import {
  PropsWithRef,
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export function useModal(onClose?: () => void) {
  const modal = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setTimeout(() => {
      modal.current?.showModal();
    });
  }, [isOpen]);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    modal.current?.close();

    onClose?.();

    setIsOpen(false);
  }, [onClose, modal]);

  return { ref: modal, close, open, isOpen };
}
