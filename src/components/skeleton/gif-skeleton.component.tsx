import { COLUMN_WIDTH } from "@components/gif-picker/gif-picker.constants";
import { twMerge } from "tailwind-merge";

export function GifSkeleton({
  width = COLUMN_WIDTH,
  height = 112,
  aspectRatio = "1/1",
  absolute = false,
}) {
  return (
    <div
      className={twMerge(
        "z-20 h-28 top-0 left-0 bg-gray-150 rounded-md bg-gradient-to-r from-black-560 from-25% via-black-500 via-50% to-black-560 to-100% animate-skeleton bg-[size:200%]",
        absolute && "absolute"
      )}
      style={{ width, height, aspectRatio }}
    ></div>
  );
}
