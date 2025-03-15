import {
  KeyboardEvent,
  KeyboardEventHandler,
  PropsWithChildren,
  useCallback,
  useRef,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";

const Key = {
  Enter: "Enter",
  Space: "Space",
};

// I used span instead of button because button can't be truly inline so it would not be possible to use it inside inline context.
export function Spoiler({ children }: PropsWithChildren<{}>) {
  const [isHidden, setIsHidden] = useState<boolean>(true);
  const { current: id } = useRef(
    `message-spoiler-${Math.trunc(Math.random() * 9999999)}`
  );

  const showSpoiler = useCallback(() => {
    setIsHidden((isHidden) => !isHidden);
  }, []);

  const onKeydown = useCallback<KeyboardEventHandler<HTMLSpanElement>>(
    ({ code, target }) => {
      const isElement = target instanceof HTMLElement;

      if (!isElement) {
        return;
      }

      if (code !== Key.Enter && code !== Key.Space) {
        return;
      }

      target.click();
    },
    []
  );

  return (
    <span aria-label="Spoiler" role="group" className="relative">
      <span
        aria-label="Reveal spoiler"
        aria-expanded={!isHidden}
        onClick={showSpoiler}
        role="button"
        tabIndex={0}
        className={twMerge(
          "text-left box-decoration-clone bg-transparent focus:focus-default focus:outline-none",
          isHidden && "bg-black-700/100 box-decoration-clone rounded-[4px]"
        )}
        aria-controls={id}
        onKeyDown={onKeydown}
      >
        <span aria-hidden={true}>
          <span
            inert={isHidden}
            className={twMerge("box-decoration-clone", isHidden && "opacity-0")}
          >
            {children}
          </span>
        </span>
      </span>
      <span className={"sr-only"} hidden={isHidden} id={id}>
        {children}
      </span>
    </span>
  );
}
