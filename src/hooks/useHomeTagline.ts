import { useMemo } from "react";
import { HOME_TAGLINES } from "@/config/taglines";

const SESSION_KEY = "tbl-tagline-index";

export function useHomeTagline(): string {
  return useMemo(() => {
    if (typeof window === "undefined") return HOME_TAGLINES[0];
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored !== null) {
      const idx = parseInt(stored, 10);
      return HOME_TAGLINES[idx] ?? HOME_TAGLINES[0];
    }
    const idx = Math.floor(Math.random() * HOME_TAGLINES.length);
    sessionStorage.setItem(SESSION_KEY, String(idx));
    return HOME_TAGLINES[idx];
  }, []);
}
