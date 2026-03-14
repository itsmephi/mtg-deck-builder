# How We Work — MTG Deck Builder

A reference for Phi and Thurgood on how we build, ship, and maintain this project using Claude Chat and Claude Code.

Last updated: v1.2.1

---

## The Tools

**Claude Code** is where building happens. It reads the codebase, edits files, runs commands, and commits to git. We use it in the terminal (VS Code on Windows, Zed on Steam Deck) and via the web app on mobile.

**Claude Chat** is where design and planning happen. It doesn't touch code or files directly — it produces design specs, prototypes, and Claude Code prompts. It also handles triage and milestone planning.

**GitHub** is the read-only dashboard. Issues and milestones are created automatically by Claude Code on commit. We don't create issues manually — everything starts in the backlog.

**Vercel** auto-deploys from main. Push to main = live.

---

## Slash Commands

Three commands handle the most common actions:

### `/capture`
Adds bugs, features, and ideas directly to BACKLOG.md.

```
/capture bug: hover tint disappears when sorting by color
/capture the sideboard total should include main deck pricing
/capture bug: hover lost; enhancement: sideboard pricing; v2.0: drag to reorder
```

- Items land in the Pipeline section of BACKLOG.md
- Recognized labels: `bug:`, `feature:`, `enhancement:`, `chore:`, `workflow:`, `v2.0:`
- If you skip the label, Claude Code infers one
- Multiple items separated by semicolons
- Automatically commits after adding

Use this whenever something comes to mind — while testing, while using the app, while reviewing. The goal is zero friction between noticing something and recording it.

### `/plan`
Plans an implementation without executing anything.

```
/plan fix #78
/plan fix the hover tint bug
/plan add keyboard shortcuts to the sample hand modal
```

- Reads CLAUDE.md, BACKLOG.md, the design checklist, and relevant source files
- Outputs: summary, files to touch, design questions, checklist flags, backlog items it would close
- **If the plan touches 5+ files or adds a new component**, it flags it with ⚠️ and recommends a Claude Chat design review before building
- Does NOT make any changes — plan only

For simple bug fixes, you can go `/plan` → review → tell Claude Code to build it → QA → APPROVED → `/commit-release` without ever opening Claude Chat.

### `/commit-release vX.X.X`
Runs the post-APPROVED commit, merge, and push sequence.

```
/commit-release v1.2.1
```

- Stages CLAUDE.md, CHANGELOG.md, REVIEW.md, BACKLOG.md
- Commits, merges to main, pushes
- Only works after APPROVED has been given

---

## Hooks (run automatically)

Two hooks run silently in the background. You don't need to think about them — they just catch problems.

**Type check after file edits:** Every time Claude Code edits or creates a file, TypeScript's type checker runs automatically. If there's a type error, Claude Code sees it immediately and fixes it before moving on. This catches issues during the build instead of during QA.

**Version consistency on stop:** Every time Claude Code finishes a response, it checks that the version in CLAUDE.md matches version.ts. If they don't match, Claude Code is told to fix it before stopping. This prevents version drift between files.

---

## The Backlog

Everything lives in `BACKLOG.md`. It's the single source of truth for planned work.

### Sections
- **Active Milestone** — what we're building right now
- **Pipeline** — triaged items waiting for a milestone
- **v1.2.0 Deferred** — original v1.2.0 features not yet started
- **v2.0 Deferred** — pushed to a future major version
- **Closed** — recently completed (last 2 releases, then archived to CHANGELOG.md)

### Item lifecycle
1. You notice something → `/capture` it
2. Next planning session → Claude Chat triages the full Pipeline
3. Items get tagged: keep, discard, defer to v2.0, or promote to active milestone
4. Active milestone items get built in a release
5. After release ships, items move to Closed

---

## When to Use What

### Go straight to Claude Code when:
- Capturing a bug or idea (`/capture`)
- Planning a simple fix (`/plan`)
- The plan touches ≤5 files and no new components
- Running a bug fix end-to-end: `/plan` → build → QA → `/commit-release`

### Open Claude Chat when:
- Designing a new feature (requirements, UX, interaction design)
- The feature is visually complex — ask for a **prototype first**, then spec
- `/plan` flagged ⚠️ (5+ files or new component)
- Triage and milestone planning
- Workflow or process changes

### Design approach by complexity:
- **Simple** (color change, text fix, single behavior): Skip prototype. `/plan` or quick spec.
- **Medium** (new behavior on existing component): Design spec in Claude Chat. Walk through checklist. Generate Claude Code prompt.
- **Complex** (new component, modal, multi-interaction feature): **Prototype first** in Claude Chat. React to it, iterate, then produce the design spec as the implementation reference. Say "prototype this first" to set the right mode.

---

## Release Flow

The full sequence for a planned release:

1. **Triage** — Open Claude Chat. Review the Pipeline. Tag items for the milestone.
2. **Design** — For each feature, walk through design in Claude Chat. For complex features, prototype first. Sign off on each before moving to the next.
3. **Prompt** — Claude Chat generates the Claude Code prompt as a `.md` file.
4. **Branch** — `git checkout -b vX.X.X`
5. **Plan Review** — Claude Code writes a plan table to REVIEW.md. Review it.
   - ≤5 files, no new components → PROCEED directly
   - 5+ files or new component → sync REVIEW.md to Claude Chat for cross-check, then PROCEED
6. **Build** — Claude Code executes. Small releases in one pass, large releases pause per feature.
7. **QA** — Claude Code writes testing checklist to REVIEW.md. Test everything, check boxes, note issues.
8. **APPROVED** — Type it in Claude Code when QA passes.
9. **Ship** — `/commit-release vX.X.X`
10. **Sync** — Hit sync in Claude project files (desktop only) so Claude Chat has current context.

### Quick fix flow (no Claude Chat needed):
1. `/capture` the issue (if not already in backlog)
2. `/plan fix #N` or `/plan description`
3. Review plan → tell Claude Code to build
4. QA → APPROVED
5. `/commit-release vX.X.X`

---

## Key Rules

- **Design before build.** No building until design is signed off.
- **Root cause before fix.** Diagnose intended behavior before writing any fix.
- **One machine at a time.** Git commit is the handoff between Windows and Steam Deck. Always pull before starting, push after finishing.
- **Claude Chat doesn't touch files.** It designs and produces prompts. Claude Code owns all file changes.
- **Carry-forwards are for one-liners only.** If a carry-forward needs new design decisions mid-QA, it becomes a separate hot-fix version. Mid-QA scope additions are always a separate version.

---

## Project Files

| File | What it is | Who writes it |
|---|---|---|
| `CLAUDE.md` | Project identity, tech notes, workflow rules | Claude Code |
| `BACKLOG.md` | Permanent backlog — all planned work | Claude Code |
| `REVIEW.md` | Live session journal — plan reviews, test checklists, session summaries | Claude Code |
| `CHANGELOG.md` | Release history | Claude Code |
| `.claude/rules/` | Process docs loaded on demand (release workflow, design checklist, backlog rules) | Claude Code |
| `.claude/commands/` | Slash commands (`capture`, `plan`, `commit-release`) | Claude Code |
| `.claude/settings.json` | Hooks configuration (type check, version check) | Claude Code |
| `docs/WORKFLOW.md` | This file — human-readable workflow reference | Claude Code (updated during workflow changes) |

---

## Keeping This Doc Updated

This file should be updated whenever the workflow changes. If you add a new slash command, retire a process step, or change how releases work, update this doc in the same commit. Claude Code can be told "update docs/WORKFLOW.md to reflect these changes" as part of any workflow prompt.
