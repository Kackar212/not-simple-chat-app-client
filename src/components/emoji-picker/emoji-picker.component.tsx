import {
  CSSProperties,
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { Loader } from "@components/loader/loader.component";
import { FormField } from "@components/form-field/form-field.component";
import { useQuery } from "@common/api/hooks/use-query.hook";
import { getServerEmojis, getUserServers } from "@common/api";
import { useSafeContext } from "@common/hooks";
import { authContext } from "@common/auth/auth.context";
import { EmojiItem } from "./emoji-item.component";
import { EmojiMemoryStorage } from "@common/emojis/emojis.storage";
import { categories } from "@common/emojis";
import { Emoji, EmojiType } from "@common/emojis/emoji.class";
import { ServerIcon } from "@components/server-icon/server-icon.component";
import { useInfiniteScroll } from "@components/chat/use-infinite-scroll.hook";
import { AvatarSize } from "@common/constants";
import Fuse from "fuse.js";
import Image from "next/image";

const emojis = EmojiMemoryStorage.getAll();

let debounceSetTimeout = -1;
const debounce = (callback: (...args: any[]) => any) => {
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

function filterEmojisByCategory(emojis: Emoji[], categoryIndex: number) {
  return emojis.filter((emoji) => emoji.categoryIndex === categoryIndex);
}

const categoriesLength = categories.map((emoji) => {
  return filterEmojisByCategory(emojis, emoji.categoryIndex).length;
});

function paginateEmojis(pageParam: number, categoryIndex: number) {
  return filterEmojisByCategory(emojis, categoryIndex).slice(
    (pageParam - 1) * 100,
    pageParam * 100
  );
}

interface EmojiPickerProps {
  onSelect: (emoji: Emoji) => void;
}

export function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [hoveredEmoji, setHoveredEmoji] = useState<Emoji>(emojis[0]);
  const [searchResult, setSearchResult] = useState<Emoji[]>([]);
  const [searchValue, setSearchValue] = useState("");

  const {
    auth: { member },
  } = useSafeContext(authContext);
  const queryClient = useQueryClient();
  const { data: servers = [] } = useMemo(
    () =>
      queryClient.getQueryData<Awaited<ReturnType<typeof getUserServers>>>([
        "get-user-servers",
      ]) || { data: [] },
    [queryClient]
  );

  const scrollContainer = useRef<HTMLDivElement | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<{
    type: "SERVER" | "UNICODE";
    id: number;
    index: number;
  }>(() => {
    const server = servers.at(0);

    if (!server) {
      return {
        type: "UNICODE",
        index: 0,
        id: 0,
      };
    }

    return { type: "SERVER", id: server.id, index: 0 };
  });

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
    isLoading: isLoadingInfiniteQuery,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    fetchPreviousPage,
  } = useInfiniteQuery({
    queryKey: ["emojis", selectedCategory.id],
    initialPageParam: 1,
    enabled: selectedCategory.type === "UNICODE",
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

  const isLoading = isLoadingCustomEmojis || isLoadingInfiniteQuery;

  useEffect(() => {
    const isServerSelected = selectedCategory.type === "SERVER";

    if (searchValue) {
      const fuse = new Fuse(
        isServerSelected
          ? EmojiMemoryStorage.getAll().filter(
              (emoji) => emoji.serverId === selectedCategory.id
            )
          : emojis.filter(
              (emoji) => emoji.categoryIndex === selectedCategory.id
            ),

        { keys: isServerSelected ? ["uniqueName"] : ["names"] }
      );

      const getSearchResult = debounce(() => {
        setSearchResult(fuse.search(searchValue).map(({ item }) => item));
      });

      if (searchResult.length === 0) {
        setSearchResult(fuse.search(searchValue).map(({ item }) => item));

        return;
      }

      getSearchResult();

      return;
    }
  }, [
    searchResult.length,
    searchValue,
    selectedCategory.id,
    selectedCategory.type,
  ]);

  const { bottomRef, ref, inView, inViewBottom } = useInfiniteScroll({
    hasNextPage,
    hasPreviousPage,
    fetchNextPage,
    fetchPreviousPage,
    afterFetchOnDispatch() {},
    intersectionOptions: {
      rootMargin: "100px 0px 100px 0px",
      root: scrollContainer.current,
      threshold: [0.5],
    },
  });

  let emojisToRender = [] as Emoji[];

  if (selectedCategory.type === "UNICODE") {
    emojisToRender = (data?.pages.flat() || []) as Emoji[];
  }

  if (selectedCategory.type === "SERVER") {
    emojisToRender = serverEmojis;
  }

  if (searchValue) {
    emojisToRender = searchResult;
  }

  const category =
    selectedCategory.type === "UNICODE"
      ? categories[selectedCategory.id]
      : servers.find((server) => server.id === selectedCategory.id)!;

  const CategoryIcon =
    category instanceof Emoji ? (
      <category.Icon className="size-4" />
    ) : (
      <ServerIcon
        server={category}
        size={AvatarSize.XS}
        className="pointer-events-none"
      />
    );

  const onHover = useCallback(
    ({ target, type }: SyntheticEvent) => {
      const isElement = target instanceof HTMLElement;
      if (!isElement || !target.matches("button[data-name]")) {
        return;
      }

      if (!target.dataset.name) {
        return;
      }

      const emoji = EmojiMemoryStorage.getByName(target.dataset.name);

      if (!emoji) {
        return;
      }

      if (type === "click" && !emoji.isLocked(member.serverId)) {
        onSelect(emoji);

        return;
      }

      setHoveredEmoji(emoji);
    },
    [onSelect, member]
  );

  const properties = useRef({ "--size": "32px" } as CSSProperties);

  const serverHasNoEmojis =
    emojisToRender.length === 0 &&
    selectedCategory.type === "SERVER" &&
    !searchValue &&
    !isLoading;

  const categoryName =
    category instanceof Emoji ? category.category : category?.name;

  return (
    <section className="w-[16.25rem] md:w-[504px] max-w-[504px] flex bg-black-630 rounded-md emoji-picker">
      <Tabs
        selectedIndex={selectedCategory.index}
        onSelect={() => {
          scrollContainer.current?.scroll({ top: 0 });
          setSearchResult([]);
          setSearchValue("");
        }}
        className="flex w-full"
      >
        <div className="min-w-12 no-scrollbar overflow-auto max-h-[514px] px-1 w-12 bg-black-700">
          <TabList
            aria-label="Categories"
            className="flex items-center gap-2 py-[0.875rem] text-gray-150 flex-col scrollbar-black-630"
          >
            {servers.map((server, index) => (
              <Tab
                key={server.id}
                onClick={() => {
                  setSelectedCategory({
                    type: "SERVER",
                    id: server.id,
                    index,
                  });
                }}
                className="justify-center items-center flex cursor-pointer size-8 overflow-hidden"
              >
                <ServerIcon server={server} size={AvatarSize.LG} />
              </Tab>
            ))}
            <hr className="w-full mt-2.5 mb-2" />
            {categories.map(({ category, url, Icon }, index) => (
              <Tab
                className="flex cursor-pointer size-8"
                key={url}
                onClick={() => {
                  setSelectedCategory({
                    type: "UNICODE",
                    index: index + servers.length,
                    id: index,
                  });
                }}
                aria-label={category}
              >
                <span className="flex items-center justify-center size-full hover:bg-gray-500 rounded-md">
                  <Icon className="size-6" />
                </span>
              </Tab>
            ))}
            {/* <li className="w-12 p-2 h-full bg-black-700 flex flex-col list-none absolute -left-12 top-0">
                <ul>
                  {servers.map(({ id, serverIcon }) => (
                    <Tab key={id} className="w-8 cursor-pointer">
                      <Avatar src={serverIcon} alt="" width={28} height={28} />
                    </Tab>
                  ))}
                </ul>
              </li> */}
          </TabList>
        </div>
        <div className="flex flex-col flex-grow">
          <div className="flex flex-col bg-black-630 shadow-header">
            <FormField
              label="Search"
              type="search"
              name="searchEmoji"
              containers={{
                field: "max-w-unset py-2 px-3",
                fieldInputContainer: "bg-black-700 text-gray-150",
              }}
              value={searchValue}
              Icon={CategoryIcon}
              onInput={({ currentTarget }) => {
                const value = currentTarget.value
                  .replace(/^:/, "")
                  .replace(/:$/, "");

                setSearchValue(value);
              }}
            />
          </div>
          <div className="overflow-hidden rounded-ee-md rounded-es-md">
            <TabPanel className="overflow-hidden flex flex-col" forceRender>
              <h2 className="flex gap-1.5 text-gray-150 items-center ml-1 py-2 uppercase text-xs pl-3 pointer-events-none">
                {CategoryIcon}
                {categoryName}
              </h2>
              <div
                className={twMerge(
                  "overflow-auto scrollbar scrollbar-thin  scrollbar-hover min-h-[340px] overscroll-contain max-h-[340px] pl-3 pr-1 text-gray-100 w-full"
                )}
                onMouseOver={onHover}
                onFocus={onHover}
                onClick={onHover}
                ref={scrollContainer}
              >
                {hasPreviousPage && !searchValue && (
                  <div
                    ref={bottomRef}
                    className="bg-transparent h-0.5 w-full"
                  ></div>
                )}
                {isFetchingPreviousPage && (
                  <div className="flex w-full justify-center rounded-md size-12 bg-black-500 absolute top-1">
                    <Loader />
                  </div>
                )}
                {serverHasNoEmojis && (
                  <p className="text-center w-full mb-auto mt-auto">
                    This servers does not have any custom emojis! :(
                  </p>
                )}
                {searchValue && emojisToRender.length === 0 && !isLoading && (
                  <p className="text-center w-full mb-auto mt-auto">
                    There are no emojis matching searched value!
                  </p>
                )}
                <div className="flex flex-wrap w-full">
                  {emojisToRender.map((emoji) => {
                    return <EmojiItem key={emoji.uniqueName} emoji={emoji} />;
                  })}
                </div>
                {(isLoading || isLoadingCustomEmojis) && (
                  <div className="flex size-full justify-center items-center">
                    <Loader />
                  </div>
                )}
                {isFetchingNextPage && (
                  <div className="flex w-full justify-center rounded-md size-12 bg-black-500 absolute bottom-1">
                    <Loader />
                  </div>
                )}
                {hasNextPage && !searchValue && (
                  <div ref={ref} className="bg-transparent h-2 w-full"></div>
                )}
              </div>
            </TabPanel>
            {Array.from({ length: 7 + servers.length }, (_, i) => (
              <TabPanel key={i} className="sr-only"></TabPanel>
            ))}
            <div className="py-2 px-2 md:px-4 w-full bg-black-660 flex shadow-[0_0_2px_0_#313338] font-medium text-white-500">
              <span className="sr-only">Hovered emoji: </span>{" "}
              <div
                className="flex items-center gap-2 md:gap-4 w-full"
                style={properties.current}
              >
                {hoveredEmoji.isUnicode && (
                  <span
                    aria-hidden
                    style={hoveredEmoji.style}
                    className="size-8 block"
                  ></span>
                )}
                {!hoveredEmoji.isUnicode && (
                  <span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <Image
                      src={hoveredEmoji.url}
                      alt=""
                      className="size-8 block"
                      placeholder="blur"
                      decoding="sync"
                      blurDataURL={hoveredEmoji.placeholder || undefined}
                      width={32}
                      height={32}
                    />
                  </span>
                )}
                <span
                  aria-live="polite"
                  className="overflow-hidden text-ellipsis whitespace-nowrap"
                >
                  {hoveredEmoji.serializedNames}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Tabs>
    </section>
  );
}
