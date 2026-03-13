---
description: Release workflow steps — loaded when working on releases, commits, or version bumps
globs:
  - "CHANGELOG.md"
  - "src/config/version.ts"
  - "REVIEW.md"
---

# Release Workflow

1. **Design with Claude Chat** — for each feature:
   - Ask all requirements questions
   - Walk through the design checklist (see `.claude/rules/design-checklist.md`)
   - Present full spec for review
   - Get explicit sign-off before moving to the next feature
   - Only generate the Claude Code prompt after ALL features are signed off
   - Present the Claude Code prompt as a downloadable `.md` file (never `.docx`)

2. Claude Chat generates the Claude Code prompt as a downloadable markdown file — must include:
   - A CHANGELOG outline based on the design spec (Claude Code fills in accurately based on what was actually built)
   - What to update in CLAUDE.md (version bump, milestone changes)
   - What to update in BACKLOG.md (status changes, new items)

3. `git checkout -b vX.X.X`
   > WIP commits stay on the branch — never merge to main until APPROVED.

4. **Plan Review** — Claude Code outputs every file it plans to touch and a one-line summary of changes per file, writes this to REVIEW.md, and waits for PROCEED before executing.

   **Complexity check:** If the plan review table lists more than 5 files or introduces a new component, sync REVIEW.md to Claude Chat for a cross-check before typing PROCEED. For standard releases (≤5 files, no new components), Phi reviews the plan directly and types PROCEED without the Claude Chat round-trip.

5. Claude Code executes:
   - **Small releases (quick wins)** — build everything in one pass, then pause
   - **Large releases** — pause and output testing checklist after each feature before proceeding

6. Claude Code writes testing checklist to REVIEW.md and pauses. Phi tests, checks off items, adds emerging issues.

7. Phi types APPROVED in Claude Code.

8. Claude Code writes session summary to REVIEW.md, then commits:
   - `vX.X.X - description - Closes #N, Closes #N`
   - `git add CLAUDE.md CHANGELOG.md REVIEW.md BACKLOG.md && git commit -m "update CLAUDE.md, CHANGELOG.md, REVIEW.md, and BACKLOG.md post vX.X.X"`

9. `git checkout main && git merge vX.X.X && git push` — Claude Code handles this after APPROVED.

10. Vercel auto-deploys.

11. **Sync project files** — Phi hits sync so the next planning session starts with current context.

## Carry-Forward vs Hot-Fix Rule
- Carry-forwards are fine for one-liners or direct fixes to what was just built.
- If a carry-forward requires new design decisions mid-QA, flag as a separate hot-fix version.
- Mid-QA scope additions (pulling in a backlog item while testing) should always be a separate version.
- Claude Chat should surface this rule at the start of QA any time a mid-session scope addition is being considered.
