# Changelog

All notable changes to **MTG Deck Builder & Simulator** are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.1.7] — Bug Fix Sprint

### Fixed
- List view hover highlight restored: hovering a tinted row now brightens the tint color subtly. Yellow highlight still overrides hover (yellow wins). Regression from v1.1.6 color tint implementation.
- Colorless vs Land tint differentiated in list view: Land cards (type_line-based detection) now show tan/brown (`rgba(180, 140, 90, 0.15)`); colorless non-land cards show neutral gray (`rgba(150, 150, 150, 0.12)`). Correctly handles Basic Lands, fetchlands, Triomes, and dual lands.
- Deck name click in dropdown no longer closes it — now behaves identically to the radio button (switches active deck, stays open).
- 4-copy badge color follows gray → green → red progression: gray at ≤ 3 copies (badge absent), green at exactly 4 (at the legal limit), red at 5+ (over the limit). Applied in both grid and list view.
- Unnamed decks now show "Untitled" in muted gray in the deck dropdown. Named decks unaffected.

---

## [1.1.6] — UI Polish + Workflow Fixes

### Added
- Deck dropdown radio buttons: inactive decks show a hollow gray circle; clicking it switches the active deck without closing the dropdown. Clicking the active dot is a no-op. Clicking the deck name still closes the dropdown. Tooltip "Switch deck" on inactive radio button. (Closes #77)

### Changed
- Card count in toolbar now turns green at exactly 60 cards and red above 60 — was flat yellow at ≥ 60 (Closes #53, Closes #56)
- 4-copy warning badge in grid and list view changed from yellow to red to match the exceeded-limit signal
- Active Main/Side pill is now blue (`bg-blue-600`) instead of dark gray; inactive remains gray (Closes #57)
- List view adds vertical spacing between sort groups when sorting by Color or Mana Value with group-by-type off (Closes #47)
- List view rows are now tinted by card color identity: white, blue, black, red, green, gold (multicolor), gray (colorless/land) (Closes #13)
- Deck name input now shows gray "Untitled" placeholder when the name is empty; new decks start unnamed; text turns white on first keystroke (Closes #70)

### Fixed
- BACKLOG.md promoted items now correctly cleared in session commit alongside CLAUDE.md updates; behavior rule added to Key Technical Notes

---

## [1.1.5] — Bug Fix Sprint

### Fixed
- Blue dot active deck indicator in dropdown no longer triggers dropdown close (Closes #55)
- Card thumbnail toggle setting now persists across page refreshes via localStorage key `mtg-show-thumbnail` (Closes #59)
- Owned counter now supports inline typing in both grid and list view — behavior mirrors qty counter; validation matches existing `updateOwnedQty` rules (Closes #48)

### Housekeeping
- Backlog triage: closed #18, #23, #25, #52, #67, #72, #73 (discarded)
- Moved #50, #51, #54, #60, #71 to v2.0
- Promoted #76 — Grid view hover controls
- Priority bumps: #26, #58, #62, #70
- Triage process defined and added to CLAUDE.md Session Start
- BACKLOG.md consolidation prompt updated: guards against empty consolidation, enforces items-before-timestamp order

---

## [1.1.4] — Tooltip Consistency + REVIEW.md Workflow

### Fixed
- Grid view 4-copy warning tooltip now reads "Exceeds 4-copy limit" — matches list view text updated in v1.1.3 (Closes #45)
- All tooltip spans now have `max-w-xs whitespace-normal` so long text wraps instead of overflowing the viewport (Closes #46)

### Added
- **REVIEW.md session journal workflow**: Claude Code writes a plan review table before touching any files (waits for PROCEED), then writes a testing checklist after build (waits for APPROVED), then writes a session summary before final commit

---

## [1.1.3] — Tooltip Consistency Pass

### Fixed
- 4-copy badge tooltip in list view shortened to "Exceeds 4-copy limit" — no longer clips (Closes #42)
- X (remove card) tooltip removed from grid view — list view already had no tooltip; both views now consistent (Closes #43)

### Added
- Main/Side pill toggle now has tooltips: "Switch to main deck" / "Switch to sideboard" (Closes #44)

---

## [1.1.2] — Tooltip Clip + Highlight Ring Fixes

### Fixed
- 4-copy warning tooltip in list view now renders **below** the qty number (`top-full`) instead of above, avoiding clip at scroll container top edge (Closes #39)
- Yellow highlight ring now fully visible on top-row and left-column cards — scroll container uses `p-1 pb-20` to give ring-offset space on all edges (Closes #40)

### Changed
- Removed "Increase" and "Decrease" tooltips from +/− qty buttons in grid view — X button tooltip also removed (Closes #41). List view had no tooltips on these controls already; both views now consistent.

---

## [1.1.1] — Hot Fix: Sideboard UX + Persistence + Overflow

### Fixed
- Clicking **+** on any deck row in the dropdown now: activates that deck, enables its sideboard, switches workspace to sideboard view, and closes the dropdown (Closes #36)
- `deckViewMode` (main/sideboard) now persisted to `localStorage` under `mtg-deck-view-mode` and restored on refresh; gracefully falls back to `main` if active deck has no sideboard (Closes #37)
- Removed `overflow-x-hidden` from workspace outer wrapper and scroll container — tooltips and highlight rings no longer clipped by overflow context (Closes #38)

---

## [1.1.0] — Sideboard Support + UI Persistence + Tooltip Fixes

### Added
- **Sideboard per deck**: enable from the deck dropdown (+ icon → Layers icon). 15-card soft limit with yellow warning when exceeded (Closes #19)
- **Main / Side pill toggle** in toolbar row 3 — switches workspace between main deck and sideboard view. "Side" grayed out when no sideboard exists (Closes #20)
- Deck dropdown redesigned: ● active indicator, + icon to add sideboard, Layers icon to view sideboard, "Delete Sideboard" action with confirmation
- Confirmation dialogs on Delete Deck (mentions sideboard if present) and Delete Sideboard
- Search adds cards to sideboard when in sideboard view
- Sideboard card count shown as `X / 15` in toolbar when in sideboard view
- Goldfish Simulator always uses main deck only
- Import: detects `Sideboard` section header and auto-enables + populates sideboard (Closes #33)
- Export: appends `Sideboard` section when active deck has a sideboard
- 4-copy soft warning checks combined main + sideboard quantities
- **UI persistence**: grid/list view (`mtg-view-mode`), group-by-type (`mtg-group-by-type`), last active deck (`mtg-active-deck`) all saved to localStorage and restored on refresh (Closes #33)
- Sort direction toggle (↑/↓) now has tooltip "Sort ascending" / "Sort descending" (Closes #35)

### Fixed
- 4-copy badge tooltip initial fix in list view (Closes #34)

### Changed
- `Deck` type gains optional `sideboard?: DeckCard[]` field
- `useDeckManager` context gains `enableSideboard`, `deleteSideboard`, `activeSideboardCards`, `deckViewMode`, `setDeckViewMode`
- `deckViewMode` lives in context so Sidebar and Workspace both read it
- `useDeckImportExport` refactored to support sideboard import/export
- `ListCardTable` `overflow-hidden` wrapper removed to fix tooltip clipping
- Scroll container padding: `p-1 pb-20` (was `pr-1 pb-20`) for highlight ring edge space

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
