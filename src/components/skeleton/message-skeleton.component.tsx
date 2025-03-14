import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

interface MessageSkeletonProps {
  isEven: boolean;
  small?: boolean;
  pulse?: boolean;
}

export function MessageSkeleton({
  isEven,
  small,
  pulse,
}: MessageSkeletonProps) {
  const gradient =
    "bg-gradient-to-r from-black-560 from-25% via-black-500 via-50% to-black-560 to-100% animate-skeleton bg-[size:200%]";

  return (
    <div className="flex p-4 animate-skeleton">
      <div className="shrink-0">
        <span
          className={twMerge(
            "size-12 block rounded-full bg-black-500",
            gradient
          )}
        ></span>
      </div>

      <div className="ms-4 mt-2 w-full min-w-72">
        <div className="flex gap-2 w-3/4">
          <span className="h-4 w-[40%] rounded-full bg-black-500"></span>
          <span className="h-4 w-[20%] rounded-full bg-black-500"></span>
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex gap-1 w-10/12">
            <span
              className={twMerge(
                "flex-grow-[1] h-4 rounded-full bg-black-500",
                gradient
              )}
            ></span>
            <span
              className={twMerge(
                "flex-grow-[3] h-4 rounded-full bg-black-500",
                gradient
              )}
            ></span>
            {isEven && (
              <span
                className={twMerge(
                  "flex-grow-[2] h-4 rounded-full bg-black-500",
                  gradient
                )}
              ></span>
            )}
            <span
              className={twMerge(
                "flex-grow-[1] h-4 rounded-full bg-black-500",
                gradient
              )}
            ></span>
            {!small && (
              <>
                <span
                  className={twMerge(
                    "flex-grow-[3] h-4 rounded-full bg-black-500",
                    gradient
                  )}
                ></span>
                <span
                  className={twMerge(
                    "flex-grow-[2] h-4 rounded-full bg-black-500",
                    gradient
                  )}
                ></span>
              </>
            )}
          </div>
          <div className="flex gap-1 w-10/12">
            {!isEven && (
              <span
                className={twMerge(
                  "flex-grow-[1] h-4 rounded-full bg-black-500",
                  gradient
                )}
              ></span>
            )}
            <span
              className={twMerge(
                "flex-grow-[5] h-4 rounded-full bg-black-500",
                gradient
              )}
            ></span>
            {!small && (
              <span
                className={twMerge(
                  "flex-grow-[2] h-4 rounded-full bg-black-500",
                  gradient
                )}
              ></span>
            )}
            <span
              className={twMerge(
                "flex-grow-[2] h-4 rounded-full bg-black-500",
                gradient
              )}
            ></span>
            {!isEven && (
              <span
                className={twMerge(
                  "flex-grow-[2] h-4 rounded-full bg-black-500",
                  gradient
                )}
              ></span>
            )}
          </div>
          <div className="flex gap-1 w-10/12">
            <span
              className={twMerge(
                "flex-grow-[10] h-4 rounded-full bg-black-500",
                gradient
              )}
            ></span>
            <span
              className={twMerge(
                "flex-grow-[10] h-4 rounded-full bg-black-500",
                gradient
              )}
            ></span>
            {isEven && (
              <span
                className={twMerge(
                  "flex-grow-[5] h-4 rounded-full bg-black-500",
                  gradient
                )}
              ></span>
            )}
            <span
              className={twMerge(
                "flex-grow-[3] h-4 rounded-full bg-black-500",
                gradient
              )}
            ></span>
            {!small && (
              <>
                <span
                  className={twMerge(
                    "flex-grow-[5] h-4 rounded-full bg-black-500",
                    gradient
                  )}
                ></span>
                <span
                  className={twMerge(
                    "flex-grow-[5] h-4 rounded-full bg-black-500",
                    gradient
                  )}
                ></span>
              </>
            )}
          </div>
        </div>
        {isEven && !small && (
          <>
            <span
              className={twMerge(
                "mt-4 flex h-[312px] w-[312px] bg-black-630 rounded-md",
                gradient
              )}
            ></span>
            <div className="flex mt-4 w-[400px] bg-black-630 p-2 gap-2">
              <span
                className={twMerge(
                  "size-12 block rounded-md bg-black-500",
                  gradient
                )}
              ></span>
              <div className="flex flex-col w-full justify-center gap-1">
                <span
                  className={twMerge(
                    "w-[35%] h-4 rounded-full bg-black-500",
                    gradient
                  )}
                ></span>
                <span
                  className={twMerge(
                    "w-[10%] h-4 rounded-full bg-black-500",
                    gradient
                  )}
                ></span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
