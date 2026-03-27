# REVIEW.md — MTG Deck Builder Session Journal

---

## v1.15.0 — Bug Fixes + Deck Backup
Status: APPROVED ✅

### Plan Review

| File | Changes |
|------|---------|
| `src/components/workspace/Workspace.tsx` | Bug #83: in `onSwap` handler, after updating deck cards, check if `oldId === activeDeck.commanderId` and if so call `setCommanderId(newCard.id)` to preserve commander status |
| `src/components/workspace/VisualCard.tsx` | Bug #84: add `.blur()` call on crown button click handler after `onSetCommander(card.id)` to prevent browser focus-scroll when card moves to position 0 |
| `src/components/workspace/ListCardTable.tsx` | Bug #84: same `.blur()` fix on crown button click handler |
| `src/hooks/useDeckManager.tsx` | Feature #85: extract `migrateDecks` helper function; add `replaceAllDecks(newDecks: Deck[])` method to context |
| `src/components/workspace/SettingsView.tsx` | Feature #85: add `showToast` prop; pass `showToast` and `onClose` to `PreferencesTab`; add Deck Backup section (buttons, last-backup timestamp, error state, restore confirmation modal, hidden file input) |
| `src/components/workspace/SearchWorkspace.tsx` | Feature #85: remove local `toastMessage` state, `toastTimerRef`, `showToast` callback, and toast render div; add `showToast: (message: string) => void` prop |
| `src/app/page.tsx` | Feature #85: add `toastMessage` state, `toastTimerRef`, `showToast` callback, and toast render div (app-wide); pass `showToast` to `SettingsView` and `SearchWorkspace` |
| `CLAUDE.md` | Spec §14: update workflow description from prompt-based to spec-only; add `mtg-last-backup` to localStorage keys list |
| `.claude/rules/release-workflow.md` | Spec §14: update Steps 1–2 to remove prompt generation; replace "Prompt File Workflow" section with "Spec File Workflow" |
| `docs/WORKFLOW.md` | Spec §14: update to reflect spec-only workflow (no prompt files) |

### Root Cause Notes

**Bug #83:** `onSwap` in Workspace.tsx replaces the card object with a new Scryfall printing (different `id`). `commanderId` is stored as a `DeckCard.id`. After the swap, `commanderId` references the old id which no longer exists in `deck.cards`, so the commander is silently lost. Fix: check `oldId === activeDeck.commanderId` inside `onSwap` and call `setCommanderId(newCard.id)` when true.

**Bug #84:** When the crown button is clicked, it gains browser focus. After `setCommanderId` fires, `sortedCards` reorders and the commander card moves to position 0. The focused button's DOM position shifts; browser-native focus-scroll behavior may scroll to keep the focused element visible. Fix: call `(e.currentTarget as HTMLButtonElement).blur()` in the click handler after `onSetCommander` so the browser releases focus before the DOM reorders.

### Design Questions

None — spec is DESIGN APPROVED for #85; root causes confirmed for #83 and #84.

### Checklist Flags

- Bug #84 fix applies to both `VisualCard.tsx` (visual grid view) and `ListCardTable.tsx` (list view) crown buttons
- Feature #85: `onClose` already exists as a prop on `SettingsView` — pass it through to `PreferencesTab` as a new prop
- Feature #85: `replaceAllDecks` triggers the existing `useEffect` that persists `decks` to localStorage — no extra persistence logic needed
- Feature #85: app-wide toast render div must be outside all conditional views in `page.tsx` return so it shows over Settings, Home, Search, and Deck views

### Backlog Items Addressed

- `#83` — Art swap loses commander status
- `#84` — Marking commander autoscrolls
- `#85` — Backup decks (export/restore)

---

---

### QA Checklist

**Bug #83 — Art swap commander**
- [ ] Open a Commander deck with a designated commander
- [ ] Open CardModal on the commander card → Swap Art tab → select a different printing → Confirm Art Swap
- [ ] Commander crown badge is still shown on the swapped card
- [ ] Group by type still shows Commander group with the swapped card

**Bug #84 — Commander autoscroll**
- [ ] In a Commander deck with 20+ cards, scroll down so the top cards are off-screen
- [ ] Click the crown icon on a mid-deck card to set it as commander
- [ ] Deck view smoothly scrolls to the top (commander card) when commander is assigned
- [ ] Crown icon on the active commander → click to unset — no scroll (unset is not a new assignment)

**Feature #85 — Deck Backup**

*Backup:*
- [ ] Settings Hub → Preferences tab → "Deck Backup" section appears between Theme and "coming soon"
- [ ] "Backup All Decks" button is present with Download icon
- [ ] Click "Backup All Decks" — `.json` file downloads immediately
- [ ] Filename is `thebrewlab-backup-YYYY-MM-DD.json` with today's date
- [ ] File contains valid JSON with `app`, `version`, `exportedAt`, `decks` fields
- [ ] `decks` array matches current deck data
- [ ] "Last backup: [date]" line updates after backup
- [ ] Toast shows "Backed up X decks"
- [ ] With 0 decks: button is disabled + shows tooltip "No decks to back up"

