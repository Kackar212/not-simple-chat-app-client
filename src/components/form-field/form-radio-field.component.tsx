import { HTMLProps, ReactNode } from "react";
import { useFormField } from "./use-form-field.hook";
import { RadioInput } from "@components/input/radio-input.component";
import { Label } from "@components/label/label.component";
import { twMerge } from "tailwind-merge";
import { InputType } from "@common/constants";

export type FormRadioFieldProps = Omit<
  HTMLProps<HTMLInputElement>,
  "type" | "size" | "label"
> & {
  label: ReactNode;
  name: string;
  description?: ReactNode;
  Icon?: ReactNode;
  checkboxClassName?: string;
  type?: "radio" | "checkbox";
  variant?: "circle" | "squircle";
  size?: "sm" | "md" | "lg";
  checkmark?: ReactNode;
};

export function FormRadioField(props: FormRadioFieldProps) {
  const {
    label,
    description,
    Icon,
    type = "radio",
    className,
    variant = "circle",
    size = "md",
    onChange,
    children,
    checkboxClassName,
    ...attrs
  } = props;

  const { error, errorId, id, registerProps, hintId } = useFormField({
    name: props.name,
    id: props.id,
    onChange,
  });

  return (
    <div className="flex flex-col w-full [:last-child]:mb-0 mb-2">
      <div className="flex relative">
        <div className="w-full">
          <Label
            htmlFor={id}
            className={twMerge(
              "flex w-full cursor-pointer text-gray-300 items-center p-3 justify-between has-[:focus-visible]:outline-2 has-[:checked]:bg-black-700 bg-black-660 rounded mb-0 gap-2 shadow-[rgba(30,_31,_34,_0.6)_0px_0px_0px_1px,_rgba(0,_0,_0,_0.2)_0px_2px_10px_0px]",
              size === "sm" && "text-sm",
              size === "lg" && "text-lg",
              className
            )}
          >
            <RadioInput
              id={id}
              type={type}
              className="peer"
              aria-invalid={!!error}
              aria-describedby={`${errorId} ${hintId}`}
              {...attrs}
              {...registerProps}
            />
            {Icon && <div className="w-6 pr-2">{Icon}</div>}
            <div className="flex flex-col shrink-[3] w-[calc(100%-4rem)] flex-grow">
              <span className="font-medium text-white-0">{label}</span>
              {description && (
                <span className="text-sm leading-4 text-gray-330" aria-hidden>
                  {description}
                </span>
              )}
            </div>
            <div
              className={twMerge(
                "w-3.5 h-3.5 outline-2 outline-offset-2 text-white-0 rounded-[50%] aspect-square peer-checked:bg-[var(--color,white)] mx-1",
                variant === "squircle" && "rounded-[1px]",
                size === "sm" && "w-2.5 h-2.5",
                size === "lg" && "w-4.5 h-4.5",
                checkboxClassName
              )}
            >
              {children}
            </div>
          </Label>
          <span
            className={twMerge("sr-only text-sm text-gray-150 my-1")}
            id={hintId}
          >
            {description}
          </span>
        </div>
      </div>
    </div>
  );
}
