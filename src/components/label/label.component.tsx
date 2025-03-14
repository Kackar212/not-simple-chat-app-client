import { HTMLProps } from "react";

export function Label({
  className,
  htmlFor,
  children,
}: HTMLProps<HTMLLabelElement>) {
  return (
    <div className="flex items-center gap-2 peer-[aria-invalid='true']:text-red-500 mb-1">
      <label htmlFor={htmlFor} className={className}>
        {children}
      </label>
    </div>
  );
}
