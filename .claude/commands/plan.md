---
description: Plan an implementation for a backlog item or feature — list files to touch, changes per file, and open design questions
allowed-tools: Read, Glob, Grep
---

Plan an implementation for: $ARGUMENTS

Steps:
1. Grep CLAUDE.md for `Active Milestone` and `Current Version`, read ±5 lines around each match.
2. Grep BACKLOG.md for the relevant item description or issue number. If not found, read `limit: 30` from line 1 to check the Active Milestone section only.
3. Grep `.claude/rules/design-checklist.md` for section headings to orient, then read the full file (it is short).
4. Grep source files for the relevant component or function name, then read ±30 lines around each match. Full file reads only when the entire file is being changed.
5. Output a plan with:
   - **Summary**: One sentence describing what this change does
   - **Files to touch**: Table with file path and one-line change description per file
   - **Design questions**: Any decisions that need answering before building (if none, say "None — ready to build")
   - **Checklist flags**: Call out any design checklist items that apply to this change
   - **Backlog items addressed**: List any BACKLOG.md items and/or GitHub issues (#N) this would close

If the plan touches more than 5 files or introduces a new component, flag it:
> ⚠️ This change is complex enough to warrant a Claude Chat design review before building. Sync REVIEW.md and get a cross-check before PROCEED.

Do NOT execute any changes. This is plan-only mode.
