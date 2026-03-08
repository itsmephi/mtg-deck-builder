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

## Current Release: v1.1.4
Status: APPROVED ✅

---

## Workflow & Docs Update — 2026-03-08

### Plan Review

| File | Change |
|---|---|
| `CLAUDE.md` | Edit 1: Add ownership table + ownership rule to "How This File Works" section |
| `CLAUDE.md` | Edit 2: Replace single Capture Log step in Session Start checklist with three-step timestamp-check flow |
| `CLAUDE.md` | Edit 3: Replace last paragraph of Capture Log section with new consolidation-as-standalone-action text + session start check rule |
| `CLAUDE.md` | Edit 4: Replace BACKLOG.md section bullet list with expanded rules including new labels, consolidation timestamps, and triage convention |
| `CLAUDE.md` | Edit 5: Replace Capture Log + BACKLOG.md bullets in Key Technical Notes; add new Claude Chat ownership bullet; add 4 new workflow bullets (cross-platform, Steam Deck, allowed tools, Claude Chat file ownership) |
| `CLAUDE.md` | Edit 5 (Release Workflow): Add WIP commit note under step 3; update step 8 to note Claude Code handles merge+push after APPROVED |
| `CLAUDE.md` | Edit 5 (Capture Log section): Add out-of-session signal + multi-chat context bullets |
| `CLAUDE.md` | Edit 5 (Session Start checklist): Add session detection note |
| `BACKLOG.md` | Edit 1: Replace top comment block with new header block including standard consolidation prompt |
| `BACKLOG.md` | Edit 2: Replace unpromoted raw items with promoted items #61–#75; remove items already in CLAUDE.md backlog (#47–#60) |
| `BACKLOG.md` | Edit 3: Append consolidation timestamp at bottom |

**Awaiting PROCEED**

---

## Plan Review

| File | Change |
|---|---|
| `src/components/workspace/VisualCard.tsx` | Fix 1: Update 4-copy tooltip text to "Exceeds 4-copy limit"; Fix 2: Add `max-w-xs` to all tooltip spans |
| `src/components/workspace/ListCardTable.tsx` | Fix 2: Add `max-w-xs` to the 4-copy tooltip span |
| `src/components/workspace/WorkspaceToolbar.tsx` | Fix 2: Add `max-w-xs` to all tooltip spans (Export, Import, TCGPlayer, Card Kingdom, Test Deck, sort ↑/↓, Group, Grid, List, Main, Side) |
| `src/components/workspace/DeckDropdown.tsx` | Fix 2: Add `max-w-xs` to the sideboard icon tooltip span |

**Plan Review:** PROCEED ✅

---

## Testing Checklist — v1.1.4

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
- [x] Sideboard icon tooltip in deck dropdown — max-width cap present
- [x] No horizontal scroll reintroduced

### REVIEW.md Workflow
- [x] REVIEW.md written with plan review table before execution
- [x] REVIEW.md updated with testing checklist after build
- [x] Emerging Issues section present and ready for Phi to fill in
- [ ] REVIEW.md committed to git only in the final post-release commit --- no way to verify and test this until the end when we give the APPROVED

---

## Emerging Issues
<!-- Phi fills this in during QA -->
- make a note that once Claude Code goes through a few sessions where the Plan Review table aligns with the prompt from Claud Chat, then we can probably trust it more and remove this review process? speeds things up. but we still want to keep the testing Checklist hold for QA
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
