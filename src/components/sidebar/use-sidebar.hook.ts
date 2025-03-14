import { useCallback, useLayoutEffect, useState } from "react";

export function useSidebar() {
  const [shouldDisplaySidebar, setShouldDisplaySidebar] =
    useState<boolean>(true);

  const toggleSidebar = () => {
    setShouldDisplaySidebar((shouldDisplaySidebar) => !shouldDisplaySidebar);
  };

  const onResize = useCallback(() => {
    const { matches } = window.matchMedia("(min-width: 1024px)");

    setShouldDisplaySidebar((shouldDisplaySidebar) => {
      if (!shouldDisplaySidebar) {
        return false;
      }

      return matches;
    });
  }, []);

  useLayoutEffect(() => {
    const { matches } = window.matchMedia("(min-width: 1024px)");

    setShouldDisplaySidebar(matches);
  }, []);

  return { shouldDisplaySidebar, toggleSidebar };
}
