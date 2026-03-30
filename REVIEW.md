# REVIEW.md — MTG Deck Builder Session Journal

---

## v1.19.0 — Search List View Toggle
Status: APPROVED ✅

### Plan Review
| File | Changes |
|------|---------|
| `src/components/workspace/SearchListTable.tsx` | **New component.** Browse-only table for search results: color-tinted rows (`getRowTint`/`getRowHoverTint`), hover-reveal + add button, in-deck green dot + dimmed text, mana symbols (`renderManaSymbols`), cursor-follow thumbnail, `CardModal` on row click |
| `src/components/workspace/SearchWorkspace.tsx` | Add `viewMode` state (`"grid"\|"list"`) with `mtg-search-view-mode` localStorage key; read `showThumbnail` from `useDeckManager()`; activate list view button; disable `TileSizeSlider` in list mode; conditionally render `SearchListTable` vs grid |

### QA Checklist

**View toggle**
- [x] List button in toolbar is enabled and clickable
- [x] Clicking list button switches to list view; grid button switches back to grid view
- [x] Active button has `bg-surface-raised` style; inactive is tertiary text, no background
- [x] View mode persists after page refresh (`mtg-search-view-mode` in localStorage)

**TileSizeSlider in list mode**
- [x] Slider is visually dimmed (`opacity-30`) when list view is active
- [x] Slider is non-interactive in list mode (pointer-events-none)
- [x] Slider re-enables when switching back to grid view

**SearchListTable — layout**
- [x] Table renders inside `bg-surface-base border border-line-subtle rounded-lg shadow-sm` container with 10px margin
- [x] Columns in order: + (w-10), Name (flex fill), Type (w-48), Mana (w-24), Price (w-20, right-aligned)
- [x] Header row: empty | Name | Type | Mana | Price

**SearchListTable — rows**
- [x] Row background is color-tinted by card color (white, blue, black, red, green, multi, land, colorless)
- [x] Row hover brightens the tint
- [x] Clicking a row opens CardModal with `context='search'`
- [x] CardModal onNext/onPrev navigates through results array

**+ Add button**
- [x] Button is hidden by default, appears on row hover
- [x] Clicking + adds card to active deck, shows toast
- [x] + button click does not open CardModal (stopPropagation)
- [x] Works for cards already in deck (adds another copy)
- [x] Hover on + button shows blue style

**In-deck row appearance**
- [x] Green dot appears before name for cards already in active deck
- [x] Card name is `text-content-tertiary` (dimmed) for in-deck cards
- [x] Type text is `text-content-faint` for in-deck cards
- [x] Mana symbols are `opacity-40` for in-deck cards
- [x] Price is `text-content-faint` for in-deck cards
- [x] No checkmark — green dot only

**Cursor-follow thumbnail**
- [x] Thumbnail appears on row hover when "Show card thumbnail on hover" setting is ON
- [x] Thumbnail follows cursor
- [x] Thumbnail does not appear when setting is OFF

**Sort in list view**
- [x] Changing sort order (name, price, mv, color) re-fetches and results update in list view
- [x] Sort direction toggle (asc/desc) also works in list view

**Edge cases**
- [x] DFC cards show front face mana cost + `//` separator in Mana column
- [x] Land cards show empty mana cell
- [x] Cards with null price show "N/A"
- [x] Zero results / loading / empty state messages still render in list mode

### QA Notes
- Green dot moved to dedicated "Own" column so name text is always left-aligned
- Added "Add to deck" tooltip to + button

### Session Summary
Added list view toggle to the search panel. `SearchListTable` is a new component rendering Scryfall results as a color-tinted table with hover-reveal + add button, in-deck "Own" indicator column, mana symbols, and cursor-follow thumbnail. `SearchWorkspace` gains a `viewMode` state persisted to `mtg-search-view-mode` localStorage, activates the list toggle button, and disables `TileSizeSlider` in list mode. Sort works unchanged — results arrive pre-sorted from Scryfall before rendering.

---

## How This File Works
This file is the live session journal shared between Phi, Claude Chat, and Claude Code.
- **Claude Code writes:** Plan review table, testing checklist, session summary — committed only at session end
- **Phi writes:** Test results (checking boxes), inline comments on failures, emerging issues during QA
- **Claude Chat reads:** Verifies plan review, triages failures, incorporates findings into next Claude Code prompt
- Never committed to git mid-session — only in the final commit alongside CLAUDE.md and CHANGELOG.md
