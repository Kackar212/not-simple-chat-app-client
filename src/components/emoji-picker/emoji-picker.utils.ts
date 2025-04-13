import { UserServer } from "@common/api/schemas/server.schema";
import { categories } from "@common/emojis";
import { Emoji } from "@common/emojis/emoji.class";
import { EmojiMemoryStorage } from "@common/emojis/emojis.storage";
import Fuse, { Expression } from "fuse.js";

export const emojis = EmojiMemoryStorage.getAll();

let debounceSetTimeout = -1;
export const debounce = (callback: (...args: any[]) => any) => {
  return async (...args: any[]) => {
    if (debounceSetTimeout !== -1) {
      clearTimeout(debounceSetTimeout);

      debounceSetTimeout = -1;
    }

    debounceSetTimeout = window.setTimeout(() => {
      debounceSetTimeout = -1;

      callback(...args);
    }, 200);
  };
};

export function filterEmojisByCategory(emojis: Emoji[], categoryIndex: number) {
  return emojis.filter((emoji) => emoji.categoryIndex === categoryIndex);
}

export const categoriesLength = categories.map((emoji) => {
  return filterEmojisByCategory(emojis, emoji.categoryIndex).length;
});

export function paginateEmojis(pageParam: number, categoryIndex: number) {
  return filterEmojisByCategory(emojis, categoryIndex).slice(
    (pageParam - 1) * 100,
    pageParam * 100
  );
}

export const search = <T>(fuse: Fuse<T>, searchValue: string | Expression) =>
  fuse.search(searchValue).map(({ item }) => item);

export type SelectedCategory = {
  type: "SERVER" | "UNICODE";
  id: number;
  index: number;
};

export const getCategory = (
  selectedCategory: SelectedCategory,
  servers: UserServer[]
) => {
  if (selectedCategory.type === "UNICODE") {
    return categories[selectedCategory.id];
  }

  return servers.find((server) => server.id === selectedCategory.id)!;
};

export function getCustomEmojis(serverId: number) {
  return EmojiMemoryStorage.getAll().filter(
    (emoji) => emoji.serverId === serverId
  );
}

export function getUnicodeEmojis(categoryIndex: number) {
  return emojis.filter((emoji) => emoji.categoryIndex === categoryIndex);
}

export interface EmojiPickerProps {
  onSelect: (emoji: Emoji) => void;
}

export const fieldClassNames = {
  field: "max-w-unset py-2 px-3",
  fieldInputContainer: "bg-black-700 text-gray-150",
};

export const CategoryType = {
  Server: "SERVER",
  Unicode: "UNICODE",
} as const;
