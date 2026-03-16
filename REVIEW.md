# REVIEW.md — MTG Deck Builder Session Journal

---

## Current Release: v1.3.2
Status: APPROVED ✅

---

## Plan Review — v1.3.2: UI Polish + Sidebar Rail + Bug Fixes

**Branch:** `v1.3.2` | **Complexity:** ⚠️ 8 source files, 0 new components — prompt originated from Claude Chat design session (2026-03-15). Phi may PROCEED directly or sync to Claude Chat for cross-check.

### Files Touched

| File | Change |
|---|---|
| `src/hooks/useDeckStats.ts` | Fix 1: add sideboard sum to `totalValue` and `remainingCost` when `activeDeck.sideboard !== undefined`. |
| `src/hooks/useDeckManager.tsx` | Fix 2: add deduplication to `createNewDeck` — scan existing names, auto-append `(N)` starting at 2. Treat `""` as `"Untitled"` for dedup check; first untitled keeps `""`, subsequent get `"Untitled (2)"`, etc. |
| `src/hooks/useDeckImportExport.tsx` | Fix 2: fix `getUniqueDeckName` counter to start at 2 (currently produces `"Name (1)"` — should produce `"Name (2)"`). |
| `src/components/workspace/WorkspaceToolbar.tsx` | Fix 1: show `(M+S)` muted label on both Value and To Buy stats when `activeDeckHasSideboard` is true (prop already exists). |
| `src/components/layout/Sidebar.tsx` | Fix 3: replace `alert()` on version badge with `isChangelogOpen` state toggle; render inline expand section below footer row showing `CURRENT_CHANGELOG` with max-height transition. Fix 7: replace `ChevronLeft` with `PanelRightOpen`. Pass `activeTab` to `SidebarRail` as new prop for Fix 5. |
| `src/components/layout/SidebarRail.tsx` | Fix 4: add right-positioned tooltip on all icons. Fix 5: add `onClick` to outer container — `e.target === e.currentTarget` guard, calls `expandTo(activeTab)` using new `activeTab` prop. Fix 6: add `Plus` icon between Decks and spacer, calls `createNewDeck()` + `setDeckViewMode("main")` from `useDeckManager`, sidebar stays collapsed. Fix 7: add `PanelLeftOpen` icon at top of rail, calls `expandTo(activeTab)`. |
| `src/components/layout/SidebarDecksTab.tsx` | Fix 8: reduce font size on TCGPlayer and Card Kingdom buttons from `text-xs` to `text-[10px]` so "Card Kingdom" fits on one line. |
| `src/components/workspace/VisualCard.tsx` | Fix 9: remove `badgeClass` computed value and the always-visible qty badge div. Keep `overlayQtyClass` and all hover overlay code intact. |
| `src/config/version.ts` | Bump `APP_VERSION` to `"1.3.2"`, add changelog entry string. |
| `CHANGELOG.md` | Add `## [1.3.2]` section (Changed, Fixed). |
| `CLAUDE.md` | Bump `Current Version` to `v1.3.2`. Update `Active Milestone`. |
| `BACKLOG.md` | Close all 9 addressed items under `### v1.3.2`. Clear Active Milestone. Clean up #76 and basic lands spacer already shown as closed. |
| `REVIEW.md` | This file. |

---

## Testing Checklist — v1.3.2

### Fix 1 — Sideboard Combined Pricing
- [x] Active deck with **no sideboard**: Value shows `$X.XX`, To Buy shows `$X.XX` — no `(M+S)` label
- [x] Active deck with a sideboard: Value shows `$X.XX (M+S)`, To Buy shows `$X.XX (M+S)`
- [x] The combined total is the same whether you're viewing main or sideboard view
- [x] `(M+S)` label is visually muted (neutral-500), doesn't compete with the dollar amount

### Fix 2 — Deck Name Conflict Deduplication
- [x] Create deck "Atraxa" — exists already → new deck becomes `Atraxa (2)`
- [x] With "Atraxa" and "Atraxa (2)" both existing → next becomes `Atraxa (3)`
- [x] First untitled deck: stays unnamed (toolbar shows "Untitled" placeholder in gray)
- [x] Create second untitled deck → gets explicit name `Untitled (2)`
- [x] Create third untitled deck → gets `Untitled (3)`
- [x] Import "Create New Deck" with a name that already exists → appended `(2)`, not `(1)`

### Fix 3 — Version Badge Inline Changelog
- [x] Version badge in sidebar footer is collapsed by default on page load
- [x] Clicking version badge expands inline section below showing current changelog text
- [x] Clicking version badge again collapses it
- [x] Badge highlights (blue-300, slightly brighter border) when changelog is open
- [x] Long changelog text has internal scroll (max-h-32) — doesn't overflow footer
- [x] No popup, no alert, no modal

