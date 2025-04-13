"use client";

import { useRouter } from "next/navigation";
import ChevronIcon from "/public/assets/icons/chevron.svg";

export function Back() {
  const { back } = useRouter();

  return (
    <button
      onClick={back}
      className="flex items-center text-gray-360 font-medium underline"
    >
      <ChevronIcon className="rotate-90 size-5 mt-0.5" />
      Go back
    </button>
  );
}
