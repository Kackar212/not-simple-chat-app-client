import { useSafeContext } from "@common/hooks";
import { PropsWithChildren, useId } from "react";
import { autocompleteContext } from "./autocomplete.context";

export function AutocompleteListItem({
  children,
  index,
}: PropsWithChildren<{ index: number }>) {
  const { activeIndex } = useSafeContext(autocompleteContext);
  const id = useId();

  return (
    <li
      id={id}
      tabIndex={-1}
      role="option"
      aria-selected={activeIndex === index}
      data-index={index}
      className="aria-selected:bg-gray-240/30 px-1.5 py-[5px] rounded-sm cursor-pointer *:pointer-events-none"
    >
      {children}
    </li>
  );
}
