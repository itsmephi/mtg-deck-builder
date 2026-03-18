# REVIEW.md — MTG Deck Builder Session Journal

---

## Current Release: v1.4.1
Status: APPROVED ✅

---

## Session Summary — v1.4.1

**Shipped.** Grid and list view warning/crown badge polish patch.

### What Was Built

- Warning badge redesigned: filled amber triangle (raw SVG) replaces filled amber circle — amber body with `stroke="none"`, white `!` line and dot as separate SVG paths for full rendering control. Iterated through Lucide `TriangleAlert` approaches before landing on raw SVG.
- Warning badge repositioned to top-right corner in grid view (was top-left, stacked below crown in flex-col)
- Crown badge in grid view now renders as a standalone positioned `div` at top-left — flex-col wrapper removed
- Crown SVG inside badge bumped from 16×16 to 18×18 for better fill inside the `w-7 h-7` circle
- × remove button moved from corner-straddle (`-top-3 -right-3`, outside `overflow-hidden` wrapper) to inset inside card art (`top-1.5 right-1.5`, clipped by `rounded-xl`)
- List view warning icon updated to matching raw SVG triangle (16×16)

### Files Modified
`src/components/workspace/VisualCard.tsx` · `src/components/workspace/ListCardTable.tsx` · `src/config/version.ts` · `CHANGELOG.md` · `CLAUDE.md` · `REVIEW.md`

---

## How This File Works
This file is the live session journal shared between Phi, Claude Chat, and Claude Code.
- **Claude Code writes:** Plan review table, testing checklist, session summary — committed only at session end
- **Phi writes:** Test results (checking boxes), inline comments on failures, emerging issues during QA
- **Claude Chat reads:** Verifies plan review, triages failures, incorporates findings into next Claude Code prompt
- Never committed to git mid-session — only in the final commit alongside CLAUDE.md and CHANGELOG.md
