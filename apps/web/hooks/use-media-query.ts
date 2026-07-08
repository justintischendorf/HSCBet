import * as React from "react";

function getServerSnapshot() {
  return false;
}

export function useMediaQuery(query: string) {
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      const result = matchMedia(query);
      result.addEventListener("change", onChange);
      return () => result.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = React.useCallback(() => matchMedia(query).matches, [
    query,
  ]);

  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
