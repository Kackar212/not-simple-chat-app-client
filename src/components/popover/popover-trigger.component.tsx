import { useSafeContext } from "@common/hooks";
import { popoverContext } from "./popover.context";
import React, {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  ForwardedRef,
  HTMLAttributes,
  HTMLProps,
  KeyboardEventHandler,
  LegacyRef,
  MutableRefObject,
  PropsWithChildren,
  ReactHTML,
  useCallback,
} from "react";
import { Key } from "@common/constants";

export function PopoverTrigger({
  children,
  ref,
  inline,
  ...attrs
}: PropsWithChildren<
  DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > & {
    ref?: MutableRefObject<HTMLButtonElement | null>;
    inline?: boolean;
  }
>) {
  const { refs, getReferenceProps } = useSafeContext(popoverContext);
  const Trigger = inline ? "span" : "button";

  const setRef = useCallback(
    (btn: HTMLButtonElement | null) => {
      refs.setReference(btn);
      if (ref && "current" in ref) {
        ref.current = btn;
      }
    },
    [ref, refs]
  );

  const onKeydown = useCallback<KeyboardEventHandler<HTMLSpanElement>>(
    ({ code, target }) => {
      const isElement = target instanceof HTMLElement;

      if (!isElement) {
        return;
      }

      if (code !== Key.Enter && code !== Key.Space) {
        return;
      }

      target.click();
    },
    []
  );

  return (
    <Trigger
      {...attrs}
      tabIndex={inline ? 0 : undefined}
      role={inline ? "button" : undefined}
      onKeyDown={inline ? onKeydown : undefined}
      ref={setRef}
      {...getReferenceProps()}
    >
      {children}
    </Trigger>
  );
}
