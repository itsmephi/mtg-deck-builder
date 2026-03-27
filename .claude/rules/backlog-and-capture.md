---
description: Backlog management and capture workflow — loaded when working with BACKLOG.md
globs:
  - "BACKLOG.md"
---

# BACKLOG.md — Permanent Backlog

BACKLOG.md is the single source of truth for all planned work. Items live here permanently until completed or discarded.

## Item Format
`- [ ] **label** | **[priority]** | description (#issue-number)`

Valid labels: bug · feature · enhancement · chore · workflow · v2.0
Valid priorities: **[high]** · **[med]** · **[low]**

New captures that haven't been through triage yet omit the priority field and are flagged during the next triage session.

## Item Lifecycle
1. Captured via `/capture` command in Claude Code (no priority yet — added at triage)
2. Triaged at planning session start — priority assigned or updated, milestone assigned
3. Promoted to Active Milestone section when ready to build
4. Marked closed after release: `- [x] **label** | **[priority]** | description (#issue) *(closed vX.X.X)*`

## Sections
- **Active Milestone** — items promoted from Pipeline for the current release. Cleared after release ships.
- **Pipeline** — triaged items not yet assigned to a milestone. New captures land here.
- **v2.0 Deferred** — items explicitly pushed to v2.0
- **Closed** — completed items (keep last 2 releases, then archive)

## Triage (run via /triage in Claude Code)
1. `/triage` reads full BACKLOG.md and presents a categorized table with suggested action per item
2. Categories: Promote · Keep · Defer to v2.0 · Discard · Discuss
3. Pre-fill every item based on: type, priority, age, complexity, active milestone relevance
4. **Priority check** — for every Pipeline item:
   - Flag any item missing a priority tag as `⚠️ needs priority` in the table
   - Call out any items where priority should increase or decrease based on project phase (e.g. a [low] item now blocking a [high] item, or a [high] item that's been deprioritized)
   - Include a **Priority** column in the triage table — show current priority and flag suggested changes
5. Phi reviews and calls out overrides only — everything else locks as suggested
6. Promoted items move to Active Milestone section
7. **GitHub issues required** — create GitHub issues for ALL promoted items that lack one, immediately after Phi confirms the triage table (do not wait until build time). Use `gh issue create --title "..." --body "..." --label "bug|enhancement|feature|chore"`. Update BACKLOG.md with issue numbers in the same commit.
8. Discarded items: close GitHub issue, remove from BACKLOG.md
9. v2.0 deferrals: move to v2.0 Deferred section
10. Workflow items get folded into CLAUDE.md or `.claude/rules/` directly — no GitHub issue
11. **Closed section cleanup** — after every triage, keep only the last 2 releases in `## Closed (Recent)`. Move any stale `[x]` items out of Pipeline into the Closed section under the correct version heading (or discard if their version is being archived). Archive everything older than the last 2 releases — they are already covered by CHANGELOG.md.
12. After triage, take promoted items to Claude Chat for design sessions if needed
