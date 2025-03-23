import { HTMLProps } from "react";
import { twMerge } from "tailwind-merge";

export function Label({
  className,
  htmlFor,
  children,
}: HTMLProps<HTMLLabelElement>) {
  return (
    <div className="flex items-center gap-2 peer-[aria-invalid='true']:text-red-500">
      <label htmlFor={htmlFor} className={twMerge("mb-1", className)}>
        {children}
      </label>
    </div>
  );
}
