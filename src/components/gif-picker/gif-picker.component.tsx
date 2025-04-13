import { FormEventHandler, useCallback, useState } from "react";
import { PopoverTrigger } from "@components/popover/popover-trigger.component";
import { Popover } from "@components/popover/popover.component";
import { PopoverProvider } from "@components/popover/popover.context";
import { GifPickerRoot } from "./gif-picker-root.component";
import { FormField } from "@components/form-field/form-field.component";
import GifIcon from "/public/assets/icons/gif.svg";
import SearchIcon from "/public/assets/icons/search.svg";
import { TenorGif } from "./gif-picker.types";
import { FormProvider, useForm } from "react-hook-form";

const defaultOnSelect = (_tenorGif: TenorGif) => {};
const offset = { mainAxis: 15, alignmentAxis: -10 };

export function GifPicker({ onSelect = defaultOnSelect }) {
  const useFormResult = useForm({
    defaultValues: {
      searchTerm: "",
    },
  });
  const searchTerm = useFormResult.watch("searchTerm");

  const onClear = useCallback(() => {
    useFormResult.reset();
  }, [useFormResult]);

  return (
    <PopoverProvider
      offset={offset}
      placement="top-end"
      strategy="fixed"
      onOpenChange={onClear}
    >
      <PopoverTrigger
        className="size-6 flex justify-center items-center hover:animate-wiggle"
        type="button"
      >
        <span className="sr-only">Open gif picker</span>
        <GifIcon className="size-6" />
      </PopoverTrigger>
      <Popover shouldRenderInPortal>
        <div className="w-[16.25rem] md:w-[453px] max-w-[453px] flex bg-black-630 rounded-md flex-col">
          <FormProvider {...useFormResult}>
            <div className="py-2 px-3 pb-0 shadow-header relative z-50">
              <FormField
                type="search"
                label="Search gifs"
                Icon={<SearchIcon className="size-5" />}
                name="searchTerm"
                value={searchTerm}
                onClear={onClear}
              />
            </div>
            <GifPickerRoot searchTerm={searchTerm} onSelect={onSelect} />
          </FormProvider>
        </div>
      </Popover>
    </PopoverProvider>
  );
}
