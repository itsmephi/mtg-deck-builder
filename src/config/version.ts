export const APP_VERSION = "1.5.0";

// Each entry is an array of bullet points — one string per item.
// New versions should follow this same format.
export const CHANGELOG: Record<string, string[]> = {
  "1.5.0": [
    "FormatPicker popover now opens downward when there's more room below the trigger, and upward when near the bottom — applies to all three trigger points (+ New Deck, sidebar badge, toolbar badge)",
    "Collapsed sidebar rail + icon now opens FormatPicker popover to the right instead of immediately creating a deck — deck only created after format selection; Escape or click-outside cancels",
    "Commander eligibility check hardened to a full block — non-legendary cards (no 'Legendary' in type_line and no 'can be your commander' in oracle_text) cannot be designated as commander; click is a no-op in both list and grid view",
    "Grid view crown badge is now the sole commander toggle — replaces the 'Set as Commander' / 'Commander ✓' button that lived in the hover overlay",
    "Commander format: all non-commander cards show a dim gray crown on card hover; eligible (legendary) cards light up gold on crown hover with pointer cursor; ineligible cards stay dim with not-allowed cursor",
    "Active commander crown is always visible, solid yellow circle, scales on hover; clicking deselects commander",
    "Persistent qty pill badge added to every grid tile — circular badge at bottom center straddling the card edge; green when fully owned, amber when at copy-limit warning, neutral otherwise; fades out when hover overlay slides up",
  ],
  "1.4.1": [
    "Warning badge redesigned: filled amber triangle (raw SVG) replaces amber circle — no stroke outline, white ! line and dot as separate paths",
    "Warning badge repositioned to top-right corner in grid view (was top-left, stacked below crown)",
    "Crown badge stays alone at top-left in grid view — no more flex-col wrapper",
    "Crown SVG bumped from 16×16 to 18×18 inside the w-7 h-7 badge circle",
    "× remove button moved inset to top-right of card art (top-1.5 right-1.5, clipped by rounded-xl) — was straddling the corner edge",
    "List view warning icon updated to matching raw SVG triangle (16×16)",
  ],
  "1.4.0": [
    "Per-deck format: Freeform, Standard, Commander — centralized rules engine (formatRules.ts)",
    "Commander designation: crown badge in grid, crown icon in list, pinned to top in both views",
    "Color identity validation, singleton enforcement, and format-aware copy limit warnings",
    "Warning badges: filled amber circle with white ! on format violations — grid and list",
    "Format picker: accessible from sidebar badge, toolbar badge, and + New Deck button",
    "Format badges in sidebar: STD / CMD / FF — all clickable to switch format",
    "Format badge pill in toolbar: Standard / Commander / Freeform — clickable",
    "Sideboard-to-Commander dialog: merge or delete sideboard when switching to Commander",
    "Simulator: 5%/2% thresholds for Commander; commander excluded from library and Draw Odds",
    "List view: column reorder [−qty+][Owned][Name][Type][Mana][Price][×]; Owned simplified to X/Y",
    "Import/export: Format and Commander headers for round-trip fidelity",
  ],
  "1.3.2": [
    "Sideboard pricing: combined main+side total with (M+S) label in toolbar",
    "Deck name deduplication: auto-appends (2), (3), etc. on create and import conflicts",
    "Version badge: expands inline changelog instead of popup alert",
    "Collapsed sidebar rail: tooltips, click-to-expand, New Deck icon, PanelLeftOpen/PanelRightOpen toggle",
    "Card Kingdom button font size fixed so label fits on one line",
    "Qty badge removed from grid tile rest state — qty visible in hover overlay only",
  ],
  "1.3.1": [
    "Grid tile qty badge and × button now use solid backgrounds for readability",
    "Overlay qty number reflects green/red copy-limit color logic",
    "Deck name in toolbar truncates at 200px to prevent stats overflow",
    "Search results render styled mana cost symbols",
  ],
  "1.3.0": [
    "Collapsible sidebar with Search/Decks tab system — 48px icon rail when collapsed, smooth 300ms transition",
    "Deck management in sidebar Decks tab: sideboard controls, delete dropdown, import/export, buy links",
    "Workspace toolbar slimmed to single row",
    "Grid view: card art fills tile; hover reveals slide-up overlay with qty controls, owned counter, and × remove",
    "Inline mana cost symbols in search results",
    "Search field clear button with instant category snap-back",
  ],
  "1.2.1": [
    "Bug fix: land cards now appear in their own sort group when sorting by Color in list view",
  ],
  "1.2.0": [
    "Opening Hand Simulator: mana curve histogram (spells only, CMC 1–7+, normalized bars)",
    "Lands strip: count and percentage, static (does not update on draw)",
    "Draw Odds list: live next-draw probability per card with normalized bars and green/yellow/red thresholds",
    "Lands toggle in Draw Odds header",
    "Pin cards via Draw Odds row or card image — multiple pins, cleared on mulligan",
    "Mulligan counter in simulator header",
  ],
  "1.1.7": [
    "Bug fix: list view hover highlight restored as brightened tint",
    "Land rows now show tan/brown tint distinct from colorless gray",
    "Clicking a deck name in the dropdown keeps it open",
    "4-copy badge follows gray → green → red progression (green at 4, red at 5+)",
    "Unnamed decks show 'Untitled' in gray in the dropdown",
  ],
  "1.1.6": [
    "Deck dropdown radio buttons — click inactive deck to switch without closing",
    "Card count turns green at exactly 60 cards and red above 60",
    "4-copy warning badge changed from yellow to red",
    "Active Main/Side pill is now blue",
    "Deck name shows 'Untitled' placeholder when unnamed",
    "List view spacing between color and mana value sort groups",
  ],
  "1.1.5": [
    "Bug fix: blue dot in deck dropdown no longer closes the dropdown on click",
    "Card thumbnail toggle persists across page refreshes",
    "Owned counter supports inline typing in both grid and list view",
  ],
  "1.1.4": [
    "Grid view 4-copy warning tooltip now reads 'Exceeds 4-copy limit' (matching list view)",
    "Max-width cap added to all tooltips so long text wraps instead of clipping",
    "REVIEW.md session journal workflow introduced",
  ],
  "1.1.3": [
    "Shortened 4-copy warning text in list view",
    "Removed tooltip from X (remove) button in grid view",
    "Added 'Switch to main deck' / 'Switch to sideboard' tooltips to Main/Side pill",
  ],
  "1.1.2": [
    "4-copy tooltip renders below qty number to avoid clipping at scroll top",
    "Scroll container padding added so yellow highlight ring is fully visible on edge cards",
    "Removed Increase/Decrease tooltips from +/− qty buttons in grid view",
  ],
  "1.1.1": [
    "Hot fix: + on deck row activates deck, enables sideboard, switches to sideboard view, closes dropdown",
    "Sideboard view mode (main/sideboard) now persists across page refreshes",
    "Workspace overflow adjusted so tooltips and highlight rings are no longer clipped",
  ],
  "1.1.0": [
    "Sideboard support: enable a 15-card sideboard per deck from the deck dropdown",
    "Main/Side pill toggle in toolbar switches between views",
    "Search adds to sideboard when in sideboard view",
    "Import/export handles Sideboard section",
    "4-copy warning checks combined main + sideboard count",
    "UI persistence: grid/list, group-by-type, and last active deck restored on page refresh",
    "Sort direction toggle now has tooltip",
  ],
  "1.0.7": [
    "Inline quantity editing: click any qty number in grid or list view to type a new value",
    "Grid view − qty + controls grouped and centered",
    "Sort By dropdown (Original · Name · Color · Mana Value) with ↑↓ direction toggle",
    "Sort preference saved across sessions; sort controls also in Settings sidebar",
  ],
  "1.0.6": [
    "Owned quantity tracking: per-card ownedQty replaces boolean isOwned",
    "Grid and list views show ownership progress bar, gray overlay, and owned count",
    "Buy lists export only unowned copies",
    "Migrates old isOwned saves automatically",
  ],
  "1.0.5": [
    "4-copy soft warning badge in list view",
    "Buy buttons now exclude fully owned cards",
    "Swap art button always shows as active blue",
  ],
  "1.0.4": [
    "Refactor: extracted WorkspaceToolbar.tsx, DeckDropdown.tsx, and useDeckStats.ts — Workspace.tsx reduced from 607 to 333 lines",
  ],
  "1.0.3": [
    "Pricing fixes for $0.00 cards on add and import",
    "Full fidelity export/import with [SET] and [owned] tags",
    "Auto-scroll and yellow highlight ring on card add",
    "Themed dark scrollbars and settings menu with card preview toggle",
  ],
  "1.0.2": [
    "Collapsible footer, deck name dropdown, type column in list view, toolbar layout",
    "Owned card green tint, WotC disclaimer, 60-card highlight, and more",
  ],
  "1.0.1": [
    "Bug fixes: inline mana symbols, pricing improvements, card modal enhancements, set names, flavor text, and UI polish",
  ],
  "1.0.0": [
    "Initial Release: Visual Deck Builder, Goldfish Simulator, and Art Swapping",
  ],
};

export const CURRENT_CHANGELOG = CHANGELOG[APP_VERSION];
