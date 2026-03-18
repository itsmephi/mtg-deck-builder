# REVIEW.md — MTG Deck Builder Session Journal

---

## Current Release: v1.4.0
Status: IN PROGRESS

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
- [ ] "+ New Deck" opens format picker popover
- [ ] Clicking a format creates deck with that format and closes picker
- [ ] Clicking outside picker closes without creating deck
- [ ] Freeform deck: no format badge in sidebar or toolbar
- [ ] Standard deck: "60" badge in sidebar, "Standard" pill in toolbar
- [ ] Commander deck: "100" badge in sidebar, "Commander" pill in toolbar

### Format Switching
- [ ] Toolbar badge click opens format picker
- [ ] Deck row × dropdown shows "Change Format" option
- [ ] Switching Standard ↔ Freeform: no data changes, just validation toggle
- [ ] Switching TO Commander with empty sideboard: silent, no dialog
- [ ] Switching TO Commander with sideboard cards: confirmation dialog appears
- [ ] "Merge into Main Deck" merges cards correctly (qty aggregation for duplicates)
- [ ] "Delete Sideboard" removes all sideboard cards
- [ ] Cancel (click outside / Escape) leaves format unchanged
- [ ] Switching FROM Commander: clears commanderId

### Commander Designation — Grid
- [ ] Hover overlay shows crown button only in Commander format decks
- [ ] Clicking crown designates card as commander (yellow tint + crown badge appears)
- [ ] Only one commander at a time — designating a new one clears the old
- [ ] Clicking filled crown on commander removes designation
- [ ] Non-legendary card: still designable, tooltip warns "not typically eligible"

### Commander Designation — List
- [ ] Commander row: persistent filled yellow crown before name
- [ ] Other rows: outline crown on hover only, clickable to designate
- [ ] Non-Commander format decks: no crown icons at all

### Commander Visual Treatment
- [ ] Grid: yellow crown badge w-7 h-7 on designated commander
- [ ] Grid: yellow card tint bg-yellow-300/12 on commander
- [ ] Grid: crown + warning badges stack left-to-right when both present
- [ ] List: commander row has yellow tint (rgba 250,204,21,0.08)
- [ ] Commander pinned to first position in grid regardless of sort
- [ ] Commander pinned to first row in list regardless of sort
- [ ] Thin divider below commander in both grid and list (no text label)
- [ ] Removing commander card from deck clears pinning and badges

### Warning Badges
- [ ] Card not legal in Standard: amber ! badge with tooltip
- [ ] Card banned in Commander: amber ! badge with tooltip
- [ ] Card outside commander color identity: amber ! badge with tooltip
- [ ] Singleton violation (2+ copies in Commander): amber ! badge with tooltip
- [ ] Multiple violations: single badge, tooltip shows all violations
- [ ] Freeform deck: no warning badges at all

### Sidebar
- [ ] Sidebar width: 256px expanded (was 240px)
- [ ] Commander deck row: layers icon grayed out, tooltip "Commander decks don't use sideboards"
- [ ] Standard deck row: layers icon normal
- [ ] All rows align correctly (icons don't shift between formats)

### Toolbar
- [ ] Commander: no Main/Side toggle, no sideboard count
- [ ] Standard: card count green at 60, red above 60. Side: X/15 red above 15
- [ ] Commander: card count green at 100, red above 100
- [ ] Freeform: card count green at 60, red above 60 (unchanged)

### List View Column Order
- [ ] Headers: Qty, Owned, Name, Type, Mana, Price, ×
- [ ] Qty column: −/+ buttons visible on hover, inline-editable number
- [ ] Owned column: X/Y text only, no checkbox, no stepper, no progress bar
- [ ] Owned inline edit: click to type, Enter/blur commits, Escape reverts
- [ ] Owned color: green when fully owned, neutral when not

### Simulator
- [ ] Standard/Freeform deck: probability thresholds at 8%/4% (unchanged)
- [ ] Commander deck: probability thresholds at 5%/2%
- [ ] Commander card excluded from library when commanderId is set
- [ ] Library count in header reflects minus 1 for commander
- [ ] Commander card never drawn into opening hand
- [ ] Commander card not in Draw Odds list

### Import/Export
- [ ] Export Standard deck: `// Format: Standard` header line
- [ ] Export Commander deck: `// Format: Commander` and `// Commander: [Name]` header lines
- [ ] Export Freeform: no format headers
- [ ] Import with format headers: deck gets correct format and commander
- [ ] Import without headers: deck is Freeform (backward compatible)

### Migration
- [ ] Existing decks load as Freeform with no commander — no visual changes
- [ ] App works normally for users who never use format features

---

## How This File Works
This file is the live session journal shared between Phi, Claude Chat, and Claude Code.
- **Claude Code writes:** Plan review table, testing checklist, session summary — committed only at session end
- **Phi writes:** Test results (checking boxes), inline comments on failures, emerging issues during QA
- **Claude Chat reads:** Verifies plan review, triages failures, incorporates findings into next Claude Code prompt
- Never committed to git mid-session — only in the final commit alongside CLAUDE.md and CHANGELOG.md
