---
description: Triage the backlog — review all Pipeline items and categorize them for action
allowed-tools: Read, Write, Edit, Bash(git *)
---

Triage the BACKLOG.md Pipeline.

Steps:
1. Read BACKLOG.md in full
2. Read CLAUDE.md for current version, active milestone, and project context
3. For every item in the `## Pipeline` section, present a table with columns:
   - **#** (issue number if assigned, or "—")
   - **Item** (short description)
   - **Type** (bug/feature/enhancement/etc)
   - **Suggested Action** — one of:
     - `Promote` — ready to build, move to Active Milestone
     - `Keep` — stays in Pipeline for a future milestone
     - `Defer v2.0` — move to v2.0 Deferred section
     - `Discard` — close issue and remove
     - `Discuss` — needs design decisions before categorizing
   - **Reason** (one-line justification for the suggestion)

4. Pre-fill every Suggested Action based on: item type, age, complexity, whether it has an open GitHub issue, and whether it fits the current project phase

5. Present the table and **wait for Phi's input**. Phi will:
   - Confirm the table as-is, OR
   - Call out overrides (e.g. "move #58 to Promote, discard #49")
   - Ask to discuss specific items before deciding

6. After Phi confirms, execute all actions:
   - `Promote` items → move to `## Active Milestone` section
   - `Defer v2.0` items → move to `## v2.0 Deferred` section
   - `Discard` items → remove from BACKLOG.md (and note the issue number to close)
   - `Keep` and `Discuss` items → stay in Pipeline (Discuss items get a `⚠️ needs design` note)

7. Commit: `git add BACKLOG.md && git commit -m "triage: promote N items to active milestone, defer N, discard N"`

8. Print a summary:
   - What was promoted to Active Milestone
   - What was deferred or discarded
   - Any items flagged for discussion
   - Reminder: "Take promoted items to Claude Chat for design if they need it. For simple fixes, run /plan directly."
