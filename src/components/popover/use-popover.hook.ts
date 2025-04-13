import {
  autoUpdate,
  flip,
  offset,
  OffsetOptions,
  shift,
  useClick,
  useDismiss,
  useFloating,
  UseFloatingOptions,
  useFocus,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { useEffect, useMemo, useState } from "react";

export interface UsePopoverProps extends UseFloatingOptions {
  openOnFocus?: boolean;
  isOpen?: boolean;
  offset?: OffsetOptions;
}

export function usePopover(
  {
    openOnFocus = false,
    onOpenChange,
    offset: offsetOptions = { crossAxis: -30, mainAxis: 5, alignmentAxis: 10 },
    ...options
  }: UsePopoverProps = {},
  popoverContext: Partial<ReturnType<typeof useFloating>> = {}
) {
  const [isOpenUncontrolled, setIsOpen] = useState(false);

  const isControlled = typeof options.isOpen !== "undefined";
  const isOpen = isControlled ? options.isOpen : isOpenUncontrolled;

  const { refs, floatingStyles, context, ...useFloatingResult } = useFloating({
    whileElementsMounted: autoUpdate,
    open: isOpen,
    onOpenChange: (isOpen: boolean) => {
      if (!isControlled) {
        setIsOpen(isOpen);
      }

      onOpenChange?.(isOpen);
    },
    middleware: [
      offset(offsetOptions),
      shift({ mainAxis: true, crossAxis: true }),
    ],
    placement: options.placement || "top-start",
    strategy: "absolute",
    ...options,
  });

  useEffect(() => {
    const floatingElement = refs.floating.current;
    const isDialog = floatingElement instanceof HTMLDialogElement;

    if (!isDialog) {
      return;
    }

    if (isOpen) {
      floatingElement.showModal();

      return;
    }

    floatingElement.close();
  }, [isOpen, refs]);

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);
  const focus = useFocus(context, { enabled: openOnFocus });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
    focus,
  ]);

  return useMemo(
    () => ({
      context,
      refs,
      floatingStyles,
      isOpen,
      setIsOpen,
      getReferenceProps,
      getFloatingProps,
      ...useFloatingResult,
      ...popoverContext,
    }),
    [
      context,
      floatingStyles,
      getFloatingProps,
      getReferenceProps,
      isOpen,
      popoverContext,
      refs,
      useFloatingResult,
    ]
  );
}
