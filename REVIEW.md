# REVIEW.md — MTG Deck Builder Session Journal

---

## Current Task: v1.5.4 — UX Polish & List Performance
Status: APPROVED ✅

---

## Session Summary

Three focused UX improvements bundled into v1.5.4: delete confirmation removal, owned −/+ increment buttons across both views, and list view hover performance fix.

**Delete confirmation removed (`SidebarDecksTab.tsx`):** "Delete Deck" and "Delete Sideboard" in the sidebar dropdown now act immediately on click — `window.confirm()` wrappers removed from both handlers. One click on the × button opens the menu; one click on the action executes it. No second confirmation needed.

**Owned −/+ buttons — list view (`ListCardTable.tsx`):** Added hover-visible −/+ buttons flanking the owned `X/Y` display, matching the existing qty button pattern. Column width bumped from `w-16` to `w-20`. Header width updated to match. Buttons call `onUpdateOwnedQty` directly: `−` floors at 0.

**Owned −/+ buttons — grid view (`VisualCard.tsx`):** Added the same −/+ buttons to the owned row in the slide-up hover overlay, matching the `− qty +` row above it. `e.stopPropagation()` applied to both. `−` floors at 0.

**List view hover performance (`Workspace.tsx`):** `mousePos` converted from `useState` to `useRef`; tooltip div given a `tooltipRef`. `handleMouseMove` now writes directly to `tooltipRef.current.style` (left/top) instead of calling `setMousePos`. Eliminates full Workspace re-renders on every pixel of mouse movement — row color tints no longer recalculate on every frame.

**Workflow rule added (`.claude/rules/`):** All promoted backlog items must have a GitHub issue before building. Rule added to both `backlog-and-capture.md` (step 6) and `release-workflow.md` (step 5). Issues #70 and #71 created for this release's promoted items.

**Files changed:** `src/components/layout/SidebarDecksTab.tsx`, `src/components/workspace/ListCardTable.tsx`, `src/components/workspace/VisualCard.tsx`, `src/components/workspace/Workspace.tsx`, `src/config/version.ts`

---

## How This File Works
This file is the live session journal shared between Phi, Claude Chat, and Claude Code.
- **Claude Code writes:** Plan review table, testing checklist, session summary — committed only at session end
- **Phi writes:** Test results (checking boxes), inline comments on failures, emerging issues during QA
- **Claude Chat reads:** Verifies plan review, triages failures, incorporates findings into next Claude Code prompt
- Never committed to git mid-session — only in the final commit alongside CLAUDE.md and CHANGELOG.md
