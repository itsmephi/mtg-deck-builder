# REVIEW.md — MTG Deck Builder Session Journal

---

## Current Release: v1.4.0
Status: APPROVED ✅

---

## Plan Review — v1.4.0 Prompt 1: Data Model, Format Rules, Migration, FormatPicker

**Branch:** `v1.4.0` | **Complexity:** 6 source files touched, 2 new files — prompt originated from Claude Chat design session. Phi may PROCEED directly.

### Files Touched

| File | Change |
|---|---|
| `src/types/index.ts` | Add `color_identity?: string[]` to `ScryfallCard`; add `format` and `commanderId?` to `Deck` |
| `src/lib/formatRules.ts` | **NEW** — pure format rules engine: `DeckFormat` type, `getFormatRules`, `getCardWarnings`, `isEligibleCommander` |
| `src/lib/scryfall.ts` | Map `color_identity` in `searchCards`; add `backfillColorIdentity` export |
| `src/hooks/useDeckManager.tsx` | Migration for `format`/`commanderId`; add `setDeckFormat`, `setCommanderId`, `mergeSideboardIntoDeck`, `deleteSideboardForFormat`; update `createNewDeck(format?)` |
| `src/hooks/useDeckStats.ts` | Accept `format` param; return `targetDeckSize`, `isAtTarget`, `isOverTarget` |
| `src/hooks/useDeckImportExport.tsx` | Export: write `// Format:` / `// Commander:` headers. Import: parse those headers and set `format`/`commanderId` on new deck |
| `src/components/layout/FormatPicker.tsx` | **NEW** — shared popover body: three format rows with icons, descriptions, optional current-format highlight |
| `CLAUDE.md` | Bump version to 1.4.0, update Active Milestone, file structure, key technical notes |
| `BACKLOG.md` | Promote #17 to Active Milestone; add Partner/Companion/Brawl/Search pipeline items |

---

## Plan Review — v1.4.0 Prompt 2: Sidebar, Toolbar, Grid View, List View UI

**Branch:** `v1.4.0` | **Complexity:** 6 source files — prompt originated from Claude Chat design session. Phi may PROCEED directly.

### Files Touched

| File | Change |
|---|---|
| `src/components/layout/Sidebar.tsx` | Bump expanded width inline style from 240 → 256 |
| `src/components/layout/SidebarDecksTab.tsx` | Format badge on deck rows; Layers icon grayed/disabled for Commander; "Change Format" in × dropdown with FormatPicker popover; "+ New Deck" opens FormatPicker; sideboard-to-Commander confirmation dialog |
| `src/components/workspace/WorkspaceToolbar.tsx` | Format badge pill (clickable, opens FormatPicker); format-aware card count colors; Standard sideboard max indicator; hide Main/Side toggle for Commander |
| `src/components/workspace/VisualCard.tsx` | Crown badge (top-left, commander only); warning badge (amber !); yellow tint overlay for commander; crown button in hover overlay for commander format |
| `src/components/workspace/Workspace.tsx` | Commander pinning in sortedCards memo; grid divider after pinned commander; format-aware softWarnThreshold; pass commanderId/format/commanderIdentity/onSetCommander down to card components |
| `src/components/workspace/ListCardTable.tsx` | Column reorder [−qty+][Owned][Name][Type][Mana][Price][×]; qty button styling + hover-only visibility; owned column simplified to X/Y inline-edit; crown/warning icons in Name cell; commander row tint + pinning + divider; format-aware copy limit |

---

## Plan Review — v1.4.0 Prompt 3: Simulator, Version Bump, Housekeeping, Ship

**Branch:** `v1.4.0` | **Complexity:** 2 source files + 4 doc files — final prompt. Phi may PROCEED directly.

### Files Touched

| File | Change |
|---|---|
| `src/components/layout/SampleHandModal.tsx` | Add `format`/`commanderId` props; format-aware probability thresholds; filter commander from library pool and Draw Odds list |
| `src/components/workspace/Workspace.tsx` | Pass `format`/`commanderId` to SampleHandModal; add lazy backfill useEffect (triggers when activeDeck switches to Commander) |
| `src/config/version.ts` | Update `CURRENT_CHANGELOG["1.4.0"]` with full combined entry |
| `CHANGELOG.md` | Write full `## [1.4.0]` section (Added + Changed) |
| `CLAUDE.md` | Active Milestone → v1.4.0 shipped; add new Key Technical Notes |
| `BACKLOG.md` | Close #17, close commander threshold item; add v1.4.0 closed section |
| `REVIEW.md` | This file — add testing checklist |

---

## Testing Checklist — v1.4.0

