# REVIEW.md — MTG Deck Builder Session Journal

---

## Current Task: v1.5.1 — Grid Warning Redesign
Status: APPROVED ✅

---

## Session Summary

Hotfix committed directly to main. Two files changed.

Removed the corner triangle warning badge in grid view (was positioned at `-top-3.5 -right-3.5`, straddling the card edge and overlapping adjacent cards). Replaced with an amber warning bar that renders inside the slide-up hover overlay, above the qty controls — clearly scoped to the card. The qty pill's amber color state already serves as the at-rest warning signal.

Also simplified the color identity warning text in `formatRules.ts` — removed the `(has {G})` suffix that exposed raw mana symbol notation to the user.

**Files changed:** `VisualCard.tsx`, `src/lib/formatRules.ts`

---

## How This File Works
This file is the live session journal shared between Phi, Claude Chat, and Claude Code.
- **Claude Code writes:** Plan review table, testing checklist, session summary — committed only at session end
- **Phi writes:** Test results (checking boxes), inline comments on failures, emerging issues during QA
- **Claude Chat reads:** Verifies plan review, triages failures, incorporates findings into next Claude Code prompt
- Never committed to git mid-session — only in the final commit alongside CLAUDE.md and CHANGELOG.md
