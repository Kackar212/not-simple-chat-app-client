import { HTMLProps, ReactNode } from "react";
import { useFormField } from "./use-form-field.hook";
import { RadioInput } from "@components/input/radio-input.component";
import { Label } from "@components/label/label.component";
import { twMerge } from "tailwind-merge";
import { InputType } from "@common/constants";

export type FormRadioFieldProps = HTMLProps<HTMLInputElement> & {
  label: string;
  name: string;
  description?: string;
  Icon?: ReactNode;
};

export function FormRadioField(props: FormRadioFieldProps) {
  const { label, description, Icon, type = "text", ...attrs } = props;
  const { error, id, registerProps } = useFormField({
    name: props.name,
    id: props.id,
  });

  return (
    <div className="flex flex-col w-full">
      <div className="flex relative">
        <div className="w-full">
          <Label
            htmlFor={id}
            className="flex w-full cursor-pointer text-gray-300 items-center p-3 pr-[calc(0.75rem+4px)] justify-between has-[:checked]:bg-black-700 rounded mb-2 gap-2 shadow-[rgba(30,_31,_34,_0.6)_0px_0px_0px_1px,_rgba(0,_0,_0,_0.2)_0px_2px_10px_0px]"
          >
            <RadioInput
              {...attrs}
              id={id}
              type={InputType.Radio}
              className="peer"
              aria-invalid={!!error}
              label={label}
              {...registerProps}
            />
            <div className="w-6 h-6">{Icon}</div>
            <div className="flex flex-col shrink-[3] px-2 w-[calc(100%-4rem)] flex-grow">
              <span className="font-medium text-white-0">{label}</span>
              <span className="text-sm leading-4 text-gray-330">
                {description}
              </span>
            </div>
            <div className="w-3 h-3 outline-2 outline-offset-4 rounded-[50%] aspect-square peer-checked:bg-white-0 ml-1"></div>
          </Label>
        </div>
      </div>
    </div>
  );
}
