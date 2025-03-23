"use client";

import {
  EventHandler,
  HTMLProps,
  MouseEventHandler,
  ReactElement,
  ReactNode,
  SyntheticEvent,
  useCallback,
  useState,
} from "react";
import { Input } from "@components/input/input.component";
import { InputType } from "@common/constants";
import { TogglePassword } from "@components/toggle-password/toggle-password.component";
import { useTogglePassword } from "@components/toggle-password/use-toggle-password.hook";
import { twMerge } from "tailwind-merge";
import { useFormField } from "./use-form-field.hook";
import CloseIcon from "/public/assets/icons/close.svg";
import { Button } from "@components/button/button.component";

export type FormFieldProps = Omit<HTMLProps<HTMLInputElement>, "label"> & {
  label: React.ReactNode;
  name: string;
  Icon?: ReactNode;
  hint?: ReactNode;
  onClear?: () => void;
  containers?: {
    field?: string;
    fieldInner?: string;
    fieldInputContainer?: string;
  };
  copy?: boolean;
};

export function FormField(props: FormFieldProps) {
  const { isHidden, setIsHidden } = useTogglePassword();
  const [isCopied, setIsCopied] = useState(false);

  const {
    Icon,
    label,
    type = "text",
    hint,
    containers,
    className,
    onClear,
    copy,
    ...attrs
  } = props;
  const { registerProps, error, errorId, hintId, id } = useFormField(props);
  const labelClassName = twMerge(
    "flex uppercase text-xs font-bold text-gray-360 leading-none mb-1",
    error && "mb-0",
    props.className
  );

  const isPasswordInput = props.type === InputType.Password;
  const canDisplayClearButton =
    props.type === InputType.Search && props.value !== "" && !!onClear;

  const onClick: MouseEventHandler = useCallback(
    ({ currentTarget }) => {
      if (!canDisplayClearButton) {
        return;
      }

      onClear();

      const { previousElementSibling } = currentTarget.closest("div")!;
      const input = previousElementSibling as HTMLInputElement;

      input.focus();
    },
    [canDisplayClearButton, onClear]
  );

  const copyToClipboard: EventHandler<SyntheticEvent<HTMLButtonElement>> =
    useCallback(
      async ({ currentTarget }) => {
        if (isCopied) {
          return;
        }

        const id = currentTarget.dataset.control;

        const input = currentTarget.parentElement?.querySelector(`#${id}`);
        const isInput = input instanceof HTMLInputElement;

        if (!isInput) {
          return;
        }

        await window.navigator.clipboard.writeText(input.value);

        setIsCopied(true);

        setTimeout(() => {
          setIsCopied(false);
        }, 3000);
      },
      [isCopied]
    );

  return (
    <div
      className={twMerge(
        "flex flex-col max-w-md w-full my-1.5",
        containers?.field
      )}
    >
      <div
        className={twMerge(
          "flex flex-col-reverse relative",
          containers?.fieldInner
        )}
      >
        <div
          className={twMerge(
            "flex gap-1 items-center text-gray-150 rounded-lg bg-black-700 focus-within:outline focus-within:outline-blue-500 *:focus-within:outline-none has-[[aria-invalid=true]]:outline-red-500 has-[[aria-invalid=true]]:outline-1  has-[[aria-invalid=true]]:focus-within:outline-2",
            containers?.fieldInputContainer
          )}
        >
          {Icon && <div className="pl-4 bg-inherit">{Icon}</div>}
          <Input
            {...attrs}
            id={id}
            type={type}
            className={twMerge(
              "outline-none focus-visible:outline-0! bg-inherit peer",
              className,
              isPasswordInput && "pr-12",
              canDisplayClearButton && "pr-12"
            )}
            aria-invalid={!!error}
            aria-describedby={`${errorId} ${hintId}`}
            isHidden={isHidden}
            readOnly={copy || attrs.readOnly}
            {...registerProps}
          />
        </div>
        {isPasswordInput && (
          <TogglePassword
            id={id}
            setIsHidden={setIsHidden}
            isHidden={isHidden}
          />
        )}
        {canDisplayClearButton && (
          <div className="absolute h-5 right-4 -translate-y-1/2">
            <button
              type="button"
              aria-label="clear entry"
              className="my-auto hover:bg-transparent text-gray-150 hover:text-white-0"
              onClick={onClick}
            >
              <CloseIcon className="size-5" />
            </button>
          </div>
        )}
        {copy && (
          <>
            <Button
              onClick={copyToClipboard}
              data-control={id}
              aria-controls={id}
              className={twMerge(
                "flex w-fit absolute right-1 top-9 -translate-y-1/2 rounded-md",
                isCopied && "bg-green-700 hover:bg-green-700"
              )}
              aria-describedby={id}
              aria-disabled={isCopied}
            >
              {isCopied ? "Copied" : "Copy"}
            </Button>
            <span aria-live="polite" className="sr-only">
              {isCopied ? "Text copied" : ""}
            </span>
          </>
        )}
        <div className="flex flex-col justify-center peer-[aria-invalid='true']:text-red-500">
          {label && (
            <label htmlFor={attrs.name} className={labelClassName}>
              {label}
            </label>
          )}
          <span
            className={twMerge(
              "text-red-500 text-sm mb-1 sr-only",
              error && "not-sr-only",
              isCopied && "not-sr-only text-green-500"
            )}
            id={errorId}
          >
            {error && <span>{error.message}</span>}
          </span>
        </div>
      </div>
      <span
        className={twMerge(
          "sr-only text-sm text-gray-150 my-1",
          hint && "not-sr-only"
        )}
        id={hintId}
      >
        {hint}
      </span>
    </div>
  );
}
