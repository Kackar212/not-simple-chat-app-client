import { InputProps } from "./input-props.interface";
import { twMerge } from "tailwind-merge";

export function RadioInput({ name, id, value, ref, ...attrs }: InputProps) {
  return (
    <input
      {...attrs}
      type="radio"
      id={id}
      name={name}
      className={twMerge(attrs.className, "sr-only")}
      value={value}
      ref={ref}
    />
  );
}
