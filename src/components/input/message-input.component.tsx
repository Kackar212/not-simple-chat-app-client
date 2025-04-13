/* eslint-disable @next/next/no-img-element */
"use client";

import { ErrorIcon } from "@components/icons";
import { get, useFormContext } from "react-hook-form";
import { InputProps } from "./input-props.interface";
import { twMerge } from "tailwind-merge";

interface MessageInputProps extends InputProps {
  name?: string;
  containerClassName?: string;
  setEditor: (element: HTMLDivElement | null) => void;
}

export const DEFAULT_MESSAGE_INPUT_NAME = "message";

export function MessageInput({
  name = DEFAULT_MESSAGE_INPUT_NAME,
  containerClassName,
  setEditor,
}: MessageInputProps) {
  const {
    formState: { errors },
  } = useFormContext();

  const error = get(errors, name);

  return (
    <div
      className={twMerge(
        "relative bg-black-560 focus-within:focus-default pl-[44px] pr-[136px] py-3 w-full rounded-md text-white-500 z-[999]",
        containerClassName
      )}
    >
      <div ref={setEditor}></div>
      <span
        className="text-red-500 text-sm absolute -top-2.5 -translate-y-full -left-12 sr-only"
        aria-live="polite"
      >
        {error && (
          <span className="flex items-center gap-1">
            <span aria-hidden>
              <ErrorIcon />
            </span>
            <span className="sr-only">Error: </span>
            {error.message}
          </span>
        )}
      </span>
    </div>
  );
}
