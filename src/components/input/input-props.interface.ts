import { HTMLProps } from "react";

export interface InputProps extends HTMLProps<HTMLInputElement> {
  isHidden?: boolean;
  labelClassName?: string;
}
