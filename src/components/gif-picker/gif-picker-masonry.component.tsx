import { useCallback, useMemo, useRef } from "react";
import { MasonryCellProps } from "react-virtualized";
import {
  CellMeasurer,
  CellMeasurerCache,
  Masonry,
  OnScrollCallback,
  Positioner,
  ScrollParams,
  Size,
} from "react-virtualized-compat";
import { TenorGif } from "./gif-picker.types";
import { COLUMN_HEIGHT, COLUMN_WIDTH } from "./gif-picker.constants";
import { Gif } from "./gif.component";
import { useSafeContext } from "@common/hooks";
import { popoverContext } from "@components/popover/popover.context";

interface GifPickerMasonry {
  itemsWithSizes: Array<{
    item: TenorGif;
    size: { width: number; height: number };
  }>;
  isFetching: boolean;
  isLoading: boolean;
  onSelect: (tenorGif: TenorGif) => void;
  ref: React.MutableRefObject<Masonry | null>;
  cache: CellMeasurerCache;
  cellPositioner: Positioner;
  hasNextPage: boolean;
  fetchNextPage: () => Promise<unknown>;
}

export function GifPickerMasonry({
  itemsWithSizes,
  isFetching,
  onSelect,
  ref,
  cache,
  cellPositioner,
  hasNextPage,
  fetchNextPage,
}: GifPickerMasonry) {
  const { setIsOpen } = useSafeContext(popoverContext);

  const cellRenderer = useCallback(
    function cellRenderer({ key, index, ...cellProps }: MasonryCellProps) {
      const { item, size } = itemsWithSizes[index] || {};

      if (!item) {
        return null;
      }

      const onClick = () => {
        onSelect(item);

        setIsOpen(false);
      };

      return (
        <Gif
          key={key}
          cacheKey={key}
          index={index}
          size={size}
          onClick={onClick}
          gif={item}
          cache={cache}
          isFetching={isFetching}
          {...cellProps}
        />
      );
    },
    [cache, isFetching, itemsWithSizes, onSelect, setIsOpen]
  );

  const isFetchingNextPage = useRef<boolean>(false);

  const onScroll: OnScrollCallback = useCallback(
    async (e) => {
      if (isFetchingNextPage.current || !hasNextPage) {
        return;
      }

      const margin = e.scrollHeight * 0.15;
      if (e.scrollTop > e.scrollHeight - margin) {
        isFetchingNextPage.current = true;

        await fetchNextPage();

        isFetchingNextPage.current = false;
      }
    },
    [fetchNextPage, hasNextPage]
  );

  return useMemo(
    () => (
      <Masonry
        keyMapper={(index) => itemsWithSizes[index]?.item.id}
        cellCount={itemsWithSizes.length}
        cellMeasurerCache={cache}
        cellPositioner={cellPositioner}
        cellRenderer={cellRenderer}
        overscanByPixels={160}
        autoHeight={false}
        height={320}
        width={441}
        className="scrollbar scrollbar-thin"
        ref={ref}
        onScroll={onScroll}
      />
    ),
    [cache, cellPositioner, cellRenderer, itemsWithSizes, onScroll, ref]
  );
}
