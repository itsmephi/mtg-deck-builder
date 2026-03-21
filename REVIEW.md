# REVIEW.md — MTG Deck Builder Session Journal

---

## v1.10.0 — Design Tokens: Workspace Components (Prompt 3 of 3)
Status: IN PROGRESS — awaiting QA

### Plan Review

| File | Changes |
|---|---|
| `src/components/workspace/Workspace.tsx` | `bg-neutral-900` → `bg-surface-base` (root div); `text-neutral-500` → `text-muted` (init text, group headers); `text-white` → `text-primary` (confirm dialog); `text-neutral-400` → `text-tertiary` (confirm dialog body); `bg-neutral-900 border border-neutral-700` → `bg-surface-base border border-line-default` (confirm dialog panel); `border-neutral-700` → `border-line-default` (tooltip); leave `border-neutral-700/30` (commander divider — opacity variant); leave `bg-black/60` (confirm backdrop — opacity variant) |
| `src/components/workspace/WorkspaceToolbar.tsx` | `border-neutral-800` → `border-line-subtle` (bottom border); `text-white` → `text-primary` (name input); `border-neutral-700` → `border-line-default` (name input hover, format picker popup); `bg-neutral-900 border border-neutral-700` → `bg-surface-base border border-line-default` (format picker dropdown); `text-neutral-400` → `text-tertiary` (stats row); `text-neutral-200` → `text-heading` (value display); `text-neutral-500` → `text-muted` (labels, M+S); `text-neutral-600` → `text-faint` (SB count); tooltip spans `bg-neutral-800 border border-neutral-700 text-neutral-200` → `bg-surface-raised border border-line-default text-heading`; `bg-neutral-900 border border-neutral-800` → `bg-surface-base border border-line-subtle` (Simulator button, Main/Side + Sort/Group containers); `bg-neutral-800` → `bg-surface-raised` (active toggle, dividers); `text-neutral-300` → `text-secondary` (sort select, inactive toggle states); leave `border-neutral-700/50` (opacity variant); leave `text-neutral-700` flagged disabled states |
| `src/components/workspace/VisualCard.tsx` | `text-white` → `text-primary` (overlay text, qty buttons); `text-neutral-400` → `text-tertiary` (overlay stats, owned count); `text-neutral-300` → `text-secondary` (qty button text); `bg-neutral-900` → `bg-surface-base` (neutral color pill, × remove button); `bg-neutral-800` → `bg-surface-raised` (editing inputs); leave `bg-neutral-700/50` (opacity variant); leave `hover:bg-neutral-600` (flagged); leave `bg-neutral-900/70` (opacity variant) |
| `src/components/workspace/ListCardTable.tsx` | `bg-neutral-900 border border-neutral-800` → `bg-surface-base border border-line-subtle` (table container); `bg-neutral-900 text-neutral-500 border-b border-neutral-800` → `bg-surface-base text-muted border-b border-line-subtle` (thead); qty/owned buttons `bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white` → `bg-surface-raised text-tertiary hover:bg-surface-overlay hover:text-primary`; tooltip `bg-neutral-800 border border-neutral-700 text-neutral-200` → `bg-surface-raised border border-line-default text-heading`; `text-neutral-500` → `text-muted` (name/type cols); `text-neutral-400` → `text-tertiary` (owned/price); `text-neutral-600` → `text-faint` (separator, crown); `hover:bg-neutral-800` → `hover:bg-surface-raised` (qty spans); leave `text-neutral-100` flagged; leave `text-neutral-700` flagged; leave `border-neutral-800/40` (opacity variant) |
| `src/components/workspace/SearchWorkspace.tsx` | `bg-neutral-900 border-b border-neutral-800` → `bg-surface-base border-b border-line-subtle` (header); `bg-neutral-900 border border-neutral-800` → `bg-surface-base border border-line-subtle` (sort select, view button container); `bg-neutral-800 text-white border border-neutral-700/50` → `bg-surface-raised text-primary border border-neutral-700/50` (active view button — leave opacity variant); toast `bg-neutral-800 border border-neutral-700 text-neutral-200` → `bg-surface-raised border border-line-default text-heading`; set match pill `bg-neutral-800 border border-neutral-700` → `bg-surface-raised border border-line-default`; `text-neutral-500` → `text-muted`; `text-neutral-400` → `text-tertiary`; `text-neutral-300` → `text-secondary` (autocomplete); leave `text-neutral-700` flagged disabled; spinner `border-line-default border-t-tertiary` |
| `src/components/workspace/SearchBar.tsx` | `bg-neutral-950` (flagged — leave); `border-neutral-800` → `border-line-subtle`; active freeform badge `border-neutral-600` (flagged — leave); inactive badge `bg-neutral-800 border border-neutral-700` → `bg-surface-raised border border-line-default`; token chips `bg-neutral-800 border border-neutral-700 text-neutral-300` → `bg-surface-raised border border-line-default text-secondary`; input `text-neutral-200` → `text-heading`; placeholder `text-neutral-600` → `text-faint`; clear button `hover:bg-neutral-700` → `hover:bg-surface-overlay`; autocomplete dropdown `bg-neutral-900 border border-neutral-700` → `bg-surface-base border border-line-default`; autocomplete items `hover:bg-neutral-800 hover:text-neutral-100` → `hover:bg-surface-raised hover:text-primary`; `text-neutral-500` → `text-muted`; `text-neutral-300` → `text-secondary` |
| `src/components/workspace/TileSizeSlider.tsx` | Closed state `text-neutral-500 hover:text-neutral-300` → `text-muted hover:text-secondary`; CardHint SVGs `text-neutral-600` → `text-faint`; leave `bg-neutral-800 text-white border border-neutral-700/50` open state (opacity variant on border — leave whole class group as-is per convention) |
| `src/components/workspace/ImportModal.tsx` | `bg-black/80` → `bg-surface-backdrop`; `bg-neutral-900 border border-neutral-800` → `bg-surface-base border border-line-subtle`; `text-white` → `text-primary` (heading); `text-neutral-400` → `text-tertiary` (body, cancel); `bg-neutral-800 hover:bg-neutral-700` → `bg-surface-raised hover:bg-surface-overlay` (Add button); `text-neutral-500` → `text-muted` (subtext) |

