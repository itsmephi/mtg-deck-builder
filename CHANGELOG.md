# Changelog

All notable changes to **MTG Deck Builder & Simulator** are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.5.3] — Warning Color Consistency

### Changed
- Format violation warning bar (grid hover overlay) color updated from amber to red — background `rgba(239,68,68,0.15)`, border `rgba(239,68,68,0.3)`, text and icon `#f87171`
- Grid qty pill badge warning state updated from amber (`bg-orange-900 text-orange-400`) to red (`bg-red-900 text-red-400`)
- List view warning triangle icon updated from amber (`#f59e0b`) to red (`#f87171`) to match grid
- Qty number color logic simplified across both views: green when fully owned, red when over copy limit, gray otherwise — at-copy-limit no longer applies a special color to the qty number

---

## [1.5.2] — Toolbar Layout & Grid Spacing Polish

### Changed
- Workspace toolbar split into two rows: row 1 is deck name + format badge pill only; row 2 is stats and all controls — eliminates name truncation and button crowding on long deck names
- Deck name input now auto-sizes to exact rendered text width using a hidden measurer span — format badge sits immediately after the last character with no visible gap regardless of font rendering
- Deck name size increased to `text-3xl` for visual emphasis as a heading
- Grid view gap increased from `gap-3` to `gap-x-5 gap-y-7` — provides clearance so qty pill badge (`-bottom-2`, 8px overhang) and crown badge (`-top-3.5 -left-3.5`, 14px overhang) no longer encroach on adjacent cards

---

## [1.5.1] — Grid Warning Redesign

### Changed
- Grid view warning indicator replaced: corner triangle badge (top-right, straddling card edge) removed; amber warning bar now appears at the top of the slide-up hover overlay with ⚠ icon and warning text — clearly scoped to the card and always readable
- Color identity warning text simplified: "Outside commander's color identity (has {G})" → "Outside commander's color identity" — removes abstract mana symbol notation from the warning message

---

## [1.5.0] — Grid Polish + Bug Fixes

### Fixed
- FormatPicker popover now opens downward when more room exists below the trigger, and upward when near the bottom of the viewport — applies to all three trigger points: `+ New Deck` button, sidebar deck row format badge, and toolbar format badge pill
- Collapsed sidebar rail `+` icon now opens a FormatPicker popover positioned to the right of the icon instead of immediately creating a deck — deck is only created after format selection; Escape or click-outside cancels without creating a deck
- Commander eligibility check hardened from soft warning to full block — cards without `"Legendary"` in `type_line` and without `"can be your commander"` in `oracle_text` cannot be designated as commander; click is a no-op in both list view and grid view; tooltip now reads "Must be Legendary to set as Commander"

### Added
- Grid view crown badge is now an interactive commander toggle — replaces the `"Set as Commander"` / `"Commander ✓"` text button that previously lived inside the hover overlay
- Commander format: all non-commander cards show a dim gray crown badge on card hover; eligible (Legendary) cards light up gold on crown hover with `pointer` cursor and a scale affordance; ineligible cards stay dim gray with `not-allowed` cursor and no color change
- Active commander crown badge: always visible, solid yellow circle (`bg-yellow-500`), scales on hover; clicking deselects the commander designation
- Persistent qty pill badge on every grid tile: circular `w-6 h-6` badge at bottom center straddling the card edge (`-bottom-2`); green (`bg-green-800 / text-green-400`) when fully owned, amber (`bg-orange-900 / text-orange-400`) when at copy-limit warning, neutral (`bg-neutral-900 / text-neutral-400`) otherwise; fades out (`opacity-0`) when the hover overlay slides up

---

## [1.4.1] — Grid Badge Polish

