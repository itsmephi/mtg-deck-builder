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

## How This File Works
This file is the live session journal shared between Phi, Claude Chat, and Claude Code.
- **Claude Code writes:** Plan review table, testing checklist, session summary — committed only at session end
- **Phi writes:** Test results (checking boxes), inline comments on failures, emerging issues during QA
- **Claude Chat reads:** Verifies plan review, triages failures, incorporates findings into next Claude Code prompt
- Never committed to git mid-session — only in the final commit alongside CLAUDE.md and CHANGELOG.md
