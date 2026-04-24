# CLAUDE.md — Project Brew

Personal MTG deck builder and simulator. App name: **Project Brew** (outward-facing) · internal code name: thebrewlab. Private tool, accessible via Vercel link.
Authors: Phi & Thurgood Nguyen.

**Current Version: v1.19.3**

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, Vercel. No backend yet — Supabase planned (see docs/BACKLOG.md).

IDE: Zed (Windows primary, Steam Deck/Linux secondary).

## Hard Rules

- Private tool, single-user mental model for now. No auth flows.
- Never prepend `cd` to git or npm commands — already in project root.
- One active machine per Claude Code session — git commit is the handoff. Always `git pull` before starting, `git push` after.
- Safe handoff: every Claude Code prompt must leave the app in a stable, testable state.
- Root cause before fix. Diagnose intended behavior before writing any fix spec.

## Development Rules

- **Alignment before generation.** Confirm plan before writing code, files, or changes. `/plan` output is the review gate — wait for explicit PROCEED.
- **Token optimization.** Targeted reads only. No full-file cats when a grep will do.
- **Proactive suggestions.** Flag gaps, new docs, or tooling improvements before creating them.
- **Design gut-check.** For ad-hoc requests: if something feels off (removing a pattern that's working, reversing a recent decision, a change worth sitting with first) — raise it in one sentence before planning. Don't ask when the request feels right; only speak up when there's a genuine concern.
- **Version sync.** `Current Version` above must match `APP_VERSION` in `src/config/version.ts`. Also update `CHANGELOG.md` — three files change together on every version bump.
- **Commits.** Conventional format: `feat:` `fix:` `docs:` `chore:` — one-liner unless the why isn't obvious from the diff. GitHub issue syntax: `Closes #27, Closes #28` (each separately).
- **Spec conventions.** Specs are concise handoff contracts — not feature documentation. Cover only what Claude Code can't infer from `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN-CONTEXT.md`, or existing code: interaction design decisions, data model changes, non-obvious edge cases, deviations from established patterns. Claude Code runs on Sonnet — if a decision is genuinely complex, include it; if it's derivable from the repo, omit it. Resolve open design questions before generating the spec. Never edit a spec in place — create a new versioned file (`v1.20.1-drag-drop-polish-spec.md`).
- **Specs live in `docs/specs/`.** One spec per feature/patch. Prototypes and mockups co-located with their spec.
- **Emergent tasks/bugs.** Add to `docs/BACKLOG.md` inbox section during sessions. Triage when inbox has new items — not forced every session. Specs may include a "Backlog additions" section — add those items to BACKLOG.md during implementation.
- **Design vs. build.** Use Claude.ai (Opus) for features with significant UX tradeoffs, data model changes, or multi-screen flows. Use Claude Code (Sonnet) directly for polish batches, hotfixes, and features with an obvious design. When designing in Claude Code: `/plan` output is the review gate. When a Claude.ai spec is used: it's the implementation contract, committed as a file before building.

## Versioning & Docs

- **Semver**: major.minor.patch. Currently v1.x.x (shipped, private-beta phase).
- **On version bump**: update `Current Version` here + `APP_VERSION` in `src/config/version.ts` + `CHANGELOG.md`.

### File Map

| File | Owner | Purpose |
|------|-------|---------|
| `CLAUDE.md` | Claude Code | Agent briefing — stack, rules, version |
| `docs/PRODUCT.md` | Claude.ai / Phi | Current product state — features, phasing, design principles |
| `docs/ARCHITECTURE.md` | Claude Code | Technical patterns, gotchas, implementation conventions |
| `docs/DESIGN-CONTEXT.md` | Claude Code | Design constraints for Claude.ai sessions — attach to Claude.ai project |
| `docs/SCHEMA.md` | Claude Code | Data shapes (localStorage, future Supabase) |
| `docs/DECISIONS.md` | Claude.ai / Phi | Product decision log with rationale |
| `docs/specs/*.md` | Claude.ai | Handoff contracts — immutable after implementation |
| `docs/BACKLOG.md` | Shared | Inbox → triaged → parked items |
| `docs/WORKFLOW.md` | Claude Code | Human-readable workflow reference |
| `CHANGELOG.md` | Claude Code | Version history |

Claude Code does not edit PRODUCT.md, DECISIONS.md, or specs. If any of these need updates after implementation, flag it to Phi.

## Workflow Shortcuts

- `/plan` — plan an implementation before building. Output is the review gate — wait for PROCEED.
- `/commit-release vX.X.X` — post-QA commit, merge, and push.

## Post-Version Checklist

After each version ships:

<<<<<<< HEAD
Triage and milestone planning now run in Claude Code via `/triage`. After triage, take promoted items to Claude Chat for design if they need it.

For straightforward bug fixes and small enhancements, `/plan` → PROCEED → build → QA → APPROVED → `/commit-release` can run entirely in Claude Code.

---

## Active Milestone
→ v1.19.2 — Tab Drop

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
=======
1. Update `Current Version` in CLAUDE.md to match `src/config/version.ts`.
2. Update `CHANGELOG.md` with version entry.
3. Update `docs/ARCHITECTURE.md` with new technical patterns (only non-obvious ones).
4. Update `docs/DESIGN-CONTEXT.md` if any design constraints changed.
5. Update `docs/SCHEMA.md` if data shapes changed.
6. Update `docs/BACKLOG.md`: remove the shipped version's triaged section, then triage inbox if it has new items.
7. Flag to Phi if `docs/PRODUCT.md` or `docs/DECISIONS.md` need updates.
8. **Staleness check:** scan all doc `<!-- Last updated: vX.X.X -->` headers — flag any two or more versions behind.
>>>>>>> 20b62a2 (chore: migrate to streamlined workflow (docs refactor))
