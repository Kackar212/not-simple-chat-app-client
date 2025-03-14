import { createContext, PropsWithChildren } from "react";
import { usePopover, UsePopoverProps } from "./use-popover.hook";

export type PopoverContext = ReturnType<typeof usePopover>;

export const popoverContext = createContext<PopoverContext | null>(null);

interface PopoverProviderProps extends UsePopoverProps {
  isOpen?: boolean;
  context?: ReturnType<typeof usePopover>;
}

export function PopoverProvider(
  props: PropsWithChildren<PopoverProviderProps>
) {
  return (
    <popoverContext.Provider value={usePopover(props, props.context)}>
      {props.children}
    </popoverContext.Provider>
  );
}
