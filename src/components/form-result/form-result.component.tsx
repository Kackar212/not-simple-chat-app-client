import { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

interface FormResultProps {
  isError: boolean;
  canShowMessage: boolean;
}

export function FormResult({
  isError,
  canShowMessage,
  children,
}: PropsWithChildren<FormResultProps>) {
  return (
    <div
      role="alert"
      className={twMerge(
        "text-white-0 my-4 mb-8 sr-only rounded-md text-center font-medium text-lg",
        isError && "bg-red-500",
        !isError && "bg-green-500",
        canShowMessage && "not-sr-only"
      )}
      aria-labelledby="form-result-heading"
    >
      {canShowMessage && (
        <h2 id="form-result-heading" className="p-4">
          {children}
        </h2>
      )}
    </div>
  );
}
