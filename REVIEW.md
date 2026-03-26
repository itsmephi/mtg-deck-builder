# REVIEW.md — MTG Deck Builder Session Journal

---

## v1.12.4 — Home Screen & Empty State
Status: APPROVED ✅

### Session Summary

**What shipped (5 prompts):**

- **`src/hooks/useDeckManager.tsx`** — removed auto-create on first load and last-deck delete; `setActiveDeckId` updated to accept `string | null`; `activeDeckId = null` routes to home screen
- **`src/app/page.tsx`** — `!activeDeck` routing condition added between settings and tab views; `showSearchTakeover` state wired to `SearchWorkspace` and `Workspace`; `onGoHome` / `isOnHomeScreen` forwarded to `Sidebar`; `createNewDeck` destructured for `HomeScreen.onCreateDeck`
- **`src/components/home/HomeScreen.tsx`** — full home screen: heading, rotating tagline, deck cover cards, ghost deck card, FormatPicker dropdown
- **`src/components/home/DeckCoverCard.tsx`** — deck cover tile with deterministic gradient tint from deck name hash; shows name + card count
- **`src/components/home/GhostDeckCard.tsx`** — dashed ghost tile with Plus icon; opens FormatPicker on click
- **`src/hooks/useHomeTagline.ts`** — sessionStorage-backed random tagline hook (one per session)
- **`src/config/taglines.ts`** — 13 rotating taglines
- **`src/components/workspace/Workspace.tsx`** — removed auto-create `useEffect`; ghost card rendered in empty deck grid (`sortedCards.length === 0 && deckViewMode !== "sideboard"`); `onAddFirstCard` prop triggers search takeover
- **`src/components/workspace/SearchWorkspace.tsx`** — `showSearchTakeover` / `onDismissTakeover` props added; `SearchTakeover` rendered in place of normal UI when active
- **`src/components/workspace/SearchTakeover.tsx`** — heading, autofocused input (Enter fires search), quick-tag pills; dismisses and fires query on selection
- **`src/components/layout/SidebarDecksTab.tsx`** — "New Deck" text button replaced with dashed ghost slot; same FormatPicker behaviour
- **`src/components/layout/Sidebar.tsx`** — Home icon added to expanded footer; `onGoHome` / `isOnHomeScreen` props; forwarded to `SidebarRail`
- **`src/components/layout/SidebarRail.tsx`** — Home icon added below Settings; dimmed + `cursor-not-allowed` when on home screen; tooltip hidden when active
- **`src/app/layout.tsx`** — page title updated to "TheBrewLab"

**Closed from backlog:** `feature | Empty/cold-start state` · `chore | App title tag updated to TheBrewLab`

**New Pipeline items:** Home screen deck covers (custom art) · Home screen as persistent hub

---

## How This File Works
This file is the live session journal shared between Phi, Claude Chat, and Claude Code.
- **Claude Code writes:** Plan review table, testing checklist, session summary — committed only at session end
- **Phi writes:** Test results (checking boxes), inline comments on failures, emerging issues during QA
- **Claude Chat reads:** Verifies plan review, triages failures, incorporates findings into next Claude Code prompt
- Never committed to git mid-session — only in the final commit alongside CLAUDE.md and CHANGELOG.md
