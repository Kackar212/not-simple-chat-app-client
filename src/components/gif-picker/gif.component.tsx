import {
  CellMeasurer,
  CellMeasurerCache,
  CellMeasurerProps,
  Size,
} from "react-virtualized-compat";
import { TenorGif } from "./gif-picker.types";
import { COLUMN_HEIGHT, COLUMN_WIDTH } from "./gif-picker.constants";
import { Key, useState } from "react";
import { GifSkeleton } from "@components/skeleton/gif-skeleton.component";

interface GifProps extends Omit<CellMeasurerProps, "children" | "key"> {
  cache: CellMeasurerCache;
  isFetching: boolean;
  gif: TenorGif;
  onClick: () => void;
  size: Size;
  cacheKey: Key;
}

function getHeight(size: Size) {
  return (
    Math.floor(COLUMN_WIDTH * Number((size.height / size.width).toFixed(4))) ||
    COLUMN_HEIGHT
  );
}

export function Gif({
  cache,
  index,
  cacheKey,
  parent,
  style,
  isFetching,
  gif: {
    content_description,
    media_formats: { tinymp4 },
    isPlaceholder,
  },
  size,
  onClick,
}: GifProps) {
  const [isLoading, setIsLoading] = useState(true);
  const height = getHeight(size);

  return (
    <CellMeasurer cache={cache} index={index} key={cacheKey} parent={parent}>
      <div style={style}>
        <div className="relative" style={{ width: COLUMN_WIDTH, height }}>
          <button
            aria-disabled={isFetching}
            aria-label={content_description}
            className="before:size-full before:absolute before:left-0 before:top-0 before:z-50 contents"
            onClick={onClick}
            type="button"
          ></button>
          {(isFetching || isLoading || isPlaceholder) && (
            <GifSkeleton absolute width={COLUMN_WIDTH} height={height} />
          )}
          {!isPlaceholder && (
            <video
              src={tinymp4.url}
              loop
              playsInline
              autoPlay
              muted
              preload="auto"
              width={COLUMN_WIDTH}
              height={height}
              onLoadedData={() => setIsLoading(false)}
              style={{
                width: COLUMN_WIDTH,
                height,
                aspectRatio: `${COLUMN_WIDTH} / ${height}`,
              }}
              className="rounded-md"
            ></video>
          )}
        </div>
      </div>
    </CellMeasurer>
  );
}