### Format Picker & Deck Creation
- [x] "+ New Deck" opens format picker popover - but do we need this picker in the collapsed toolbar as well for the + icon?
- [x] Clicking a format creates deck with that format and closes picker
- [x] Clicking outside picker closes without creating deck
- [x] Freeform deck: no format badge in sidebar or toolbar
- [x] Standard deck: "60" badge in sidebar, "Standard" pill in toolbar
- [x] Commander deck: "100" badge in sidebar, "Commander" pill in toolbar
- note: badges in the sidebar is confusing after testing. we should change the badges to "std" standard; "cmd" commander; "ff" freeform. and update the format picker as well.

### Format Switching
- [ ] Toolbar badge click opens format picker - clicking on number 60 or 100 badge should activate the format picker.
- [x] Deck row × dropdown shows "Change Format" option - clicking on change format, the format picker is obscured and cuts off screen because it pops up on the left, and the toolbar is on the left. lets remove this from the x menu and add this format picker in the badge instead.  for free-form decks we need a badge as well. maybe 'xx' or something?
- [x] Switching Standard ↔ Freeform: no data changes, just validation toggle
- [x] Switching TO Commander with empty sideboard: silent, no dialog
- [x] Switching TO Commander with sideboard cards: confirmation dialog appears
- [x] "Merge into Main Deck" merges cards correctly (qty aggregation for duplicates)
- [x] "Delete Sideboard" removes all sideboard cards
- [ ] Cancel (click outside / Escape) leaves format unchanged - click outside works, but not escape
- [x] Switching FROM Commander: clears commanderId

### Commander Designation — Grid
- [x] Hover overlay shows crown button only in Commander format decks
- [x] Clicking crown designates card as commander (yellow tint + crown badge appears)
- [x] Only one commander at a time — designating a new one clears the old
- [x] Clicking filled crown on commander removes designation
- [x] Non-legendary card: still designable, tooltip warns "not typically eligible"

### Commander Designation — List
- [x] Commander row: persistent filled yellow crown before name
- [x] Other rows: outline crown on hover only, clickable to designate
- [x] Non-Commander format decks: no crown icons at all

### Commander Visual Treatment
- [x] Grid: yellow crown badge w-7 h-7 on designated commander
- [x] Grid: yellow card tint bg-yellow-300/12 on commander - same as below in list view, doesn't do much justice tinting. we can remove this tint and the badge will be enough designation.
- [x] Grid: crown + warning badges stack left-to-right when both present
- [x] List: commander row has yellow tint (rgba 250,204,21,0.08) - on teesting, yellow row is not as noticiable, can be mistaken for card color instead. lets remove this feature and keep the original color and still float it to the top. crown designation is enough.
- [x] Commander pinned to first position in grid regardless of sort
- [x] Commander pinned to first row in list regardless of sort
- [ ] Thin divider below commander in both grid and list (no text label) - divider seen in grid view, but not in list view
- [x] Removing commander card from deck clears pinning and badges

