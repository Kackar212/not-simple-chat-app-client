import { BaseServer } from "@common/api/schemas/server.schema";
import { createImagePlaceholder } from "@common/utils";
import { Avatar, AvatarProps } from "@components/avatar/avatar.component";
import { twMerge } from "tailwind-merge";

interface ServerIconPlaceholderProps extends Omit<AvatarProps, "src"> {
  server: BaseServer;
}

export function ServerIcon({ server, ...props }: ServerIconPlaceholderProps) {
  if (server.serverIcon) {
    return (
      <Avatar
        {...props}
        placeholder={server.iconPlaceholder}
        src={server.serverIcon}
        className={twMerge(
          "transition-[border-radius] duration-150",
          props.className
        )}
      />
    );
  }

  const placeholder = server.name
    .replace(/'s /g, " ")
    .replace(/\w+/g, (match) => match[0])
    .replace(/\s/g, "");

  return (
    <div
      style={{ width: props.size.size, height: props.size.size }}
      className="flex size-full justify-center items-center text-white-500 bg-black-630 font-medium leading-5 transition-[background-color,border-radius] duration-300 hover:bg-green-500 rounded-[50%] hover:rounded-[30%]"
    >
      <span aria-hidden>{placeholder}</span>
      <span className="sr-only">{props.alt}</span>
    </div>
  );
}
