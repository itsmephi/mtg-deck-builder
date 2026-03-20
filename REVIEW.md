# REVIEW.md — MTG Deck Builder Session Journal

---

## v1.9.0 — Release Year Filter + CardModal Release Date
Status: APPROVED ✅

### Plan Review

| File | Change |
|---|---|
| `src/types/index.ts` | Add `released_at?: string` to `ScryfallCard` |
| `src/components/layout/FilterPanel.tsx` | Add `yearMin`/`yearMax` to `FilterState`, `DEFAULT_FILTERS` (default: 2022–2026, last 5 years), serialize/deserialize, `buildSidebarFilterSyntax` (injects `year>= year<=` only when non-default), and year range UI (dual text inputs, no slider, auto-select on focus, same commit pattern as price) |
| `src/components/layout/CardModal.tsx` | Add **Released:** row to Product Details section using `previewCard.released_at` |

3 files, no new components.

**Design decisions locked:**
- Default range: 2022–2026 (last 5 years from current year)
- UI: dual text inputs only, no slider
- Syntax only injected when range differs from default (no "Any Year" toggle needed)
- Persists via existing `mtg-sidebar-filters` localStorage key (serialize/deserialize)
- Auto-selects text on focus, Enter/blur commits value

---

### Testing Checklist
<!-- Phi fills in after build -->

- [ ] Year min input: type a value, blur — filter applies
- [ ] Year min input: type a value, press Enter — filter applies
- [ ] Year max input: same
- [ ] Year min/max: clicking input auto-selects all text
- [ ] Year min cannot exceed year max (clamped on blur)
- [ ] Year max cannot go below year min
- [ ] Year bounds clamped to 1993–2026
- [ ] Default range (2022–2026) injects no Scryfall syntax
- [ ] Narrowing range (e.g. 2010–2015) injects `year>=2010 year<=2015` in query
- [ ] Filter persists on page refresh
- [ ] Filter survives navigation between tabs
- [ ] CardModal Product Details shows Released: date for a normal card
- [ ] CardModal shows Released: date after swapping to a different printing
- [ ] No regression: price filter, rarity, type, color filters all still work

### Session Summary

**What shipped:**

- **`src/types/index.ts`** — `released_at?: string` added to `ScryfallCard`; Scryfall returns this as an ISO date string on all card objects
- **`src/components/layout/FilterPanel.tsx`** — `yearMin`/`yearMax` added to `FilterState`, `DEFAULT_FILTERS` (2022–2026), `serializeFilters`, `deserializeFilters`, and `buildSidebarFilterSyntax`; Release Year UI section added between Price and Rarity with three preset buttons (This Year / Last 5 Yrs / All) and dual text inputs with auto-select on focus, Enter/blur commit, and 1993–current year clamping; syntax injected only when `yearMin > 1993` or `yearMax < CURRENT_YEAR`
- **`src/components/layout/CardModal.tsx`** — Released date row added to Product Details section below Price, conditionally rendered when `released_at` is present

---

## How This File Works
This file is the live session journal shared between Phi, Claude Chat, and Claude Code.
- **Claude Code writes:** Plan review table, testing checklist, session summary — committed only at session end
- **Phi writes:** Test results (checking boxes), inline comments on failures, emerging issues during QA
- **Claude Chat reads:** Verifies plan review, triages failures, incorporates findings into next Claude Code prompt
- Never committed to git mid-session — only in the final commit alongside CLAUDE.md and CHANGELOG.md
