import {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  PropsWithChildren,
} from "react";
import { Loader } from "../loader/loader.component";
import { twMerge } from "tailwind-merge";
import { CheckIcon } from "@components/icons/check.icon";
import { QueryResult } from "@common/hooks/query";
import CloseIcon from "/public/assets/icons/close.svg";

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
  className,
  ...attrs
}: PropsWithChildren<ButtonProps>) {
  const { isError, isSuccess } = mutationResult;

  return (
    <>
      <button
        className={twMerge(
          "button",
          className,
          isSuccess && "bg-green-500",
          isError && "bg-red-500"
        )}
        aria-disabled={isLoading}
        {...attrs}
      >
        {children}
        {isSuccess && <CheckIcon aria-hidden className="size-4" />}
        {isError && <CloseIcon aria-hidden className="size-4 rotate-45" />}
        {isLoading && <Loader aria-hidden className="size-4" />}
      </button>
      <span aria-live="polite" className="sr-only">
        {isLoading && "Wait"}
      </span>
    </>
  );
}
