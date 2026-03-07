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
- [ ] Version in CLAUDE.md matches the latest entry in CHANGELOG.md
- [ ] REVIEW.md shows APPROVED ✅ with no open carry-forwards from last session
- [ ] No unclosed GitHub issues that should have been closed last session
- [ ] Capture Log triaged and items promoted or backlogged

⚠️ If any of the above fail, resolve before starting. No design or build work begins until sync is confirmed clean.

---

## Current Release: v1.1.3
Status: APPROVED ✅

---

## Plan Review

| File | Change |
|---|---|
| `src/components/workspace/ListCardTable.tsx` | Fix 1: Change tooltip text from "Exceeds the 4-copy limit for standard play" to "Exceeds 4-copy limit" |
| `src/components/workspace/VisualCard.tsx` | Fix 2: Remove the tooltip span from the X (remove) button — keep button unchanged |
| `src/components/workspace/WorkspaceToolbar.tsx` | Fix 3: Wrap Main and Side pill buttons in group relative divs and add tooltip spans ("Switch to main deck" / "Switch to sideboard") |

**Plan Review:** PROCEED ✅

---

## Testing Checklist

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

---

## Emerging Issues
Items surfaced during QA this session — to be triaged by Claude Chat and folded into next prompt or Capture Log.

- 🐛 Grid view 4-copy tooltip still shows old text "Exceeds the 4-copy limit for standard play" — needs same update as list view
- 🐛 List view 4-copy tooltip still clips slightly — needs proper root cause diagnosis before fixing. Do not hotfix again, design session required.
- 💡 Consider a global max-width cap on all tooltips to prevent long text clipping regardless of content

---

## Carry Forward to v1.1.4
- [ ] Grid view 4-copy tooltip text — text update only, one line
- [ ] List view 4-copy tooltip clip — diagnose root cause first, then fix
- [ ] REVIEW.md workflow — implement end to end in Claude Code (plan review, testing checklist, emerging issues, session summary, final git commit only at session end)

---

## Release Log This Session
| Version | Description | Status |
|---|---|---|
| v1.1.0 | Sideboard support, UI persistence, tooltip fixes | ✅ Shipped |
| v1.1.1 | Hot fix — sideboard view transition, refresh persistence, tooltip clipping | ✅ Shipped |
| v1.1.2 | Hot fix — tooltip clip, yellow highlight ring, tooltip cleanup | ✅ Shipped |
| v1.1.3 | Tooltip consistency pass | ✅ Shipped |
| v1.1.4 | Tooltip carry-forwards + REVIEW.md workflow | 🔜 Next |