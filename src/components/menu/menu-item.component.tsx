import {
  Dispatch,
  MouseEventHandler,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { Item } from "./item.interface";
import { twMerge } from "tailwind-merge";
import CheckmarkIcon from "/public/assets/icons/checkmark.svg";

interface MenuItemProps {
  item: Item;
  isCurrentItem: boolean | undefined;
  isMenuOpen: boolean;
  index: number;
  onKeyDown: (ev: KeyboardEvent) => void;
  onMouseOver: (ev: MouseEvent) => void;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export function MenuItem({
  item: { label, isMutation = false, action, checked = false, role },
  isCurrentItem,
  onKeyDown,
  onMouseOver,
  isMenuOpen,
  index,
  setIsOpen,
}: MenuItemProps) {
  const menuItemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const menuItem = menuItemRef.current;
    menuItem?.addEventListener("keydown", onKeyDown);
    menuItem?.addEventListener("mouseover", onMouseOver);

    return () => {
      menuItem?.removeEventListener("keydown", onKeyDown);
      menuItem?.removeEventListener("mouseover", onMouseOver);
    };
  }, [onKeyDown, onMouseOver]);

  const onClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      setIsOpen(false);

      action!();
    },
    [setIsOpen, action]
  );

  const isMenuItemRadio =
    role === "menuitemradio" || role === "menuitemcheckbox";

  return (
    action && (
      <button
        role={role}
        tabIndex={-1}
        ref={menuItemRef}
        data-index={index}
        onClick={onClick}
        aria-checked={isMenuItemRadio ? checked : undefined}
        className={twMerge(
          "text-sm text-gray-330 focus:outline-none text-left flex justify-between items-center w-full p-2 leading-[18px] rounded-sm font-medium",
          isMutation && "text-red-500",
          isCurrentItem && "bg-blue-500 text-white-0",
          isCurrentItem && isMutation && "bg-red-500 text-white-0"
        )}
      >
        {label}
        {checked && <CheckmarkIcon className="size-3.5" />}
      </button>
    )
  );
}
