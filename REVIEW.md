# REVIEW.md — MTG Deck Builder Session Journal

---

## v1.10.0 — Design Tokens: Layout Components (Prompt 2 of 3)
Status: IN PROGRESS

### Plan Review

| File | Changes |
|---|---|
| `src/components/layout/Sidebar.tsx` | `bg-neutral-900` → `bg-surface-base`; `bg-neutral-800` → `bg-surface-raised`; `bg-neutral-700` → `bg-surface-overlay`; `border-neutral-800` → `border-subtle`; `border-neutral-700` → `border-default`; `text-white` → `text-primary`; `text-neutral-600` → `text-faint`; `text-neutral-500` → `text-muted`; `text-neutral-400` → `text-tertiary`; `text-neutral-300` → `text-secondary`; leave `border-neutral-500` (flagged), opacity variants, accent colors |
| `src/components/layout/SidebarRail.tsx` | `bg-neutral-900` → `bg-surface-base`; `bg-neutral-800` → `bg-surface-raised`; `border-neutral-700` → `border-default`; `text-white` → `text-primary`; `text-neutral-500` → `text-muted`; `text-neutral-200` → `text-heading` |
| `src/components/layout/SidebarDecksTab.tsx` | `bg-neutral-900` → `bg-surface-base`; `bg-neutral-800` → `bg-surface-raised`; `bg-neutral-700` → `bg-surface-overlay`; `border-neutral-800` → `border-subtle`; `border-neutral-700` → `border-default`; `text-white` → `text-primary`; `text-neutral-600` → `text-faint`; `text-neutral-500` → `text-muted`; `text-neutral-400` → `text-tertiary`; `text-neutral-300` → `text-secondary`; leave `text-neutral-700` (flagged), opacity variants, accent colors |
| `src/components/layout/SidebarSearchTab.tsx` | No color classes — no changes |
| `src/components/layout/CardModal.tsx` | `bg-black/80` → `bg-surface-backdrop`; `bg-neutral-900` → `bg-surface-base`; `bg-neutral-800` → `bg-surface-raised`; `bg-neutral-700` → `bg-surface-overlay`; `border-neutral-800` → `border-subtle`; `border-neutral-700` → `border-default`; `text-white` → `text-primary`; `text-neutral-600` → `text-faint`; `text-neutral-500` → `text-muted`; `text-neutral-400` → `text-tertiary`; `text-neutral-300` → `text-secondary`; `text-neutral-200` → `text-heading`; leave `bg-black/90`, `border-neutral-600` (flagged), `bg-neutral-900/50`, accent colors |
| `src/components/layout/SampleHandModal.tsx` | `bg-black/80` → `bg-surface-backdrop`; `bg-neutral-900` → `bg-surface-base`; `bg-neutral-800` → `bg-surface-raised`; `bg-neutral-700` → `bg-surface-overlay`; `border-neutral-800` → `border-subtle`; `border-neutral-700` → `border-default`; `text-white` → `text-primary`; `text-neutral-600` → `text-faint`; `text-neutral-500` → `text-muted`; `text-neutral-400` → `text-tertiary`; `text-neutral-300` → `text-secondary`; leave `text-neutral-700` (flagged), `bg-neutral-900/30`, accent colors |
| `src/components/layout/FormatPicker.tsx` | `hover:bg-neutral-800` → `hover:bg-surface-raised`; `text-neutral-200` → `text-heading`; `text-neutral-500` → `text-muted`; leave `bg-neutral-800/50` (opacity variant), `bg-neutral-500/10` (opacity variant) |
| `src/components/layout/CategoryChips.tsx` | `border-neutral-800` → `border-subtle`; `text-neutral-600` → `text-faint`; `bg-neutral-800` → `bg-surface-raised`; `border-neutral-700` → `border-default`; `text-neutral-400` → `text-tertiary`; `text-neutral-200` → `text-heading`; leave `hover:border-neutral-600` (flagged) |
| `src/components/layout/FilterPanel.tsx` | `bg-neutral-800` → `bg-surface-raised`; `bg-neutral-700` → `bg-surface-overlay`; `border-neutral-700` → `border-default`; `text-neutral-500` → `text-muted`; `text-neutral-400` → `text-tertiary`; `text-neutral-300` → `text-secondary`; migrate stone drift: `bg-stone-707/40` → `bg-surface-overlay`, `border-stone-400/50` → `border-default`, `text-stone-300` → `text-secondary`; leave `border-neutral-500/50`, `border-neutral-500/40` (opacity variants), accent colors |

9 files reviewed, 8 modified. No new components.

### Flagged Classes (not migrated — noted for evaluation)

| Class | Count in scope | Location & role |
|---|---|---|
| `text-neutral-100` | 0 in layout | Workspace files only — deferred to prompt 3 |
| `text-neutral-700` | 2 in layout | SidebarDecksTab L227: layers icon (no-sideboard grayed state); SampleHandModal L413: depleted-library AlertCircle icon. Darker than `text-faint` (#525252) — no direct token match yet |
| `border-neutral-600` | 2 in layout | CardModal L444: spinner border (`border-t-neutral-400`); CategoryChips: `hover:border-neutral-600`. Mid-tone gap between `border-default` (#404040) and token-less `neutral-600` (#525252) |
| `border-neutral-500` | 1 in layout | Sidebar sort-direction hover: `hover:border-neutral-500`. No token mapped for `neutral-500` border |
| `bg-neutral-600` | 0 in layout | VisualCard.tsx (workspace) — deferred to prompt 3 |
| `bg-neutral-950` | 0 in layout | SearchBar.tsx (workspace) — deferred to prompt 3 |

---

## v1.10.0 — Design Tokens: Foundation + Page Shell (Prompt 1 of 3)
Status: APPROVED ✅

### Plan Review

| File | Change |
|---|---|
| `src/app/globals.css` | Replace `--background`/`--foreground` vars with 12 semantic design tokens in `:root`; register all tokens in `@theme inline` block so Tailwind generates utility classes; update `body` rule to use `--surface-base`/`--text-primary`; keep `prefers-color-scheme: dark` block referencing same token values; update hardcoded scrollbar hex values to reference new tokens |
| `src/app/page.tsx` | Replace `bg-neutral-900` → `bg-surface-base`, `text-neutral-200` → `text-heading` on root shell div |
| `src/app/layout.tsx` | No hardcoded color classes present — no changes needed |

3 files reviewed, 2 modified. No new components.

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
