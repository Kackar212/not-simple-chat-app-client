import {
  KeyboardEventHandler,
  MouseEventHandler,
  PointerEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Item } from "./item.interface";

export function useMenu(
  { currentIndex = 0, items }: { currentIndex?: number; items: Item[] } = {
    items: [],
  }
) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(currentIndex);
  const openButtonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { current: id } = useRef(Math.floor(Math.random() * 9999999));
  const filteredItems = useMemo(
    () => items.filter(({ enabled }) => enabled !== false),
    [items]
  );
  const itemsCount = filteredItems.length;

  const toggleMenu: (isOpen: boolean) => void = useCallback(
    (isOpen) => {
      setIsOpen((isOpen) => {
        if (isOpen) {
          setCurrentItem(-1);
        }

        if (!isOpen) {
          const checkedItemIndex = filteredItems.findIndex(
            ({ checked }) => checked
          );

          setCurrentItem(checkedItemIndex === -1 ? 0 : checkedItemIndex);
        }

        return !isOpen;
      });
    },
    [filteredItems]
  );

  const onMouseOver = useCallback((e: MouseEvent) => {
    e.stopPropagation();

    const { currentTarget } = e;

    const isTargetElement = currentTarget instanceof HTMLElement;

    if (!isTargetElement) {
      return;
    }

    const index = Number(currentTarget.dataset.index);

    if (Number.isNaN(index)) {
      return;
    }

    setCurrentItem(index);
  }, []);

  const onKeyDown = useCallback(({ key }: KeyboardEvent) => {
    if (key === "Enter" || key === "ArrowDown") {
      setIsOpen(true);

      setCurrentItem(0);

      return;
    }

    if (key === "ArrowUp") {
      setIsOpen(false);

      setCurrentItem(-1);
    }
  }, []);

  useEffect(() => {
    const onClick = function ({ target }: MouseEvent) {
      const isElement = target instanceof Element;

      if (!isElement) {
        return;
      }

      if (
        openButtonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }

      setIsOpen(false);

      setCurrentItem(-1);
    };

    window.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("click", onClick);
    };
  }, [openButtonRef, menuRef]);

  useEffect(() => {
    const openButton = openButtonRef.current;

    openButton?.addEventListener("keydown", onKeyDown);

    return () => {
      openButton?.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);

  const onMenuItemKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const { key = "" } = e;

      switch (key) {
        case "Escape":
        case "Tab": {
          e.preventDefault();

          setIsOpen(false);

          setCurrentItem(-1);

          openButtonRef.current?.focus();

          return;
        }

        case "ArrowDown": {
          if (currentItem === itemsCount - 1) {
            setCurrentItem(0);

            return;
          }

          setCurrentItem(currentItem + 1);

          return;
        }

        case "ArrowUp": {
          if (currentItem === 0) {
            setCurrentItem(itemsCount - 1);

            return;
          }

          setCurrentItem(currentItem - 1);

          return;
        }
      }
    },
    [currentItem, itemsCount]
  );

  useEffect(() => {
    document
      .querySelector<HTMLButtonElement>(`[data-index="${currentItem}"]`)
      ?.focus();
  }, [currentItem]);

  return {
    toggleMenu,
    isOpen,
    isCurrentItem: (index: number) =>
      isOpen ? currentItem === index : undefined,
    id,
    openButtonRef,
    menuRef,
    setCurrentItem,
    onMenuItemKeyDown,
    onMouseOver,
    setIsOpen,
  };
}
