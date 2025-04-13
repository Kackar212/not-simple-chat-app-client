import { FormEventHandler } from "react";
import { get, useFormContext } from "react-hook-form";

interface UseFormFieldProps {
  name: string;
  id?: string;
  onChange?: FormEventHandler<HTMLInputElement>;
  value?: unknown;
}

export function useFormField({ name, id, onChange, value }: UseFormFieldProps) {
  const {
    formState: { errors },
    register,
  } = useFormContext();

  const inputId = id || name;

  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const error = get(errors, name);

  return {
    error,
    errorId,
    id: inputId,
    hintId,
    registerProps: register(name, { onChange, value }),
  };
}