### Warning Badges
- [x] Card not legal in Standard: amber ! badge with tooltip
- [x] Card banned in Commander: amber ! badge with tooltip
- [x] Card outside commander color identity: amber ! badge with tooltip
- [x] Singleton violation (2+ copies in Commander): amber ! badge with tooltip
- [x] Multiple violations: single badge, tooltip shows all violations
- [x] Freeform deck: no warning badges at all
- note: ! badges in grid view should match warning badges in list view. in list view it is an exclaimation with a triangle, use this as the badge in grid view as well
- 
### Sidebar
- [x] Sidebar width: 256px expanded (was 240px)
- [ ] Commander deck row: layers icon grayed out, tooltip "Commander decks don't use sideboards" - no layers icon present for commander decks.
- [x] Standard deck row: layers icon normal
- [x] All rows align correctly (icons don't shift between formats)

### Toolbar
- [x] Commander: no Main/Side toggle, no sideboard count
- [x] Standard: card count green at 60, red above 60. Side: X/15 red above 15
- [x] Commander: card count green at 100, red above 100
- [ ] Freeform: card count green at 60, red above 60 (unchanged) - card count nmbers all stay gray which is desirable.

### List View Column Order
- [x] Headers: Qty, Owned, Name, Type, Mana, Price, ×
- [x] Qty column: −/+ buttons visible on hover, inline-editable number
- [x] Owned column: X/Y text only, no checkbox, no stepper, no progress bar
- [x] Owned inline edit: click to type, Enter/blur commits, Escape reverts
- [x] Owned color: green when fully owned, neutral when not

### Simulator
- [x] Standard/Freeform deck: probability thresholds at 8%/4% (unchanged)
- [x] Commander deck: probability thresholds at 5%/2%
- [x] Commander card excluded from library when commanderId is set
- [x] Library count in header reflects minus 1 for commander
- [x] Commander card never drawn into opening hand
- [x] Commander card not in Draw Odds list

### Import/Export
- [x] Export Standard deck: `// Format: Standard` header line
- [x] Export Commander deck: `// Format: Commander` and `// Commander: [Name]` header lines
- [x] Export Freeform: no format headers
- [x] Import with format headers: deck gets correct format and commander
- [x] Import without headers: deck is Freeform (backward compatible)

### Migration
- [x] Existing decks load as Freeform with no commander — no visual changes
- [x] App works normally for users who never use format features

---

## Session Summary — v1.4.0

**Shipped.** Full Standard & Commander format support plus carry-forward fixes from QA. Four prompts total.

### What Was Built

**Prompt 1 — Data model, format rules, migration, FormatPicker**
- `formatRules.ts` (new): `DeckFormat` type, `getFormatRules`, `getCardWarnings`, `isEligibleCommander`
- `useDeckManager`: migration for `format`/`commanderId`; `setDeckFormat`, `setCommanderId`, `mergeSideboardIntoDeck`, `deleteSideboardForFormat`; `createNewDeck(format?)`
- `useDeckStats`: format param, `targetDeckSize`, `isAtTarget`, `isOverTarget`
- `useDeckImportExport`: `// Format:` / `// Commander:` headers on export; parsed on import
- `scryfall.ts`: `color_identity` mapped in `searchCards`; `backfillColorIdentity` export
- `FormatPicker.tsx` (new): shared popover body with three format rows

**Prompt 2 — Sidebar, toolbar, grid view, list view UI**
- Sidebar: width 240px → 256px; format badge (STD/CMD/FF) per deck row, clickable to open format picker; layers icon grayed/disabled for Commander; "+ New Deck" opens FormatPicker; sideboard-to-Commander confirmation dialog with Escape key support
- WorkspaceToolbar: format badge pill (Standard / Commander / Freeform, all clickable); format-aware card count colors; Standard sideboard max indicator; Main/Side toggle hidden for Commander
- VisualCard: crown badge on commander; warning badge (filled amber circle with white `!`); crown button in hover overlay for commander format
- ListCardTable: column reorder to [−qty+][Owned][Name][Type][Mana][Price][×]; hover-only qty buttons; owned simplified to X/Y inline-edit; crown/warning icons in Name cell; commander row pinned with spacer divider; format-aware copy limit
- Workspace: commander pinning in sortedCards memo; grid spacer after pinned commander; lazy backfill useEffect for color identity

**Prompt 3 — Simulator, version bump, housekeeping**
- SampleHandModal: format-aware probability thresholds (8%/4% Freeform/Standard, 5%/2% Commander); commander excluded from library pool and Draw Odds list
- `version.ts`: updated `CURRENT_CHANGELOG["1.4.0"]`

**Carry-forward fixes (QA → ship)**
- Warning badge: reverted to filled amber circle with white `!` in both grid and list (triangle didn't render well in grid)
- Warning badge consistency: both views now use identical filled amber circle
- Sidebar format picker popover: fixed clipping — repositioned to open relative to full row width using `left-2 right-2` on the row's `relative` ancestor
- Commander divider in list view: replaced invisible hairline (`h-px bg-neutral-700/40`) with `h-3` spacer row matching sort group separator pattern — now visible
- Freeform badge pill added to WorkspaceToolbar: neutral-500 "Freeform" pill with same click-to-open-format-picker behavior as Standard/Commander pills
- Earlier carry-forwards (prior WIP commit): badge labels changed from 60/100/nothing → STD/CMD/FF; yellow commander tints removed from grid and list (crown designation is sufficient); format picker moved from × dropdown to badge click

### Files Modified
`src/lib/formatRules.ts` (new) · `src/lib/scryfall.ts` · `src/hooks/useDeckManager.tsx` · `src/hooks/useDeckStats.ts` · `src/hooks/useDeckImportExport.tsx` · `src/components/layout/FormatPicker.tsx` (new) · `src/components/layout/SidebarDecksTab.tsx` · `src/components/workspace/WorkspaceToolbar.tsx` · `src/components/workspace/VisualCard.tsx` · `src/components/workspace/ListCardTable.tsx` · `src/components/workspace/Workspace.tsx` · `src/components/layout/SampleHandModal.tsx` · `src/config/version.ts`

---

## How This File Works
This file is the live session journal shared between Phi, Claude Chat, and Claude Code.
- **Claude Code writes:** Plan review table, testing checklist, session summary — committed only at session end
- **Phi writes:** Test results (checking boxes), inline comments on failures, emerging issues during QA
- **Claude Chat reads:** Verifies plan review, triages failures, incorporates findings into next Claude Code prompt
- Never committed to git mid-session — only in the final commit alongside CLAUDE.md and CHANGELOG.md
