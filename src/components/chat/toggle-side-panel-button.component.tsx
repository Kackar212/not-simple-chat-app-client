import { useSafeContext } from "@common/hooks";
import { chatContext } from "./chat.context";
import { ReactNode } from "react";

interface ToggleSidePanelButtonProps {
  text: string;
  tooltip: string;
  Icon: ReactNode;
}

export function ToggleSidePanelButton({
  text,
  tooltip,
  Icon,
}: ToggleSidePanelButtonProps) {
  const { toggleSidePanel, isSidePanelHidden } = useSafeContext(chatContext);

  return (
    <button
      className="text-gray-150 size-6"
      data-tooltip-content={tooltip}
      data-tooltip-id="tooltip"
      data-tooltip-place="bottom"
      onClick={toggleSidePanel}
      aria-expanded={!isSidePanelHidden}
      id="side-panel-toggle-button"
    >
      <span className="sr-only">{text}</span>
      {Icon}
    </button>
  );
}
