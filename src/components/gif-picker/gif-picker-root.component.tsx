import { queries } from "@common/api";
import { useQuery } from "@common/api/hooks/use-query.hook";
import { QueryKey } from "@common/constants";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import Image from "next/image";
import {
  CellMeasurerCache,
  createMasonryCellPositioner,
  Masonry,
} from "react-virtualized-compat";
import { TenorGif } from "./gif-picker.types";
import { GifPickerMasonry } from "./gif-picker-masonry.component";
import {
  COLUMN_WIDTH,
  COLUMN_COUNT,
  GAP,
  COLUMN_HEIGHT,
} from "./gif-picker.constants";
import { GifSkeleton } from "@components/skeleton/gif-skeleton.component";
import { GifPickerCategory } from "./gif-picker-category.component";
import { getQueryClient } from "@/app/get-query-client";

interface GifPickerRootProps {
  setSearchTerm: Dispatch<SetStateAction<string>>;
  searchTerm: string;
  onSelect: (tenorGif: TenorGif) => void;
}

function debounce(callback: (...args: any[]) => void) {
  let debounceId = -1;

  return (...args: any[]) => {
    if (debounceId !== -1) {
      window.clearTimeout(debounceId);
    }

    debounceId = window.setTimeout(() => {
      callback(...args);

      debounceId = -1;
    }, 250);
  };
}

const createPlaceholderGif = (width: number, height: number): TenorGif => {
  const id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);

  return {
    content_description: "",
    content_description_source: "",
    created: 0,
    flags: [],
    hasaudio: false,
    id: `${id}`,
    itemurl: "",
    media_formats: {
      tinymp4: {
        dims: [width, height],
        url: "",
        size: 0,
        preview: "",
        duration: 0,
      },
    },
    tags: [],
    title: "",
    url: "",
    isPlaceholder: true,
  };
};

export function GifPickerRoot({
  setSearchTerm,
  searchTerm,
  onSelect,
}: GifPickerRootProps) {
  const { data, isLoading } = useQuery({
    queryKey: QueryKey.GifCategories,
    queryFn: () => queries.getGifCategories(),
    enabled: searchTerm === "",
  });

  const {
    data: gifs,
    isLoading: isLoadingGifs,
    isFetching,
    isFetchingNextPage,
    isPending,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: QueryKey.Gifs,
    queryFn: ({ pageParam }) =>
      queries.getGifs({ searchTerm, next: pageParam }),
    enabled: false,
    initialPageParam: "0",
    getNextPageParam(lastPage) {
      if (lastPage.data?.next === "") {
        return;
      }

      return lastPage.data?.next;
    },
    initialData: {
      pageParams: ["0"],
      pages: [
        {
          error: null,
          status: {
            isError: false,
            isSuccess: true,
            errorMessage: "",
            successMessage: "",
          },
          data: {
            results: Array.from({ length: 6 }).map(() =>
              createPlaceholderGif(
                Math.floor(Math.random() * (400 - 206.5) + 206.5),
                Math.floor(Math.random() * (400 - 206.5) + 206.5)
              )
            ),
            next: "",
          },
        },
      ],
    },
  });

  const refetchGifs = useMemo(() => debounce(() => refetch()), [refetch]);
  const queryClient = useQueryClient();

  const items = useMemo(
    () => gifs?.pages.flatMap(({ data }) => data?.results || []) || [],
    [gifs]
  );

  const [itemsWithSizes, setItemsWithSizes] = useState<
    Array<{ item: TenorGif; size: { width: number; height: number } }>
  >([]);

  const cache = useMemo(
    () =>
      new CellMeasurerCache({
        defaultHeight: COLUMN_HEIGHT,
        defaultWidth: COLUMN_WIDTH,
        fixedWidth: true,
        keyMapper: (index) => items[index]?.id,
      }),
    [items]
  );

  const cellPositionerConfig = useMemo(
    () => ({
      cellMeasurerCache: cache,
      columnCount: COLUMN_COUNT,
      columnWidth: COLUMN_WIDTH,
      spacer: GAP,
    }),
    [cache]
  );

  const cellPositioner = useMemo(() => {
    return createMasonryCellPositioner(cellPositionerConfig);
  }, [cellPositionerConfig]);

  useEffect(() => {
    if (!searchTerm) {
      queryClient.resetQueries({ queryKey: QueryKey.Gifs });

      return;
    }

    refetchGifs();
  }, [searchTerm, refetchGifs, queryClient]);

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    cache.clearAll();
    cellPositioner.reset(cellPositionerConfig);
    masonry.current?.clearCellPositions();

    setItemsWithSizes(
      items.map((item) => {
        return {
          item,
          size: {
            width: item.media_formats.tinymp4.dims[0],
            height: item.media_formats.tinymp4.dims[1],
          },
        };
      })
    );
  }, [items, cache, cellPositioner, cellPositionerConfig]);

  const masonry = useRef<Masonry>(null);

  return (
    <div>
      <div className="h-[328px] w-full">
        <div
          className={twMerge(
            "h-full scrollbar scrollbar-thin no-scrollbar scrollbar-hover pl-3 pr-3 hover:pr-1 overflow-auto",
            searchTerm && "hidden"
          )}
        >
          <div className="grid grid-cols-[1fr_1fr] gap-[0.76rem] mt-3 overflow-hidden  pb-3 ">
            {isLoading && (
              <>
                <GifSkeleton />
                <GifSkeleton />
                <GifSkeleton />
                <GifSkeleton />
                <GifSkeleton />
                <GifSkeleton />
              </>
            )}
            {data.data?.tags.map(({ name, searchterm, image }) => (
              <GifPickerCategory
                key={name}
                searchTerm={searchterm}
                setSearchTerm={setSearchTerm}
                image={image}
              />
            ))}
          </div>
        </div>
        <div className="pl-3 pt-2 h-full">
          <GifPickerMasonry
            itemsWithSizes={searchTerm ? itemsWithSizes : []}
            isFetching={isFetching && !isFetchingNextPage}
            isLoading={isLoadingGifs}
            onSelect={onSelect}
            ref={masonry}
            cache={cache}
            cellPositioner={cellPositioner}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
          />
        </div>
      </div>
    </div>
  );
}
