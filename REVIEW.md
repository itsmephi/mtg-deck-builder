# REVIEW.md — MTG Deck Builder Session Journal

---

## v1.13.0 — Commander Eligibility Fixes + Vehicle/Spacecraft Support
Status: APPROVED ✅

### Session Summary

**What shipped (4 prompts):**

- **`src/types/index.ts`** — `ScryfallCard` extended with `power?: string` and `toughness?: string` fields, placed after `color_identity` and before `released_at`
- **`src/lib/formatRules.ts`** — `isEligibleCommander` rewritten: falls back to `card_faces[0]` for reversible cards; adds Vehicle/Spacecraft + P/T path for July 2025 rules; `isVehicleOrSpacecraftCommander` helper exported
- **`src/lib/scryfall.ts`** — `getCardPrintings` signature changed to `(cardName: string, oracleId: string)`; DFCs (name contains ` // `) use front-face exact name search; standard cards use `oracleid:` query
- **`src/components/layout/CardModal.tsx`** — `getCardPrintings` call updated to pass both `previewCard.name` and `previewCard.oracle_id`; loading spinner condition changed from `loading && variants.length === 0` to `loading`; spinner class fixed from invisible `border-t-tertiary` to `border-t-blue-400`
- **`src/components/workspace/VisualCard.tsx`** — `isVehicleOrSpacecraftCommander` imported; `isVehicleOrSpacecraft` computed per card; `showCrownTooltip` state + `crownTooltipTimeout` ref added; non-commander crown wrapped in hover container with 150ms dismiss delay; interactive tooltip div replaces `title` attribute; ⓘ link conditionally rendered for Vehicle/Spacecraft
- **`src/components/workspace/ListCardTable.tsx`** — same pattern as VisualCard; `hoveredCrownId` state + `crownTooltipTimeout` ref added; tooltip renders to the right of the crown icon; same 150ms dismiss delay

**Closed from backlog:** reversible card eligibility bug · variant picker empty bug · Vehicle/Spacecraft commander enhancement · ScryfallCard power/toughness chore

---

## v1.12.5 — Hotfix: Home Screen & Settings Navigation
Status: APPROVED ✅

### Session Summary

**What shipped:**

- **`src/app/page.tsx`** — `onGoHome` now calls both `setActiveDeckId(null)` and `setShowSettings(false)`; `isOnHomeScreen` changed from `!activeDeck` to `!activeDeck && !showSettings` so home button stays active when settings overlays the home screen
- **`src/components/home/DeckCoverCard.tsx`** — `cards: unknown[]` → `cards: { quantity: number }[]`; card count now `.reduce((sum, c) => sum + c.quantity, 0)`
- **`src/components/home/HomeScreen.tsx`** — same `Deck.cards` type update for TypeScript alignment with `DeckCoverCard`
- **`src/components/layout/SidebarDecksTab.tsx`** — added `onCloseSettings?: () => void` prop; called after deck name click and sideboard icon click
- **`src/components/layout/Sidebar.tsx`** — passes `onCloseSettings` down to `SidebarDecksTab`
- **`CLAUDE.md`** — settings overlay contract added to Key Technical Notes

**Root cause note:** `showSettings` is an overlay guard (`showSettings ? <SettingsView> : ...`) — it takes priority over all routing conditions. Any navigation action that doesn't explicitly call `setShowSettings(false)` leaves settings open silently.

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