8 files reviewed, 8 modified. No new components.

### Testing Checklist

**Visual regression — workspace**
- [ ] Workspace root background matches sidebar (both surface-base)
- [ ] "Initializing workspace..." text is visible (text-muted)
- [ ] Group-by-type headers readable (text-muted, uppercase)
- [ ] Confirm dialog (format → Commander with sideboard): heading text-primary, body text-tertiary, panel has correct border
- [ ] List view hover tooltip border visible (border-line-default)

**WorkspaceToolbar**
- [ ] Deck name input: text readable (text-primary), placeholder visible (text-muted), hover border visible (border-line-default)
- [ ] Freeform format badge: text-muted, bg-neutral-500/10 (intentional opacity)
- [ ] Stats row text-tertiary; value display text-heading; SB count text-faint; M+S labels text-muted
- [ ] Simulator button: correct surface, text-tertiary hover-to-primary
- [ ] Main/Side pill: surface-base container, active = blue, inactive = text-muted hover-secondary; disabled Side = text-neutral-700 (flagged, intentional)
- [ ] Sort/Group/View container: surface-base, border-line-subtle
- [ ] Sort direction tooltip visible (bg-surface-raised border-line-default text-heading)
- [ ] Group, Grid, List active state: bg-surface-raised text-primary; inactive: text-muted hover-secondary
- [ ] Dividers between controls visible (bg-surface-raised)

**VisualCard**
- [ ] Qty pill (neutral state): bg-surface-base text-tertiary
- [ ] × remove button: bg-surface-base text-tertiary, hover red
- [ ] Slide-up overlay qty: text-primary (neutral state), text-red-400 (over limit), text-green-400 (owned)
- [ ] Qty edit input: bg-surface-raised, text-primary
- [ ] Owned edit input: bg-surface-raised, text-green-400
- [ ] Qty/owned +/− buttons: text-secondary, hover bg-neutral-600 (intentional flagged), hover text-primary
- [ ] Search mode overlay: card name text-primary; type/price text-tertiary

