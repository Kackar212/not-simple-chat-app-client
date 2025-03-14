import { get, useFormContext } from "react-hook-form";

interface UseFormFieldProps {
  name: string;
  id?: string;
}

export function useFormField({ name, id }: UseFormFieldProps) {
  const {
    formState: { errors },
    register,
  } = useFormContext();

  const inputId = id || name;

  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const error = get(errors, name);

  return { error, errorId, id: inputId, hintId, registerProps: register(name) };
}