### Fix 4 — Collapsed Rail Tooltips
- [x] PanelLeftOpen icon → tooltip "Expand Sidebar" on hover (right-positioned)
- [x] Search icon → tooltip "Search"
- [x] Decks icon → tooltip "Decks"
- [x] Plus icon → tooltip "New Deck"
- [x] Coffee icon → tooltip "Buy Me a Coffee"
- [x] Settings icon → tooltip "Settings"
- [x] Tooltips appear on hover, disappear on mouse-out

### Fix 5 — Click Empty Rail to Expand
- [x] Clicking empty background area of collapsed rail expands sidebar to last active tab
- [x] Clicking on a button in the rail (Search, Decks, etc.) does NOT trigger the background expand — buttons work normally

### Fix 6 — New Deck Icon in Collapsed Rail
- [x] Plus icon is positioned between the Decks icon and the flex spacer
- [x] Clicking Plus creates a new deck
- [x] Sidebar stays collapsed after clicking Plus
- [x] New deck becomes the active deck (name shows empty "Untitled" in workspace)
- [x] New deck starts in main view (`setDeckViewMode("main")`)

### Fix 7 — Panel Open/Close Icons
- [x] Collapsed rail: PanelLeftOpen icon at top, expands on click
- [x] Expanded sidebar: collapse button shows PanelRightOpen (not chevron `‹`)
- [x] PanelRightOpen still collapses the sidebar correctly

### Fix 8 — Card Kingdom Button Wrap
- [x] Both TCGPlayer and Card Kingdom buttons show on one line in the actions strip
- [x] "Card Kingdom" does not wrap to a second line at 240px sidebar width
- [x] Both buttons use the same reduced font size (visually consistent)

### Fix 9 — Qty Badge Removed from Grid Tile
- [x] Grid tiles at rest show only card art — no circular qty badge in the top-left corner
- [x] Hovering a tile still shows the slide-up overlay with `−` qty `+` controls and qty number
- [x] Qty number in overlay still uses green/red copy-limit color logic (unchanged from v1.3.1)
- [x] × remove button at top-right still hover-only (unchanged)
- [x] Zero-qty cards still show grayed-out/desaturated art

### No Regression
- [x] Search, add card, scroll+highlight still work
- [x] Deck switching, sideboard creation, delete all work from sidebar
- [x] Import/Export still functional
- [x] CardModal opens from grid and list view
- [x] SampleHandModal works
- [x] All localStorage state survives refresh
- [x] List view unchanged

---

## Carry-Forward Testing — v1.3.2

### CF1 — Untitled Deck Naming
- [x] First new deck gets the explicit name `"Untitled"` (visible in toolbar name input, not just placeholder)
- [x] Second new deck gets `Untitled (2)`, third gets `Untitled (3)`, etc.
- [x] No empty-string edge case — all new decks have a real name

### CF2 — Version Badge Highlight
- [x] Changelog expanded state is clearly visually distinct from collapsed (`text-blue-100`, `border-blue-400`, brighter background)
- [x] At-a-glance you can tell whether the changelog is open or closed

### CF3 — Rail Tooltips Vertically Centered
- [ ] Hovering any rail icon shows tooltip positioned to the **right** of the icon and vertically centered
- [ ] All 6 tooltips appear: Expand Sidebar, Search, Decks, New Deck, Buy Me a Coffee, Settings
- [ ] Tooltips are not clipped by the sidebar edge

### CF4 — Plus Icon Activates New Deck
- [x] Clicking Plus in collapsed rail: new deck created AND workspace switches to show the new deck
- [x] Toolbar shows `Untitled` (or `Untitled (N)`) ready for renaming
- [x] Sidebar stays collapsed

### CF5 — Deck Creation Auto-Switch
- [x] Clicking "+ New Deck" in Decks tab: workspace switches to the new deck immediately (1st, 2nd, 3rd creation all work)
- [x] No regression: previous deck is no longer shown in the workspace after creating a new one

### CF6 — Import Switches to Imported Deck
- [x] Import "Create New Deck": workspace switches to the imported deck after import completes
- [x] Deck name from the import file (deduplicated if needed) shows in toolbar
- [x] Not "Untitled" — the imported deck's name is used

### CF7 — Search Row Click Adds Card
- [x] Clicking a card's name in search results adds it to the active deck
- [x] Clicking the `+` icon also adds the card (still works)
- [x] No double-add when clicking `+` (stopPropagation prevents row click from also firing)

---

## Emerging Issues
<!-- None -->

---

## Session Summary — v1.3.2
Status: APPROVED ✅

