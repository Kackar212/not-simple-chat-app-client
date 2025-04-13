import { COLUMN_WIDTH } from "./gif-picker.constants";
import { MouseEventHandler, useCallback, useState } from "react";
import { GifSkeleton } from "@components/skeleton/gif-skeleton.component";
import { useFormContext } from "react-hook-form";
import Image from "next/image";

interface GifPickerCategory {
  searchTerm: string;
  image: string;
}

const style = { width: COLUMN_WIDTH };
const categoryStyle = { width: COLUMN_WIDTH, height: 112 };

export function GifPickerCategory({ searchTerm, image }: GifPickerCategory) {
  const [isLoading, setIsLoading] = useState(true);

  const { setValue } = useFormContext();

  const onClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    ({ currentTarget }) => {
      const {
        dataset: { searchTerm },
      } = currentTarget;

      if (!searchTerm) {
        return;
      }

      setValue("searchTerm", searchTerm);
    },
    [setValue]
  );

  const onLoad = useCallback(() => setIsLoading(false), []);

  return (
    <button
      key={searchTerm}
      className="h-28 relative rounded-md border-0 cursor-pointer overflow-hidden"
      onClick={onClick}
      data-search-term={searchTerm}
      style={style}
      type="button"
    >
      {isLoading && (
        <div className="absolute top-0 left-0 size-full z-50">
          <GifSkeleton />
        </div>
      )}
      <Image
        loading="lazy"
        src={image}
        width={COLUMN_WIDTH}
        height={112}
        alt={searchTerm}
        className="object-cover"
        unoptimized={true}
        style={categoryStyle}
        onLoad={onLoad}
      />
      <div
        aria-hidden
        className="pointer-events-none flex justify-center items-center text-white-500 absolute bg-black-700/70 size-full top-0 left-0 hover:bg-black-700/50"
      >
        {searchTerm}
      </div>
    </button>
  );
}
