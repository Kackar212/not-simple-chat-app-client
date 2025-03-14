import { useSafeContext } from "@common/hooks";
import { popoverContext } from "./popover.context";
import {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  ForwardedRef,
  HTMLAttributes,
  HTMLProps,
  LegacyRef,
  MutableRefObject,
  PropsWithChildren,
  useCallback,
} from "react";

export function PopoverTrigger({
  children,
  ref,
  ...attrs
}: PropsWithChildren<
  DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > & {
    ref?: MutableRefObject<HTMLButtonElement | null>;
  }
>) {
  const { refs, getReferenceProps } = useSafeContext(popoverContext);

  const setRef = useCallback(
    (btn: HTMLButtonElement | null) => {
      refs.setReference(btn);
      if (ref && "current" in ref) {
        ref.current = btn;
      }
    },
    [ref, refs]
  );

  return (
    <button {...attrs} ref={setRef} {...getReferenceProps()}>
      {children}
    </button>
  );
}
