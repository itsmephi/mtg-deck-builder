# REVIEW.md — MTG Deck Builder Session Journal

---

## v1.12.2 — Quick Bug Fixes
Status: APPROVED ✅

### Plan Review

| File | Changes |
|---|---|
| `src/components/layout/Sidebar.tsx` | #75: seamless physical tab treatment — active tab blends into sidebar body, inactive recesses with `bg-surface-deep`; removed blue indicator bar; collapse + gear icons recessed to match |
| `src/components/workspace/SearchWorkspace.tsx` | #76: added `SORT_ORDER_MAP`, `sortOrder` state (default `price_desc`), wired `<select>` onChange, appended sort clause to `scryfallQuery`, explicit `order:usd` in price-rescue call |
| `src/lib/scryfall.ts` | #76: removed hardcoded `order:usd` from `searchCards` — sort now fully caller-controlled |
| `BACKLOG.md` | discarded #74 (GitHub issue #74 closed); #75 and #76 marked closed; new Pipeline item for sort direction toggle |

---

### Testing Checklist

**#75 — Sidebar tabs**
- [ ] Warm Stone: active tab matches sidebar body (`bg-surface-panel`); inactive is darker (`bg-surface-deep`)
- [ ] Zed Dark: same behavior with Zed palette
- [ ] Tab switching: active/inactive backgrounds swap correctly
- [ ] Inactive hover: bg lifts to `bg-surface-panel`, text brightens to `text-content-secondary`
- [ ] Collapse button (desktop): recessed `bg-surface-deep`, hover brightens icon
- [ ] Mobile: gear icon recessed, tabs behave identically
- [ ] No blue underline bar visible on either theme

**#76 — Sort**
- [ ] Default: sort select shows "Price ↓" and results are sorted by price descending
- [ ] "Sort: Relevance" — no order clause; Scryfall returns by relevance
- [ ] "Name" — results sorted alphabetically
- [ ] "Price ↑" — sorted ascending by price
- [ ] "Mana Value" — sorted by CMC
- [ ] "Color" — sorted by color
- [ ] Adding a $0.00 card still triggers rescue and returns a priced printing
- [ ] Sort persists when query changes within a session

---

### Session Summary

**What shipped:**

- **`src/components/layout/Sidebar.tsx`** — tab bar container loses `border-b border-line-subtle`; tab buttons switch from `border-b-2` to `border-b`; active state is `bg-surface-panel text-content-primary border-transparent` (blends into sidebar body, transparent bottom border breaks the line); inactive state is `bg-surface-deep text-content-muted border-line-subtle hover:bg-surface-panel hover:text-content-secondary` (recessed shelf with visible bottom edge, lifts on hover); collapse button and mobile gear icon gain `bg-surface-deep border-b border-line-subtle` to match the recessed row; `ml-auto` removed from mobile gear button
- **`src/lib/scryfall.ts`** — removed hardcoded `order:usd` appended in `searchCards`; sort fully caller-controlled
- **`src/components/workspace/SearchWorkspace.tsx`** — `SORT_ORDER_MAP` maps 6 sort options to Scryfall inline syntax; `sortOrder` state defaults to `"price_desc"`; `<select>` wired to onChange; sort clause appended to `scryfallQuery` useMemo; price-rescue call explicitly appends `order:usd`
- **`BACKLOG.md`** — #74 discarded (GitHub issue closed); #75 and #76 closed v1.12.2; new Pipeline item for sort direction toggle (asc/desc outside dropdown, matching deck view UX)

**Closed from backlog:** `bug | Sidebar tabs raised appearance + missing indicator (#75)` · `bug | Sort broken in search view (#76)`

---

## How This File Works
This file is the live session journal shared between Phi, Claude Chat, and Claude Code.
- **Claude Code writes:** Plan review table, testing checklist, session summary — committed only at session end
- **Phi writes:** Test results (checking boxes), inline comments on failures, emerging issues during QA
- **Claude Chat reads:** Verifies plan review, triages failures, incorporates findings into next Claude Code prompt
- Never committed to git mid-session — only in the final commit alongside CLAUDE.md and CHANGELOG.md
