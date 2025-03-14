import { Loader } from "@components/loader/loader.component";
import { twMerge } from "tailwind-merge";

export default function Loading({ className }: { className?: string }) {
  return (
    <div
      className={twMerge(
        "flex justify-center items-center size-full left-0 top-0",
        className
      )}
    >
      <Loader />
    </div>
  );
}
