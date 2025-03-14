import { AriaRole, ReactNode } from "react";

export interface Item {
  label: ReactNode;
  action?: () => void;
  isMutation?: boolean;
  enabled?: boolean;
  role?: AriaRole;
  checked?: boolean;
}
