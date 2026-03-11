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
--- consolidated to BACKLOG.md 2026-03-08T13:00 ---  🎴
- [ ] **bug** | Clicking a deck name in the decklist dropdown should behave the same as clicking the radio button — no need to close the dropdown
- [ ] **bug** | List view row hover highlight lost after color tint implementation; hover state should be restored and coexist with tint
- [ ] **enhancement** | Colorless and Land row tints should be differentiated — colorless = gray, lands = tan/brown (reference: magic.iristormdesign.com)
- [ ] **workflow** | Carry-forward vs hot-fix decision rule — carry-forwards are fine for one-liners or direct fixes to what was just built; if a carry-forward requires new design decisions mid-QA, flag as a separate hot-fix version; mid-QA scope additions (pulling in a backlog item while testing) should always be a separate version; Claude Chat should surface this rule at the start of QA any time a mid-session scope addition is being considered
- [ ] **workflow** | Visual specs that touch row/cell backgrounds must explicitly state: transparency behavior, hover state coexistence, and layering with existing styles; Claude Chat should ask these questions during design
- [ ] **workflow** | For bug specs where the issue title describes unwanted behavior, Claude Chat must explicitly confirm intended behavior before writing the spec — never assume the fix direction from the title alone
- [ ] **v2.0** | UI overhaul — replace always-on buttons (close, owned, +/−, etc.) with hover-state reveals to keep the UI cleaner
- [ ] **bug** | Qty soft warning turns red at 4 copies; 4 is still legal — should stay gray at 4 and only turn red above 4; consider yellow warning state as intermediate
- [ ] **bug** | Untitled decks show as blank in the dropdown — needs a visible name indicator; default display name should be "Untitled"
--- consolidated to BACKLOG.md 2026-03-11T00:00 ---  🎴
- [ ] **enhancement** | Turn-based draw probability slider — show odds of drawing a card by turn N; deferred because "turn" is ambiguous mid-simulation; revisit when building a dedicated pre-game deck analysis view
- [ ] **enhancement** | Max % inline label — show static max possible % next to card name in Draw Odds (e.g. "6.7% max") as a reference anchor; deferred to keep UI clean; revisit once live with real decks
- [ ] **enhancement** | Commander threshold calibration — color thresholds (green ≥8%, yellow ≥4%, red <4%) calibrated for 60-card decks; recalibrate when Commander mode ships (99 cards); constants are already named
- [ ] **enhancement** | Category-level draw odds — odds of drawing any land, any 2-drop, any removal, etc.; requires card tagging system; deferred as stretch goal beyond per-card odds
- [ ] **enhancement** | Mulligan strategy hints — contextual guidance based on hand stats (e.g. "only 1 land — consider mulligan"); out of scope for this version
- [ ] **v2.0** | Mobile touch pin interaction — click-to-pin works on desktop; touch targets in sidebar may be small on mobile; flag for review at mobile optimization milestone