### Fixed
- Warning badge in grid view redesigned: filled amber triangle (raw SVG) replaces filled amber circle — amber body with no stroke outline, white `!` line and dot rendered as separate SVG paths for full control
- Warning badge repositioned from top-left to top-right corner in grid view (was stacked below crown in the same flex-col)
- Crown badge in grid view now renders as a simple positioned `div` at top-left — flex-col wrapper removed since warning no longer shares that corner
- Crown SVG inside the badge bumped from 16×16 to 18×18 (better fill inside the `w-7 h-7` circle)
- × remove button moved from straddling the corner edge (`-top-3 -right-3`, outside the overflow-hidden wrapper) to inset inside the card art (`top-1.5 right-1.5`, clipped by `rounded-xl`)
- List view warning icon updated to matching raw SVG triangle (16×16) for consistency with grid view

---

## [1.4.0] — Standard & Commander Format Support

### Added
- Deck format system: per-deck format field (`"freeform"` | `"standard"` | `"commander"`) with centralized `formatRules.ts` rules engine (`getFormatRules`, `getCardWarnings`, `isEligibleCommander`)
- Commander support: designate a commander card per deck; color identity validation, singleton enforcement (soft warning), copy limit threshold set to 2 for Commander
- Format picker popover (`FormatPicker.tsx`): shared component accessible from sidebar badge click, toolbar badge click, and "+ New Deck" button
- Format badges in sidebar deck rows: "STD" (blue) for Standard, "CMD" (yellow) for Commander, "FF" (neutral) for Freeform — all clickable to open format picker
- Format badge pill in workspace toolbar: "Standard" (blue), "Commander" (yellow), "Freeform" (neutral) — all clickable to open format picker
- Commander visual treatment — grid view: yellow crown badge (w-7 h-7, bg-yellow-500) on designated commander card; crown button in hover overlay to designate/remove
- Commander visual treatment — list view: persistent filled crown icon before name on commander row; hover-only outline crown on all other rows (clickable to designate)
- Warning badge system: filled amber circle with white `!` on cards with format violations (legality, color identity, copy limit) — rendered identically in grid view (top-left) and list view (after name); combined tooltip shows all warnings
- Commander card pinning: always first in grid and list regardless of sort, with an `h-3` spacer row below (matches sort group separator pattern)
- Sideboard-to-Commander confirmation dialog: when switching to Commander with sideboard cards, prompts "Merge into Main Deck" or "Delete Sideboard"; Escape key closes without making changes
- Format-aware Opening Hand Simulator: probability thresholds recalibrated per format — 8%/4% (Freeform/Standard), 5%/2% (Commander); commander card excluded from library and Draw Odds list when `commanderId` is set
- `color_identity` field on `ScryfallCard`; lazy backfill via Scryfall `/cards/collection` triggered when active deck switches to Commander format
- Import/export format metadata: `// Format:` and `// Commander:` comment headers on Standard/Commander exports; parsed on import for full round-trip fidelity
- Format-aware deck stats: `targetDeckSize`, `isAtTarget`, `isOverTarget` returned from `useDeckStats`

### Changed
- Sidebar expanded width: 240px → 256px
- Sidebar layers icon grayed out (always rendered, not hidden) and disabled for Commander decks
- Main/Side pill toggle hidden entirely for Commander decks (Commander has no sideboard)
- Card count colors in toolbar now format-aware: green at target (60 for Freeform/Standard, 100 for Commander), red above target
- Sideboard count shows "Side: X / 15" with red-above-15 indicator for Standard; Freeform retains existing plain display
- List view column order reordered: `[−qty+] [Owned] [Name] [Type] [Mana] [Price] [×]`
- List view Owned column simplified to `X/Y` inline-editable text only (checkbox, minus/plus stepper, and progress bar removed)
- Qty column `−/+` buttons in list view use new `w-5 h-5 rounded-full` style, hover-only visibility (always visible for commander row)
- Copy limit soft-warning threshold is now format-aware: 5 (Freeform/Standard) or 2 (Commander singleton)
- New deck creation always prompts for format selection via FormatPicker popover

**Closes #17**

