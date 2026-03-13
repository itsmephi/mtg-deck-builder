---
description: Backlog management and Capture Log workflow — loaded when working with BACKLOG.md
globs:
  - "BACKLOG.md"
---

# BACKLOG.md — Permanent Backlog

BACKLOG.md is the single source of truth for all planned work. Items live here permanently until they are either completed (closed in a release) or discarded.

## Item Format
`- [ ] **label** | description (#issue-number)`

Valid labels: bug · feature · enhancement · chore · workflow · v2.0

## Item Lifecycle
1. Captured in the Capture Log chat (Claude project)
2. Consolidated to BACKLOG.md via standard consolidation prompt (appended, not sorted)
3. Triaged at planning session start (tagged with status, priority, milestone assignment)
4. Promoted to active milestone when ready to build (stays in BACKLOG.md, gets milestone tag)
5. Marked closed after release: `- [x] **label** | description (#issue) *(closed vX.X.X)*`

## Sections
BACKLOG.md is organized into sections:
- **Active Milestone** — items selected for the current release
- **Pipeline** — triaged items not yet assigned to a milestone
- **v2.0 Deferred** — items explicitly pushed to v2.0
- **Closed** — completed items (keep last 2 releases, then archive)

## Consolidation
- Standard consolidation prompt lives at the top of BACKLOG.md as an HTML comment
- Consolidation appends new items to the Pipeline section
- Consolidation timestamps appended at bottom: `--- consolidated YYYY-MM-DDTHH:MM ---`
- Empty consolidation (no new items) does not append a timestamp
- Claude Code interprets and cleans up captured items — does not sort, deduplicate, or assign issue numbers during consolidation

## Triage (run at planning session start)
1. Claude Chat pulls full backlog and presents as a categorized table with suggested action per item
2. Categories: Keep · Discard · Defer to v2.0 · Promote to active milestone · Needs discussion
3. Pre-fill every item based on: type, age, complexity, active milestone relevance
4. Phi reviews and calls out overrides only — everything else locks as suggested
5. Discarded items: close GitHub issue, mark as discarded in BACKLOG.md
6. v2.0 deferrals: move to v2.0 Deferred section
7. Workflow items get folded into CLAUDE.md or `.claude/rules/` directly — no GitHub issue created

## Capture Log
- Chat URL: https://claude.ai/chat/39f0cbd5-b1f5-4995-8b54-c0f6769fcec7
- Always find via recent_chats tool (not conversation_search by keyword)
- Consolidation is Phi's responsibility — run it anytime between sessions. BACKLOG.md is always treated as current at session start regardless of Capture Log state.
- Claude Code never reads the Capture Log directly — Claude Chat handles triage
