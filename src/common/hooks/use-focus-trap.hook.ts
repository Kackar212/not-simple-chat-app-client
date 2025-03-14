import {
  MutableRefObject,
  RefCallback,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";

interface UseFocusTrapProps {
  externalRefs?: Array<
    MutableRefObject<Element | null> | RefCallback<Element | null>
  >;
  autoFocus?: MutableRefObject<Element | null> | Element | string;
  isActive?: boolean;
}

const filterFocusable = (element: Element): element is HTMLElement => {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  const isDisabled = "disabled" in element && !!element.disabled;

  return element.getAttribute("tabindex") !== "-1" || !isDisabled;
};

const getFocusableChildren = (element: Element): HTMLElement[] => {
  return [
    ...element.querySelectorAll(`
      a[href],
      area[href],
      button,
      select,
      textarea,
      input,
      [contenteditable="true"],
      iframe
    `),
  ].filter(filterFocusable);
};

const getElementFrom = (
  source: MutableRefObject<Element | null> | Element | string,
  container: Element | Document = document
) => {
  if (typeof source === "string") {
    return container.querySelector<HTMLElement>(source);
  }

  if (source instanceof HTMLElement) {
    return source;
  }

  if ("current" in source) {
    return source.current;
  }

  return null;
};

export function useFocusTrap({
  autoFocus,
  externalRefs = [],
  isActive = true,
}: UseFocusTrapProps) {
  const trapRef = useRef<Element | null>(null);
  const refs = useRef(externalRefs);

  const setRef = useCallback((element: Element | null) => {
    refs.current.forEach((ref) => {
      if (!ref) {
        return;
      }

      if (typeof ref === "function") {
        ref(element);

        return;
      }

      ref.current = element;
    });

    trapRef.current = element;
  }, []);

  useEffect(() => {
    if (!autoFocus || !isActive) {
      return;
    }

    const { current: trapContainer } = trapRef;

    if (!trapContainer) {
      return;
    }

    const element = getElementFrom(autoFocus);

    if (element instanceof HTMLElement) {
      element.focus();
    }
  }, [isActive, autoFocus]);

  useEffect(() => {
    const { current: trapContainer } = trapRef;

    if (!trapContainer || !isActive) {
      return;
    }

    const focusableChildren = getFocusableChildren(trapContainer);

    const onKeydown = (e: KeyboardEvent) => {
      const { code, shiftKey } = e;
      const target = document.activeElement;

      const isShiftPressed = shiftKey;
      const isTabPressed = code === "Tab";

      const isElement = target instanceof HTMLElement;

      if (!isTabPressed || !isElement) {
        return;
      }

      if (focusableChildren.length === 0) {
        return;
      }

      if (!focusableChildren.includes(target)) {
        return;
      }

      const lastChild = focusableChildren.at(-1);
      const firstChild = focusableChildren.at(0);
      const isLastChild = target === lastChild;
      const isFirstChild = target === focusableChildren.at(0);

      if (isTabPressed && !isShiftPressed && isLastChild && firstChild) {
        e.preventDefault();

        firstChild.focus();
      }

      if (isTabPressed && isShiftPressed && isFirstChild && lastChild) {
        e.preventDefault();

        lastChild.focus();
      }
    };

    document.addEventListener("keydown", onKeydown);

    return () => {
      document.removeEventListener("keydown", onKeydown);
    };
  }, [isActive]);

  return { setRef };
}
