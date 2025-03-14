import { TextLink } from "@components/link/text-link.component";
import { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

interface ActivateAccountResultProps {
  heading: string;
  isSuccess?: boolean;
}

export function ActivateAccountResult({
  heading,
  children,
  isSuccess = false,
}: PropsWithChildren<ActivateAccountResultProps>) {
  return (
    <div className="w-full flex justify-center items-center">
      <div className="w-1/2 min-w-72 max-w-[50ch] gap-2 px-4 py-6 flex flex-col justify-between items-start text-white-500 text-lg shadow-lg bg-black-630 text-center rounded-md">
        <h1
          className={twMerge(
            "w-full text-xl font-bold text-center text-red-500",
            isSuccess && "text-green-500"
          )}
        >
          {heading}
        </h1>
        <div className="w-full flex flex-col justify-center">{children}</div>
      </div>
    </div>
  );
}
