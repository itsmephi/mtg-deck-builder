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

## How This File Works
This file is the live session journal shared between Phi, Claude Chat, and Claude Code.
- **Claude Code writes:** Plan review table, testing checklist, session summary — committed only at session end
- **Phi writes:** Test results (checking boxes), inline comments on failures, emerging issues during QA
- **Claude Chat reads:** Verifies plan review, triages failures, incorporates findings into next Claude Code prompt
- Never committed to git mid-session — only in the final commit alongside CLAUDE.md and CHANGELOG.md
