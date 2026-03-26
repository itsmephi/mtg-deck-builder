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

### Prompt Handoff Protocol

- After each Claude Code prompt is complete and QA-tested, run: `git add -A && git commit -m "WIP: vX.X.X — [last completed prompt summary]"` then `git push`
- This WIP commit is a safe handoff point — development can continue on a different machine after `git pull`
- Every prompt must leave the app in a stable state: all existing features work, no known regressions
- If QA surfaces 2+ bugs after a prompt, the next prompt is a dedicated fix prompt (not bundled with feature work)
- If QA surfaces exactly 1 minor bug, it may be carried forward at the top of the next feature prompt
- The branch accumulates WIP commits throughout the milestone; only `/commit-release` squashes/merges to main

4. **Plan Review** — Before writing the new plan review table, clear all content from REVIEW.md except the "How This File Works" section at the bottom. Each release starts with a fresh REVIEW.md — previous session history should already be archived in CHANGELOG.md. Then Claude Code outputs every file it plans to touch and a one-line summary of changes per file, writes this to REVIEW.md, and waits for PROCEED before executing.

   **Complexity check:** If the plan review table lists more than 5 files or introduces a new component, sync REVIEW.md to Claude Chat for a cross-check before typing PROCEED. For standard releases (≤5 files, no new components), Phi reviews the plan directly and types PROCEED without the Claude Chat round-trip.

5. **GitHub issues** — before building, confirm every Active Milestone item has a GitHub issue number. If any are missing, create the issue(s) and update BACKLOG.md with the number(s) first.

6. Claude Code executes:
   - **Small releases (quick wins)** — build everything in one pass, then pause
   - **Large releases** — pause and output testing checklist after each feature before proceeding

7. Claude Code writes testing checklist to REVIEW.md and pauses. Phi tests, checks off items, adds emerging issues.

8. Phi types APPROVED in Claude Code.

9. Before writing the session summary, update the REVIEW.md status header from IN PROGRESS to APPROVED ✅. Then Claude Code writes session summary to REVIEW.md and commits:
   - `vX.X.X - description - Closes #N, Closes #N`
   - `git add CLAUDE.md CHANGELOG.md REVIEW.md BACKLOG.md && git commit -m "update CLAUDE.md, CHANGELOG.md, REVIEW.md, and BACKLOG.md post vX.X.X"`

10. `git checkout main && git merge vX.X.X && git push` — Claude Code handles this after APPROVED.

11. Vercel auto-deploys.

12. **Sync project files** — Phi hits sync so the next planning session starts with current context.

---

## Prompt File Workflow

Claude Chat produces spec and prompt files for implementation. Here's how they flow:

### File locations
- **Spec files** → `docs/vX.X.X-description-spec.md` (committed, permanent reference)
- **Prompt files** → `docs/prompts/vX.X.X-prompt-N-description.md` (uncommitted, deleted after release)

### Workflow steps

1. **Claude Chat** generates spec + prompt files
2. **Phi** downloads and saves to repo:
   - Spec → `docs/`
   - Prompts → `docs/prompts/`
3. **Claude Code** commits spec only:
   ```bash
   git add docs/vX.X.X-*-spec.md
   git commit -m "docs: add vX.X.X spec"
   ```
4. **Claude Code** reads and executes prompts in order (prompts stay uncommitted)
5. **After `/commit-release vX.X.X`**, Claude Code deletes prompt files:
   ```bash
   rm docs/prompts/vX.X.X-*.md
   ```
   (No commit needed — they were never committed)

### Naming conventions
- Spec: `vX.X.X-short-description-spec.md`
- Prompts: `vX.X.X-prompt-1-short-description.md`, `vX.X.X-prompt-2-...`, etc.
- Prompt numbers indicate execution order

---

## Carry-Forward vs Hot-Fix Rule
- Carry-forwards are fine for one-liners or direct fixes to what was just built.
- If a carry-forward requires new design decisions mid-QA, flag as a separate hot-fix version.
- Mid-QA scope additions (pulling in a backlog item while testing) should always be a separate version.
- Claude Chat should surface this rule at the start of QA any time a mid-session scope addition is being considered.
