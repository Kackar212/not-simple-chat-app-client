import { CSSProperties, FunctionComponent, MouseEventHandler } from "react";
import { twMerge } from "tailwind-merge";

interface ToggleAudioDeviceButtonProps {
  MutedIcon: FunctionComponent<Record<string, unknown>>;
  UnmutedIcon: FunctionComponent<Record<string, unknown>>;
  isMuted: boolean;
  children: string;
  className?: string;
  iconSize?: number;
  onClick: MouseEventHandler;
}

export function ToggleAudioDeviceButton({
  MutedIcon,
  UnmutedIcon,
  isMuted,
  children,
  className,
  iconSize = 5,
  onClick,
}: ToggleAudioDeviceButtonProps) {
  return (
    <button
      data-tooltip-id="tooltip"
      data-tooltip-content={children}
      onClick={onClick}
      className={twMerge(
        "hover:bg-gray-260/30 size-[var(--item-size)] grid content-center justify-center rounded-lg",
        className,
        isMuted && "text-red-500"
      )}
      style={{ "--icon-size": `${iconSize * 0.25}rem` } as CSSProperties}
    >
      <span className="sr-only">{children}</span>
      {isMuted ? (
        <MutedIcon
          style={
            {
              height: "var(--icon-size)",
              width: "var(--icon-size)",
            } as CSSProperties
          }
          aria-hidden
        />
      ) : (
        <UnmutedIcon
          aria-hidden
          style={
            {
              height: "var(--icon-size)",
              width: "var(--icon-size)",
            } as CSSProperties
          }
        />
      )}
    </button>
  );
}