---

## [1.3.2] — UI Polish: Sidebar Rail, Pricing, Deck Name Dedup, Grid Tile

### Changed
- Grid view card tiles no longer show an always-visible qty badge at rest. The tile at rest displays only card art. Qty controls remain fully accessible in the hover overlay.
- Value and To Buy stats in the workspace toolbar now show a combined main + sideboard total (with a muted `(M+S)` label) when the active deck has a sideboard enabled.
- Collapsed sidebar rail now has a `PanelLeftOpen` icon at the top as a dedicated expand control. Clicking anywhere on the rail background also expands to the last active tab.
- Expanded sidebar collapse button changed from `ChevronLeft` (`‹`) to `PanelRightOpen` for visual clarity.
- Version badge in sidebar footer now toggles an inline changelog section instead of a browser alert popup.
- Buy link buttons (TCGPlayer, Card Kingdom) in the sidebar actions strip now use `text-[10px]` so "Card Kingdom" fits on one line at 240px sidebar width.

### Fixed
- Creating a new deck when a deck with the same name exists no longer produces malformed names. Auto-appends `(2)`, `(3)`, etc. starting at 2. Untitled decks follow the same rule: first stays unnamed, subsequent get `Untitled (2)`, `Untitled (3)`, etc.
- Import "Create New Deck" now uses the same deduplication rule — appends `(2)`, `(3)` if the filename conflicts with an existing deck name.
- Card Kingdom button text wrapping in sidebar actions strip fixed via reduced font size. Closes #58.

### Added
- Collapsed sidebar rail: hovering any icon shows a right-positioned tooltip (Expand Sidebar, Search, Decks, New Deck, Buy Me a Coffee, Settings).
- Collapsed sidebar rail: `Plus` icon between Decks and spacer creates a new deck without expanding the sidebar.

---

## [1.3.1] — Hot Fix: Badge Readability, Overlay Color, Toolbar Overflow, Mana Symbols

### Fixed
- Grid view qty badge and × remove button now use solid backgrounds (`bg-neutral-900`, `bg-green-600`, `bg-red-600`) instead of semi-transparent overlays — always readable regardless of card art.
- Grid view overlay qty number now reflects copy-limit color logic: green at exactly 4 copies, red at 5+, white otherwise. Exempt cards (Basic Lands, "any number" cards) always show white.
- Deck name input in workspace toolbar now caps at 200px and truncates with ellipsis when not focused, preventing long names from pushing stats and controls off-screen.
- Search result mana symbols updated to spec color palette: W warm gold, U blue with dark text, B dark neutral, R red with light text, G green with light text, colorless/generic neutral gray. Double-faced cards fall back to first face mana cost.

---

## [1.3.0] — Sidebar Redesign + Grid View Overlay

### Added
- Collapsible sidebar with Search/Decks tab system. Sidebar collapses to a 48px icon rail via `‹` chevron in the tab bar; click Search or Decks icon on the rail to re-expand to the correct tab. Expanded width 240px, collapsed 48px, smooth 300ms cubic-bezier transition. Collapse state and active tab persist to localStorage (`mtg-sidebar-collapsed`, `mtg-sidebar-active-tab`).
- Search tab: clear button (×) inside the search input — clears query and instantly restores cached category results with no re-fetch. Inline mana cost symbols on each result row (colored circles: W cream, U blue, B dark, R red, G green, numerics gray). Circular `+` button on hover replaces the old rectangular badge.
- Decks tab: full deck management panel — deck list rows with active indicator, card count, Layers icon (creates/switches sideboard), hover-only × icon with absolute-positioned delete dropdown ("Delete Deck" always, "Delete Sideboard" conditional). Import/Export buttons and TCGPlayer/Card Kingdom buy links moved here from workspace toolbar.
- Grid view hover overlay: hovering a card tile reveals a slide-up frosted-glass overlay from the bottom (`bg-black/75 backdrop-blur-sm`) with circular `−` qty `+` controls and an `Owned: X/Y` inline-editable counter. Circular × remove button at top-right, also hover-revealed.
- Grid view qty badge: always-visible circular badge at top-left of each tile. Color-coded: gray ≤ 3 copies, green at exactly 4 (at limit), red at 5+ (over limit). Replaces the old separate 4-copy warning badge.

