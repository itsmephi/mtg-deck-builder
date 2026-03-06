# Changelog

All notable changes to **MTG Deck Builder & Simulator** are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.0.7] — Inline Quantity Editing & Sort Controls

### Added
- **Inline qty editing (grid + list)**: click any quantity number to edit it inline; input selects all on focus; text/pointer cursor signals clickability
- **Enter or blur** commits; **Escape** reverts without saving; non-numeric input silently reverts
- **0 or empty** sets quantity to 0 — card grays out and stays in the deck, matching existing `−` button behavior
- Values above 4 are accepted with a yellow warning highlight — soft warning only, matching existing `+` button behavior; Basic Lands and "A deck can have any number" cards are exempt
- **Sort By dropdown** in toolbar: Original · Name · Color · Mana Value
- **Direction toggle** (↑/↓) in toolbar: flips ascending/descending, disabled when Original is selected
- Color sort order: White → Blue → Black → Red → Green → multicolor (grouped by color pair/combination) → colorless; cards missing color or CMC data sort to the bottom
- Sort applies to both grid and list view
- Sort preference (type + direction) persisted to `localStorage` under key `mtg-sort-preference`
- Sort By and Direction controls also surfaced in the Settings sidebar

### Changed
- `SortBy` and `SortDir` types exported from `useDeckManager`; sort state lives in context (was local `useState` in Workspace)
- Grid view bottom bar: `− qty +` controls now grouped and centered (were corner-pinned with `justify-between`)
- `setQuantity(id, qty)` handler added to Workspace — sets an absolute value instead of a delta; qty=0 grays out rather than removes

### Housekeeping
- Closed #21, #24, #29 — no code changes required

---

## [1.0.6] — Owned Quantity Tracking

### Changed
- `isOwned: boolean` replaced with `ownedQty: number` on `DeckCard` type
- `updateOwnedQty(cardId, qty)` added to `useDeckManager` context (clamped 0–quantity)

### Added
- **Grid view**: owned count badge (visible when `ownedQty > 0`), soft green progress bar above quantity controls, gray overlay on card image that scales proportionally with ownership
- **List view**: Owned column (checkbox + count + mini progress bar), row opacity fades as ownership increases; columns reordered to Qty | Name | Type | Mana | Price | Owned | ✕
- **Buy lists**: TCGPlayer and Card Kingdom export `quantity - ownedQty` per card; fully owned cards excluded entirely
- **Export**: `.txt` format encodes owned qty as `[owned:N]` tag
- **Import**: parses `[owned:N]` (new) and `[owned]` (legacy, treated as fully owned)
- **Migration**: loading old saves with `isOwned: true` → `ownedQty = quantity`; `isOwned: false` → `ownedQty = 0`; existing `ownedQty` values preserved as-is

---

## [1.0.5] — Patch Fixes

### Added
- ⚠️ badge in list view when a card's quantity reaches 5+ (soft 4-copy limit warning)
- Tooltip on badge: "Exceeds the 4-copy limit for standard play"
- Exempt: Basic Lands and cards with "A deck can have any number" oracle text

### Fixed
- TCGPlayer and Card Kingdom buy lists now exclude fully owned cards (`isOwned === true`)
- Swap Art confirm button now shows as active blue by default (was rendering as gray/disabled on open)

### Verified
- `handleAddCard` in Sidebar.tsx is still async with $0.00 / null pricing rescue intact after v1.0.4 refactor

---

## [1.0.4] — Refactor

### Changed
- Extracted `WorkspaceToolbar.tsx` from `Workspace.tsx` (3-row header, import/export, buy links, view controls)
- Extracted `DeckDropdown.tsx` — self-contained with own open state, ref, and click-outside effect
- Extracted `useDeckStats.ts` hook — `totalCards`, `totalValue`, `remainingCost`, `hasPriceData`, `buyOnTCGPlayer`, `buyOnCardKingdom`
- `Workspace.tsx` reduced from 607 → 333 lines
- `fileInputRef` internalized to `WorkspaceToolbar` (no longer threaded through Workspace)

---

## [1.0.3] — Exports, Scroll & Settings

### Added
- Full fidelity export: `[SET]` and `[owned]` tags in `.txt` format
- Full fidelity import: parses `[SET]` and `[owned]` tags, passes owned status through
- Auto-scroll to card in workspace when added from sidebar (grid + list view)
- Yellow ring highlight on added card, fades after 1 second
- `lastAddedId` shared via `useDeckManager` context
- Settings menu in footer (gear icon) with Card Preview toggle
- Card preview toggle shared via `useDeckManager` context (`showThumbnail`)
- Themed dark scrollbars (4px, neutral-700, rounded)

### Fixed
- `$0.00` pricing rescue on card add from search (`handleAddCard` now async)
- `$0.00` pricing rescue on import (in addition to null rescue)
- Scryfall collection fetch uses set identifier when available
- `overflow-x-hidden` on workspace scroll container (no horizontal scrollbar in grid view)

### Removed
- Eye/EyeOff icons removed from search bar and workspace toolbar

---

## [1.0.2] — UI Overhaul & List View

### Added
- Owned cards green tint in list view (name + price)
- 60 card yellow highlight on card count
- WotC Fan Content disclaimer in footer
- Type column added to list view
- Collapsible footer (collapsed by default)
- Footer: version badge opens changelog, coffee icon, GitHub icon
- Version config extracted to `src/config/version.ts`
- TCGPlayer export with set code format `[SET]`

### Changed
- Deck name + dropdown unified (chevron on left, click to switch decks)
- Auto-highlight search field text on click
- Mana column renamed from "Cost"
- Set name removed from list view (visible in modal)
- Toolbar restructured: 3 rows (deck name / stats / actions)
- Actions row: left-justified buy buttons, right-justified controls
- Opening Hand Simulator renamed
- Search sidebar spacing tightened

### Fixed
- Horizontal scroll eliminated

---

## [1.0.1] — Card Modal Polish

### Added
- Inline mana symbols in oracle text
- Flavor text in card modal
- Full set name in modal subtitle and list view
- Price added to card modal product details
- N/A pricing for cards with no USD data
- Import pricing rescue lookup for `$0.00` cards

### Fixed
- Confirm swap button always visible, no flicker
- Art fills modal panel properly
- localStorage silent failure recovery
- Scryfall network error handling

### Changed
- Test Deck rename
- "To Buy" label UI polish

---

## [1.0.0] — Initial Release

### Added
- Deck builder with visual grid + list view
- Scryfall search with EDHREC category browsing
- Goldfish Simulator with Fisher-Yates shuffle and stats
- Import/export (`.txt` decklist format)
- TCGPlayer + Card Kingdom buy links
- Card Modal with art swap, rulings, legalities