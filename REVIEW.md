# REVIEW.md — MTG Deck Builder Session Journal

---

## v1.7.0 — Search Polish + Commander Fixes
Status: APPROVED ✅

---

## Session Summary

**What shipped:**

- **CardModal open-after-add (search context):** Modal stays open after clicking "+ Add to Deck" and snaps back to Details tab — matches deck view Confirm Art Swap behavior. `SearchWorkspace.tsx` no longer calls `setSelectedCard(null)` on add; `CardModal.tsx` calls `setView("details")` in the add handler.
- **Planeswalker commander eligibility bug:** `isEligibleCommander` in `formatRules.ts` now requires `Legendary` AND `Creature` in `type_line` — Legendary Planeswalkers no longer qualify unless oracle text says "can be your commander".
- **Group by type — commander floats to top:** `groupCardsByType` in `Workspace.tsx` prepends a `Commander` group when format=commander, commanderId is set, and deckViewMode is `main`. Commander card is pulled out of its type bucket and placed first.
- **In-deck pill tooltip:** Green dot on search card tiles gets `title="Already in deck"`.
- **CardModal Swap Art loading spinner:** Prints view shows a spinner while `loading && variants.length === 0` before the printings grid populates.
- **Filter section All/None toggle:** Each filter group (Rarity, Card Type, Colors) gets an inline All/None toggle button next to its label — selects or deselects the entire group in one click.
- **Color filter chip tints:** Active color chips now use per-color tints (W=stone, U=blue, B=dark-neutral, R=red, G=green, C=neutral-gray) via `COLOR_ACTIVE_CLASS` map and `activeClassName` prop on `ToggleChip`.
- **Price filter "Any" toggle:** `anyPrice: boolean` added to `FilterState`; when on, all price filter syntax is suppressed and the slider/inputs dim. "Any" button toggles it inline with the Price Range label.
- **Set name natural language search:** `lookupSetCode(name)` in `scryfall.ts` fetches all sets once (module-level cache), normalizes to words, and returns the best all-words-match by specificity score. `SearchWorkspace` fires a debounced lookup when `parsed.remainder` has 2+ words; injects `e:CODE` into the Scryfall query and shows a "Set: [name] ×" chip in toolbar row 2.
- **Discard NLP token:** `o:"discard"` added to nlpParser archetypes.
- **`set:CODE` NLP passthrough:** Also added `set:(\w+)` → `e:CODE` dynamic token (complements the natural language lookup).

Workflow improvement: added safe-handoff and carry-forward rules to CLAUDE.md and release-workflow.md based on lessons learned from the v1.6.0 milestone (4-prompt sequence where Prompt 2 carry-forwards + features created an unstable intermediate state).

---

## How This File Works
This file is the live session journal shared between Phi, Claude Chat, and Claude Code.
- **Claude Code writes:** Plan review table, testing checklist, session summary — committed only at session end
- **Phi writes:** Test results (checking boxes), inline comments on failures, emerging issues during QA
- **Claude Chat reads:** Verifies plan review, triages failures, incorporates findings into next Claude Code prompt
- Never committed to git mid-session — only in the final commit alongside CLAUDE.md and CHANGELOG.md