### Changed
- Workspace toolbar slimmed from three rows to a single row. Left side: deck name input + card count + value + to buy. Right side: Simulator button + Main/Side pill + sort/group/view controls. Deck dropdown, import/export buttons, and buy links removed from toolbar.
- Grid card tiles redesigned: card art fills the entire tile. Always-visible bottom bar with `− qty +` controls, progress bar, owned stepper, and checkbox removed. Default state shows only the circular qty badge.
- `useDeckImportExport` lifted to `page.tsx` (common parent of sidebar and workspace) so import/export callbacks can be shared across sibling components without duplication.
- "Test Deck" simulator button renamed to "Simulator".

### Removed
- `DeckDropdown.tsx` retired — functionality absorbed into `SidebarDecksTab.tsx`.
- GitHub icon removed from sidebar footer.
- Expand/collapse chevron removed from sidebar footer (moved to tab bar).
- Grid view ownership progress bar removed from default tile view (ownership visible in hover overlay).
- Grid view "mark owned" checkbox and owned stepper removed from default tile view (owned editing in hover overlay).
- Double-faced card flip animation removed from grid tiles (flip animation conflicted with hover overlay system; flip remains accessible via CardModal).

---

## [1.2.1] — Bug Fix: Land Sort Group Spacer

### Fixed
- Land cards (Basic lands, fetchlands, Triomes, dual lands) now appear in their own sort group when sorting by Color in list view. Previously, all lands fell through to the colorless group because their `mana_cost` is empty — causing them to be indistinguishable from colorless non-lands and missing the visual spacer that should appear between groups. Fixed in both `getGroupKey()` (spacer logic) and `colorSortKey()` (sort order) using the same `type_line?.includes("Land")` check established in v1.1.6.

---

## [1.2.0] — Opening Hand Simulator Stats Panel

### Added
- Mana curve histogram in Opening Hand Simulator sidebar: spells only (lands excluded), CMC buckets 1–7+ (CMC ≥ 7 grouped into 7+), bars normalized to tallest bucket, count label above each bar, CMC label below. (Closes #4)
- Lands strip below histogram: emerald color swatch, land count, percentage of deck. Static — does not update as cards are drawn.
- Current Hand stats panel: cards in hand, land count, avg CMC of spells only (shows `—` when hand contains no spells). Updates live on every Draw and Mulligan.
- Draw Odds list in Opening Hand Simulator sidebar: one row per unique card remaining in library, showing live next-draw probability as a percentage with a normalized bar that depletes as copies are drawn. Color thresholds: green ≥ 8%, yellow ≥ 4%, red < 4%. Bar color and % number always match. Cards with 0 copies remaining are hidden. (Closes #7)
- Lands toggle in Draw Odds header: default on; instantly filters lands in/out of the list. Active state uses emerald accent.
- Pin interaction: click a card row in Draw Odds or click a card image in the hand grid to toggle pin. Pinned rows float to top of Draw Odds list with blue background, border, filled star icon, and blue name text. Pinned card images show blue ring and star badge. Multiple cards can be pinned simultaneously. Mulligan clears all pins.
- Mulligan counter in Opening Hand Simulator header subtitle alongside Hand and Library counts. Starts at 0 on modal open, increments by 1 on each Mulligan, resets when modal is closed and reopened. (Closes #9)
- Named probability threshold constants at top of file: `PROB_GREEN = 0.08`, `PROB_YELLOW = 0.04` — calibrated for 60-card decks; pre-named for Commander recalibration when that mode ships.

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
