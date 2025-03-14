import { getFileSizeWithUnit } from "@common/utils";
import { Link } from "@components/link/link.component";
import { MouseEventHandler, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface DocumentAttachmentProps {
  url: string;
  isHidden: boolean;
  originalName: string;
  size: number;
  Icon: ReactNode;
  tabIndex?: number;
  className?: string;
  showAttachment: MouseEventHandler<HTMLAnchorElement>;
}

export function DocumentAttachment({
  url,
  isHidden,
  originalName,
  size,
  Icon,
  tabIndex,
  className,
  showAttachment,
}: DocumentAttachmentProps) {
  return (
    <div
      className={twMerge(
        "w-full min-w-52 lg:min-w-96 xl:min-w-[30rem] bg-black-560 flex relative items-center gap-2 justify-between py-3.5 px-4 rounded-lg focus-within:focus-default focus-within:m-0.5",
        isHidden && "bg-black-700",
        className
      )}
    >
      <div className="flex gap-2 flex-grow items-center">
        {Icon}
        <div className="flex flex-col">
          <Link
            href={url}
            className="text-blue-400 before:size-full before:absolute before:top-0 before:left-0 hover:underline focus:outline-none"
            target={isHidden ? undefined : "_blank"}
            onClick={showAttachment}
            tabIndex={tabIndex}
          >
            {originalName}
          </Link>
          <span className="text-sm text-gray-330">
            {getFileSizeWithUnit(size)}
          </span>
        </div>
      </div>
    </div>
  );
}
