export const APP_VERSION = "1.4.0";

export const CHANGELOG: Record<string, string> = {
  "1.4.0":
    "Standard & Commander format support: per-deck format (freeform/standard/commander), format rules engine, color identity tracking, commander designation with crown badge and yellow tint (grid) and crown icon/row tint (list), warning badges for format violations, commander pinning in grid and list, format picker on new deck/toolbar/dropdown, sideboard-to-Commander confirmation dialog, format-aware card count colors, list view column reorder with simplified Owned column (X/Y), format-aware simulator thresholds (5%/2% for Commander), commander excluded from library in simulator.",
  "1.3.2":
    "UI polish: sideboard pricing now shows combined main+side total with (M+S) label. Deck name conflict deduplication — auto-appends (2), (3), etc. on create and import. Version badge expands inline changelog instead of popup. Collapsed rail gets tooltips, click-to-expand, New Deck icon, and PanelLeftOpen/PanelRightOpen toggle icons. Card Kingdom button font size fixed. Qty badge removed from grid tile rest state — qty visible in hover overlay only.",
  "1.3.1":
    "Hot fix: grid tile qty badge and × button now use solid backgrounds for readability. Overlay qty number reflects green/red copy-limit colors. Deck name in toolbar truncates at 200px to prevent stats overflow. Search results render styled mana cost symbols.",
  "1.3.0":
    "Sidebar redesign: collapsible panel with Search/Decks tabs, 48px icon rail when collapsed, smooth 300ms transition. Deck management moved to sidebar Decks tab with inline sideboard controls and delete dropdown. Import/export and buy links moved to sidebar. Workspace toolbar slimmed to single row. Grid view redesign: card art fills tile with circular qty badge only; hover reveals slide-up overlay with qty controls and owned counter, plus × remove button top-right. Inline mana cost symbols in search results. Search field clear button with instant category snap-back.",
  "1.2.1":
    "Bug fix: land cards now appear in their own sort group when sorting by Color in list view — Basic lands, fetchlands, and all other lands were incorrectly grouped with colorless non-land cards and missing the visual spacer between groups.",
  "1.2.0":
    "Opening Hand Simulator stats panel: mana curve histogram (spells only, CMC 1–7+, normalized bars), lands strip with count and percentage, live draw probability per card with normalized bars and green/yellow/red color thresholds, lands toggle, pin cards via sidebar row or card image, mulligan counter in header.",
  "1.1.7":
    "Bug fix sprint: list view hover highlight restored as brightened tint on row hover. Land cards now show tan/brown tint distinct from colorless gray. Clicking a deck name in the dropdown keeps it open. 4-copy badge follows gray → green → red progression (green at exactly 4, red at 5+). Unnamed decks show 'Untitled' in gray in the dropdown.",
  "1.1.6":
    "UI polish: deck dropdown now has radio buttons for inactive decks — click to switch without closing. Card count turns green at exactly 60 cards and red above 60. 4-copy warning badge changed from yellow to red. Active Main/Side pill is now blue. Deck name shows 'Untitled' placeholder when unnamed. List view adds spacing between color and mana value sort groups.",
  "1.1.5":
    "Bug fix sprint: blue dot in deck dropdown is now visual-only and no longer closes the dropdown on click. Card thumbnail toggle setting persists across page refreshes. Owned counter supports inline typing in both grid and list view.",
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
