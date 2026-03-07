export const APP_VERSION = "1.1.4";

export const CHANGELOG: Record<string, string> = {
  "1.1.4":
    "Tooltip consistency: grid view 4-copy warning now reads 'Exceeds 4-copy limit' (matching list view). Max-width cap added to all tooltips so long text wraps instead of clipping. REVIEW.md session journal workflow introduced.",
  "1.1.3":
    "Tooltip consistency pass: shortened 4-copy warning text in list view, removed tooltip from X (remove) button in grid view, added 'Switch to main deck' / 'Switch to sideboard' tooltips to the Main/Side pill toggle.",
  "1.1.2":
    "4-copy tooltip renders below qty number to avoid clipping. Scroll container padding added so yellow highlight ring is fully visible on top-row and left-column cards. Removed Increase/Decrease tooltips from +/− qty buttons in grid view.",
  "1.1.1":
    "Hot fix: clicking + on any deck in the dropdown now activates that deck, enables its sideboard, switches to sideboard view, and closes the dropdown. Sideboard view mode (main/sideboard) now persists across page refreshes. Workspace overflow adjusted so tooltips and highlight rings are no longer clipped.",
  "1.1.0":
    "Sideboard support: enable a 15-card sideboard per deck from the deck dropdown. Main/Side pill toggle in toolbar switches between views. Search adds to sideboard when in sideboard view. Import/export handles Sideboard section. 4-copy warning checks combined main + sideboard count. UI persistence: grid/list, group-by-type, and last active deck restored on page refresh. Sort direction toggle now has tooltip.",
  "1.0.7":
    "Inline quantity editing: click any qty number in grid or list view to type a new value. Grid view − qty + controls grouped and centered. Sort By dropdown (Original · Name · Color · Mana Value) with ↑↓ direction toggle; sort preference saved across sessions. Sort controls also available in Settings sidebar.",
  "1.0.6":
    "Owned quantity tracking: per-card ownedQty replaces boolean isOwned. Grid and list views show ownership progress bar, gray overlay, and owned count. Buy lists export only unowned copies. Migrates old isOwned saves automatically.",
  "1.0.5":
    "4-copy soft warning badge in list view, buy buttons now exclude owned cards, swap art button always shows as active.",
  "1.0.4":
    "Refactor: extracted WorkspaceToolbar.tsx, DeckDropdown.tsx, and useDeckStats.ts hook — Workspace.tsx reduced from 607 to 333 lines.",
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
