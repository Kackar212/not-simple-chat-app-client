import { UPLOAD_ICON_ALLOWED_MIME_TYPES } from "@common/constants";
import {
  FormField,
  FormFieldProps,
} from "@components/form-field/form-field.component";
import { PlusIcon } from "@components/icons/plus.icon";
import { UploadIcon } from "@components/icons/upload.icon";
import { InputProps } from "@components/input/input-props.interface";
import { Input } from "@components/input/input.component";
import { HistoryFile, useUpload } from "@components/upload/use-upload.hook";
import Image from "next/image";
import { LegacyRef, useCallback, useEffect } from "react";
import {
  Controller,
  FieldError,
  useFormContext,
  UseFormRegisterReturn,
} from "react-hook-form";
import { twMerge } from "tailwind-merge";

export type UploadProps<
  Type extends "file",
  CustomFileData extends Record<string, unknown>
> = InputProps & {
  type?: Type;
  label?: string;
  name?: string;
  uploadProps?: UseFormRegisterReturn;
  error?: FieldError;
  files?: Array<HistoryFile<CustomFileData>>;
  file?: HistoryFile<CustomFileData>;
  isFileSelected?: boolean;
};

const defaultAccept = UPLOAD_ICON_ALLOWED_MIME_TYPES.join(", ");

export function Upload<CustomFileData extends Record<string, unknown>>({
  label = "Upload file",
  name = "uploadFile",
  id = name,
  accept = defaultAccept,
  isHidden: _isHidden,
  files = [],
  file,
  isFileSelected = false,
  error,
  ref,
  ...attrs
}: UploadProps<"file", CustomFileData>) {
  return (
    <div className="flex justify-center px-4 pb-2">
      <Controller
        name={name}
        render={({ field }) => (
          <Input
            type="file"
            id={id}
            className="sr-only peer"
            accept={accept}
            {...attrs}
            {...field}
            value={field.value?.fileName}
            onChange={(e) => {
              const {
                currentTarget: { files },
              } = e;

              if (!files) {
                return;
              }

              if (!attrs.multiple) {
                field.onChange(files[0]);
              }

              if (attrs.multiple) {
                field.onChange(files);
              }

              attrs.onChange?.(e);
            }}
          />
        )}
      />
      <label
        htmlFor={id}
        className="cursor-pointer flex flex-col items-center gap-4 peer-focus:*:border-solid peer-focus:*:outline peer-focus:*:outline-offset-2 peer-focus:*:outline-blue-500"
      >
        {file && (
          <Image
            src={file.url}
            alt=""
            width={80}
            height={80}
            className="rounded-[50%] peer-focus:border-solid peer-focus:outline peer-focus:outline-offset-2 peer-focus:outline-blue-500 w-20! h-20!"
          />
        )}
        <div
          aria-hidden
          className={twMerge(
            "inline-flex flex-col justify-center rounded-[50%] items-center border-2 border-dashed bg-black-700/60 border-green-500 uppercase relative text-xs p-4 aspect-square gap-1",
            isFileSelected && "hidden"
          )}
        >
          <span className="absolute top-[5px] -right-1 bg-green-500 rounded-[50%] p-1">
            <PlusIcon className="size-4" />
          </span>
          <UploadIcon />
          <span className="font-bold">Upload</span>
        </div>
        <span
          className={twMerge(
            "uppercase font-bold outline-0! bg-transparent outline-none",
            isFileSelected && "sr-only"
          )}
        >
          {label}
        </span>
        <span
          className="text-red-500 text-sm mt-1 outline-0!"
          aria-live="polite"
        >
          {error && <span>{error.message}</span>}
        </span>
      </label>
    </div>
  );
}
