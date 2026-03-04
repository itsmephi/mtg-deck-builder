export const APP_VERSION = "1.0.3";

export const CHANGELOG: Record<string, string> = {
  "1.0.3":
    "Pricing fixes for $0.00 cards on add and import, full fidelity export/import with [SET] and [owned] tags, auto-scroll and yellow highlight on card add, themed dark scrollbars, settings menu with card preview toggle.",
  "1.0.2":
    "Collapsible footer, deck name dropdown, type column in list view, toolbar layout, owned card green tint, WotC disclaimer, 60-card highlight, and more.",
  "1.0.1":
    "Bug fixes — inline mana symbols, pricing improvements, card modal enhancements, set names, flavor text, and UI polish.",
  "1.0.0":
    "Initial Release: Visual Deck Builder, Goldfish Simulator, and Art Swapping.",
};

export const CURRENT_CHANGELOG = CHANGELOG[APP_VERSION];