### Gate Check
- Plan review written to REVIEW.md before any file changes ✅
- 8 source files, 0 new components — prompt from Claude Chat design session, Phi reviewed directly ✅
- Testing checklist written before pausing for QA ✅
- 2 rounds of carry-forwards applied before APPROVED ✅

### Fix 1 — Sideboard Combined Pricing
`useDeckStats.ts`: Added sideboard sums to `totalValue` and `remainingCost` when `activeDeck.sideboard !== undefined`. Added `hasSideboard` return value. `WorkspaceToolbar.tsx`: Added muted `(M+S)` label after both Value and To Buy dollar amounts when `activeDeckHasSideboard` is true. Closes #58.

### Fix 2 — Deck Name Conflict Deduplication
`useDeckManager.tsx`: Rewrote `createNewDeck` — generates `newId` outside the `setDecks` callback, always assigns `"Untitled"` (or `"Untitled (N)"`) as the explicit deck name, calls `setActiveDeckIdState(newId)` after the callback. `useDeckImportExport.tsx`: Fixed `getUniqueDeckName` counter to start at 2 (was producing `"Name (1)"` instead of `"Name (2)"`).

### Fix 3 — Version Badge Inline Changelog
`Sidebar.tsx`: Replaced `alert()` on version badge with `isChangelogOpen` state toggle. Added inline expand section below the footer row showing `CURRENT_CHANGELOG` text with `max-h-32 overflow-y-auto`. Expanded state badge: `bg-blue-500/30 border-blue-400 text-blue-100` for clear visual distinction.

### Fix 4 — Collapsed Rail Tooltips
`SidebarRail.tsx`: `RailTooltip` component renders `absolute left-full ml-2 top-1/2 -translate-y-1/2` span, `opacity-0 group-hover:opacity-100`. Wrapped each icon in `group relative` div. `Sidebar.tsx`: Fixed `overflow-hidden` → `isCollapsed ? "overflow-visible" : "overflow-hidden"` on `<aside>` — this was clipping all tooltip spans beyond the 48px boundary (root cause of two failed attempts).

### Fix 5 — Click Empty Rail to Expand
`SidebarRail.tsx`: `onClick` on outer container with `e.target === e.currentTarget` guard; calls `expandTo(activeTab)`. `Sidebar.tsx`: Passes `activeTab` as new prop to `SidebarRail`.

### Fix 6 — New Deck Plus Icon in Collapsed Rail
`SidebarRail.tsx`: Added `Plus` icon between Decks and spacer. On click: `createNewDeck()` + `setDeckViewMode("main")`. Sidebar stays collapsed.

### Fix 7 — Panel Open/Close Icons
`SidebarRail.tsx`: `PanelLeftOpen` icon at top of rail. `Sidebar.tsx`: Replaced `ChevronLeft` with `PanelRightOpen` in expanded tab bar.

### Fix 8 — Card Kingdom Button Wrap
`SidebarDecksTab.tsx`: Both TCGPlayer and Card Kingdom buttons changed from `text-xs` to `text-[10px]`.

### Fix 9 — Remove Qty Badge from Grid Tile
`VisualCard.tsx`: Removed `badgeClass` computed value and the always-visible circular qty badge div. `overlayQtyClass` and all hover overlay code unchanged.

### Carry-Forwards
- **CF1**: First new deck now gets explicit name `"Untitled"` instead of empty string. All new decks have a real name.
- **CF2**: Badge expanded state now `text-blue-100 border-blue-400 bg-blue-500/30` — clearly distinct from collapsed.
- **CF3**: Added `top-1/2 -translate-y-1/2` to `RailTooltip`. Fixed `overflow-hidden` → conditional on `<aside>`.
- **CF4**: Fixed by CF5 root cause fix (activation now works correctly after deck creation).
- **CF5**: `createNewDeck` regression — `setActiveDeckIdState` was called inside `setDecks` updater (React anti-pattern). Fixed: ID generated outside callback, activation called after.
- **CF6**: Import regression — same root cause as CF5. Fixed by same change.
- **CF7**: `SidebarSearchTab.tsx`: Added `onClick={() => handleAddCard(card)}` to `<li>` row. Added `e.stopPropagation()` to `+` button to prevent double-fire.

---

## How This File Works
This file is the live session journal shared between Phi, Claude Chat, and Claude Code.
- **Claude Code writes:** Plan review table, testing checklist, session summary — committed only at session end
- **Phi writes:** Test results (checking boxes), inline comments on failures, emerging issues during QA
- **Claude Chat reads:** Verifies plan review, triages failures, incorporates findings into next Claude Code prompt
- Never committed to git mid-session — only in the final commit alongside CLAUDE.md and CHANGELOG.md
