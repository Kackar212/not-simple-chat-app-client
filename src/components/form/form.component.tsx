import { HTMLProps, PropsWithChildren } from "react";
import { FormResult } from "../form-result/form-result.component";
import { builder } from "@common/simple-markdown";

export interface FormProps extends HTMLProps<HTMLFormElement> {
  result?: {
    isError: boolean;
    isSuccess: boolean;
    errorMessage: string;
    successMessage: string;
  };
}

export function Form({
  result: { isError, isSuccess, errorMessage, successMessage } = {
    isError: false,
    isSuccess: false,
    errorMessage: "",
    successMessage: "",
  },
  children,
  ...attrs
}: PropsWithChildren<FormProps>) {
  return (
    <form {...attrs}>
      <FormResult canShowMessage={isSuccess || isError} isError={isError}>
        {isError && builder.linkify(errorMessage)}
        {isSuccess && builder.linkify(successMessage)}
      </FormResult>
      <div className="flex flex-col items-center max-w-md m-auto w-full">
        {children}
      </div>
    </form>
  );
}
