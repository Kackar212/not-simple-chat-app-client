import { ErrorIcon, PlusIcon } from "@components/icons";
import { Input } from "@components/input/input.component";
import { MessageInput } from "@components/input/message-input.component";
import { UploadProps } from "@components/upload/upload.component";
import { useUpload } from "@components/upload/use-upload.hook";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { twMerge } from "tailwind-merge";

const defaultAccept = "";

export function MessageUpload<Type extends "file">({
  label = "Upload file",
  name = "messageUpload",
  id = name,
  accept = defaultAccept,
  isHidden: _isHidden,
  uploadProps,
  error,
  files = [],
  ...attrs
}: UploadProps<Type, { isSpoiler: boolean }>) {
  return (
    <div className="flex justify-center px-2.5 py-0 absolute top-3 z-10">
      <Input
        type="file"
        id={id}
        className="sr-only peer"
        accept={accept}
        aria-describedby="message-upload-hint"
        multiple
        {...attrs}
      />
      <label
        htmlFor={id}
        className="group justify-center aspect-square cursor-pointer rounded-[50%] flex items-center peer-[:focus:first-child]:border-solid peer-[:focus:first-child]:outline peer-[:focus:first-child]:outline-offset-2 peer-[:focus:first-child]:outline-blue-500"
      >
        <div
          aria-hidden
          className={`inline-flex justify-center items-center border-green-500 uppercase relative text-xs gap-1`}
        >
          <span className="bg-green-500 rounded-[50%] p-1 hover:rounded-[25%] transition-[border-radius]">
            <PlusIcon className="size-4" />
          </span>
        </div>
        <span
          className={`sr-only uppercase font-bold outline-0 bg-transparent`}
        >
          {label}
        </span>
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
      </label>
      <div role="alert" className="sr-only" id="message-upload-hint">
        {files.length} files selected
        <ul>
          {files.map(({ name }) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
