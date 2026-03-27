# REVIEW.md — MTG Deck Builder Session Journal

---

## v1.14.0 — CardModal & Search Polish
Status: APPROVED ✅

### Plan Review
| File | Changes |
|------|---------|
| `src/components/layout/CardModal.tsx` | Add `onSearchQuery` prop; make artist name clickable (search `a:"name"`); add clickable set code row to Product Details (search `e:code`) |
| `src/components/workspace/SearchWorkspace.tsx` | Wire `onNext`/`onPrev` for results array nav; add `triggerSearch`/`onTriggerSearchConsumed` props; pass `onSearchQuery` to CardModal; add `sortDir` state + localStorage; update sort map; add asc/desc toggle button |
| `src/components/workspace/Workspace.tsx` | Add `onSearchQuery` prop; thread to CardModal |
| `src/app/page.tsx` | Add `pendingSearch` state; wire `onSearchQuery → Workspace` and `triggerSearch → SearchWorkspace` |

### QA Checklist
- [x] Search results: open a card modal — Prev/Next chevrons appear when results exist
- [x] Search results modal: Next navigates to next card in results; Prev to previous
- [x] First result: no Prev button; last result: no Next button
- [x] Single search result: neither Prev nor Next appears
- [x] Keyboard arrow left/right navigates modal while in search context
- [x] CardModal Product Details: set code is shown as a clickable element with hover affordance
- [x] Click set code from search context — modal closes, query updates to `e:{setCode}`, results update
- [x] Click set code from deck context — modal closes, switches to search tab, results show for that set
- [x] CardModal Product Details: artist name is clickable with hover affordance (when artist present)
- [x] Click artist from search context — modal closes, query updates to `a:"artist name"`, results update
- [x] Click artist from deck context — modal closes, switches to search tab, results show for that artist
- [x] Sort direction toggle button appears in search toolbar (arrow up/down icon)
- [x] Default sort direction is desc; toggle switches to asc
- [x] Sort direction persists across page reloads (localStorage `mtg-search-sort-direction`)
- [x] Sort direction toggle is disabled/muted when sort is "Relevance"
- [x] Results re-run when sort direction changes

### Session Summary

**What shipped:**

- **`src/components/layout/CardModal.tsx`** — `onSearchQuery?: (query: string) => void` prop added; artist row now conditional (hidden when no artist field); artist name and set code both rendered as clickable buttons when `onSearchQuery` is present — blue text, underline on hover, `onClose()` called alongside the query; non-clickable fallback kept for deck context without wiring
- **`src/components/workspace/SearchWorkspace.tsx`** — `triggerSearch`/`onTriggerSearchConsumed` props for cross-context search trigger; `suppressAutocompleteRef` prevents autocomplete from opening on programmatic query sets; `onNext`/`onPrev` wired to `results[]` index for CardModal nav; `sortDir` state (`"asc"` | `"desc"`) from localStorage `mtg-search-sort-direction` (default `"desc"`); asc/desc toggle button matching WorkspaceToolbar pattern; `SORT_ORDER_MAP` collapsed `price_asc`/`price_desc` into single `price` + direction clause; search loading spinner fixed `border-t-tertiary` → `border-t-blue-400`
- **`src/components/workspace/Workspace.tsx`** — `onSearchQuery` prop added and threaded to CardModal
- **`src/app/page.tsx`** — `pendingSearch` state; `onSearchQuery` wired to Workspace (sets pending + switches tab); `triggerSearch`/`onTriggerSearchConsumed` wired to SearchWorkspace
- **`src/config/version.ts`** — bumped to `1.14.0`; v1.14.0 changelog entry added

**Carry-forward fixes (mid-QA):** search spinner unmapped token; autocomplete opening on programmatic set/artist searches

**Items not in this spec (carry to v1.15.0):** #78 Submit a Bug button · #79 auto-match format badge

---

## How This File Works
This file is the live session journal shared between Phi, Claude Chat, and Claude Code.
- **Claude Code writes:** Plan review table, testing checklist, session summary — committed only at session end
- **Phi writes:** Test results (checking boxes), inline comments on failures, emerging issues during QA
- **Claude Chat reads:** Verifies plan review, triages failures, incorporates findings into next Claude Code prompt
- Never committed to git mid-session — only in the final commit alongside CLAUDE.md and CHANGELOG.md
