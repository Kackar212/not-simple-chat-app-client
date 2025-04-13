import { useFocusTrap } from "@common/hooks/use-focus-trap.hook";
import { HTMLProps, MutableRefObject, ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";
import CloseIcon from "/public/assets/icons/close.svg";

export interface ModalProps extends Omit<HTMLProps<HTMLDialogElement>, "open"> {
  close: () => void;
  ref: MutableRefObject<HTMLDialogElement | null>;
  children?: ReactNode;
  className?: string;
  fullWidth?: boolean;
  srOnlyDismiss?: boolean;
  isOpen: boolean;
  open?: () => void;
}

export function ModalRoot(props: ModalProps) {
  const {
    close,
    children,
    fullWidth,
    className,
    srOnlyDismiss,
    open: _open,
    isOpen,
    ref,
    ...attrs
  } = props;

  const { setRef } = useFocusTrap({
    externalRefs: [ref],
  });

  const dialogClassName = twMerge(
    "fixed w-[95%] max-w-[445px] bg-black-630 shadow-[0_3px_12px_0_rgba(0,0,0,0.15)] shadow-[rgba(30,_31,_34,_0.6)_0px_0px_0px_1px,_rgba(0,_0,_0,_0.2)_0px_2px_10px_0px] text-white-500 justify-center rounded-md left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2",
    props.fullWidth && "p-0",
    props.className
  );

  useEffect(() => {
    const onOutsideClick = (e: MouseEvent) => {
      const isElement = e.target instanceof Element;
      if (!isElement || e.target.tagName !== "HTML") {
        return;
      }

      close();
    };

    window.addEventListener("click", onOutsideClick);

    const cleanup = () => {
      window.removeEventListener("click", onOutsideClick);
    };

    return cleanup;
  }, [close]);

  return createPortal(
    <>
      <dialog
        className={dialogClassName}
        onClose={(e) => {
          e.preventDefault();

          close();
        }}
        role={props.role}
        {...attrs}
        ref={setRef}
        open={undefined}
      >
        <div className="relative w-full rounded-md">
          <button
            type="button"
            onClick={close}
            className={twMerge(
              "close absolute top-3 right-3 z-50 mix-blend-exclusion",
              srOnlyDismiss && "sr-only"
            )}
          >
            <span className="sr-only">Close</span>
            <CloseIcon className="size-6" />
          </button>
          <div
            className={twMerge("min-w-64 w-full p-8", props.fullWidth && "p-0")}
          >
            {children}
          </div>
        </div>
      </dialog>
      {isOpen && (
        <div className="bg-black-1000/50 fixed top-0 left-0 bottom-0 right-0 z-[9999]"></div>
      )}
    </>,
    document.body
  );
}
