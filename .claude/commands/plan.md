---
description: Plan an implementation for a backlog item or feature — list files to touch, changes per file, and open design questions
allowed-tools: Read, Glob, Grep
---

Plan an implementation for: $ARGUMENTS

Steps:
1. Read CLAUDE.md for project context and technical notes
2. Read BACKLOG.md to find the relevant item(s) if referenced by issue number or description
3. Read `.claude/rules/design-checklist.md` for the design and UI behavior checklist
4. Scan the relevant source files to understand current implementation
5. Output a plan with:
   - **Summary**: One sentence describing what this change does
   - **Files to touch**: Table with file path and one-line change description per file
   - **Design questions**: Any decisions that need answering before building (if none, say "None — ready to build")
   - **Checklist flags**: Call out any design checklist items that apply to this change
   - **Backlog items addressed**: List any BACKLOG.md items and/or GitHub issues (#N) this would close

If the plan touches more than 5 files or introduces a new component, flag it:
> ⚠️ This change is complex enough to warrant a Claude Chat design review before building. Sync REVIEW.md and get a cross-check before PROCEED.

Do NOT execute any changes. This is plan-only mode.
