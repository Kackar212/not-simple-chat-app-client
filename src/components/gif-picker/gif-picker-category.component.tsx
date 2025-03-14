import Image from "next/image";
import { COLUMN_WIDTH } from "./gif-picker.constants";
import { Dispatch, SetStateAction, useState } from "react";
import { GifSkeleton } from "@components/skeleton/gif-skeleton.component";

interface GifPickerCategory {
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  image: string;
}

export function GifPickerCategory({
  searchTerm,
  image,
  setSearchTerm,
}: GifPickerCategory) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <button
      key={searchTerm}
      className="h-28 relative rounded-md border-0 cursor-pointer overflow-hidden"
      onClick={() => {
        setSearchTerm(searchTerm);
      }}
      style={{ width: COLUMN_WIDTH }}
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
        style={{ width: COLUMN_WIDTH, height: 112 }}
        onLoad={() => setIsLoading(false)}
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
