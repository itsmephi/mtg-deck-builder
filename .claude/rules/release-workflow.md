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
   - Get explicit sign-off before moving to implementation

2. **Phi downloads the spec and saves to `docs/`.** Claude Code commits the spec, then reads it and implements:
   ```bash
   git add docs/vX.X.X-*-spec.md
   git commit -m "docs: add vX.X.X spec"
   ```

3. `git checkout -b vX.X.X`
   > WIP commits stay on the branch — never merge to main until APPROVED.

### WIP Commit Policy

WIP commits are manual and on-demand. Use one when pausing mid-release: switching machines, stopping before QA, or hitting context limits. Just say "WIP commit and push" to pause. If completing the release in a single session, go straight to QA — no WIP commit needed between prompts.

- Every prompt must leave the app in a stable state: all existing features work, no known regressions
- If QA surfaces 2+ bugs after a prompt, the next prompt is a dedicated fix prompt (not bundled with feature work)
- If QA surfaces exactly 1 minor bug, it may be carried forward at the top of the next feature prompt

4. **Plan Review** — Before writing the new plan review table, clear all content from REVIEW.md except the "How This File Works" section at the bottom. Each release starts with a fresh REVIEW.md — previous session history should already be archived in CHANGELOG.md. Then Claude Code outputs every file it plans to touch and a one-line summary of changes per file, writes this to REVIEW.md, and waits for PROCEED before executing.

   **Complexity tiers:**

   | Files touched | New component? | Action |
   |---|---|---|
   | ≤3 | No | Auto-proceed — output plan summary to terminal only, no PROCEED gate, no REVIEW.md write |
   | 4–7 | No | Phi skims the plan in REVIEW.md and types PROCEED |
   | 8+ | — | Sync REVIEW.md to Claude Chat for cross-check before PROCEED |
   | Any | Yes | Sync REVIEW.md to Claude Chat for cross-check before PROCEED |

   **Exception — Claude Chat spec provided:** If a spec file from Claude Chat exists in `docs/` for this feature, the design review is already complete. The PROCEED gate is waived regardless of complexity tier — do not ask for a second Claude Chat sync. Phi typing PROCEED (or saying "implement") is sufficient.

5. **GitHub issues** — before building, confirm every Active Milestone item has a GitHub issue number. If any are missing, create the issue(s) and update BACKLOG.md with the number(s) first.

6. **File read efficiency (all phases):** Grep before reading. Never read a file in full when only a section is needed.
   - Source files: Grep for the function/component name, then `Read` with `offset`/`limit` (±20 lines). Full read only when genuinely needed (first-time orientation, file-wide refactor).
   - `BACKLOG.md`: Active Milestone is always at the top — `limit: 30` from line 1 covers it; never read the full file during plan or build.
   - `CHANGELOG.md`: `limit: 10` to confirm format/current version — never read full history.
   - `CLAUDE.md` / `REVIEW.md`: Grep for the target heading, then `Read` with `offset`/`limit` (±10 lines).

7. Claude Code executes prompts in order. After completing ALL prompts (or after each major feature for large releases), proceed to the QA checkpoint.

7. **QA Checkpoint** — Claude Code MUST write the QA checklist to REVIEW.md before pausing for testing. This is not optional.

   **REVIEW.md format after prompts complete:**
   ```markdown
   # REVIEW.md — MTG Deck Builder Session Journal

   ---

   ## vX.X.X — [Short Description]
   Status: IN PROGRESS

   ### Plan Review
   | File | Changes |
   |------|---------|
   | `src/path/file.tsx` | One-line summary |
   | ... | ... |

   ### QA Checklist
   - [ ] Test case 1 — expected behavior
   - [ ] Test case 2 — expected behavior
   - [ ] ...

   ### QA Notes
   _(Phi adds inline comments here during testing)_

   ---

   ## How This File Works
   ...
   ```

   After writing the QA checklist to REVIEW.md, Claude Code says: "QA checklist written to REVIEW.md. Ready for testing."

   **Do NOT** output the checklist only to terminal. REVIEW.md is the source of truth for QA.

8. Phi tests, checks off items in REVIEW.md, adds notes for any issues found. When complete, Phi types APPROVED in Claude Code.

9. Before writing the session summary, update the REVIEW.md status header from IN PROGRESS to APPROVED ✅. Then Claude Code writes session summary to REVIEW.md and commits in this order:

   **Step A — commit source files first** (if not already committed via WIP commits):
   - Run `git status --short` to identify any uncommitted `src/` or `docs/` changes
   - If any exist: `git add src/ docs/vX.X.X-*-spec.md && git commit -m "feat: vX.X.X description - Closes #N"`
   - Source must be committed before session files. Never batch source + session files in one commit.

   **Step B — update and commit session files:**
   - `vX.X.X - description - Closes #N, Closes #N`
   - Review `docs/ARCHITECTURE.md` — update the component tree, state ownership, localStorage keys, or pattern notes if anything changed this release. Update the `<!-- Last updated: vX.X.X -->` header at the top.
   - `git add CLAUDE.md CHANGELOG.md REVIEW.md BACKLOG.md docs/ARCHITECTURE.md && git commit -m "update CLAUDE.md, CHANGELOG.md, REVIEW.md, and BACKLOG.md post vX.X.X"`

   **File read efficiency (post-APPROVE):** Use Grep to find version strings and section headings before reading. Never read full files when only a section is needed:
   - `CHANGELOG.md` — read only the top 10 lines to confirm format; never the full history
   - `CLAUDE.md` / `REVIEW.md` / `BACKLOG.md` — Grep for the target line first, then `Read` with `offset`/`limit` (±10 lines)

10. `git checkout main && git merge vX.X.X && git push` — Claude Code handles this after APPROVED.

11. Vercel auto-deploys.

12. **Sync project files** — Phi hits sync so the next planning session starts with current context.

---

## Spec File Workflow

Claude Chat produces a design spec for implementation. Here's how it flows:

### File locations
- **Spec files** → `docs/vX.X.X-description-spec.md` (committed, permanent reference)

### Workflow steps

1. **Claude Chat** generates the design spec
2. **Phi** downloads and saves to `docs/`
3. **Claude Code** commits spec:
   ```bash
   git add docs/vX.X.X-*-spec.md
   git commit -m "docs: add vX.X.X spec"
   ```
4. **Claude Code** reads spec and implements directly

### Naming convention
- Spec: `vX.X.X-short-description-spec.md`

---

## Carry-Forward vs Hot-Fix Rule
- Carry-forwards are fine for one-liners or direct fixes to what was just built.
- If a carry-forward requires new design decisions mid-QA, flag as a separate hot-fix version.
- Mid-QA scope additions (pulling in a backlog item while testing) should always be a separate version.
- Claude Chat should surface this rule at the start of QA any time a mid-session scope addition is being considered.
