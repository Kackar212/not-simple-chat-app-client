import { InputProps } from "./input-props.interface";
import { twMerge } from "tailwind-merge";

interface RadioInputProps extends Omit<InputProps, "type"> {
  type: "radio" | "checkbox";
}

export function RadioInput({
  name,
  id,
  value,
  ref,
  type,
  ...attrs
}: RadioInputProps) {
  return (
    <input
      {...attrs}
      type={type}
      id={id}
      name={name}
      className={twMerge(attrs.className, "sr-only")}
      value={value}
      ref={ref}
    />
  );
}
