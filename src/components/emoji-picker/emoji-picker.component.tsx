import {
  FormEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { FormField } from "@components/form-field/form-field.component";
import { useQuery } from "@common/api/hooks/use-query.hook";
import { getServerEmojis, getUserServers } from "@common/api";
import { useSafeContext } from "@common/hooks";
import { authContext } from "@common/auth/auth.context";
import { EmojiMemoryStorage } from "@common/emojis/emojis.storage";
import { categories } from "@common/emojis";
import { Emoji, EmojiType } from "@common/emojis/emoji.class";
import { ServerIcon } from "@components/server-icon/server-icon.component";
import { AvatarSize } from "@common/constants";
import { FormProvider, useForm } from "react-hook-form";
import { HoveredEmoji } from "./hovered-emoji.component";
import { EmojiPickerPanel } from "./emoji-picker-panel.component";
import Fuse from "fuse.js";
import {
  CategoryType,
  EmojiPickerProps,
  emojis,
  fieldClassNames,
  getCategory,
  getCustomEmojis,
  getUnicodeEmojis,
  search,
  SelectedCategory,
} from "./emoji-picker.utils";
import { useEmojis } from "./use-emojis.hook";
import { debounce } from "@components/gif-picker/gif-picker.helpers";
import { Loader } from "@components/loader/loader.component";
import { EmojiItem } from "./emoji-item.component";
import { PopoverProvider } from "@components/popover/popover.context";
import { PopoverTrigger } from "@components/popover/popover-trigger.component";
import { twMerge } from "tailwind-merge";
import { Popover } from "@components/popover/popover.component";
import { useEmojiStyle } from "@common/emojis/use-emoji-style.hook";

export function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [hoveredEmoji, setHoveredEmoji] = useState<Emoji>(emojis[0]);
  const [searchResult, setSearchResult] = useState<Emoji[]>([]);

  const useFormResult = useForm({
    defaultValues: {
      emojiName: "",
    },
  });

  const searchValue = useFormResult.watch("emojiName");

  const queryClient = useQueryClient();

  const { data: servers = [] } = useMemo(
    () =>
      queryClient.getQueryData<Awaited<ReturnType<typeof getUserServers>>>([
        "get-user-servers",
      ]) || { data: [] },
    [queryClient]
  );

  const scrollContainer = useRef<HTMLDivElement | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<SelectedCategory>(
    () => {
      const server = servers.at(0);

      if (!server) {
        return {
          type: CategoryType.Unicode,
          index: 0,
          id: 0,
        };
      }

      return { type: CategoryType.Server, id: server.id, index: 0 };
    }
  );

  const {
    isLoading,
    hasNextPage,
    hasPreviousPage,
    fetchNextPage,
    fetchPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    emojis: emojisToRender,
  } = useEmojis({ selectedCategory, searchResult, searchValue });

  const onChange = useCallback<FormEventHandler<HTMLInputElement>>(
    ({ currentTarget: { value } }) => {
      const isServerSelected = selectedCategory.type === CategoryType.Server;

      const searchValue = value.replace(/^:/, "").replace(/:$/, "");

      if (searchValue) {
        const emojisToSearch = isServerSelected
          ? getCustomEmojis(selectedCategory.id)
          : getUnicodeEmojis(selectedCategory.id);

        const fuse = new Fuse(emojisToSearch, {
          keys: isServerSelected ? ["uniqueName"] : ["names"],
        });

        const getSearchResult = debounce(() => {
          setSearchResult(search(fuse, searchValue));
        });

        if (searchResult.length === 0) {
          setSearchResult(search(fuse, searchValue));

          return;
        }

        getSearchResult();

        return;
      }
    },
    [searchResult.length, selectedCategory.id, selectedCategory.type]
  );

  const category = getCategory(selectedCategory, servers);

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

  const categoryName =
    category instanceof Emoji ? category.category : category?.name;

  const onClear = useCallback(() => {
    scrollContainer.current?.scroll({ top: 0 });
    useFormResult.reset();
    setSearchResult([]);
  }, [useFormResult]);

  const [{ row, column, isMouseOver }, setEmoji] = useState({
    row: 2,
    column: 10,
    isMouseOver: false,
  });

  const getRandom = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  const onMouseEnter = () => {
    const row = getRandom(0, 3);
    setEmoji({
      row,
      column: getRandom(0, row === 3 ? 16 : 19),
      isMouseOver: true,
    });
  };

  const onMouseLeave = () => {
    setEmoji({ row, column, isMouseOver: false });
  };

  const { style, properties } = useEmojiStyle({
    row,
    column,
  });

  return (
    <PopoverProvider
      offset={{ mainAxis: 15, alignmentAxis: -10 }}
      placement="top-end"
    >
      <PopoverTrigger
        style={properties}
        type="button"
        className="size-6 flex justify-center items-center"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div
          style={style.background}
          className={twMerge(
            "size-6 absolute transition-[scale] opacity-0",
            isMouseOver && "scale-125 opacity-100"
          )}
        ></div>
        <div
          style={style.mask}
          className={twMerge(
            "size-6 bg-gray-150 absolute transition-[scale] duration-200",
            isMouseOver && "opacity-0 scale-125"
          )}
        ></div>
      </PopoverTrigger>
      <Popover>
        <section className="w-[16.25rem] md:w-[504px] max-w-[504px] flex bg-black-630 rounded-md emoji-picker">
          <Tabs
            selectedIndex={selectedCategory.index}
            onSelect={onClear}
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
                        type: CategoryType.Server,
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
                        type: CategoryType.Unicode,
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
              </TabList>
            </div>
            <div className="flex flex-col flex-grow">
              <div className="flex flex-col bg-black-630 shadow-header">
                <FormProvider {...useFormResult}>
                  <FormField
                    label="Search"
                    type="search"
                    name="emojiName"
                    containers={fieldClassNames}
                    Icon={CategoryIcon}
                    onClear={onClear}
                    onChange={onChange}
                  />
                </FormProvider>
              </div>
              <div className="overflow-hidden rounded-ee-md rounded-es-md">
                <TabPanel className="overflow-hidden flex flex-col" forceRender>
                  <h2 className="flex gap-1.5 text-gray-150 items-center ml-1 py-2 uppercase text-xs pl-3 pointer-events-none">
                    {CategoryIcon}
                    {categoryName}
                  </h2>
                  <EmojiPickerPanel
                    onSelect={onSelect}
                    setHoveredEmoji={setHoveredEmoji}
                    hasNextPage={hasNextPage}
                    hasPreviousPage={hasPreviousPage}
                    fetchNextPage={fetchNextPage}
                    fetchPreviousPage={fetchPreviousPage}
                    scrollContainer={scrollContainer}
                  >
                    {isFetchingPreviousPage && (
                      <div className="flex w-full justify-center rounded-md size-12 bg-black-500 absolute top-1">
                        <Loader />
                      </div>
                    )}
                    {emojisToRender.length === 0 && !isLoading && (
                      <p className="text-center w-full mb-auto mt-auto">
                        Sorry, we can&apos;t find any emojis!
                      </p>
                    )}
                    <div className="flex flex-wrap w-full">
                      {emojisToRender.map((emoji) => {
                        return (
                          <EmojiItem key={emoji.uniqueName} emoji={emoji} />
                        );
                      })}
                    </div>
                    {isLoading && (
                      <div className="flex size-full justify-center items-center">
                        <Loader />
                      </div>
                    )}
                    {isFetchingNextPage && (
                      <div className="flex w-full justify-center rounded-md size-12 bg-black-500 absolute bottom-1">
                        <Loader />
                      </div>
                    )}
                  </EmojiPickerPanel>
                </TabPanel>
                {Array.from({ length: 7 + servers.length }, (_, i) => (
                  <TabPanel key={i} className="sr-only"></TabPanel>
                ))}
                <HoveredEmoji hoveredEmoji={hoveredEmoji} />
              </div>
            </div>
          </Tabs>
        </section>
      </Popover>
    </PopoverProvider>
  );
}