**ListCardTable**
- [ ] Table container border-line-subtle visible
- [ ] Thead: bg-surface-base, text-muted, border-line-subtle
- [ ] Qty/owned +/− buttons: bg-surface-raised text-tertiary, hover bg-surface-overlay text-primary
- [ ] Tooltip on over-copy-limit qty: bg-surface-raised border-line-default text-heading
- [ ] Qty inputs: bg-surface-raised
- [ ] Qty span hover: hover:bg-surface-raised rounded
- [ ] Type column: text-muted
- [ ] // separator in double-faced cards: text-faint
- [ ] Crown icon: text-faint (outline), text-yellow-400 (filled)
- [ ] Remove × icon: text-faint hover-red (wait — actually text-neutral-700, flagged)
- [ ] Name text: text-neutral-100 (qty > 0, not owned — flagged, intentional), text-green-400 (owned), text-muted (qty=0)
- [ ] Price text: text-tertiary (not owned), text-green-500/50 (owned)

**SearchWorkspace**
- [ ] Toolbar area: bg-surface-base border-line-subtle
- [ ] Sort select: bg-surface-base text-tertiary, options readable
- [ ] Dividers: bg-surface-raised (should look subtle)
- [ ] Active grid view button: bg-surface-raised text-primary
- [ ] Spinner: border-line-default with border-t-tertiary sweep
- [ ] Set match pill: bg-surface-raised border-line-default text-secondary
- [ ] Toast notification: bg-surface-raised border-line-default text-heading
- [ ] Empty state / no-results text: text-muted
- [ ] Results count: "N results" text-muted; number text-tertiary

**SearchBar**
- [ ] Search bar container: bg-neutral-950 (intentional darker than surface-base), border-line-subtle
- [ ] Freeform filter badge (active): bg-surface-raised border-neutral-600 (flagged) text-secondary
- [ ] Inactive filter badge: bg-surface-raised border-line-default text-muted
- [ ] NLP token chips: bg-surface-raised border-line-default text-secondary; label: text-muted
- [ ] Text input: text-heading; placeholder: text-faint
- [ ] Clear button: text-muted, hover text-secondary bg-surface-overlay
- [ ] Autocomplete dropdown: bg-surface-base border-line-default
- [ ] Autocomplete items: text-secondary, hover bg-surface-raised text-primary
- [ ] Parsed section divider: border-line-subtle
- [ ] Parsed token chips: bg-surface-raised border-line-default text-secondary

**ImportModal**
- [ ] Backdrop: bg-surface-backdrop (rgba(0,0,0,0.8))
- [ ] Panel: bg-surface-base border-line-subtle
- [ ] Heading: text-primary; body: text-tertiary
- [ ] "Add to Current" button: bg-surface-raised hover-surface-overlay text-primary; subtext text-muted
- [ ] Cancel button: text-tertiary hover-primary

**Cross-cutting**
- [ ] No visual regressions on accent colors (blue buttons, yellow commander, red warnings, green owned)
- [ ] Sidebar and workspace background continuity — no visible seam
- [ ] Dark theme consistent across all views (grid, list, modal, search)
- [ ] No new borders appearing where there weren't borders before (Tailwind v4 border-width injection check)

### Flagged Classes (carried forward from Prompts 1–2, plus new in Prompt 3)

| Class | Location & role |
|---|---|
| `text-neutral-700` | SidebarDecksTab, SampleHandModal, WorkspaceToolbar, VisualCard — disabled/grayed states. Darker than `text-faint` — no direct token match |
| `text-neutral-100` | ListCardTable L203 — flagged; no token lighter than `text-primary` (#ffffff) needed yet |
| `border-neutral-600` | CategoryChips hover, SearchBar active freeform badge. Mid-tone gap between `border-line-default` (#404040) and unmapped `neutral-600` |
| `border-neutral-500` | Sidebar sort-direction hover. No token mapped for `neutral-500` border |
| `hover:bg-neutral-600` | VisualCard qty buttons. No token for `neutral-600` hover surface |
| `bg-neutral-950` | SearchBar container background. Darker than `surface-base` (#0a0a0a) — intentional depth |
| `focus-within:border-neutral-600` | SearchBar focus ring. No token for mid-tone focus ring |

---

## v1.10.0 — Design Tokens: Layout Components (Prompt 2 of 3)
Status: APPROVED ✅

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
