---
description: Backlog management and capture workflow — loaded when working with BACKLOG.md
globs:
  - "BACKLOG.md"
---

# BACKLOG.md — Permanent Backlog

BACKLOG.md is the single source of truth for all planned work. Items live here permanently until completed or discarded.

## Item Format
`- [ ] **label** | description (#issue-number)`

Valid labels: bug · feature · enhancement · chore · workflow · v2.0

## Item Lifecycle
1. Captured via `/capture` command in Claude Code
2. Triaged at planning session start — tagged with status, priority, milestone
3. Promoted to Active Milestone section when ready to build
4. Marked closed after release: `- [x] **label** | description (#issue) *(closed vX.X.X)*`

## Sections
- **Active Milestone** — items selected for the current release
- **Pipeline** — triaged items not yet assigned to a milestone. New captures land here.
- **v1.2.0 Deferred** — features from the original v1.2.0 milestone not yet started
- **v2.0 Deferred** — items explicitly pushed to v2.0
- **Closed** — completed items (keep last 2 releases, then archive)

## Triage (run via /triage in Claude Code)
1. `/triage` reads full BACKLOG.md and presents a categorized table with suggested action per item
2. Categories: Promote · Keep · Defer to v2.0 · Discard · Discuss
3. Pre-fill every item based on: type, age, complexity, active milestone relevance
4. Phi reviews and calls out overrides only — everything else locks as suggested
5. Promoted items move to Active Milestone section
6. Discarded items: close GitHub issue, remove from BACKLOG.md
7. v2.0 deferrals: move to v2.0 Deferred section
8. Workflow items get folded into CLAUDE.md or `.claude/rules/` directly — no GitHub issue
9. After triage, take promoted items to Claude Chat for design sessions if needed
