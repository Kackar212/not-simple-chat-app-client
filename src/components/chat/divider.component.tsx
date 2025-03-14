import { format } from "date-fns";
import { PropsWithChildren } from "react";

interface DividerProps {
  date: string;
}

export function Divider({ date }: DividerProps) {
  const formattedDate = format(new Date(date), "dd MMMM y");

  return (
    <span className="block left-auto top-auto relative border-t border-gray-240 border-opacity-50 mt-4 mx-4 mr-3.5">
      <time
        className="text-xs text-gray-360 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 bg-black-600 whitespace-nowrap"
        dateTime={date}
      >
        {formattedDate}
      </time>
    </span>
  );
}
