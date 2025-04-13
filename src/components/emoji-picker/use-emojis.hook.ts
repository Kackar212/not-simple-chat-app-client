import { getServerEmojis } from "@common/api";
import { useQuery } from "@common/api/hooks/use-query.hook";
import { Emoji, EmojiType } from "@common/emojis/emoji.class";
import { EmojiMemoryStorage } from "@common/emojis/emojis.storage";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  categoriesLength,
  CategoryType,
  paginateEmojis,
  SelectedCategory,
} from "./emoji-picker.utils";

interface UseEmojisProps {
  selectedCategory: SelectedCategory;
  searchResult: Emoji[];
  searchValue: string;
}

export function useEmojis({
  selectedCategory,
  searchResult,
  searchValue,
}: UseEmojisProps) {
  const {
    data: { data: serverEmojis = [] },
    isLoading: isLoadingCustomEmojis,
  } = useQuery({
    queryKey: ["get-server-emojis", selectedCategory.id],
    queryFn: async () => {
      const emojis = await getServerEmojis({ serverId: selectedCategory.id });
      const { data = [] } = emojis;

      return {
        data: data.map((customEmoji) => {
          const emoji = new Emoji(customEmoji, EmojiType.Custom);

          EmojiMemoryStorage.set(emoji);

          return emoji;
        }),
      };
    },
    enabled: selectedCategory.type === "SERVER",
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading: isLoadingUnicodeEmojis,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    fetchPreviousPage,
  } = useInfiniteQuery({
    queryKey: ["emojis", selectedCategory.id],
    initialPageParam: 1,
    enabled: selectedCategory.type === CategoryType.Unicode && !searchValue,
    getNextPageParam(_, __, lastPage) {
      const pagesCount = Math.ceil(categoriesLength[selectedCategory.id] / 100);

      if (lastPage === pagesCount) {
        return;
      }

      return lastPage + 1;
    },
    getPreviousPageParam(_, __, firstPage) {
      if (firstPage === 1) {
        return;
      }

      return firstPage - 1;
    },
    queryFn: async ({ pageParam }) => {
      return paginateEmojis(pageParam, selectedCategory.id);
    },
    maxPages: 3,
  });

  let emojisToRender = [] as Emoji[];

  if (selectedCategory.type === CategoryType.Unicode) {
    emojisToRender = (data?.pages.flat() || []) as Emoji[];
  }

  if (selectedCategory.type === CategoryType.Server) {
    emojisToRender = serverEmojis;
  }

  if (searchResult.length > 0) {
    emojisToRender = searchResult;
  }

  return {
    isLoading: isLoadingCustomEmojis || isLoadingUnicodeEmojis,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    hasNextPage,
    emojis: emojisToRender,
    fetchNextPage,
    fetchPreviousPage,
  };
}
