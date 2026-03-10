# BACKLOG.md — MTG Deck Builder
<!-- Capture scratch pad. Items live here until promoted to CLAUDE.md + GitHub issues. -->
<!-- Cleared and bundled into the final session commit alongside CLAUDE.md, CHANGELOG.md, REVIEW.md. -->
<!-- Consolidation timestamps appended at bottom each time Claude Code runs a consolidation. -->
<!-- At session start: verify latest timestamp here matches most recent marker in Capture Log chat. -->

<!-- STANDARD CONSOLIDATION PROMPT — paste into Capture Log chat to trigger a consolidation:

Consolidate the Capture Log.

Scan from the last consolidation marker to the end of this chat. Collect all bugs, features,
enhancements, workflow ideas, and UI tweaks logged since then.

If there are no new items since the last consolidation marker, do nothing except note that
the log is current. Do not append a timestamp if there are no new items.

If there are new items, output a Claude Code prompt that does the following:
- Append all new items to BACKLOG.md using the format: `- [ ] **label** | description`
  - Valid labels: bug · feature · enhancement · chore · workflow · review · v2.0
  - Interpret and clean up each item — don't copy raw chat text
  - Do not sort, deduplicate, or assign issue numbers — just append
- After appending all items, append a consolidation timestamp on its own line at the very bottom:
  `--- consolidated to BACKLOG.md YYYY-MM-DDTHH:MM ---` 🎴
  (Items must always appear before the timestamp — never append a timestamp without items above it)
- Commit BACKLOG.md with message: `chore: consolidate capture log to BACKLOG.md YYYY-MM-DDTHH:MM`
  (Claude Code fills in the actual current datetime in both places)

Then drop the matching timestamp marker here in this chat using the same datetime.
-->
- [ ] **bug** | BACKLOG.md not cleared post-promotion — promoted items were not cleared during v1.1.5 session commit; needs manual cleanup pass and a Claude Code behavior fix to ensure promoted items are always cleared in the final session commit
- [ ] **workflow** | PROCEED/APPROVED gates bypassed in first web Claude Code session with allowedTools config — gates were respected in terminal sessions prior; root cause unclear (web vs terminal behavior, allowedTools side effect, or both); test on next session: terminal + new settings to confirm gates still hold

--- consolidated to BACKLOG.md 2026-03-08T13:00 ---  🎴
