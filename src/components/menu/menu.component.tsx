import { MoreIcon } from "@components/icons/more.icon";
import { CSSProperties, MouseEvent, ReactNode } from "react";
import { MenuItem } from "./menu-item.component";
import { Item } from "./item.interface";
import { useMenu } from "./use-menu.hook";
import { PopoverProvider } from "@components/popover/popover.context";
import { Popover } from "@components/popover/popover.component";
import { PopoverTrigger } from "@components/popover/popover-trigger.component";
import { twMerge } from "tailwind-merge";
import { OffsetOptions, Placement } from "@floating-ui/react";

interface MenuProps {
  items: Item[];
  openButton?: {
    label?: ReactNode;
    Icon?: ReactNode;
    size?: number;
    width?: string;
    height?: string;
    className?: string;
    isSrOnly?: boolean;
  };
  placement?: Placement;
  absolute?: boolean;
  fullWidth?: boolean;
  offset?: OffsetOptions;
  className?: string;
  tooltip?: string;
  canDisplayTooltip?: boolean;
}

const defaultOpenButton = {
  isSrOnly: true,
  label: "More",
  Icon: <MoreIcon aria-hidden />,
  size: 40,
  width: "",
  height: "",
  className:
    "flex justify-center items-center text-white-0 bg-black-630/100 hover:bg-black-700 aria-expanded:bg-black-700 rounded-[50%] p-1 w-[var(--width)] h-[var(--height)] -outline-offset-2",
  container: "",
};

export function Menu({
  openButton,
  items,
  placement = "left-start",
  offset = { mainAxis: 5 },
  absolute,
  fullWidth,
  className,
  tooltip = "More",
  canDisplayTooltip = true,
}: MenuProps) {
  const {
    isOpen,
    toggleMenu,
    isCurrentItem,
    id,
    openButtonRef,
    menuRef,
    onMenuItemKeyDown,
    onMouseOver,
    setIsOpen,
  } = useMenu({
    items,
  });

  const {
    label,
    Icon,
    size,
    className: buttonClassName,
    isSrOnly,
    width,
    height,
  } = {
    ...defaultOpenButton,
    ...openButton,
    className: twMerge(defaultOpenButton.className, openButton?.className),
  };

  const buttonWidth = width ? width : `${size}px`;
  const buttonHeight = height ? height : `${size}px`;

  const isAtLeastOneItemEnabled =
    items.filter((item) => item.enabled || typeof item.enabled === "undefined")
      .length > 0;

  if (!isAtLeastOneItemEnabled) {
    return;
  }

  const filteredItems = items.filter(({ enabled }) => enabled !== false);

  return (
    <PopoverProvider
      placement={placement}
      onOpenChange={toggleMenu}
      isOpen={isOpen}
      offset={offset}
      strategy="absolute"
    >
      <div
        style={
          { "--width": buttonWidth, "--height": buttonHeight } as CSSProperties
        }
        className="flex justify-center items-center z-[100]"
      >
        <PopoverTrigger
          data-tooltip-id="tooltip"
          data-tooltip-content={tooltip}
          data-tooltip-hidden={!canDisplayTooltip}
          aria-haspopup
          aria-expanded={isOpen}
          data-id={id}
          className={buttonClassName}
          data-menu-button
          ref={openButtonRef}
        >
          <span
            className={twMerge(!isSrOnly && "w-full", isSrOnly && "sr-only")}
          >
            {label}
          </span>
          {Icon}
        </PopoverTrigger>
        <Popover
          render={({ getFloatingProps, floatingStyles, refs }) => (
            <div
              style={floatingStyles}
              {...getFloatingProps()}
              role="menu"
              ref={(div) => {
                menuRef.current = div;
                refs.setFloating(div);
              }}
              data-menu
              className={twMerge(
                "bg-black-700/100 z-50 p-2 flex flex-col text-white-0 rounded-sm min-w-48 min-h-28",
                fullWidth && "w-11/12",
                className
              )}
            >
              {filteredItems.map((item, index) => (
                <MenuItem
                  key={index}
                  item={item}
                  isCurrentItem={isCurrentItem(index)}
                  onKeyDown={onMenuItemKeyDown}
                  setIsOpen={setIsOpen}
                  onMouseOver={onMouseOver}
                  index={index}
                  isMenuOpen={isOpen}
                />
              ))}
            </div>
          )}
        />
      </div>
    </PopoverProvider>
  );
}
