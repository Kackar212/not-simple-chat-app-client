import { EditorView } from "codemirror";
import { FuseResult } from "fuse.js";
import {
  createContext,
  Dispatch,
  KeyboardEventHandler,
  MouseEventHandler,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

export interface AutocompleteContext<Data = any> {
  data: Data[];
  activeDescendant?: string;
  activeIndex: number;
  isOpen: boolean;
  searchResult: FuseResult<Data>[];
  onSelect: (data: Data) => void;
  setAutocompleteState: Dispatch<SetStateAction<AutocompleteContext<Data>>>;
}

export const defaultContext: AutocompleteContext = {
  data: [],
  activeDescendant: undefined,
  activeIndex: 0,
  isOpen: false,
  searchResult: [],
  onSelect() {},
  setAutocompleteState() {},
};

export const autocompleteContext =
  createContext<AutocompleteContext>(defaultContext);

export function AutocompleteProvider<ContextData>({
  children,
  editor,
  onSelect,
  data,
  clear,
}: PropsWithChildren<{
  editor?: EditorView;
  onSelect: (data: ContextData) => void;
  data: ContextData[];
  clear: () => void;
}>) {
  const [state, setAutocompleteState] =
    useState<AutocompleteContext<ContextData>>(defaultContext);

  const onMouseOver = useCallback<MouseEventHandler<HTMLDivElement>>(
    ({ target }) => {
      const isElement = target instanceof HTMLElement;

      if (!isElement || !editor) {
        return;
      }

      const listItem = target.closest("li");

      if (!listItem) {
        return;
      }

      const {
        dataset: { index },
        id,
      } = listItem;

      editor.contentDOM.setAttribute("aria-activedescendant", id);

      setAutocompleteState((prevState) => {
        return {
          ...prevState,
          activeDescendant: id,
          activeIndex: Number(index),
        };
      });
    },
    [editor]
  );

  const onKeyDown = useCallback<KeyboardEventHandler<HTMLDivElement>>(
    (e) => {
      if (!editor || !state.isOpen) {
        return;
      }

      const { currentTarget, key } = e;
      const listItems = currentTarget.querySelectorAll(
        '[role="listbox"] li[role="option"]'
      );

      let currentIndex = state.activeIndex;

      switch (key) {
        case "ArrowUp": {
          currentIndex -= 1;

          if (currentIndex < 0) {
            currentIndex = Math.max(0, listItems.length - 1);
          }

          break;
        }

        case "ArrowDown": {
          currentIndex += 1;

          if (currentIndex > listItems.length - 1) {
            currentIndex = 0;
          }

          break;
        }

        case "Enter": {
          onSelect(state.searchResult[currentIndex].item);

          clear();

          return;
        }

        default:
          return;
      }

      if (currentIndex > listItems.length - 1) {
        currentIndex = listItems.length - 1;
      }

      if (currentIndex < 0) {
        currentIndex = 0;
      }

      const activeListItem = listItems[currentIndex];

      editor.contentDOM.setAttribute(
        "aria-activedescendant",
        activeListItem.id
      );

      const autocompleteListContainer =
        currentTarget.querySelector<HTMLUListElement>("section > div");

      if (!autocompleteListContainer) {
        return;
      }

      activeListItem.scrollIntoView({ block: "end", inline: "nearest" });

      setAutocompleteState((prevState) => {
        return {
          ...prevState,
          activeDescendant: activeListItem.id,
          activeIndex: currentIndex,
        };
      });
    },
    [
      clear,
      editor,
      onSelect,
      state.activeIndex,
      state.isOpen,
      state.searchResult,
    ]
  );

  const context = useMemo(
    () => ({ ...state, setAutocompleteState, onSelect, data }),
    [data, onSelect, state]
  );

  return (
    <autocompleteContext.Provider value={context}>
      <div className="w-full" onMouseOver={onMouseOver} onKeyDown={onKeyDown}>
        {children}
      </div>
    </autocompleteContext.Provider>
  );
}
