import { ViewUpdate } from "@codemirror/view";
import { AutocompleteState } from "@components/input/use-editor.hook";
import { Dispatch, SetStateAction } from "react";

export interface UsePluginProps {
  setAutocompleteState: Dispatch<SetStateAction<AutocompleteState>>;
}

export function getUpdate(update: ViewUpdate) {
  const {
    state: {
      doc,
      selection: {
        main: { head: cursorPosition },
      },
    },
  } = update;

  const value = doc.toString();

  return {
    value,
    cursorPosition,
  };
}

export function getStartIndex({ value = "", cursorPosition = 0, tag = "" }) {
  return value.slice(0, cursorPosition).lastIndexOf(tag);
}

export function isSearchTermValid({
  value = "",
  rawSearchTerm = "",
  startIndex = 0,
  cursorPosition = 0,
  tag = "",
  regEx = "",
}) {
  // <:\\d+>
  console.log(new RegExp(`(\\s+|^)(${tag}!?(.*[^\\s\\n]$))`));
  const isFalsePositive = new RegExp(`^${regEx}.*`).test(
    value.slice(startIndex - 1, cursorPosition)
  );

  return (
    !isFalsePositive &&
    new RegExp(`^${tag}((?!\\s).)*$`).test(rawSearchTerm.trim())
  );
}

export const Tag = {
  Mention: "@",
  Emoji: ":",
} as const;

export const RegEx = {
  Mention: "<@\\d+>",
  CustomEmoji: "<:\\d+:>",
  UnicodeEmoji: ":\\w+:",
} as const;

export function getAutocompleteState(
  update: ViewUpdate,
  tag: (typeof Tag)[keyof typeof Tag],
  regEx: (typeof RegEx)[keyof typeof RegEx]
) {
  const { cursorPosition, value } = getUpdate(update);
  const startIndex = getStartIndex({ value, cursorPosition, tag });
  const rawSearchTerm = value.slice(startIndex, cursorPosition);
  let searchTerm = rawSearchTerm.substring(1);
  console.log(
    { searchTerm, rawSearchTerm, value, startIndex, tag },
    value.slice(0, cursorPosition).lastIndexOf(tag)
  );
  if (
    !isSearchTermValid({
      value,
      rawSearchTerm,
      startIndex,
      cursorPosition,
      tag,
      regEx,
    })
  ) {
    searchTerm = "";
  }

  return {
    searchTerm,
    cursorPosition,
    startIndex,
  };
}
