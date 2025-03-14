import { formatRelative } from "date-fns";

interface MessageDate {
  date: string;
}

export function MessageDate({ date }: MessageDate) {
  const messageCreatedAt = formatRelative(date, new Date(), {
    weekStartsOn: 0,
  });

  return (
    <time
      dateTime={date}
      className="text-xs text-gray-300 lowercase first-letter:capitalize"
    >
      <span>{messageCreatedAt}</span>
    </time>
  );
}
