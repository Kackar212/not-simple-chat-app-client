import { useSafeContext } from "@common/hooks";
import { EditorView } from "codemirror";
import Fuse from "fuse.js";
import {
  Key,
  MouseEventHandler,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { twMerge } from "tailwind-merge";
import {
  AutocompleteContext,
  autocompleteContext,
} from "./autocomplete.context";
import { AutocompleteListItem } from "./autocomplete-list-item.component";
import {
  AutocompleteDataType,
  AutocompleteType,
} from "@components/input/use-editor.hook";
import { chatContext } from "@components/chat/chat.context";

interface AutocompleteProps<Data = never> {
  keys: string[];
  searchTerm: string;
  editor?: EditorView;
  clear: () => void;
  renderItem: (data: Data, index: number) => ReactNode;
  getKey: (data: Data) => Key;
  type: AutocompleteType;
}

type AutocompleteData<Data> = {
  category: string;
  data: Data;
};

export function Autocomplete<Data>({
  keys,
  searchTerm,
  editor,
  type,
  clear,
  renderItem,
  getKey,
}: AutocompleteProps<Data>) {
  const { isOpen, data, onSelect, searchResult, setAutocompleteState } =
    useSafeContext<AutocompleteContext<Data>>(autocompleteContext);

  const { serverId } = useSafeContext(chatContext);

  const fuseSearch = useMemo(
    () => new Fuse(data, { keys, threshold: 0.3 }),
    [data, keys]
  );

  useEffect(() => {
    const searchResult = fuseSearch.search<Data>(searchTerm, { limit: 75 });

    setAutocompleteState((prevState) => ({ ...prevState, searchResult }));
  }, [fuseSearch, searchTerm, setAutocompleteState]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const codeMirrorEditor = document.querySelector(".cm-content");

    if (!codeMirrorEditor) {
      return;
    }

    const shouldDisplay =
      type === AutocompleteDataType.Members ? !!serverId : true;

    const isOpen =
      typeof searchTerm === "string" && searchTerm !== "" && shouldDisplay;

    const onBlur = () => {
      setAutocompleteState((prevState) => ({
        ...prevState,
        isOpen: false,
        activeDescendant: "",
        activeIndex: -1,
      }));
    };

    codeMirrorEditor.addEventListener("blur", onBlur);

    setAutocompleteState((prevState) => {
      let activeIndex = isOpen && !prevState.isOpen ? 0 : prevState.activeIndex;

      if (!isOpen) {
        activeIndex = -1;
      }

      return {
        ...prevState,
        isOpen,
        activeIndex,
      };
    });

    editor.contentDOM.ariaExpanded = String(isOpen);

    return () => {
      codeMirrorEditor.removeEventListener("blur", onBlur);
    };
  }, [searchTerm, editor, setAutocompleteState]);

  const onMouseDown = useCallback<MouseEventHandler>(
    (e) => {
      e.preventDefault();

      const { target } = e;
      const isElement = target instanceof HTMLElement;

      if (!isElement) {
        return;
      }

      const {
        dataset: { index },
      } = target;

      if (!index) {
        return;
      }

      const selectedItem = searchResult[Number(index)];

      if (!selectedItem) {
        return;
      }

      onSelect(selectedItem.item);

      clear();
    },
    [clear, onSelect, searchResult]
  );

  return (
    <section
      className={twMerge(
        "hidden absolute bottom-14 w-full min-h-32 max-h-[280px] z-[9999] bg-black-600 border border-white-500/15 rounded-md text-gray-150 p-4 overflow-y-scroll scrollbar scrollbar-thin grid-rows-[1rem_1fr] gap-2.5",
        isOpen && "grid"
      )}
      onMouseDown={onMouseDown}
    >
      <h2 className="uppercase text-xs font-semibold mb-1 text-gray-150">
        {type}
      </h2>
      <div className="overflow-y-auto scrollbar scrollbar-thin">
        <div className="overflow-hidden">
          <ul role="listbox" className="flex flex-col gap-[3px]">
            {searchResult.length === 0 && (
              <span>
                There are no {type.toLowerCase()} with name or role matching{" "}
                <strong>{searchTerm}</strong>
              </span>
            )}
            {searchResult.map(({ item }, index) => (
              <AutocompleteListItem index={index} key={getKey(item)}>
                {renderItem(item, index)}
              </AutocompleteListItem>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
