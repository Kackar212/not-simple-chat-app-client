import { ActivityStatus } from "@common/enums/activity-status.enum";
import { twMerge } from "tailwind-merge";

interface UserStatusProps {
  status: ActivityStatus;
  size: number;
  hidden?: boolean;
  containerClassName?: string;
  innerClassName?: string;
}

export function UserStatus({
  status,
  size,
  hidden = false,
  containerClassName = "text-black-600",
  innerClassName = "",
}: UserStatusProps) {
  const isOnline = status === ActivityStatus.Online;

  if (hidden) {
    return null;
  }

  return (
    <span
      className={twMerge(
        "absolute right-[var(--user-status-right,0)] w-2.5 h-2.5 bg-black-600 rounded-lg bottom-[var(--user-status-bottom,0)]",
        containerClassName
      )}
      style={{
        width: size,
        height: size,
      }}
      data-tooltip-content={status}
      data-tooltip-id="tooltip"
    >
      <span
        className={twMerge(
          "flex rounded-lg w-full h-full",
          isOnline && "bg-green-600",
          !isOnline && "bg-gray-200",
          innerClassName
        )}
      >
        <span aria-live="polite" className="sr-only">
          User is {status.toLowerCase()}
        </span>
      </span>
    </span>
  );
}
