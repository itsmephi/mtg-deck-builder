# REVIEW.md — MTG Deck Builder Session Journal

---

## Current Task: Search Overhaul — Prompt 4 of 4: CardModal Context + Housekeeping
Status: APPROVED ✅

---

## Session Summary — v1.6.0 Search Overhaul

**Branch:** vX.X.X (Prompts 1–4)
**Closed:** #72 (format/color filtering), #26 (EDHREC/NLP search suggestions)

### What shipped

**Prompt 1 — Foundation**
- Lifted `activeTab` state to `page.tsx`; always-mount pattern (`hidden` CSS) preserves both workspace states across tab switches
- New `SearchWorkspace.tsx`: full-width card grid with toolbar (search bar row + results/sort/view row)
- New `SearchBar.tsx`: prop-driven search input with filter badge, NLP token chips, autocomplete dropdown
- `VisualCard.tsx`: added `mode="search"` early return with green in-deck dot, slide-up add overlay

**Prompt 2 — NLP + Filter Badge + Autocomplete**
- New `lib/nlpParser.ts`: ~30 regex patterns for colors, types, keywords, price, CMC, archetypes, rarity; `ParsedToken.matchedText` enables reliable token removal
- Filter badge in SearchBar: format-aware (Commander gold, Standard blue, Freeform neutral), mana pip icons for commander color identity, toggle on/off
- Autocomplete dropdown: Scryfall `/cards/autocomplete`, green dot for in-deck cards, Escape/Enter/outside-click dismiss
- Toast on card add: replaces rapid successive toasts via `useRef` timer
- `autocompleteCards()` added to `scryfall.ts`

**Prompt 3 — Bug Fixes + Sidebar Filters + Category Chips**
- Bug 1: deck scroll restored — removed `flex flex-col` from decks wrapper in `page.tsx`
- Bug 2: autocomplete dismissed reliably — `showAutocomplete` converted from derived to explicit `useState`
- Bug 3: Enter key now dismisses autocomplete dropdown
- Fix 4: in-deck card opacity `opacity-60` → `opacity-40` in search mode
- New `CategoryChips.tsx`: format-filtered quick-search chip bar (10 categories, `formats: ['all' | 'Commander' | 'Standard' | 'Freeform']`)
- New `FilterPanel.tsx`: price range, rarity/type/color toggles with mana pip icons; `buildSidebarFilterSyntax()` pure export
- `SidebarSearchTab.tsx` rebuilt: CategoryChips + scrollable FilterPanel
- `Sidebar.tsx`: threaded chip/filter props; `page.tsx` lifts `activeChipId`, `activeChipQuery`, `sidebarFilters`
- SearchWorkspace scryfallQuery memo extended: `formatFilter + chipQuery/NLP + sidebarFilterSyntax`

**Prompt 4 — CardModal Context + Housekeeping**
- `CardModal.tsx`: `context` prop (`'search'`/`'deck'`, default `'deck'`); search context shows "+ Add to Deck" (blue, always active, uses `previewCard` so variant selection works); deck context preserves "Confirm Art Swap" unchanged
- `SearchWorkspace.tsx`: passes `context="search"` and `onAddToDeck` wrapper (calls `handleAdd` then closes modal) to CardModal
- Version bumped to 1.6.0; CHANGELOG, BACKLOG, CLAUDE.md all updated; 9 new Pipeline items captured

---

## Plan Review — Prompt 4

