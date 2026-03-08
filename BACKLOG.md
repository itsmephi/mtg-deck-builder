# BACKLOG.md — MTG Deck Builder
<!-- Capture scratch pad. Items live here until promoted to CLAUDE.md + GitHub issues. -->
<!-- Cleared and bundled into the final session commit alongside CLAUDE.md, CHANGELOG.md, REVIEW.md. -->
<!-- Consolidation timestamps appended at bottom each time Claude Code runs a consolidation. -->
<!-- At session start: verify latest timestamp here matches most recent marker in Capture Log chat. -->

<!-- STANDARD CONSOLIDATION PROMPT — paste into Capture Log chat to trigger a consolidation:

Consolidate the Capture Log.

Scan from the last consolidation marker to the end of this chat. Collect all bugs, features,
enhancements, workflow ideas, and UI tweaks logged since then.

Output a Claude Code prompt that does the following:
- Append all new items to BACKLOG.md using the format: `- [ ] **label** | description`
  - Valid labels: bug · feature · enhancement · chore · workflow · review · v2.0
  - Interpret and clean up each item — don't copy raw chat text
  - Do not sort, deduplicate, or assign issue numbers — just append
- Append a consolidation timestamp at the bottom of BACKLOG.md using the current datetime:
  `--- consolidated to BACKLOG.md YYYY-MM-DDTHH:MM ---` 🎴
- Commit BACKLOG.md with message: `chore: consolidate capture log to BACKLOG.md YYYY-MM-DDTHH:MM`
  (Claude Code fills in the actual current datetime in both places)

Then drop the matching timestamp marker here in this chat using the same datetime.
-->

- Sideboard import/export parity with main board (#61)
- Move cards between boards or decks (#62)
- Search by artist (#63)
- Show art cards — display only, not addable (#64)
- Sort by price (#65)
- Periodic codebase health check (#66)
- Tooltip hover delay — tooltips should appear after a longer delay; remove from intuitive icons (+ and −) (#67)
- Card price on set in CardModal — similar to grid view swap art previews (#68)
- Additional CardModal metadata — rarity, foil/non-foil, set code (#69)
- Default new deck name is "Untitled" in gray; turns white and saves when user enters a name (#70)
- Major search sidebar redesign — functionality and UI overhaul (#71)
- Revisit owned behavior — consider inverting so owned = full brightness, unowned = grayed out (#72)
- Commander support — mark a card as Commander, enforce Commander rules (#73)
- Mobile version — cleaner, tighter, more intuitive for vertical small screens (v2.0) (#74)
- UI/UX overhaul (v2.0) (#75)

- [ ] **enhancement** | Grid view card icons and action buttons appear on hover/rollover — requires design session before building

--- consolidated to BACKLOG.md 2026-03-08T00:00 ---  🎴

--- consolidated to BACKLOG.md 2026-03-08T12:00 ---  🎴
