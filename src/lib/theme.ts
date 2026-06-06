// Theme preference + resolution. Shared by SettingsView and the no-flash
// init script in layout.tsx (which inlines an equivalent of resolve/apply
// because it must run before any module loads — keep the two in sync).
//
// Preference (what the user picked) vs. resolved theme (what actually paints):
//   - "system"     → follows OS: dark OS → "warm-stone", light OS → "light"
//   - "warm-stone" → forced warm dark   (the :root default palette)
//   - "zed-dark"   → forced cool dark   ([data-theme="zed-dark"])
//   - "light"      → forced warm light  ([data-theme="light"])
//
// Storage: key `mtg-theme` holds the preference. "system" is the default and
// is stored as *absent* (removed), so a fresh user with no key follows the OS.

export type ThemePreference = "system" | "warm-stone" | "zed-dark" | "light";
export type ResolvedTheme = "warm-stone" | "zed-dark" | "light";

export const THEME_STORAGE_KEY = "mtg-theme";

const DARK_QUERY = "(prefers-color-scheme: dark)";

/** Resolve a preference to the palette that should paint right now. */
export function resolveTheme(pref: ThemePreference): ResolvedTheme {
  if (pref === "system") {
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia(DARK_QUERY).matches;
    // System dark defaults to the warm dark theme (per product direction).
    return prefersDark ? "warm-stone" : "light";
  }
  return pref;
}

/** Paint a resolved theme by setting (or clearing) the <html> data-theme. */
export function applyTheme(resolved: ResolvedTheme): void {
  if (typeof document === "undefined") return;
  if (resolved === "warm-stone") {
    // Warm Stone is the :root default — no attribute needed.
    delete document.documentElement.dataset.theme;
  } else {
    document.documentElement.dataset.theme = resolved;
  }
}

/** Read the stored preference, defaulting to "system" when absent/invalid. */
export function getThemePreference(): ThemePreference {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    if (v === "warm-stone" || v === "zed-dark" || v === "light") return v;
  } catch {
    /* ignore */
  }
  return "system";
}

/** Persist a preference and immediately apply its resolved theme. */
export function setThemePreference(pref: ThemePreference): void {
  try {
    if (pref === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, pref);
  } catch {
    /* ignore */
  }
  applyTheme(resolveTheme(pref));
}
