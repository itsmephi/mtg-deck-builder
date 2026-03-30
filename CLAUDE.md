# MTG Deck Builder & Simulator — Source of Truth
Authors: Phi & Thurgood Nguyen
Stack: Next.js + TypeScript + Tailwind CSS
Deployed: Vercel | Repo: GitHub (itsmephi/mtg-deck-builder)
IDE: VS Code (Windows, primary) · Zed on Steam Deck (Linux, secondary)
Current Version: v1.19.1 — see CHANGELOG.md for full history

---

## How This Project Works

| File | Written by | Read by |
|---|---|---|
| CLAUDE.md | Claude Code only | All three (Claude Chat, Claude Code, Phi) |
| BACKLOG.md | Claude Code only | All three |
| REVIEW.md | Claude Code only | All three |
| CHANGELOG.md | Claude Code only | All three |

Claude Chat never drafts, generates, or edits these files directly. Claude Chat designs and produces spec files. Claude Code reads specs directly and implements. Claude Code owns all file changes.

Process documentation lives in `.claude/rules/` — Claude Code loads these on demand:
- `release-workflow.md` — full release steps, carry-forward rules
- `design-checklist.md` — feature design and UI behavior checklists
- `backlog-and-capture.md` — BACKLOG.md lifecycle and triage process
- `docs/WORKFLOW.md` — human-readable workflow reference for Phi and Thurgood

---

## Workflow Shortcuts
- `/capture` — add bugs, features, and ideas directly to BACKLOG.md Pipeline
- `/triage` — review and categorize all Pipeline items (promote, keep, defer, discard)
- `/plan` — plan an implementation before building (flags complex changes for Claude Chat review)
- `/commit-release vX.X.X` — post-APPROVED commit, merge, and push

## When to Involve Claude Chat
- Feature design sessions (requirements, UX decisions, spec sign-off)
- Complex features — ask for a **prototype first**, then spec
- Any `/plan` output that flags ⚠️ (5+ files or new components)
- Workflow process changes

**Claude Chat deliverable format:** a single design spec file committed to `docs/`. Claude Code reads the spec directly and implements — no separate prompt files.

**Spec content rule:** Specs must be design-dense and pattern-reference-lean. Include: behavior (what the user sees/does), new state or types (only if introducing new data shapes), and non-obvious edge cases. Omit: existing patterns Claude Code can read from the repo, file structure descriptions, touch points (Claude Code finds these via Grep during `/plan`), and React/framework basics. A good spec describes *decisions* — not *how to code them*.

Triage and milestone planning now run in Claude Code via `/triage`. After triage, take promoted items to Claude Chat for design if they need it.

For straightforward bug fixes and small enhancements, `/plan` → PROCEED → build → QA → APPROVED → `/commit-release` can run entirely in Claude Code.

---

## Active Milestone
→ v1.19.1 — Search List View Fixes

---

## GitHub Issue Convention
Commit message syntax: `Closes #27, Closes #28` (each separately — not `Closes #27 #28`)
Labels: bug · feature · enhancement · chore · high · med · low

---

## Architecture
→ See `docs/ARCHITECTURE.md` for file structure, state ownership, key patterns, and data flow.

---

## Workflow Rules (always active)
- REVIEW.md: live session journal. Never committed mid-session. Committed at session end alongside CLAUDE.md, CHANGELOG.md, BACKLOG.md.
- Plan Review: Claude Code outputs plan table to REVIEW.md before touching files, waits for PROCEED.
- One active machine per Claude Code session — git commit is the handoff. Always git pull before starting, git push after.
- Claude Code allowedTools: Read, Edit, Write, Glob, Grep, Bash(git *), Bash(npm *) — all auto-approved, no prompt gates during implementation.
- Never prepend cd to git or npm commands — already in the project root.
- Design before build, always. No prompt generation until design is fully signed off.
- Safe handoff: every Claude Code prompt must leave the app in a stable, testable state. No prompt should introduce known regressions that require the next prompt to fix. Only `/commit-release` merges to main.
- WIP commits: manual, on-demand. Use when pausing mid-release (switching machines, stopping before QA, hitting context limits). Just say "WIP commit and push" to pause. Not required between prompts if completing the release in a single session.
- Carry-forward fixes: if QA surfaces 2+ bugs, they become their own dedicated fix prompt (not bundled into the next feature prompt). This keeps each prompt's QA surface small and ensures the app is stable before new features land. A single minor fix can still be bundled as a carry-forward at the top of the next prompt.
- Root cause before fix. Diagnose intended behavior before writing any fix spec.
