import { useEffect, useState } from "react";

// True on devices without a hover-capable pointer (touch phones/tablets).
// Single source of truth for the `(hover: none)` check used across the app —
// drives touch-specific affordances (e.g. tap-to-reveal controls) while
// leaving pointer/hover behaviour untouched.
export function useIsTouch(): boolean {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(hover: none)");
    const update = () => setIsTouch(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return isTouch;
}