| # | File | Change | Notes |
|---|------|--------|-------|
| 1 | `src/components/layout/CardModal.tsx` | Add `context?: 'search' \| 'deck'` and `onAddToDeck?: (card: ScryfallCard) => void` props; swap action button behavior — search context shows "+ Add to Deck" (always blue, calls `onAddToDeck(previewCard)`), deck context preserves current "Confirm Art Swap" button unchanged | `previewCard` is used for both — so if user browses to a variant in Swap Art then clicks "+ Add to Deck", they add that variant. No active deck guard: button disabled + tooltip if `onAddToDeck` is not provided |
| 2 | `src/components/workspace/SearchWorkspace.tsx` | Pass `context="search"` and `onAddToDeck` to CardModal; `onAddToDeck` wrapper calls `handleAdd(card)` then `setSelectedCard(null)` to close the modal | Wrapper needed because `handleAdd` is async and we want to close after add |
| 3 | `src/config/version.ts` | Bump `APP_VERSION` to `1.6.0`; add `"1.6.0"` entry to `CHANGELOG` record | Semver: minor bump — significant new capability (search architecture, NLP, filters) |
| 4 | `CHANGELOG.md` | Add `## [1.6.0]` section with all Search Overhaul bullets | Covers: two-tab architecture, search workspace, NLP parser, filter badge, autocomplete, category chips, sidebar filters, CardModal search context, in-deck indicator |
| 5 | `BACKLOG.md` | Close #72 and #26 in Active Milestone; add 9 new Pipeline items from design session capture | New items cover: search list view, deck health panel, hold-to-peek, price "Any" toggle, filter deselect-all, color chip tinting, highlight added cards on deck switch, emoji deck names. Note: filter badge coloring (#72 adjacent) already shipped in Prompt 3 |
| 6 | `CLAUDE.md` | Update Active Milestone to reflect completion; add new files to File Structure (`nlpParser.ts`, `SearchWorkspace.tsx`, `SearchBar.tsx`, `CategoryChips.tsx`, `FilterPanel.tsx`); add Key Technical Notes for NLP parser, sidebar filter query builder, autocomplete endpoint | Version bump to 1.6.0 |

### Key Design Decisions

- **`previewCard` for add action:** In Swap Art tab, `previewCard` holds whichever variant the user last clicked. Passing `previewCard` to `onAddToDeck` means "add this printing" — consistent with how Confirm Art Swap works today.
- **No active deck guard:** Rather than add a disabled state for no-deck, rely on `onAddToDeck` being undefined when no deck is active. The button can be hidden/disabled if the prop is absent, matching the overlay button's implicit behavior (always has active deck in practice).
- **Modal auto-close after add:** Closes via `setSelectedCard(null)` in the wrapper inside `SearchWorkspace`. CardModal itself doesn't own close-after-add logic — keeps the component clean.
- **Deck context unchanged:** `Workspace.tsx` does not pass `context` — defaults to `'deck'`. Existing "Confirm Art Swap" button behavior and `onSwap` prop fully preserved.
- **Version 1.6.0:** Four-prompt search overhaul is a full minor release. Search workspace, NLP, filters, and chips constitute a significant new capability surface.

---

## Testing Checklist — Prompt 4

### CardModal — Search Context
- [x] Clicking a card in the search grid opens CardModal with "+ Add to Deck" button (blue, not "Confirm Art Swap")
- [x] Clicking "+ Add to Deck" on the Details tab adds the current printing and closes the modal
- [x] Toast fires after adding: "Added {name} to {deck}"
- [x] Switching to Swap Art tab, selecting a variant, then clicking "+ Add to Deck" adds the selected variant printing - slight behavior that may or maynot be desirable. when a variant is added to the deck with an existing carfd, it doesn't override the previous existing card, but adds a new card with the new variant. in deck view when you swap art, it usually overrides the current card with that art variant. but it is somewhat cool to have 2 of the same cards show up in 2 different card tiles, but have 2 different art. not sure wha tto do here.
- [x] Toast fires after adding variant: "Added {name} to {deck}"
- [x] Adding a card already in the deck increments qty and shows "(×N)" toast
- [x] Modal closes automatically after a successful add - Also after adding the variant to the deck, the cardModal closes. we might want to keep this open so the user can add multiple or choose another different variant. that would mimic the behavior of the CardModal on the deck view.eg closes to details view.

