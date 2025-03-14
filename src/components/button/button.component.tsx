import {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  PropsWithChildren,
} from "react";
import { Loader } from "../loader/loader.component";
import { twMerge } from "tailwind-merge";
import { PlusIcon } from "@components/icons";
import { CheckIcon } from "@components/icons/check.icon";
import { QueryResult } from "@common/hooks/query";

interface ButtonProps
  extends DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  isLoading?: boolean;
  mutationResult?: {
    isSuccess?: boolean;
    isError?: boolean;
    successMessage?: string;
    errorMessage?: string;
  };
}

export function Button({
  children,
  isLoading,
  mutationResult = {
    isSuccess: false,
    isError: false,
    successMessage: "",
    errorMessage: "",
  },
  ...attrs
}: PropsWithChildren<ButtonProps>) {
  const { isError, isSuccess } = mutationResult;

  return (
    <>
      <button
        className={twMerge(
          "button",
          attrs.className,
          isSuccess && "bg-green-500",
          isError && "bg-red-500"
        )}
        aria-disabled={isLoading}
        {...attrs}
      >
        {children}
        {isSuccess && <CheckIcon aria-hidden className="size-4" />}
        {isError && <PlusIcon aria-hidden className="size-4 rotate-45" />}
        {isLoading && <Loader aria-hidden className="size-4" />}
      </button>
      <span aria-live="polite" className="sr-only">
        {isLoading && "Wait"}
      </span>
    </>
  );
}
