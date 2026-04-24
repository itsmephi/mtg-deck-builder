# CLAUDE.md — Project Brew

Personal MTG deck builder, designed for Thurgood (13) and shared with anyone who finds it useful. Currently accessible via Vercel link; heading toward public free release with optional accounts.

Authors: Phi & Thurgood Nguyen.

**Current Version: v1.20.0**

> **v1.20.0 is a foundation reset, not a feature release.** See `docs/PRODUCT.md` and `docs/DECISIONS.md` for the new strategic direction. The hybrid rebuild strategy (keep the engine, rebuild the surface) governs all upcoming work.

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

## Development Rules

- **Alignment before generation.** Confirm plan before writing code or files. `/plan` output is the review gate — wait for explicit PROCEED.
- **Token optimization.** Targeted reads only. No full-file cats when a grep will do.
- **Proactive suggestions.** Flag gaps, new docs, or tooling improvements before creating them.
- **Design gut-check.** For ad-hoc requests: if something feels off — removing a working pattern, reversing a recent decision, a change worth sitting with — raise it in one sentence before planning. Don't ask when the request feels right; only speak up when there's a real concern.
- **Version sync.** `Current Version` here must match `APP_VERSION` in `src/config/version.ts` and the latest entry in `CHANGELOG.md`. Three files change together on every version bump.
- **Commits.** Conventional format: `feat:` `fix:` `docs:` `chore:`. One-liner unless the why isn't obvious from the diff. GitHub issue syntax: `Closes #27, Closes #28` (each separately).
- **Spec conventions.** Specs are concise handoff contracts, not feature documentation. Cover only what Claude Code can't infer from PRODUCT.md, ARCHITECTURE.md, DESIGN-CONTEXT.md, or existing code: interaction design decisions, data model changes, non-obvious edge cases, deviations from established patterns. Resolve open design questions before generating the spec. Never edit a spec in place — create a new versioned file.
- **Specs live in `docs/specs/`.** One spec per feature/patch. Prototypes co-located with their spec.
- **Emergent tasks/bugs.** Add to `docs/BACKLOG.md` inbox section during sessions. Triage when inbox has new items.
- **Design vs. build.** Use Claude.ai for features with significant UX tradeoffs, data model changes, or multi-screen flows. Use Claude Code for polish, hotfixes, and obvious-design features. When designing in Claude Code, `/plan` output is the review gate. When a Claude.ai spec is used, it's the implementation contract, committed before building.

## Versioning & Docs

- **Semver**: major.minor.patch.
- **On version bump**: update `Current Version` here + `APP_VERSION` in `src/config/version.ts` + `CHANGELOG.md`.

### File Map

| File | Owner | Purpose |
|------|-------|---------|
| `CLAUDE.md` | Claude Code | Agent briefing — stack, rules, version |
| `docs/PRODUCT.md` | Claude.ai / Phi | What the app is, who it's for, why it exists |
| `docs/DECISIONS.md` | Claude.ai / Phi | Product decision log with rationale |
| `docs/specs/*.md` | Claude.ai | Handoff contracts — immutable after implementation |
| `docs/ARCHITECTURE.md` | Claude Code | Technical patterns, file structure, gotchas |
| `docs/DESIGN-CONTEXT.md` | Claude Code | Design constraints and patterns reference |
| `docs/SCHEMA.md` | Claude Code | Data shapes (localStorage, future Supabase) |
| `docs/BACKLOG.md` | Shared | Inbox → triaged → parked items |
| `docs/WORKFLOW.md` | Claude Code | Human-readable workflow reference |
| `CHANGELOG.md` | Claude Code | Version history |

**Ownership rule:** Claude.ai owns the *why and what* (PRODUCT, DECISIONS, specs). Claude Code owns the *how* (everything else). Claude Code does not edit PRODUCT.md, DECISIONS.md, or specs — flag changes to Phi instead.

## Workflow Shortcuts

- `/plan` — plan an implementation before building. Output is the review gate; wait for PROCEED.
- `/commit-release vX.X.X` — post-QA commit, merge, and push.

## Post-Version Checklist

After each version ships:

1. Update `Current Version` in CLAUDE.md to match `src/config/version.ts`.
2. Update `CHANGELOG.md` with version entry.
3. Update `docs/ARCHITECTURE.md` with new technical patterns (only non-obvious ones).
4. Update `docs/DESIGN-CONTEXT.md` if any design constraints changed.
5. Update `docs/SCHEMA.md` if data shapes changed.
6. Update `docs/BACKLOG.md`: remove the shipped version's triaged section, then triage inbox if it has new items.
7. Flag to Phi if `docs/PRODUCT.md` or `docs/DECISIONS.md` need updates.
8. **Staleness check:** scan all doc `<!-- Last updated: vX.X.X -->` headers — flag any two or more versions behind.
