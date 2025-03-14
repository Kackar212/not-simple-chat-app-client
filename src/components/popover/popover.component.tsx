import { useSafeContext } from "@common/hooks";
import {
  autoUpdate,
  FloatingContext,
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  useClick,
  useDismiss,
  useFloating,
  UseFloatingReturn,
  useFocus,
  useInteractions,
  UseInteractionsReturn,
  useRole,
} from "@floating-ui/react";
import { HTMLProps, PropsWithChildren, Suspense, useState } from "react";
import { PopoverContext, popoverContext } from "./popover.context";
import { twMerge } from "tailwind-merge";

interface PopoverProps {
  render?: (props: PopoverContext) => React.ReactNode;
  shouldRenderInPortal?: boolean;
}

export function Popover({
  children,
  render,
  ref,
  className,
  shouldRenderInPortal = false,
  ...attrs
}: PropsWithChildren<PopoverProps & HTMLProps<HTMLElement>>) {
  const popoverProps = useSafeContext(popoverContext);
  const { context, refs, floatingStyles, getFloatingProps, isOpen } =
    popoverProps;

  if (isOpen && render) {
    return render(popoverProps);
  }

  const popover = (
    <>
      <FloatingOverlay />
      <FloatingFocusManager context={context}>
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          {...attrs}
          {...getFloatingProps()}
          className={twMerge("bg-transparent z-[999]", className)}
          aria-modal="true"
        >
          {children}
        </div>
      </FloatingFocusManager>
    </>
  );

  if (isOpen && shouldRenderInPortal) {
    return <FloatingPortal>{popover}</FloatingPortal>;
  }

  return isOpen && popover;
}
