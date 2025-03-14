import { useCallback, useState } from "react";

export function useTogglePassword() {
  const [isHidden, setIsHidden] = useState(true);

  return { isHidden, setIsHidden };
}
