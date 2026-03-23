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
6. **GitHub issues required** — create GitHub issues for ALL promoted items that lack one, immediately after Phi confirms the triage table (do not wait until build time). Use `gh issue create --title "..." --body "..." --label "bug|enhancement|feature|chore"`. Update BACKLOG.md with issue numbers in the same commit.
7. Discarded items: close GitHub issue, remove from BACKLOG.md
8. v2.0 deferrals: move to v2.0 Deferred section
9. Workflow items get folded into CLAUDE.md or `.claude/rules/` directly — no GitHub issue
10. After triage, take promoted items to Claude Chat for design sessions if needed