*Restore — file validation:*
- [ ] "Restore from Backup" button is present with Upload icon
- [ ] Click opens native `.json` file picker
- [ ] Cancel file picker → nothing happens
- [ ] Select a non-JSON file → inline error below buttons
- [ ] Select a JSON file that isn't a TheBrewLab backup → "doesn't look like a TheBrewLab backup" error
- [ ] Select a backup with empty decks array → "backup contains no decks" error
- [ ] Error clears when either button is clicked again

*Restore — confirmation modal:*
- [ ] Select a valid backup → confirmation modal appears
- [ ] Modal shows current deck count and backup deck count
- [ ] Modal shows formatted backup date from `exportedAt`
- [ ] With 0 current decks, modal says "This will add" not "This will replace"
- [ ] Cancel → modal closes, no changes
- [ ] Escape → modal closes
- [ ] Click backdrop → modal closes
- [ ] Restore → executes

*Restore — execution:*
- [ ] After restore, previous decks are gone; restored decks appear in sidebar
- [ ] First restored deck is active
- [ ] Settings Hub closes after restore
- [ ] Toast shows "Restored X decks"
- [ ] Deck data survives page refresh
- [ ] Backup with Commander deck (commanderId, sideboard) → Restore → commander and sideboard intact

**App-Wide Toast**
- [ ] Toast still shows "Added card to deck" in Search view
- [ ] Toast shows for backup confirmation
- [ ] Toast shows for restore confirmation
- [ ] Toast auto-dismisses after 2 seconds
- [ ] Rapid calls replace previous (no stacking)
- [ ] Toast is visible over Settings view, Home screen, Search view, Deck view

**Cross-cutting**
- [ ] `npm run build` passes ✅ (verified)
- [ ] Existing per-deck Export (text format) in sidebar still works
- [ ] Existing Import in sidebar still works
- [ ] Settings Hub all tabs, back button, Escape still work

### QA Notes
Bug #84 carry-forward: intended behavior confirmed as scroll-to-commander (not suppress). Reverted `.blur()` fix; replaced with explicit `scrollTo({ top: 0, behavior: "smooth" })` in Workspace.tsx useEffect. All other items passed.

### Session Summary

**What shipped:**

- **`src/components/workspace/Workspace.tsx`** — Bug #83: `onSwap` handler now updates `commanderId` to `newCard.id` when the swapped card was the commander. Bug #84: `prevCommanderRef` useEffect scrolls container to top when a new commander is assigned within the same deck (smooth scroll; skips mount and deck-switch).
- **`src/components/workspace/VisualCard.tsx`** — Crown buttons restored to original click handlers (`.blur()` approach reverted per QA feedback).
- **`src/components/workspace/ListCardTable.tsx`** — Same revert as VisualCard.
- **`src/hooks/useDeckManager.tsx`** — Extracted `migrateDecks()` helper; added `replaceAllDecks(newDecks)` to context — migrates, sets state, sets first deck active, resets deckViewMode to main.
- **`src/components/workspace/SettingsView.tsx`** — `showToast` + `onClose` props added; `PreferencesTab` now accepts them; Deck Backup section added between Theme and placeholder — backup button (disabled at 0 decks), restore button (file picker), last-backup timestamp, inline error states, hidden file input, restore confirmation modal with dynamic copy.
- **`src/components/workspace/SearchWorkspace.tsx`** — Local `toastMessage` state, `toastTimerRef`, `showToast` callback, and toast render div removed; `showToast` prop added.
- **`src/app/page.tsx`** — App-wide `toastMessage` state, `toastTimerRef`, `showToast` callback, and toast render div added (outside all conditional views); `showToast` passed to `SettingsView` and `SearchWorkspace`.
- **`src/config/version.ts`** — Bumped to `1.15.0`; v1.15.0 changelog entry added.
- **`CLAUDE.md`** — Version bumped; active milestone updated to v1.16.0; workflow description updated (spec-only, no prompts); `mtg-last-backup` added to localStorage keys.
- **`.claude/rules/release-workflow.md`** — Steps 1–2 updated; "Prompt File Workflow" section replaced with "Spec File Workflow".
- **`docs/WORKFLOW.md`** — Release flow step 3 updated; Claude Chat description updated; key rules updated.
- **`BACKLOG.md`** — v1.15.0 items (#83, #84, #85) removed; active milestone updated to v1.16.0.

---

## How This File Works
This file is the live session journal shared between Phi, Claude Chat, and Claude Code.
- **Claude Code writes:** Plan review table, testing checklist, session summary — committed only at session end
- **Phi writes:** Test results (checking boxes), inline comments on failures, emerging issues during QA
- **Claude Chat reads:** Verifies plan review, triages failures, incorporates findings into next Claude Code prompt
- Never committed to git mid-session — only in the final commit alongside CLAUDE.md and CHANGELOG.md
