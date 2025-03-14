import { AvatarSize } from "@common/constants";
import { ActivityStatus } from "@common/enums/activity-status.enum";
import { Icon } from "@components/icon/icon.component";
import { UserStatus } from "@components/user-status/user-status.component";
import Image from "next/image";
import { CSSProperties } from "react";
import { twMerge } from "tailwind-merge";

export interface AvatarProps {
  src: string;
  alt?: string;
  size: (typeof AvatarSize)[keyof typeof AvatarSize];
  status?: ActivityStatus;
  className?: string;
  containerClassName?: string;
  hiddenStatus?: boolean;
  placeholder?: `data:image/${string};base64,${string}` | null;
  rounded?: boolean;
}

const DEFAULT_SIZE = 16;

export function Avatar({
  src,
  size: { size, status: statusSize, offset },
  status,
  hiddenStatus = false,
  placeholder = "data:image/webp;base64,",
  alt = "",
  className = "",
  containerClassName = "",
  rounded = true,
}: AvatarProps) {
  return (
    <span
      className={twMerge(
        "relative inline-block aspect-square",
        containerClassName
      )}
      style={
        {
          width: size - offset,
          height: size - offset,
        } as CSSProperties
      }
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className="absolute"
      >
        <foreignObject
          width={size}
          height={size}
          x={0}
          y={0}
          mask={
            status && !hiddenStatus
              ? `url(#avatar-status-mask-${size})`
              : undefined
          }
        >
          <Image
            className={twMerge(
              "flex w-[var(--avatar-width)] h-[var(--avatar-width)]",
              rounded && "rounded-[50%]",
              className
            )}
            placeholder="blur"
            blurDataURL={placeholder ? placeholder : undefined}
            src={src}
            alt={alt}
            width={size}
            height={size}
            style={
              {
                "--avatar-width": `${size}px`,
                "--avatar-height": `${size}px`,
              } as CSSProperties
            }
            unoptimized
          />
        </foreignObject>
      </svg>
      {/* </foreignObject>
      </svg> */}
      {/* </Icon> */}
      {status && !hiddenStatus && (
        <UserStatus
          status={status}
          size={statusSize}
          containerClassName="z-30"
          innerClassName="border-current"
        />
      )}
    </span>
  );
}
