---
description: Backlog management and capture workflow — loaded when working with BACKLOG.md
globs:
  - "BACKLOG.md"
---

# BACKLOG.md — Permanent Backlog

BACKLOG.md is the single source of truth for all planned work. Items live here permanently until completed or discarded.

## Structure

- **Active Milestone** — what you're building now
- **Planning Milestones** — future releases, roughly scoped (v1.16.0, v1.17.0, etc.)
- **Pipeline** — new captures only; untriaged items land here
- **v2.0 Deferred** — explicitly parked for v2

Closed items live in CHANGELOG.md only — no duplication here.

## Item Format

`- [ ] **label** | **[priority]** | description (#issue-number)`

Valid labels: bug · feature · enhancement · chore · workflow
Valid priorities: **[high]** · **[med]** · **[low]** (optional once item is in a milestone — order implies priority)

## Item Lifecycle

1. Captured via `/capture` → lands in Pipeline (no priority yet)
2. Triaged via `/triage` → assigned to a milestone or deferred
3. Built and shipped → removed from BACKLOG.md, recorded in CHANGELOG.md

## Pre-Triage Flagging

Before running `/triage`, Phi can add inline flags to items or milestones. Claude Code applies these automatically.

### Item-level flags
```
-> promote          Move to Active Milestone
-> v1.16            Move to specific planning milestone (creates if needed)
-> v2               Defer to v2.0
-> discard          Remove from backlog, close GitHub issue if exists
-> discuss          Surface for discussion before deciding
-> high / med / low Change priority
```

Flags can combine: `-> promote -> high`

### Milestone-level flags (on ### heading)
```
-> v1.15.0          Reorder: this milestone becomes v1.15.0, others shift
-> merge v1.16      Merge all items into v1.16.0, delete this milestone
-> drop             Move all items back to Pipeline, delete milestone
```

### Example
```markdown
### v1.16.0 — Home & Onboarding -> v1.15.0
- [ ] **feature** | Home screen -> promote
- [ ] **enhancement** | Onboarding hints -> v1.17

## Pipeline
- [ ] **bug** | Search spinner not animating -> promote -> high
- [ ] **chore** | Research Secret Lair sets -> discard
```

## Triage (via /triage)

1. Claude Code reads **Pipeline only** (new/unflagged items) + any flagged items elsewhere. Use targeted reads: Active Milestone is always near the top — `Read` with `limit: 30` from line 1 covers it. Grep for flagged items (`->`). Never read the full file.
2. Applies all `->` flags automatically
3. For unflagged Pipeline items, suggests milestone placement
4. Presents summary table — Phi confirms or overrides
5. After confirmation:
   - Moves items to their milestones
   - **Creates GitHub issues for all promoted items that are missing one** — use `gh issue create --title "..." --body "..." --label "bug|enhancement|feature|chore"`, then update BACKLOG.md with the issue number(s) in the same step
   - Cleans up flags from the file
6. Pipeline should be empty (or near-empty) after triage

## Priority Within Milestones

Once an item is in a milestone, priority tags are optional — position in the milestone implies build order. Use `[high]` / `[med]` / `[low]` only when you need to call out relative urgency within a milestone.

## GitHub Issues

- All Active Milestone items must have a GitHub issue before build starts
- `/triage` creates issues for newly promoted items automatically
- Discarded items: close the GitHub issue
- Workflow items: fold into CLAUDE.md or `.claude/rules/` directly, no issue needed
