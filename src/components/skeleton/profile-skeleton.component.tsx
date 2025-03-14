import { CSSProperties } from "react";
import { twMerge } from "tailwind-merge";

export function ProfileSkeleton() {
  const gradient =
    "bg-gradient-to-r from-black-560 from-25% via-black-500 via-50% to-black-560 to-100% animate-skeleton bg-[size:200%]";

  return (
    <div className="w-full pb-4">
      <div className="h-40 relative">
        <div className={twMerge("h-28 bg-black-560", gradient)}></div>
        <div
          className={twMerge(
            "absolute left-2 top-16 size-24 rounded-[50%] border-[6px] border-current bg-black-560",
            gradient
          )}
        ></div>
      </div>
      <div className="flex justify-between w-full px-4 mt-2">
        <div className="flex flex-col gap-2 w-1/3">
          <span
            className={twMerge("h-4 w-3/4 rounded-full bg-black-500", gradient)}
          ></span>
          <span
            className={twMerge(
              "h-4 w-full rounded-full bg-black-500",
              gradient
            )}
          ></span>
        </div>
        <div className="w-1/4">
          <span className=""></span>
          <span
            className={twMerge(
              "h-6 w-[25%] rounded-full bg-black-500",
              gradient
            )}
          ></span>
        </div>
      </div>
      <div className="px-4 ">
        <span
          className={twMerge(
            "flex w-full h-40 rounded-md bg-black-500 mt-4",
            gradient
          )}
        ></span>
      </div>
    </div>
  );
}
