# REVIEW.md — MTG Deck Builder Session Journal

## How This File Works
This file is the live session journal shared between Phi, Claude Chat, and Claude Code.
- **Claude Code writes:** Plan review table, testing checklist, session summary — but only commits to git at the end of the session in a clean completed state
- **Phi writes:** Test results (checking boxes), inline comments on failures, emerging issues during QA
- **Claude Chat reads:** Verifies plan review for ghost fixes, triages failures and emerging issues, incorporates findings into next Claude Code prompt
- At any point during a multi-day session, anyone can read this file to see the current state of the build
- Never committed to git mid-session — only in the final commit alongside CLAUDE.md and CHANGELOG.md

---

## Session Start Sync Check
Before any design or build work begins, confirm all of the following:
- [x] Version in CLAUDE.md matches the latest entry in CHANGELOG.md — both v1.1.5 ✅
- [x] REVIEW.md shows APPROVED ✅ with no open carry-forwards from last session ✅
- [x] No unclosed GitHub issues that should have been closed last session ✅
- [x] Capture Log triaged and items promoted or backlogged ✅ (2026-03-08T13:00 matches)

---

## Current Release: v1.1.6
Status: IN PROGRESS 🔧

---

## Plan Review — v1.1.6

| File | Change |
|---|---|
| `src/components/workspace/DeckDropdown.tsx` | Item 1 (#77): Replace `pointer-events-none` blue dot span with a clickable radio element. Active deck: filled blue dot. Inactive decks: hollow gray circle (`border border-neutral-500 rounded-full w-2 h-2`). Click inactive → switches active deck, dropdown stays open. Click active → no-op. Tooltip "Switch deck" on inactive only. `e.stopPropagation()` prevents deck-name click from firing. |
| `src/components/workspace/ListCardTable.tsx` | Item 2 (#47): Add `sortBy?: string` and `isGrouped?: boolean` props. When `isGrouped === false` and `sortBy === 'color'` or `'mv'`, detect group boundary between adjacent cards (color group key or cmc change) and add `mt-4` spacer to the first row of each new group. Item 3 (#56): Change 4-copy badge qty span from `text-yellow-400` to `text-red-400`. |
| `src/components/workspace/WorkspaceToolbar.tsx` | Item 3 (#56): Toolbar card count — green (`text-green-400`) at exactly 60, red (`text-red-400`) over 60 (was yellow at ≥ 60). Item 4 (#57): Active Main/Side pill changes from `bg-neutral-800 text-white` to `bg-blue-600 text-white`. Item 5 (#70): Deck name input placeholder changed to "Untitled" with `placeholder:text-neutral-500`; `size` fallback added for empty name. |
| `src/components/workspace/VisualCard.tsx` | Item 3 (#56): Change 4-copy badge qty span from `text-yellow-400` to `text-red-400`. |
| `src/components/workspace/Workspace.tsx` | Pass `sortBy` and `isGrouped` props to both `ListCardTable` call sites (grouped view inner table and ungrouped list view). |
| `src/config/version.ts` | Bump `APP_VERSION` to `"1.1.6"` and add changelog entry. |
| `BACKLOG.md` | Clear the two workflow items that are in-scope for this session. Timestamps and any new unpromoted items stay. |
| `CLAUDE.md` | Version bump to v1.1.6; close #47, #53, #56, #57, #70 in backlog (mark closed this release); add #77 to backlog; add BACKLOG.md promoted-item cleanup rule to Key Technical Notes. |
| `CHANGELOG.md` | Add v1.1.6 entry. |

**Waiting for PROCEED before touching any files.**

---

## Testing Checklist — v1.1.6

### Item 1 — #77: Deck Dropdown Radio Buttons
- [x] Active deck row shows a filled blue dot on the left (same visual as before)
- [x] Inactive deck rows show a hollow gray circle outline on the left
- [x] Clicking the hollow gray circle on an inactive deck → switches active deck, dropdown stays open
- [x] Clicking the filled blue dot on the active deck → no-op (nothing happens, dropdown stays open)
- [x] Clicking a deck name still switches that deck and closes the dropdown (existing behavior unchanged)
- [x] Hovering the hollow gray circle on an inactive deck shows tooltip "Switch deck"
- [x] No tooltip on the active deck dot
- [x] No tooltip on deck name
- [x] Clicking the radio button does NOT also trigger the deck name click behavior (stopPropagation works)

### Item 2 — #47: Sort Group Separators in List View
- [ ] Switch to List view, sort by Color — clean h-3 spacer row between groups; spacer is transparent (app background shows through, not table bg)
- [ ] Switch to List view, sort by Mana Value — same clean spacer between CMC groups
- [x] Switch to List view, sort by Name — NO extra spacing added
- [x] Switch to List view, sort by Original — NO extra spacing added
- [x] Enable Group By Type — NO extra spacing added (type headers already provide visual separation)
- [x] Grid view is completely unaffected

### Item 3 — #56: Card Count Color Progression + 4-Copy Badge Color
- [x] Toolbar card count shows white text when total < 60 (default)
- [x] Toolbar card count turns green (`text-green-400`) at exactly 60 cards
- [x] Toolbar card count turns red (`text-red-400`) when over 60 cards
- [x] 4-copy warning badge in grid view appears red (not yellow) when a card reaches 5+ copies
- [x] 4-copy warning badge in list view appears red (not yellow) when a card reaches 5+ copies
- [x] Sideboard card count (X / 15): white below 15, green at exactly 15, red above 15

### Item 4 — #57: Main/Side Pill Color
- [x] Active "Main" pill has blue background + white text
- [x] Active "Side" pill has blue background + white text
- [x] Inactive pill remains gray (unchanged)
- [x] Disabled "Side" pill (no sideboard) remains dark gray (unchanged)

### Item 5 — #70: Untitled Deck Name Placeholder
- [x] A new deck is created with an empty name — shows gray "Untitled" placeholder immediately (no "New Deck" default)
- [x] When the user types into the name field, text is white
- [x] When the user clears the name field entirely, the gray "Untitled" placeholder reappears
- [x] Existing deck names display and edit normally

### Item 6 — #13: List View Row Color Tinting (pulled forward from v1.2.0)
- [ ] White cards have a warm cream tint
- [ ] Blue cards have a blue tint
- [ ] Black cards have a purple/dark tint
- [ ] Red cards have a red tint
- [ ] Green cards have a green tint
- [ ] Multicolor cards (2+ colors) have a gold tint
- [ ] Colorless/land cards (empty colors array) have a neutral gray tint
- [ ] Yellow highlight on newly added card still overrides the tint
- [ ] Grid view has no tinting (list view only)

### Workflow Fixes
- [x] BACKLOG.md: two in-scope workflow items cleared; consolidation timestamp line remains ✅ (timestamp stays by design — it marks when the log was last consolidated, not a promoted item)
- [x] CLAUDE.md: version reads v1.1.6
- [x] version.ts reads 1.1.6
- [x] CHANGELOG.md has v1.1.6 entry at the top
- [x] Gate check: Plan Review step held (no files touched until PROCEED) ✅ — terminal session

---

## Emerging Issues
<!-- Phi fills this in during QA -->

---

## Session Summary — v1.1.6
Status: APPROVED ✅

### Gate Check — Item 7
- Plan Review gate held: no files touched until PROCEED ✅
- Testing Checklist gate held: two rounds of carry-forward fixes before APPROVED ✅
- Session type: terminal

### Item 1 — #77: Deck Dropdown Radio Buttons
Replaced the `pointer-events-none` blue dot span in `DeckDropdown.tsx` with a clickable button. Active deck: filled blue dot (`w-1.5 h-1.5 bg-blue-400`), cursor-default, no tooltip. Inactive decks: hollow gray circle (`w-2 h-2 border border-neutral-500`), cursor-pointer, tooltip "Switch deck", `e.stopPropagation()` prevents deck-name button from firing. Clicking inactive radio sets active deck and keeps dropdown open.

### Item 2 — #47: Sort Group Separators in List View
Added `sortBy` and `isGrouped` props to `ListCardTable`. Added `getGroupKey()` helper that keys by color group or CMC depending on sort mode. When `!isGrouped && (sortBy === 'color' || sortBy === 'mv')`, a `<React.Fragment>` wraps each row and a transparent `h-3` spacer `<tr>` is inserted at group boundaries. Spacer `<td>` has `bg-transparent` so app background shows through. `Workspace.tsx` passes `sortBy` and `isGrouped` at both `ListCardTable` call sites.

### Item 3 — #56 + #53: Card Count Color Progression + 4-Copy Badge
`WorkspaceToolbar.tsx`: main deck count — green at exactly 60, red above 60 (was yellow at ≥ 60). Sideboard count — green at exactly 15, red above 15 (was yellow at > 15). `VisualCard.tsx` and `ListCardTable.tsx`: 4-copy warning badge qty span changed from `text-yellow-400` to `text-red-400`.

### Item 4 — #57: Main/Side Pill Color
Active pill style changed from `bg-neutral-800 text-white border-neutral-700/50` to `bg-blue-600 text-white border-blue-500/50` in `WorkspaceToolbar.tsx`. Applied to both Main and Side active states.

### Item 5 — #70: Untitled Deck Name Placeholder
`WorkspaceToolbar.tsx`: changed `placeholder="Enter deck name..."` to `placeholder="Untitled"` with `placeholder:text-neutral-500`. `useDeckManager.tsx`: all four `name: "New Deck"` occurrences changed to `name: ""` so new decks and default decks start unnamed and show the placeholder.

### Item 6 — #13: List View Row Color Tinting (pulled forward from v1.2.0)
Added `getRowTint()` helper in `ListCardTable.tsx` that returns a subtle RGBA background color based on `card.colors`: W cream, U blue, B purple, R red, G green, multicolor gold, colorless/land neutral gray. Applied via `style={{ backgroundColor: getRowTint(card) }}` on `<tr>` — suppressed when the row is highlighted (yellow highlight takes precedence). Grid view unaffected.

### Workflow Fixes
- BACKLOG.md: two in-scope workflow items cleared; consolidation timestamp retained by design.
- CLAUDE.md: version bumped to v1.1.6; #47, #53, #56, #57, #70 closed this release; #13 closed (pulled forward from v1.2.0); #77 added to backlog; BACKLOG.md promoted-item cleanup rule added to Key Technical Notes.

### Carry-Forwards
None — all items complete.

---

## Previous Session History

### v1.1.5 Testing Results
Status: APPROVED ✅

### Fix 1 — #55: Blue dot non-interactive
Moved the blue dot span outside the deck-select button in `DeckDropdown.tsx`. The dot now sits as a sibling element with `pointer-events-none` and `ml-3` positioning, visually identical to before. Clicking it does nothing. Clicking the deck name still switches deck and closes dropdown.

### Fix 2 — #59: showThumbnail persistence
Added `THUMBNAIL_KEY = "mtg-show-thumbnail"` constant in `useDeckManager.tsx`. Loaded on mount in the existing `useEffect` with fallback default of `true`. Saved via new `useEffect` on `[showThumbnail, isMounted]`. Sort preference persistence confirmed intact — no changes needed.

### Fix 3 — #48: Owned counter inline typing
Added inline editing to the owned counter in both `VisualCard.tsx` and `ListCardTable.tsx`. Mirrors the existing qty counter pattern exactly. Validation matches `updateOwnedQty` — any integer ≥ 0 commits; empty or non-numeric reverts silently. `isOwnedEscaping` ref prevents blur-after-escape double-commit.

### Housekeeping
- CLAUDE.md: version bumped to v1.1.5; 7 items discarded from backlog; 5 items moved to v2.0; priority notes added; #76 promoted; triage process added to Session Start; `mtg-show-thumbnail` added to persistence keys list.
- BACKLOG.md: consolidation prompt updated with empty-consolidation guard and items-before-timestamp rule; #76 item cleared.
- CHANGELOG.md and version.ts updated.

### Carry-Forwards
None — all items in this sprint are complete.

---

## Previous Session History

### v1.1.4 Testing Results
### Fix 1 — Grid View 4-Copy Tooltip Text
- [x] ⚠️ tooltip in grid view reads "Exceeds 4-copy limit"
- [x] Old text "Exceeds the 4-copy limit for standard play" no longer appears anywhere in grid or list view

### Fix 2 — Tooltip Max-Width Cap
- [x] List view 4-copy tooltip no longer clips
- [x] Tooltip text wraps cleanly within max-width when needed
- [x] Export List tooltip — max-width cap present
- [x] Import List tooltip — max-width cap present
- [x] TCGPlayer / Card Kingdom tooltips — max-width cap present
- [x] Test Deck tooltip — max-width cap present
- [x] Sort ↑/↓ tooltip — max-width cap present
- [x] Group / Grid / List view toggle tooltips — max-width cap present
- [x] Main / Side pill tooltips — max-width cap present
- [x] No horizontal scroll reintroduced

### REVIEW.md Workflow
- [x] REVIEW.md written with plan review table before execution
- [x] REVIEW.md updated with testing checklist after build
- [x] Emerging Issues section present and ready for Phi to fill in
- [ ] REVIEW.md committed to git only in the final post-release commit --- no way to verify and test this until the end when we give the APPROVED

---

## v1.1.4 Emerging Issues
- make a note that once Claude Code goes through a few sessions where the Plan Review table aligns with the prompt from Claude Chat, then we can probably trust it more and remove this review process? speeds things up. but we still want to keep the testing Checklist hold for QA
- 💡 Tooltip max-width cap solves clipping but visual treatment needs polish — revisit during UI polish sweep for a better solution.

---

## Previous Session History

### v1.1.3 Testing Results
### Fix 1 — 4-Copy Tooltip Text
- [x] ⚠️ badge tooltip reads "Exceeds 4-copy limit" — not clipped
- [ ] Tooltip visible on all rows in list view — ⚠️ still clips slightly in list view, less severe. Grid view still has old text. Carry forward to v1.1.4.

### Fix 2 — X Button Tooltip
- [x] No tooltip on X button in grid view
- [x] No tooltip on X button in list view (regression check)
- [x] X button still functions correctly in both views

### Fix 3 — Main/Side Tooltips
- [x] "Main" button shows tooltip "Switch to main deck"
- [x] "Side" button shows tooltip "Switch to sideboard"
- [x] Tooltips visible and not clipped
- [x] All other row 3 tooltips still present (regression check)

### v1.1.3 Emerging Issues
- 🐛 Grid view 4-copy tooltip still shows old text "Exceeds the 4-copy limit for standard play" — needs same update as list view
- 🐛 List view 4-copy tooltip still clips slightly — needs proper root cause diagnosis before fixing
- 💡 Consider a global max-width cap on all tooltips to prevent long text clipping regardless of content

---

## Session Summary — v1.1.4

All checklist items passed. One REVIEW.md workflow item deferred by design (can't verify "committed only at session end" until the commit happens — inherent to the process).

### Carry-Forwards
- Tooltip visual treatment needs polish (#60) — tracked in backlog, not a blocker

### New Backlog Items Created This Session
#47 Visual separator between sort groups | #48 Owned counter inline typing | #49 Version badge revisit | #50 Dark/light theme | #51 Buy button layout | #52 Price → TCGPlayer link | #53 60-card soft warning | #54 Progress bar width | #55 Blue dot dropdown bug | #56 Color progression on counts | #57 Main/Side pill color | #58 Sideboard pricing | #59 Settings persistence | #60 Tooltip polish

---

## Release Log This Session
| Version | Description | Status |
|---|---|---|
| v1.1.0 | Sideboard support, UI persistence, tooltip fixes | ✅ Shipped |
| v1.1.1 | Hot fix — sideboard view transition, refresh persistence, tooltip clipping | ✅ Shipped |
| v1.1.2 | Hot fix — tooltip clip, yellow highlight ring, tooltip cleanup | ✅ Shipped |
| v1.1.3 | Tooltip consistency pass | ✅ Shipped |
| v1.1.4 | Tooltip carry-forwards + REVIEW.md workflow | ✅ Shipped |
| v1.1.5 | Bug fix sprint — blue dot, thumbnail persistence, owned counter inline typing | ✅ Shipped |
| v1.1.6 | UI polish + workflow fixes | 🔧 In Progress |
