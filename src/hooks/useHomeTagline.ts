import { useEffect, useState } from "react";
import { HOME_TAGLINES } from "@/config/taglines";

const SESSION_KEY = "tbl-tagline-index";

export function useHomeTagline(): string {
  const [tagline, setTagline] = useState(HOME_TAGLINES[0]);

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored !== null) {
      const idx = parseInt(stored, 10);
      setTagline(HOME_TAGLINES[idx] ?? HOME_TAGLINES[0]);
    } else {
      const idx = Math.floor(Math.random() * HOME_TAGLINES.length);
      sessionStorage.setItem(SESSION_KEY, String(idx));
      setTagline(HOME_TAGLINES[idx]);
    }
  }, []);

  return tagline;
}