### CardModal — Deck Context (Regression)
- [x] Clicking a card in deck view opens CardModal with "Confirm Art Swap" button (unchanged)
- [x] Confirm Art Swap disabled when no variant is selected (same as before)
- [x] Confirm Art Swap enabled when a different variant is selected in Swap Art tab
- [x] Confirm Art Swap swaps the card's art and closes to details view (unchanged)

---

## Plan Review — Prompt 1 (archived)

_Prompt 1 plan review archived. See CHANGELOG for session summary._

---

## Plan Review — Prompt 3

⚠️ **Complexity flag active** — 8 files touched, 2 new components. Per workflow rules, sync this REVIEW.md to Claude Chat for cross-check before typing PROCEED.

| # | File | Change | Notes |
|---|------|--------|-------|
| 1 | `src/app/page.tsx` | **Bug 1**: Change decks wrapper from `flex-1 flex flex-col p-4 md:p-8` → `flex-1 overflow-hidden p-4 md:p-8` (remove `flex flex-col` so Workspace's `h-full` resolves via block percentage, not flex override); lift `activeChipId`, `activeChipQuery`, `sidebarFilters` state; pass to Sidebar + SearchWorkspace | Root cause of deck scroll bug: `flex flex-col` on the wrapper made Workspace a flex item, overriding `h-full` and removing the height constraint that `flex-1 overflow-y-auto` inside Workspace depends on |
| 2 | `src/components/layout/Sidebar.tsx` | Add `activeChipId`, `onChipSelect`, `sidebarFilters`, `onFiltersChange` props; pass down to SidebarSearchTab | Thread-through only — no logic in Sidebar itself |
| 3 | `src/components/layout/SidebarSearchTab.tsx` | Replace placeholder with CategoryChips + FilterPanel; accept all chip/filter props from Sidebar; get `activeDeck?.format` from `useDeckManager` context directly | SidebarSearchTab can read `activeDeck` from context without it being passed from page.tsx |
| 4 | `src/components/layout/CategoryChips.tsx` | **NEW** — chip bar with format-filtered categories; `CATEGORIES` data array with `id`, `label`, `icon`, `query`, `formats`; active chip styled blue; click calls `onSelectChip(id, query)` | Formats: `['Commander']`, `['Standard']`, `['Freeform']`, `['all']`. Falls back to Freeform categories when format is null/freeform |
| 5 | `src/components/layout/FilterPanel.tsx` | **NEW** — price range (text inputs + visual bar), rarity toggles, type toggles, color toggles (mana pip icons); export `buildSidebarFilterSyntax(filters)` pure function; only appends syntax when some toggles are OFF | Default state = all on = no syntax appended. Price only appends when not at defaults (min>0 or max<100) |
| 6 | `src/components/workspace/SearchBar.tsx` | **Bug 3**: Add `Enter` to the onKeyDown handler that calls `onDismissAutocomplete`; **polish**: add format-aware coloring to filter badge (commander=gold, standard=blue, freeform=neutral-300/border-neutral-600 to distinguish from inactive gray) | Bug 2 fix is in SearchWorkspace, not SearchBar — SearchBar already renders based on `showAutocomplete` prop |
| 7 | `src/components/workspace/VisualCard.tsx` | **Fix 4**: change `opacity-60` → `opacity-40` on in-deck cards in search mode | Match deck view's fully-owned card opacity |
| 8 | `src/components/workspace/SearchWorkspace.tsx` | **Bug 2**: Replace derived `showAutocomplete` with explicit `[showAutocomplete, setShowAutocomplete]` state — opened when user types ≥2 chars or suggestions arrive, closed on dismiss/Enter/select/clear; accept `activeChipId`, `activeChipQuery`, `sidebarFilters` props; extend `scryfallQuery` memo to combine format filter + chip-or-NLP + sidebar filter syntax; `useEffect` on `activeChipQuery` to clear search input when chip activates; deactivate chip on user type | `onDeactivateChip` prop (from page.tsx) called when user types while a chip is active. "Re-activate chip on clear" is deferred — clear goes to empty state, user can re-click chip |

### Key Design Decisions

- **Bug 1 root cause confirmed:** `flex flex-col` on the decks wrapper makes Workspace a flex item; flex sizing overrides `h-full`; Workspace's outer div expands to content size; `flex-1 overflow-y-auto` inside has no height ceiling → no scroll.
- **Bug 2 root cause confirmed:** `showAutocomplete = query.length >= 2 && (suggestions.length > 0 || parsed.tokens.length > 0)`. After `onDismissAutocomplete` clears suggestions, `parsed.tokens.length` can still be > 0 (raw query text unchanged) → condition stays true → dropdown stays open. Fix: explicit state.
- **Filter badge coloring:** Format-specific active colors. Freeform uses a slightly brighter neutral (border-neutral-600, text-neutral-300) rather than blue or gray, so it reads as active while being visually distinct from Standard (blue) and Commander (gold).
- **`activeChipQuery` vs. chip lookup:** page.tsx stores both `activeChipId` and `activeChipQuery` so SearchWorkspace gets the query directly without importing CATEGORIES data.
- **Sidebar filter state in page.tsx:** Filters persist across tab switches (same as search persistence). Reset to defaults on deck change (handled via `useEffect` on `activeDeck?.id` in SearchWorkspace, or page.tsx watching deck changes — use SearchWorkspace's existing deck-change effect).
- **`buildSidebarFilterSyntax` exported from FilterPanel.tsx:** SearchWorkspace imports and uses it to build the sidebar filter portion of the final Scryfall query.

---

## Testing Checklist — Prompt 3

### Bug Fixes (Carry-Forward from Prompt 2 QA)
- [x] **Bug 1 — Deck scroll:** Switch to Decks tab → deck workspace scrolls normally with many cards
- [x] **Bug 2 — Parsed bar persists:** Type "black creatures" → tokens appear → press Escape → autocomplete/parsed bar closes; stays closed unless user types again
- [x] **Bug 3 — Enter dismisses autocomplete:** Type 2+ chars → autocomplete opens → press Enter → dropdown closes
- [x] **Fix 4 — Opacity:** Cards already in the active deck show at ~40% opacity in search grid (visibly more dimmed than before); green dot remains at full opacity

### Filter Badge Coloring
- [x] Active Commander deck: badge is gold (yellow-400)
- [x] Active Standard deck: badge is blue (blue-400)
- [x] Active Freeform deck: badge is light neutral (neutral-300, border-neutral-600) — reads as active but distinct from Standard blue
- [x] Inactive badge (toggled off): always gray (neutral-500) regardless of format

### Category Chips
- [x] Sidebar Search tab shows "Quick Search" chip bar above the filters
- [x] Chips visible for Freeform/no deck: Ramp, Removal, Card Draw, Wipes, Tokens, Creatures (no Commander-only or Standard-only chips)
- [x] Chips visible for Commander deck: includes Counters, Tutors, Lands in addition to universal chips
- [x] Chips visible for Standard deck: includes Burn in addition to universal chips
- [x] Clicking a chip highlights it blue and triggers search results in the workspace
- [x] Clicking the same chip again deactivates it (chip goes back to gray, results clear)
- [x] When a chip is active, typing in the search bar deactivates the chip and switches to NLP/text search
- [x] Switching decks: active chip remains (filter state persists across deck switches)

### Sidebar Filters (FilterPanel)
- [x] Price range: default shows $0–$100; adjusting min/max text inputs updates the visual bar
- [x] Clicking the visual bar sets the priceMax to the clicked position
- [x] Rarity toggles: all 4 on by default; clicking one deactivates it (goes gray); clicking again reactivates
- [x] With a rarity deactivated: search results exclude that rarity
- [x] With all rarities off: no rarity syntax appended (graceful — all results returned)
- [x] Card type toggles: all 7 on by default; toggling one off filters results to only the remaining types
- [x] Color toggles: all 6 on by default; mana pip icons shown; toggling off filters by color - would be nice if the chip matched the colors.
- [x] Default state (all filters at defaults): no sidebar filter syntax appended to Scryfall query
- [x] Filters persist when switching between Search and Decks tabs

### Query Composition
- [x] Active chip + sidebar filters: chip query AND sidebar filter syntax both applied
- [x] NLP tokens + sidebar filters: NLP syntax AND sidebar filter syntax both applied
- [x] Format filter badge + chip + sidebar filters: all three combined correctly
- [x] All three active: correct combined Scryfall query fires, results are properly filtered

### Regression: Prompt 2 Features
- [x] NLP parsing still works (type "red flying creatures" → tokens inline in search bar)
- [x] Autocomplete still works (2+ chars → dropdown with card name suggestions)
- [x] Filter badge still shows and toggles
- [x] Toast still fires on add/duplicate add

### Phi notes
- price slider should have a toggle for 'any' search any price. eg no limit
- filter chips might benefit for a deselect all? so that you can toggle search for one chip in the group quickly by deselcting all then activating the chip filter of that one item.
- claude code forgot to append the testing in review.md. I prompted again to give me that. not sure why it skipped that step.
- because we have 2 tab system now, we lose the gold outline that was there when a card was added, and the scroll to the card that was added. I wonder if we can do something about that here so that when you switch back to deck view you know where the newly cards that were added are? this might be a nice to have lo priority feature for the backlog.

---

## Testing Checklist — Prompt 2

### Carry-Forward Fixes
- [x] **Fix 1 — Search persistence:** Type a query, switch to Decks tab, switch back to Search — query and results are still there
- [x] **Fix 2 — Opacity dim:** Cards already in the active deck show at ~60% opacity in the search grid; green dot remains at full opacity - this works, but we should reduce the opacity more so its more noticable. maybe match the full owned opacity from deck view?
- [x] **Fix 3 — Toast feedback:** Adding a card shows `"Added {name} to {deck}"` toast; adding a duplicate shows `"Added {name} to {deck} (×2)"` etc. Toast dismisses after 2s; rapid adds clear the previous toast

### NLP Parser
- [x] Typing "black creatures" → tokens show `color: Black` and `type: Creature` inline in the search bar; results are black creatures
- [x] Typing "flying red" → tokens show `kw: Flying` and `color: Red`; results are red cards with flying
- [x] Typing "ramp" → token shows `archetype: Ramp`; results are ramp cards
- [x] Typing "under $3" → token shows `price: < $3`; results are cards under $3
- [x] Typing "under 3 mana" → token shows `cmc: ≤ 3` (NOT price); results are 3-CMC-or-less cards
- [x] Typing "budget" → token shows `price: < $2`
- [x] Clicking a token chip removes it; the matched word is stripped from the raw input; results update
- [x] Non-NLP text (e.g. "lightning bolt") passes through as remainder and searches normally
- [x] Mixed input (e.g. "red instant removal") → multiple tokens + any remainder all combine into one Scryfall query
- note - the parser works, but creates another row of the tokens right below the search that says parsed: [token] it covers the search results and sort buttons. I think this has to do with autocomplete below. the bar stays after blurring off, wondering if we should keep it in the search bar in line or not here?

### Filter Badge
- [x] Filter badge shows in the search bar with the active deck's format ("Freeform", "Standard", "Commander") - would be nice if the coloring of the badge matched the colors of the deck format (commander - gold; standard - blue; freeform - gray) but the freeform may look like its inactive by default since gray toggles inactive.
- [x] Commander format with a commander set: badge shows commander's mana color pips
- [x] Badge is blue/active by default; clicking the badge or × toggles it off (gray/inactive)
- [x] With filter off: search results include cards from all formats/identities
- [x] With filter on in Standard: results are legal:standard cards
- [x] With filter on in Commander with a WUB commander: results are legal:commander id<=WUB cards
- [x] Filter resets to active when switching to a different deck
- [ ] No active deck: no filter badge shown - there is never an active deck, can't QA test

### Autocomplete
- [x] Typing 2+ characters shows autocomplete dropdown with up to 5 card name matches
- [x] Cards already in the active deck show a green dot in the autocomplete list
- [x] Clicking an autocomplete suggestion fills the search input with that name and closes the dropdown
- [x] Pressing Escape closes the dropdown
- [x] Clicking outside the search bar closes the dropdown
- [x] Autocomplete section "Parsed:" shows current NLP tokens with ability to click-remove them
- [x] Dropdown does not appear when fewer than 2 characters are typed

### Regression: Deck View
- [x] Switching to Decks tab: full deck workspace renders, toolbar intact
- [x] All deck operations (add/remove/qty/owned) still work normally

### notes from phi
- pressing enter on after search query doesn't remove the autocomplete dropdown. clicking off the mouse does however.
- scrolling in deck view is no longer available.search view is able to scroll
---

## Prompt 1 Plan Review (for reference)

| # | File | Change | Notes |
|---|------|--------|-------|
| 1 | `src/app/page.tsx` | Lift `sidebarActiveTab` state here; conditionally render `<SearchWorkspace>` vs `<Workspace>` + import modal area based on tab; pass `activeTab`/`onTabChange` down to `<Sidebar>` | Currently `activeTab` lives inside `Sidebar.tsx` — must be lifted so the workspace area can switch views |
| 2 | `src/components/layout/Sidebar.tsx` | Remove internal `activeTab` state and its localStorage load; accept `activeTab: "search" \| "decks"` and `onTabChange` as props; pass through to tab buttons | localStorage write for the tab key stays here since it's a sidebar concern |
| 3 | `src/components/layout/SidebarSearchTab.tsx` | Gut all search logic (query state, debounce, category dropdown, results list, hover preview, `handleAddCard`); replace body with placeholder `<p>` | Keep the component file — Prompt 3 will rebuild it with CategoryChips + FilterPanel |
| 4 | `src/components/workspace/VisualCard.tsx` | Add `mode?: "deck" \| "search"` prop (default `"deck"`); in `mode="search"`: render search overlay (card name, type, price, "+ Add to Deck" button) + green in-deck dot instead of qty controls; all deck-mode behavior unchanged | Option A from spec — cleaner than a separate wrapper component |
| 5 | `src/components/workspace/SearchWorkspace.tsx` | **NEW** — two-row toolbar (SearchBar + results count/sort/view toggles) + auto-fill card grid; owns `searchQuery`, `results`, `isLoading` state; calls `searchCards()` with 500ms debounce; calls `updateActiveDeck` + `setLastAddedId` from context for add; manages local `selectedCard` state + renders `<CardModal>` | Mirrors the add-card logic currently in `SidebarSearchTab.tsx` |
| 6 | `src/components/workspace/SearchBar.tsx` | **NEW** — prop-driven search input: `query`, `onChange`, `onClear`; Search icon, input, conditional X clear button; `autoFocus` + ref for re-focus on tab switch | Kept minimal — Prompt 2 extends it with filter badge, NLP tokens, autocomplete |

### Key Design Decisions

- **State lifting:** `activeTab` moves from `Sidebar.tsx` internal state → `page.tsx` prop. `page.tsx` reads from localStorage on mount (same key: `mtg-sidebar-active-tab`), writes on change. Sidebar no longer reads/writes this key independently.
- **`handleAddCard` in SearchWorkspace:** Duplicates the price-rescue + `updateActiveDeck` + `setLastAddedId` pattern from `SidebarSearchTab.tsx`. This is intentional — the sidebar search tab is being gutted, and the search workspace owns the add logic going forward.
- **CardModal in SearchWorkspace:** `selectedCard` state and `<CardModal>` rendered locally inside `SearchWorkspace`, matching the existing pattern in `Workspace.tsx`. No modal state lifted to `page.tsx`.
- **`main` wrapper in `page.tsx`:** The existing `<main>` has `p-4 md:p-8` padding. `SearchWorkspace` manages its own internal padding, so no wrapper change needed — the search toolbar will sit flush against the `main` boundary, which is correct for a full-width workspace.
- **VisualCard `mode="search"`:** No qty pill, no remove button, no crown badge. Green in-deck dot at top-left (`absolute top-1.5 left-1.5`, `w-2 h-2 bg-green-500 ring-2 ring-neutral-950`). Hover overlay: card name, type line (truncated), price, "+ Add to Deck" button centered.

---

---

## Testing Checklist — Prompt 1: Foundation

### Tab Switching
- [x] Search tab active by default on first load (no localStorage key set)
- [x] Click Decks tab → deck workspace renders, Search tab shows Decks selected
- [x] Click Search tab → search workspace renders, Decks tab shows Search selected
- [x] Tab selection persists across page refresh (localStorage `mtg-sidebar-active-tab`)
- [x] Collapsed sidebar rail: clicking Search icon expands sidebar to Search tab + shows SearchWorkspace
- [x] Collapsed sidebar rail: clicking Decks icon expands sidebar to Decks tab + shows deck workspace
- [x] SidebarSearchTab shows placeholder text "Search for cards using the search bar above" when Search tab is open - there is no search bar above, it is now in the main workspace.

### Search Bar & Results
- [x] Search input auto-focuses when Search tab is active
- [x] Typing a query triggers search after ~500ms debounce
- [x] Results appear as a card grid (auto-fill, ~175px min width)
- [x] "X results" count updates in toolbar row 2
- [x] Clear button (×) appears when query is non-empty; clears input and resets results
- [ ] Empty state: "Type something to search cards" shown when no query - empty states shows "search for cards, types, keywords" but this is acceptable.
- [x] No-results state: "No cards found for ..." shown when query returns 0 results
- [x] Loading spinner shown while fetching

### Card Tiles (Search Mode)
- [x] Each tile shows card art filling the aspect-ratio container
- [x] Hover reveals slide-up overlay with: card name, type line, price, "+ Add to Deck" button
- [x] Card click (not on overlay button) opens CardModal with card details
- [x] CardModal closes with × button
- [x] Green dot appears at top-left of tiles for cards already in the active deck - if its easy I think a subtle opacity dimming of the card for this would be nice. 

### Add to Deck
- [x] "+ Add to Deck" button adds card to active deck (main by default) - also while testing, switching to deck view to see what deck is active, reset the search query. I wonder if we should retain this if its beneficial? my actions were: search rats > click add to deck > switch to decks to see if rats was added > switch back to search > empty search. need to type rats again to see original results.
- [x] Adding a card already in the deck increments its quantity - it does but there's no feedback that I added a card a second time. 
- [ ] Price rescue fires for $0.00 cards (may be hard to verify visually — can test with known $0.00 card)
- [ ] No active deck: button does nothing / no crash - I don't think there's a way to NOT have an active deck? 
- [x] Switch to Decks tab after adding — card appears in deck workspace

### Deck Workspace Unchanged
- [x] Switching to Decks tab: WorkspaceToolbar renders (deck name, format badge, stats, controls)
- [x] Grid view, list view, sort, group — all function normally on Decks tab
- [x] Simulator button works on Decks tab
- [x] Import/export still works from Decks tab
- [x] No visual regressions in deck card overlays (qty controls, owned counter, remove button)

### Mobile (below md breakpoint) - unable to test yet until mobile is implemented in 2.0
- [ ] Tab bar visible in top sidebar area on mobile
- [ ] Search tab on mobile: search workspace renders below sidebar
- [ ] Decks tab on mobile: deck workspace renders below sidebar

---

## How This File Works
This file is the live session journal shared between Phi, Claude Chat, and Claude Code.
- **Claude Code writes:** Plan review table, testing checklist, session summary — committed only at session end
- **Phi writes:** Test results (checking boxes), inline comments on failures, emerging issues during QA
- **Claude Chat reads:** Verifies plan review, triages failures, incorporates findings into next Claude Code prompt
- Never committed to git mid-session — only in the final commit alongside CLAUDE.md and CHANGELOG.md
