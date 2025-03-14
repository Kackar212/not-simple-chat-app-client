import { EyeIcon, EyeSlashIcon } from "@components/icons";
import { Dispatch, SetStateAction, useCallback, useState } from "react";

interface TogglePasswordProps {
  id: string;
  isHidden: boolean;
  setIsHidden: Dispatch<SetStateAction<boolean>>;
}

export function TogglePassword({
  id,
  isHidden,
  setIsHidden,
}: TogglePasswordProps) {
  const togglePassword = useCallback(() => {
    setIsHidden((isHidden) => !isHidden);
  }, [setIsHidden]);

  return (
    <div className="absolute right-4 -translate-y-1/2">
      <button
        type="button"
        className="button h-5 w-5 bg-[transparent] p-0 rounded-none hover:bg-transparent border-0 text-gray-360"
        aria-label={isHidden ? "Show password" : "Hide password"}
        aria-controls={id}
        onClick={togglePassword}
      >
        {isHidden ? <EyeSlashIcon /> : <EyeIcon />}
      </button>
      <span aria-live="polite" className="sr-only">
        {isHidden ? "your password is hidden" : "your password is shown"}
      </span>
    </div>
  );
}
