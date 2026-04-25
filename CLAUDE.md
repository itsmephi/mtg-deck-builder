# CLAUDE.md — Project Brew

Personal MTG deck builder, designed for Thurgood (13) and shared with anyone who finds it useful. Currently accessible via Vercel link; heading toward public free release with optional accounts.

Authors: Phi & Thurgood Nguyen.

> **The current foundation reset governs all upcoming work.** See `docs/PRODUCT.md` and `docs/DECISIONS.md` for the strategic direction. Hybrid rebuild strategy: keep the engine, rebuild the surface.

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, Vercel. Currently localStorage-only — Supabase planned post-rebuild.

IDE: Zed (Windows primary, Steam Deck/Linux secondary).

## Hard Rules

- Single-user mental model for now. No auth flows yet.
- Never prepend `cd` to git or npm commands — already in project root.
- One active machine per Claude Code session. `git pull` before starting, `git push` after. Git commit is the handoff.
- Safe handoff: every Claude Code prompt must leave the app in a stable, testable state.
- Root cause before fix. Diagnose intended behavior before writing any fix spec.
- Engine vs. surface: the engine (data, format rules, Scryfall integration, types) is stable. Surface (IA, components, mobile) is being rebuilt. Be aware which layer you're touching.

## Working Tiers

Default to direct work. Tier up only when the change earns it.

**Direct work** — bug fixes, polish, copy changes, dependency bumps, obvious-design features. Just do it. No spec, no plan, no approval gate. Explain what changed in the commit or PR.

**Lightweight spec** — features with one or two real decisions but no data model changes or cross-screen flows. A short note in `docs/specs/` covering the decisions. No template required, no checklist required.

**Full spec from Claude.ai** — data model changes, multi-screen flows, real UX tradeoffs, anything touching the engine layer's contracts. Phi designs these in Claude.ai; the resulting spec is the implementation contract, committed before building.

## Development Rules

- **Token optimization.** Targeted reads only. No full-file cats when a grep will do.
- **Proactive suggestions.** Flag gaps, new docs, or tooling improvements before creating them.
- **Speak up when something feels wrong.** If a request removes a working pattern, reverses a recent decision, or feels worth sitting with — raise it in one sentence before doing the work. Don't ask when the request feels right.
- **Version sync.** `APP_VERSION` in `src/config/version.ts` is the source of truth. On every version bump, also update `CHANGELOG.md`. Two files change together.
- **Commits.** Conventional format: `feat:` `fix:` `docs:` `chore:`. One-liner unless the why isn't obvious from the diff. GitHub issue syntax: `Closes #27, Closes #28` (each separately).
- **Specs are immutable after implementation.** Never edit a spec in place — create a new versioned file.
- **Emergent tasks/bugs.** Add to `docs/BACKLOG.md` inbox section during sessions. Triage when inbox has new items.

## Versioning & Docs

- **Semver**: major.minor.patch.
- **Source of truth**: `src/config/version.ts`. CHANGELOG.md mirrors it.

### File Map

| File | Owner | Purpose |
|------|-------|---------|
| `CLAUDE.md` | Claude Code | Agent briefing — stack, rules, tiers |
| `docs/PRODUCT.md` | Claude.ai / Phi | What the app is, who it's for, why it exists |
| `docs/DECISIONS.md` | Claude.ai / Phi | Product decision log with rationale |
| `docs/specs/*.md` | Claude.ai | Handoff contracts — immutable after implementation |
| `docs/ARCHITECTURE.md` | Claude Code | Technical patterns, file structure, gotchas |
| `docs/SCHEMA.md` | Claude Code | Data shapes (localStorage, future Supabase) |
| `docs/BACKLOG.md` | Shared | Inbox → triaged → parked items |
| `docs/WORKFLOW.md` | Claude Code | Human-readable workflow reference |
| `CHANGELOG.md` | Claude Code | Version history |

**Ownership rule:** Claude.ai owns the *why and what* (PRODUCT, DECISIONS, specs). Claude Code owns the *how* (everything else). Claude Code does not edit PRODUCT.md, DECISIONS.md, or specs — flag changes to Phi instead.

## Workflow Shortcuts

- `/plan` — invoke when you want to see the plan before work starts. Optional, not the default. Use it for tricky changes, data model work, or anything you want a second pass on.
- `/commit-release vX.X.X` — post-QA commit, merge, and push.

## Current Version

`v1.21.5` — FindByNameBar focus polish (backdrop blur, wheel scroll, click-to-dismiss).

## Post-Version Checklist

Trim. Most steps fold into the work itself.

1. **Version sync** — `version.ts` and `CHANGELOG.md` updated together.
2. **Staleness scan** — flag any doc with a `<!-- Last updated: vX.X.X -->` header two or more versions behind.
3. **Flag PRODUCT.md / DECISIONS.md changes to Phi** — Claude Code doesn't edit these directly.
